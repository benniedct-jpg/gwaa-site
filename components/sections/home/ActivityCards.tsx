'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useGWAADB } from '@/hooks/useGWAADB';
import { STORES } from '@/lib/db/gwaaDB';
import { ActivityCard } from '@/types';
import Eyebrow from '@/components/ui/Eyebrow';
import Badge from '@/components/ui/Badge';
import { staggerContainer, fadeUp } from '@/lib/animations';

const TAG_COLORS: Record<string, 'green' | 'blue' | 'amber'> = {
  green: 'green', blue: 'blue', amber: 'amber',
};

function TiltCard({ card }: { card: ActivityCard }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-6, 6]);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(0,0,0,0.12)', borderColor: 'rgba(22,163,74,0.3)' }}
      style={{
        rotateX, rotateY, transformStyle: 'preserve-3d',
        background: '#fff',
        border: '1.5px solid #e5e7eb',
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'border-color 0.25s',
      }}
    >
      {/* Image */}
      <div style={{
        height: 220,
        background: card.imageData
          ? `url(${card.imageData}) center/cover no-repeat`
          : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 56,
      }}>
        {!card.imageData && card.icon}
      </div>

      {/* Body */}
      <div style={{ padding: '22px 24px 26px' }}>
        <div style={{ marginBottom: 14 }}>
          <Badge variant={TAG_COLORS[card.tagColor] ?? 'gray'}>{card.tag}</Badge>
        </div>
        <h3 style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 26,
          letterSpacing: '0.02em',
          color: '#111',
          marginBottom: 10,
          lineHeight: 1.1,
        }}>
          {card.title}
        </h3>
        <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.75, fontWeight: 300, marginBottom: 20 }}>
          {card.desc}
        </p>
        <Link
          href={card.link}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace",
            fontSize: 11, fontWeight: 700, color: '#16a34a',
            letterSpacing: '0.06em', textDecoration: 'none',
            transition: 'gap 0.2s',
          }}
        >
          {card.linkText}
        </Link>
      </div>
    </motion.div>
  );
}

export default function ActivityCards() {
  const { data: cards, loading } = useGWAADB<ActivityCard>(STORES.ACTIVITY);

  if (loading) return (
    <section style={{ padding: '88px 60px', borderBottom: '1px solid #e5e7eb', background: '#f8fafb' }}>
      <div style={{ height: 300 }} />
    </section>
  );

  return (
    <section style={{ padding: '88px 60px', borderBottom: '1px solid #e5e7eb', background: '#f8fafb' }}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
      >
        <motion.div variants={fadeUp}>
          <Eyebrow text="CORE ACTIVITIES" />
          <h2 style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: 'clamp(26px, 5.5vw, 52px)',
            color: '#111', letterSpacing: '0.02em', lineHeight: 1,
            marginBottom: 10,
          }}>
            GWAA가 하는 일
          </h2>
          <p style={{
            fontSize: 15, color: '#6b7280', lineHeight: 1.75,
            fontWeight: 300, maxWidth: 560, marginBottom: 40,
          }}>
            교육부터 행사, 멤버십까지. 강원도 반려동물 문화를 만드는 세 가지 핵심 활동을 소개합니다.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {cards.map((card) => (
            <TiltCard key={card.id ?? card.order} card={card} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
