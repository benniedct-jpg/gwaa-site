// 서명 비밀키 해석 — 운영(production)에서는 저장소에 공개된 기본값을 절대 쓰지 않는다.
// 이 저장소는 공개 저장소라, 코드에 적힌 기본 비밀키로는 누구나 관리자·회원 세션을 위조할 수 있다.
// 환경변수가 하나도 없으면 운영에서는 null 을 돌려주고, 호출부는 '인증 실패'로 처리(fail-closed)한다.
// Edge(proxy.ts)·Node 양쪽에서 import 가능하도록 node 전용 모듈을 쓰지 않는다.

const isProd = process.env.NODE_ENV === 'production';

function resolve(candidates: (string | undefined)[], devFallback: string): string | null {
  for (const c of candidates) if (c) return c;
  return isProd ? null : devFallback;
}

/** 관리자 세션 서명 키 */
export function adminSecret(): string | null {
  return resolve(
    [process.env.ADMIN_SECRET, process.env.MEMBERSHIP_SECRET, process.env.SUPABASE_SERVICE_ROLE_KEY],
    'gwaa-dev-admin-secret',
  );
}

/** 회원 세션·회원증 QR 서명 키 */
export function membershipSecret(): string | null {
  return resolve(
    [process.env.MEMBERSHIP_SECRET, process.env.SUPABASE_SERVICE_ROLE_KEY],
    'gwaa-dev-membership-secret',
  );
}

/** 현장 체크인 스텝 코드 — 운영에서는 STAFF_CODE 환경변수 필수 */
export function staffCode(): string | null {
  return resolve([process.env.STAFF_CODE], 'petscout2026');
}
