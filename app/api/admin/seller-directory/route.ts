import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db } from '@/lib/bookingsDb';
import { verifyAdmin } from '@/lib/adminAuth';

const auth = (req: NextRequest) => verifyAdmin(req.cookies.get('gwaa_admin_auth')?.value);

// GET /api/admin/seller-directory — 셀러 마스터 디렉토리 (중복 병합본)
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const { data, error } = await db()
    .from('seller_directory')
    .select('*')
    .order('event_count', { ascending: false })
    .order('brand_name', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ directory: data ?? [] });
}

// PATCH /api/admin/seller-directory — 메모 수정
export async function PATCH(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const b = (await req.json().catch(() => ({}))) as { id?: number; memo?: string };
  if (!b.id || typeof b.memo !== 'string') return NextResponse.json({ error: 'id·memo가 필요합니다.' }, { status: 400 });
  const { data, error } = await db().from('seller_directory').update({ memo: b.memo }).eq('id', b.id).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, entry: data });
}

// POST /api/admin/seller-directory — 신청내역에서 디렉토리 재구축(중복 병합)
// 전화번호(숫자만) 기준으로 병합, 최신 신청 정보 우선. 기존 메모는 보존.
export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });

  const { data: apps, error: e1 } = await db().from('event_sellers').select('*').order('created_at', { ascending: true });
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  const norm = (p?: string | null) => (p || '').replace(/[^0-9]/g, '');
  type Entry = Record<string, unknown> & { event_history: unknown[] };
  const map = new Map<string, Entry>();
  for (const s of apps ?? []) {
    const k = norm(s.phone) || `brand:${(s.brand_name || '').trim().toLowerCase()}`;
    const m: Entry = map.get(k) ?? { event_history: [] };
    Object.assign(m, {
      brand_name: (s.brand_name || '').trim() || m.brand_name || '',
      rep_name: s.rep_name ?? m.rep_name ?? null,
      phone: s.phone ?? m.phone ?? null,
      phone_norm: norm(s.phone) || k,
      email: s.email ?? m.email ?? null,
      category: s.category ?? m.category ?? null,
      items: s.items ?? m.items ?? null,
      sns: s.sns ?? m.sns ?? null,
      biz_no: s.biz_no ?? m.biz_no ?? null,
      last_status: s.status ?? null,
      last_applied_at: s.created_at ?? null,
    });
    m.event_history.push({ event_id: s.event_id, status: s.status, join_type: s.join_type, applied_at: s.created_at, seller_row_id: s.id });
    map.set(k, m);
  }
  const rows = [...map.values()].map((m) => ({ ...m, event_count: m.event_history.length }));
  const { error: e2 } = await db().from('seller_directory').upsert(rows, { onConflict: 'phone_norm', ignoreDuplicates: false });
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, total: rows.length });
}
