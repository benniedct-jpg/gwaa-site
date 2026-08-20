'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_MENU } from '@/lib/utils';
import { SlideTabsNav } from '@/components/ui/slide-tabs';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [member, setMember] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // 로그인(회원) 상태 감지 — 로그인 시 '내 회원증', 아니면 '회원 로그인'
  useEffect(() => {
    let alive = true;
    fetch('/api/membership/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive) setMember(d); })
      .catch(() => { if (alive) setMember(null); });
    return () => { alive = false; };
  }, [pathname]);

  const memberHref = member ? '/membership/card' : '/membership';
  const memberLabel = member ? '내 회원증' : '회원 로그인';

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const navItems = NAV_MENU.map((item) => ({ label: item.label, href: item.href }));

  return (
    <>
      {/* 최상단 그린 액센트 바 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #15803d 0%, #16a34a 50%, #22c55e 100%)',
          zIndex: 501,
        }}
      />

      <nav
        style={{
          position: 'fixed',
          top: 3,
          left: 0,
          right: 0,
          zIndex: 500,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background 0.3s, box-shadow 0.3s',
          background: scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid #e5e7eb' : '1px solid rgba(229,231,235,0.6)',
          boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.07)' : 'none',
          padding: '0 40px',
        }}
      >
        {/* Logo + 기관명 */}
        <Link href="/" aria-label="GWAA 홈" style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, textDecoration: 'none' }}>
          <Image
            src="/gwaa-logo.png"
            alt="GWAA gangwon animal association"
            width={110}
            height={48}
            style={{ objectFit: 'contain', height: 34, width: 'auto' }}
            priority
          />
          <span
            className="hidden lg:block"
            style={{
              width: 1,
              height: 26,
              background: '#e5e7eb',
              flexShrink: 0,
            }}
          />
          <span
            className="hidden lg:block"
            style={{
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 700,
              color: '#6b7280',
              letterSpacing: '0.02em',
              lineHeight: 1.5,
            }}
          >
            강원도<br />반려동물협회
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center" style={{ height: 60 }}>
          <SlideTabsNav items={navItems} pathname={pathname ?? ''} />
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={memberHref}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', borderRadius: 9999,
              fontSize: 12, fontFamily: MONO, fontWeight: 700, letterSpacing: '0.06em',
              color: '#16a34a', background: '#fff', border: '1.5px solid #16a34a',
              textDecoration: 'none', transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f0fdf4'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M20 14v3M17 20h3"/>
            </svg>
            {memberLabel}
          </Link>
          <Link
            href="/mateship#join"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 18px',
              borderRadius: 9999,
              fontSize: 12,
              fontFamily: MONO,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#fff',
              background: '#16a34a',
              textDecoration: 'none',
              transition: 'all 0.15s',
              boxShadow: '0 2px 12px rgba(22,163,74,0.3)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#15803d';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(22,163,74,0.4)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#16a34a';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(22,163,74,0.3)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            메이트쉽 가입
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] p-3 rounded-lg"
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label="메뉴 열기"
          aria-expanded={drawerOpen}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span
            style={{
              display: 'block',
              width: 20,
              height: 1.5,
              background: '#374151',
              borderRadius: 2,
              transition: 'all 0.3s',
              transform: drawerOpen ? 'translateY(6.5px) rotate(45deg)' : 'none',
            }}
          />
          <span
            style={{
              display: 'block',
              width: 20,
              height: 1.5,
              background: '#374151',
              borderRadius: 2,
              transition: 'all 0.3s',
              opacity: drawerOpen ? 0 : 1,
            }}
          />
          <span
            style={{
              display: 'block',
              width: 20,
              height: 1.5,
              background: '#374151',
              borderRadius: 2,
              transition: 'all 0.3s',
              transform: drawerOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
            }}
          />
        </button>
      </nav>

      {/* Backdrop */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 480,
              background: 'rgba(0,0,0,0.5)',
            }}
            className="md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'fixed',
              top: 63,
              right: 0,
              bottom: 0,
              zIndex: 490,
              width: 'min(300px, 85vw)',
              background: '#fff',
              borderLeft: '1px solid #e5e7eb',
              overflowY: 'auto',
            }}
            className="md:hidden"
          >
            {/* 드로어 헤더 */}
            <div style={{
              padding: '16px 20px',
              background: '#f0fdf4',
              borderBottom: '1px solid #dcfce7',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
              <span style={{
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: '#15803d',
              }}>
                강원도반려동물협회
              </span>
            </div>

            <div style={{ padding: '8px 0 20px' }}>
              {NAV_MENU.map((item, i) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      height: 52,
                      padding: '0 20px',
                      borderBottom: i < NAV_MENU.length - 1 ? '1px solid #f3f4f6' : 'none',
                      fontFamily: MONO,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: isActive ? '#16a34a' : '#374151',
                      textDecoration: 'none',
                      background: isActive ? '#f0fdf4' : 'transparent',
                      borderLeft: isActive ? '3px solid #16a34a' : '3px solid transparent',
                    }}
                  >
                    {item.label}
                    {isActive && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </Link>
                );
              })}

              <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link
                  href={memberHref}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '13px 20px', borderRadius: 12,
                    fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
                    color: '#16a34a', background: '#fff', border: '1.5px solid #16a34a',
                    textDecoration: 'none',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M20 14v3M17 20h3"/>
                  </svg>
                  {memberLabel}
                </Link>
                <Link
                  href="/mateship#join"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '13px 20px',
                    borderRadius: 12,
                    fontFamily: MONO,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: '#fff',
                    background: '#16a34a',
                    textDecoration: 'none',
                    boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  메이트쉽 가입하기
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
