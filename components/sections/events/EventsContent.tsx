'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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

const MONO = "'SF Mono','Menlo','Monaco','Consolas','Courier New',monospace";

function sortByDate<T extends { date?: string; order?: number }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => {
    const da = (a.date || '').replace(/[^0-9]/g, '').padEnd(8, '0');
    const db = (b.date || '').replace(/[^0-9]/g, '').padEnd(8, '0');
    if (db !== da) return db > da ? 1 : -1;
    return (b.order || 0) - (a.order || 0);
  });
}

export default function EventsContent({ initialEvents, initialArchives }: { initialEvents?: EventCard[]; initialArchives?: ArchiveEvent[] }) {
  const { data: events, loading: evLoading } = useGWAADB<EventCard>(STORES.EVENT, initialEvents);
  const { data: archives, loading: archLoading } = useGWAADB<ArchiveEvent>(STORES.ARCHIVE, initialArchives);
  const [filter, setFilter] = useState<'all' | EventStatus>('all');
  const isMobile = useIsMobile();
  const px = isMobile ? '20px' : '60px';
  const py = isMobile ? '56px' : '88px';

  const filtered = sortByDate(
    filter === 'all' ? events : events.filter((e) => e.status === filter)
  );

  const sortedArchives = [...archives].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    const da = (a.date || '').replace(/[^0-9]/g, '').padEnd(8, '0');
    const db = (b.date || '').replace(/[^0-9]/g, '').padEnd(8, '0');
    return db > da ? 1 : -1;
  });

  return (
    <>
      {/* Photo Gallery */}
      <PhotoGallery animationDelay={0.3} />

      {/* Upcoming Events */}
      <section id="upcoming" style={{ padding: `${py} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 32 }}>
            <Eyebrow text="UPCOMING EVENTS" />
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(26px, 5.5vw, 52px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1, marginBottom: 10 }}>
              다가오는 행사
            </h2>
          </motion.div>

          {/* Filter */}
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
            {(['all', 'live', 'soon', 'upcoming', 'ended'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: '8px 18px', borderRadius: 9999, fontSize: 11,
                  fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer',
                  border: '1.5px solid',
                  background: filter === s ? '#16a34a' : 'transparent',
                  color: filter === s ? '#fff' : '#6b7280',
                  borderColor: filter === s ? '#16a34a' : '#d1d5db',
                  transition: 'all 0.2s',
                }}
              >
                {s === 'all' ? '전체' : STATUS_LABELS[s]}
              </button>
            ))}
          </motion.div>

          {evLoading ? <div style={{ height: 300 }} /> : (
            <motion.div layout style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 14 : 20 }}>
              <AnimatePresence mode="popLayout">
                {filtered.map((ev) => (
                  <motion.div
                    key={ev.id ?? ev.order}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    whileHover={!isMobile ? { y: -5, boxShadow: '0 12px 36px rgba(0,0,0,0.1)' } : undefined}
                    style={{ borderRadius: 14, overflow: 'hidden' }}
                  >
                    <Link href={`/events/${ev.id}`} style={{ textDecoration: 'none', display: 'block', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
                      {/* Image */}
                      <div style={{
                        aspectRatio: isMobile ? '16/9' : '1/1',
                        background: ev.imageData ? `url(${ev.imageData}) center/cover no-repeat` : 'linear-gradient(135deg,#e8f5e9,#c8e6c9)',
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 12,
                      }}>
                        <Badge variant={ev.status} />
                      </div>
                      <div style={{ padding: isMobile ? '14px 16px 18px' : '18px 20px 22px' }}>
                        <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: '#111', letterSpacing: '0.02em', marginBottom: 8, lineHeight: 1.1 }}>
                          {ev.title}
                        </h3>
                        <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontFamily: MONO }}>📅 {ev.date}</p>
                        <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 10, fontFamily: MONO }}>📍 {ev.loc}</p>
                        <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, marginBottom: ev.benefit ? 12 : 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{ev.desc}</p>
                        {ev.benefit && <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>{ev.benefit}</p>}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Archive — List */}
      <section id="archive" style={{ padding: `${py} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#f8fafb' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
          <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <Eyebrow text="EVENT ARCHIVE" />
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(26px, 5.5vw, 52px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1, marginBottom: 0 }}>
                지난 행사 아카이브
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: '#f0fdf4', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 12, flexShrink: 0 }}>
              <span style={{ fontSize: 26, fontFamily: "'Bebas Neue', cursive", color: '#16a34a', lineHeight: 1 }}>
                <CountUp value={40000} suffix="+" />
              </span>
              <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.4 }}>2021년부터<br />누적 참가자</span>
            </div>
          </motion.div>

          {archLoading ? <div style={{ height: 400 }} /> : (
            <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {sortedArchives.map((arc, i) => {
                const thumb = arc.imageData || (arc.images && arc.images[0]) || null;
                const gradients = [
                  'linear-gradient(135deg,#e8f5e9,#a5d6a7)',
                  'linear-gradient(135deg,#dbeafe,#93c5fd)',
                  'linear-gradient(135deg,#fef3c7,#fcd34d)',
                  'linear-gradient(135deg,#fce7f3,#f9a8d4)',
                  'linear-gradient(135deg,#ede9fe,#c4b5fd)',
                  'linear-gradient(135deg,#fff7ed,#fed7aa)',
                  'linear-gradient(135deg,#f0fdf4,#bbf7d0)',
                  'linear-gradient(135deg,#ecfeff,#a5f3fc)',
                ];
                const imageCount = arc.images?.length ?? (arc.imageData ? 1 : 0) + (arc.imageData2 ? 1 : 0);
                return (
                  <motion.div key={arc.id ?? i} variants={fadeUp} custom={i * 0.04}>
                    <Link href={`/events/archive/${arc.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                      <motion.div
                        whileHover={!isMobile ? { backgroundColor: '#f0fdf4' } : undefined}
                        transition={{ duration: 0.15 }}
                        style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 24, padding: '16px 0', borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }}
                      >
                        <div style={{ flexShrink: 0, width: isMobile ? 72 : 100, height: isMobile ? 56 : 76, borderRadius: 10, overflow: 'hidden', background: thumb ? `url(${thumb}) center/cover no-repeat` : gradients[i % gradients.length] }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: MONO, fontSize: 10, color: '#fff', fontWeight: 700, letterSpacing: '0.08em', background: '#16a34a', padding: '2px 8px', borderRadius: 9999 }}>{arc.year}</span>
                            <span style={{ fontFamily: MONO, fontSize: 10, color: '#6b7280', letterSpacing: '0.06em' }}>{arc.loc}</span>
                            {arc.feat && (
                              <span style={{ fontFamily: MONO, fontSize: 9, color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a', padding: '2px 7px', borderRadius: 9999, letterSpacing: '0.08em', fontWeight: 700 }}>FEATURED</span>
                            )}
                          </div>
                          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: '#111', letterSpacing: '0.02em', lineHeight: 1.1, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{arc.title}</h3>
                          <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#6b7280' }}>
                            {arc.date && <span>📅 {arc.date}</span>}
                            {arc.ppl && <span>👥 {arc.ppl}명</span>}
                            {imageCount > 0 && <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.04em' }}>📷 {imageCount}장</span>}
                          </div>
                        </div>
                        <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#9ca3af' }}>→</div>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </section>
    </>
  );
}
