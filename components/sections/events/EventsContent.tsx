'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGWAADB } from '@/hooks/useGWAADB';
import { STORES } from '@/lib/db/gwaaDB';
import { EventCard, ArchiveEvent, EventStatus } from '@/types';
import Badge from '@/components/ui/Badge';
import Eyebrow from '@/components/ui/Eyebrow';
import CountUp from '@/components/shared/CountUp';
import { staggerContainer, fadeUp } from '@/lib/animations';
import { PhotoGallery } from '@/components/ui/gallery';
import { useIsMobile } from '@/hooks/useIsMobile';
import { effectiveStatus, pickFlagship, ddayFrom } from '@/lib/eventStatus';

const STATUS_LABELS: Record<EventStatus, string> = {
  live: 'LIVE', soon: 'SOON', upcoming: 'UPCOMING', ended: 'ENDED',
};

const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";

const regionOf = (loc?: string) => {
  const parts = (loc || '').split('·').map((s) => s.trim()).filter(Boolean);
  return parts[parts.length - 1] || '';
};
const firstSentence = (s?: string) => (s || '').split(/[.\n]/)[0].trim();

const GRADIENTS = [
  'linear-gradient(135deg,#e8f5e9,#a5d6a7)',
  'linear-gradient(135deg,#dbeafe,#93c5fd)',
  'linear-gradient(135deg,#fef3c7,#fcd34d)',
  'linear-gradient(135deg,#fce7f3,#f9a8d4)',
  'linear-gradient(135deg,#ede9fe,#c4b5fd)',
  'linear-gradient(135deg,#fff7ed,#fed7aa)',
  'linear-gradient(135deg,#EDFAF8,#BFF3EC)',
  'linear-gradient(135deg,#ecfeff,#a5f3fc)',
];

function sortByDate<T extends { date?: string; order?: number }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => {
    const da = (a.date || '').replace(/[^0-9]/g, '').padEnd(8, '0');
    const db = (b.date || '').replace(/[^0-9]/g, '').padEnd(8, '0');
    if (db !== da) return db > da ? 1 : -1;
    return (b.order || 0) - (a.order || 0);
  });
}

/**
 * 액자형 카드 이미지 — 포스터를 자르지 않고 색-매칭된 프로스티드 배경 위에 통째로 담는다.
 * mode='ratio' : aspectRatio 컨테이너(그리드 카드)
 * mode='fill'  : 부모를 꽉 채움(가로형 카드의 이미지 컬럼 — 부모가 크기 지정)
 */
function CardImage({
  src,
  alt,
  ratio = '4/3',
  mode = 'ratio',
  gradient = 'linear-gradient(135deg,#e8f5e9,#c8e6c9)',
  radius = 8,
}: {
  src?: string | null;
  alt: string;
  ratio?: string;
  mode?: 'ratio' | 'fill';
  gradient?: string;
  radius?: number;
}) {
  const shell: React.CSSProperties =
    mode === 'fill'
      ? { position: 'absolute', inset: 0 }
      : { position: 'relative', aspectRatio: ratio };

  if (!src) {
    return (
      <div style={{ ...shell, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: '#9ca3af', letterSpacing: '0.1em' }}>사진 준비 중</span>
      </div>
    );
  }

  return (
    <div style={{ ...shell, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef0f2' }}>
      {/* 색-매칭 프로스티드 배경 */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'blur(30px) saturate(1.55)', transform: 'scale(1.4)', opacity: 0.5,
      }} />
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.28)' }} />
      {/* 액자에 담긴 포스터/사진 */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{
          position: 'relative', maxWidth: '82%', maxHeight: '84%',
          objectFit: 'contain', borderRadius: radius,
          boxShadow: '0 6px 22px rgba(0,0,0,0.22)', display: 'block',
        }}
      />
    </div>
  );
}

