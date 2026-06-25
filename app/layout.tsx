import type { Metadata } from 'next';
import { Bebas_Neue, Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import Nav from '@/components/layout/Nav';
import Footer from '@/components/layout/Footer';
import KakaoFloat from '@/components/layout/KakaoFloat';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bebas',
});

const notoSansKR = Noto_Sans_KR({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto',
});

export const metadata: Metadata = {
  title: '강원도반려동물협회 GWAA | 반려동물과 함께, 강원도를 제한 없이',
  description: '강원도반려동물협회(GWAA) — 반려동물과 함께, 강원도를 제한 없이. 2021년부터 4만명과 함께한 강원도 대표 반려동물 협회. 메이트쉽 멤버십, 독스포츠·오비디언스 교육, 반려동물행동지도사 자격증 과정.',
  keywords: '강원도반려동물협회,강원도반려동물,GWAA,메이트쉽,독스포츠교육,오비디언스교육,반려동물행동지도사,어질리티',
  openGraph: {
    title: '강원도반려동물협회 GWAA — 반려동물과 함께, 강원도를 제한 없이',
    description: '2021년부터 4만명과 함께한 강원도 대표 반려동물 협회. 메이트쉽 멤버십으로 강원도를 제한 없이 누리세요.',
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
    <html lang="ko" className={`${bebasNeue.variable} ${notoSansKR.variable}`}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Nav />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
        <KakaoFloat />
      </body>
    </html>
  );
}
