'use client';

import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

/* ────────────────────────────────────────────────────────────
   2026 고성 미션트레킹 & 힐링 비치 · 영상 후기(RECAP)
   ────────────────────────────────────────────────────────────
   ▸ 공개 스위치: RECAP_PUBLISHED=false → 일반 방문자에겐 숨김.
     영상 확정 후 true 로 바꾸고 배포하면 공개.
   ▸ 비공개 상태에서도 URL 뒤에 ?recap=preview 붙이면 미리보기.
     예) https://gwaa.or.kr/events/2?recap=preview
   ▸ 영상: /public/images/events/gosung-2026/recap/ 에 vidN.mp4(+vidN.jpg 포스터).
     아래 VIDEOS 에 확장자 제외 경로 + 캡션.
   ──────────────────────────────────────────────────────────── */

const RECAP_PUBLISHED = false; // ← 공개할 때 true 로

const INTRO = '반려견과 함께한 고성의 하루, 영상으로 만나보세요.';
const VIDEOS: { src: string; cap: string }[] = [
  { src: '/images/events/gosung-2026/recap/vid3', cap: '함께라서 더 특별했던 순간' },
  { src: '/images/events/gosung-2026/recap/vid1', cap: '반려견과 함께 걷는 미션 트레킹' },
  { src: '/images/events/gosung-2026/recap/vid2', cap: '고성 바다 앞, 힐링 비치' },
];

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const GREEN = '#16a34a';
const MUTED = '#6b7280';

export default function RecapGosung() {
  const isMobile = useIsMobile();
  const [show, setShow] = useState(RECAP_PUBLISHED);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).get('recap') === 'preview') { setPreview(true); setShow(true); }
  }, []);

  if (!show) return null;

  const wrap: React.CSSProperties = { maxWidth: 860, margin: '0 auto', padding: isMobile ? '0 18px 44px' : '0 24px 64px' };

  return (
    <section id="recap" style={{ background: 'linear-gradient(#ffffff,#f6faf6)', paddingTop: isMobile ? 40 : 56, borderTop: '1px solid #eef2ee', marginTop: 8 }}>
      {preview && (
        <div style={{ position: 'sticky', top: 0, zIndex: 40, background: '#111827', color: '#fff', textAlign: 'center', fontSize: 12.5, padding: '7px 12px', fontWeight: 700 }}>
          🔒 미리보기 · 일반 방문자에겐 안 보여요 (공개하려면 RECAP_PUBLISHED = true)
        </div>
      )}
      <div style={wrap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ width: 20, height: 2, background: GREEN, borderRadius: 1 }} />
          <span style={{ fontFamily: MONO, fontSize: 11, color: GREEN, letterSpacing: '0.08em', fontWeight: 700 }}>RECAP 2026 · 영상 후기</span>
        </div>
        <h2 style={{ fontFamily: BEBAS, fontWeight: 800, fontSize: isMobile ? 28 : 38, color: '#111', letterSpacing: '0.01em', lineHeight: 1.12, marginBottom: 8, wordBreak: 'keep-all' }}>
          2026 고성 미션트레킹 &amp; 힐링 비치
        </h2>
        <p style={{ fontSize: isMobile ? 14 : 15, color: MUTED, lineHeight: 1.7, marginBottom: isMobile ? 26 : 36, wordBreak: 'keep-all' }}>{INTRO}</p>

        {/* 영상 후기 — 1개씩 개별 강조 */}
        {VIDEOS.map((v, i) => (
          <div key={v.src} style={{ marginBottom: isMobile ? 22 : 32, background: 'linear-gradient(135deg,#0f3d24,#14532d)', borderRadius: 20, padding: isMobile ? '20px 16px 24px' : '30px 30px 34px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, justifyContent: 'center' }}>
              <span style={{ fontFamily: BEBAS, fontSize: isMobile ? 22 : 26, color: '#eab543', lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: '#eab543', letterSpacing: '0.12em', fontWeight: 700 }}>REEL</span>
            </div>
            <div style={{ fontSize: isMobile ? 16 : 19, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 16, wordBreak: 'keep-all' }}>{v.cap}</div>
            <video
              src={`${v.src}.mp4`} poster={`${v.src}.jpg`}
              playsInline controls preload="metadata"
              onPlay={(e) => { document.querySelectorAll<HTMLVideoElement>('#recap video').forEach((el) => { if (el !== e.currentTarget) el.pause(); }); }}
              style={{ width: '100%', maxWidth: isMobile ? 300 : 360, aspectRatio: '9 / 16', objectFit: 'cover', margin: '0 auto', display: 'block', borderRadius: 16, background: '#000', boxShadow: '0 10px 34px rgba(0,0,0,0.4)' }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
