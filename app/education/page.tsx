import PageHero from '@/components/shared/PageHero';
import SeoTags from '@/components/ui/SeoTags';
import EducationContent from '@/components/sections/education/EducationContent';

export const metadata = {
  title: '교육 프로그램 | GWAA 강원도반려동물협회',
  description: '강원도반려동물협회 교육 프로그램 — 어질리티 훈련 클럽(4단계 등급), OB 오비디언스, 반려동물행동지도사 국가자격증, 에티켓 교육.',
  openGraph: {
    title: '교육 프로그램 | GWAA 강원도반려동물협회',
    description: '강원도반려동물협회 교육 프로그램 — 어질리티 훈련 클럽(4단계 등급), OB 오비디언스, 반려동물행동지도사 국가자격증, 에티켓 교육.',
    url: 'https://gwaa.or.kr/education',
    siteName: 'GWAA 강원도반려동물협회',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function EducationPage() {
  return (
    <>
      <PageHero
        eyebrow="EDUCATION · 반려견과 함께 성장"
        title="반려견과 더 가까워지는"
        titleAccent="시간"
        desc="산책이 즐거워지고, 분리불안이 줄고, 유대감이 깊어져요. 어질리티 · 오비디언스 · 국가자격증까지, 친근한 트레이너와 함께 시작해 보세요."
      />
      <EducationContent />
      <section style={{ padding: '40px 60px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <SeoTags page="education" />
      </section>
    </>
  );
}
