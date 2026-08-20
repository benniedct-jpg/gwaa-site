import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db } from '@/lib/bookingsDb';

// 결제 준비: 결제창 호출 전에 예상 금액을 서버에 기록(금액 위변조 방지용)
export async function POST(req: NextRequest) {
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });

  const body = await req.json() as {
    paymentId?: string; kind?: string; amount?: number;
    name?: string; phone?: string; email?: string; agreePrivacy?: boolean;
  };
  const { paymentId, kind, amount, name, phone, email, agreePrivacy } = body;

  if (!paymentId || !kind || !amount || amount < 1000) {
    return NextResponse.json({ error: '결제 정보가 올바르지 않습니다.' }, { status: 400 });
  }
  if (!name || !phone || !email) {
    return NextResponse.json({ error: '납부자 정보를 모두 입력해 주세요.' }, { status: 400 });
  }
  if (!agreePrivacy) {
    return NextResponse.json({ error: '개인정보 수집·이용에 동의해 주세요.' }, { status: 400 });
  }

  const { error } = await db().from('payments').insert({
    payment_id: paymentId,
    kind,
    amount,
    name, phone, email,
    status: 'pending',
    agree_privacy: !!agreePrivacy,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
