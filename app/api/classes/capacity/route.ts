import { NextResponse } from 'next/server';
import { supaConfigured, db, type Booking } from '@/lib/bookingsDb';
import { CLASS_SLOTS, entryLabel, entryCount } from '@/lib/classesCatalog';

export const dynamic = 'force-dynamic';

// 웰니스 클래스 현황 (클래스별 가격 · 신청가능/마감 여부만 · 잔여 수치는 비노출)
export async function GET() {
  const empty = CLASS_SLOTS.map((c) => ({ key: c.key, label: c.label, name: c.name, slot: c.slot, emoji: c.emoji, price: c.price, closed: false, passed: false }));
  if (!supaConfigured()) return NextResponse.json({ classes: empty });

  const { data } = await db().from('bookings').select('tshirt_sizes,status').eq('event_id', 3).neq('status', 'cancelled');
  const sold: Record<string, number> = {};
  for (const r of (data as Booking[] ?? [])) {
    const arr = Array.isArray(r.tshirt_sizes) ? (r.tshirt_sizes as string[]) : [];
    for (const e of arr) { const l = entryLabel(e); sold[l] = (sold[l] || 0) + entryCount(e); }
  }
  const now = Date.now();
  const classes = CLASS_SLOTS.map((c) => {
    const s = sold[c.label] || 0;
    const passed = c.startsAt ? new Date(c.startsAt).getTime() <= now : false;
    const full = c.cap != null && s >= c.cap; // 아로마(cap null)는 정원 없음
    return { key: c.key, label: c.label, name: c.name, slot: c.slot, emoji: c.emoji, price: c.price, closed: passed || full, passed };
  });
  return NextResponse.json({ classes }, { headers: { 'Cache-Control': 'no-store' } });
}
