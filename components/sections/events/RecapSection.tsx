'use client';

import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

/* ────────────────────────────────────────────────────────────
   2026 Camping with Petscout · 행사 후기(RECAP) 갤러리
   ────────────────────────────────────────────────────────────
   ▸ 공개 스위치: RECAP_PUBLISHED = false → 일반 방문자에겐 안 보임.
     행사 끝나고 사진 채운 뒤 true 로 바꾸고 배포하면 공개됨.
   ▸ 비공개 상태에서도 URL 뒤에 ?recap=preview 붙이면 나만 미리보기 가능.
     예) https://gwaa.or.kr/events/3?recap=preview
   ▸ 사진 채우는 법: /public/images/events/jamboree-2026/recap/ 에 이미지 올리고
     아래 RECAP.groups[].photos 배열에 파일명만 적으면 됨(경로 자동).
   ──────────────────────────────────────────────────────────── */

const RECAP_PUBLISHED = false; // ← 공개할 때 true 로

const BASE = '/images/events/jamboree-2026/recap';
const RATIO = '4 / 5'; // 그리드 사진 통일 비율(전부 같은 비율 = 통일감의 핵심)

const RECAP: {
  heroVideo: string; heroPoster: string; heroImage: string; intro: string;
  stats: { big: string; label: string }[];
  groups: { eyebrow: string; title: string; photos: string[] }[];
  reviews: { text: string; who: string }[];
} = {
  heroVideo: '',   // 예: `${BASE}/hero.mp4` (있으면 영상 히어로 · 자동재생 루프)
  heroPoster: '',  // 영상 포스터 이미지
  heroImage: '',   // 영상 없을 때 대형 사진 예: `${BASE}/hero.webp`
  intro: '반려견과 함께한 사흘, 그 순간들의 기록.',
  stats: [
    { big: '', label: '함께한 참가팀' },
    { big: '', label: '반려견 친구들' },
    { big: '5팀', label: '인디밴드·이박사 라이브' },
    { big: '전원', label: '웰컴키트' },
  ],
  groups: [
    { eyebrow: 'DAYTIME', title: '낮, 축제의 시작', photos: [] },
    { eyebrow: 'STAGE & NIGHT', title: '밤, 무대와 캠프파이어', photos: [] },
    { eyebrow: 'OFF-LEASH', title: '반려견과 오프리쉬', photos: [] },
    { eyebrow: 'WELLNESS', title: '숲속 사우나·힐링', photos: [] },
  ],
  reviews: [], // { text: '정말 최고였어요…', who: '○○님' }
};

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const GREEN = '#16a34a';
const GREEN_DK = '#15803d';
const MUTED = '#6b7280';

const src = (f: string) => (f.startsWith('/') || f.startsWith('http') ? f : `${BASE}/${f}`);

