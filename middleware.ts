import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 광고·검색 유입을 브랜드 대표주소로 통합: gwaa-site.vercel.app → gwaa.or.kr (308).
// ※ API(/api)는 리다이렉트 제외 — PortOne 웹훅 등이 vercel.app 주소로 오면 깨지지 않도록.
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  if (host === 'gwaa-site.vercel.app') {
    const url = new URL(req.url);
    url.protocol = 'https:';
    url.host = 'gwaa.or.kr';
    url.port = '';
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  // API·정적파일·이미지·robots·sitemap 제외, 나머지 페이지 경로만 대상
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
