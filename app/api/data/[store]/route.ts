import { NextRequest, NextResponse } from 'next/server';
import { dbGetAll, dbGet, dbInsert, dbUpsert, dbDelete, TableName } from '@/lib/db/serverDB';
import { DEFAULTS, DEFAULT_HASHTAGS } from '@/lib/db/defaults';

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
};

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getDefaultData(store: TableName): object[] {
  if (store === 'page_hashtags') return DEFAULT_HASHTAGS;
  const key = STORE_TO_DEFAULT[store];
  return (DEFAULTS as Record<string, object[]>)[key] ?? [];
}

const VALID: TableName[] = [
  'hero_images','activity_cards','event_cards','archive_events',
  'travel_places','mateship_partners','lookbook_items','gallery_items','page_hashtags',
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
  const id = req.nextUrl.searchParams.get('id');

  // Fallback to defaults when Supabase is not configured
  if (!isSupabaseConfigured()) {
    const defaults = getDefaultData(store);
    if (id) {
      const item = defaults.find((d: any) => String(d.id ?? d.page) === id) ?? null;
      return NextResponse.json(item);
    }
    return NextResponse.json(defaults.map((d, i) => ({ id: i + 1, ...d })));
  }

  try {
    if (id) {
      const row = await dbGet(store, isNaN(Number(id)) ? id : Number(id));
      return NextResponse.json(row ? fromDb(row as Record<string, unknown>) : null);
    }
    const rows = await dbGetAll(store);
    return NextResponse.json((rows as Record<string, unknown>[]).map(fromDb));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ store: string }> }) {
  const { store } = await params;
  if (!ok(store)) return NextResponse.json({ error: 'invalid store' }, { status: 400 });
  try {
    const body = await req.json();
    const row = toDb(body);
    const result = await dbInsert(store, row);
    return NextResponse.json(fromDb(result as Record<string, unknown>));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ store: string }> }) {
  const { store } = await params;
  if (!ok(store)) return NextResponse.json({ error: 'invalid store' }, { status: 400 });
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
  const { store } = await params;
  if (!ok(store)) return NextResponse.json({ error: 'invalid store' }, { status: 400 });
  try {
    const id = req.nextUrl.searchParams.get('id')!;
    await dbDelete(store, isNaN(Number(id)) ? id : Number(id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
