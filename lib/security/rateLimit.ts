import { supaConfigured, db } from '@/lib/bookingsDb';

// 시도 횟수 제한 — 관리자 로그인과 같은 admin_login_attempts 테이블을 재사용한다(새 테이블 불필요).
// 키는 "<용도>:<IP>" 형태로 저장해 관리자 로그인 기록(순수 IP)과 섞이지 않게 한다.
// DB 오류 시에는 막지 않고 통과시킨다(정상 사용자가 못 들어오는 것 방지) — 관리자 로그인과 동일한 정책.

type Row = { ip: string; fail_count: number; locked_until: string | null; last_fail: string | null };

const WINDOW_MS = 60 * 60 * 1000;

export function clientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for') || '';
  return xff.split(',')[0].trim() || headers.get('x-real-ip') || 'unknown';
}

/** 현재 잠금 상태면 남은 분(올림)을, 아니면 0을 돌려준다. */
export async function lockedMinutes(scope: string, ip: string): Promise<number> {
  if (!supaConfigured()) return 0;
  try {
    const { data } = await db().from('admin_login_attempts').select('*').eq('ip', `${scope}:${ip}`).maybeSingle();
    const row = data as Row | null;
    const until = row?.locked_until ? new Date(row.locked_until).getTime() : 0;
    return until > Date.now() ? Math.ceil((until - Date.now()) / 60000) : 0;
  } catch {
    return 0;
  }
}

/** 실패 1회 기록. maxFails 에 도달하면 lockMs 동안 잠근다. */
export async function recordFail(scope: string, ip: string, maxFails: number, lockMs: number): Promise<void> {
  if (!supaConfigured()) return;
  const key = `${scope}:${ip}`;
  const now = Date.now();
  try {
    const { data } = await db().from('admin_login_attempts').select('*').eq('ip', key).maybeSingle();
    const row = data as Row | null;
    const recent = row?.last_fail && now - new Date(row.last_fail).getTime() < WINDOW_MS;
    const fails = (recent ? row?.fail_count || 0 : 0) + 1;
    const locked = fails >= maxFails;
    await db().from('admin_login_attempts').upsert({
      ip: key,
      fail_count: locked ? 0 : fails,
      locked_until: locked ? new Date(now + lockMs).toISOString() : null,
      last_fail: new Date(now).toISOString(),
    }, { onConflict: 'ip' });
  } catch { /* 기록 실패해도 본 흐름은 유지 */ }
}

/** 성공 시 실패 기록 초기화 */
export async function clearFails(scope: string, ip: string): Promise<void> {
  if (!supaConfigured()) return;
  try { await db().from('admin_login_attempts').delete().eq('ip', `${scope}:${ip}`); } catch { /* noop */ }
}
