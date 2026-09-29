import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db } from '@/lib/bookingsDb';
import { verifyAdmin } from '@/lib/adminAuth';

const auth = (req: NextRequest) => verifyAdmin(req.cookies.get('gwaa_admin_auth')?.value);

// GET /api/admin/sellers?event_id=4  — 셀러 신청 목록 (관리자)
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const eventId = req.nextUrl.searchParams.get('event_id');
  let q = db().from('event_sellers').select('*').order('created_at', { ascending: false });
  if (eventId) q = q.eq('event_id', Number(eventId));
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sellers: data ?? [] });
}

// PATCH /api/admin/sellers  — 상태·메모 수정 (관리자)
// body: { id, status?: 'pending'|'approved'|'rejected'|'waitlist', admin_note? }
export async function PATCH(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const b = await req.json().catch(() => ({})) as { id?: number; status?: string; admin_note?: string; fee_paid?: boolean };
  if (!b.id) return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 });
  const patch: Record<string, unknown> = {};
  if (b.status && ['pending', 'approved', 'rejected', 'waitlist'].includes(b.status)) patch.status = b.status;
  if (typeof b.admin_note === 'string') patch.admin_note = b.admin_note;
  if (typeof b.fee_paid === 'boolean') patch.fee_paid = b.fee_paid;
  if (!Object.keys(patch).length) return NextResponse.json({ error: '변경할 값이 없습니다.' }, { status: 400 });
  const { data, error } = await db().from('event_sellers').update(patch).eq('id', b.id).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, seller: data });
}
