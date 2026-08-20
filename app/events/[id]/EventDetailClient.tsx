'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { EventCard } from '@/types';
import Badge from '@/components/ui/Badge';
import { useIsMobile } from '@/hooks/useIsMobile';
import BookingFlow from '@/components/sections/events/BookingFlow';
import PetscoutContent from '@/components/sections/events/PetscoutContent';
import { Calendar, MapPin } from 'lucide-react';

// 예약 기능이 열려 있는 행사 id (펫스카웃 2026)
const BOOKING_EVENT_IDS = [3];

// 행사별 히어로 배경 이미지 오버라이드 (기본은 갤러리 첫 이미지)
const HERO_OVERRIDE: Record<number, string> = {
  3: '/images/events/jamboree-2026/hero-1.webp',
};
// 행사별 히어로 자동 전환 슬라이드 (2장 이상이면 크로스페이드로 순환)
const HERO_SLIDES: Record<number, string[]> = {
  3: [
    '/images/events/jamboree-2026/hero-1.webp',
    '/images/events/jamboree-2026/hero-2.webp',
    '/images/events/jamboree-2026/hero-3.webp',
  ],
};
// 행사별 히어로 배경 위치(프레이밍) 오버라이드
const HERO_POS_OVERRIDE: Record<number, string> = {
  3: 'center',
};
// 행사별 히어로 날짜 표시 오버라이드 (DB date 값이 축약된 경우)
const HERO_DATE_OVERRIDE: Record<number, string> = {
  3: '2026. 9. 4 (금) — 9. 6 (일)',
};
// 갤러리 상단에 끼워 넣을 포스터 (행사별)
const GALLERY_POSTER: Record<number, string> = {
  3: '/images/events/jamboree-2026/poster.webp',
};

// 라이브 스테이지 라인업 (펫스카웃 2026)
const ARTISTS = [
  { name: '이박사', en: 'E-PAK-SA', tag: '뽕짝 레전드', img: '/images/events/jamboree-2026/artists/epaksa.webp', pos: 'center 30%' },
  { name: '헤티스', en: 'HETEETH', tag: 'POST HARD ROCK', img: '/images/events/jamboree-2026/artists/heteeth.webp', pos: 'center 32%' },
  { name: '피싱걸즈', en: 'FISHINGIRLS', tag: 'LIVE BAND', img: '/images/events/jamboree-2026/artists/fishingirls.webp', pos: 'center 30%' },
  { name: '나타샤', en: 'NATASHA', tag: 'LIVE BAND', img: '/images/events/jamboree-2026/artists/natasha.webp', pos: 'center 28%' },
  { name: '레드씨', en: 'RED C', tag: 'LIVE BAND', img: '/images/events/jamboree-2026/artists/redc.webp', pos: 'center 25%' },
];

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
// 라틴·숫자는 Bebas, 한글은 Black Han Sans로 폴백 → 강렬한 한글 제목
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";

