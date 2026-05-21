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
