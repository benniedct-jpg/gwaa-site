import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db, newTicketToken, type Booking } from '@/lib/bookingsDb';
import { sendTicketEmail } from '@/lib/email';

// 예약 카드결제 확정: 포트원 단건조회로 승인·금액 대조 → 예약 paid 처리 + 입장권 발송
export async function POST(req: NextRequest) {
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });

  const { order_id, paymentId } = await req.json() as { order_id?: string; paymentId?: string };
  if (!order_id || !paymentId) return NextResponse.json({ error: '결제 정보가 누락되었습니다.' }, { status: 400 });

  // paymentId 는 order_id 에서 영숫자만 남긴 값이어야 함(위·변조 방지: 임의 결제로 남의 예약 확정 차단)
  const expectedPid = order_id.replace(/[^a-zA-Z0-9]/g, '');
  if (paymentId !== expectedPid) return NextResponse.json({ error: '결제 식별자가 올바르지 않습니다.' }, { status: 400 });

  const { data: row, error: findErr } = await db().from('bookings').select('*').eq('order_id', order_id).single();
  if (findErr || !row) return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
  const booking = row as Booking;
  if (booking.status === 'paid') return NextResponse.json({ ok: true, already: true });

  const secret = process.env.PORTONE_API_SECRET;
  if (!secret) return NextResponse.json({ error: '결제 연동 준비 중입니다. (PORTONE_API_SECRET 미설정)' }, { status: 503 });

  // 포트원 결제 단건 조회 → 실제 승인·금액 검증
  const res = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `PortOne ${secret}` },
  });
  const pay = await res.json();
  if (!res.ok) return NextResponse.json({ error: pay?.message || '결제 조회 실패' }, { status: 402 });
  if (pay?.status !== 'PAID') return NextResponse.json({ error: `결제가 완료되지 않았습니다. (상태: ${pay?.status})` }, { status: 402 });
  if (Number(pay?.amount?.total) !== Number(booking.amount)) {
    return NextResponse.json({ error: '결제 금액이 일치하지 않습니다.' }, { status: 400 });
  }

  const token = (booking.ticket_token as string | undefined) || newTicketToken();
  const { error: upErr } = await db().from('bookings')
    .update({ status: 'paid', payment_key: paymentId, paid_at: new Date().toISOString(), ticket_token: token })
    .eq('order_id', order_id);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  let ticketSent = false;
  try {
    const r = await sendTicketEmail({ ...booking, ticket_token: token } as Booking, token);
    ticketSent = !!r.sent;
  } catch { /* 발송 실패해도 결제는 확정됨 — 관리자 재발송 가능 */ }

  return NextResponse.json({ ok: true, ticketSent });
}
