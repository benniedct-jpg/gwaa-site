import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db } from '@/lib/bookingsDb';
import { registerOrExtendMember } from '@/lib/membership/register';

// 결제 검증: 포트원 결제 단건 조회로 실제 승인·금액을 대조한 뒤 완료 처리
export async function POST(req: NextRequest) {
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });

  const { paymentId } = await req.json() as { paymentId?: string };
  if (!paymentId) return NextResponse.json({ error: '결제 정보가 누락되었습니다.' }, { status: 400 });

  const { data: row, error: findErr } = await db()
    .from('payments').select('*').eq('payment_id', paymentId).single();
  if (findErr || !row) return NextResponse.json({ error: '결제 내역을 찾을 수 없습니다.' }, { status: 404 });
  if (row.status === 'paid') return NextResponse.json({ ok: true, already: true });

  const secret = process.env.PORTONE_API_SECRET;
  if (!secret) {
    return NextResponse.json({ error: '결제 연동 준비 중입니다. (PORTONE_API_SECRET 미설정)' }, { status: 503 });
  }

  // 포트원 결제 단건 조회
  const res = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `PortOne ${secret}` },
  });
  const pay = await res.json();
  if (!res.ok) return NextResponse.json({ error: pay?.message || '결제 조회 실패' }, { status: 402 });

  if (pay?.status !== 'PAID') {
    return NextResponse.json({ error: `결제가 완료되지 않았습니다. (상태: ${pay?.status})` }, { status: 402 });
  }
  if (Number(pay?.amount?.total) !== Number(row.amount)) {
    return NextResponse.json({ error: '결제 금액이 일치하지 않습니다.' }, { status: 400 });
  }

  const { error: upErr } = await db().from('payments')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('payment_id', paymentId);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // 회비 결제면 회원 자동 등록/갱신 (단건 결제 경로)
  let memberRegistered = false;
  if (row.kind === 'membership') {
    memberRegistered = await registerOrExtendMember({
      name: row.name as string, phone: row.phone as string, email: row.email as string,
    });
  }

  return NextResponse.json({ ok: true, memberRegistered });
}
