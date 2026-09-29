import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db } from '@/lib/bookingsDb';
import { verifyAdmin } from '@/lib/adminAuth';

// GET /api/admin/survey?event_id=4 — 만족도조사 응답 + 집계 (관리자)
export async function GET(req: NextRequest) {
  if (!verifyAdmin(req.cookies.get('gwaa_admin_auth')?.value)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const eventId = req.nextUrl.searchParams.get('event_id');
  let q = db().from('survey_responses').select('*').order('created_at', { ascending: false });
  if (eventId) q = q.eq('event_id', Number(eventId));
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data as Record<string, unknown>[]) ?? [];
  const avg = (key: string) => {
    const vals = rows.map((r) => Number(r[key])).filter((n) => n >= 1 && n <= 5);
    return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : null;
  };
  // 프로그램별 언급 수
  const programCounts: Record<string, number> = {};
  rows.forEach((r) => String(r.programs || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((p) => { programCounts[p] = (programCounts[p] || 0) + 1; }));
  const sourceCounts: Record<string, number> = {};
  rows.forEach((r) => { const s = String(r.source || '').trim(); if (s) sourceCounts[s] = (sourceCounts[s] || 0) + 1; });
  const regionCounts: Record<string, number> = {};
  rows.forEach((r) => { const s = String(r.region || '').trim(); if (s) regionCounts[s] = (regionCounts[s] || 0) + 1; });

  return NextResponse.json({
    responses: rows,
    stats: {
      total: rows.length,
      overall: avg('overall'),
      revisit: avg('revisit'),
      rating_program: avg('rating_program'),
      rating_booth: avg('rating_booth'),
      rating_facility: avg('rating_facility'),
      rating_safety: avg('rating_safety'),
      programCounts, sourceCounts, regionCounts,
      petWith: rows.filter((r) => r.pet_with === true).length,
    },
  });
}
