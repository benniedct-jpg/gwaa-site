/**
 * /api/wonju-2026/survey — 웰니스클럽 3D 행사장 만족도조사 (경품존 26번 · 6번째 도장)
 *  POST  공개: 3D 페이지(/wonju-2026/3d.html)에서 제출 → wellness_surveys 테이블에 저장
 *  GET   관리자: 전체 응답 + 집계 (?format=csv → 엑셀용 CSV 다운로드)
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import {
  DEFAULT_SLUG, EVENT_SLUGS, STAMP_IDS, insertSurvey, listSurveys, summarizeSurveys,
  type EventSlug, type SurveyRow,
} from '@/lib/wellnessDb';

export const dynamic = 'force-dynamic';

// 3D 페이지의 선택지와 동일 (다른 값은 버림 → 스팸·조작 방지)
const OPTS = {
  best: ['셀러부스', '체험부스', '헬스케어', '미니게임', '오프리쉬존', '무대 공연', '푸드트럭', '포토존', '입양부스'],
  how: ['인스타그램·SNS', '포스터·현수막', '지인 소개', '원주시 소식', '우연히 지나다가'],
  from: ['원주', '강원 다른 지역', '다른 지역'],
  again: ['꼭 올게요', '생각해 볼게요', '아니요'],
};

// 아주 단순한 IP별 속도 제한 (서버리스 인스턴스 단위 — 보조 수단. 기기당 1회 제한은 DB unique 제약이 담당)
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 20;
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const oneOf = (v: unknown, list: string[]) => (typeof v === 'string' && list.includes(v) ? v : null);
const manyOf = (v: unknown, list: string[]) => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string' && list.includes(x)))] : []);

function slugOf(v: unknown): EventSlug {
  return typeof v === 'string' && (EVENT_SLUGS as readonly string[]).includes(v) ? (v as EventSlug) : DEFAULT_SLUG;
}

// ── POST: 설문 제출 ──
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = (await req.json()) as Record<string, unknown>; }
  catch { return NextResponse.json({ ok: false, error: 'JSON 형식이 아닙니다.' }, { status: 400 }); }

  // 허니팟(봇은 채움) — 사람 화면엔 없는 필드
  if (str(body.website, 10)) return NextResponse.json({ ok: true });

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  if (rateLimited(ip)) return NextResponse.json({ ok: false, error: '잠시 후 다시 시도해 주세요.' }, { status: 429 });

  const rating = Number(body.rate ?? body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ ok: false, error: '만족도(1~5)를 선택해 주세요.' }, { status: 400 });
  }

  const row: SurveyRow = {
    event_slug: slugOf(body.event),
    rating,
    best: manyOf(body.best, OPTS.best),
    how: oneOf(body.how, OPTS.how),
    from_region: oneOf(body.from, OPTS.from),
    again: oneOf(body.again, OPTS.again),
    comment: str(body.text ?? body.comment, 600) || null,
    stamps: manyOf(body.stamps, [...STAMP_IDS]),
    device_id: str(body.device_id, 64) || null,
    user_agent: (req.headers.get('user-agent') || '').slice(0, 200) || null,
    created_at: new Date().toISOString(),
  };

  const r = await insertSurvey(row);
  if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: 500 });
  return NextResponse.json({ ok: true, id: r.id ?? null, duplicate: !!r.duplicate }, { headers: { 'Cache-Control': 'no-store' } });
}

// ── GET: 관리자 조회 (JSON 또는 CSV) ──
export async function GET(req: NextRequest) {
  if (!verifyAdmin(req.cookies.get('gwaa_admin_auth')?.value)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const slug = slugOf(req.nextUrl.searchParams.get('event'));
  let rows: SurveyRow[];
  try { rows = await listSurveys(slug); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 }); }

  if (req.nextUrl.searchParams.get('format') === 'csv') {
    const header = ['번호', '제출일시', '만족도(1~5)', '가장 좋았던 곳', '알게 된 경로', '거주 지역', '재방문 의향', '의견', '게임 도장', '기기ID'];
    const esc = (c: unknown) => `"${String(c ?? '').replace(/"/g, '""')}"`;
    const lines = rows.map((r) => [
      r.id ?? '', new Date(r.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }), r.rating,
      (r.best || []).join(' / '), r.how ?? '', r.from_region ?? '', r.again ?? '', r.comment ?? '',
      (r.stamps || []).filter((s) => s !== 'survey').length + '/5', r.device_id ?? '',
    ].map(esc).join(','));
    const csv = '﻿' + [header.map(esc).join(','), ...lines].join('\r\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="wellness_survey_${slug}_${Date.now()}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  return NextResponse.json({ rows, summary: summarizeSurveys(rows) }, { headers: { 'Cache-Control': 'no-store' } });
}
