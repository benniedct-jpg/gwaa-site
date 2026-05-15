'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGWAADB } from '@/hooks/useGWAADB';
import { STORES } from '@/lib/db/gwaaDB';
import { EventCard } from '@/types';
import Badge from '@/components/ui/Badge';
import Eyebrow from '@/components/ui/Eyebrow';
import { staggerContainer, fadeUp } from '@/lib/animations';

export default function EventsPreview() {
  const { data: events, loading } = useGWAADB<EventCard>(STORES.EVENT);

  return (
    <section style={{ padding: '88px 60px', borderBottom: '1px solid #e5e7eb', background: '#f8fafb' }}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
          <motion.div variants={fadeUp}>
            <Eyebrow text="UPCOMING EVENTS" />
            <h2 style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 'clamp(26px, 5.5vw, 52px)',
              color: '#111', letterSpacing: '0.02em', lineHeight: 1,
              marginBottom: 6,
            }}>
              다가오는 행사
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.75, fontWeight: 300 }}>
              강원도 곳곳에서 펼쳐지는 반려동물 행사를 만나보세요.
            </p>
          </motion.div>
          <Link
            href="/events"
            style={{
              fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 11,
              color: '#6b7280', letterSpacing: '0.06em', flexShrink: 0,
            }}
          >
            전체 보기 →
          </Link>
        </div>

        {loading ? (
          <div style={{ height: 280 }} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {events.slice(0, 3).map((ev, i) => (
              <motion.div
                key={ev.id ?? i}
                variants={fadeUp}
                custom={i * 0.06}
                whileHover={{ y: -5, boxShadow: '0 12px 36px rgba(0,0,0,0.1)' }}
                style={{
                  background: '#fff',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 14,
                  overflow: 'hidden',
                  transition: 'border-color 0.25s',
                }}
              >
                <div style={{
                  height: 180,
                  background: ev.imageData
                    ? `url(${ev.imageData}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                  padding: 12,
                }}>
                  <Badge variant={ev.status as any} />
                </div>
                <div style={{ padding: '18px 20px 22px' }}>
                  <h3 style={{
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: 20, letterSpacing: '0.02em',
                    color: '#111', marginBottom: 8, lineHeight: 1.1,
                  }}>
                    {ev.title}
                  </h3>
                  <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace" }}>
                    📅 {ev.date}
                  </p>
                  <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 12, fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace" }}>
                    📍 {ev.loc}
                  </p>
                  {ev.benefit && (
                    <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginBottom: 12 }}>
                      {ev.benefit}
                    </p>
                  )}
                  {ev.link ? (
                    <Link
                      href={ev.link}
                      style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '9px 18px', borderRadius: 9999,
                        background: '#16a34a', color: '#fff',
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                      }}
                    >
                      {ev.ctaText}
                    </Link>
                  ) : (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '9px 18px', borderRadius: 9999,
                      background: '#f3f4f6', color: '#6b7280',
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                    }}>
                      {ev.ctaText}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
