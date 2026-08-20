import type { Metadata } from 'next';
import HeroSlideshow from '@/components/sections/home/HeroSlideshow';
import Ticker from '@/components/sections/home/Ticker';
import StatsBar from '@/components/sections/home/StatsBar';
import ActivityCards from '@/components/sections/home/ActivityCards';
import BenefitsPreview from '@/components/sections/home/BenefitsPreview';
import EventsPreview from '@/components/sections/home/EventsPreview';
import DailyTip from '@/components/sections/home/DailyTip';
import Lookbook from '@/components/sections/home/Lookbook';
import MateshipCTA from '@/components/sections/home/MateshipCTA';
import SeoTags from '@/components/ui/SeoTags';
import { fetchStore } from '@/lib/db/serverFetch';
import { ActivityCard, EventCard, LookbookItem, HeroImage } from '@/types';

export const metadata: Metadata = {
  title: 'GWAA 강원도반려동물협회',
  description: '강원도 반려동물 문화를 이끄는 사단법인. 행사·교육·메이트쉽·반려동물 여행 가이드.',
  openGraph: {
    title: 'GWAA 강원도반려동물협회',
    description: '강원도 반려동물 문화를 이끄는 사단법인. 행사·교육·메이트쉽·반려동물 여행 가이드.',
    url: 'https://gwaa.or.kr/',
    siteName: 'GWAA 강원도반려동물협회',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export const revalidate = 60;

export default async function HomePage() {
  const [heroes, activities, events, lookbook] = await Promise.all([
    fetchStore<HeroImage>('hero_images'),
    fetchStore<ActivityCard>('activity_cards'),
    fetchStore<EventCard>('event_cards'),
    fetchStore<LookbookItem>('lookbook_items'),
  ]);

  return (
    <>
      <HeroSlideshow initialData={heroes} />
      <Ticker />
      <StatsBar />
      <ActivityCards initialData={activities} />
      <BenefitsPreview />
      <EventsPreview initialData={events} />
      <DailyTip />
      <Lookbook initialData={lookbook} />
      <MateshipCTA />
      <section style={{ padding: '40px 60px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <SeoTags page="index" />
      </section>
    </>
  );
}
