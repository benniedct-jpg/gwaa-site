import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import { sendMailRaw } from '@/lib/email';

// 관리자 전용 커스텀 메일 발송 — 예약자에게 개별 안내(구역 마감·변경 등) 보낼 때.
// 사이트 티켓 메일과 동일한 발송 시스템(MAIL_WEBHOOK_URL → Resend 폴백) 사용.
export async function POST(req: NextRequest) {
  if (!verifyAdmin(req.cookies.get('gwaa_admin_auth')?.value)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }
  const { to, subject, html } = await req.json() as { to?: string; subject?: string; html?: string };
  if (!to || !subject || !html) {
    return NextResponse.json({ error: 'to·subject·html 이 필요합니다.' }, { status: 400 });
  }
  const result = await sendMailRaw(to, subject, html);
  return NextResponse.json(result);
}
