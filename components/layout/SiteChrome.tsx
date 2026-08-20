'use client';

import { usePathname } from 'next/navigation';
import Nav from '@/components/layout/Nav';
import Footer from '@/components/layout/Footer';
import KakaoFloat from '@/components/layout/KakaoFloat';

// 어드민 경로(/admin)에서는 공개 사이트 Nav·Footer·플로팅 버튼을 숨긴다.
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  if (isAdmin) {
    return <main style={{ flex: 1 }}>{children}</main>;
  }

  return (
    <>
      <Nav />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
      <KakaoFloat />
    </>
  );
}
