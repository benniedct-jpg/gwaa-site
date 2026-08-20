import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db } from '@/lib/bookingsDb';
import { registerOrExtendMember } from '@/lib/membership/register';

const MONTHLY = 10000;

// 정기결제: 발급된 빌링키로 첫 달 회비를 즉시 결제하고 회원 등록(빌링키 저장)
export async function POST(req: NextRequest) {
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });

  const { billingKey, name, phone, email, agreePrivacy } = await req.json() as {
    billingKey?: string; name?: string; phone?: string; email?: string; agreePrivacy?: boolean;
  };
  if (!billingKey) return NextResponse.json({ error: '빌링키가 없습니다.' }, { status: 400 });
  if (!name || !phone || !email) return NextResponse.json({ error: '납부자 정보를 모두 입력해 주세요.' }, { status: 400 });
  if (!agreePrivacy) return NextResponse.json({ error: '개인정보 수집·이용에 동의해 주세요.' }, { status: 400 });

  const secret = process.env.PORTONE_API_SECRET;
  if (!secret) return NextResponse.json({ error: '결제 연동 준비 중입니다. (PORTONE_API_SECRET 미설정)' }, { status: 503 });

  // PortOne V2 paymentId는 영문·숫자만 허용(특수문자 불가)
  const paymentId = `gwaamembership${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

  // 빌링키로 첫 달 결제
  const res = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}/billing-key`, {
    method: 'POST',
    headers: { Authorization: `PortOne ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      billingKey,
      orderName: 'GWAA 멤버십 월 회비',
      amount: { total: MONTHLY },
      currency: 'KRW',
      customer: { name, phoneNumber: phone, email },
    }),
  });
  const pay = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json({ error: pay?.message || '정기결제 승인 실패' }, { status: 402 });

  // 결제 기록 + 회원 등록(빌링키 저장)
  await db().from('payments').insert({
    payment_id: paymentId, kind: 'membership', amount: MONTHLY,
    name, phone, email, status: 'paid', agree_privacy: true, paid_at: new Date().toISOString(),
  });
  const memberRegistered = await registerOrExtendMember({ name, phone, email, billingKey });

  return NextResponse.json({ ok: true, memberRegistered });
}
