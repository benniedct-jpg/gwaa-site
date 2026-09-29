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
import { effectiveStatus, pickFlagship, ddayFrom } from '@/lib/eventStatus';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";

// 행사 위치 문자열에서 지역만 추출 ("강릉종합운동장 · 강원 강릉" → "강원 강릉")
const regionOf = (loc?: string) => {
  const parts = (loc || '').split('·').map((s) => s.trim()).filter(Boolean);
  return parts[parts.length - 1] || '';
};
const firstSentence = (s?: string) => (s || '').split(/[.\n]/)[0].trim();

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

  // 대표행사 자동 선정 = 종료 안 된 행사 중 시작일이 가장 임박/진행중인 것
  const flagship = pickFlagship(sorted);
  // 종료(날짜지남/수동)·대표행사 제외 → 나머지 다가오는 행사
  const others = sorted.filter((e) => e !== flagship && effectiveStatus(e) !== 'ended');

  const ddayNum = flagship ? ddayFrom(flagship) : null;
  const ddayLabel = ddayNum == null ? '' : ddayNum > 0 ? `D-${ddayNum}` : ddayNum === 0 ? 'TODAY' : 'ENDED';

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
          <CardSkeleton aspectRatio={isMobile ? '4/3' : '16/10'} />
        ) : (
          <>
            {/* 플래그십 스포트라이트 — 다가오는 대표 행사(자동 선정) */}
            {flagship && (
              <motion.div variants={fadeUp} style={{ marginBottom: others.length ? (isMobile ? 16 : 20) : 0 }}>
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
                    {/* 본문 — 데스크톱은 오른쪽에 세로 중앙 */}
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
                        aspectRatio: isMobile ? '4/3' : '16/10',
                        background: ev.imageData
                          ? `url(${ev.imageData}) center/cover no-repeat`
                          : 'linear-gradient(135deg, #12A79D 0%, #0D7E76 100%)',
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                        padding: 12,
                      }}>
                        <Badge variant={effectiveStatus(ev)} />
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
                          <p style={{ fontSize: 12, color: '#12A79D', fontWeight: 700 }}>
                            ⭐ {ev.benefit}
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* 다가오는 행사가 하나도 없을 때 (모든 행사 종료) — 빈 화면 방지 */}
            {!flagship && others.length === 0 && (
              <motion.div variants={fadeUp} style={{ border: '1.5px dashed #d1d5db', borderRadius: 16, padding: isMobile ? '36px 20px' : '52px 32px', textAlign: 'center', background: '#fff' }}>
                <div style={{ fontSize: 34, marginBottom: 10 }}>🐾</div>
                <h3 style={{ fontFamily: BEBAS, fontSize: isMobile ? 22 : 26, color: '#111', letterSpacing: '0.02em', marginBottom: 8 }}>다음 행사를 준비 중이에요</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 18 }}>새로운 반려동물 행사가 곧 열립니다.<br />지난 행사들의 생생한 순간도 함께 만나보세요.</p>
                <Link href="/events" style={{ display: 'inline-block', background: '#12A79D', color: '#fff', fontWeight: 700, fontSize: 14, padding: '11px 24px', borderRadius: 9999, textDecoration: 'none' }}>지난 행사 보기 →</Link>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </section>
  );
}
