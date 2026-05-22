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
    url: 'https://gwaa-next.vercel.app/events',
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
        title="반려동물과 함께하는"
        titleAccent="행사"
        desc="강원도 전역에서 펼쳐지는 다양한 반려동물 행사를 만나보세요. 트레킹, 캠핑, 문화축제, 교육 행사까지."
      />
      <EventsContent initialEvents={events} initialArchives={archives} />
      <section style={{ padding: '40px 60px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <SeoTags page="events" />
      </section>
    </>
  );
}
