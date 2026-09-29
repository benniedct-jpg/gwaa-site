import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db, type Booking } from '@/lib/bookingsDb';
import { CLASS_BY_KEY, classEntry, entryLabel, entryCount } from '@/lib/classesCatalog';

// 입장객 셀프: 티켓 페이지에서 웰니스 클래스 카드 추가결제 → 예약에 반영
// body: { token, keys: string[], paymentId }
export async function POST(req: NextRequest) {
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const { token, keys, paymentId } = await req.json() as { token?: string; keys?: string[]; paymentId?: string };
  if (!token || !Array.isArray(keys) || !keys.length || !paymentId) return NextResponse.json({ error: '요청 정보가 누락되었습니다.' }, { status: 400 });

  const slots = keys.map((k) => CLASS_BY_KEY[k]).filter(Boolean);
  if (slots.length !== keys.length) return NextResponse.json({ error: '잘못된 클래스 선택입니다.' }, { status: 400 });

  const { data: row, error: findErr } = await db().from('bookings').select('*').eq('ticket_token', token).single();
  if (findErr || !row) return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
  const booking = row as Booking & { class_payment_ids?: string[] };

  // 중복 적용 방지 (같은 결제 재전송)
  const usedIds = Array.isArray(booking.class_payment_ids) ? booking.class_payment_ids : [];
  if (usedIds.includes(paymentId)) return NextResponse.json({ ok: true, already: true });

  // 결제 검증 (포트원 단건조회 · 승인·금액 대조)
  const secret = process.env.PORTONE_API_SECRET;
  if (!secret) return NextResponse.json({ error: '결제 연동 준비 중입니다.' }, { status: 503 });
  const res = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, { headers: { Authorization: `PortOne ${secret}` } });
  const pay = await res.json();
  if (!res.ok || pay?.status !== 'PAID') return NextResponse.json({ error: `결제가 확인되지 않았습니다. (상태: ${pay?.status || res.status})` }, { status: 402 });
  const expected = slots.reduce((s, c) => s + c.price, 0);
  if (Number(pay?.amount?.total) !== expected) return NextResponse.json({ error: '결제 금액이 일치하지 않습니다.' }, { status: 400 });

  // 정원·타임 재확인 (event 3 전체 집계)
  const { data: all } = await db().from('bookings').select('tshirt_sizes,status').eq('event_id', 3).neq('status', 'cancelled');
  const sold: Record<string, number> = {};
  for (const r of (all as Booking[] ?? [])) {
    const arr = Array.isArray(r.tshirt_sizes) ? (r.tshirt_sizes as string[]) : [];
    for (const e of arr) { const l = entryLabel(e); sold[l] = (sold[l] || 0) + entryCount(e); }
  }
  const now = Date.now();
  for (const s of slots) {
    if (s.startsAt && new Date(s.startsAt).getTime() <= now) return NextResponse.json({ error: `${s.name} ${s.slot} 은 이미 시작된 타임입니다. (환불 필요 시 033-813-0333)` }, { status: 409 });
    if (s.cap != null && (sold[s.label] || 0) >= s.cap) return NextResponse.json({ error: `${s.name} ${s.slot} 정원(${s.cap}명) 마감되었습니다. (환불 필요 시 033-813-0333)` }, { status: 409 });
  }

  const existing = Array.isArray(booking.tshirt_sizes) ? (booking.tshirt_sizes as string[]) : [];
  const added = slots.map((s) => classEntry(s.label, 1));
  const { error: upErr } = await db().from('bookings')
    .update({ tshirt_sizes: [...existing, ...added], amount: (Number(booking.amount) || 0) + expected, class_payment_ids: [...usedIds, paymentId] })
    .eq('id', booking.id);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, added, total: expected });
}
