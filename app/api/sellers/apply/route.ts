import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db } from '@/lib/bookingsDb';
import { sendSellerApplyEmail } from '@/lib/email';

// 프리마켓 셀러 모집 신청 (공개)
// body: { event_id, brand_name, rep_name, phone, email?, category?, items?, needs_power?, needs_table?, vehicle?, sns?, biz_no?, privacy_agreed }
export async function POST(req: NextRequest) {
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;

  const event_id = Number(b.event_id);
  const brand_name = String(b.brand_name ?? '').trim();
  const rep_name = String(b.rep_name ?? '').trim();
  const phone = String(b.phone ?? '').trim();
  if (!event_id || !brand_name || !rep_name || !phone) {
    return NextResponse.json({ error: '브랜드명·대표자·연락처를 입력해 주세요.' }, { status: 400 });
  }
  if (b.privacy_agreed !== true) {
    return NextResponse.json({ error: '개인정보 수집·이용 동의가 필요합니다.' }, { status: 400 });
  }
  const join_type = b.join_type === 'fee' ? 'fee' : 'sponsor';
  const sponsor_items = String(b.sponsor_items ?? '').trim();
  if (join_type === 'sponsor' && !sponsor_items) {
    return NextResponse.json({ error: '후원물품 제공을 선택하셨어요. 제공하실 물품·수량을 적어주세요.' }, { status: 400 });
  }
  if (!/^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone.replace(/\s/g, ''))) {
    return NextResponse.json({ error: '연락처 형식을 확인해 주세요. (예: 010-0000-0000)' }, { status: 400 });
  }

  // 모집 오픈된 행사인지 확인
  const ev = await db().from('event_cards').select('id,seller_open,title').eq('id', event_id).maybeSingle();
  if (!ev.data) return NextResponse.json({ error: '행사를 찾을 수 없습니다.' }, { status: 404 });
  if (!(ev.data as { seller_open?: boolean }).seller_open) {
    return NextResponse.json({ error: '현재 셀러 모집이 마감되었습니다.' }, { status: 409 });
  }

  // 중복 신청 방지: 같은 행사 · 같은 연락처 · 반려 아닌 건이 이미 있으면 그대로 반환
  const same = await db().from('event_sellers').select('id')
    .eq('event_id', event_id).eq('phone', phone).neq('status', 'rejected').maybeSingle();
  if (same.data) return NextResponse.json({ ok: true, already: true });

  const rec = {
    event_id,
    brand_name,
    rep_name,
    phone,
    email: String(b.email ?? '').trim(),
    category: String(b.category ?? '').trim(),
    items: String(b.items ?? '').trim(),
    needs_power: b.needs_power === true,
    needs_table: b.needs_table === true,
    vehicle: String(b.vehicle ?? '').trim(),
    sns: String(b.sns ?? '').trim(),
    biz_no: String(b.biz_no ?? '').trim(),
    join_type,
    sponsor_items,
    privacy_agreed: true,
    status: 'pending',
  };
  const ins = await db().from('event_sellers').insert(rec).select('id').single();
  if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });

  // 접수 확인 메일 (이메일 입력 시 · 실패해도 신청은 성공 처리)
  if (rec.email) {
    try { await sendSellerApplyEmail({ brand_name, email: rec.email, join_type }); } catch { /* noop */ }
  }
  return NextResponse.json({ ok: true, id: (ins.data as { id: number }).id });
}
