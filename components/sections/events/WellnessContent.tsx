'use client';

import { useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

const RECAP_PHOTOS = Array.from({ length: 11 }, (_, i) => `/images/events/wonju-2026/recap/photo-${String(i + 1).padStart(2, '0')}.webp`);
const RECAP_CLIP_COUNT = 14;
const RECAP_VIDEO_BASE = 'https://hanvzguytjjmrwbhfoei.supabase.co/storage/v1/object/public/gwaa-videos/events/wonju-2026/recap';
const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const TEAL = '#12A79D';

// 번호 스텝 아이템
function Step({ n, color, isMobile, children }: { n: number; color: string; isMobile: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 7, background: color, color: '#fff', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>{n}</span>
      <div style={{ fontSize: isMobile ? 14 : 15.5, color: '#374151', lineHeight: 1.7, wordBreak: 'keep-all' }}>{children}</div>
    </div>
  );
}

// 포스터형 이미지 (클릭 시 확대)
function Poster({ src, alt, max, accent }: { src: string; alt: string; max: number; accent: string }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ background: '#f9fafb', border: '1px solid #eceff2', borderRadius: 16, padding: isMobile ? '16px' : '22px', display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          onClick={() => setOpen(true)}
          style={{ width: '100%', maxWidth: isMobile ? '100%' : max, height: 'auto', borderRadius: 12, boxShadow: `0 8px 26px ${accent}22`, display: 'block', cursor: 'zoom-in' }}
        />
      </div>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.86)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} style={{ maxWidth: '100%', maxHeight: '92vh', borderRadius: 10, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} />
        </div>
      )}
    </>
  );
}

