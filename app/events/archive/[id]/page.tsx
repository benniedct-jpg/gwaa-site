'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useGWAADBItem } from '@/hooks/useGWAADB';
import { STORES } from '@/lib/db/gwaaDB';
import { ArchiveEvent } from '@/types';

const MONO = "'SF Mono','Menlo','Monaco','Consolas','Courier New',monospace";
const BEBAS = "'Bebas Neue', cursive";

export default function ArchiveDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: event, loading } = useGWAADBItem<ArchiveEvent>(STORES.ARCHIVE, id);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const allImages = event
    ? event.images && event.images.length > 0
      ? event.images
      : [event.imageData, event.imageData2].filter((x): x is string => !!x)
    : [];

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const lbPrev = useCallback(() => setLightboxIdx(i => (i !== null && i > 0 ? i - 1 : i)), []);
  const lbNext = useCallback(() => setLightboxIdx(i => (i !== null && i < allImages.length - 1 ? i + 1 : i)), [allImages.length]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lbPrev();
      if (e.key === 'ArrowRight') lbNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx, closeLightbox, lbPrev, lbNext]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: '#ccc', letterSpacing: '0.2em' }}>LOADING...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontFamily: BEBAS, fontSize: 48, color: '#111' }}>행사를 찾을 수 없어요</div>
        <Link href="/events#archive" style={{ padding: '10px 24px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>← 아카이브로</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>

      {/* ── [1] Hero ── */}
      <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            position: 'absolute', inset: 0,
            background: allImages[0]
              ? `url(${allImages[0]}) center/cover no-repeat`
              : 'linear-gradient(135deg,#111 0%,#1a2e1a 100%)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.75) 100%)' }} />

        {/* Back */}
        <Link
          href="/events#archive"
          style={{ position: 'absolute', top: 80, left: 60, fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', letterSpacing: '0.14em', zIndex: 10 }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
        >
          ← ARCHIVE
        </Link>

        {/* Bottom text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 60px 52px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ width: 20, height: 1, background: '#4ade80' }} />
            <span style={{ fontFamily: MONO, fontSize: 10, color: '#4ade80', letterSpacing: '0.16em', fontWeight: 700 }}>
              {event.year} · {event.loc}
            </span>
          </div>
          <h1 style={{
            fontFamily: BEBAS,
            fontSize: 'clamp(48px, 8vw, 96px)',
            color: '#fff',
            letterSpacing: '0.01em',
            lineHeight: 0.92,
            marginBottom: 20,
            maxWidth: 900,
            wordBreak: 'keep-all',
          }}>
            {event.title}
          </h1>
          <div style={{ display: 'flex', gap: 16, fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', flexWrap: 'wrap' }}>
            {event.date && <span>{event.date}</span>}
            {event.place && <><span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span><span>{event.place}</span></>}
            {event.ppl && <><span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span><span>{event.ppl}명 참가</span></>}
          </div>
        </motion.div>
      </div>

      {/* ── [2] Caption bar ── */}
      <div style={{ background: '#fff', padding: '40px 60px 36px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: BEBAS, fontSize: 'clamp(28px, 4vw, 48px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1 }}>
            {event.title}
          </span>
          <div style={{ display: 'flex', gap: 12, fontFamily: MONO, fontSize: 10, color: '#b0b8c1', letterSpacing: '0.1em', alignItems: 'center', flexWrap: 'wrap' }}>
            <span>{event.year}</span>
            {event.loc && <><span>·</span><span>{event.loc}</span></>}
            {event.date && <><span>·</span><span>{event.date}</span></>}
          </div>
        </div>
      </div>

      {/* ── [3] OVERVIEW + META ── */}
      {(event.desc || event.part || event.organizer || event.place) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          style={{ background: '#fff', padding: '56px 60px 64px' }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 72, alignItems: 'start' }}>

            {/* OVERVIEW */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <span style={{ width: 24, height: 1, background: '#16a34a' }} />
                <span style={{ fontFamily: BEBAS, fontSize: 22, color: '#16a34a', letterSpacing: '0.16em' }}>OVERVIEW</span>
              </div>
              {event.ppl && (
                <div style={{ fontFamily: BEBAS, fontSize: 'clamp(22px, 2.4vw, 32px)', color: '#16a34a', letterSpacing: '0.04em', lineHeight: 1, marginBottom: 24 }}>
                  {event.ppl}명이 함께한 날
                </div>
              )}
              {event.desc && (
                <p style={{
                  fontSize: 'clamp(15px, 1.6vw, 18px)',
                  color: '#374151',
                  lineHeight: 2.1,
                  letterSpacing: '0.005em',
                  fontWeight: 400,
                  margin: 0,
                  whiteSpace: 'pre-line',
                }}>
                  {event.desc}
                </p>
              )}
            </div>

            {/* META sidebar */}
            <div style={{ borderLeft: '2px solid #e5e7eb', paddingLeft: 40, paddingTop: 6 }}>
              {[
                { key: 'PART', value: event.part },
                { key: 'DATE', value: event.date },
                { key: 'PLACE', value: event.place },
                { key: 'ORGANIZER', value: event.organizer },
              ].filter(({ value }) => !!value).map(({ key, value }) => (
                <div key={key} style={{ marginBottom: 36 }}>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: '#9ca3af', letterSpacing: '0.2em', fontWeight: 400, marginBottom: 8 }}>{key}</div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, fontWeight: 400, wordBreak: 'keep-all' }}>{value}</div>
                </div>
              ))}
            </div>

          </div>
        </motion.div>
      )}

      {/* ── [4] Photo spread ── */}
      {allImages.length >= 2 && (
        <div style={{ background: '#fff', padding: '0 60px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {allImages.slice(0, 2).map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              onClick={() => setLightboxIdx(i)}
              style={{
                aspectRatio: '3/2',
                background: `url(${img}) center/cover no-repeat`,
                borderRadius: 6,
                cursor: 'zoom-in',
              }}
            />
          ))}
        </div>
      )}
      {allImages.length === 1 && (
        <div style={{ background: '#fff', padding: '0 60px 12px' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onClick={() => setLightboxIdx(0)}
            style={{
              width: '100%',
              aspectRatio: '16/7',
              background: `url(${allImages[0]}) center/cover no-repeat`,
              borderRadius: 6,
              cursor: 'zoom-in',
            }}
          />
        </div>
      )}

      {/* ── [5] Gallery grid ── */}
      {allImages.length > 2 && (
        <div style={{ background: '#fff', padding: '0 60px 80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0 14px' }}>
            <span style={{ fontFamily: MONO, fontSize: 10, color: '#c4c9d0', letterSpacing: '0.18em' }}>
              {allImages.length} PHOTOS
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {allImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setLightboxIdx(i)}
                style={{
                  aspectRatio: '4/3',
                  background: `url(${img}) center/cover no-repeat`,
                  cursor: 'zoom-in',
                  borderRadius: 4,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── [6] Back ── */}
      <div style={{ background: '#fff', padding: '48px 60px 72px', borderTop: '1px solid #f0f0f0' }}>
        <Link
          href="/events#archive"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.45')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <span style={{ width: 32, height: 1, background: '#374151', display: 'block' }} />
          <span style={{ fontFamily: MONO, fontSize: 11, color: '#374151', letterSpacing: '0.14em', fontWeight: 700 }}>BACK TO ARCHIVE</span>
        </Link>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeLightbox}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.img
              key={lightboxIdx}
              src={allImages[lightboxIdx]}
              alt=""
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', userSelect: 'none' }}
            />
            <button onClick={closeLightbox} style={{ position: 'absolute', top: 24, right: 24, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            {lightboxIdx > 0 && (
              <button onClick={e => { e.stopPropagation(); lbPrev(); }} style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
            )}
            {lightboxIdx < allImages.length - 1 && (
              <button onClick={e => { e.stopPropagation(); lbNext(); }} style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
            )}
            <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '6px 20px', borderRadius: 9999, fontFamily: MONO, letterSpacing: '0.1em' }}>
              {lightboxIdx + 1} / {allImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
