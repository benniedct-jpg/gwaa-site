import SurveyClient, { SurveyEvent } from './SurveyClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '행사 만족도 조사 | GWAA 강원도반려동물협회',
  description: '반려동물 문화행사에 참여해 주셔서 감사합니다. 1분 만족도 조사에 참여해 주세요.',
  robots: { index: false, follow: false },
};

async function fetchSurveyEvent(): Promise<SurveyEvent | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const r = await fetch(
      `${url}/rest/v1/event_cards?survey_open=eq.true&select=id,title,date_text&order=start_date.desc&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' },
    );
    if (!r.ok) return null;
    const rows = await r.json();
    const e = rows[0];
    return e ? { id: Number(e.id), title: String(e.title ?? ''), date: String(e.date_text ?? '') } : null;
  } catch {
    return null;
  }
}

export default async function SurveyPage() {
  const event = await fetchSurveyEvent();
  return <SurveyClient event={event} />;
}
