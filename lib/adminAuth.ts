import crypto from 'crypto';
import { adminSecret } from '@/lib/security/secrets';

// 관리자 세션 서명 비밀키 (서버 전용). 운영에서 환경변수가 없으면 null → 발급·검증 모두 거부.

const now = () => Math.floor(Date.now() / 1000);

/** HMAC 서명된 관리자 세션 토큰 발급 (기본 8시간) */
export function signAdmin(ttlSec = 60 * 60 * 8): string {
  const SECRET = adminSecret();
  if (!SECRET) throw new Error('ADMIN_SECRET 환경변수가 설정되지 않았습니다.');
  const payload = { t: 'a', e: now() + ttlSec };
  const p = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(p).digest('base64url');
  return `${p}.${sig}`;
}

/** 관리자 세션 토큰 검증 — 서명 위조·만료 시 false. 고정값 위조 불가. */
export function verifyAdmin(token: string | undefined | null): boolean {
  const SECRET = adminSecret();
  if (!SECRET) return false;
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
