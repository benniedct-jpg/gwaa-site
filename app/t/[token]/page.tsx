import { getByToken } from '@/lib/bookingsDb';
import { siteUrl } from '@/lib/email';
import TicketClient from './TicketClient';

export const dynamic = 'force-dynamic';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";

export default async function TicketPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const booking = /^[a-f0-9]{8,64}$/.test(token) ? await getByToken(token) : null;

  if (!booking || booking.status === 'cancelled') {
    return (
      <div style={{ minHeight: '100vh', background: '#0f1a12', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: MONO }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🎫</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{booking?.status === 'cancelled' ? '취소된 예약입니다' : '유효하지 않은 입장권입니다'}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>잘못된 링크이거나 취소된 예약입니다.<br />문의: 강원도반려동물협회 033-813-0333</div>
        </div>
      </div>
    );
  }

  const qrUrl = `${siteUrl()}/api/tickets/qr?token=${token}`;
  const b = {
    token,
    status: String(booking.status ?? 'pending'),
    name: String(booking.name ?? ''),
    booking_type: String(booking.booking_type ?? ''),
    booking_label: String(booking.booking_label ?? ''),
    date_label: String(booking.date_label ?? ''),
    zone: booking.zone ? String(booking.zone) : '',
    site: booking.site ? String(booking.site) : '',
    headcount: Number(booking.headcount ?? 0),
    pet_name: String(booking.pet_name ?? ''),
    pet_breed: String(booking.pet_breed ?? ''),
    classes: Array.isArray(booking.tshirt_sizes) ? (booking.tshirt_sizes as string[]) : [],
    amount: Number(booking.amount ?? 0),
    checked_in_at: booking.checked_in_at ? String(booking.checked_in_at) : '',
  };

  return <TicketClient b={b} qrUrl={qrUrl} />;
}
