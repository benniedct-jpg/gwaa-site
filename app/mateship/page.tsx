import Link from 'next/link';
import PageHero from '@/components/shared/PageHero';
import SeoTags from '@/components/ui/SeoTags';
import MateshipContent from '@/components/sections/mateship/MateshipContent';

export const metadata = {
  title: '메이트쉽 | GWAA 강원도반려동물협회',
  description: '강원도반려동물협회 메이트쉽 멤버십. 숙박·카페·캠핑·사료·간식까지 7가지 혜택으로 연간 40만원 이상 절약하는 스마트한 반려생활.',
  openGraph: {
    title: '메이트쉽 | GWAA 강원도반려동물협회',
    description: '강원도반려동물협회 메이트쉽 멤버십. 숙박·카페·캠핑·사료·간식까지 7가지 혜택으로 연간 40만원 이상 절약하는 스마트한 반려생활.',
    url: 'https://gwaa.or.kr/mateship',
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
        title="강원 반려생활, 혼자 말고"
        titleAccent="우리랑 같이"
        desc="4만 반려인이 먼저 식구가 됐어요. 숙박·카페·캠핑·사료까지 회원가로, 1년이면 40만원이 가벼워져요."
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Link
            href="/mateship#join"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 28px', borderRadius: 9999,
              background: '#16a34a', color: '#fff',
              fontSize: 14, fontWeight: 700, letterSpacing: '0.04em',
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(22,163,74,0.35)',
            }}
          >
            지금 가입하기 →
          </Link>
          <Link
            href="/mateship#calculator"
            style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '13px 28px', borderRadius: 9999,
              background: 'transparent',
              border: '1.5px solid #d1d5db',
              color: '#374151',
              fontSize: 14, fontWeight: 600, letterSpacing: '0.04em',
              textDecoration: 'none',
            }}
          >
            내 절약액 계산하기
          </Link>
        </div>
      </PageHero>
      <MateshipContent />
      <section style={{ padding: '40px 60px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <SeoTags page="mateship" />
      </section>
    </>
  );
}
