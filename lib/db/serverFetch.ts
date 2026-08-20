import { dbGetAll, TableName } from './serverDB';
import { DEFAULTS, DEFAULT_HASHTAGS } from './defaults';
import fs from 'fs';
import path from 'path';

// Supabase 미설정 시: 어드민 API와 동일하게 .local-data/ 를 우선 사용 (단일 소스)
function readLocal<T>(table: TableName): T[] | null {
  try {
    const fp = path.join(process.cwd(), '.local-data', `${table}.json`);
    if (!fs.existsSync(fp)) return null;
    return JSON.parse(fs.readFileSync(fp, 'utf-8')) as T[];
  } catch {
    return null;
  }
}

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

const MAP: Record<string, string> = {
  image_data:  'imageData',
  image_data2: 'imageData2',
  tag_color:   'tagColor',
  link_text:   'linkText',
  date_text:   'date',
  location:    'loc',
  description: 'desc',
  pet_info:    'petInfo',
  type_label:  'typeLabel',
  is_partner:  'isPartner',
  is_main:     'isMain',
  cta_text:    'ctaText',
  map_url:     'mapUrl',
};

function fromDb(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[MAP[k] ?? k] = v;
  }
  return out;
}

function isConfigured() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!(url && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function fetchStore<T>(table: TableName): Promise<T[]> {
  if (!isConfigured()) {
    // 1순위: .local-data (어드민이 쓰는 곳과 동일) → 목록·상세·어드민 통일
    const local = readLocal<T>(table);
    if (local) return local;
    // 2순위: 시드 기본값
    const key = STORE_TO_DEFAULT[table];
    const raw = table === 'page_hashtags'
      ? DEFAULT_HASHTAGS
      : ((DEFAULTS as Record<string, object[]>)[key] ?? []);
    return raw.map((d, i) => ({ id: i + 1, ...d })) as T[];
  }
  try {
    const rows = await dbGetAll(table);
    return (rows as Record<string, unknown>[]).map(fromDb) as T[];
  } catch {
    return [];
  }
}
