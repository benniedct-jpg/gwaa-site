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
  3: {
    start: '2026-09-04T13:00:00+09:00', end: '2026-09-06T15:00:00+09:00',
    venue: '고성 세계잼버리수련장', address: '강원특별자치도 고성군 토성면 잼버리로 244',
    price: 135000, region: '강원 고성',
    desc: '9월 4–6일, 강원 고성. 반려견과 텐트에서 3일을 보내는 캠핑 페스티벌. 인디밴드·이박사 라이브, 숲속 사우나, 웰니스 클래스, 예약자 전원 웰컴키트. 반려견 없이도 참여 가능. GWAA.',
    faqs: [
      { q: '2026 Camping with Petscout는 언제, 어디서 열리나요?', a: '2026년 9월 4일부터 6일까지, 강원 고성 세계잼버리수련장에서 열립니다.' },
      { q: '반려견 없이도 참여할 수 있나요?', a: '네. 반려견과 함께가 아니어도 누구나 참여할 수 있습니다.' },
      { q: '예약하면 어떤 혜택이 있나요?', a: '예약자 전원에게 웰컴키트를 드립니다. 인디밴드·이박사 라이브 공연, 숲속 사우나, 웰니스 클래스를 함께 즐길 수 있습니다.' },
      { q: '참가비는 어떻게 되나요?', a: '2박 3일 캠핑은 텐트(사이트) 단위로 기본 2인 포함 135,000원부터이며, 존과 인원에 따라 달라집니다. 당일권은 1인 20,000원입니다.' },
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
        <Link href="/events" style={{ padding: '10px 24px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>← 행사 목록으로</Link>
      </div>
    );
  }

  // ── Event 구조화데이터(JSON-LD) — 구글/네이버 행사 리치결과 (행사 장소·명·혜택 강조) ──
  const seo = EVENT_SEO[numId] || {};
  const img = absUrl(event.imageData || (Array.isArray(event.images) ? event.images[0] : undefined));
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org', '@type': 'Event',
    name: event.title,
    description: (event.desc || '').replace(/\s+/g, ' ').trim().slice(0, 300) || undefined,
    url: `${SITE}/events/${numId}`,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    ...(seo.start ? { startDate: seo.start } : {}),
    ...(seo.end ? { endDate: seo.end } : {}),
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
