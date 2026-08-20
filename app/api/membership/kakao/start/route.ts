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
  return NextResponse.redirect(url.toString());
}
