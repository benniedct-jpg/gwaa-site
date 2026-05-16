import { NextRequest, NextResponse } from 'next/server';

const COOKIE = 'gwaa_admin_auth';
const MAX_AGE = 60 * 60 * 8; // 8시간

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const correct = process.env.ADMIN_PASSWORD;

  if (!correct) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.' }, { status: 500 });
  }

  if (password !== correct) {
    return NextResponse.json({ error: '비밀번호가 틀렸습니다.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, 'granted', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
