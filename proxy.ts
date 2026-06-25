import { NextRequest, NextResponse } from 'next/server';

const COOKIE = 'gwaa_admin_auth';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin/login')) return NextResponse.next();

  if (pathname.startsWith('/admin')) {
    const auth = req.cookies.get(COOKIE)?.value;
    if (auth !== 'granted') {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
