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

const MONO = "'SF Mono','Menlo','Monaco','Consolas','Courier New',monospace";

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
              fontFamily: "'Bebas Neue', cursive",
              fontSize: isMobile ? 32 : 'clamp(26px, 5.5vw, 52px)',
              color: '#111', letterSpacing: '0.02em', lineHeight: 1,
              marginBottom: 4,
            }}>
              다가오는 행사
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, fontWeight: 300 }}>
              강원도 곳곳에서 펼쳐지는 반려동물 행사를 만나보세요.
            </p>
          </motion.div>
          <Link
            href="/events"
            style={{
              fontFamily: MONO, fontSize: 11,
              color: '#6b7280', letterSpacing: '0.06em', flexShrink: 0,
              whiteSpace: 'nowrap', paddingTop: isMobile ? 4 : 0,
            }}
          >
            전체 보기 →
          </Link>
        </div>

        {loading ? (
          <div style={{ height: 280 }} />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? 14 : 20,
          }}>
            {sorted.slice(0, isMobile ? 2 : 3).map((ev, i) => (
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
                    aspectRatio: isMobile ? '16/9' : '1/1',
                    background: ev.imageData
                      ? `url(${ev.imageData}) center/cover no-repeat`
                      : 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                    padding: 12,
                  }}>
                    <Badge variant={ev.status as any} />
                  </div>
                  <div style={{ padding: '16px 18px 20px' }}>
                    <h3 style={{
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: 18, letterSpacing: '0.02em',
                      color: '#111', marginBottom: 8, lineHeight: 1.1,
                    }}>
                      {ev.title}
                    </h3>
                    <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontFamily: MONO }}>
                      📅 {ev.date}
                    </p>
                    <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 10, fontFamily: MONO }}>
                      📍 {ev.loc}
                    </p>
                    {ev.benefit && (
                      <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>
                        ⭐ {ev.benefit}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
