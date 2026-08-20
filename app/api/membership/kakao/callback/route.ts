import { NextRequest, NextResponse } from 'next/server';
import { dbGetAll } from '@/lib/db/serverDB';
import { signSession } from '@/lib/membership/token';

// 전화번호 정규화: "+82 10-1234-5678" / "010-1234-5678" → "01012345678"
function normPhone(p?: string | null): string {
  if (!p) return '';
  let d = p.replace(/[^0-9]/g, '');
  if (d.startsWith('82')) d = '0' + d.slice(2);
  return d;
}

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  const back = (e: string) => NextResponse.redirect(`${origin}/membership?error=${e}`);

  const code = req.nextUrl.searchParams.get('code');
  if (!code) return back('kakao');

  const restKey = process.env.KAKAO_CLIENT_ID || process.env.KAKAO_REST_KEY;
  const secret = process.env.KAKAO_CLIENT_SECRET || '';
  if (!restKey) return back('config');
  const redirectUri = `${origin}/api/membership/kakao/callback`;

  try {
    // 1) 인가코드 → 액세스 토큰
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: restKey,
        redirect_uri: redirectUri,
        code,
        ...(secret ? { client_secret: secret } : {}),
      }),
    });
    const token = await tokenRes.json();
    if (!token.access_token) return back('kakao');

    // 2) 카카오 사용자 정보(전화번호)
    const meRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const me = await meRes.json();
    const phone = normPhone(me?.kakao_account?.phone_number);
    if (!phone) return back('nophone');

    // 3) 회원 매칭
    const members = (await dbGetAll('members')) as Record<string, unknown>[];
    const member = members.find((m) => normPhone(m.phone as string) === phone);
    if (!member) return back('notmember');
    if (member.status !== 'active') return back('inactive');

    // 4) 세션 발급 → 회원증
    const res = NextResponse.redirect(`${origin}/membership/card`);
    res.cookies.set('gwaa_member', signSession(member.id as number), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch {
    return back('kakao');
  }
}
