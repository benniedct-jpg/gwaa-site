import { NextRequest, NextResponse } from 'next/server';
import { dbGetAll } from '@/lib/db/serverDB';
import { signSession } from '@/lib/membership/token';
import { normPhone } from '@/lib/membership/register';

// 회원 로그인 — 전화번호 + 이름이 모두 일치해야 세션 발급.
// (전화번호만으로 로그인되면 번호를 아는 누구나 남의 회원증·정기결제 해지에 접근할 수 있음)
// 실패 사유는 구분하지 않고 같은 메시지로 응답 — 전화번호가 회원인지 여부를 외부에서 알아낼 수 없게 함.
const FAIL = '입력하신 정보와 일치하는 회원을 찾을 수 없어요. 이름·전화번호를 확인하거나 협회로 문의해주세요.';

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { phone?: unknown; name?: unknown };
  const phone = normPhone(typeof body.phone === 'string' ? body.phone : '');
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!phone || !name) {
    return NextResponse.json({ error: '이름과 전화번호를 모두 입력해주세요.' }, { status: 400 });
  }

  let members: Record<string, unknown>[] = [];
  try {
    members = (await dbGetAll('members')) as Record<string, unknown>[];
  } catch {
    return NextResponse.json({ error: '잠시 후 다시 시도해주세요.' }, { status: 503 });
  }
  const member = members.find((m) => normPhone(m.phone as string) === phone);
  if (!member || String(member.name ?? '').trim() !== name) {
    return NextResponse.json({ error: FAIL }, { status: 401 });
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
