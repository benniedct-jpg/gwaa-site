import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db, type Booking } from '@/lib/bookingsDb';
import { sendReminderEmail } from '@/lib/email';

// 공개(고객용): 카드 결제 실패·취소 등으로 미입금(pending) 상태가 된 예약자에게
// '입금/결제 안내' 메일을 자동 발송한다. 예약 위젯(BookingFlow)이 결제 실패 시 호출.
// - order_id 로만 조회(추측 어려운 무작위 값), 대상은 status==='pending' · 이메일 보유 건에 한정.
// - 응답에 개인정보를 포함하지 않는다(오남용·정보노출 방지). 관리자 수동 발송은 /api/bookings/remind.
export async function POST(req: NextRequest) {
  if (!supaConfigured()) return NextResponse.json({ ok: false }, { status: 200 });
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const orderId = String((body as Record<string, unknown>).order_id || '');
  if (!orderId) return NextResponse.json({ ok: false }, { status: 400 });

  const { data: booking } = await db().from('bookings').select('*').eq('order_id', orderId).single();
  if (!booking || booking.status !== 'pending' || !booking.email) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try { await sendReminderEmail(booking as Booking, ''); } catch { /* 메일 실패해도 조용히 무시 */ }
  return NextResponse.json({ ok: true });
}
