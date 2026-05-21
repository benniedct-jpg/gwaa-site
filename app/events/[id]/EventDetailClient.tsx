'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { EventCard } from '@/types';
import Badge from '@/components/ui/Badge';
import { useIsMobile } from '@/hooks/useIsMobile';

const MONO = "'SF Mono','Menlo','Monaco','Consolas','Courier New',monospace";
const BEBAS = "'Bebas Neue', cursive";

export default function EventDetailClient({ event }: { event: EventCard }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const px = isMobile ? '20px' : '60px';

  const allImages: string[] = [];
  if (event.images && event.images.length > 0) {
    allImages.push(...event.images);
  } else if (event.imageData) {
    allImages.push(event.imageData);
  }

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prev = useCallback(() => setLightboxIdx((i) => i !== null ? (i - 1 + allImages.length) % allImages.length : null), [allImages.length]);
  const next = useCallback(() => setLightboxIdx((i) => i !== null ? (i + 1) % allImages.length : null), [allImages.length]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIdx, closeLightbox, prev, next]);

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>

      {/* Hero */}
      <div style={{ position: 'relative', height: isMobile ? '50vh' : '60vh', minHeight: 300, overflow: 'hidden' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute', inset: 0,
            background: allImages[0]
              ? `url(${allImages[0]}) center/cover no-repeat`
              : 'linear-gradient(135deg,#e8f5e9,#c8e6c9)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.72) 100%)' }} />

        <div style={{ position: 'absolute', top: 20, left: isMobile ? 16 : 40, zIndex: 2 }}>
          <Link href="/events" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.75)', fontSize: 12, fontFamily: MONO, letterSpacing: '0.08em', textDecoration: 'none', background: 'rgba(0,0,0,0.3)', padding: '6px 14px', borderRadius: 9999, backdropFilter: 'blur(8px)' }}>
            ← EVENTS
          </Link>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: `32px ${px}`, zIndex: 2 }}>
          <div style={{ marginBottom: 10 }}>
            <Badge variant={event.status} />
          </div>
          <h1 style={{ fontFamily: BEBAS, fontSize: isMobile ? 'clamp(28px,7vw,42px)' : 'clamp(32px,5vw,60px)', color: '#fff', letterSpacing: '0.02em', lineHeight: 1, marginBottom: 12, wordBreak: 'keep-all' }}>
            {event.title}
          </h1>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: MONO, letterSpacing: '0.04em', flexWrap: 'wrap' }}>
            {event.date && <span>📅 {event.date}</span>}
            {event.loc && <span>📍 {event.loc}</span>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: isMobile ? '40px 20px 64px' : '56px 40px 80px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>

          {event.benefit && (
            <div style={{ display: 'inline-block', background: '#f0fdf4', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 9999, padding: '6px 16px', fontSize: 12, color: '#16a34a', fontWeight: 700, marginBottom: 24 }}>
              {event.benefit}
            </div>
          )}

          {event.desc && (
            <p style={{ fontSize: isMobile ? 15 : 17, color: '#1f2937', lineHeight: 1.85, marginBottom: 32, whiteSpace: 'pre-wrap', letterSpacing: '-0.01em' }}>
              {event.desc}
            </p>
          )}

          {event.content && event.content !== event.desc && (
            <div style={{ marginBottom: 40, paddingTop: 32, borderTop: '1px solid #f0f0f0' }}>
              <p style={{ fontSize: isMobile ? 14 : 15, color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                {event.content}
              </p>
            </div>
          )}

          {allImages.length > 0 && (
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <h2 style={{ fontFamily: BEBAS, fontSize: 24, color: '#111', letterSpacing: '0.02em' }}>갤러리</h2>
                <span style={{ fontFamily: MONO, fontSize: 10, color: '#9ca3af', letterSpacing: '0.12em' }}>{allImages.length} PHOTOS</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3, 1fr)', gap: isMobile ? 8 : 10 }}>
                {allImages.map((img, i) => (
                  <motion.div
                    key={i}
                    whileHover={!isMobile ? { scale: 1.02 } : undefined}
                    onClick={() => setLightboxIdx(i)}
                    style={{ aspectRatio: '1/1', background: `url(${img}) center/cover no-repeat`, borderRadius: 8, cursor: 'zoom-in' }}
                  />
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', paddingTop: 8 }}>
            {event.link ? (
              <Link href={event.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', padding: isMobile ? '11px 24px' : '13px 30px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                {event.ctaText || '신청하기 →'}
              </Link>
            ) : (
              <span style={{ display: 'inline-flex', padding: isMobile ? '11px 24px' : '13px 30px', borderRadius: 9999, background: '#f3f4f6', color: '#9ca3af', fontSize: 14, fontWeight: 700 }}>
                {event.ctaText || '준비 중'}
              </span>
            )}
            <Link href="/events" style={{ display: 'inline-flex', padding: isMobile ? '11px 24px' : '13px 30px', borderRadius: 9999, border: '1.5px solid #e5e7eb', color: '#374151', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              ← 목록으로
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <button onClick={closeLightbox} style={{ position: 'absolute', top: 20, right: 24, color: '#fff', fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}>✕</button>
            <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em' }}>
              {lightboxIdx + 1} / {allImages.length}
            </div>
            <motion.img
              key={lightboxIdx}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={allImages[lightboxIdx]}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '88vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 6, display: 'block' }}
              alt=""
            />
            {allImages.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prev(); }} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#fff', fontSize: 28, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                <button onClick={(e) => { e.stopPropagation(); next(); }} style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', color: '#fff', fontSize: 28, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
