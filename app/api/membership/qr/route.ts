import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { dbGet } from '@/lib/db/serverDB';
import { readToken, signQrToken } from '@/lib/membership/token';
import { siteUrl } from '@/lib/email';

// 로그인 회원의 동적 QR PNG — 60초마다 만료되는 토큰을 담아 캡처·공유 방지
export async function GET(req: NextRequest) {
  const tok = req.cookies.get('gwaa_member')?.value;
  const s = tok ? readToken(tok, 's') : null;
  if (!s || s.expired) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const m = (await dbGet('members', s.memberId)) as Record<string, unknown> | null;
  if (!m || m.status !== 'active') return NextResponse.json({ error: 'inactive' }, { status: 403 });

  const qtok = signQrToken(m.id as number, 60);
  const url = `${siteUrl()}/m/${qtok}`;
  const png = await QRCode.toBuffer(url, { width: 520, margin: 1, errorCorrectionLevel: 'M' });
  return new NextResponse(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' },
  });
}
