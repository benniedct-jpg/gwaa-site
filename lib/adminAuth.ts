import crypto from 'crypto';

// 관리자 세션 서명 비밀키 (서버 전용). 회원증 토큰과 동일한 비밀 소스 재활용.
const SECRET =
  process.env.ADMIN_SECRET ||
  process.env.MEMBERSHIP_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'gwaa-dev-admin-secret';

const now = () => Math.floor(Date.now() / 1000);

/** HMAC 서명된 관리자 세션 토큰 발급 (기본 8시간) */
export function signAdmin(ttlSec = 60 * 60 * 8): string {
  const payload = { t: 'a', e: now() + ttlSec };
  const p = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(p).digest('base64url');
  return `${p}.${sig}`;
}

/** 관리자 세션 토큰 검증 — 서명 위조·만료 시 false. 고정값 위조 불가. */
export function verifyAdmin(token: string | undefined | null): boolean {
  const parts = (token || '').split('.');
  if (parts.length !== 2) return false;
  const [p, sig] = parts;
  const expect = crypto.createHmac('sha256', SECRET).update(p).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const d = JSON.parse(Buffer.from(p, 'base64url').toString()) as Record<string, unknown>;
    return d.t === 'a' && typeof d.e === 'number' && now() <= (d.e as number);
  } catch {
    return false;
  }
}
