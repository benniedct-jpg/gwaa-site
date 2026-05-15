'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Eyebrow from '@/components/ui/Eyebrow';
import { staggerContainer, fadeUp } from '@/lib/animations';

const BENEFITS = [
  { icon: '🏨', title: '숙박 할인', desc: '강원도 파트너 호텔·리조트·캠핑장에서 회원 전용 특가 및 우선 예약 혜택을 누리세요.' },
  { icon: '☕', title: '카페 & 맛집', desc: '반려동물 동반 가능한 강원도 카페와 레스토랑에서 할인 혜택을 제공합니다.' },
  { icon: '🎪', title: '행사 우선 참여', desc: '메이트쉽 회원은 모든 GWAA 행사에 우선 예약권 및 조기 알림을 받습니다.' },
  { icon: '🎓', title: '교육 혜택', desc: '어질리티, 오비디언스, 반려동물행동지도사 교육에서 회원 할인 혜택이 주어집니다.' },
];

export default function BenefitsPreview() {
  return (
    <section style={{ padding: '88px 60px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
          <motion.div variants={fadeUp}>
            <Eyebrow text="MATESHIP BENEFITS" />
            <h2 style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 'clamp(26px, 5.5vw, 52px)',
              color: '#111', letterSpacing: '0.02em', lineHeight: 1, marginBottom: 6,
            }}>
              메이트쉽 혜택 미리보기
            </h2>
          </motion.div>
          <Link href="/mateship#benefits" style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 11, color: '#6b7280', letterSpacing: '0.06em', flexShrink: 0 }}>
            전체 혜택 보기 →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              variants={fadeUp}
              custom={i * 0.06}
              whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
              style={{
                background: '#f8fafb', border: '1.5px solid #e5e7eb',
                borderRadius: 14, padding: '24px 26px',
                transition: 'border-color 0.25s',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 14 }}>{b.icon}</div>
              <h3 style={{
                fontFamily: "'Bebas Neue', cursive", fontSize: 22,
                color: '#111', letterSpacing: '0.02em', marginBottom: 8,
              }}>
                {b.title}
              </h3>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, fontWeight: 300 }}>
                {b.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
