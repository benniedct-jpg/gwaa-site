import crypto from 'crypto';
import { membershipSecret } from '@/lib/security/secrets';

// 회원증 토큰 서명 비밀키 (서버 전용). 운영에서 환경변수가 없으면 발급·검증 모두 거부.
function sign(payload: object): string {
  const SECRET = membershipSecret();
  if (!SECRET) throw new Error('MEMBERSHIP_SECRET 환경변수가 설정되지 않았습니다.');
  const p = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(p).digest('base64url');
  return `${p}.${sig}`;
}

function verify(token: string): Record<string, unknown> | null {
  const SECRET = membershipSecret();
  if (!SECRET) return null;
  const parts = (token || '').split('.');
  if (parts.length !== 2) return null;
  const [p, sig] = parts;
  const expect = crypto.createHmac('sha256', SECRET).update(p).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(p, 'base64url').toString()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const now = () => Math.floor(Date.now() / 1000);

/** 제휴처 스캔용 동적 QR 토큰 (기본 60초 — 캡처·공유 시 금방 만료) */
export function signQrToken(memberId: number, ttlSec = 60): string {
  return sign({ m: memberId, t: 'q', e: now() + ttlSec });
}

/** 로그인 세션 토큰 (기본 30일) */
export function signSession(memberId: number, ttlSec = 60 * 60 * 24 * 30): string {
  return sign({ m: memberId, t: 's', e: now() + ttlSec });
}

/** 토큰 검증 — 지정 타입(q=QR, s=세션)만 인정 */
export function readToken(
  token: string,
  type: 'q' | 's',
): { memberId: number; expired: boolean } | null {
  const d = verify(token);
  if (!d || d.t !== type || typeof d.m !== 'number') return null;
  return { memberId: d.m as number, expired: now() > (d.e as number) };
}
