'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGWAADB } from '@/hooks/useGWAADB';
import { STORES } from '@/lib/db/gwaaDB';
import { LookbookItem } from '@/types';
import Eyebrow from '@/components/ui/Eyebrow';
import { staggerContainer, fadeUp } from '@/lib/animations';

const BG_GRADIENTS = [
  'linear-gradient(135deg,#e8f5e9 0%,#a5d6a7 100%)',
  'linear-gradient(135deg,#e3f2fd 0%,#90caf9 100%)',
  'linear-gradient(135deg,#fff8e1 0%,#ffe082 100%)',
  'linear-gradient(135deg,#fce4ec 0%,#f48fb1 100%)',
  'linear-gradient(135deg,#ede7f6 0%,#b39ddb 100%)',
];

export default function Lookbook() {
  const { data: items, loading } = useGWAADB<LookbookItem>(STORES.LOOKBOOK);

  const main = items.find((i) => i.isMain);
  const rest = items.filter((i) => !i.isMain);

  return (
    <section style={{ padding: '88px 60px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
      >
        <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
          <div>
            <Eyebrow text="LOOKBOOK" />
            <h2 style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 'clamp(26px, 5.5vw, 52px)',
              color: '#111', letterSpacing: '0.02em', lineHeight: 1, marginBottom: 6,
            }}>
              GWAA 룩북
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.75, fontWeight: 300 }}>
              강원도에서 함께한 순간들을 담았습니다.
            </p>
          </div>
          <Link href="/travel" style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 11, color: '#6b7280', letterSpacing: '0.06em', flexShrink: 0 }}>
            여행 가이드 보기 →
          </Link>
        </motion.div>

        {loading ? (
          <div style={{ height: 400 }} />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2.2fr 1fr 1fr',
            gridTemplateRows: 'repeat(2, 220px)',
            gap: 12,
          }}>
            {/* Main */}
            {main && (
              <motion.a
                href={main.link}
                variants={fadeUp}
                whileHover={{ scale: 1.015 }}
                style={{
                  gridRow: '1 / 3',
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: main.imageData
                    ? `url(${main.imageData}) center/cover no-repeat`
                    : BG_GRADIENTS[0],
                  display: 'flex', alignItems: 'flex-end',
                  cursor: 'pointer', textDecoration: 'none',
                  position: 'relative',
                }}
              >
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.45))',
                }} />
                <div style={{ position: 'relative', padding: 24 }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", letterSpacing: '0.08em', marginBottom: 6 }}>
                    FEATURED
                  </p>
                  <p style={{ fontSize: 20, fontFamily: "'Bebas Neue', cursive", color: '#fff', letterSpacing: '0.04em' }}>
                    {main.label}
                  </p>
                </div>
              </motion.a>
            )}

            {/* Rest */}
            {rest.slice(0, 4).map((item, i) => (
              <motion.a
                key={item.id ?? i}
                href={item.link}
                variants={fadeUp}
                custom={i * 0.04}
                whileHover={{ scale: 1.02 }}
                style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: item.imageData
                    ? `url(${item.imageData}) center/cover no-repeat`
                    : BG_GRADIENTS[(i + 1) % BG_GRADIENTS.length],
                  display: 'flex', alignItems: 'flex-end',
                  cursor: 'pointer', textDecoration: 'none',
                  position: 'relative',
                }}
              >
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.4))',
                }} />
                <p style={{
                  position: 'relative', padding: '12px 16px',
                  fontSize: 14, fontFamily: "'Bebas Neue', cursive",
                  color: '#fff', letterSpacing: '0.04em',
                }}>
                  {item.label}
                </p>
              </motion.a>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
