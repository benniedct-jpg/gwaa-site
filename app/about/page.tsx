import PageHero from '@/components/shared/PageHero';
import SeoTags from '@/components/ui/SeoTags';
import AboutContent from '@/components/sections/about/AboutContent';

export const metadata = {
  title: '협회 소개 | GWAA 강원도반려동물협회',
  description: '2021년부터 강원도 반려동물 문화를 이끌어온 사단법인 강원도반려동물협회 GWAA를 소개합니다.',
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="ABOUT GWAA"
        title="반려동물과 함께"
        titleAccent="강원도"
        desc="2021년부터 강원도 반려동물 문화를 이끌어온 사단법인 강원도반려동물협회 GWAA입니다."
      />
      <AboutContent />
      <section style={{ padding: '40px 60px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <SeoTags page="about" />
      </section>
    </>
  );
}