export default function EventDetailClient({ event }: { event: EventCard }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const isMobile = useIsMobile();
  const px = isMobile ? '20px' : '60px';
  // 낭만기버 전용 링크(?rg=코드)면 rgMode — BookingFlow의 RG_CODE와 동일해야 함
  const [rgMode, setRgMode] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).get('rg') !== 'nangman-2026') return;
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setRgMode(true);
  }, []);
  const hasBooking = BOOKING_EVENT_IDS.includes(event.id as number);

  // 행사 D-day (SSR/CSR 불일치 방지 위해 마운트 후 계산)
  const [dday, setDday] = useState<number | null>(null);
  useEffect(() => {
    const start = new Date(2026, 8, 4).getTime(); // 2026-09-04
    setDday(Math.max(0, Math.ceil((start - Date.now()) / 86400000)));
  }, []);

  // 하단 고정 '예약하기' 바 — 예약폼(booking-anchor)이 화면에 들어오면 숨김
  const [bookingInView, setBookingInView] = useState(false);
  useEffect(() => {
    if (!hasBooking || typeof window === 'undefined') return;
    const el = document.getElementById('booking-anchor');
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setBookingInView(entry.isIntersecting),
      { rootMargin: '0px 0px -35% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasBooking]);

  // 하단 고정 바가 보일 때 카카오 문의 버튼을 바 위로 올림(겹침 방지)
  useEffect(() => {
    const show = hasBooking && !bookingInView;
    document.documentElement.style.setProperty('--kakao-lift', show ? 'calc(66px + env(safe-area-inset-bottom))' : '0px');
    return () => document.documentElement.style.setProperty('--kakao-lift', '0px');
  }, [hasBooking, bookingInView]);

  const allImages: string[] = [];
  if (event.images && event.images.length > 0) {
    allImages.push(...event.images);
  } else if (event.imageData) {
    allImages.push(event.imageData);
  }

  const heroSlides = HERO_SLIDES[event.id as number] || (HERO_OVERRIDE[event.id as number] ? [HERO_OVERRIDE[event.id as number]] : allImages[0] ? [allImages[0]] : []);
  const heroPos = HERO_POS_OVERRIDE[event.id as number] || 'center';
  const [slideIdx, setSlideIdx] = useState(0);
  useEffect(() => {
    if (heroSlides.length < 2) return;
    const t = setInterval(() => setSlideIdx((i) => (i + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, [heroSlides.length]);
  const heroDate = HERO_DATE_OVERRIDE[event.id as number] || event.date;

  // 포스터는 전용 섹션에 배치 (갤러리·라이트박스에는 사진만)
  const eventPoster = GALLERY_POSTER[event.id as number];
  const galleryImages = allImages;

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prev = useCallback(() => setLightboxIdx((i) => i !== null ? (i - 1 + galleryImages.length) % galleryImages.length : null), [galleryImages.length]);
  const next = useCallback(() => setLightboxIdx((i) => i !== null ? (i + 1) % galleryImages.length : null), [galleryImages.length]);

  // 갤러리 캐러셀 (가운데 강조 + 양옆 peek)
  const scrollToSlide = useCallback((i: number) => {
    const el = galleryRef.current;
    const child = el?.children[i] as HTMLElement | undefined;
    if (!el || !child) return;
    el.scrollTo({ left: child.offsetLeft - (el.clientWidth - child.offsetWidth) / 2, behavior: 'smooth' });
  }, []);
  const onGalleryScroll = useCallback(() => {
    const el = galleryRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let nearest = 0, min = Infinity;
    Array.from(el.children).forEach((c, i) => {
      const cc = (c as HTMLElement).offsetLeft + (c as HTMLElement).offsetWidth / 2;
      const d = Math.abs(cc - center);
      if (d < min) { min = d; nearest = i; }
    });
    setGalleryIdx(nearest);
  }, []);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIdx, closeLightbox, prev, next]);

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>

      {/* Hero */}
      <div style={{ position: 'relative', height: isMobile ? '70vh' : '64vh', minHeight: 420, overflow: 'hidden' }}>
        {heroSlides.length > 0 ? (
          heroSlides.map((src, i) => (
            <div
              key={src}
              aria-hidden
              style={{
                position: 'absolute', inset: 0,
                opacity: i === slideIdx ? 1 : 0,
                transition: 'opacity 1.2s ease-in-out',
              }}
            >
              {/* 뒤 채움: 흐릿하게 확대해 여백 없이 */}
              <div style={{ position: 'absolute', inset: 0, background: `url(${src}) center/cover no-repeat`, filter: 'blur(26px) saturate(1.15)', transform: 'scale(1.12)' }} />
              {/* 앞: 잘림 없이 전체 이미지 */}
              <div style={{ position: 'absolute', inset: 0, background: `url(${src}) ${heroPos}/contain no-repeat` }} />
            </div>
          ))
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.82) 100%)' }} />

        <div style={{ position: 'absolute', top: 20, left: isMobile ? 16 : 40, zIndex: 2 }}>
          <Link href="/events" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.92)', fontSize: 13, fontFamily: MONO, letterSpacing: '0.08em', textDecoration: 'none', background: 'rgba(0,0,0,0.48)', padding: '8px 16px', borderRadius: 9999, backdropFilter: 'blur(8px)' }}>
            ← EVENTS
          </Link>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: `32px ${px}`, zIndex: 2 }}>
          <div style={{ marginBottom: 10 }}>
            <Badge variant={event.status} />
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', var(--font-blackhan), 'Apple SD Gothic Neo', sans-serif", fontSize: isMobile ? 'clamp(30px,7vw,42px)' : 'clamp(34px,5vw,60px)', color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.08, marginBottom: 12, wordBreak: 'keep-all' }}>
            {event.title.split(/(\bwith\b)/i).map((part, i) =>
              /^with$/i.test(part)
                ? <span key={i} style={{ fontFamily: "var(--font-gothic), 'Apple SD Gothic Neo', sans-serif", textTransform: 'lowercase', fontWeight: 800, fontSize: '0.66em', letterSpacing: '0', padding: '0 0.12em' }}>with</span>
                : <span key={i}>{part}</span>
            )}
          </h1>
          <div style={{ display: 'flex', gap: 18, fontSize: 13, color: 'rgba(255,255,255,0.92)', fontFamily: MONO, letterSpacing: '0.02em', flexWrap: 'wrap' }}>
            {heroDate && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Calendar size={15} strokeWidth={1.9} />{heroDate}</span>}
            {event.loc && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><MapPin size={15} strokeWidth={1.9} />{event.loc}</span>}
          </div>
          {hasBooking && dday !== null && dday > 0 && (
            <div style={{ marginTop: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ef4444', color: '#fff', fontSize: 12.5, fontWeight: 800, padding: '6px 14px', borderRadius: 9999 }}>🔥 {rgMode ? `D-${dday} · 낭만기버존 18면 한정` : `예약 마감까지 D-${dday}`}</span>
            </div>
          )}
          {hasBooking && (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => document.getElementById('booking-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                style={{ padding: '13px 30px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 6px 18px rgba(22,163,74,0.4)' }}
              >
                예약하기 →
              </button>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>당일권 20,000원 · 2박3일 135,000원부터</span>
            </div>
          )}
        </div>
      </div>

      {/* 라이브 스테이지 라인업 — 아티스트 히어로 */}
      {hasBooking && (
        <div style={{ width: '100%', background: 'radial-gradient(120% 80% at 50% 0%, #1a1420 0%, #0b0b0d 60%)', padding: isMobile ? '46px 0 42px' : '70px 0 60px' }}>
          <div style={{ maxWidth: 1120, margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                <span style={{ width: 26, height: 2, background: '#ef4444', borderRadius: 1 }} />
                <span style={{ fontFamily: MONO, fontSize: 11.5, color: '#fca5a5', letterSpacing: '0.18em', fontWeight: 800 }}>LIVE STAGE · LINE-UP</span>
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', var(--font-blackhan), 'Apple SD Gothic Neo', sans-serif", fontSize: isMobile ? 'clamp(27px,7vw,38px)' : 'clamp(38px,4.4vw,54px)', color: '#fff', lineHeight: 1.12, letterSpacing: '-0.01em', wordBreak: 'keep-all' }}>
                낮엔 캠핑, 밤엔 <span style={{ color: '#f87171' }}>라이브 페스티벌</span>
              </h2>
              <p style={{ fontSize: isMobile ? 14 : 16, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, marginTop: 12, wordBreak: 'keep-all', maxWidth: 640 }}>
                인디밴드 4팀부터 뽕짝의 전설 <b style={{ color: '#fff' }}>이박사</b>까지 — 캠프파이어 아래 열리는 2박 3일 밤무대.
              </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(5,1fr)', gap: isMobile ? 12 : 16, marginTop: isMobile ? 22 : 30 }}>
              {ARTISTS.map((a, i) => (
                <motion.div key={a.name} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: i * 0.06 }}>
                  <div style={{ position: 'relative', aspectRatio: '3 / 4', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div aria-hidden style={{ position: 'absolute', inset: 0, background: `url(${a.img}) ${a.pos}/cover no-repeat` }} />
                    <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.85) 100%)' }} />
                    <div style={{ position: 'absolute', left: 12, right: 12, bottom: 11 }}>
                      <div style={{ fontFamily: "'Bebas Neue', var(--font-blackhan), 'Apple SD Gothic Neo', sans-serif", fontSize: isMobile ? 18 : 21, color: '#fff', lineHeight: 1.05, letterSpacing: '0.01em' }}>{a.name}</div>
                      <div style={{ fontFamily: MONO, fontSize: 9.5, color: '#f87171', letterSpacing: '0.12em', fontWeight: 700, marginTop: 3 }}>{a.tag}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 18, lineHeight: 1.6 }}>
              🔥 인디밴드 4팀 · 이박사 공연 · 캠프파이어 · 야외 영화제 — 예약 전원 관람 무료
            </p>
          </div>
        </div>
      )}

      {/* 감성 밴드 — 히어로 무드 이어가기 */}
      {hasBooking && (
        <div style={{ position: 'relative', width: '100%', minHeight: isMobile ? 360 : 460, height: isMobile ? '52vh' : '56vh', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: `url(/images/events/jamboree-2026/band-1.webp) center 60%/cover no-repeat` }} />
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.15) 100%)' }} />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
            style={{ position: 'relative', zIndex: 2, padding: isMobile ? '0 24px' : '0 72px', maxWidth: 720 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ width: 24, height: 2, background: '#4ade80', borderRadius: 1 }} />
              <span style={{ fontFamily: MONO, fontSize: 11, color: '#86efac', letterSpacing: '0.14em', fontWeight: 700 }}>PETSCOUT 2026 · 강원 고성</span>
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', var(--font-blackhan), 'Apple SD Gothic Neo', sans-serif", fontSize: isMobile ? 'clamp(28px,7.5vw,40px)' : 'clamp(38px,4.6vw,56px)', color: '#fff', lineHeight: 1.12, letterSpacing: '-0.01em', marginBottom: 16, wordBreak: 'keep-all', textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>
              불멍 앞에,<br />깊어가는 강원의 밤.
            </h2>
            <p style={{ fontSize: isMobile ? 14.5 : 17, color: 'rgba(255,255,255,0.92)', lineHeight: 1.75, wordBreak: 'keep-all', maxWidth: 440, textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}>
              울산바위가 보이는 고성의 숲에서 보내는 2박 3일.<br />반려견과 함께라면 더 특별하게.
            </p>
          </motion.div>
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: isMobile ? '40px 20px 64px' : '56px 40px 80px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>

          {hasBooking && (
            <>
              <p style={{ fontSize: isMobile ? 19 : 24, fontWeight: 800, color: '#111', lineHeight: 1.4, marginBottom: 12, wordBreak: 'keep-all', letterSpacing: '-0.01em' }}>
                텐트도 장비도 없이, 몸만 오세요.<br />예약 전원에게 <span style={{ color: '#16a34a' }}>웰컴키트</span>까지 🐾
              </p>
              <p style={{ fontSize: isMobile ? 14 : 15.5, color: '#4b5563', lineHeight: 1.7, marginBottom: 18, wordBreak: 'keep-all' }}>
                참가비 이상의 웰컴키트를 전원에게. 반려견 없이도, 텐트 없이도 즐기는 강원 고성 2박 3일.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                {['🎁 예약 전원 웰컴키트 증정', '🎸 인디밴드·이박사 라이브', '🌿 웰니스 클래스 · 숲속 사우나 무료', '⛺ 텐트 없어도 OK · 몸만 오세요'].map((t) => (
                  <span key={t} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontWeight: 700, fontSize: 13, padding: '8px 14px', borderRadius: 9999, wordBreak: 'keep-all' }}>{t}</span>
                ))}
              </div>
            </>
          )}

          {event.benefit && (
            <div style={{ display: 'inline-block', background: '#f0fdf4', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 9999, padding: '6px 16px', fontSize: 12, color: '#16a34a', fontWeight: 700, marginBottom: 24 }}>
              {event.benefit}
            </div>
          )}

          {event.desc && (
            <p style={{ fontSize: isMobile ? 15 : 17, color: '#1f2937', lineHeight: 1.85, marginBottom: 32, whiteSpace: 'pre-wrap', letterSpacing: '-0.01em' }}>
              {event.desc}
            </p>
          )}

          {event.content && event.content !== event.desc && (
            <div style={{ marginBottom: 40, paddingTop: 32, borderTop: '1px solid #f0f0f0' }}>
              <p style={{ fontSize: isMobile ? 14 : 15, color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                {event.content}
              </p>
            </div>
          )}

          {hasBooking && eventPoster && (
            <div style={{ margin: isMobile ? '4px 0 40px' : '12px 0 56px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ width: 20, height: 2, background: '#16a34a', borderRadius: 1 }} />
                <span style={{ fontFamily: MONO, fontSize: 11, color: '#16a34a', letterSpacing: '0.08em', fontWeight: 700 }}>CAMPING with PETSCOUT</span>
              </div>
              <div style={{ background: '#f9fafb', border: '1px solid #eceff2', borderRadius: 16, padding: isMobile ? '18px' : '28px', display: 'flex', justifyContent: 'center' }}>
                <img
                  src={eventPoster}
                  alt="2026 펫스카웃 캠프 & 펫페스티벌 공식 포스터"
                  style={{ width: '100%', maxWidth: isMobile ? '100%' : 420, height: 'auto', borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.10)', display: 'block' }}
                />
              </div>
            </div>
          )}

          {/* 감성 밴드 2 — 웰니스/힐링 (풀블리드 브레이크아웃) */}
          {hasBooking && (
            <div style={{ position: 'relative', width: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)', marginTop: 8, marginBottom: 48, minHeight: isMobile ? 360 : 460, height: isMobile ? '52vh' : '56vh', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
              <div aria-hidden style={{ position: 'absolute', inset: 0, background: `url(/images/events/jamboree-2026/band-2.webp) center 42%/cover no-repeat` }} />
              <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.42) 45%, rgba(0,0,0,0.12) 100%)' }} />
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7 }}
                style={{ position: 'relative', zIndex: 2, padding: isMobile ? '0 24px' : '0 72px', maxWidth: 720 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ width: 24, height: 2, background: '#4ade80', borderRadius: 1 }} />
                  <span style={{ fontFamily: MONO, fontSize: 11, color: '#86efac', letterSpacing: '0.14em', fontWeight: 700 }}>WELLNESS · 몸도 마음도</span>
                </div>
                <h2 style={{ fontFamily: "'Bebas Neue', var(--font-blackhan), 'Apple SD Gothic Neo', sans-serif", fontSize: isMobile ? 'clamp(28px,7.5vw,40px)' : 'clamp(38px,4.6vw,56px)', color: '#fff', lineHeight: 1.12, letterSpacing: '-0.01em', marginBottom: 16, wordBreak: 'keep-all', textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>
                  반려견은 뛰고,<br />나는 숨 고릅니다.
                </h2>
                <p style={{ fontSize: isMobile ? 14.5 : 17, color: 'rgba(255,255,255,0.92)', lineHeight: 1.75, wordBreak: 'keep-all', maxWidth: 440, textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}>
                  숲속 무료 사우나부터 요가·무브먼트 클래스까지.<br />쉬는 것도 일정입니다.
                </p>
              </motion.div>
            </div>
          )}

          {hasBooking && <PetscoutContent />}

          {galleryImages.length > 0 && (
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <h2 style={{ fontFamily: BEBAS, fontWeight: 800, fontSize: 25, color: '#111', letterSpacing: '0.02em' }}>갤러리</h2>
                <span style={{ fontFamily: MONO, fontSize: 10, color: '#6b7280', letterSpacing: '0.12em' }}>{galleryIdx + 1} / {galleryImages.length}</span>
                {galleryImages.length > 1 && (
                  <span style={{ fontFamily: MONO, fontSize: 10, color: '#c4c8cf', letterSpacing: '0.06em', marginLeft: 'auto' }}>← 옆으로 넘겨보세요 →</span>
                )}
              </div>

              {/* 가운데 강조 + 양옆 peek 캐러셀 */}
              <div style={{ position: 'relative' }}>
                <div
                  ref={galleryRef}
                  onScroll={onGalleryScroll}
                  style={{
                    display: 'flex',
                    gap: isMobile ? 12 : 20,
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    paddingBottom: 4,
                    paddingLeft: isMobile ? '9%' : '20%',
                    paddingRight: isMobile ? '9%' : '20%',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none' as const,
                    WebkitOverflowScrolling: 'touch' as const,
                  }}
                >
                  {galleryImages.map((img, i) => {
                    const active = i === galleryIdx;
                    return (
                      <div
                        key={i}
                        style={{
                          flex: isMobile ? '0 0 82%' : '0 0 60%',
                          scrollSnapAlign: 'center',
                          minWidth: 0,
                          transform: active ? 'scale(1)' : 'scale(0.9)',
                          opacity: active ? 1 : 0.45,
                          transition: 'transform 0.3s ease, opacity 0.3s ease',
                        }}
                      >
                        <div
                          onClick={() => (active ? setLightboxIdx(i) : scrollToSlide(i))}
                          style={{
                            position: 'relative',
                            aspectRatio: '4 / 3',
                            borderRadius: 14,
                            overflow: 'hidden',
                            cursor: active ? 'zoom-in' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#eef0f2',
                            boxShadow: active ? '0 16px 40px rgba(0,0,0,0.18)' : 'none',
                          }}
                        >
                          {/* 색-매칭 프로스티드 배경 */}
                          <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(28px) saturate(1.4)', transform: 'scale(1.4)', opacity: 0.5 }} />
                          <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.25)' }} />
                          {/* 전체가 보이는 이미지 */}
                          <img
                            src={img}
                            alt={`${event.title} ${i + 1}`}
                            draggable={false}
                            style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 데스크톱 좌우 버튼 */}
                {!isMobile && galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={() => scrollToSlide(Math.max(0, galleryIdx - 1))}
                      aria-label="이전"
                      style={{ position: 'absolute', zIndex: 2, left: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.9)', color: '#111', fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: galleryIdx === 0 ? 'none' : 'block' }}
                    >‹</button>
                    <button
                      onClick={() => scrollToSlide(Math.min(galleryImages.length - 1, galleryIdx + 1))}
                      aria-label="다음"
                      style={{ position: 'absolute', zIndex: 2, right: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.9)', color: '#111', fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: galleryIdx >= galleryImages.length - 1 ? 'none' : 'block' }}
                    >›</button>
                  </>
                )}
              </div>

              {/* 인디케이터 점 */}
              {galleryImages.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginTop: 14 }}>
                  {galleryImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => scrollToSlide(i)}
                      aria-label={`${i + 1}번째 사진`}
                      style={{
                        width: i === galleryIdx ? 22 : 7, height: 7, borderRadius: 9999, border: 'none', padding: 0, cursor: 'pointer',
                        background: i === galleryIdx ? '#16a34a' : '#d1d5db', transition: 'all 0.25s',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', paddingTop: 8 }}>
            {hasBooking ? (
              <button
                onClick={() => document.getElementById('booking-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                style={{ display: 'inline-flex', padding: isMobile ? '11px 24px' : '13px 30px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                예약하기 ↓
              </button>
            ) : event.link ? (
              <Link href={event.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', padding: isMobile ? '11px 24px' : '13px 30px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                {event.ctaText || '신청하기 →'}
              </Link>
            ) : (
              <span style={{ display: 'inline-flex', padding: isMobile ? '11px 24px' : '13px 30px', borderRadius: 9999, background: '#f3f4f6', color: '#6b7280', fontSize: 14, fontWeight: 700 }}>
                {event.ctaText || '준비 중'}
              </span>
            )}
            <Link href="/events" style={{ display: 'inline-flex', padding: isMobile ? '11px 24px' : '13px 30px', borderRadius: 9999, border: '1.5px solid #e5e7eb', color: '#374151', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              ← 목록으로
            </Link>
          </div>

          {hasBooking && (
            <div id="sitemap-anchor" style={{ marginTop: isMobile ? 40 : 56, scrollMarginTop: 80 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ width: 20, height: 2, background: '#16a34a', borderRadius: 1 }} />
                <span style={{ fontFamily: MONO, fontSize: 12, color: '#16a34a', letterSpacing: '0.1em', fontWeight: 700 }}>SITE MAP</span>
              </div>
              <h2 style={{ fontFamily: BEBAS, fontWeight: 800, fontSize: isMobile ? 27 : 36, color: '#111', letterSpacing: '0.02em', margin: '0 0 6px' }}>어디에 자리 잡을까요?</h2>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: '0 0 18px', wordBreak: 'keep-all' }}>
                예약 전에 펫존 · 무대 · 캠핑존 · 입구 위치를 미리 확인하세요.
              </p>

              <a href="/images/events/jamboree-2026/sitemap.webp" target="_blank" rel="noopener noreferrer" style={{ display: 'block', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#f8fafb', cursor: 'zoom-in' }}>
                <img src="/images/events/jamboree-2026/sitemap.webp" alt="펫스카웃 2026 행사장 배치도" style={{ width: '100%', display: 'block' }} />
              </a>
              <p style={{ fontFamily: MONO, fontSize: 11, color: '#6b7280', margin: '8px 0 0', textAlign: 'center' }}>탭하면 크게 볼 수 있어요</p>

              <div style={{ display: 'grid', gridTemplateColumns: (isMobile || rgMode) ? '1fr' : 'repeat(3, 1fr)', gap: 10, marginTop: 18 }}>
                {(rgMode
                  ? [{ t: '낭만기버존 (VIP)', d: '울산바위 뷰 · 8×8m · 캠핑 사이트 18면', c: '#db2777' }]
                  : [
                      { t: '근접 일반존 (A~D)', d: '10×10m · 무대 인접 · 60면', c: '#16a34a' },
                      { t: '원거리 일반존 (E)', d: '10×10m · 2만원 할인 · 40면', c: '#2563eb' },
                      { t: '반려동물 펜스존 (F)', d: '10×10m · 독립 펜스 · 52면', c: '#dc2626' },
                    ]
                ).map((z) => (
                  <div key={z.t} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: z.c }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{z.t}</span>
                    </div>
                    <p style={{ fontFamily: MONO, fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>{z.d}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.7, margin: '14px 0 0', wordBreak: 'keep-all' }}>
                <b style={{ color: '#374151' }}>주요 구역</b> · STAGE(공연) · BRAND ZONE(마켓·포토·캠프파이어) · PETSCOUT ZONE(오프리쉬·어질리티쇼) · FOOD ZONE(푸드트럭) · 숲속 사우나존(사우나+아이스버킷) · 낭만기버존(VIP) · FP 패밀리 프라이빗존(통임대)
              </p>
            </div>
          )}

          {hasBooking && (
            <div style={{ marginTop: isMobile ? 32 : 44 }}>
              <BookingFlow eventId={event.id as number} />
            </div>
          )}
        </motion.div>
      </div>

      {/* 하단 고정 예약 바 (펫스카웃) */}
      {hasBooking && (
        <AnimatePresence>
          {!bookingInView && (
            <motion.div
              initial={{ y: 90, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 90, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 900, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderTop: '1px solid #e5e7eb', boxShadow: '0 -4px 22px rgba(0,0,0,0.09)', padding: isMobile ? '10px 16px calc(10px + env(safe-area-inset-bottom))' : '12px 24px' }}
            >
              <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#111', lineHeight: 1.3 }}>캠핑 예약 · 클래스 신청{rgMode ? ' · 낭만기버존' : ''}</div>
                  <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>9/4~9/6 고성 · 당일권 2만원 · 캠핑 13.5만원~</div>
                </div>
                <button
                  onClick={() => document.getElementById('booking-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  style={{ flexShrink: 0, padding: isMobile ? '12px 22px' : '13px 32px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 14.5, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}
                >
                  예약하기 →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <button onClick={closeLightbox} style={{ position: 'absolute', top: 20, right: 24, color: '#fff', fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}>✕</button>
            <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em' }}>
              {lightboxIdx + 1} / {galleryImages.length}
            </div>
            <motion.img
              key={lightboxIdx}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={galleryImages[lightboxIdx]}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '88vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 6, display: 'block' }}
              alt={event.title}
            />
            {galleryImages.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prev(); }} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#fff', fontSize: 28, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                <button onClick={(e) => { e.stopPropagation(); next(); }} style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', color: '#fff', fontSize: 28, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
