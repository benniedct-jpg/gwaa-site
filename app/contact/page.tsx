import PageHero from '@/components/shared/PageHero';
import ContactContent from '@/components/sections/contact/ContactContent';

export const metadata = {
  title: '문의하기 | GWAA 강원도반려동물협회',
  description: '강원도반려동물협회 문의 — 카카오채널, 전화, 이메일로 문의하세요. 033-813-0333',
  openGraph: {
    title: '문의하기 | GWAA 강원도반려동물협회',
    description: '강원도반려동물협회 문의 — 카카오채널, 전화, 이메일로 문의하세요. 033-813-0333',
    url: 'https://gwaa-next.vercel.app/contact',
    siteName: 'GWAA 강원도반려동물협회',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="CONTACT US"
        title="문의"
        titleAccent="하기"
        desc="궁금한 점이 있으시면 언제든지 연락주세요. 카카오채널로 가장 빠르게 응답 드립니다."
      />
      <ContactContent />
    </>
  );
}