export default function WellnessContent() {
  const isMobile = useIsMobile();
  const [zoom, setZoom] = useState<string | null>(null);

  const wrap: React.CSSProperties = { marginTop: 8 };
  const section: React.CSSProperties = { marginBottom: isMobile ? 44 : 60 };
  const eyebrowRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 };
  const eyebrowBar = (color: string): React.CSSProperties => ({ width: 20, height: 2, background: color, borderRadius: 1 });
  const eyebrowTxt = (color: string): React.CSSProperties => ({ fontFamily: MONO, fontSize: 11, color, letterSpacing: '0.1em', fontWeight: 700 });
  const h2: React.CSSProperties = { fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#111', lineHeight: 1.32, letterSpacing: '-0.01em', marginBottom: 12, wordBreak: 'keep-all' };
  const body: React.CSSProperties = { fontSize: isMobile ? 14.5 : 16, color: '#374151', lineHeight: 1.8, wordBreak: 'keep-all' };

  const zones: { en: string; ko: string; desc: string; color: string }[] = [
    { en: 'OFF-LEASH', ko: '오프리쉬 놀이터', desc: '목줄을 풀고 마음껏! 소형견·대형견 오프리쉬, 프라이빗 존, 노즈워크 미로찾기까지 우리 아이 성향에 맞게 즐겨요.', color: '#12A79D' },
    { en: 'HEALTHCARE', ko: '헬스케어 · 웰니스 클래스', desc: '반려견과 보호자가 함께 몸과 마음을 돌보는 웰니스 클래스와 헬스케어 존을 운영해요.', color: '#0ea5e9' },
    { en: 'MARKET', ko: '프리마켓 · 체험부스', desc: '반려동물 셀러들의 프리마켓과 다양한 체험부스에서 구경하고 참여하는 즐거움.', color: '#f59e0b' },
    { en: 'MAIN STAGE', ko: '메인무대 · 미니게임', desc: '메인 무대 공연과 MC가 진행하는 미니게임존에서 가족 모두 함께 즐겨요.', color: '#e11d48' },
    { en: 'PHOTO ZONE', ko: '포토존', desc: '가을 공원을 배경으로 우리 아이의 가장 예쁜 순간을 남겨보세요.', color: '#ec4899' },
    { en: 'ADOPTION', ko: '유기견 입양 홍보', desc: '새로운 가족을 기다리는 유기견 입양 홍보 부스로 따뜻한 발걸음을 이어가요.', color: '#8b5cf6' },
  ];

  return (
    <div style={wrap}>
      {/* 리캡 — 드론 영상 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar(TEAL)} /><span style={eyebrowTxt(TEAL)}>RECAP</span></div>
        <h2 style={h2}>함께해 주신 모든 분들, 고마웠습니다</h2>
        <p style={{ ...body, marginBottom: 16 }}>
          2026년 10월 17일, 원주천 로아노크광장. 하늘에서 담은 그날의 기록입니다.
          만족도 조사에 참여해 주신 모든 분들께 감사드립니다 — 내년에 더 좋은 모습으로 돌아올게요.
        </p>
        <video
          src="/images/events/wonju-2026/recap-loop.mp4"
          autoPlay muted loop playsInline
          style={{ width: '100%', borderRadius: 16, display: 'block', background: '#0a0a0a' }}
          aria-label="웰니스클럽 행사장 드론 영상"
        />
      </div>

      {/* 현장 스케치 — 사진 스와이프 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar('#f59e0b')} /><span style={eyebrowTxt('#f59e0b')}>PHOTO SKETCH</span></div>
        <h2 style={h2}>현장 스케치</h2>
        <p style={{ ...body, marginBottom: 6 }}>
          핸드팬 연주부터 오프리쉬 놀이터, 빈백에 앉아 즐긴 공연까지 — 사진으로 남긴 그날의 장면들.
        </p>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>옆으로 넘겨보세요 · 누르면 크게 볼 수 있어요</p>
        <div className="sketch-strip" style={{ display: 'flex', gap: isMobile ? 8 : 12, overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', paddingBottom: 6 }}>
          {RECAP_PHOTOS.map((photo, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo}
              src={photo}
              alt={`웰니스클럽 현장 사진 ${i + 1}`}
              loading="lazy"
              onClick={() => setZoom(photo)}
              style={{ height: isMobile ? 240 : 340, width: 'auto', flex: '0 0 auto', scrollSnapAlign: 'start', borderRadius: 12, display: 'block', cursor: 'zoom-in', background: '#f3f4f6' }}
            />
          ))}
        </div>
      </div>

      {/* 현장 스케치 — 영상 스와이프 (자동재생 루프) */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar('#e11d48')} /><span style={eyebrowTxt('#e11d48')}>VIDEO SKETCH</span></div>
        <h2 style={h2}>영상으로 다시 보는 웰니스클럽</h2>
        <p style={{ ...body, marginBottom: 6 }}>
          짧게 담은 현장 영상 {RECAP_CLIP_COUNT}편이 무음으로 흐릅니다.
        </p>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>옆으로 넘겨보세요 · 영상을 누르면 소리와 함께 크게 재생돼요</p>
        <div className="sketch-strip" style={{ display: 'flex', gap: isMobile ? 8 : 12, overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', paddingBottom: 6 }}>
          {Array.from({ length: RECAP_CLIP_COUNT }, (_, i) => {
            const n = String(i + 1).padStart(2, '0');
            const vsrc = `${RECAP_VIDEO_BASE}/clip-${n}.mp4`;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setZoom(vsrc)}
                aria-label={`웰니스클럽 현장 영상 ${i + 1} 크게 보기`}
                style={{ padding: 0, border: 'none', background: '#0a0a0a', cursor: 'pointer', height: isMobile ? 240 : 340, aspectRatio: '9/16', flex: '0 0 auto', scrollSnapAlign: 'start', borderRadius: 12, overflow: 'hidden', position: 'relative', lineHeight: 0 }}
              >
                <video
                  src={vsrc}
                  poster={`/images/events/wonju-2026/recap/clip-${n}-poster.webp`}
                  autoPlay muted loop playsInline preload="metadata"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <span style={{ position: 'absolute', right: 8, bottom: 8, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden>
                  <span style={{ width: 0, height: 0, borderLeft: '8px solid #fff', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', marginLeft: 2 }} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`.sketch-strip { scrollbar-width: thin; } .sketch-strip::-webkit-scrollbar { height: 6px; } .sketch-strip::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }`}</style>

      {/* 라이트박스 — 사진·영상 공용 */}
      {zoom && (
        <div
          onClick={() => setZoom(null)}
          role="button"
          aria-label="닫기"
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: 16 }}
        >
          {/\.(mp4|webm|mov)$/i.test(zoom) ? (
            <video src={zoom} controls autoPlay playsInline onClick={(e) => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '92vh', borderRadius: 12, display: 'block' }} />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={zoom} alt="웰니스클럽 현장 확대" style={{ maxWidth: '100%', maxHeight: '92vh', borderRadius: 12 }} />
          )}
        </div>
      )}

      {/* 인트로 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar(TEAL)} /><span style={eyebrowTxt(TEAL)}>PROGRAM GUIDE</span></div>
        <h2 style={h2}>웰니스클럽, 이렇게 즐겼습니다</h2>
        <p style={body}>
          원주천 <b>로아노크광장</b>에서 하루 종일 열린 <b>웰니스클럽</b>.
          오프리쉬 놀이터, 무대 공연, 스탬프 투어, 셀러부스 18팀, 헬스케어, 포토존까지 —
          존마다 다른 재미로 가득했던 하루를 기록으로 남깁니다.
        </p>
      </div>

      {/* 3D 행사장 미리보기 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar('#12302a')} /><span style={eyebrowTxt('#12302a')}>3D PREVIEW</span></div>
        <a
          href="/wonju-2026/3d.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', textDecoration: 'none', borderRadius: 16, overflow: 'hidden', background: '#12302a', color: '#e4f2ea' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '5fr 4fr' }}>
            {/* 썸네일 */}
            <div style={{ background: '#0c2218', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? 0 : '12px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/wonju-2026/og-3d.jpg"
                alt="웰니스클럽 행사장 3D 전경"
                style={{ width: '100%', aspectRatio: '1200/630', objectFit: 'contain', display: 'block' }}
              />
            </div>
            {/* 설명 */}
            <div style={{ padding: isMobile ? '20px 20px 24px' : '28px 26px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', color: '#8fbfb8', fontWeight: 700 }}>10.17 (토) · 로아노크광장</div>
              <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.01em', wordBreak: 'keep-all' }}>
                행사장을 3D로<br />미리 둘러보세요
              </div>
              <p style={{ fontSize: isMobile ? 13 : 14, color: '#a8d4cc', lineHeight: 1.7, margin: 0, wordBreak: 'keep-all' }}>
                무대 시간표, 셀러·체험부스, 오프리쉬존, 주차장 위치를 하늘에서 보고, 걸어서도 가볼 수 있어요.
              </p>
              {/* 기능 뱃지 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['무대 시간표', '존별 탐색', '걸어서 보기', '내 위치', '우리 강아지'].map((t) => (
                  <span key={t} style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, letterSpacing: '0.05em', padding: '4px 9px', borderRadius: 99, border: '1px solid rgba(228,242,234,0.3)', color: '#c8e6e2' }}>{t}</span>
                ))}
              </div>
              {/* CTA */}
              <div style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 8, background: '#ff6a3d', color: '#12302a', fontSize: 14, fontWeight: 700, alignSelf: 'flex-start' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                3D로 행사장 미리보기
              </div>
            </div>
          </div>
        </a>
      </div>

      {/* 행사장 지도 — 최상단 강조 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar('#f59e0b')} /><span style={eyebrowTxt('#f59e0b')}>VENUE MAP</span></div>
        <h2 style={h2}>한눈에 보는 행사장 동선</h2>
        <p style={body}>
          메인 무대와 헬스케어·웰니스 존, 셀러 프리마켓과 체험·미니게임, 포토존, 그리고 반려견이 마음껏 달리는
          오프리쉬 놀이터(소형견·대형견·프라이빗·노즈워크 미로찾기)까지. 도착 전에 동선을 미리 봐두면
          기다림 없이 알차게 즐길 수 있어요. 푸드존·유기견 입양 홍보 위치도 지도에서 확인하세요.
        </p>
        <Poster src="/images/events/wonju-2026/map.webp" alt="웰니스클럽 행사장 지도 — 메인무대, 헬스케어, 셀러 프리마켓, 미니게임, 포토존, 오프리쉬 놀이터(소형견·대형견·프라이빗·노즈워크), 푸드존, 유기견 홍보 위치 안내" max={760} accent="#f59e0b" />
      </div>

      {/* 스탬프 투어 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar('#e11d48')} /><span style={eyebrowTxt('#e11d48')}>STAMP TOUR</span></div>
        <h2 style={h2}>🐾 스탬프 투어로 경품 받아가세요</h2>
        <p style={{ ...body, marginBottom: 20, wordBreak: 'keep-all' }}>
          현장 미니게임 5곳 안내판의 QR을 폰 카메라로 찍으면 스탬프가 모여요. 5개 완성 → 경품존에서 상품!
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Step n={1} color="#e11d48" isMobile={isMobile}>미니게임 5곳 안내판에서 <b>QR 스캔</b> — 따로 앱 설치 없이 카메라만 있으면 돼요.</Step>
          <Step n={2} color="#e11d48" isMobile={isMobile}>폰 화면에 <b>발바닥 스탬프 5개</b>가 채워지면 완성!</Step>
          <Step n={3} color="#e11d48" isMobile={isMobile}><b>경품존(26번 부스)</b>에서 발바닥 5개 찍힌 화면을 보여주시면 상품을 드려요.</Step>
        </div>
        <p style={{ fontSize: isMobile ? 13 : 14, color: '#6b7280', lineHeight: 1.7, marginTop: 14, wordBreak: 'keep-all' }}>
          💡 게임 위치를 모르겠으면 <a href="/wonju-2026/3d.html#stamp-g4" target="_blank" rel="noopener noreferrer" style={{ color: '#e11d48', fontWeight: 700, textDecoration: 'underline' }}>3D 지도에서 &apos;게임이 어디 있는지 보기&apos;</a>를 눌러보세요. 게임 5곳 → 경품존 순서로 길을 안내해 드려요.
        </p>
      </div>

      {/* 존별 프로그램 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar(TEAL)} /><span style={eyebrowTxt(TEAL)}>ZONES</span></div>
        <h2 style={h2}>🐾 존별로 즐기는 웰니스클럽</h2>
        <p style={{ ...body, marginBottom: 16 }}>공원 곳곳에 마련된 존을 따라 걸으며, 반려견과 함께 하루를 알차게 채워보세요.</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
          {zones.map((z) => (
            <div key={z.en} style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: '16px 18px', background: '#fff' }}>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', color: z.color, fontWeight: 800 }}>{z.en}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#111', margin: '6px 0 8px' }}>{z.ko}</div>
              <p style={{ fontSize: isMobile ? 13.5 : 14, color: '#4b5563', lineHeight: 1.65, margin: 0, wordBreak: 'keep-all' }}>{z.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 무대 타임테이블 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar('#e11d48')} /><span style={eyebrowTxt('#e11d48')}>STAGE TIMETABLE</span></div>
        <h2 style={h2}>시간별 무대 프로그램</h2>
        <p style={{ ...body, marginBottom: 20, wordBreak: 'keep-all' }}>
          메인 무대에서 하루 종일 공연과 체험이 이어져요. 원하는 프로그램을 미리 체크해 두세요.
        </p>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
          {/* 헤더 */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '88px 1fr' : '120px 1fr', background: '#f3f4f6', padding: isMobile ? '10px 14px' : '12px 20px', gap: isMobile ? 10 : 16 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color: '#6b7280', letterSpacing: '0.1em' }}>TIME</span>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color: '#6b7280', letterSpacing: '0.1em' }}>PROGRAM</span>
          </div>
          {/* 행 */}
          {[
            { time: '10:30–11:00', program: '핸드팬 악기 연주 (1)' },
            { time: '11:00–12:00', program: '독핏 수업 & 체험 (1)' },
            { time: '12:00–13:30', program: "어쿠스틱 듀오 '조수간만의차' (1)" },
            { time: '13:30–14:00', program: '핸드팬 악기 연주 (2)' },
            { time: '14:00–15:00', program: '독핏 수업 & 체험 (2)' },
            { time: '15:30–16:00', program: "어쿠스틱 듀오 '조수간만의차' (2)" },
            { time: '16:00–16:30', program: '건강하게 집밥 먹이는 방법' },
            { time: '16:30–17:00', program: '어질리티 도그쇼 & 체험' },
          ].map((row, i) => (
            <div
              key={row.time}
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '88px 1fr' : '120px 1fr',
                padding: isMobile ? '12px 14px' : '14px 20px',
                gap: isMobile ? 10 : 16,
                borderTop: '1px solid #e5e7eb',
                background: i % 2 === 0 ? '#fff' : '#fafafa',
                alignItems: 'center',
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: isMobile ? 12 : 13, fontWeight: 700, color: '#e11d48', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>{row.time}</span>
              <span style={{ fontSize: isMobile ? 14 : 15, color: '#111', fontWeight: 500, wordBreak: 'keep-all' }}>{row.program}</span>
            </div>
          ))}
        </div>
        {/* 상시 진행 */}
        <div style={{ marginTop: 16, padding: isMobile ? '14px 16px' : '16px 20px', background: '#f8fafb', borderRadius: 12, border: '1px solid #e5e7eb' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color: '#6b7280', letterSpacing: '0.1em', marginBottom: 8 }}>ALWAYS ON</div>
          <p style={{ fontSize: isMobile ? 13.5 : 14.5, color: '#374151', lineHeight: 1.7, wordBreak: 'keep-all', margin: 0 }}>
            셀러부스 · 체험부스 · 헬스케어 · 입양부스 · 아나바다 · MINI GAME · 오프리쉬 존 · 푸드트럭 · 포토존
          </p>
        </div>
        <p style={{ fontSize: isMobile ? 12.5 : 13.5, color: '#9ca3af', marginTop: 10, lineHeight: 1.6, wordBreak: 'keep-all' }}>
          ※ 현장 사정에 따라 시간이 변동될 수 있습니다.
        </p>
      </div>

      {/* 셀러부스 소개 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar('#2563eb')} /><span style={eyebrowTxt('#2563eb')}>SELLER BOOTHS</span></div>
        <h2 style={h2}>18개 셀러부스를 만나보세요</h2>
        <p style={{ ...body, marginBottom: 20, wordBreak: 'keep-all' }}>
          반려동물 용품·수제간식·굿즈·캐리커처까지 18팀이 한자리에 모였어요.
          번호는 위 행사장 지도의 <b style={{ color: '#2563eb' }}>파란 부스 번호</b>와 같아요 — 가고 싶은 부스를 미리 찜해 두세요.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: isMobile ? 8 : 10 }}>
          {[
            '유빵 캐리커쳐', '엔픽', '꾹펫', '오르밀라', '포레스트 얌', '봄빛정원',
            '망고당', '동키비올레또', '랄라꼬뺑', '댕심', '㈜닥터유', '쏘잉비트',
            '꼬순내공방', '푸른달독', '홍천개아빠', '나투어리베', '뜨개쟁이지니의 작업실', 'LEXUS',
          ].map((name, i) => (
            <div
              key={name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 8 : 10,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: isMobile ? '9px 10px' : '10px 12px',
                minWidth: 0,
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: isMobile ? 24 : 26,
                  height: isMobile ? 24 : 26,
                  borderRadius: 7,
                  background: '#2563eb',
                  color: '#fff',
                  fontFamily: MONO,
                  fontWeight: 800,
                  fontSize: isMobile ? 11.5 : 12.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 600,
                  color: '#1f2937',
                  wordBreak: 'keep-all',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 체험부스 소개 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar('#8b5cf6')} /><span style={eyebrowTxt('#8b5cf6')}>EXPERIENCE BOOTHS</span></div>
        <h2 style={h2}>만들고 배우는 체험부스 8가지</h2>
        <p style={{ ...body, marginBottom: 20, wordBreak: 'keep-all' }}>
          우리 아이 간식부터 샴푸·치약까지 직접 만들어 가져가고, 행동교정 상담으로 고민도 풀어 보세요.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 8 : 10 }}>
          {[
            '클리커 만들기', '연고 만들기', '케이크 만들기', '살랑더테일',
            '샴푸 만들기', '반려견 치약 만들기', '반려견 행동교정', '3D 간식만들기',
          ].map((name) => (
            <span
              key={name}
              style={{
                fontSize: isMobile ? 13 : 14,
                fontWeight: 600,
                color: '#374151',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 99,
                padding: isMobile ? '6px 13px' : '7px 15px',
                wordBreak: 'keep-all',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* 헬스케어 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar('#10b981')} /><span style={eyebrowTxt('#10b981')}>HEALTHCARE</span></div>
        <h2 style={h2}>헬스케어, 전부 무료예요</h2>
        <p style={{ ...body, marginBottom: 20, wordBreak: 'keep-all' }}>
          평소 미루기 쉬운 반려견 건강 체크, 행사장에서 무료로 받아 가세요.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 8 : 10 }}>
          {['기초 건강검진', '인수공통 감염병 검사', '반려견 기초미용'].map((name) => (
            <span
              key={name}
              style={{
                fontSize: isMobile ? 13 : 14,
                fontWeight: 600,
                color: '#065f46',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 99,
                padding: isMobile ? '6px 13px' : '7px 15px',
                wordBreak: 'keep-all',
                whiteSpace: 'nowrap',
              }}
            >
              {name} · 무료
            </span>
          ))}
        </div>
      </div>

      {/* 미니게임 · 스탬프 투어 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar('#eab308')} /><span style={eyebrowTxt('#eab308')}>MINI GAME · STAMP TOUR</span></div>
        <h2 style={h2}>미니게임 5개 깨고 경품 받기</h2>
        <p style={{ ...body, marginBottom: 20, wordBreak: 'keep-all' }}>
          행사장 곳곳의 미니게임을 즐기고 QR 스탬프를 모아 보세요. 도장을 모두 모으면 경품존에서
          경품으로 바꿔 드립니다.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 8 : 10 }}>
          {['똥 던지기 게임', '2m를 맞춰라', '반려견 야바위', '유혹을 이겨라', '꼬순내 휘날리며'].map((name) => (
            <span
              key={name}
              style={{
                fontSize: isMobile ? 13 : 14,
                fontWeight: 600,
                color: '#713f12',
                background: '#fefce8',
                border: '1px solid #fde68a',
                borderRadius: 99,
                padding: isMobile ? '6px 13px' : '7px 15px',
                wordBreak: 'keep-all',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* 오시는 길 · 주차 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar('#0ea5e9')} /><span style={eyebrowTxt('#0ea5e9')}>DIRECTIONS</span></div>
        <h2 style={h2}>오시는 길 · 주차 안내</h2>
        <p style={{ ...body, marginBottom: 16 }}>
          행사장은 <b>원주천 로아노크광장</b>(원주시 봉산동 899-2)입니다. 원주천을 따라 이어지는 공원으로,
          아래 지도에서 <b>행사장소</b>와 <b>주차장(P)</b> 위치를 미리 확인하고 오세요.
        </p>
        <div style={{ display: 'grid', gap: 12, marginBottom: 4 }}>
          <Step n={1} color="#0ea5e9" isMobile={isMobile}>행사장소 · <b>원주천 로아노크광장</b> (원주시 봉산동 899-2)</Step>
          <Step n={2} color="#0ea5e9" isMobile={isMobile}>주차 · 지도에 표시된 <b>주차장(P)</b>을 이용해 주세요. 주차 공간이 한정되어 <b>대중교통</b> 이용을 권장합니다.</Step>
        </div>
        <Poster src="/images/events/wonju-2026/access.webp" alt="웰니스클럽 오시는 길 — 원주천 로아노크광장(원주시 봉산동 899-2), 행사장소와 주차장 위치 안내 지도" max={640} accent="#0ea5e9" />
      </div>
    </div>
  );
}
