import type { Metadata } from 'next';
import { Bebas_Neue, Noto_Sans_KR, Black_Han_Sans, Gothic_A1 } from 'next/font/google';
import './globals.css';
import SiteChrome from '@/components/layout/SiteChrome';
import { Analytics } from '@vercel/analytics/next';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bebas',
});

const notoSansKR = Noto_Sans_KR({
  weight: ['300', '400', '500', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto',
});

const blackHanSans = Black_Han_Sans({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-blackhan',
});

const gothicA1 = Gothic_A1({
  weight: ['700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-gothic',
});

// 검색엔진 소유확인 코드 — Search Console / 네이버 서치어드바이저 등록 후 발급값 입력
const GOOGLE_SITE_VERIFICATION = '';
const NAVER_SITE_VERIFICATION = 'e994b14322c2982f97b845e46c9fc2ab0355cbbb';

// Organization 구조화데이터 — GWAA 브랜드 중심 · 전국 활동 톤 (협회 주소는 넣지 않음 · AI 검색 인용 최적화)
const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'GWAA (강원도반려동물협회)',
  alternateName: ['GWAA', '강원도반려동물협회'],
  url: 'https://gwaa.or.kr',
  logo: 'https://gwaa.or.kr/gwaa-logo.png',
  email: 'ganimal1@naver.com',
  telephone: '+82-33-813-0333',
  description: 'GWAA(강원도반려동물협회)는 반려견과 함께하는 캠핑·트레킹·축제와 반려동물 교육을 기획·운영하는 비영리 단체입니다.',
  areaServed: '대한민국',
  knowsAbout: ['반려동물 문화행사', '반려견 동반 캠핑', '반려동물 페스티벌', '반려동물 교육', '펫 웰니스'],
  sameAs: [
    'https://www.instagram.com/gangwon_animal/',
    'https://pf.kakao.com/_wipZX',
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://gwaa.or.kr'),
  alternates: { canonical: '/' },
  verification: {
    ...(GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : {}),
    ...(NAVER_SITE_VERIFICATION ? { other: { 'naver-site-verification': NAVER_SITE_VERIFICATION } } : {}),
  },
  title: 'GWAA 강원도반려동물협회 | 반려견과 떠나는 캠핑·트레킹·축제',
  description: '반려견과 떠나는 캠핑, 트레킹, 축제 — GWAA가 기획한 행사는 강원 곳곳에서 시작됩니다. 메이트쉽 멤버십, 반려동물 교육까지. 강원도반려동물협회.',
  keywords: 'GWAA,강원도반려동물협회,반려견 캠핑,반려동물 축제,반려견 트레킹,반려견 동반 여행,메이트쉽,반려동물 교육,반려동물행동지도사,오비디언스교육',
  openGraph: {
    title: 'GWAA 강원도반려동물협회 — 반려견과 떠나는 캠핑·트레킹·축제',
    description: '반려견과 떠나는 캠핑, 트레킹, 축제 — GWAA가 기획한 행사는 강원 곳곳에서 시작됩니다.',
    type: 'website',
    url: 'https://gwaa.or.kr',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${bebasNeue.variable} ${notoSansKR.variable} ${blackHanSans.variable} ${gothicA1.variable}`}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <SiteChrome>{children}</SiteChrome>
        <Analytics />
      </body>
    </html>
  );
}
