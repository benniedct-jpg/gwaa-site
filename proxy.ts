import { NextRequest, NextResponse } from 'next/server';

import { adminSecret } from '@/lib/security/secrets';

const COOKIE = 'gwaa_admin_auth';

// Edge 런타임용 HMAC 검증 (lib/adminAuth.ts의 node 버전과 동일한 서명·페이로드)
function bytesToB64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function verifyAdminEdge(token?: string): Promise<boolean> {
  const SECRET = adminSecret();
  if (!SECRET) return false; // 운영에서 비밀키 미설정 → 관리자 접근 전면 차단
  const parts = (token || '').split('.');
  if (parts.length !== 2) return false;
  const [p, sig] = parts;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(p));
  if (bytesToB64url(new Uint8Array(mac)) !== sig) return false;
  try {
    const json = JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/')));
    return json.t === 'a' && typeof json.e === 'number' && Math.floor(Date.now() / 1000) <= json.e;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  // 대표주소 통합: 광고·검색 유입이 옛 주소로 와도 브랜드주소로 (308). API는 matcher에서 제외됨.
  if ((req.headers.get('host') || '') === 'gwaa-site.vercel.app') {
    const url = req.nextUrl.clone();
    url.protocol = 'https:';
    url.host = 'gwaa.or.kr';
    url.port = '';
    return NextResponse.redirect(url, 308);
  }

  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin/login')) return NextResponse.next();

  if (pathname.startsWith('/admin')) {
    const auth = req.cookies.get(COOKIE)?.value;
    if (!(await verifyAdminEdge(auth))) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // 페이지 경로 전체(대표주소 통합용) + /admin 보호. API·정적파일은 제외(웹훅 등 보호).
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
