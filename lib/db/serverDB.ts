/**
 * serverDB — Supabase 기반 공유 데이터베이스
 * 관리자 API 라우트에서만 사용 (서버 사이드)
 */
import { createClient } from '@supabase/supabase-js';

const url     = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

function getDB() {
  return createClient(url, svcKey, { auth: { persistSession: false } });
}

export type TableName =
  | 'hero_images'
  | 'activity_cards'
  | 'event_cards'
  | 'archive_events'
  | 'travel_places'
  | 'mateship_partners'
  | 'lookbook_items'
  | 'gallery_items'
  | 'page_hashtags'
  | 'subscribers'
  | 'applications'
  | 'proposals'
  | 'members';

// 테이블별 정렬 컬럼 — 내용 카드류엔 "order" 컬럼이 있으나 page_hashtags엔 없음(page로 정렬),
// 개인정보/예약 성격 테이블(subscribers·applications·proposals·members)도 order 컬럼이 없어 id로 정렬.
const ORDER_COLUMN: Partial<Record<TableName, string>> = {
  hero_images: 'id',
  page_hashtags: 'page',
  subscribers: 'id',
  applications: 'id',
  proposals: 'id',
  members: 'id',
};

export async function dbGetAll(table: TableName) {
  const db = getDB();
  const orderCol = ORDER_COLUMN[table] ?? 'order';
  const { data, error } = await db.from(table).select('*').order(orderCol, { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function dbGet(table: TableName, id: number | string) {
  const db = getDB();
  const col = table === 'page_hashtags' ? 'page' : 'id';
  const { data, error } = await db.from(table).select('*').eq(col, id).single();
  if (error) return null;
  return data;
}

/** 임의 컬럼으로 단건 조회 (예: 회원 전화번호 로그인) */
export async function dbFindBy(table: TableName, col: string, value: string) {
  const db = getDB();
  const { data } = await db.from(table).select('*').eq(col, value).limit(1);
  return data && data[0] ? data[0] : null;
}

export async function dbInsert(table: TableName, row: Record<string, unknown>) {
  const db = getDB();
  const { data, error } = await db.from(table).insert(row).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function dbUpsert(table: TableName, row: Record<string, unknown>) {
  const db = getDB();
  const { data, error } = await db.from(table).upsert(row).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function dbDelete(table: TableName, id: number | string) {
  const db = getDB();
  const col = table === 'page_hashtags' ? 'page' : 'id';
  const { error } = await db.from(table).delete().eq(col, id);
  if (error) throw new Error(error.message);
}
