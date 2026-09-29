import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db } from '@/lib/bookingsDb';

// 만족도조사 제출 (공개)
export async function POST(req: NextRequest) {
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;

  const event_id = Number(b.event_id);
  const overall = Number(b.overall);
  if (!event_id) return NextResponse.json({ error: '행사 정보가 없습니다.' }, { status: 400 });
  if (!(overall >= 1 && overall <= 5)) return NextResponse.json({ error: '전체 만족도를 선택해 주세요.' }, { status: 400 });

  // 설문 오픈된 행사인지 확인
  const ev = await db().from('event_cards').select('survey_open').eq('id', event_id).maybeSingle();
  if (!ev.data) return NextResponse.json({ error: '행사를 찾을 수 없습니다.' }, { status: 404 });
  if (!(ev.data as { survey_open?: boolean }).survey_open) {
    return NextResponse.json({ error: '설문이 마감되었습니다.' }, { status: 409 });
  }

  const clampRating = (v: unknown) => {
    const n = Number(v);
    return n >= 1 && n <= 5 ? n : null;
  };
  const phone = String(b.phone ?? '').trim();
  // 경품 응모(연락처)를 넣었다면 동의 필수
  if (phone && b.privacy_agreed !== true) {
    return NextResponse.json({ error: '경품 응모를 위해 개인정보 수집·이용 동의가 필요합니다.' }, { status: 400 });
  }

  const rec = {
    event_id,
    overall,
    programs: Array.isArray(b.programs) ? (b.programs as string[]).join(', ') : String(b.programs ?? ''),
    rating_program: clampRating(b.rating_program),
    rating_booth: clampRating(b.rating_booth),
    rating_facility: clampRating(b.rating_facility),
    rating_safety: clampRating(b.rating_safety),
    revisit: clampRating(b.revisit),
    source: String(b.source ?? '').trim(),
    region: String(b.region ?? '').trim(),
    pet_with: typeof b.pet_with === 'boolean' ? b.pet_with : null,
    liked: String(b.liked ?? '').trim(),
    improve: String(b.improve ?? '').trim(),
    phone,
    privacy_agreed: b.privacy_agreed === true,
  };
  const ins = await db().from('survey_responses').insert(rec).select('id').single();
  if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
