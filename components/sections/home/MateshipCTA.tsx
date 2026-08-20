'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp } from '@/lib/animations';
import { useIsMobile } from '@/hooks/useIsMobile';

const PERKS = [
  '🏨 강원도 파트너 호텔·리조트 할인',
  '☕ 반려동물 동반 카페·맛집 할인',
  '⛺ 반려동물 캠핑장 30% 할인',
  '🎪 행사 우선 참여 및 조기 알림',
  '🎓 GWAA 교육 프로그램 할인',
  '🤝 반려인 네트워크 & 커뮤니티',
];

export default function MateshipCTA() {
  const isMobile = useIsMobile();

  return (
    <section style={{ padding: isMobile ? '56px 20px' : '88px 60px', borderBottom: '1px solid #e5e7eb', background: '#f0fdf4', position: 'relative', overflow: 'hidden' }}>
      {/* Glow blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: '#16a34a', filter: 'blur(100px)', pointerEvents: 'none' }}
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: '#2563eb', filter: 'blur(100px)', pointerEvents: 'none' }}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? 32 : 60,
          position: 'relative',
        }}
      >
        {/* Left */}
        <div>
          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 24, height: 2, background: '#16a34a', borderRadius: 1, flexShrink: 0 }} />
            <span style={{ fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", fontSize: 12, color: '#16a34a', letterSpacing: '0.06em' }}>
              GWAA MATESHIP
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            custom={0.08}
            style={{
              fontFamily: "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif",
              fontSize: isMobile ? 40 : 'clamp(36px, 5vw, 64px)',
              color: '#111', letterSpacing: '0.02em', lineHeight: 0.95,
              marginBottom: 10,
            }}
          >
            강원도를 제한 없이<br />
            <span style={{ color: '#16a34a' }}>메이트쉽</span>으로
          </motion.h2>

          <motion.p variants={fadeUp} custom={0.14} style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, fontWeight: 400, marginBottom: 28 }}>
            연간 40만원 이상 절약하는 스마트한 반려생활. 강원도 전역 제휴업체 혜택과 GWAA의 모든 프로그램을 회원 가격으로 누리세요.
          </motion.p>

          <motion.div variants={fadeUp} custom={0.2} style={{ display: 'flex', gap: 10, flexWrap: 'nowrap' }}>
            <Link
              href="/mateship#join"
              style={{
                display: 'inline-flex', alignItems: 'center', padding: '13px 24px',
                borderRadius: 9999, background: '#16a34a', color: '#fff',
                fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
                boxShadow: '0 4px 20px rgba(22,163,74,0.35)',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              지금 가입하기 →
            </Link>
            <Link
              href="/mateship#calculator"
              style={{
                display: 'inline-flex', alignItems: 'center', padding: '13px 20px',
                borderRadius: 9999,
                background: '#fff', color: '#374151',
                border: '1.5px solid #d1d5db',
                fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              절약 계산기
            </Link>
          </motion.div>
        </div>

        {/* Right: Perks */}
        <motion.div variants={staggerContainer}>
          {PERKS.map((perk, i) => (
            <motion.div
              key={perk}
              variants={fadeUp}
              custom={i * 0.05}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 0',
                borderBottom: i < PERKS.length - 1 ? '1px solid #e5e7eb' : 'none',
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#374151', fontWeight: 400 }}>{perk}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
