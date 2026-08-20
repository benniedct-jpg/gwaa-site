import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db, newTicketToken, type Booking } from '@/lib/bookingsDb';
import { sendTicketEmail } from '@/lib/email';

// 토스페이먼츠 결제 승인 + 입장권 발급 + 메일 발송
export async function POST(req: NextRequest) {
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const secretKey = process.env.TOSS_SECRET_KEY;
  // 시크릿키 미설정 = 테스트 모드: 토스 승인 단계를 건너뛰고 입장권만 발급(시연용).
  // 실제 운영 전 반드시 TOSS_SECRET_KEY를 설정해 실제 승인이 이뤄지도록 해야 함.
  const testMode = !secretKey;

  const { paymentKey, orderId, amount } = await req.json() as { paymentKey?: string; orderId?: string; amount?: number | string };
  if (!paymentKey || !orderId || amount == null) {
    return NextResponse.json({ error: '결제 정보가 누락되었습니다.' }, { status: 400 });
  }
  const amt = Number(amount);

  // 1) 주문 대조 (금액 위변조 방지)
  const { data: booking, error: findErr } = await db()
    .from('bookings').select('*').eq('order_id', orderId).single();
  if (findErr || !booking) return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
  const b = booking as Booking;

  // 이미 결제·발급된 주문이면 그대로 반환 (재시도 idempotent)
  if (b.status === 'paid' && b.ticket_token) {
    return NextResponse.json({ ok: true, token: b.ticket_token, already: true });
  }
  if (Number(b.amount) !== amt) {
    return NextResponse.json({ error: '결제 금액이 예약 금액과 일치하지 않습니다.' }, { status: 400 });
  }

  // 2) 토스 승인 (테스트 모드에서는 건너뜀)
  if (!testMode) {
    const auth = Buffer.from(secretKey + ':').toString('base64');
    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount: amt }),
    });
    const tossJson = await tossRes.json();
    if (!tossRes.ok) {
      return NextResponse.json({ error: tossJson?.message || '결제 승인 실패', code: tossJson?.code }, { status: 402 });
    }
  } else {
    console.warn('[payments/confirm] TEST MODE — 토스 승인 생략, 입장권 발급. 운영 전 TOSS_SECRET_KEY 설정 필요.');
  }

  // 3) 입장권 발급 + 상태 업데이트
  const token = b.ticket_token || newTicketToken();
  const { error: upErr } = await db().from('bookings').update({
    status: 'paid', payment_key: paymentKey, paid_at: new Date().toISOString(), ticket_token: token,
  }).eq('order_id', orderId);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // 4) 입장권 메일 발송 (실패해도 예약/결제는 유효)
  const updated: Booking = { ...b, status: 'paid', ticket_token: token };
  const mail = await sendTicketEmail(updated, token);

  return NextResponse.json({ ok: true, token, emailSent: mail.sent, emailReason: mail.reason });
}