export default function RecapSection() {
  const isMobile = useIsMobile();
  const [show, setShow] = useState(RECAP_PUBLISHED);
  const [preview, setPreview] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).get('recap') === 'preview') {
      setPreview(true); setShow(true);
    }
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

  // 미리보기에서 사진이 아직 없으면 배치 확인용 스켈레톤 타일
  const skeleton = (n: number) => Array.from({ length: n }).map((_, i) => (
    <div key={`sk${i}`} style={{ aspectRatio: RATIO, borderRadius: 12, border: '1.5px dashed #cbd5e1', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 12 }}>사진 예정</div>
  ));

  return (
    <section id="recap" style={{ background: 'linear-gradient(#ffffff,#f6faf6)', paddingTop: isMobile ? 40 : 56, borderTop: '1px solid #eef2ee' }}>
      {preview && (
        <div style={{ position: 'sticky', top: 0, zIndex: 40, background: '#111827', color: '#fff', textAlign: 'center', fontSize: 12.5, padding: '7px 12px', fontWeight: 700 }}>
          🔒 미리보기 · 일반 방문자에겐 안 보여요 (공개하려면 RECAP_PUBLISHED = true)
        </div>
      )}

      <div style={wrap}>
        <Eyebrow>RECAP 2026</Eyebrow>
        <h2 style={{ fontFamily: BEBAS, fontWeight: 800, fontSize: isMobile ? 30 : 40, color: '#111', letterSpacing: '0.01em', lineHeight: 1.12, marginBottom: 8, wordBreak: 'keep-all' }}>
          2026 Camping with Petscout
        </h2>
        <p style={{ fontSize: isMobile ? 14 : 15, color: MUTED, lineHeight: 1.7, marginBottom: isMobile ? 20 : 26, wordBreak: 'keep-all' }}>{RECAP.intro}</p>

        {/* 히어로: 영상 > 사진 > (미리보기) 플레이스홀더 */}
        {(RECAP.heroVideo || RECAP.heroImage || preview) && (
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e8e8e8', background: '#000', lineHeight: 0, marginBottom: isMobile ? 18 : 24 }}>
            {RECAP.heroVideo ? (
              <video src={RECAP.heroVideo} poster={RECAP.heroPoster || undefined} autoPlay muted loop playsInline preload="metadata" style={{ width: '100%', display: 'block' }} />
            ) : RECAP.heroImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={src(RECAP.heroImage)} alt="2026 펫스카웃 후기 대표 이미지" style={{ width: '100%', display: 'block' }} />
            ) : (
              <div style={{ aspectRatio: '16 / 9', background: 'repeating-linear-gradient(45deg,#111,#111 12px,#1a1a1a 12px,#1a1a1a 24px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>히어로 영상/사진 자리 (RECAP.heroVideo 또는 heroImage)</div>
            )}
          </div>
        )}

        {/* 리캡 숫자 */}
        {RECAP.stats.some((s) => s.big) || preview ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? 10 : 14, marginBottom: isMobile ? 28 : 40 }}>
            {RECAP.stats.map((s, i) => (
              <div key={i} style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: 14, padding: isMobile ? '16px 12px' : '20px 16px', textAlign: 'center' }}>
                <div style={{ fontFamily: BEBAS, fontSize: isMobile ? 22 : 27, color: '#111', letterSpacing: '0.01em', lineHeight: 1.1 }}>{s.big || (preview ? '—' : '')}</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 4, wordBreak: 'keep-all', lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        ) : null}

        {/* 주제별 갤러리 그리드 */}
        {RECAP.groups.map((g) => {
          const hasPhotos = g.photos.length > 0;
          if (!hasPhotos && !preview) return null; // 공개 상태에선 빈 그룹 숨김
          return (
            <div key={g.title} style={{ marginBottom: isMobile ? 30 : 44 }}>
              <Eyebrow>{g.eyebrow}</Eyebrow>
              <h3 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#111', marginBottom: 14, wordBreak: 'keep-all' }}>{g.title}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: isMobile ? 8 : 12 }}>
                {hasPhotos
                  ? g.photos.map((p) => (
                    <button key={p} type="button" onClick={() => setLightbox(src(p))} style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 12, overflow: 'hidden', lineHeight: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src(p)} alt={g.title} loading="lazy" style={{ width: '100%', aspectRatio: RATIO, objectFit: 'cover', display: 'block', borderRadius: 12, border: '1px solid #e8e8e8' }} />
                    </button>
                  ))
                  : skeleton(isMobile ? 2 : 3)}
              </div>
            </div>
          );
        })}

        {/* 짧은 후기 */}
        {(RECAP.reviews.length > 0 || preview) && (
          <div style={{ marginTop: isMobile ? 8 : 12 }}>
            <Eyebrow>VOICES</Eyebrow>
            <h3 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#111', marginBottom: 14 }}>참가자 후기</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: isMobile ? 10 : 14 }}>
              {(RECAP.reviews.length ? RECAP.reviews : (preview ? [{ text: '후기가 여기에 들어가요. (짧고 자연스럽게 2~3개)', who: '○○님' }] : [])).map((r, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, padding: isMobile ? '16px 18px' : '20px 22px' }}>
                  <p style={{ fontSize: 14.5, color: '#111', lineHeight: 1.7, wordBreak: 'keep-all', margin: 0 }}>&ldquo;{r.text}&rdquo;</p>
                  <div style={{ fontSize: 12.5, color: GREEN_DK, fontWeight: 700, marginTop: 10 }}>— {r.who}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 라이트박스 */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8, display: 'block' }} />
        </div>
      )}
    </section>
  );
}
