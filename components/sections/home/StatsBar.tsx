'use client';

import { motion } from 'framer-motion';
import CountUp from '@/components/shared/CountUp';
import { staggerContainer, fadeUp } from '@/lib/animations';

const STATS = [
  { value: 40000, suffix: '+', label: '누적 참가자' },
  { value: 90,    suffix: '회+', label: '진행 행사' },
  { value: 18,    suffix: '+', label: '제휴업체' },
  { value: 5,     suffix: '년+', label: '운영 연혁' },
];

export default function StatsBar() {
  return (
    <section style={{
      padding: '0 60px',
      borderBottom: '1px solid #e5e7eb',
      background: '#fff',
    }}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
        }}
      >
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            custom={i * 0.05}
            style={{
              padding: '40px 0',
              textAlign: 'center',
              borderRight: i < STATS.length - 1 ? '1px solid #e5e7eb' : 'none',
            }}
          >
            <div style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 'clamp(36px, 5vw, 52px)',
              color: '#16a34a',
              letterSpacing: '0.02em',
              lineHeight: 1,
              marginBottom: 8,
            }}>
              <CountUp value={stat.value} suffix={stat.suffix} />
            </div>
            <div style={{
              fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace",
              fontSize: 10,
              color: '#6b7280',
              letterSpacing: '0.1em',
            }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
