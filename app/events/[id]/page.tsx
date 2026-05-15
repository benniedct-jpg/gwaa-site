'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGWAADBItem } from '@/hooks/useGWAADB';
import { STORES } from '@/lib/db/gwaaDB';
import { EventCard } from '@/types';
import Badge from '@/components/ui/Badge';
import { fadeUp } from '@/lib/animations';

export default function EventDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: event, loading } = useGWAADBItem<EventCard>(STORES.EVENT, id);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 12, color: '#9ca3af', letterSpacing: '0.1em' }}>LOADING...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 48, color: '#111' }}>행사를 찾을 수 없어요</div>
        <Link href="/events" style={{ padding: '10px 24px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>← 행사 목록으로</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        height: 400, position: 'relative', overflow: 'hidden',
        background: event.imageData ? `url(${event.imageData}) center/cover no-repeat` : 'linear-gradient(135deg,#e8f5e9,#c8e6c9)',
        display: 'flex', alignItems: 'flex-end',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 20%, rgba(0,0,0,0.7))' }} />
        <div style={{ position: 'relative', padding: '40px 60px', width: '100%' }}>
          <nav style={{ marginBottom: 16 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none' }}>HOME</Link>
            <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 8px' }}>/</span>
            <Link href="/events" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none' }}>EVENTS</Link>
            <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 8px' }}>/</span>
            <span style={{ color: '#fff', fontSize: 12 }}>DETAIL</span>
          </nav>
          <Badge variant={event.status} />
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(32px,5vw,56px)', color: '#fff', letterSpacing: '0.02em', lineHeight: 1, marginTop: 12, marginBottom: 12 }}>
            {event.title}
          </h1>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'rgba(255,255,255,0.7)', flexWrap: 'wrap' }}>
            <span>📅 {event.date}</span>
            <span>📍 {event.loc}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 40px' }}>
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          {event.benefit && (
            <div style={{ display: 'inline-block', background: '#f0fdf4', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 9999, padding: '6px 16px', fontSize: 12, color: '#16a34a', fontWeight: 700, marginBottom: 24 }}>
              {event.benefit}
            </div>
          )}

          <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.8, marginBottom: 40, whiteSpace: 'pre-wrap' }}>{event.desc}</p>

          {/* Gallery */}
          {(event.images && event.images.length > 0) && (
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: '#111', letterSpacing: '0.02em', marginBottom: 20 }}>갤러리</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {event.images.map((img: string, i: number) => (
                  <div key={i} style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3', background: `url(${img}) center/cover no-repeat` }} />
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {event.link ? (
              <Link href={event.link} style={{ display: 'inline-flex', padding: '12px 28px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                {event.ctaText || '신청하기 →'}
              </Link>
            ) : (
              <span style={{ display: 'inline-flex', padding: '12px 28px', borderRadius: 9999, background: '#f3f4f6', color: '#9ca3af', fontSize: 14, fontWeight: 700 }}>
                {event.ctaText || '준비 중'}
              </span>
            )}
            <Link href="/events" style={{ display: 'inline-flex', padding: '12px 28px', borderRadius: 9999, border: '1.5px solid #e5e7eb', color: '#374151', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              ← 목록으로
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
