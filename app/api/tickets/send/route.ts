import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db, newTicketToken, type Booking } from '@/lib/bookingsDb';
import { verifyAdmin } from '@/lib/adminAuth';
import { sendTicketEmail } from '@/lib/email';

// 관리자: 입금확정된 예약에 입장권(QR) 이메일 발송
export async function POST(req: NextRequest) {
  if (!verifyAdmin(req.cookies.get('gwaa_admin_auth')?.value)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });

  const { id } = await req.json() as { id?: number };
  if (!id) return NextResponse.json({ error: '예약 id가 필요합니다.' }, { status: 400 });

  const { data, error } = await db().from('bookings').select('*').eq('id', id).single();
  if (error || !data) return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
  const booking = data as Booking;

  if (booking.status !== 'paid') {
    return NextResponse.json({ error: '입금확정(결제완료)된 예약만 입장권을 보낼 수 있습니다.' }, { status: 400 });
  }
  if (!booking.email) {
    return NextResponse.json({ error: '예약자 이메일이 없습니다.' }, { status: 400 });
  }

  // 토큰이 없으면 발급 후 저장
  let token = booking.ticket_token as string | undefined;
  if (!token) {
    token = newTicketToken();
    await db().from('bookings').update({ ticket_token: token }).eq('id', id);
  }

  const result = await sendTicketEmail({ ...booking, ticket_token: token }, token);
  if (!result.sent) {
    return NextResponse.json({ ok: false, error: `발송 실패: ${result.reason || '알 수 없음'}` }, { status: 502 });
  }
  return NextResponse.json({ ok: true, to: booking.email });
}
