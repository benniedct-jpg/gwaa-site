'use client';

import { useEffect, useMemo, useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { dedupeImages, seededShuffle } from '@/lib/galleryImages';

/* 흐르는 후기 갤러리 — 여러 열이 서로 반대 방향으로 무한 스크롤.
   중복 사진은 대표 한 장으로 통일하고, 전체를 랜덤 믹싱해 비슷한 컷이 뭉치지 않게 한다. */
export default function FlowingGallery({
  images,
  seed = 20260929,
  max = 48,
}: {
  images: (string | null | undefined)[];
  seed?: number;
  max?: number;
}) {
  const isMobile = useIsMobile();
  const [lightbox, setLightbox] = useState<string | null>(null);

  const pool = useMemo(
    () => seededShuffle(dedupeImages(images), seed).slice(0, max),
    [images, seed, max],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  if (pool.length < 3) return null;

  const NCOL = isMobile ? 2 : 4;
  const cols = Array.from({ length: NCOL }, (_, c) => pool.filter((_, i) => i % NCOL === c));
  const durs = isMobile ? [58, 74] : [76, 94, 66, 86];
  const wallH = isMobile ? 'min(720px, 76vh)' : 'min(1000px, 84vh)';

  return (
    <div style={{ padding: isMobile ? '0 20px 40px' : '0 60px 56px', background: '#fff' }}>
      <div className="fg-wall" style={{ height: wallH, display: 'flex', gap: isMobile ? 8 : 12 }}>
        {cols.map((col, ci) => {
          const track = col.length ? [...col, ...col] : [];
          return (
            <div key={ci} style={{ flex: 1, overflow: 'hidden' }}>
              <div
                className="fg-track"
                style={{
                  display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 12,
                  animationDuration: durs[ci % durs.length] + 's',
                  animationDirection: ci % 2 ? 'reverse' : 'normal',
                }}
              >
                {track.map((p, i) => (
                  <button
                    key={p + i}
                    type="button"
                    onClick={() => setLightbox(p)}
                    aria-label="사진 크게 보기"
                    style={{ padding: 0, border: 'none', background: 'none', cursor: 'zoom-in', width: '100%', borderRadius: 12, overflow: 'hidden', lineHeight: 0 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p} alt="" loading="lazy" style={{ width: '100%', display: 'block', borderRadius: 12, border: '1px solid #ececec' }} />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .fg-wall { -webkit-mask-image: linear-gradient(180deg, transparent, #000 7%, #000 93%, transparent); mask-image: linear-gradient(180deg, transparent, #000 7%, #000 93%, transparent); }
        .fg-track { animation-name: fgScrollY; animation-timing-function: linear; animation-iteration-count: infinite; will-change: transform; }
        .fg-wall:hover .fg-track, .fg-wall:focus-within .fg-track { animation-play-state: paused; }
        @keyframes fgScrollY { from { transform: translateY(0); } to { transform: translateY(-50%); } }
      `}</style>

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8, display: 'block' }} />
        </div>
      )}
    </div>
  );
}
