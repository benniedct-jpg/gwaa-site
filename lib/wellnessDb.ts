/**
 * wellnessDb — 웰니스클럽(원주 2026) 3D 행사장 페이지의 만족도조사·스탬프 저장소
 * 서버(API 라우트) 전용. Supabase 미설정 시 .local-data/ 폴더에 JSON으로 저장(개발용).
 * 테이블 생성 SQL: supabase/wellness_survey.sql
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export const EVENT_SLUGS = ['wonju-2026'] as const;
export type EventSlug = (typeof EVENT_SLUGS)[number];
export const DEFAULT_SLUG: EventSlug = 'wonju-2026';

export const STAMP_IDS = ['g4', 'g5', 'g6', 'g7', 'g8', 'survey'] as const;
export const GAME_STAMPS = ['g4', 'g5', 'g6', 'g7', 'g8'];

export type SurveyRow = {
  id?: number;
  event_slug: EventSlug;
  rating: number;
  best: string[];
  how: string | null;
  from_region: string | null;
  again: string | null;
  comment: string | null;
  stamps: string[];
  device_id: string | null;
  user_agent: string | null;
  created_at: string;
};

export type StampRow = {
  id?: number;
  event_slug: EventSlug;
  device_id: string;
  stamp: string;
  created_at: string;
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

// ── 로컬 파일 저장소 (Supabase 미설정 시) ──
const LOCAL_DIR = path.join(process.cwd(), '.local-data');
function localPath(name: string) { return path.join(LOCAL_DIR, `${name}.json`); }
function readLocal<T>(name: string): T[] {
  const fp = localPath(name);
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')) as T[]; } catch { return []; }
}
function writeLocal(name: string, rows: unknown[]) {
  if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive: true });
  fs.writeFileSync(localPath(name), JSON.stringify(rows, null, 2));
}

// ── 만족도조사 ──
export type InsertResult = { ok: true; id?: number; duplicate?: boolean } | { ok: false; error: string };

export async function insertSurvey(row: SurveyRow): Promise<InsertResult> {
  if (!supaConfigured()) {
    const rows = readLocal<SurveyRow>('wellness_surveys');
    if (row.device_id && rows.some((r) => r.event_slug === row.event_slug && r.device_id === row.device_id)) {
      return { ok: true, duplicate: true };
    }
    const id = (rows.at(-1)?.id ?? 0) + 1;
    rows.push({ ...row, id });
    writeLocal('wellness_surveys', rows);
    return { ok: true, id };
  }
  const { data, error } = await db().from('wellness_surveys').insert(row).select('id').single();
  if (error) {
    if (error.code === '23505') return { ok: true, duplicate: true }; // 같은 기기 재제출
    return { ok: false, error: error.message };
  }
  return { ok: true, id: data?.id };
}

export async function listSurveys(slug: EventSlug): Promise<SurveyRow[]> {
  if (!supaConfigured()) {
    return readLocal<SurveyRow>('wellness_surveys').filter((r) => r.event_slug === slug).sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
  }
  const { data, error } = await db().from('wellness_surveys').select('*').eq('event_slug', slug).order('id', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as SurveyRow[];
}

// ── 스탬프 스캔 로그 ──
export async function logStamp(row: StampRow): Promise<{ ok: boolean; error?: string }> {
  if (!supaConfigured()) {
    const rows = readLocal<StampRow>('wellness_stamps');
    if (!rows.some((r) => r.event_slug === row.event_slug && r.device_id === row.device_id && r.stamp === row.stamp)) {
      rows.push({ ...row, id: (rows.at(-1)?.id ?? 0) + 1 });
      writeLocal('wellness_stamps', rows);
    }
    return { ok: true };
  }
  // 같은 기기·같은 도장은 한 번만 (unique 제약) → 중복은 무시
  const { error } = await db().from('wellness_stamps').upsert(row, { onConflict: 'event_slug,device_id,stamp', ignoreDuplicates: true });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listStamps(slug: EventSlug): Promise<StampRow[]> {
  if (!supaConfigured()) return readLocal<StampRow>('wellness_stamps').filter((r) => r.event_slug === slug);
  const { data, error } = await db().from('wellness_stamps').select('device_id, stamp, created_at, event_slug').eq('event_slug', slug);
  if (error) throw new Error(error.message);
  return (data ?? []) as StampRow[];
}

/** 스탬프 집계: 도장별 스캔 수 · 참여 기기 수 · 게임 5개 완주 · 6개 완성(설문까지) */
export function summarizeStamps(rows: StampRow[]) {
  const byStamp: Record<string, number> = {};
  const byDevice: Record<string, Set<string>> = {};
  for (const r of rows) {
    byStamp[r.stamp] = (byStamp[r.stamp] ?? 0) + 1;
    (byDevice[r.device_id] ??= new Set()).add(r.stamp);
  }
  const devices = Object.values(byDevice);
  const games5 = devices.filter((s) => GAME_STAMPS.every((g) => s.has(g))).length;
  const all6 = devices.filter((s) => GAME_STAMPS.every((g) => s.has(g)) && s.has('survey')).length;
  return { byStamp, participants: devices.length, games5, all6 };
}

/** 설문 집계: 평균·분포·문항별 카운트 */
export function summarizeSurveys(rows: SurveyRow[]) {
  const count = (pick: (r: SurveyRow) => string[] | string | null | undefined) => {
    const out: Record<string, number> = {};
    for (const r of rows) {
      const v = pick(r);
      const arr = Array.isArray(v) ? v : v ? [v] : [];
      for (const x of arr) out[x] = (out[x] ?? 0) + 1;
    }
    return out;
  };
  const n = rows.length;
  const avg = n ? Math.round((rows.reduce((s, r) => s + (r.rating || 0), 0) / n) * 100) / 100 : 0;
  const ratingDist = [1, 2, 3, 4, 5].map((k) => rows.filter((r) => r.rating === k).length);
  return {
    total: n, avgRating: avg, ratingDist,
    best: count((r) => r.best), how: count((r) => r.how), from: count((r) => r.from_region), again: count((r) => r.again),
    withComment: rows.filter((r) => (r.comment || '').trim()).length,
  };
}
