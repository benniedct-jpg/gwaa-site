'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useMotionValue } from 'framer-motion';
import { useGWAADB } from '@/hooks/useGWAADB';
import { STORES } from '@/lib/db/gwaaDB';
import { GalleryItem } from '@/types';

type Direction = 'left' | 'right';

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%)',
  'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
  'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
  'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)',
  'linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)',
];
const FALLBACK_ICONS = ['🐾', '🐕', '🏕️', '🌿', '🐶'];

const POSITIONS: { x: string; y: string; zIndex: number; direction: Direction; order: number }[] = [
  { x: '-320px', y: '15px', zIndex: 50, direction: 'left',  order: 0 },
  { x: '-160px', y: '32px', zIndex: 40, direction: 'left',  order: 1 },
  { x: '0px',   y: '8px',  zIndex: 30, direction: 'right', order: 2 },
  { x: '160px', y: '22px', zIndex: 20, direction: 'right', order: 3 },
  { x: '320px', y: '44px', zIndex: 10, direction: 'left',  order: 4 },
];

function getRandomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function Photo({
  src,
  gradient,
  fallbackIcon,
  direction,
  caption,
  width = 220,
  height = 220,
}: {
  src: string | null;
  gradient: string;
  fallbackIcon: string;
  direction: Direction;
  caption: string;
  width?: number;
  height?: number;
}) {
  const [rotation, setRotation] = useState(0);
  const x = useMotionValue(200);
  const y = useMotionValue(200);

  useEffect(() => {
    setRotation(getRandomInRange(1, 4) * (direction === 'left' ? -1 : 1));
  }, [direction]);

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      whileTap={{ scale: 1.2, zIndex: 9999 }}
      whileHover={{ scale: 1.08, rotateZ: 2 * (direction === 'left' ? -1 : 1), zIndex: 9999 }}
      whileDrag={{ scale: 1.1, zIndex: 9999 }}
      initial={{ rotate: 0 }}
      animate={{ rotate: rotation }}
      style={{ width, height, cursor: 'grab', userSelect: 'none', touchAction: 'none' }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left);
        y.set(e.clientY - rect.top);
      }}
      onMouseLeave={() => { x.set(200); y.set(200); }}
    >
      <div
        title={caption}
        style={{
          width: '100%', height: '100%',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          background: src ? `url(${src}) center/cover no-repeat` : gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {!src && (
          <span style={{ fontSize: 52, opacity: 0.6 }}>{fallbackIcon}</span>
        )}
      </div>
    </motion.div>
  );
}

export function PhotoGallery({ animationDelay = 0.5 }: { animationDelay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded]   = useState(false);
  const { data: galleryItems, loading } = useGWAADB<GalleryItem>(STORES.GALLERY);

  useEffect(() => {
    if (loading) return;
    const t1 = setTimeout(() => setIsVisible(true), animationDelay * 1000);
    const t2 = setTimeout(() => setIsLoaded(true),  (animationDelay + 0.4) * 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [animationDelay, loading]);

  const activeItems = galleryItems.filter((i) => i.active).slice(0, 5);

  const containerVariants = {
    hidden:  { opacity: 1 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };

  const photoVariants = {
    hidden: () => ({ x: 0, y: 0, rotate: 0, scale: 1 }),
    visible: (custom: { x: string; y: string; order: number }) => ({
      x: custom.x, y: custom.y, rotate: 0, scale: 1,
      transition: { type: 'spring' as const, stiffness: 70, damping: 12, mass: 1, delay: custom.order * 0.15 },
    }),
  };

  return (
    <section style={{ padding: '80px 60px 60px', background: '#fff', borderBottom: '1px solid #e5e7eb', overflow: 'hidden' }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
        backgroundSize: '48px 48px', opacity: 0.3,
        maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)',
      }} />

      <p style={{ textAlign: 'center', fontSize: 10, fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", letterSpacing: '0.14em', color: '#9ca3af', marginBottom: 10, textTransform: 'uppercase', position: 'relative' }}>
        강원도반려동물협회 · 함께한 순간들
      </p>
      <h3 style={{
        textAlign: 'center', fontSize: 'clamp(28px, 5vw, 52px)',
        fontFamily: "'Bebas Neue', cursive", letterSpacing: '0.02em', lineHeight: 0.95,
        color: '#111', marginBottom: 0, position: 'relative',
      }}>
        GWAA <span style={{ color: '#16a34a' }}>갤러리</span>
      </h3>

      {/* Fan of photos */}
      <div style={{ position: 'relative', height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          style={{ position: 'relative' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <motion.div
            style={{ display: 'flex', justifyContent: 'center' }}
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
          >
            <div style={{ position: 'relative', width: 220, height: 220 }}>
              {[...POSITIONS].reverse().map((pos, revIdx) => {
                const idx = POSITIONS.length - 1 - revIdx;
                const item = activeItems[idx];
                return (
                  <motion.div
                    key={pos.order}
                    style={{ position: 'absolute', left: 0, top: 0, zIndex: pos.zIndex }}
                    variants={photoVariants}
                    custom={{ x: pos.x, y: pos.y, order: pos.order }}
                  >
                    <Photo
                      src={item?.imageData ?? null}
                      gradient={FALLBACK_GRADIENTS[idx]}
                      fallbackIcon={FALLBACK_ICONS[idx]}
                      direction={pos.direction}
                      caption={item?.caption ?? ''}
                      width={220}
                      height={220}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8, position: 'relative' }}>
        <Link
          href="/events#archive"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '12px 28px', borderRadius: 9999,
            background: '#16a34a', color: '#fff',
            fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
            boxShadow: '0 2px 12px rgba(22,163,74,0.3)',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
          }}
        >
          행사 아카이브 보기 →
        </Link>
      </div>
    </section>
  );
}
