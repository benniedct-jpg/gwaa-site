'use client';

import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

/* ────────────────────────────────────────────────────────────
   2026 고성 미션트레킹 & 힐링 비치 · 행사 후기(RECAP)
   ────────────────────────────────────────────────────────────
   ▸ 공개 스위치: RECAP_PUBLISHED=false → 일반 방문자에겐 숨김.
     사진 확정 후 true 로 바꾸고 배포하면 공개.
   ▸ 비공개 상태에서도 URL 뒤에 ?recap=preview 붙이면 미리보기.
     예) https://gwaa.or.kr/events/2?recap=preview
   ▸ 사진 교체: 각 그룹 base 폴더(/public/images/events/...) 의 파일명을 photos 에.
   ──────────────────────────────────────────────────────────── */

const RECAP_PUBLISHED = false; // ← 공개할 때 true 로
const RATIO = '4 / 5';

const G: {
  hero: string; intro: string;
  stats: { big: string; label: string }[];
  groups: { eyebrow: string; title: string; base: string; photos: string[] }[];
  reviews: { text: string; who: string }[];
} = {
  hero: '/images/events/beach-gosung-2025/01.webp',
  intro: '반려견과 함께 걷고, 고성 바다에서 쉬어간 하루의 기록.',
  // 숫자(참가자·반려견 수)가 확정되면 여기에 채우면 리캡 숫자 카드가 나타납니다. 비워두면 표시 안 함.
  stats: [] as { big: string; label: string }[],
  groups: [
    { eyebrow: 'MISSION TREK', title: '미션 트레킹', base: '/images/events/gosung-trek-2025', photos: ['01.webp', '02.webp', '03.webp', '04.webp', '05.webp', '06.webp'] },
    { eyebrow: 'HEALING BEACH', title: '힐링 비치', base: '/images/events/beach-gosung-2025', photos: ['02.webp', '03.webp', '04.webp', '05.webp', '06.webp', '07.webp'] },
    { eyebrow: 'REST & CHILL', title: '썬베드 · 힐링', base: '/images/events/sunbed-gosung-2025', photos: ['01.webp', '02.webp', '03.webp', '04.webp', '05.webp', '06.webp'] },
  ],
  reviews: [],
};

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const GREEN = '#16a34a';
const GREEN_DK = '#15803d';
const MUTED = '#6b7280';

export default function RecapGosung() {
  const isMobile = useIsMobile();
  const [show, setShow] = useState(RECAP_PUBLISHED);
  const [preview, setPreview] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).get('recap') === 'preview') { setPreview(true); setShow(true); }
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  if (!show) return null;

  const wrap: React.CSSProperties = { maxWidth: 960, margin: '0 auto', padding: isMobile ? '0 18px 44px' : '0 24px 64px' };
  const Eyebrow = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <span style={{ width: 20, height: 2, background: GREEN, borderRadius: 1 }} />
      <span style={{ fontFamily: MONO, fontSize: 11, color: GREEN, letterSpacing: '0.08em', fontWeight: 700 }}>{children}</span>
    </div>
  );

  return (
    <section id="recap" style={{ background: 'linear-gradient(#ffffff,#f6faf6)', paddingTop: isMobile ? 40 : 56, borderTop: '1px solid #eef2ee', marginTop: 8 }}>
      {preview && (
        <div style={{ position: 'sticky', top: 0, zIndex: 40, background: '#111827', color: '#fff', textAlign: 'center', fontSize: 12.5, padding: '7px 12px', fontWeight: 700 }}>
          🔒 미리보기 · 일반 방문자에겐 안 보여요 (공개하려면 RECAP_PUBLISHED = true)
        </div>
      )}
      <div style={wrap}>
        <Eyebrow>RECAP 2026</Eyebrow>
        <h2 style={{ fontFamily: BEBAS, fontWeight: 800, fontSize: isMobile ? 28 : 38, color: '#111', letterSpacing: '0.01em', lineHeight: 1.12, marginBottom: 8, wordBreak: 'keep-all' }}>
          2026 고성 미션트레킹 &amp; 힐링 비치
        </h2>
        <p style={{ fontSize: isMobile ? 14 : 15, color: MUTED, lineHeight: 1.7, marginBottom: isMobile ? 20 : 26, wordBreak: 'keep-all' }}>{G.intro}</p>

        {/* 히어로 */}
        <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e8e8e8', marginBottom: isMobile ? 18 : 24, lineHeight: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={G.hero} alt="2026 고성 미션트레킹 & 힐링 비치 대표 이미지" style={{ width: '100%', display: 'block' }} />
        </div>

        {/* 리캡 숫자 */}
        {G.stats.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? 10 : 14, marginBottom: isMobile ? 28 : 40 }}>
            {G.stats.map((s, i) => (
              <div key={i} style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: 14, padding: isMobile ? '16px 12px' : '20px 16px', textAlign: 'center' }}>
                <div style={{ fontFamily: BEBAS, fontSize: isMobile ? 20 : 25, color: '#111', letterSpacing: '0.01em', lineHeight: 1.1 }}>{s.big || (preview ? '—' : '')}</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 4, wordBreak: 'keep-all', lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* 주제별 갤러리 */}
        {G.groups.map((g) => (
          <div key={g.title} style={{ marginBottom: isMobile ? 30 : 44 }}>
            <Eyebrow>{g.eyebrow}</Eyebrow>
            <h3 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#111', marginBottom: 14, wordBreak: 'keep-all' }}>{g.title}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: isMobile ? 8 : 12 }}>
              {g.photos.map((p) => {
                const url = `${g.base}/${p}`;
                return (
                  <button key={p} type="button" onClick={() => setLightbox(url)} style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 12, overflow: 'hidden', lineHeight: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={g.title} loading="lazy" style={{ width: '100%', aspectRatio: RATIO, objectFit: 'cover', display: 'block', borderRadius: 12, border: '1px solid #e8e8e8' }} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* 후기 */}
        {(G.reviews.length > 0 || preview) && (
          <div style={{ marginTop: isMobile ? 8 : 12 }}>
            <Eyebrow>VOICES</Eyebrow>
            <h3 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#111', marginBottom: 14 }}>참가자 후기</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: isMobile ? 10 : 14 }}>
              {(G.reviews.length ? G.reviews : (preview ? [{ text: '후기가 여기에 들어가요. (짧고 자연스럽게 2~3개)', who: '○○님' }] : [])).map((r, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, padding: isMobile ? '16px 18px' : '20px 22px' }}>
                  <p style={{ fontSize: 14.5, color: '#111', lineHeight: 1.7, wordBreak: 'keep-all', margin: 0 }}>&ldquo;{r.text}&rdquo;</p>
                  <div style={{ fontSize: 12.5, color: GREEN_DK, fontWeight: 700, marginTop: 10 }}>— {r.who}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8, display: 'block' }} />
        </div>
      )}
    </section>
  );
}
