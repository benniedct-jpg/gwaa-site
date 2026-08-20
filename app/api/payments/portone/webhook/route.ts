import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db, newTicketToken, type Booking } from '@/lib/bookingsDb';
import { sendTicketEmail } from '@/lib/email';

// PortOne 결제 웹훅 — 브라우저 복귀와 무관하게 서버가 결제 승인을 직접 받아 예약 확정 + 입장권 발송.
// (모바일/인앱브라우저에서 결제 후 복귀가 끊겨도 이 웹훅으로 자동 확정됨)
// 검증: 웹훅 바디의 paymentId로 PortOne 단건조회 → 실제 PAID + 금액 대조(독립 검증). paymentId = order_id의 영숫자.
export async function POST(req: NextRequest) {
  // 웹훅은 항상 200으로 ack (재시도 폭주 방지). 실제 처리는 내부에서.
  if (!supaConfigured()) return NextResponse.json({ ok: false, reason: 'supabase' });

  let paymentId: string | undefined;
  try {
    const body = await req.json() as Record<string, unknown>;
    const data = (body?.data ?? {}) as Record<string, unknown>;
    paymentId = (data.paymentId as string) || (body.paymentId as string) || (body.payment_id as string);
  } catch {
    return NextResponse.json({ ok: false, reason: 'parse' });
  }
  if (!paymentId) return NextResponse.json({ ok: false, reason: 'no-paymentId' });

  const secret = process.env.PORTONE_API_SECRET;
  if (!secret) return NextResponse.json({ ok: false, reason: 'no-secret' });

  // 실제 승인 검증 (독립 조회)
  const res = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `PortOne ${secret}` },
  });
  const pay = await res.json().catch(() => ({}));
  if (!res.ok || pay?.status !== 'PAID') return NextResponse.json({ ok: true, skipped: `status=${pay?.status}` });

  // paymentId(영숫자) == 예약 order_id에서 영숫자만 남긴 값 → 해당 미확정 예약 찾기
  const { data: rows, error } = await db().from('bookings').select('*').eq('status', 'pending');
  if (error) return NextResponse.json({ ok: false, reason: error.message });
  const booking = ((rows as Booking[]) || []).find(
    (b) => ((b.order_id as string) || '').replace(/[^a-zA-Z0-9]/g, '') === paymentId,
  );
  if (!booking) return NextResponse.json({ ok: true, skipped: 'no-matching-booking' }); // 후원/멤버십 등은 여기서 무시

  if (Number(pay?.amount?.total) !== Number(booking.amount)) {
    return NextResponse.json({ ok: true, skipped: 'amount-mismatch' });
  }

  const token = (booking.ticket_token as string) || newTicketToken();
  const { error: upErr } = await db().from('bookings')
    .update({ status: 'paid', payment_key: paymentId, paid_at: new Date().toISOString(), ticket_token: token })
    .eq('order_id', booking.order_id);
  if (upErr) return NextResponse.json({ ok: false, reason: upErr.message });

  try { await sendTicketEmail({ ...booking, ticket_token: token } as Booking, token); } catch { /* 발송 실패해도 확정은 유지 */ }
  return NextResponse.json({ ok: true, confirmed: booking.order_id });
}

// PortOne 웹훅 등록 시 검증용 GET (일부 콘솔이 GET 헬스체크)
export async function GET() {
  return NextResponse.json({ ok: true });
}
