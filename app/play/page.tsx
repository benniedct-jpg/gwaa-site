import type { Metadata } from 'next';
import TravelTypeQuiz from '@/components/sections/play/TravelTypeQuiz';
import { getType } from '@/lib/play/travelTypes';

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

function codeOf(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

// 공유된 결과 링크(/play?r=코드)는 그 유형 이름이 미리보기 제목으로 보이게 한다.
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const type = getType(codeOf((await searchParams).r));
  const title = type
    ? `${type.emoji} ${type.name} | 댕댕이 강원 여행 유형 테스트`
    : '댕댕이 강원 여행 유형 테스트 | GWAA';
  const description = type
    ? `“${type.tagline}” — 우리 아이는 어떤 강원 여행자일까? 질문 6개로 1분 만에 확인해 보세요.`
    : '우리 아이는 어떤 강원 여행자일까? 질문 6개로 알아보는 반려견 여행 유형 테스트. 결과에 맞는 강원도 여행 스타일까지 알려드려요.';
  return {
    title,
    description,
    alternates: { canonical: '/play' },
    openGraph: {
      title, description, url: 'https://gwaa.or.kr/play',
      siteName: 'GWAA 강원도반려동물협회',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
      locale: 'ko_KR', type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function PlayPage({ searchParams }: Props) {
  const code = codeOf((await searchParams).r);
  return <TravelTypeQuiz sharedCode={getType(code)?.code} />;
}
