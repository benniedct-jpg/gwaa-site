import type { Metadata } from 'next';
import PageHero from '@/components/shared/PageHero';
import TipsClient from './TipsClient';
import { PET_TIPS } from '@/lib/petTips';

const SITE = 'https://gwaa.or.kr';

export const metadata: Metadata = {
  title: '반려동물 꿀팁 모음 — 강아지·고양이 건강·산책·계절 관리 | GWAA',
  description: '강아지·고양이 건강, 산책, 영양, 훈련, 여름·겨울 계절 관리, 응급 대처까지. 강원도반려동물협회가 정리한 반려동물 생활 꿀팁 모음.',
  keywords: '반려동물 꿀팁,강아지 건강,고양이 건강,강아지 산책,반려견 훈련,여름 산책,강아지 발바닥,고양이 화장실,반려동물 응급,GWAA',
  alternates: { canonical: '/tips' },
  openGraph: {
    title: '반려동물 꿀팁 모음 | GWAA 강원도반려동물협회',
    description: '건강·산책·영양·훈련·계절·응급까지, 반려동물 생활 꿀팁을 한곳에.',
    url: `${SITE}/tips`, type: 'website',
  },
};

export default function TipsPage() {
  // ItemList 구조화데이터 (검색 노출)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '반려동물 꿀팁 모음',
    itemListElement: PET_TIPS.map((t, i) => ({
      '@type': 'ListItem', position: i + 1, name: t.title, description: t.text,
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        eyebrow="PET TIPS"
        title="반려동물 꿀팁"
        titleAccent="모음집"
        desc="건강·산책·영양·훈련·계절·응급까지. 우리 아이와의 하루가 더 건강해지는 생활 꿀팁을 모았어요."
      />
      <TipsClient />
    </>
  );
}
