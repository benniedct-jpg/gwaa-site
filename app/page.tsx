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

export default function HomePage() {
  return (
    <>
      <HeroSlideshow />
      <Ticker />
      <StatsBar />
      <ActivityCards />
      <BenefitsPreview />
      <EventsPreview />
      <DailyTip />
      <Lookbook />
      <MateshipCTA />
      <section style={{ padding: '40px 60px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <SeoTags page="index" />
      </section>
    </>
  );
}
