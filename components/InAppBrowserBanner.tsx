'use client';

import { useEffect, useState } from 'react';

// 인스타·카톡·라인·네이버 등 인앱브라우저 감지 (BookingFlow와 동일 기준)
function isInApp(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /instagram|kakaotalk|fban|fbav|fb_iab|line\/|naver|daumapps|; wv\)/i.test(ua);
}

export default function InAppBrowserBanner() {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('gwaa_iab_dismiss') === '1') return;
    if (isInApp()) setShow(true);
  }, []);

  if (!show) return null;

  const openInChrome = () => {
    const loc = window.location;
    const hostPath = loc.host + loc.pathname + loc.search; // 프로토콜 제외
    const isAndroid = /android/i.test(navigator.userAgent || '');
    if (isAndroid) {
      // 안드로이드: intent 스킴으로 크롬 실행
      window.location.href = `intent://${hostPath}#Intent;scheme=https;package=com.android.chrome;end`;
    } else {
      // iOS 등: 크롬 스킴(https → googlechromes). 크롬 미설치면 아무 일 없음 → 링크복사 안내로 폴백
      window.location.href = `googlechromes://${hostPath}`;
    }
  };

  const copyLink = () => {
    try { navigator.clipboard?.writeText(window.location.href); setCopied(true); } catch { /* noop */ }
  };

  const dismiss = () => {
    try { sessionStorage.setItem('gwaa_iab_dismiss', '1'); } catch { /* noop */ }
    setShow(false);
  };

  return (
    <div style={{ background: '#fff7ed', borderBottom: '1px solid #fdba74', padding: '13px 16px', position: 'relative' }}>
      <button type="button" onClick={dismiss} aria-label="닫기"
        style={{ position: 'absolute', top: 8, right: 10, border: 'none', background: 'transparent', color: '#b45309', fontSize: 16, fontWeight: 700, cursor: 'pointer', lineHeight: 1, padding: 4 }}>×</button>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#9a3412' }}>📱 인스타 앱 브라우저예요</div>
        <div style={{ fontSize: 12.5, color: '#9a3412', marginTop: 4, lineHeight: 1.5 }}>원활한 예약·결제를 위해 크롬에서 열어주세요.</div>
        <button type="button" onClick={openInChrome}
          style={{ display: 'block', width: '100%', marginTop: 10, padding: '13px', borderRadius: 11, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
          🌐 크롬으로 열기
        </button>
        <div style={{ fontSize: 11.5, color: '#b45309', textAlign: 'center', marginTop: 8, lineHeight: 1.6 }}>
          안 열리면 오른쪽 위 <b>⋯</b> → “외부 브라우저에서 열기” · <span onClick={copyLink} style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}>{copied ? '링크 복사됨 ✓' : '링크 복사'}</span>
        </div>
      </div>
    </div>
  );
}
