'use client';

import { motion } from 'framer-motion';
import Eyebrow from '@/components/ui/Eyebrow';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  desc?: string;
  children?: React.ReactNode;
}

export default function PageHero({ eyebrow, title, titleAccent, desc, children }: PageHeroProps) {
  const words = title.split(' ');

  return (
    <section
      style={{
        height: 540,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '80px 60px 64px',
        position: 'relative',
        overflow: 'hidden',
        background: '#f8fafb',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      {/* Grid pattern */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      {/* Glow blobs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.07, 0.13, 0.07] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '10%', right: '15%',
          width: 400, height: 400,
          borderRadius: '50%',
          background: '#16a34a',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.05, 0.09, 0.05] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute', bottom: '20%', left: '10%',
          width: 300, height: 300,
          borderRadius: '50%',
          background: '#2563eb',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative' }}>
        {eyebrow && <Eyebrow text={eyebrow} />}

        <h1
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: 'clamp(40px, 8vw, 88px)',
            lineHeight: 0.92,
            letterSpacing: '0.02em',
            color: '#111',
            marginBottom: 18,
          }}
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              style={{ display: 'inline-block', marginRight: '0.25em' }}
            >
              {word}
            </motion.span>
          ))}
          {titleAccent && (
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: words.length * 0.06 + 0.05, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              style={{ color: '#16a34a', display: 'inline-block' }}
            >
              {titleAccent}
            </motion.span>
          )}
        </h1>

        {desc && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, maxWidth: 520, fontWeight: 300, marginBottom: 32 }}
          >
            {desc}
          </motion.p>
        )}

        {children}
      </div>
    </section>
  );
}
