import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db, newTicketToken, type Booking } from '@/lib/bookingsDb';
import { verifyAdmin } from '@/lib/adminAuth';
import { sendRecoveryEmail, sendRebookEmail } from '@/lib/email';

export const maxDuration = 300;

// 미입금 회수 캠페인 발송 (관리자 전용)
// body: { mode: 'test' | 'group-a' | 'all', testTo?: string }
//  - 대상: status=pending · amount>0 · 유효 이메일 · 본인테스트/홍보더미 제외
//  - test: 대표 1건을 testTo로(미리보기) · group-a: 최근 7일 이내 · all: 전체
export async function POST(req: NextRequest) {
  if (!verifyAdmin(req.cookies.get('gwaa_admin_auth')?.value)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });

  const body = await req.json().catch(() => ({})) as { mode?: string; testTo?: string };
  const mode = body.mode || 'test';

  const { data, error } = await db().from('bookings').select('*')
    .eq('status', 'pending').gt('amount', 0).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const validEmail = (e: unknown) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(e ?? ''));
  const real = (data as Booking[] ?? []).filter((b) =>
    validEmail(b.email) &&
    String(b.email).toLowerCase() !== 'bennie.dct@gmail.com' &&      // 본인 테스트 예약 제외
    !/홍보용|광고용/.test(String(b.name ?? '')),                       // 홍보 더미 제외
  );
  const daysOld = (b: Booking) => (Date.now() - new Date(String(b.created_at)).getTime()) / 86400000;

  // 링크용 토큰 없으면 발급·저장
  const ensureToken = async (b: Booking): Promise<Booking> => {
    if (b.ticket_token) return b;
    const t = newTicketToken();
    await db().from('bookings').update({ ticket_token: t }).eq('id', b.id);
    return { ...b, ticket_token: t };
  };

  // ── 테스트: 대표 1건(가장 최근 실제 대상) 내용을 testTo로 미리보기 발송 ──
  if (mode === 'test') {
    const to = body.testTo || 'bennie.dct@gmail.com';
    const sample: Booking = real[0]
      ? await ensureToken(real[0])
      : { name: '수현', booking_label: '2박 3일', date_label: '9/4(금) ~ 9/6(일)', amount: 185000, ticket_token: '' };
    const r = await sendRecoveryEmail(sample, to, true);
    return NextResponse.json({ mode, to, sent: r.sent ? 1 : 0, failed: r.sent ? 0 : 1, reason: r.reason ?? null, targetCount: real.length });
  }

  // ── 재예약 안내 (F4-14 미입금 취소분) ──
  if (mode === 'rebook-test' || mode === 'rebook') {
    const { data: cx } = await db().from('bookings').select('*').eq('site', 'F4-14').eq('status', 'cancelled');
    // 이메일 기준 중복 제거
    const seen = new Set<string>(); const targets: Booking[] = [];
    for (const b of (cx as Booking[] ?? [])) { const e = String(b.email ?? '').toLowerCase(); if (!e || !validEmail(e) || seen.has(e)) continue; seen.add(e); targets.push(b); }

    if (mode === 'rebook-test') {
      const to = body.testTo || 'bennie.dct@gmail.com';
      const sample: Booking = targets[0] ?? { name: '수현', booking_label: '2박 3일', date_label: '9/4(금) ~ 9/6(일)', amount: 185000 };
      const r = await sendRebookEmail(sample, to, true);
      return NextResponse.json({ mode, to, sent: r.sent ? 1 : 0, reason: r.reason ?? null, targetCount: targets.length });
    }

    let sent = 0, failed = 0; const errors: string[] = [];
    for (const b of targets) {
      try { const r = await sendRebookEmail(b); if (r.sent) sent++; else { failed++; if (errors.length < 6) errors.push(`${b.email}: ${r.reason ?? '실패'}`); } }
      catch (e) { failed++; if (errors.length < 6) errors.push(`${b.email}: ${e instanceof Error ? e.message : String(e)}`); }
    }
    return NextResponse.json({ mode, total: targets.length, sent, failed, errors });
  }

  // ── 실제 발송 ──
  let targets = real;
  if (mode === 'group-a') targets = real.filter((b) => daysOld(b) <= 7);

  let sent = 0, failed = 0;
  const errors: string[] = [];
  for (const b0 of targets) {
    try {
      const b = await ensureToken(b0);
      const r = await sendRecoveryEmail(b);
      if (r.sent) sent++; else { failed++; if (errors.length < 6) errors.push(`${b.email}: ${r.reason ?? '실패'}`); }
    } catch (e) {
      failed++; if (errors.length < 6) errors.push(`${b0.email}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return NextResponse.json({ mode, total: targets.length, sent, failed, errors });
}
