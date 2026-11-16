import { NextRequest, NextResponse } from 'next/server';

// 카카오 로그인 시작 — 카카오 인증 페이지로 리다이렉트
export async function GET(req: NextRequest) {
  const restKey = process.env.KAKAO_CLIENT_ID || process.env.KAKAO_REST_KEY;
  if (!restKey) {
    return NextResponse.redirect(`${new URL(req.url).origin}/membership?error=config`);
  }
  const origin = new URL(req.url).origin;
  const redirectUri = `${origin}/api/membership/kakao/callback`;
  const url = new URL('https://kauth.kakao.com/oauth/authorize');
  url.searchParams.set('client_id', restKey);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'phone_number');
  // CSRF 방지용 state — 콜백에서 쿠키와 대조 (남의 카카오 인가코드로 로그인시키는 공격 차단)
  const state = crypto.randomUUID();
  url.searchParams.set('state', state);
  const res = NextResponse.redirect(url.toString());
  res.cookies.set('gwaa_kakao_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/membership/kakao',
    maxAge: 600,
  });
  return res;
}
