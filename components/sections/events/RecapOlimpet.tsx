'use client';

import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

/* ────────────────────────────────────────────────────────────
   2026 강릉시 반려동물 문화축제 「올림펫」 · 행사 후기(RECAP) 갤러리
   ────────────────────────────────────────────────────────────
   ▸ 공개 스위치: RECAP_PUBLISHED = false → 일반 방문자에겐 안 보임.
     사진 채운 뒤 true 로 바꾸고 배포하면 공개됨.
   ▸ 비공개 상태에서도 URL 뒤에 ?recap=preview 붙이면 미리보기 가능.
     예) https://gwaa.or.kr/events/4?recap=preview
   ▸ 사진 채우는 법: /public/images/events/olimpet-2026/recap/ 에 이미지 올리고
     아래 RECAP.groups[].photos 배열에 파일명만 적으면 됨(경로 자동).
     흐르는 세로 컬럼 벽이라 그룹 구분 없이 전부 합쳐 흐름 — 그룹은 관리용 묶음일 뿐.
   ──────────────────────────────────────────────────────────── */

const RECAP_PUBLISHED = true; // ← 사진 채우면 true 로

const BASE = '/images/events/olimpet-2026/recap';

const RECAP: {
  heroVideo: string; heroPoster: string; heroImage: string; intro: string;
  stats: { big: string; label: string }[];
  groups: { eyebrow: string; title: string; photos: string[] }[];
  videos: string[];
  reviews: { text: string; who: string }[];
} = {
  heroVideo: '',
  heroPoster: '',
  heroImage: '',
  intro: '강릉종합운동장을 가득 채운 하루, 반려견과 함께한 올림펫의 순간들을 기록했어요.',
  stats: [],
  groups: [
    { eyebrow: 'GALLERY', title: '흐르는 그날의 장면들', photos: [
      'p01.webp','p02.webp','p03.webp','p04.webp','p05.webp','p06.webp','p07.webp','p08.webp','p09.webp','p10.webp','p11.webp',
      'p12.webp','p13.webp','p14.webp','p15.webp','p16.webp','p17.webp','p18.webp','p19.webp','p20.webp','p21.webp','p22.webp',
      'p23.webp','p24.webp','p25.webp','p26.webp','p27.webp','p28.webp','p29.webp','p30.webp','p31.webp','p32.webp','p33.webp',
      'p34.webp','p35.webp','p36.webp','p37.webp','p38.webp','p39.webp','p40.webp','p41.webp','p42.webp','p43.webp','p44.webp',
    ] },
  ],
  videos: ['clip1.mp4', 'clip2.mp4', 'clip3.mp4', 'clip4.mp4', 'clip5.mp4', 'clip6.mp4', 'clip7.mp4'],
  reviews: [],
};

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const GREEN = '#12A79D';
const GREEN_DK = '#0D7E76';

const src = (f: string) => (f.startsWith('/') || f.startsWith('http') ? f : `${BASE}/${f}`);
const isVideo = (f: string) => /\.(mp4|webm|mov)$/i.test(f);

