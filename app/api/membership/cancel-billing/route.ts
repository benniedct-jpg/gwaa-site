import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db } from '@/lib/bookingsDb';
import { readToken } from '@/lib/membership/token';

// 로그인한 회원 본인의 정기결제(자동청구) 해지 — billing_key 제거. 남은 유효기간까지는 회원 자격 유지.
export async function POST(req: NextRequest) {
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });

  const tok = req.cookies.get('gwaa_member')?.value;
  const s = tok ? readToken(tok, 's') : null;
  if (!s || s.expired) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { error } = await db().from('members')
    .update({ billing_key: null, note: '정기결제 해지(회원 요청)' })
    .eq('id', s.memberId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
