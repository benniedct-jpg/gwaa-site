import { NextRequest, NextResponse } from 'next/server';
import { signAdmin } from '@/lib/adminAuth';
import { supaConfigured, db } from '@/lib/bookingsDb';
import { sendMailRaw } from '@/lib/email';

const COOKIE = 'gwaa_admin_auth';
const MAX_AGE = 60 * 60 * 8; // 세션 8시간
const MAX_FAILS = 5;            // 5회 실패 시 잠금
const LOCK_MS = 60 * 60 * 1000; // 1시간 잠금
const WINDOW_MS = 60 * 60 * 1000; // 1시간 내 실패만 누적(오래된 실패는 리셋)

function clientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for') || '';
  return xff.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

type Attempt = { ip: string; fail_count: number; locked_until: string | null; last_fail: string | null };

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const correct = process.env.ADMIN_PASSWORD;
  if (!correct) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.' }, { status: 500 });
  }

  const ip = clientIp(req);
  const useStore = supaConfigured();
  const now = Date.now();

  // 1) 현재 잠금 상태 확인 (DB 오류 시엔 잠금 없이 통과 — 정당한 관리자가 못 들어오는 것 방지)
  let row: Attempt | null = null;
  if (useStore) {
    try {
      const { data } = await db().from('admin_login_attempts').select('*').eq('ip', ip).maybeSingle();
      row = (data as Attempt) || null;
    } catch { row = null; }
    if (row?.locked_until && new Date(row.locked_until).getTime() > now) {
      const mins = Math.ceil((new Date(row.locked_until).getTime() - now) / 60000);
      return NextResponse.json({ error: `로그인 시도가 많아 잠겼습니다. 약 ${mins}분 후 다시 시도해 주세요.` }, { status: 429 });
    }
  }

  // 2) 비밀번호 정답 → 실패기록 초기화 후 세션 발급
  if (password === correct) {
    if (useStore && row) { try { await db().from('admin_login_attempts').delete().eq('ip', ip); } catch { /* noop */ } }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, signAdmin(MAX_AGE), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: MAX_AGE,
      path: '/',
    });
    return res;
  }

  // 3) 비밀번호 오답 → 실패 카운트 증가, 5회 도달 시 1시간 잠금
  let fails = 1;
  let locked = false;
  if (useStore) {
    const recent = row?.last_fail && now - new Date(row.last_fail).getTime() < WINDOW_MS;
    fails = (recent ? row?.fail_count || 0 : 0) + 1;
    locked = fails >= MAX_FAILS;
    try {
      await db().from('admin_login_attempts').upsert({
        ip,
        fail_count: locked ? 0 : fails, // 잠금 걸면 카운트 리셋(잠금 자체가 차단)
        locked_until: locked ? new Date(now + LOCK_MS).toISOString() : null,
        last_fail: new Date(now).toISOString(),
      }, { onConflict: 'ip' });
    } catch { /* 기록 실패해도 로그인 흐름은 유지 */ }
  }

  // 4) 잠금 발생 시 관리자에게 보안 경고 메일
  if (locked) {
    const to = process.env.ADMIN_ALERT_EMAIL || 'bennie.dct@gmail.com';
    const when = new Date(now).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    sendMailRaw(
      to,
      '[GWAA 보안경고] 관리자 로그인 5회 실패 · 1시간 잠금',
      `<div style="font-family:'Apple SD Gothic Neo',sans-serif;line-height:1.7;color:#111">
        <h2 style="color:#dc2626">⚠️ 관리자 로그인 보안 경고</h2>
        <p>관리자 로그인이 <b>5회 연속 실패</b>하여 해당 IP를 <b>1시간 동안 차단</b>했습니다.</p>
        <ul>
          <li>시각: <b>${when}</b> (KST)</li>
          <li>IP 주소: <b>${ip}</b></li>
        </ul>
        <p>본인이 시도하신 게 아니라면 <b>관리자 비밀번호(ADMIN_PASSWORD)를 즉시 변경</b>해 주세요.</p>
        <p style="color:#6b7280;font-size:13px">— GWAA 사이트 보안 알림</p>
      </div>`
    ).catch(() => { /* 메일 실패해도 잠금은 유지 */ });
  }

  const remaining = Math.max(0, MAX_FAILS - fails);
  return NextResponse.json(
    { error: locked ? '로그인 5회 실패로 1시간 동안 잠금되었습니다. 잠시 후 다시 시도해 주세요.' : `비밀번호가 틀렸습니다. (남은 시도 ${remaining}회)` },
    { status: locked ? 429 : 401 },
  );
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
