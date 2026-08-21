import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db, activeBookings, isSiteFree, newOrderId, newTicketToken, type Booking } from '@/lib/bookingsDb';
import { verifyAdmin } from '@/lib/adminAuth';
import { sendTicketEmail } from '@/lib/email';

function isAdmin(req: NextRequest) {
  return verifyAdmin(req.cookies.get('gwaa_admin_auth')?.value);
}

// 제출 허용 필드 (결제·티켓 관련 컬럼은 서버가 채움)
const ALLOWED = [
  'event_id', 'booking_type', 'booking_label', 'date_label', 'booking_dates',
  'zone', 'site', 'headcount', 'tshirt_sizes', 'name', 'phone', 'email',
  'pet_name', 'pet_breed', 'pet_age', 'pet_vaccine', 'request', 'amount',
  'agree_privacy', 'agree_portrait', 'pay_method',
];
function pick(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const k of ALLOWED) if (k in body) out[k] = body[k];
  return out;
}

// ── GET: 관리자=전체 / 공개=잔여석(site+dates만) ──
export async function GET(req: NextRequest) {
  if (!supaConfigured()) return NextResponse.json([], { status: 200 });
  const eventId = Number(req.nextUrl.searchParams.get('event') ?? '0');

  // 예약 위젯의 잔여석 조회(mode=availability)는 관리자 로그인 상태여도 '활성 예약만' 반환해야 함
  // (관리자 전체목록은 취소분까지 포함 → 예약 위젯이 취소된 자리를 예약됨으로 오인하는 것 방지)
  const availabilityOnly = req.nextUrl.searchParams.get('mode') === 'availability';

  if (isAdmin(req) && !availabilityOnly) {
    let q = db().from('bookings').select('*').order('id', { ascending: false });
    if (eventId) q = q.eq('event_id', eventId);
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  try {
    const rows = await activeBookings(eventId);
    return NextResponse.json(rows.map((r) => ({ site: r.site, booking_dates: r.booking_dates ?? [] })), { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── POST: 예약 접수(결제 대기 pending 생성) ──
export async function POST(req: NextRequest) {
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const body = pick(await req.json() as Record<string, unknown>);
  if (!body.name || !body.phone || !body.email) {
    return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
  }
  const eventId = Number(body.event_id) || 0;
  const site = (body.site as string) || '';
  const dates = (body.booking_dates as string[]) || [];
  const needsSite = body.booking_type !== 'day' && !!site;

  if (needsSite) {
    const free = await isSiteFree(eventId, site, dates);
    if (!free) return NextResponse.json({ error: 'SITE_TAKEN' }, { status: 409 });
  }

  const orderId = newOrderId(eventId);
  const ticketToken = newTicketToken(); // 접수 즉시 발급 → 고객 '내 예약 확인' 링크. 입금확정(paid) 시 QR 입장권으로 유효화
  const record = {
    ...body,
    status: 'pending',
    order_id: orderId,
    ticket_token: ticketToken,
    created_at: new Date().toISOString(),
  };
  const { data, error } = await db().from('bookings').insert(record).select('id, order_id, amount, ticket_token').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data?.id, order_id: data?.order_id, amount: data?.amount, ticket_token: data?.ticket_token });
}

// ── PATCH: 예약 상태 변경 (관리자 전용) — 취소(자리 해제) / 입금확정 ──
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const body = await req.json() as { id?: number; action?: string };
  const id = Number(body.id) || 0;
  if (!id) return NextResponse.json({ error: '예약 id가 필요합니다.' }, { status: 400 });
  // cancel → cancelled(자리 즉시 해제) / confirm → paid(입금 확정, 자리 영구 점유) / pending → 대기 복원
  const map: Record<string, string> = { cancel: 'cancelled', confirm: 'paid', pending: 'pending' };
  const status = map[body.action || ''];
  if (!status) return NextResponse.json({ error: '허용되지 않은 작업입니다.' }, { status: 400 });
  const { data, error } = await db().from('bookings').update({ status }).eq('id', id).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 입금확정 시 입장권(QR) 이메일 자동 발송 — 확정 자체는 성공 처리하고, 메일 결과는 mail 필드로 반환(실패해도 확정은 유지)
  let mail: { sent: boolean; reason?: string } | undefined;
  if (body.action === 'confirm') {
    const booking = data as Booking;
    if (!booking.email) {
      mail = { sent: false, reason: '예약자 이메일 없음' };
    } else {
      let token = booking.ticket_token as string | undefined;
      if (!token) {
        token = newTicketToken();
        await db().from('bookings').update({ ticket_token: token }).eq('id', id);
      }
      try {
        mail = await sendTicketEmail({ ...booking, ticket_token: token }, token);
      } catch (e) {
        mail = { sent: false, reason: e instanceof Error ? e.message : String(e) };
      }
    }
  }
  return NextResponse.json({ ok: true, id: data?.id, status: data?.status, mail });
}
