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

const STATUS_LABELS: Record<EventStatus, string> = {
  live: 'LIVE', soon: 'SOON', upcoming: 'UPCOMING', ended: 'ENDED',
};

const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";

const GRADIENTS = [
  'linear-gradient(135deg,#e8f5e9,#a5d6a7)',
  'linear-gradient(135deg,#dbeafe,#93c5fd)',
  'linear-gradient(135deg,#fef3c7,#fcd34d)',
  'linear-gradient(135deg,#fce7f3,#f9a8d4)',
  'linear-gradient(135deg,#ede9fe,#c4b5fd)',
  'linear-gradient(135deg,#fff7ed,#fed7aa)',
  'linear-gradient(135deg,#f0fdf4,#bbf7d0)',
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

  // 플래그십(펫스카웃 2026) 스포트라이트
  const FLAGSHIP_ID = 3;
  const FLAGSHIP_DATE = '2026-09-04';
  const flagship = filtered.find((e) => (e.id ?? e.order) === FLAGSHIP_ID);
  const otherUpcoming = filtered.filter((e) => (e.id ?? e.order) !== FLAGSHIP_ID);
  const ddayNum = Math.ceil((new Date(FLAGSHIP_DATE + 'T00:00:00').getTime() - Date.now()) / 86400000);
  const ddayLabel = ddayNum > 0 ? `D-${ddayNum}` : ddayNum === 0 ? 'TODAY' : 'ENDED';

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

  // 날짜(시작일) 기준 최신순 정렬 — date 문자열의 앞 8자리(YYYYMMDD), 없으면 연도로 폴백
  const archiveDateKey = (a: ArchiveEvent) =>
    (a.date || String(a.year ?? '')).replace(/[^0-9]/g, '').slice(0, 8).padEnd(8, '0');
  const sortedArchives = [...archives].sort((a, b) => {
    const da = archiveDateKey(a), db = archiveDateKey(b);
    if (db !== da) return db > da ? 1 : -1;          // 최신 날짜 먼저
    return (a.order ?? 999) - (b.order ?? 999);       // 같은 날짜면 수동 순서
  });

  const years = [...new Set(sortedArchives.map((a) => a.year))].sort((a, b) => b - a);

  const filteredArchives =
    yearFilter === 'all'
      ? sortedArchives
      : sortedArchives.filter((a) => a.year === yearFilter);

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
                <span style={{ fontFamily: BEBAS, fontSize: isMobile ? 'clamp(36px,9vw,52px)' : 'clamp(48px,5.5vw,64px)', color: '#16a34a', lineHeight: 1 }}>
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </span>
                <span style={{ fontFamily: MONO, fontSize: 13, color: '#16a34a', letterSpacing: '0.04em', marginLeft: 2 }}>
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
        <p style={{ fontFamily: MONO, fontSize: 11, color: '#16a34a', letterSpacing: '0.08em', fontWeight: 700, margin: '0 0 6px' }}>OUR MOMENTS</p>
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
                <div style={{
                  position: 'relative', aspectRatio: isMobile ? '4/3' : '21/9', borderRadius: 18, overflow: 'hidden',
                  background: flagship.imageData ? `url(${flagship.imageData}) center/cover no-repeat` : 'linear-gradient(135deg,#e8f5e9,#c8e6c9)',
                }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontFamily: BEBAS, fontSize: 14, letterSpacing: '0.06em', color: '#fff', background: '#16a34a', padding: '5px 12px', borderRadius: 9999 }}>{ddayLabel}</span>
                    <Badge variant={flagship.status} />
                  </div>
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: isMobile ? '20px' : '32px 36px' }}>
                    <p style={{ fontFamily: MONO, fontSize: 12, color: '#86efac', letterSpacing: '0.08em', marginBottom: 8 }}>올해 가장 큰 행사 · 2026. 9. 4 — 9. 6 · 강원 고성</p>
                    <h3 style={{ fontFamily: BEBAS, fontSize: isMobile ? 'clamp(28px,8vw,38px)' : 'clamp(40px,5vw,58px)', color: '#fff', letterSpacing: '0.02em', lineHeight: 1.02, margin: 0, wordBreak: 'keep-all' }}>{flagship.title}</h3>
                    <p style={{ fontSize: isMobile ? 13 : 14.5, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, maxWidth: 560, marginTop: 10, wordBreak: 'keep-all' }}>세계잼버리 수련장에서 2박 3일, 반려견과 함께하는 캠핑 페스티벌</p>
                    <span style={{ display: 'inline-block', marginTop: 16, background: '#fff', color: '#16a34a', fontWeight: 700, fontSize: 14, padding: '12px 26px', borderRadius: 9999 }}>지금 예약하기 →</span>
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
                      <div><Badge variant={ev.status} /></div>
                      <p style={{ fontFamily: MONO, fontSize: 11, color: '#9ca3af', letterSpacing: '0.04em', margin: 0 }}>{ev.loc}{ev.date ? ` · ${ev.date}` : ''}</p>
                      <h3 style={{ fontFamily: BEBAS, fontSize: isMobile ? 21 : 23, color: '#111', letterSpacing: '0.02em', lineHeight: 1.1, margin: 0, wordBreak: 'keep-all' }}>{ev.title}</h3>
                      {ev.desc && <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'keep-all' }}>{ev.desc}</p>}
                      <span style={{ fontFamily: MONO, fontSize: 12, color: '#16a34a', fontWeight: 700, marginTop: 'auto', paddingTop: 6 }}>자세히 보기 →</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* ── 참여 CTA 배너 ──────────────────────────────────────────────────── */}
      <section style={{ background: '#f0fdf4', borderBottom: '1px solid #e5e7eb', padding: isMobile ? '26px 20px' : '30px 60px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontFamily: BEBAS, fontSize: isMobile ? 22 : 26, color: '#111', letterSpacing: '0.02em' }}>다음 행사, 당신 자리 맡아둘게요</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>새 행사가 열리면 제일 먼저 알려드려요.</div>
          </div>
          {subDone ? (
            <div style={{ color: '#16a34a', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>이제 식구예요! 다음 소식 제일 먼저 갈게요.</div>
          ) : (
            <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto' }}>
              <input value={subEmail} onChange={(e) => setSubEmail(e.target.value)} placeholder="이메일 주소" type="email"
                style={{ flex: 1, minWidth: isMobile ? 0 : 240, padding: '11px 16px', border: '1.5px solid #d1d5db', borderRadius: 9999, fontSize: 14, outline: 'none' }} />
              <button onClick={subscribe} style={{ padding: '11px 22px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>자리 맡기</button>
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
                  borderBottom: yearFilter === y ? '2px solid #16a34a' : '2px solid transparent',
                  color: yearFilter === y ? '#16a34a' : '#9ca3af',
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
                const thumb = arc.imageData || (arc.images && arc.images[0]) || null;
                const archiveId = arc.id ?? arc.order;

                if (arc.feat) {
                  return (
                    <motion.div
                      key={archiveId}
                      variants={fadeUp}
                      custom={i * 0.04}
                      style={{ gridColumn: '1 / -1' }}
                    >
                      <Link href={`/events/archive/${archiveId}`} style={{ textDecoration: 'none', display: 'block' }}>
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
                            <p style={{ fontFamily: MONO, fontSize: 12, color: '#16a34a', letterSpacing: '0.12em', margin: '0 0 12px', fontWeight: 700 }}>
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
                              background: '#16a34a', padding: '11px 24px', borderRadius: 9999, letterSpacing: '0.04em',
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
                  <motion.div key={archiveId} variants={fadeUp} custom={i * 0.04}>
                    <Link href={`/events/archive/${archiveId}`} style={{ textDecoration: 'none', display: 'block' }}>
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
                            color: '#111', letterSpacing: '0.02em', lineHeight: 1.08,
                            margin: 0,
                            overflow: 'hidden', display: '-webkit-box',
                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
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
