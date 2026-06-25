'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Eyebrow from '@/components/ui/Eyebrow';
import { staggerContainer, fadeUp } from '@/lib/animations';
import { useIsMobile } from '@/hooks/useIsMobile';

const IC = ({ d, extra }: { d: string | string[]; extra?: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
    {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
    {extra}
  </svg>
);

const BENEFITS: { icon: React.ReactNode; title: string; desc: string }[] = [
  {
    icon: <IC d={['M3 22V9l9-5 9 5v13', 'M9 22v-8h6v8']}
                extra={<><rect x="3" y="11" width="3" height="3" /><rect x="18" y="11" width="3" height="3" /></>} />,
    title: '숙박 할인',
    desc: '강원도 파트너 호텔·리조트·캠핑장에서 회원 전용 특가 및 우선 예약 혜택을 누리세요.',
  },
  {
    icon: <IC d={['M3 9h13v7a4 4 0 01-4 4H7a4 4 0 01-4-4V9z', 'M16 11h2a2 2 0 010 4h-2', 'M6 3c0 1.5-1.5 2-1.5 3.5M10 3c0 1.5-1.5 2-1.5 3.5']} />,
    title: '카페 & 맛집',
    desc: '반려동물 동반 가능한 강원도 카페와 레스토랑에서 할인 혜택을 제공합니다.',
  },
  {
    icon: <IC d={['M8 2v4', 'M16 2v4', 'M3 10h18', 'M8 14h.01', 'M12 14h.01', 'M16 14h.01', 'M8 18h.01', 'M12 18h.01']}
                extra={<rect x="3" y="4" width="18" height="18" rx="2" />} />,
    title: '행사 우선 참여',
    desc: '메이트쉽 회원은 모든 GWAA 행사에 우선 예약권 및 조기 알림을 받습니다.',
  },
  {
    icon: <IC d={['M22 10L12 5 2 10l10 5 10-5z', 'M6 12.5V17c0 1.657 2.686 3 6 3s6-1.343 6-3v-4.5', 'M22 10v5']} />,
    title: '교육 혜택',
    desc: '어질리티, 오비디언스, 반려동물행동지도사 교육에서 회원 할인 혜택이 주어집니다.',
  },
];

export default function BenefitsPreview() {
  const isMobile = useIsMobile();
  const px = isMobile ? '20px' : '60px';

  return (
    <section style={{ padding: `${isMobile ? '56px' : '88px'} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
      >
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          marginBottom: 28,
          gap: 10,
        }}>
          <motion.div variants={fadeUp}>
            <Eyebrow text="MATESHIP BENEFITS" />
            <h2 style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: isMobile ? 32 : 'clamp(26px, 5.5vw, 52px)',
              color: '#111', letterSpacing: '0.02em', lineHeight: 1, marginBottom: 6,
            }}>
              메이트쉽 혜택 미리보기
            </h2>
          </motion.div>
          <Link href="/mateship#benefits" style={{
            fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace",
            fontSize: 11, color: '#6b7280', letterSpacing: '0.06em', flexShrink: 0,
            whiteSpace: 'nowrap',
          }}>
            전체 혜택 보기 →
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: isMobile ? 12 : 16,
        }}>
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              variants={fadeUp}
              custom={i * 0.06}
              whileHover={!isMobile ? { y: -4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' } : undefined}
              style={{
                background: '#f8fafb', border: '1.5px solid #e5e7eb',
                borderRadius: 14, padding: isMobile ? '18px 20px' : '24px 26px',
                transition: 'border-color 0.25s',
              }}
            >
              <div style={{ marginBottom: 12, lineHeight: 0 }}>{b.icon}</div>
              <h3 style={{
                fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? 18 : 22,
                color: '#111', letterSpacing: '0.02em', marginBottom: 6,
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