export default function RecapOlimpet() {
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

  return (
    <section id="recap" style={{ background: 'radial-gradient(1200px 620px at 50% -8%, #16241d, #0b0f0d 62%)', color: '#fff', paddingTop: isMobile ? 44 : 64, paddingBottom: isMobile ? 24 : 40, borderTop: 'none', overflowX: 'clip' }}>
      {preview && (
        <div style={{ position: 'sticky', top: 0, zIndex: 40, background: '#111827', color: '#fff', textAlign: 'center', fontSize: 12.5, padding: '7px 12px', fontWeight: 700 }}>
          🔒 미리보기 · 일반 방문자에겐 안 보여요 (공개하려면 RECAP_PUBLISHED = true)
        </div>
      )}

      <div style={wrap}>
        <Eyebrow>RECAP 2026</Eyebrow>
        <h2 style={{ fontFamily: BEBAS, fontWeight: 800, fontSize: isMobile ? 36 : 56, color: '#fff', letterSpacing: '0.01em', lineHeight: 1.06, marginBottom: 8, wordBreak: 'keep-all' }}>
          2026 강릉 올림펫
        </h2>
        <p style={{ fontSize: isMobile ? 14 : 15.5, color: '#cbd5e1', lineHeight: 1.7, marginBottom: isMobile ? 20 : 26, wordBreak: 'keep-all' }}>{RECAP.intro}</p>

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
              <div key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: isMobile ? '16px 12px' : '20px 16px', textAlign: 'center' }}>
                <div style={{ fontFamily: BEBAS, fontSize: isMobile ? 24 : 30, color: '#fff', letterSpacing: '0.01em', lineHeight: 1.1 }}>{s.big || (preview ? '—' : '')}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, wordBreak: 'keep-all', lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        ) : null}

        {/* 흐르는 갤러리 — 3줄이 서로 반대 방향으로 무한 스크롤 (한눈에 다 안 잡히는 몰입감) */}
        {(() => {
          const all = RECAP.groups.flatMap((g) => g.photos);
          if (!all.length && !preview) return null;
          const NCOL = isMobile ? 3 : 5;
          const cols = Array.from({ length: NCOL }, (_, c) => all.filter((_, i) => i % NCOL === c));
          const durs = isMobile ? [56, 72, 64] : [74, 92, 64, 84, 70];
          const wallH = isMobile ? 'min(760px, 80vh)' : 'min(1120px, 90vh)';
          return (
            <div style={{ marginBottom: isMobile ? 30 : 44 }}>
              <Eyebrow>GALLERY</Eyebrow>
              <h3 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#fff', marginBottom: 14, wordBreak: 'keep-all' }}>흐르는 그날의 장면들</h3>
              <div className="mqy" style={{ height: wallH, display: 'flex', gap: isMobile ? 8 : 12, width: '100vw', marginLeft: 'calc(50% - 50vw)', paddingInline: isMobile ? 10 : 16, boxSizing: 'border-box' }}>
                {cols.map((col, ci) => {
                  const track = col.length ? [...col, ...col] : [];
                  return (
                    <div key={ci} style={{ flex: 1, overflow: 'hidden' }}>
                      <div className="mqy-track" style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 12, animationDuration: durs[ci % durs.length] + 's', animationDirection: ci % 2 ? 'reverse' : 'normal' }}>
                        {track.map((p, i) => (
                          <button key={p + i} type="button" onClick={() => setLightbox(src(p))} aria-label="사진 크게 보기" style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', width: '100%', borderRadius: 10, overflow: 'hidden', lineHeight: 0 }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src(p)} alt="" style={{ width: '100%', display: 'block', borderRadius: 10, border: '1px solid #e8e8e8' }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* 흐르는 영상 — 자동재생 무음 루프가 옆으로 흐름, 탭하면 소리와 함께 크게 */}
        {RECAP.videos.length > 0 && (
          <div style={{ marginBottom: isMobile ? 30 : 44 }}>
            <Eyebrow>MOVIE</Eyebrow>
            <h3 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#fff', marginBottom: 4, wordBreak: 'keep-all' }}>영상으로 흐르는 그날</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>영상을 탭하면 소리와 함께 크게 볼 수 있어요</p>
            <div className="mq" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', paddingInline: isMobile ? 10 : 16, boxSizing: 'border-box' }}>
              <div className="mq-track" style={{ display: 'flex', gap: isMobile ? 10 : 14, width: 'max-content', animationDuration: (isMobile ? 50 : 66) + 's' }}>
                {[...RECAP.videos, ...RECAP.videos].map((v, i) => {
                  const VH = isMobile ? 210 : 300;
                  return (
                    <button key={v + i} type="button" onClick={() => setLightbox(src(v))} aria-label="영상 크게 보기" style={{ padding: 0, border: '1px solid #e8e8e8', background: '#000', cursor: 'pointer', height: VH, aspectRatio: '9 / 14', borderRadius: 12, overflow: 'hidden', flex: '0 0 auto', position: 'relative', lineHeight: 0 }}>
                      <video src={src(v)} autoPlay muted loop playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center bottom', display: 'block' }} />
                      <span style={{ position: 'absolute', right: 8, bottom: 8, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden>
                        <span style={{ width: 0, height: 0, borderLeft: '8px solid #fff', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', marginLeft: 2 }} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 짧은 후기 */}
        {(RECAP.reviews.length > 0 || preview) && (
          <div style={{ marginTop: isMobile ? 8 : 12 }}>
            <Eyebrow>VOICES</Eyebrow>
            <h3 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#fff', marginBottom: 14 }}>참가자 후기</h3>
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

      {/* marquee 애니메이션 */}
      <style>{`
        .mq { overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent); mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent); }
        .mq-track { animation-name: mqscroll; animation-timing-function: linear; animation-iteration-count: infinite; will-change: transform; }
        .mq:hover .mq-track, .mq:focus-within .mq-track { animation-play-state: paused; }
        @keyframes mqscroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .mqy { overflow: hidden; -webkit-mask-image: linear-gradient(180deg, transparent, #000 7%, #000 93%, transparent); mask-image: linear-gradient(180deg, transparent, #000 7%, #000 93%, transparent); }
        .mqy-track { animation-name: mqscrollY; animation-timing-function: linear; animation-iteration-count: infinite; will-change: transform; }
        .mqy:hover .mqy-track, .mqy:focus-within .mqy-track { animation-play-state: paused; }
        @keyframes mqscrollY { from { transform: translateY(0); } to { transform: translateY(-50%); } }
      `}</style>

      {/* 라이트박스 (사진·영상 공용) */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out' }}>
          {isVideo(lightbox) ? (
            <video src={lightbox} controls autoPlay playsInline onClick={(e) => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8, display: 'block' }} />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={lightbox} alt="" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8, display: 'block' }} />
          )}
        </div>
      )}
    </section>
  );
}
