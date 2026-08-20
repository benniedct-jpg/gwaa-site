import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export type Booking = Record<string, unknown> & {
  id?: number; event_id?: number; booking_type?: string; site?: string;
  booking_dates?: string[]; status?: string; order_id?: string; ticket_token?: string;
  amount?: number; created_at?: string;
};

export function supaConfigured() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!(url && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
export function db(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return createClient(url, key, { auth: { persistSession: false } });
}

// 입금 대기(pending) 자리 홀드 시간 — 이 시간이 지난 미입금 예약은 잔여석 계산에서 제외
// 계좌이체 안내문("예약 후 3일 이내 입금")과 일치시킴. PG(즉시결제) 도입 시 짧게 조정.
const HOLD_MINUTES = 3 * 24 * 60; // 3일
function holdCutoffISO() {
  return new Date(Date.now() - HOLD_MINUTES * 60 * 1000).toISOString();
}

export function newOrderId(eventId: number) {
  return `gwaa-${eventId}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
}
export function newTicketToken() {
  return crypto.randomBytes(16).toString('hex');
}

export function datesOverlap(a: string[] = [], b: string[] = []) {
  return a.some((d) => b.includes(d));
}

// 유효한 점유(결제완료 or 홀드시간 이내 대기) 예약만
export async function activeBookings(eventId: number): Promise<Booking[]> {
  const cutoff = holdCutoffISO();
  const { data, error } = await db()
    .from('bookings')
    .select('site, booking_dates, status, created_at')
    .eq('event_id', eventId)
    .neq('status', 'cancelled');
  if (error) throw new Error(error.message);
  return (data ?? []).filter((r) => r.status === 'paid' || (r.status === 'pending' && (r.created_at ?? '') >= cutoff)) as Booking[];
}

// 특정 자리가 요청 날짜에 예약 가능한지
export async function isSiteFree(eventId: number, site: string, dates: string[]): Promise<boolean> {
  const rows = await activeBookings(eventId);
  return !rows.some((r) => r.site === site && datesOverlap(dates, r.booking_dates ?? []));
}

// 입장권 토큰으로 예약 조회
export async function getByToken(token: string): Promise<Booking | null> {
  const { data, error } = await db().from('bookings').select('*').eq('ticket_token', token).single();
  if (error) return null;
  return data as Booking;
}
