'use client';
/**
 * clientDB — admin 페이지에서 사용하는 API 클라이언트
 * gwaaDB 인터페이스와 동일하게 사용 가능
 */

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED  = new Set(['image/jpeg', 'image/png', 'image/webp']);

// Util (image) — unchanged
export function validateImage(file: File): { ok: boolean; error?: string } {
  if (!ALLOWED.has(file.type)) return { ok: false, error: 'JPG, PNG, WebP 형식만 가능합니다.' };
  if (file.size > MAX_SIZE)    return { ok: false, error: `2MB 이하만 가능합니다. (현재 ${(file.size / 1024 / 1024).toFixed(1)}MB)` };
  return { ok: true };
}

export function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = (e) => res((e.target as FileReader).result as string);
    r.onerror = () => rej(new Error('파일 읽기 실패'));
    r.readAsDataURL(file);
  });
}

// Table mapping
const TABLE: Record<string, string> = {
  heroImages:       'hero_images',
  activityCards:    'activity_cards',
  eventCards:       'event_cards',
  archiveEvents:    'archive_events',
  travelPlaces:     'travel_places',
  mateshipPartners: 'mateship_partners',
  lookbookItems:    'lookbook_items',
  galleryItems:     'gallery_items',
  pageHashtags:     'page_hashtags',
};

function endpoint(store: string) {
  return `/api/data/${TABLE[store] ?? store}`;
}

async function req<T>(method: string, store: string, body?: unknown, qs?: string): Promise<T> {
  const res = await fetch(`${endpoint(store)}${qs ?? ''}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body:    body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json();
}

export const clientDB = {
  validateImage,
  toBase64,
  getAll: <T>(store: string) => req<T[]>('GET', store),
  get:    <T>(store: string, id: number | string) => req<T>('GET', store, undefined, `?id=${id}`),
  add:    <T>(store: string, item: T) => req<T>('POST', store, item),
  put:    <T>(store: string, item: T) => req<T>('PUT', store, item),
  remove: (store: string, id: number | string) => req<{ ok: boolean }>('DELETE', store, undefined, `?id=${id}`),
};
