import PageHero from '@/components/shared/PageHero';
import SeoTags from '@/components/ui/SeoTags';
import EventsContent from '@/components/sections/events/EventsContent';
import { fetchStore } from '@/lib/db/serverFetch';
import { EventCard, ArchiveEvent } from '@/types';

export const revalidate = 60;

export const metadata = {
  title: '행사 | GWAA 강원도반려동물협회',
  description: '강원도 전역에서 펼쳐지는 반려동물 행사와 지난 행사 아카이브를 확인하세요.',
  openGraph: {
    title: '행사 | GWAA 강원도반려동물협회',
    description: '강원도 전역에서 펼쳐지는 반려동물 행사와 지난 행사 아카이브를 확인하세요.',
    url: 'https://gwaa.or.kr/events',
    siteName: 'GWAA 강원도반려동물협회',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default async function EventsPage() {
  const [events, archives] = await Promise.all([
    fetchStore<EventCard>('event_cards'),
    fetchStore<ArchiveEvent>('archive_events'),
  ]);

  return (
    <>
      <PageHero
        eyebrow="EVENTS"
        title="우리 애랑 뭐 하고 놀지,"
        titleAccent="여기 다 있어요"
        desc="5년째, 강원 11곳에서 4만 명이 함께 만들어온 반려생활. 다음 이야기엔 당신 자리도 있어요."
      />
      <EventsContent initialEvents={events} initialArchives={archives} />
      <section style={{ padding: '40px 60px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <SeoTags page="events" />
      </section>
    </>
  );
}
