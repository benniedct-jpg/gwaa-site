import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db } from '@/lib/bookingsDb';
import { verifyAdmin } from '@/lib/adminAuth';

const PROGRAM = 'happy-2';

// 공개 신청 접수
export async function POST(req: NextRequest) {
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const guardian_name = String(b.guardian_name ?? '').trim();
  const phone = String(b.phone ?? '').trim();
  if (!guardian_name || !phone) return NextResponse.json({ error: '보호자 성함과 연락처를 입력해 주세요.' }, { status: 400 });
  if (!/^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone.replace(/\s/g, ''))) return NextResponse.json({ error: '연락처 형식을 확인해 주세요. (예: 010-0000-0000)' }, { status: 400 });
  if (b.attend_ok !== true) return NextResponse.json({ error: '4주 전 회차 참여 가능 여부에 체크해 주세요.' }, { status: 400 });
  if (b.privacy_agreed !== true) return NextResponse.json({ error: '개인정보 수집·이용 동의가 필요합니다.' }, { status: 400 });
  if (b.safety_agreed !== true) return NextResponse.json({ error: '안전·책임 관련 안내 동의가 필요합니다.' }, { status: 400 });

  const same = await db().from('happy_applications').select('id').eq('program', PROGRAM).eq('phone', phone).neq('status', 'rejected').maybeSingle();
  if (same.data) return NextResponse.json({ ok: true, already: true });

  const row = {
    program: PROGRAM, guardian_name, phone,
    wonju_resident: b.wonju_resident === true,
    dog_name: String(b.dog_name ?? '').trim(), breed: String(b.breed ?? '').trim(), dog_age: String(b.dog_age ?? '').trim(),
    dog_sex: String(b.dog_sex ?? '').trim(), dog_size: String(b.dog_size ?? '').trim(), vaccinated: String(b.vaccinated ?? '').trim(),
    behaviors: String(b.behaviors ?? '').trim(), behavior_detail: String(b.behavior_detail ?? '').trim(), motivation: String(b.motivation ?? '').trim(),
    attend_ok: true, privacy_agreed: true, photo_agreed: b.photo_agreed === true, safety_agreed: true,
  };
  const ins = await db().from('happy_applications').insert(row).select('id').maybeSingle();
  if (ins.error) return NextResponse.json({ error: '신청 저장 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.' }, { status: 500 });
  return NextResponse.json({ ok: true, id: ins.data?.id });
}

// 관리자 조회
export async function GET(req: NextRequest) {
  if (!verifyAdmin(req.cookies.get('gwaa_admin_auth')?.value)) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const { data, error } = await db().from('happy_applications').select('*').eq('program', PROGRAM).order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
}

// 관리자 선정/상태 토글
export async function PATCH(req: NextRequest) {
  if (!verifyAdmin(req.cookies.get('gwaa_admin_auth')?.value)) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const b = (await req.json().catch(() => ({}))) as { id?: number; selected?: boolean; status?: string };
  if (!b.id) return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 });
  const upd: Record<string, unknown> = {};
  if (typeof b.selected === 'boolean') upd.selected = b.selected;
  if (b.status) upd.status = b.status;
  const { error } = await db().from('happy_applications').update(upd).eq('id', b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
