'use client';

/**
 * Venue3D — 행사 상세 페이지에 끼워 넣는 "3D 행사장 미리보기" 블록
 * 행사 카드의 link 가 /wonju-2026 으로 시작하면 자동 표시 (EventDetailClient 참고).
 * 처음엔 가벼운 미리보기 이미지만 보여주고, 누르면 그 자리에서 3D 페이지를 불러온다(모바일 데이터·성능 배려).
 */
import { useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

const MONO = "ui-monospace, 'IBM Plex Mono', monospace";

export default function Venue3D({ href = '/wonju-2026/3d.html', poster = '/wonju-2026/og-3d.jpg' }: { href?: string; poster?: string }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  return (
    <section style={{ margin: isMobile ? '4px 0 40px' : '12px 0 56px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ width: 20, height: 2, background: '#16a34a', borderRadius: 1 }} />
        <span style={{ fontFamily: MONO, fontSize: 11, color: '#16a34a', letterSpacing: '0.08em', fontWeight: 700 }}>3D VENUE · 행사장 미리보기</span>
      </div>

      <div style={{ background: '#12302a', border: '1px solid #12302a', borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.10)' }}>
        {open ? (
          <iframe
            src={href}
            title="웰니스 클럽 3D 행사장"
            allow="geolocation; fullscreen"
            style={{ display: 'block', width: '100%', height: isMobile ? '78vh' : 640, border: 0, background: '#12302a' }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="3D 행사장 미리보기 시작"
            style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '16 / 9', padding: 0, border: 0, cursor: 'pointer', background: `#12302a url(${poster}) center/cover` }}
          >
            <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(18,48,42,0) 40%, rgba(18,48,42,.75) 100%)' }} />
            <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', display: 'inline-flex', alignItems: 'center', gap: 10, padding: isMobile ? '12px 20px' : '14px 26px', borderRadius: 9999, background: '#ff6a3d', color: '#12302a', fontSize: isMobile ? 14 : 15, fontWeight: 800, boxShadow: '0 8px 24px rgba(0,0,0,.25)' }}>
              ▶ 3D로 행사장 둘러보기
            </span>
            <span style={{ position: 'absolute', left: 18, bottom: 16, right: 18, color: '#e4f2ea', fontSize: isMobile ? 12 : 13, textAlign: 'left', lineHeight: 1.5, wordBreak: 'keep-all' }}>
              무대 시간표 · 부스 위치 · 주차장까지 한눈에. 현장에서는 미니게임 QR 스탬프 투어와 길안내도 돼요.
            </span>
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, alignItems: 'center' }}>
        <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', padding: '9px 16px', borderRadius: 9999, border: '1.5px solid #16a34a', color: '#166534', background: '#f0fdf4', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          새 창에서 크게 보기 ↗
        </a>
        <span style={{ fontSize: 12, color: '#6b7280', wordBreak: 'keep-all' }}>크롬·사파리·삼성인터넷 최신 버전에서 가장 잘 보여요.</span>
      </div>
    </section>
  );
}
