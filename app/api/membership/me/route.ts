import { NextRequest, NextResponse } from 'next/server';
import { dbGet } from '@/lib/db/serverDB';
import { readToken } from '@/lib/membership/token';

// 로그인한 회원 본인 정보
export async function GET(req: NextRequest) {
  const tok = req.cookies.get('gwaa_member')?.value;
  const s = tok ? readToken(tok, 's') : null;
  if (!s || s.expired) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const m = (await dbGet('members', s.memberId)) as Record<string, unknown> | null;
  if (!m) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(
    { name: m.name, member_no: m.member_no, status: m.status, region: m.region, joined_at: m.joined_at, expires_at: m.expires_at, recurring: !!m.billing_key },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
