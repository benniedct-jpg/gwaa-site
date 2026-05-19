/**
 * serverDB — Supabase 기반 공유 데이터베이스
 * 관리자 API 라우트에서만 사용 (서버 사이드)
 */
import { createClient } from '@supabase/supabase-js';

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
  | 'page_hashtags';

export async function dbGetAll(table: TableName) {
  const db = getDB();
  const { data, error } = await db.from(table).select('*').order('order', { ascending: true });
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
