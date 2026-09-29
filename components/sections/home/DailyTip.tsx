'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/useIsMobile';
import { PET_TIPS as TIPS } from '@/lib/petTips';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";

export default function DailyTip() {
  const [idx, setIdx] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    // 날짜 기반 시드 → 매일 다른 팁 (재방문 유도)
    const d = new Date();
    const seed = d.getFullYear() * 1000 + (d.getMonth() * 31 + d.getDate());
    setIdx(seed % TIPS.length);
  }, []);

  const tip = TIPS[idx];
  const next = () => setIdx((i) => (i + 1 + Math.floor(Math.random() * (TIPS.length - 1))) % TIPS.length);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      style={{
        padding: isMobile ? '20px' : '32px 60px',
        borderBottom: '1px solid #e5e7eb',
        background: '#EDFAF8',
        display: 'flex', alignItems: 'center', gap: 16,
        flexWrap: isMobile ? 'wrap' : 'nowrap',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
        background: '#D6F5F1', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
      }}>
        {tip.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: '#12A79D', letterSpacing: '0.06em' }}>TODAY&apos;S PET TIP</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#0D7E76', background: '#D6F5F1', padding: '2px 8px', borderRadius: 9999 }}>{tip.cat}</span>
        </div>
        <div style={{ fontSize: isMobile ? 13.5 : 15, color: '#111', fontWeight: 800, marginBottom: 3 }}>{tip.title}</div>
        <p style={{ fontSize: isMobile ? 13 : 14, color: '#374151', lineHeight: 1.6, margin: 0, wordBreak: 'keep-all' }}>{tip.text}</p>
      </div>
      <div style={{ flexShrink: 0, alignSelf: isMobile ? 'flex-start' : 'center', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={next}
          style={{
            fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: '#0D7E76',
            background: '#fff', border: '1.5px solid #BFF3EC', borderRadius: 9999,
            padding: '9px 16px', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          🔄 다른 꿀팁
        </button>
        <Link href="/tips" style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: '#fff', background: '#12A79D', borderRadius: 9999, padding: '9px 16px', whiteSpace: 'nowrap', textDecoration: 'none' }}>
          전체 꿀팁 →
        </Link>
      </div>
    </motion.section>
  );
}
