import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db, getByToken } from '@/lib/bookingsDb';

// 현장 스텝 입장 확인(체크인). 스텝 코드로 보호.
export async function POST(req: NextRequest) {
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const { token, code } = await req.json() as { token?: string; code?: string };
  if (!token) return NextResponse.json({ error: '토큰이 없습니다.' }, { status: 400 });

  const staffCode = process.env.STAFF_CODE || 'petscout2026';
  if (code !== staffCode) return NextResponse.json({ error: '스텝 코드가 올바르지 않습니다.' }, { status: 401 });

  const b = await getByToken(token);
  if (!b) return NextResponse.json({ error: '유효하지 않은 입장권입니다.' }, { status: 404 });
  if (b.status !== 'paid') return NextResponse.json({ error: '결제 완료된 입장권이 아닙니다.' }, { status: 400 });

  const already = !!b.checked_in_at;
  const { error } = await db().from('bookings').update({
    checked_in_at: b.checked_in_at || new Date().toISOString(),
    checkin_count: (Number(b.checkin_count) || 0) + 1,
  }).eq('ticket_token', token);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true, already,
    site: b.site, zone: b.zone, headcount: b.headcount, booking_type: b.booking_type,
    booking_label: b.booking_label, name: b.name, checked_in_at: b.checked_in_at || new Date().toISOString(),
  });
}
