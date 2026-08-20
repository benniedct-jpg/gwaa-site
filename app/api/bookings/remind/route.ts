import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db, type Booking } from '@/lib/bookingsDb';
import { verifyAdmin } from '@/lib/adminAuth';
import { sendReminderEmail } from '@/lib/email';

function isAdmin(req: NextRequest) {
  return verifyAdmin(req.cookies.get('gwaa_admin_auth')?.value);
}

const DEFAULT_DEADLINE = '8월 8일(토)';

// ── POST: 미입금 예약자에게 입금 안내 메일 발송 (관리자 전용) ──
// body: { id, deadline?, testTo? }
//  - testTo 지정 시: 상태 무관, 해당 주소로 미리보기 발송(테스트)
//  - testTo 없을 시: status==='pending'인 예약에만 실제 발송(입금완료·취소 건 보호)
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });

  const body = await req.json() as { id?: number; deadline?: string; testTo?: string };
  const id = body.id;
  if (!id) return NextResponse.json({ error: '예약 id가 필요합니다.' }, { status: 400 });

  const { data, error } = await db().from('bookings').select('*').eq('id', id).single();
  if (error || !data) return NextResponse.json({ error: error?.message || '예약을 찾을 수 없습니다.' }, { status: 404 });
  const booking = data as Booking;

  const isTest = !!body.testTo;
  // 안전장치: 실제 발송은 미입금(pending) 건에만 — 입금완료·취소 건에는 안내 안 나감
  if (!isTest && booking.status !== 'pending') {
    return NextResponse.json({ error: `대상 아님 (status=${booking.status}) — 미입금 건만 발송됩니다.` }, { status: 409 });
  }

  const deadline = body.deadline || DEFAULT_DEADLINE;
  const result = await sendReminderEmail(booking, deadline, body.testTo, isTest);
  return NextResponse.json({ id, to: body.testTo || booking.email, status: booking.status, ...result });
}
