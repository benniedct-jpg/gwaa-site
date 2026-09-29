import ClassesClient from './ClassesClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '웰니스 클래스 현장 신청 · 결제 | Camping with Petscout 2026',
  description: '현장에서 웰니스 클래스를 바로 신청·결제하세요.',
  robots: { index: false, follow: false },
};

export default function ClassesPage() {
  return <ClassesClient />;
}
