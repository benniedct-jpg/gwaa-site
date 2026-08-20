import { NextRequest, NextResponse } from 'next/server';
import { dbFindBy } from '@/lib/db/serverDB';
import { signSession } from '@/lib/membership/token';

// 회원 로그인 — 전화번호(+이름) 조회 후 세션 발급 (카카오 로그인 연동 시 교체 예정)
export async function POST(req: NextRequest) {
  const { phone, name } = (await req.json()) as { phone?: string; name?: string };
  if (!phone?.trim()) {
    return NextResponse.json({ error: '전화번호를 입력해주세요.' }, { status: 400 });
  }
  const member = (await dbFindBy('members', 'phone', phone.trim())) as Record<string, unknown> | null;
  if (!member) {
    return NextResponse.json({ error: '등록된 회원 정보를 찾을 수 없어요. 협회로 문의해주세요.' }, { status: 404 });
  }
  if (name?.trim() && member.name && member.name !== name.trim()) {
    return NextResponse.json({ error: '이름이 일치하지 않아요.' }, { status: 401 });
  }
  if (member.status !== 'active') {
    return NextResponse.json({ error: '아직 활성 회원이 아니에요. 회비 납부·승인 여부를 협회로 확인해주세요.' }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true, name: member.name, member_no: member.member_no });
  res.cookies.set('gwaa_member', signSession(member.id as number), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
