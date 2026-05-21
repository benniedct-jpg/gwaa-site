import PageHero from '@/components/shared/PageHero';
import SeoTags from '@/components/ui/SeoTags';
import TravelContent from '@/components/sections/travel/TravelContent';
import { fetchStore } from '@/lib/db/serverFetch';
import { TravelPlace } from '@/types';

export const revalidate = 60;

export const metadata = {
  title: '반려동물 여행 | GWAA 강원도반려동물협회',
  description: '강원도 반려동물 동반 여행 가이드. 18개 지역별 카페, 호텔, 캠핑, 공원 정보를 제공합니다.',
};

export default async function TravelPage() {
  const places = await fetchStore<TravelPlace>('travel_places');

  return (
    <>
      <PageHero
        eyebrow="PET-FRIENDLY TRAVEL"
        title="강원도 반려동물"
        titleAccent="여행 가이드"
        desc="강원도 전역의 반려동물 동반 가능한 카페, 호텔, 캠핑장, 공원, 관광지를 소개합니다."
      />
      <TravelContent initialData={places} />
      <section style={{ padding: '40px 60px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <SeoTags page="travel" />
      </section>
    </>
  );
}
