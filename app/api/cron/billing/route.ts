import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db } from '@/lib/bookingsDb';
import { nextExpiry } from '@/lib/membership/register';

const MONTHLY = 10000;

// 매월 자동청구: 만료일이 도래한(빌링키 보유) 활성 회원에게 회비를 정기결제하고 만료일 연장.
// Vercel Cron이 CRON_SECRET을 Authorization: Bearer 로 보냄. 수동 호출은 ?key= 로도 허용.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const bearer = req.headers.get('authorization');
  const keyParam = req.nextUrl.searchParams.get('key');
  const authorized = !!secret && (bearer === `Bearer ${secret}` || keyParam === secret);
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const pSecret = process.env.PORTONE_API_SECRET;
  if (!pSecret) return NextResponse.json({ ok: true, skipped: 'PORTONE_API_SECRET 미설정' });

  const today = new Date().toISOString().slice(0, 10);
  const { data: due, error } = await db().from('members').select('*')
    .eq('status', 'active').not('billing_key', 'is', null).lte('expires_at', today);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const members = (due as Record<string, unknown>[]) || [];
  let charged = 0, failed = 0;

  for (const m of members) {
    // PortOne V2 paymentId는 영문·숫자만 허용 → m.id의 특수문자(UUID 하이픈 등) 제거
    const paymentId = `gwaamembership${Date.now()}${String(m.id).replace(/[^a-zA-Z0-9]/g, '')}`;
    try {
      const res = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}/billing-key`, {
        method: 'POST',
        headers: { Authorization: `PortOne ${pSecret}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billingKey: m.billing_key,
          orderName: 'GWAA 멤버십 월 회비(정기)',
          amount: { total: MONTHLY },
          currency: 'KRW',
          customer: { name: m.name, phoneNumber: m.phone, email: m.email },
        }),
      });
      if (res.ok) {
        await db().from('payments').insert({
          payment_id: paymentId, kind: 'membership', amount: MONTHLY,
          name: m.name as string, phone: m.phone as string, email: m.email as string,
          status: 'paid', agree_privacy: true, paid_at: new Date().toISOString(),
        });
        await db().from('members').update({ expires_at: nextExpiry(m.expires_at as string) }).eq('id', m.id);
        charged++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ ok: true, checked: members.length, charged, failed });
}
