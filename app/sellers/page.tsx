import SellersClient, { OpenEvent } from './SellersClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '프리마켓 셀러 모집 · 신청 | GWAA 강원도반려동물협회',
  description: '반려동물 문화행사 프리마켓 셀러를 모집합니다. 온라인으로 간편하게 신청하세요.',
};

async function fetchOpenEvents(): Promise<OpenEvent[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];
  try {
    const r = await fetch(
      `${url}/rest/v1/event_cards?seller_open=eq.true&select=id,title,date_text,location&order=date_text.desc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' },
    );
    if (!r.ok) return [];
    const rows = await r.json();
    return (rows as Record<string, unknown>[]).map((e) => ({
      id: Number(e.id),
      title: String(e.title ?? ''),
      date: String(e.date_text ?? ''),
      loc: String(e.location ?? ''),
    }));
  } catch {
    return [];
  }
}

export default async function SellersPage() {
  const events = await fetchOpenEvents();
  return <SellersClient events={events} />;
}
