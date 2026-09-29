import type { MetadataRoute } from 'next';

// PWA 매니페스트 — iOS/안드로이드 홈 화면 추가·아이콘. 브랜드색 틸.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GWAA 강원도반려동물협회',
    short_name: 'GWAA',
    description: '반려동물 행사·교육·메이트십·여행을 한곳에서. 강원에서 전국으로.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#12A79D',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
