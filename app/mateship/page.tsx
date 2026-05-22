import PageHero from '@/components/shared/PageHero';
import SeoTags from '@/components/ui/SeoTags';
import MateshipContent from '@/components/sections/mateship/MateshipContent';

export const metadata = {
  title: '메이트쉽 | GWAA 강원도반려동물협회',
  description: '강원도반려동물협회 메이트쉽 멤버십. 연간 40만원 이상 절약하는 스마트한 반려생활.',
  openGraph: {
    title: '메이트쉽 | GWAA 강원도반려동물협회',
    description: '강원도반려동물협회 메이트쉽 멤버십. 연간 40만원 이상 절약하는 스마트한 반려생활.',
    url: 'https://gwaa-next.vercel.app/mateship',
    siteName: 'GWAA 강원도반려동물협회',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function MateshipPage() {
  return (
    <>
      <PageHero
        eyebrow="GWAA MATESHIP"
        title="강원도를 제한 없이"
        titleAccent="메이트쉽"
        desc="연간 40만원 이상 절약하는 스마트한 반려생활. 강원도 전역 제휴업체 할인과 GWAA 프로그램을 회원 가격으로."
      />
      <MateshipContent />
      <section style={{ padding: '40px 60px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <SeoTags page="mateship" />
      </section>
    </>
  );
}
