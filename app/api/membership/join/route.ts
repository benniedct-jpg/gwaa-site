import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db } from '@/lib/bookingsDb';
import { signSession } from '@/lib/membership/token';

// 연회비 멤버십 가입 — PortOne 일반결제 검증 후 회원 생성/활성화 + 세션 발급
// body: { name, phone, email, region, paymentId }
export const MEMBERSHIP_FEE = 120000; // 연회비(원)

export async function POST(req: NextRequest) {
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const b = await req.json().catch(() => ({})) as { name?: string; phone?: string; email?: string; region?: string; paymentId?: string };
  const name = String(b.name ?? '').trim();
  const phone = String(b.phone ?? '').trim();
  const email = String(b.email ?? '').trim();
  const region = String(b.region ?? '').trim();
  const paymentId = String(b.paymentId ?? '').trim();
  if (!name || !phone || !paymentId) return NextResponse.json({ error: '이름·연락처·결제정보를 확인해 주세요.' }, { status: 400 });
  if (!/^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone.replace(/\s/g, ''))) return NextResponse.json({ error: '연락처 형식을 확인해 주세요.' }, { status: 400 });

  // 이미 활성 회원인지 (같은 결제 재처리 방지 겸)
  const dupPay = await db().from('members').select('id,member_no').eq('note', `pay:${paymentId}`).maybeSingle();
  if (dupPay.data) {
    const res = NextResponse.json({ ok: true, already: true, member_no: (dupPay.data as { member_no?: string }).member_no });
    res.cookies.set('gwaa_member', signSession((dupPay.data as { id: number }).id), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
    return res;
  }

  // 결제 검증 (PortOne)
  const secret = process.env.PORTONE_API_SECRET;
  if (!secret) return NextResponse.json({ error: '결제 연동 준비 중입니다.' }, { status: 503 });
  const pr = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, { headers: { Authorization: `PortOne ${secret}` } });
  const pay = await pr.json();
  if (!pr.ok || pay?.status !== 'PAID') return NextResponse.json({ error: `결제가 확인되지 않았습니다. (상태: ${pay?.status || pr.status})` }, { status: 402 });
  if (Number(pay?.amount?.total) !== MEMBERSHIP_FEE) return NextResponse.json({ error: '결제 금액이 일치하지 않습니다.' }, { status: 400 });

  const now = new Date();
  const expires = new Date(now); expires.setFullYear(expires.getFullYear() + 1);
  const year = now.getFullYear();
  // 회원번호: GWAA-연도-순번
  const cnt = await db().from('members').select('id', { count: 'exact', head: true });
  const seq = String(((cnt.count ?? 0) + 1)).padStart(4, '0');
  const member_no = `GWAA-${year}-${seq}`;

  // 기존 동일 전화 회원이면 갱신(연장), 아니면 신규
  const existing = await db().from('members').select('id').eq('phone', phone).maybeSingle();
  const payload = {
    name, phone, email, region, status: 'active', plan: 'annual',
    joined_at: now.toISOString(), expires_at: expires.toISOString(), note: `pay:${paymentId}`,
  };
  let memberId: number; let mno = member_no;
  if (existing.data) {
    memberId = (existing.data as { id: number }).id;
    await db().from('members').update({ status: 'active', plan: 'annual', expires_at: expires.toISOString(), note: `pay:${paymentId}` }).eq('id', memberId);
    const cur = await db().from('members').select('member_no').eq('id', memberId).single();
    mno = (cur.data as { member_no?: string })?.member_no || member_no;
    if (!mno) { await db().from('members').update({ member_no }).eq('id', memberId); mno = member_no; }
  } else {
    const ins = await db().from('members').insert({ ...payload, member_no }).select('id').single();
    if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
    memberId = (ins.data as { id: number }).id;
  }

  const res = NextResponse.json({ ok: true, member_no: mno, expires_at: expires.toISOString() });
  res.cookies.set('gwaa_member', signSession(memberId), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return res;
}
