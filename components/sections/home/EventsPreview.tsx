'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGWAADB } from '@/hooks/useGWAADB';
import { STORES } from '@/lib/db/gwaaDB';
import { EventCard } from '@/types';
import Badge from '@/components/ui/Badge';
import Eyebrow from '@/components/ui/Eyebrow';
import { staggerContainer, fadeUp } from '@/lib/animations';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CardSkeleton } from '@/components/ui/Skeleton';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";

// 플래그십(올해 가장 큰 행사) = 2026 Camping with Petscout
const FLAGSHIP_ID = 3;
const FLAGSHIP_DATE = '2026-09-04';

export default function EventsPreview({ initialData }: { initialData?: EventCard[] }) {
  const { data: events, loading } = useGWAADB<EventCard>(STORES.EVENT, initialData);
  const isMobile = useIsMobile();
  const px = isMobile ? '20px' : '60px';

  const sorted = [...events].sort((a, b) => {
    const da = (a.date || '').replace(/[^0-9]/g, '').padEnd(8, '0');
    const db = (b.date || '').replace(/[^0-9]/g, '').padEnd(8, '0');
    if (db !== da) return db > da ? 1 : -1;
    return (b.order || 0) - (a.order || 0);
  });

  const flagship = sorted.find((e) => (e.id ?? e.order) === FLAGSHIP_ID);
  // 종료(ended) 행사·플래그십 제외 → 나머지 다가오는 행사
  const others = sorted.filter((e) => (e.id ?? e.order) !== FLAGSHIP_ID && e.status !== 'ended');

  const ddayNum = Math.ceil((new Date(FLAGSHIP_DATE + 'T00:00:00').getTime() - Date.now()) / 86400000);
  const ddayLabel = ddayNum > 0 ? `D-${ddayNum}` : ddayNum === 0 ? 'TODAY' : 'ENDED';

  return (
    <section style={{ padding: `${isMobile ? '56px' : '88px'} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#f8fafb' }}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          marginBottom: 28,
          gap: 12,
        }}>
          <motion.div variants={fadeUp}>
            <Eyebrow text="UPCOMING EVENTS" />
            <h2 style={{
              fontFamily: BEBAS,
              fontSize: isMobile ? 32 : 'clamp(26px, 5.5vw, 52px)',
              color: '#111', letterSpacing: '0.02em', lineHeight: 1,
              marginBottom: 4,
            }}>
              다가오는 행사
            </h2>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, fontWeight: 400 }}>
              강원도 곳곳에서 펼쳐지는 반려동물 행사를 만나보세요.
            </p>
          </motion.div>
          <Link
            href="/events"
            style={{
              fontFamily: MONO, fontSize: 13,
              color: '#4b5563', letterSpacing: '0.02em', flexShrink: 0,
              whiteSpace: 'nowrap', paddingTop: isMobile ? 4 : 0,
            }}
          >
            전체 보기 →
          </Link>
        </div>

        {loading ? (
          <CardSkeleton aspectRatio={isMobile ? '4/3' : '21/9'} />
        ) : (
          <>
            {/* 플래그십 스포트라이트 — 펫스카웃 강조 */}
            {flagship && (
              <motion.div variants={fadeUp} style={{ marginBottom: others.length ? (isMobile ? 16 : 20) : 0 }}>
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

            {/* 나머지 다가오는 행사 (종료행사 제외) */}
            {others.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : `repeat(${Math.min(others.length, 3)}, 1fr)`,
                gap: isMobile ? 14 : 20,
              }}>
                {others.slice(0, 3).map((ev, i) => (
                  <motion.div
                    key={ev.id ?? i}
                    variants={fadeUp}
                    custom={i * 0.06}
                    whileHover={!isMobile ? { y: -5, boxShadow: '0 12px 36px rgba(0,0,0,0.1)' } : undefined}
                    style={{ borderRadius: 14, overflow: 'hidden', transition: 'box-shadow 0.25s' }}
                  >
                    <Link href={`/events/${ev.id}`} style={{ textDecoration: 'none', display: 'block', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
                      {/* Image */}
                      <div style={{
                        aspectRatio: isMobile ? '16/9' : '16/10',
                        background: ev.imageData
                          ? `url(${ev.imageData}) center/cover no-repeat`
                          : 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                        padding: 12,
                      }}>
                        <Badge variant={ev.status} />
                      </div>
                      <div style={{ padding: '16px 18px 20px' }}>
                        <h3 style={{
                          fontFamily: BEBAS,
                          fontSize: 18, letterSpacing: '0.02em',
                          color: '#111', marginBottom: 8, lineHeight: 1.1,
                        }}>
                          {ev.title}
                        </h3>
                        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, fontFamily: MONO }}>
                          📅 {ev.date}
                        </p>
                        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10, fontFamily: MONO }}>
                          📍 {ev.loc}
                        </p>
                        {ev.benefit && (
                          <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>
                            ⭐ {ev.benefit}
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </section>
  );
}
