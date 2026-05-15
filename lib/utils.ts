export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function esc(str: string): string {
  return str.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c)
  );
}

export function formatKoreanNumber(n: number): string {
  return n.toLocaleString('ko-KR');
}

export const NAV_MENU = [
  { label: 'ABOUT', href: '/about', children: [
    { label: '협회 소개',        href: '/about#intro' },
    { label: '설립 목적 & 비전', href: '/about#vision' },
    { label: '주요 활동 실적',   href: '/about#activities' },
    { label: '협회 연혁',        href: '/about#history' },
  ]},
  { label: 'EDUCATION', href: '/education', children: [
    { label: '독스포츠 — 어질리티',          href: '/education#dogsports' },
    { label: '오비디언스 교육',              href: '/education#obedience' },
    { label: '반려동물행동지도사 국가자격증', href: '/education#license' },
    { label: '반려동물 에티켓 교육',         href: '/education#etiquette' },
    { label: '교육 신청',                   href: '/education#apply' },
  ]},
  { label: 'EVENTS', href: '/events', children: [
    { label: '다가오는 행사',     href: '/events#upcoming' },
    { label: '지난 행사 아카이브', href: '/events#archive' },
  ]},
  { label: 'MATESHIP', href: '/mateship', children: [
    { label: '멤버십 소개',    href: '/mateship#intro' },
    { label: '연간 절약 계산기', href: '/mateship#calculator' },
    { label: '전체 혜택',      href: '/mateship#benefits' },
    { label: '제휴업체 목록',   href: '/mateship#partners' },
    { label: '가입 방법',      href: '/mateship#join' },
    { label: 'FAQ',           href: '/mateship#faq' },
  ]},
  { label: 'TRAVEL', href: '/travel', children: [
    { label: '반려동물 동반 지도', href: '/travel#map' },
    { label: '전체 장소 보기',   href: '/travel#places' },
  ]},
  { label: 'CONTACT', href: '/contact', children: [
    { label: '연락처',      href: '/contact#channels' },
    { label: '카카오 채널', href: 'https://pf.kakao.com/_wipZX' },
  ]},
];
