import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db } from '@/lib/bookingsDb';
import { verifyAdmin } from '@/lib/adminAuth';
import { sendSellerSelectEmail, type SellerLite } from '@/lib/email';

export const maxDuration = 300;

const validEmail = (e: unknown) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(e ?? ''));

// 셀러 선정 안내 메일 발송 (관리자 전용)
// body: { mode: 'test' | 'all', testTo?: string, event_id?: number, resend?: boolean }
//  - 대상: status='approved' · 유효 이메일 · (resend 아니면) 미발송(notified_at null)
export async function POST(req: NextRequest) {
  if (!verifyAdmin(req.cookies.get('gwaa_admin_auth')?.value)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });

  const body = await req.json().catch(() => ({})) as { mode?: string; testTo?: string; event_id?: number; resend?: boolean };
  const mode = body.mode || 'test';

  // 미리보기: 참가비/후원물품 샘플을 testTo로 1통씩
  if (mode === 'test') {
    const to = body.testTo && validEmail(body.testTo) ? body.testTo : '';
    if (!to) return NextResponse.json({ error: '테스트 수신 이메일을 입력해 주세요.' }, { status: 400 });
    const feeSample: SellerLite = { brand_name: '샘플셀러(참가비)', rep_name: '홍길동', join_type: 'fee' };
    const sponSample: SellerLite = { brand_name: '샘플셀러(후원물품)', rep_name: '김철수', join_type: 'sponsor', sponsor_items: '수제간식 30개 (2만원 상당)' };
    const r1 = await sendSellerSelectEmail(feeSample, to, true);
    const r2 = await sendSellerSelectEmail(sponSample, to, true);
    return NextResponse.json({ ok: r1.sent && r2.sent, sent: (r1.sent ? 1 : 0) + (r2.sent ? 1 : 0), reason: r1.reason || r2.reason });
  }

  // 실제 발송: 선정(approved) + 유효 이메일
  let q = db().from('event_sellers').select('*').eq('status', 'approved');
  if (body.event_id) q = q.eq('event_id', body.event_id);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const targets = (data as Record<string, unknown>[] ?? []).filter((s) =>
    validEmail(s.email) && (body.resend || !s.notified_at),
  );

  let sent = 0; const fails: string[] = [];
  for (const s of targets) {
    const r = await sendSellerSelectEmail(s as SellerLite, undefined, false);
    if (r.sent) {
      sent++;
      await db().from('event_sellers').update({ notified_at: new Date().toISOString() }).eq('id', s.id as number);
    } else {
      fails.push(`${s.brand_name}: ${r.reason || '실패'}`);
    }
  }
  return NextResponse.json({ ok: true, sent, total: targets.length, fails });
}
