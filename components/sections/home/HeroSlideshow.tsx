'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useGWAADB } from '@/hooks/useGWAADB';
import { STORES } from '@/lib/db/gwaaDB';
import { HeroImage } from '@/types';
import { useIsMobile } from '@/hooks/useIsMobile';

const SLIDES = [
  {
    tag: 'GWAA · 강원도반려동물협회',
    dotClass: 'green',
    title: '반려동물과 함께\n강원도를',
    titleAccent: '제한 없이',
    sub: '2021년부터 4만명과 함께한 강원도 대표 반려동물 협회. 교육, 행사, 메이트쉽 멤버십으로 반려생활을 새롭게.',
    bg1: 'linear-gradient(160deg, #0D7E76 0%, #12A79D 55%, #35BDB4 100%)',
    bgImg: '/images/events/fest/01.webp',
    actions: [
      { label: '메이트쉽 가입 →', href: '/mateship#join', primary: true },
      { label: '협회 소개', href: '/about', primary: false },
    ],
  },
  {
    tag: 'EDUCATION · 전문 교육 프로그램',
    dotClass: 'green',
    title: '체계적인\n반려동물',
    titleAccent: '교육',
    sub: '독스포츠(어질리티), 오비디언스 교육, 반려동물행동지도사 국가자격증 취득까지. 전문 트레이너가 함께합니다.',
    bg1: 'linear-gradient(160deg, #0F857D 0%, #14A79D 55%, #2BAFA8 100%)',
    bgImg: '/images/events/edu/02.webp',
    actions: [
      { label: '교육 신청하기 →', href: '/education#apply', primary: true },
      { label: '프로그램 보기', href: '/education', primary: false },
    ],
  },
  {
    tag: 'MATESHIP · 멤버십 혜택',
    dotClass: 'amber',
    title: '연간 40만원\n이상',
    titleAccent: '절약',
    sub: '호텔, 카페, 캠핑, 사료·용품 할인과 행사 우선 참여권까지. 메이트쉽 회원이 되면 강원도가 달라집니다.',
    bg1: 'linear-gradient(160deg, #C9560F 0%, #EF7726 55%, #FF9A5C 100%)',
    bgImg: '/images/events/fest/09.webp',
    actions: [
      { label: '혜택 보기 →', href: '/mateship#benefits', primary: true },
      { label: '계산기 해보기', href: '/mateship#calculator', primary: false },
    ],
  },
];

const DOT_COLORS: Record<string, string> = {
  green: '#12A79D',
  blue: '#2563eb',
  amber: '#EF7726',
};