export default function EventsContent({
  initialEvents,
  initialArchives,
}: {
  initialEvents?: EventCard[];
  initialArchives?: ArchiveEvent[];
}) {
  const { data: events } = useGWAADB<EventCard>(STORES.EVENT, initialEvents);
  const { data: archives, loading: archLoading } = useGWAADB<ArchiveEvent>(STORES.ARCHIVE, initialArchives);
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
  const [subEmail, setSubEmail] = useState('');
  const [subDone, setSubDone] = useState(false);
  const isMobile = useIsMobile();
  const px = isMobile ? '20px' : '60px';
  const py = isMobile ? '56px' : '88px';

  const filtered = sortByDate(events);

  // 대표행사 자동 선정(날짜 기반) — 종료 안 된 행사 중 시작일이 가장 임박/진행중인 것
  const flagship = pickFlagship(filtered);
  // 다가오는 행사 = 대표행사 제외 + 종료(날짜지남/수동)된 행사 제외(종료 행사는 아래 "지금까지 함께한 날들"로)
  const otherUpcoming = filtered.filter((e) => e !== flagship && effectiveStatus(e) !== 'ended');
  const ddayNum = flagship ? ddayFrom(flagship) : null;
  const ddayLabel = ddayNum == null ? '' : ddayNum > 0 ? `D-${ddayNum}` : ddayNum === 0 ? 'TODAY' : 'ENDED';

  const subscribe = async () => {
    if (!subEmail.trim()) return;
    try {
      await fetch('/api/data/subscribers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail.trim(), created_at: new Date().toISOString() }),
      });
    } catch {}
    setSubDone(true); setSubEmail('');
  };

  // ── 지난 행사 = 종료된 상세행사(event_cards, status:'ended') + 아카이브 스토어 병합 ──
  // 날짜(시작일) 앞 8자리(YYYYMMDD) 기준 최신순. 종료된 상세행사는 상세페이지(/events/[id])로 링크해 후기 유지.
  const dateKey8 = (s?: string, y?: number) =>
    (s || String(y ?? '')).replace(/[^0-9]/g, '').slice(0, 8).padEnd(8, '0');
  const yearOf = (s?: string, fallback?: number) => {
    const m = (s || '').match(/\d{4}/);
    return m ? Number(m[0]) : (fallback ?? new Date().getFullYear());
  };
  // 정렬키/연도: 정확한 종료일(end_date)·시작일 우선 → date_text 폴백 (date_text가 "2026년"처럼 불완전해도 정확히 정렬)
  const eventKey8 = (e: EventCard) => {
    const d = e.endDate || e.startDate;
    return d ? d.replace(/[^0-9]/g, '').slice(0, 8).padEnd(8, '0') : dateKey8(e.date);
  };
  const eventYear = (e: EventCard) => {
    const d = e.endDate || e.startDate;
    return d ? Number(d.slice(0, 4)) : yearOf(e.date);
  };

  type PastItem = {
    key: string; href: string; title: string; loc?: string; year: number;
    date?: string; thumb?: string | null; ppl?: string | number; feat?: boolean; sortKey: string;
  };

  const endedEvents: PastItem[] = filtered
    .filter((e) => effectiveStatus(e) === 'ended')
    .map((e) => ({
      key: `ev-${e.id ?? e.order}`,
      href: `/events/${e.id ?? e.order}`,
      title: e.title,
      loc: e.loc,
      year: eventYear(e),
      date: e.date,
      thumb: e.imageData || (e.images && e.images[0]) || null,
      feat: false,
      sortKey: eventKey8(e),
    }));

  const archiveItems: PastItem[] = [...archives].map((a) => ({
    key: `arc-${a.id ?? a.order}`,
    href: `/events/archive/${a.id ?? a.order}`,
    title: a.title,
    loc: a.loc,
    year: a.year,
    date: a.date,
    thumb: a.imageData || (a.images && a.images[0]) || null,
    ppl: a.ppl,
    feat: a.feat,
    sortKey: dateKey8(a.date, a.year),
  }));

  const sortedPast = [...endedEvents, ...archiveItems].sort((a, b) => {
    if (b.sortKey !== a.sortKey) return b.sortKey > a.sortKey ? 1 : -1;
    return 0;
  });

  const years = [...new Set(sortedPast.map((p) => p.year))].sort((a, b) => b - a);

  const filteredArchives =
    yearFilter === 'all' ? sortedPast : sortedPast.filter((p) => p.year === yearFilter);

  return (
    <>
      {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 0,
        }}>
          {[
            { value: 90,    suffix: '회+', label: '함께 만든 행사', unit: '' },
            { value: 40000, suffix: '+',  label: '함께한 반려인', unit: '명' },
            { value: 11,    suffix: '',   label: '발 닿은 강원',   unit: '곳' },
            { value: 5,     suffix: '',   label: '쉬지 않은 해',   unit: '년' },
          ].map((stat, i) => {
            const isLastInRow = isMobile ? i % 2 === 1 : i === 3;
            const isTopRow = isMobile && i < 2;
            return (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              custom={i * 0.08}
              style={{
                textAlign: 'center',
                padding: isMobile ? '36px 20px' : '52px 0',
                borderRight: isLastInRow ? 'none' : '1px solid #e5e7eb',
                borderBottom: isTopRow ? '1px solid #e5e7eb' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2, marginBottom: 8 }}>
                <span style={{ fontFamily: BEBAS, fontSize: isMobile ? 'clamp(36px,9vw,52px)' : 'clamp(48px,5.5vw,64px)', color: '#12A79D', lineHeight: 1 }}>
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </span>
                <span style={{ fontFamily: MONO, fontSize: 13, color: '#12A79D', letterSpacing: '0.04em', marginLeft: 2 }}>
                  {stat.unit}
                </span>
              </div>
              <p style={{ fontFamily: MONO, fontSize: 12, color: '#6b7280', letterSpacing: '0.02em', margin: 0 }}>
                {stat.label}
              </p>
            </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Photo Gallery */}
      <div style={{ background: '#fff', padding: isMobile ? '32px 20px 12px' : '48px 60px 16px' }}>
        <p style={{ fontFamily: MONO, fontSize: 11, color: '#12A79D', letterSpacing: '0.08em', fontWeight: 700, margin: '0 0 6px' }}>OUR MOMENTS</p>
        <h2 style={{ fontFamily: BEBAS, fontSize: isMobile ? 24 : 32, color: '#111', letterSpacing: '0.02em', margin: 0 }}>우리가 함께 만든 장면들</h2>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: '6px 0 0' }}>드래그해서 구경하세요.</p>
      </div>
      <PhotoGallery animationDelay={0.3} />

      {/* ── Upcoming Events ────────────────────────────────────────────────── */}
      <section id="upcoming" style={{ padding: `${py} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
            <Eyebrow text="UPCOMING EVENTS" />
            <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(26px, 5.5vw, 52px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1, marginBottom: 10 }}>
              다가오는 행사
            </h2>
          </motion.div>

          {/* 플래그십 스포트라이트 */}
          {flagship && (
            <motion.div variants={fadeUp} style={{ marginBottom: otherUpcoming.length ? (isMobile ? 16 : 20) : 0 }}>
              <Link href={`/events/${flagship.id ?? flagship.order}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 18, overflow: 'hidden', display: isMobile ? 'block' : 'flex', alignItems: 'stretch' }}>
                  {/* 포스터 — 통째로 노출(크롭 없음) · 데스크톱은 왼쪽 */}
                  <div style={{ position: 'relative', flex: isMobile ? undefined : '0 0 44%', background: 'linear-gradient(135deg,#EDFAF8,#D6F5F1)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: isMobile ? 0 : 20 }}>
                    {flagship.imageData
                      ? <img src={flagship.imageData} alt={flagship.title} style={{ width: isMobile ? '100%' : 'auto', maxWidth: '100%', maxHeight: isMobile ? 460 : 420, objectFit: 'contain', display: 'block', borderRadius: isMobile ? 0 : 10 }} />
                      : <div style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(135deg,#12A79D,#0D7E76)' }} />}
                    <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                      {effectiveStatus(flagship) === 'upcoming' && ddayLabel && <span style={{ fontFamily: BEBAS, fontSize: 15, letterSpacing: '0.06em', color: '#fff', background: '#EF7726', padding: '5px 13px', borderRadius: 9999, boxShadow: '0 4px 12px rgba(35,34,32,0.22)' }}>{ddayLabel}</span>}
                      <Badge variant={effectiveStatus(flagship)} />
                    </div>
                  </div>
                  {/* 본문 — 데스크톱은 오른쪽 세로 중앙 */}
                  <div style={{ flex: isMobile ? undefined : 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: isMobile ? '16px 18px 18px' : '32px 40px' }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: '#0D7E76', letterSpacing: '0.1em', fontWeight: 700 }}>UPCOMING EVENT</span>
                    <h3 style={{ fontFamily: BEBAS, fontSize: isMobile ? 'clamp(22px,6vw,28px)' : 'clamp(28px,3vw,40px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1.12, margin: '8px 0 0', wordBreak: 'keep-all' }}>{flagship.title}</h3>
                    {(firstSentence(flagship.desc) || flagship.benefit) && <p style={{ fontSize: isMobile ? 13.5 : 14.5, color: '#374151', lineHeight: 1.6, maxWidth: 640, marginTop: 10, wordBreak: 'keep-all' }}>{firstSentence(flagship.desc) || flagship.benefit}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                      {flagship.date && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0D7E76', background: '#E3F4F2', borderRadius: 9999, padding: '7px 13px' }}>📅 {flagship.date}</span>}
                      {flagship.loc && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#0D7E76', background: '#E3F4F2', borderRadius: 9999, padding: '7px 13px' }}>📍 {regionOf(flagship.loc) || flagship.loc}</span>}
                      {flagship.benefit && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 700, color: '#C9560F', background: '#FFE7D3', borderRadius: 9999, padding: '7px 13px' }}>🎟 {flagship.benefit}</span>}
                    </div>
                    <span style={{ display: 'inline-block', marginTop: 20, background: '#0D7E76', color: '#fff', fontWeight: 700, fontSize: 14, padding: '12px 26px', borderRadius: 9999, alignSelf: 'flex-start' }}>{flagship.ctaText?.includes('예약') ? '예약하기 →' : '자세히 보기 →'}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* 서브 카드 2열 (가로형) */}
          {otherUpcoming.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? 14 : 20 }}>
              {otherUpcoming.map((ev) => (
                <motion.div key={ev.id ?? ev.order} variants={fadeUp} whileHover={!isMobile ? { y: -4 } : undefined} transition={{ duration: 0.2 }} style={{ border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
                  <Link href={`/events/${ev.id ?? ev.order}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100%' }}>
                    <div style={{
                      flex: isMobile ? 'none' : '0 0 42%', position: 'relative',
                      aspectRatio: isMobile ? '3/2' : undefined, minHeight: isMobile ? undefined : 220,
                    }}>
                      <CardImage src={ev.imageData} alt={ev.title} mode="fill" />
                    </div>
                    <div style={{ flex: 1, padding: isMobile ? '16px 16px 18px' : '20px 22px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div><Badge variant={effectiveStatus(ev)} /></div>
                      <p style={{ fontFamily: MONO, fontSize: 11, color: '#9ca3af', letterSpacing: '0.04em', margin: 0 }}>{ev.loc}{ev.date ? ` · ${ev.date}` : ''}</p>
                      <h3 style={{ fontFamily: BEBAS, fontSize: isMobile ? 21 : 23, color: '#111', letterSpacing: '0.02em', lineHeight: 1.1, margin: 0, wordBreak: 'keep-all' }}>{ev.title}</h3>
                      {ev.desc && <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'keep-all' }}>{ev.desc}</p>}
                      <span style={{ fontFamily: MONO, fontSize: 12, color: '#12A79D', fontWeight: 700, marginTop: 'auto', paddingTop: 6 }}>자세히 보기 →</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* ── 참여 CTA 배너 ──────────────────────────────────────────────────── */}
      <section style={{ background: '#EDFAF8', borderBottom: '1px solid #e5e7eb', padding: isMobile ? '26px 20px' : '30px 60px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontFamily: BEBAS, fontSize: isMobile ? 22 : 26, color: '#111', letterSpacing: '0.02em' }}>다음 행사, 당신 자리 맡아둘게요</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>새 행사가 열리면 제일 먼저 알려드려요.</div>
          </div>
          {subDone ? (
            <div style={{ color: '#12A79D', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>이제 식구예요! 다음 소식 제일 먼저 갈게요.</div>
          ) : (
            <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto' }}>
              <input value={subEmail} onChange={(e) => setSubEmail(e.target.value)} placeholder="이메일 주소" type="email"
                style={{ flex: 1, minWidth: isMobile ? 0 : 240, padding: '11px 16px', border: '1.5px solid #d1d5db', borderRadius: 9999, fontSize: 14, outline: 'none' }} />
              <button onClick={subscribe} style={{ padding: '11px 22px', borderRadius: 9999, background: '#12A79D', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>자리 맡기</button>
            </div>
          )}
        </div>
      </section>

      {/* ── Event Archive ──────────────────────────────────────────────────── */}
      <section id="archive" style={{ background: '#f8fafb', borderBottom: '1px solid #e5e7eb' }}>

        {/* 헤더 */}
        <div style={{ padding: isMobile ? '56px 20px 24px' : '88px 60px 24px' }}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <motion.div variants={fadeUp}>
              <Eyebrow text="EVENT ARCHIVE" />
              <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(26px, 5.5vw, 52px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1, marginBottom: 0 }}>
                지금까지 함께한 날들
              </h2>
            </motion.div>
          </motion.div>
        </div>

        {/* 연도 탭 (sticky) */}
        <div style={{
          position: 'sticky',
          top: 64,
          zIndex: 10,
          background: 'rgba(248,250,251,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e5e7eb',
          borderTop: '1px solid #e5e7eb',
        }}>
          <div style={{
            display: 'flex',
            gap: 0,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            padding: isMobile ? '0 20px' : '0 60px',
          }}>
            {(['all', ...years] as const).map((y) => (
              <button
                key={y}
                onClick={() => setYearFilter(y)}
                style={{
                  padding: '14px 22px',
                  fontSize: 13,
                  fontFamily: MONO,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: yearFilter === y ? '2px solid #12A79D' : '2px solid transparent',
                  color: yearFilter === y ? '#12A79D' : '#9ca3af',
                  transition: 'all 0.18s',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {y === 'all' ? 'ALL' : y}
              </button>
            ))}
          </div>
        </div>

        {/* 아카이브 그리드 */}
        <div style={{ padding: isMobile ? '24px 20px 56px' : '32px 60px 88px' }}>
          {archLoading ? <div style={{ height: 400 }} /> : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                gap: isMobile ? '16px 12px' : '24px 20px',
              }}
            >
              {filteredArchives.map((arc, i) => {
                const thumb = arc.thumb;

                if (arc.feat) {
                  return (
                    <motion.div
                      key={arc.key}
                      variants={fadeUp}
                      custom={i * 0.04}
                      style={{ gridColumn: '1 / -1' }}
                    >
                      <Link href={arc.href} style={{ textDecoration: 'none', display: 'block' }}>
                        <motion.div
                          whileHover={!isMobile ? { y: -3, boxShadow: '0 16px 40px rgba(0,0,0,0.10)' } : undefined}
                          transition={{ duration: 0.2 }}
                          style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            borderRadius: 18,
                            overflow: 'hidden',
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                          }}
                        >
                          {/* 액자형 포스터 */}
                          <div style={{ position: 'relative', flex: isMobile ? 'none' : '0 0 52%', aspectRatio: isMobile ? '16/10' : undefined, minHeight: isMobile ? undefined : 340 }}>
                            <CardImage src={thumb} alt={arc.title} mode="fill" gradient={GRADIENTS[i % GRADIENTS.length]} radius={10} />
                            <div style={{ position: 'absolute', top: 18, left: 18 }}>
                              <span style={{
                                fontFamily: MONO, fontSize: 11, color: '#92400e',
                                background: '#fef3c7', border: '1px solid #fde68a',
                                padding: '4px 10px', borderRadius: 9999, fontWeight: 700, letterSpacing: '0.06em',
                              }}>FEATURED</span>
                            </div>
                          </div>
                          {/* 정보 패널 */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: isMobile ? '22px 22px 26px' : '40px 44px' }}>
                            <p style={{ fontFamily: MONO, fontSize: 12, color: '#12A79D', letterSpacing: '0.12em', margin: '0 0 12px', fontWeight: 700 }}>
                              {arc.year} · {arc.loc}
                            </p>
                            <h3 style={{
                              fontFamily: BEBAS, fontSize: isMobile ? 30 : 'clamp(34px,3.4vw,50px)',
                              color: '#111', letterSpacing: '0.02em', lineHeight: 1.08, margin: '0 0 16px', wordBreak: 'keep-all',
                            }}>
                              {arc.title}
                            </h3>
                            <p style={{ fontFamily: MONO, fontSize: 13, color: '#9ca3af', margin: '0 0 24px' }}>
                              {[arc.ppl ? `${arc.ppl}명 참가` : null, arc.date].filter(Boolean).join(' · ')}
                            </p>
                            <span style={{
                              alignSelf: 'flex-start',
                              fontFamily: MONO, fontSize: 13, color: '#fff', fontWeight: 700,
                              background: '#12A79D', padding: '11px 24px', borderRadius: 9999, letterSpacing: '0.04em',
                            }}>
                              아카이브 보기 →
                            </span>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                }

                return (
                  <motion.div key={arc.key} variants={fadeUp} custom={i * 0.04}>
                    <Link href={arc.href} style={{ textDecoration: 'none', display: 'block' }}>
                      <motion.div
                        whileHover={!isMobile ? { y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' } : undefined}
                        transition={{ duration: 0.18 }}
                        style={{ borderRadius: 12, overflow: 'hidden', background: '#fff', border: '1px solid #e5e7eb' }}
                      >
                        {/* 4:3 액자형 이미지 */}
                        <CardImage src={thumb} alt={arc.title} ratio="4/3" gradient={GRADIENTS[i % GRADIENTS.length]} />
                        {/* 카드 정보 */}
                        <div style={{ padding: isMobile ? '9px 13px 11px' : '11px 15px 13px' }}>
                          <p style={{ fontFamily: MONO, fontSize: 11, color: '#9ca3af', letterSpacing: '0.04em', margin: '0 0 3px' }}>
                            {arc.year} · {arc.loc}
                          </p>
                          <h3 style={{
                            fontFamily: BEBAS, fontSize: isMobile ? 17 : 20,
                            color: '#111', letterSpacing: '0.02em', lineHeight: 1.18,
                            margin: 0, wordBreak: 'keep-all',
                            overflow: 'hidden', display: '-webkit-box',
                            WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const,
                          }}>
                            {arc.title}
                          </h3>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
