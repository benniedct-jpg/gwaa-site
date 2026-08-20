import { NextRequest, NextResponse } from 'next/server';
import { dbGetAll, dbGet, dbInsert, dbUpsert, dbDelete, TableName } from '@/lib/db/serverDB';
import { DEFAULTS, DEFAULT_HASHTAGS } from '@/lib/db/defaults';
import { verifyAdmin } from '@/lib/adminAuth';
import fs from 'fs';
import path from 'path';

// ── 로컬 파일 저장소 (Supabase 미설정 시 .local-data/ 폴더에 저장) ──
const LOCAL_DIR = path.join(process.cwd(), '.local-data');

function localPath(store: TableName) {
  return path.join(LOCAL_DIR, `${store}.json`);
}

function readLocal<T>(store: TableName): T[] | null {
  const fp = localPath(store);
  if (!fs.existsSync(fp)) return null;
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')) as T[]; }
  catch { return null; }
}

function writeLocal(store: TableName, data: unknown[]): void {
  if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive: true });
  fs.writeFileSync(localPath(store), JSON.stringify(data, null, 2));
}
// ──────────────────────────────────────────────────────────────────────

const STORE_TO_DEFAULT: Record<TableName, string> = {
  hero_images:       'heroImages',
  activity_cards:    'activityCards',
  event_cards:       'eventCards',
  archive_events:    'archiveEvents',
  travel_places:     'travelPlaces',
  mateship_partners: 'mateshipPartners',
  lookbook_items:    'lookbookItems',
  gallery_items:     'galleryItems',
  page_hashtags:     'pageHashtags',
  subscribers:       'subscribers',
  applications:      'applications',
  proposals:         'proposals',
  members:           'members',
};

function isSupabaseConfigured() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!(url && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getDefaultData(store: TableName): object[] {
  if (store === 'page_hashtags') return DEFAULT_HASHTAGS;
  const key = STORE_TO_DEFAULT[store];
  return (DEFAULTS as Record<string, object[]>)[key] ?? [];
}

const VALID: TableName[] = [
  'hero_images','activity_cards','event_cards','archive_events',
  'travel_places','mateship_partners','lookbook_items','gallery_items','page_hashtags',
  'subscribers','applications','proposals','members',
];

function ok(table: string): table is TableName {
  return VALID.includes(table as TableName);
}

// Column mapping: frontend key → Supabase column
const MAP: Record<string, string> = {
  imageData:  'image_data',
  imageData2: 'image_data2',
  tagColor:   'tag_color',
  linkText:   'link_text',
  date:       'date_text',
  loc:        'location',
  desc:       'description',
  petInfo:    'pet_info',
  typeLabel:  'type_label',
  isPartner:  'is_partner',
  isMain:     'is_main',
  ctaText:    'cta_text',
  mapUrl:     'map_url',
};

function toDb(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[MAP[k] ?? k] = v;
  }
  return out;
}

