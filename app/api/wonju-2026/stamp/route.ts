/**
 * /api/wonju-2026/stamp — 스탬프 투어 스캔 로그
 *  POST  공개: 3D 페이지에서 QR(#stamp-g4…g8, 설문 완료)을 찍을 때마다 기록 (기기당 도장별 1회)
 *  GET   관리자: 도장별 스캔 수 · 참여자 수 · 완주 수
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { DEFAULT_SLUG, EVENT_SLUGS, STAMP_IDS, logStamp, listStamps, summarizeStamps, type EventSlug } from '@/lib/wellnessDb';

export const dynamic = 'force-dynamic';

function slugOf(v: unknown): EventSlug {
  return typeof v === 'string' && (EVENT_SLUGS as readonly string[]).includes(v) ? (v as EventSlug) : DEFAULT_SLUG;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = (await req.json()) as Record<string, unknown>; }
  catch { return NextResponse.json({ ok: false, error: 'bad json' }, { status: 400 }); }

  const device = typeof body.device_id === 'string' ? body.device_id.trim().slice(0, 64) : '';
  const stamp = typeof body.stamp === 'string' ? body.stamp : '';
  if (!device || !(STAMP_IDS as readonly string[]).includes(stamp)) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }
  const r = await logStamp({ event_slug: slugOf(body.event), device_id: device, stamp, created_at: new Date().toISOString() });
  if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: 500 });
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req.cookies.get('gwaa_admin_auth')?.value)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const slug = slugOf(req.nextUrl.searchParams.get('event'));
  try {
    const rows = await listStamps(slug);
    return NextResponse.json(summarizeStamps(rows), { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
