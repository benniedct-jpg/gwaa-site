import type { Metadata } from 'next';
import VetsClient from './VetsClient';

export const metadata: Metadata = {
  title: '강원 동물병원 찾기 — 시군별 162곳 | GWAA 강원도반려동물협회',
  description:
    '강원특별자치도 동물병원 162곳을 시군별로 찾아보세요. 춘천·원주·강릉·속초 등 18개 시군 동물병원 위치와 지도·리뷰 바로가기, 심야 응급 가이드까지.',
  keywords: ['강원 동물병원', '춘천 동물병원', '원주 동물병원', '강릉 동물병원', '속초 동물병원', '동물병원 찾기'],
};

export default function VetsPage() {
  return <VetsClient />;
}