function fromDb(obj: Record<string, unknown>): Record<string, unknown> {
  const rev: Record<string, string> = {};
  for (const [k, v] of Object.entries(MAP)) rev[v] = k;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[rev[k] ?? k] = v;
  }
  return out;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ store: string }> }) {
  const { store } = await params;
  if (!ok(store)) return NextResponse.json({ error: 'invalid store' }, { status: 400 });
  // 개인정보 스토어(구독자·신청자·제안접수·회원명부)는 인증된 관리자만 조회 가능
  if ((store === 'subscribers' || store === 'applications' || store === 'proposals' || store === 'members') && !isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get('id');

  if (!isSupabaseConfigured()) {
    const defaults = getDefaultData(store).map((d, i) => ({ id: i + 1, ...d })) as Record<string, unknown>[];
    const local = readLocal<Record<string, unknown>>(store);
    const data = local ?? defaults;
    if (id) {
      const item = data.find(d =>
        String(d.id) === id ||
        String((d as Record<string, unknown>).page) === id
      ) ?? null;
      return NextResponse.json(item);
    }
    return NextResponse.json(data);
  }

  // 개인정보 스토어는 인증된 관리자 응답이라도 절대 공개(엣지) 캐시 금지 — 캐시 포이즈닝으로 개인정보 유출 방지
  const PRIVATE_STORE = store === 'subscribers' || store === 'applications' || store === 'proposals' || store === 'members';
  const CACHE = (id || PRIVATE_STORE) ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=300';

  try {
    if (id) {
      const row = await dbGet(store, isNaN(Number(id)) ? id : Number(id));
      return NextResponse.json(row ? fromDb(row as Record<string, unknown>) : null);
    }
    const rows = await dbGetAll(store);
    return NextResponse.json(
      (rows as Record<string, unknown>[]).map(fromDb),
      { headers: { 'Cache-Control': CACHE } },
    );
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function isAuthorized(req: NextRequest): boolean {
  return verifyAdmin(req.cookies.get('gwaa_admin_auth')?.value);
}

// 비로그인 공개 폼이 제출하는 스토어(신청·구독)와 허용 필드 화이트리스트
const PUBLIC_POST: Record<string, string[]> = {
  applications: ['name', 'phone', 'email', 'course', 'region', 'message', 'created_at'],
  subscribers:  ['email', 'created_at'],
  proposals:    ['kind', 'name', 'region', 'category', 'contact', 'email', 'link', 'message', 'created_at'],
};

function pickAllowed(store: string, body: Record<string, unknown>): Record<string, unknown> {
  const allowed = PUBLIC_POST[store];
  if (!allowed) return body;
  const out: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) out[k] = body[k];
  return out;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ store: string }> }) {
  const { store } = await params;
  if (!ok(store)) return NextResponse.json({ error: 'invalid store' }, { status: 400 });
  // 공개 폼 제출(신청·구독)은 인증 없이 허용, 그 외 스토어는 관리자 전용
  const isPublicSubmit = store in PUBLIC_POST;
  if (!isPublicSubmit && !isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    const body = pickAllowed(store, await req.json() as Record<string, unknown>);
    const defaults = getDefaultData(store).map((d, i) => ({ id: i + 1, ...d })) as Record<string, unknown>[];
    const current = readLocal<Record<string, unknown>>(store) ?? defaults;
    const newId = Math.max(0, ...current.map(d => Number(d.id) || 0)) + 1;
    const newItem = { ...body, id: newId };
    current.push(newItem);
    writeLocal(store, current);
    return NextResponse.json(newItem);
  }

  try {
    const body = pickAllowed(store, await req.json() as Record<string, unknown>);
    const row = toDb(body);
    const result = await dbInsert(store, row);
    return NextResponse.json(fromDb(result as Record<string, unknown>));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ store: string }> }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { store } = await params;
  if (!ok(store)) return NextResponse.json({ error: 'invalid store' }, { status: 400 });

  if (!isSupabaseConfigured()) {
    const body = await req.json() as Record<string, unknown>;
    const defaults = getDefaultData(store).map((d, i) => ({ id: i + 1, ...d })) as Record<string, unknown>[];
    const current = readLocal<Record<string, unknown>>(store) ?? defaults;
    // page_hashtags: page 키로 매칭 / 나머지: id 우선, 없으면 order로 매칭
    let idx = -1;
    if (store === 'page_hashtags') {
      idx = current.findIndex(d => d.page === body.page);
    } else if (body.id !== undefined) {
      idx = current.findIndex(d => d.id === body.id);
    } else {
      idx = current.findIndex(d => d.order !== undefined && d.order === body.order);
    }
    if (idx >= 0) {
      current[idx] = body;
    } else {
      current.push(body);
    }
    writeLocal(store, current);
    return NextResponse.json(body);
  }

  try {
    const body = await req.json();
    const row = toDb(body);
    const result = await dbUpsert(store, row);
    return NextResponse.json(fromDb(result as Record<string, unknown>));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ store: string }> }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { store } = await params;
  if (!ok(store)) return NextResponse.json({ error: 'invalid store' }, { status: 400 });

  if (!isSupabaseConfigured()) {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const defaults = getDefaultData(store).map((d, i) => ({ id: i + 1, ...d })) as Record<string, unknown>[];
    const current = readLocal<Record<string, unknown>>(store) ?? defaults;
    const filtered = current.filter(d =>
      String(d.id) !== id && String((d as Record<string, unknown>).page) !== id
    );
    writeLocal(store, filtered);
    return NextResponse.json({ ok: true });
  }

  try {
    const id = req.nextUrl.searchParams.get('id')!;
    await dbDelete(store, isNaN(Number(id)) ? id : Number(id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
