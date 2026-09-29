import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db, newOrderId, newTicketToken, type Booking } from '@/lib/bookingsDb';
import { CLASS_BY_KEY, classEntry, entryLabel, entryCount } from '@/lib/classesCatalog';

// 현장 QR: 입장권 없이 웰니스 클래스만 카드 결제 → 클래스 신청 기록 생성
// body: { name, phone, keys: string[], paymentId }
export async function POST(req: NextRequest) {
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const { name, phone, keys, paymentId } = await req.json() as { name?: string; phone?: string; keys?: string[]; paymentId?: string };
  if (!name?.trim() || !phone?.trim() || !Array.isArray(keys) || !keys.length || !paymentId) return NextResponse.json({ error: '이름·연락처·클래스·결제정보를 확인해 주세요.' }, { status: 400 });

  const slots = keys.map((k) => CLASS_BY_KEY[k]).filter(Boolean);
  if (slots.length !== keys.length) return NextResponse.json({ error: '잘못된 클래스 선택입니다.' }, { status: 400 });

  // 중복 적용 방지: 같은 paymentId 로 이미 만든 기록 있으면 그대로 반환
  const dup = await db().from('bookings').select('id,ticket_token').contains('class_payment_ids', [paymentId]).maybeSingle();
  if (dup.data) return NextResponse.json({ ok: true, already: true, token: (dup.data as { ticket_token?: string }).ticket_token });

  const secret = process.env.PORTONE_API_SECRET;
  if (!secret) return NextResponse.json({ error: '결제 연동 준비 중입니다.' }, { status: 503 });
  const res = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, { headers: { Authorization: `PortOne ${secret}` } });
  const pay = await res.json();
  if (!res.ok || pay?.status !== 'PAID') return NextResponse.json({ error: `결제가 확인되지 않았습니다. (상태: ${pay?.status || res.status})` }, { status: 402 });
  const expected = slots.reduce((s, c) => s + c.price, 0);
  if (Number(pay?.amount?.total) !== expected) return NextResponse.json({ error: '결제 금액이 일치하지 않습니다.' }, { status: 400 });

  // 정원·타임 재확인
  const { data: all } = await db().from('bookings').select('tshirt_sizes,status').eq('event_id', 3).neq('status', 'cancelled');
  const soldMap: Record<string, number> = {};
  for (const r of (all as Booking[] ?? [])) {
    const arr = Array.isArray(r.tshirt_sizes) ? (r.tshirt_sizes as string[]) : [];
    for (const e of arr) { const l = entryLabel(e); soldMap[l] = (soldMap[l] || 0) + entryCount(e); }
  }
  const now = Date.now();
  for (const s of slots) {
    if (s.startsAt && new Date(s.startsAt).getTime() <= now) return NextResponse.json({ error: `${s.name} ${s.slot} 은 이미 시작된 타임입니다.` }, { status: 409 });
    if (s.cap != null && (soldMap[s.label] || 0) >= s.cap) return NextResponse.json({ error: `${s.name} ${s.slot} 정원(${s.cap}명) 마감되었습니다.` }, { status: 409 });
  }

  const token = newTicketToken();
  const rec = {
    event_id: 3, booking_type: 'class', booking_label: '웰니스 클래스(현장구매)', date_label: '9/4(금) ~ 9/6(일)',
    name: name.trim(), phone: phone.trim(), email: '', headcount: 1,
    tshirt_sizes: slots.map((s) => classEntry(s.label, 1)), amount: expected,
    status: 'paid', order_id: newOrderId(3), ticket_token: token, class_payment_ids: [paymentId],
    request: '현장 QR 웰니스 클래스 구매', created_at: new Date().toISOString(),
  };
  const ins = await db().from('bookings').insert(rec).select('id,ticket_token').single();
  if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
  return NextResponse.json({ ok: true, token, classes: slots.map((s) => s.label), total: expected });
}
