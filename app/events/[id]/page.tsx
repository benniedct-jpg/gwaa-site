import Link from 'next/link';
import type { Metadata } from 'next';
import { dbGet } from '@/lib/db/serverDB';
import { fetchStore } from '@/lib/db/serverFetch';
import { EventCard } from '@/types';
import EventDetailClient from './EventDetailClient';

export const revalidate = 60;

const SITE = 'https://gwaa.or.kr';

const MAP: Record<string, string> = {
  image_data: 'imageData', image_data2: 'imageData2', tag_color: 'tagColor',
  link_text: 'linkText', date_text: 'date', location: 'loc', description: 'desc',
  pet_info: 'petInfo', type_label: 'typeLabel', is_partner: 'isPartner',
  is_main: 'isMain', cta_text: 'ctaText',
  start_date: 'startDate', end_date: 'endDate', seller_open: 'sellerOpen', survey_open: 'surveyOpen',
};
function fromDb(obj: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[MAP[k] ?? k] = v;
  return out;
}

function isConfigured() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!(url && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// 행사 로딩 (본문·메타데이터 공용)
async function getEvent(id: number): Promise<EventCard | null> {
  if (isConfigured()) {
    try {
      const row = await dbGet('event_cards', id);
      return row ? (fromDb(row as Record<string, unknown>) as unknown as EventCard) : null;
    } catch {
      return null;
    }
  }
  const all = await fetchStore<EventCard>('event_cards');
  return all.find((e) => e.id === id) ?? null;
}

// 행사별 SEO 보강값 (정밀 Event 리치결과용 · 날짜/장소/가격/큐레이션설명/FAQ) — 필요 행사만 등록
type EventSeo = {
  start?: string; end?: string; venue?: string; address?: string; price?: number;
  region?: string; desc?: string; faqs?: { q: string; a: string }[];
};
const EVENT_SEO: Record<number, EventSeo> = {
  5: {
    start: '2026-10-17T10:00:00+09:00', end: '2026-10-17T17:00:00+09:00',
    venue: '로아노크광장', address: '강원특별자치도 원주시 봉산동 899-2', price: 0, region: '강원 원주',
    desc: '10월 17일(토), 강원 원주 로아노크광장(봉산동 899-2). 반려동물 문화행사 웰니스클럽 — 웰니스 클래스, 오프리쉬 놀이터, 프리마켓·체험부스와 함께하는 가을 힐링 축제. 누구나 무료 참여. 주최 원주시·주관 GWAA.',
    faqs: [
      { q: '2026 웰니스클럽은 언제, 어디서 열리나요?', a: '2026년 10월 17일(토) 10:00~17:00, 강원 원주 로아노크광장(원주시 봉산동 899-2) 일원에서 열립니다.' },
      { q: '참가비가 있나요?', a: '누구나 무료로 참여할 수 있는 원주시 반려동물 문화행사입니다.' },
      { q: '어떤 프로그램이 있나요?', a: '반려동물 웰니스 클래스, 오프리쉬 놀이터, 프리마켓·체험부스 등 반려견과 함께 쉬어가는 가을 힐링 프로그램이 준비돼 있습니다.' },
      { q: '프리마켓 셀러로 참여할 수 있나요?', a: '네. gwaa.or.kr/sellers 에서 온라인으로 셀러 신청을 받고 있으며, 협회 심사 후 선정 결과를 안내드립니다.' },
    ],
  },
  4: {
    start: '2026-09-13T10:00:00+09:00', end: '2026-09-13T17:00:00+09:00',
    venue: '강릉종합운동장 야외공연장', address: '강원특별자치도 강릉시', price: 0, region: '강원 강릉',
    desc: '9월 13일(일), 강원 강릉. 제4회 강릉시 반려동물 문화축제 올림펫 — 독스포츠 국가대표 도그쇼, 펫캐스트라 콘서트, 반려동물 운동회, 오프리쉬 놀이터, 프리마켓·체험부스, 무료 건강검진·동물등록. 누구나 무료 참여. 주최 강릉시·주관 GWAA.',
    faqs: [
      { q: '2026 올림펫은 언제, 어디서 열리나요?', a: '2026년 9월 13일(일) 10:00~17:00, 강릉종합운동장 야외공연장에서 열립니다.' },
      { q: '참가비가 있나요?', a: '누구나 무료로 참여할 수 있는 강릉시 반려동물 문화축제입니다.' },
      { q: '어떤 프로그램이 있나요?', a: '독스포츠 국가대표 도그쇼, 펫캐스트라 콘서트, 반려동물 운동회, 오프리쉬 놀이터, 프리마켓·체험부스, 미니게임, 포토존, 무료 건강검진·동물등록, ESG 아나바다·펫티켓 후원 캠페인 등이 준비돼 있습니다.' },
      { q: '올림펫 프로그램 시간표는 어떻게 되나요?', a: '11:00 프리스비&IGP, 12:00 국가대표 어질리티 쇼&체험, 13:00 미니게임, 14:00 개막식, 14:10 프리스비&IGP(2), 15:00 어질리티 쇼(2), 16:00 미니게임(2), 16:30 기다리개 대회 순으로 진행되며, 셀러부스·체험부스·오프리쉬·아나바다·펫티켓 후원은 상시 운영됩니다.' },
      { q: '오프리쉬(목줄 풀기) 놀이터는 어떤 게 있나요?', a: '어질리티(소·중형견 15kg 미만 / 대형견 15kg 이상), 반려견 축구, 노즈워크(최대 10분·기본 간식 제공, 알레르기 시 개인간식 필참), 단독 프라이빗·소규모 사회화 오프리쉬 등 테마별 오프리쉬 놀이터가 운영됩니다.' },
      { q: '스탬프 투어 경품 이벤트는 어떻게 참여하나요?', a: '똥 던지기·2m를 맞춰라·반려견 야바위·포토존 인증샷·오프리쉬존 이용·펫티켓 후원 참여 6개 미션의 스탬프를 모두 모아 경품존에서 리플렛을 제시하면 뽑기로 경품을 받을 수 있습니다.' },
      { q: '올림펫 릴스 콘테스트 상금과 참여 방법은?', a: '올림펫 현장에서 촬영한 릴스 영상을 GWAA 공식 인스타그램으로 DM 전송하면 됩니다. 협회 심사(창의성·현장감·반려동물 매력)로 1등을 선정해 상금 50만원과 GWAA 공식 크리에이터 초청 기회를 드립니다. 마감은 9월 14일(월) 24:00, 발표는 9월 셋째 주입니다.' },
      { q: '프리마켓 셀러로 참여할 수 있나요?', a: '네. gwaa.or.kr/sellers 에서 온라인으로 셀러 신청을 받고 있으며, 협회 심사 후 선정 결과를 안내드립니다.' },
    ],
  },
  3: {
    start: '2026-09-04T13:00:00+09:00', end: '2026-09-06T15:00:00+09:00',
    venue: '고성 세계잼버리수련장', address: '강원특별자치도 고성군 토성면 잼버리로 244',
    region: '강원 고성',
    desc: '2026년 9월 4–6일, 강원 고성에서 열린 반려견 동반 캠핑 페스티벌 「Camping with Petscout」 현장 후기. 인디밴드·이박사 라이브, 숲속 사우나, 웰니스 클래스, 오프리쉬까지 — 180여 팀이 함께한 사흘의 기록. GWAA.',
    faqs: [
      { q: '2026 Camping with Petscout는 언제, 어디서 열렸나요?', a: '2026년 9월 4일부터 6일까지, 강원 고성 세계잼버리수련장에서 열렸습니다.' },
      { q: '어떤 프로그램이 있었나요?', a: '인디밴드·이박사 라이브 공연, 캠프파이어, 숲속 사우나, 웰니스 클래스, 반려견 오프리쉬, 도그쇼, 마켓·체험부스 등이 진행됐습니다.' },
    ],
  },
};

function absUrl(path?: string): string | undefined {
  if (!path) return undefined;
  return path.startsWith('http') ? path : `${SITE}${path.startsWith('/') ? '' : '/'}${path}`;
}
function cleanLoc(loc?: string): string {
  // "캠핑 · 강원도" → "강원도" 처럼 지역만 추출(장소 강조)
  if (!loc) return '';
  const parts = loc.split('·').map((s) => s.trim()).filter(Boolean);
  return parts[parts.length - 1] || loc.trim();
}

// ── 행사별 동적 메타데이터 (§E 규칙: 행사명·지역·혜택 강조 / 협회 주소 미노출) ──
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(Number(id));
  if (!event) return { title: '행사를 찾을 수 없어요 | 강원도반려동물협회' };

  const seo = EVENT_SEO[Number(id)] || {};
  const region = seo.region || cleanLoc(event.loc);
  const title = `GWAA ${event.title}${region ? ` — ${region}` : ''} | 강원도반려동물협회`;
  const desc = (seo.desc || event.desc || 'GWAA가 기획한 반려동물 문화행사. 자세한 내용은 페이지에서 확인하세요.')
    .replace(/\s+/g, ' ').trim().slice(0, 155);
  const img = absUrl(event.imageData || (Array.isArray(event.images) ? event.images[0] : undefined));
  const canonical = `/events/${id}`;

  return {
    title,
    description: desc,
    keywords: ['GWAA', event.title, region, '강원도반려동물협회', '반려견 동반 캠핑', '반려동물 축제', '반려견 여행', '웰컴키트'].filter(Boolean).join(','),
    alternates: { canonical },
    openGraph: {
      title, description: desc, url: `${SITE}${canonical}`,
      siteName: 'GWAA 강원도반려동물협회', locale: 'ko_KR', type: 'article',
      images: img ? [{ url: img }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description: desc, images: img ? [img] : undefined },
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  const event = await getEvent(numId);

  if (!event) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 48, color: '#111' }}>행사를 찾을 수 없어요</div>
        <Link href="/events" style={{ padding: '10px 24px', borderRadius: 9999, background: '#12A79D', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>← 행사 목록으로</Link>
      </div>
    );
  }

  // ── Event 구조화데이터(JSON-LD) — 구글/네이버 행사 리치결과 (행사 장소·명·혜택 강조) ──
  const seo = EVENT_SEO[numId] || {};
  const img = absUrl(event.imageData || (Array.isArray(event.images) ? event.images[0] : undefined));
  // 날짜: EVENT_SEO 우선 → DB start_date/end_date 자동 폴백(모든 행사가 날짜 리치결과 확보)
  const startDate = seo.start || (event.startDate ? `${event.startDate}T10:00:00+09:00` : undefined);
  const endDate = seo.end || (event.endDate ? `${event.endDate}T17:00:00+09:00` : undefined);
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org', '@type': 'Event',
    name: event.title,
    description: (event.desc || '').replace(/\s+/g, ' ').trim().slice(0, 300) || undefined,
    url: `${SITE}/events/${numId}`,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    ...(img ? { image: [img] } : {}),
    location: {
      '@type': 'Place',
      name: seo.venue || cleanLoc(event.loc) || '강원특별자치도',
      address: seo.address || { '@type': 'PostalAddress', addressRegion: '강원특별자치도', addressCountry: 'KR' },
    },
    organizer: { '@type': 'Organization', name: 'GWAA (강원도반려동물협회)', url: SITE },
    ...(seo.price != null ? {
      offers: {
        '@type': 'Offer', price: seo.price, priceCurrency: 'KRW',
        url: `${SITE}/events/${numId}`, availability: 'https://schema.org/InStock',
      },
    } : {}),
  };

  // ── FAQ 구조화데이터(JSON-LD) — AI 검색·구글 FAQ 리치결과 (등록된 행사만) ──
  const faqJsonLd = seo.faqs?.length ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: seo.faqs.map((f) => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}
      <EventDetailClient event={event} />
    </>
  );
}
