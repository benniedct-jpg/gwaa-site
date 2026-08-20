import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { siteUrl } from '@/lib/email';

// 입장권 QR PNG — 스캔하면 /t/<token> (스텝 확인 화면)으로 이동
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token || !/^[a-f0-9]{8,64}$/.test(token)) {
    return NextResponse.json({ error: 'invalid token' }, { status: 400 });
  }
  const url = `${siteUrl()}/t/${token}`;
  const png = await QRCode.toBuffer(url, { width: 480, margin: 1, errorCorrectionLevel: 'M' });
  return new NextResponse(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