export default function HeroSlideshow({ initialData }: { initialData?: HeroImage[] }) {
  const [current, setCurrent] = useState(0);
  const [progKey, setProgKey] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const { data: heroImages } = useGWAADB<HeroImage>(STORES.HERO, initialData);
  const isMobile = useIsMobile();
  const INTERVAL = 4500;

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
    setProgKey((k) => k + 1);
  }, []);

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);

  /* auto-rotate */
  useEffect(() => {
    const t = setTimeout(next, INTERVAL);
    return () => clearTimeout(t);
  }, [current, next]);

  /* Particle canvas — reduced-motion 시 생략, 화면 밖/탭 숨김 시 드로잉 정지(성능) */
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = canvas.offsetWidth;
    let h = canvas.height = canvas.offsetHeight;
    const COUNT = window.innerWidth < 768 ? 24 : 44;

    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      a: Math.random() * 0.35 + 0.05,
    }));

    let visible = true;
    const draw = () => {
      if (visible && !document.hidden) {
        ctx.clearRect(0, 0, w, h);
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${p.a})`;
          ctx.fill();
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        });
      }
      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();

    // 히어로가 화면 밖이면 드로잉 스킵(상시 CPU 절감)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(canvas);

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      io.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const slide = SLIDES[current];
  const bgImg = heroImages?.[current]?.imageData ?? slide.bgImg;

  return (
    <section
      style={{
        position: 'relative',
        minHeight: 'clamp(468px, 64vh, 620px)',
        overflow: 'hidden',
        marginTop: -64,
      }}
    >
      {/* Slide backgrounds */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'absolute', inset: 0,
            background: bgImg
              ? `linear-gradient(150deg, rgba(6,44,41,0.52) 0%, rgba(6,44,41,0.22) 60%, rgba(6,44,41,0.10) 100%), url(${bgImg}) center/cover no-repeat`
              : slide.bg1,
          }}
        />
      </AnimatePresence>

      {/* Overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(102deg, rgba(6,42,39,0.42) 0%, rgba(6,42,39,0.14) 48%, transparent 82%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 200,
        background: 'linear-gradient(transparent, rgba(6,42,39,0.22))',
        pointerEvents: 'none',
      }} />

      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.6 }}
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center',
            padding: isMobile
              ? 'calc(64px + 12px) 20px 40px'
              : 'calc(64px + 20px) 60px 40px',
          }}
        >
          <div style={{ maxWidth: 640, position: 'relative', zIndex: 2 }}>
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.45 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                marginBottom: 20, padding: '6px 14px',
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
                border: '1.5px solid #e5e7eb', borderRadius: 9999,
              }}
            >
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: DOT_COLORS[slide.dotClass],
                animation: 'dot-pulse 2s ease infinite',
                flexShrink: 0,
              }} />
              <span style={{ fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", fontSize: 12, color: '#6b7280', letterSpacing: '0.04em' }}>
                {slide.tag}
              </span>
            </motion.div>

            {/* Title */}
            <div style={{ position: 'relative', marginBottom: 14 }}>
              {/* Handwritten oval SVG — re-animates on each slide via parent key={current} */}
              <motion.svg
                viewBox="0 0 1200 400"
                style={{
                  position: 'absolute',
                  top: '-22%', left: '-4%',
                  width: '108%', height: '144%',
                  pointerEvents: 'none',
                  overflow: 'visible',
                }}
                initial="hidden"
                animate="visible"
              >
                <motion.path
                  d="M 950 60 C 1250 200, 1050 320, 600 350 C 250 350, 150 320, 150 200 C 150 80, 350 50, 600 50 C 850 50, 950 120, 950 120"
                  fill="none"
                  strokeWidth="10"
                  stroke="rgba(255,255,255,0.8)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.55 }}
                  variants={{
                    hidden: { pathLength: 0, opacity: 0 },
                    visible: {
                      pathLength: 1,
                      opacity: 0.55,
                      transition: {
                        pathLength: { delay: 0.4, duration: 2.5, ease: [0.43, 0.13, 0.23, 0.96] },
                        opacity: { delay: 0.4, duration: 0.3 },
                      },
                    },
                  }}
                />
              </motion.svg>

              <h1 style={{
                fontFamily: "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif",
                fontSize: 'clamp(48px, 7vw, 84px)',
                lineHeight: 0.95,
                color: '#fff',
                letterSpacing: '0.02em',
                whiteSpace: 'pre-line',
                textShadow: '0 2px 14px rgba(6,42,39,0.25)',
              }}>
                {slide.title.split('\n').map((line, li) => (
                  <span key={li} style={{ display: 'block' }}>
                    {line.split(' ').map((word, wi) => (
                      <motion.span
                        key={wi}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + (li * 2 + wi) * 0.05, duration: 0.4 }}
                        style={{ display: 'inline-block', marginRight: '0.25em' }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </span>
                ))}
                <motion.span
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  style={{ color: '#fff', display: 'block' }}
                >
                  {slide.titleAccent}
                </motion.span>
              </h1>
            </div>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              style={{ fontSize: 15, color: 'rgba(255,255,255,0.94)', lineHeight: 1.6, fontWeight: 400, marginBottom: 28 }}
            >
              {slide.sub}
            </motion.p>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.4 }}
              style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}
            >
              {slide.actions.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '12px 26px', borderRadius: 9999, fontSize: 13, fontWeight: 700,
                    letterSpacing: '0.04em', textDecoration: 'none', minHeight: 44,
                    background: a.primary ? '#fff' : 'rgba(255,255,255,0.16)',
                    color: a.primary ? '#0D7E76' : '#fff',
                    border: a.primary ? 'none' : '1.5px solid rgba(255,255,255,0.7)',
                    boxShadow: a.primary ? '0 2px 12px rgba(18,167,157,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.15s',
                  }}
                >
                  {a.label}
                </Link>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div style={{
        position: 'absolute',
        bottom: 28,
        right: isMobile ? '50%' : 60,
        transform: isMobile ? 'translateX(50%)' : 'none',
        display: 'flex', alignItems: 'center', gap: 10, zIndex: 10,
      }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`슬라이드 ${i + 1}`}
            style={{
              width: i === current ? 28 : 8,
              height: 8, borderRadius: 4,
              background: i === current ? '#12A79D' : 'rgba(0,0,0,0.2)',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <motion.div
        key={progKey}
        initial={{ scaleX: 0, transformOrigin: 'left' }}
        animate={{ scaleX: 1, transformOrigin: 'left' }}
        transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
        style={{
          position: 'absolute', bottom: 0, left: 0,
          height: 3, background: '#12A79D', zIndex: 10,
          width: '100%',
        }}
      />

      <style>{`
        @keyframes dot-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.5; transform:scale(0.8); }
        }
        @keyframes mascot-hop {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-1.5deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="mascot-hop"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
