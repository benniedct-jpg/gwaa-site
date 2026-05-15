'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_MENU } from '@/lib/utils';
import { SlideTabsNav } from '@/components/ui/slide-tabs';

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const navItems = NAV_MENU.map((item) => ({ label: item.label, href: item.href }));

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[500] h-16 flex items-center justify-between transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.08)' : 'none',
          padding: '0 48px',
        }}
      >
        {/* Logo */}
        <Link href="/" aria-label="GWAA 홈" className="flex items-center flex-shrink-0">
          <Image
            src="/gwaa-logo.png"
            alt="GWAA gangwon animal association"
            width={110}
            height={48}
            style={{ objectFit: 'contain', height: 38, width: 'auto' }}
            priority
          />
        </Link>

        {/* Desktop Nav — SlideTabs */}
        <div className="hidden md:flex items-center h-16">
          <SlideTabsNav items={navItems} pathname={pathname ?? ''} />
        </div>

        {/* CTA */}
        <Link
          href="/mateship#join"
          className="hidden md:inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold tracking-wider transition-all duration-150 hover:opacity-90 hover:-translate-y-px"
          style={{
            background: '#16a34a',
            color: '#fff',
            letterSpacing: '0.06em',
            boxShadow: '0 2px 16px rgba(22,163,74,0.35)',
          }}
        >
          메이트쉽 가입 →
        </Link>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-3 rounded-lg"
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label="메뉴 열기"
          aria-expanded={drawerOpen}
        >
          <span
            className="block w-5 h-px rounded-sm transition-all duration-300"
            style={{ background: '#374151', transform: drawerOpen ? 'translateY(6px) rotate(45deg)' : 'none' }}
          />
          <span
            className="block w-5 h-px rounded-sm transition-all duration-300"
            style={{ background: '#374151', opacity: drawerOpen ? 0 : 1 }}
          />
          <span
            className="block w-5 h-px rounded-sm transition-all duration-300"
            style={{ background: '#374151', transform: drawerOpen ? 'translateY(-6px) rotate(-45deg)' : 'none' }}
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
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[480] md:hidden"
            style={{ background: 'rgba(0,0,0,0.6)' }}
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
            transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-16 right-0 bottom-0 z-[490] overflow-y-auto md:hidden"
            style={{
              width: 'min(320px, 88vw)',
              background: '#fff',
              borderLeft: '1px solid #e5e7eb',
            }}
          >
            <div className="flex flex-col p-5">
              {NAV_MENU.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 52,
                    padding: '0 12px',
                    borderBottom: '1px solid #f3f4f6',
                    fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace",
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: pathname.startsWith(item.href) ? '#16a34a' : '#374151',
                    textDecoration: 'none',
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/mateship#join"
                className="mt-4 flex items-center justify-center px-6 py-3 rounded-full text-sm font-bold"
                style={{ background: '#16a34a', color: '#fff' }}
              >
                메이트쉽 가입 →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
