'use client';

import { useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

/* ────────────────────────────────────────────────────────────
   2026 Camping with Petscout · 미리 보는 펫스카웃 (현장 영상)
   ▸ 영상: /public/images/events/jamboree-2026/reels/reelN.mp4 (+reelN.jpg 포스터)
   ▸ 대형 플레이어 + 썸네일 전환. 기본 무음 자동재생, 소리 버튼으로 ON.
   ──────────────────────────────────────────────────────────── */

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-blackhan), 'Apple SD Gothic Neo', sans-serif";
const COUNT = 10;
const BASE = '/images/events/jamboree-2026/reels/reel';

export default function PetscoutReels() {
  const isMobile = useIsMobile();
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const n = active + 1;

  return (
    <section style={{ background: 'radial-gradient(120% 90% at 50% 0%, #16110f 0%, #060606 60%)', padding: isMobile ? '46px 0 48px' : '72px 0 70px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <span style={{ width: 26, height: 2, background: '#F5A524', borderRadius: 1 }} />
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: '#fcd34d', letterSpacing: '0.2em', fontWeight: 800 }}>REELS</span>
        </div>
        <h2 style={{ fontFamily: BEBAS, fontSize: isMobile ? 'clamp(27px,7vw,38px)' : 'clamp(38px,4.4vw,52px)', color: '#fff', lineHeight: 1.12, letterSpacing: '-0.01em', wordBreak: 'keep-all', marginBottom: isMobile ? 22 : 30 }}>
          미리 보는 <span style={{ color: '#fbbf24' }}>펫스카웃 2026</span>
        </h2>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 18 : 34, alignItems: isMobile ? 'stretch' : 'flex-start' }}>
          {/* 대형 플레이어 */}
          <div style={{ flex: isMobile ? 'none' : '0 0 auto', width: isMobile ? '100%' : 380, margin: isMobile ? '0 auto' : 0, maxWidth: isMobile ? 360 : 380 }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 5', borderRadius: 18, overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 18px 50px rgba(0,0,0,0.55)' }}>
              <video
                key={n}
                src={`${BASE}${n}.mp4`} poster={`${BASE}${n}.jpg`}
                autoPlay muted={muted} loop playsInline preload="metadata"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <button
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? '소리 켜기' : '소리 끄기'}
                style={{ position: 'absolute', bottom: 12, right: 12, height: 38, padding: '0 14px', borderRadius: 9999, border: 'none', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: MONO, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {muted ? '🔇 소리 켜기' : '🔊 소리 끔'}
              </button>
            </div>
          </div>

          {/* 썸네일 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {!isMobile && (
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 16, wordBreak: 'keep-all' }}>
                밴드 라인업부터 현장 분위기까지 — 썸네일을 눌러 골라 보세요.
              </p>
            )}
            <div style={{ display: isMobile ? 'flex' : 'grid', gridTemplateColumns: isMobile ? undefined : 'repeat(5, 1fr)', gap: isMobile ? 10 : 12, overflowX: isMobile ? 'auto' : 'visible', padding: isMobile ? '2px 0 8px' : 0, WebkitOverflowScrolling: 'touch' }}>
              {Array.from({ length: COUNT }, (_, i) => i).map((i) => {
                const on = active === i;
                return (
                  <button
                    key={i} onClick={() => setActive(i)}
                    style={{ flex: isMobile ? '0 0 auto' : undefined, width: isMobile ? 66 : '100%', aspectRatio: '4 / 5', borderRadius: 10, overflow: 'hidden', padding: 0, cursor: 'pointer', background: '#000', border: on ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.14)', boxShadow: on ? '0 0 18px rgba(251,191,36,0.35)' : 'none', opacity: on ? 1 : 0.72, transition: 'opacity .15s, border-color .15s' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${BASE}${i + 1}.jpg`} alt={`영상 ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
