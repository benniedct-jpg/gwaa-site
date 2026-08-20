'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { useIsMobile } from '@/hooks/useIsMobile';

const NAV_COLS = [
  {
    heading: '협회',
    links: [
      { label: '협회 소개',   href: '/about' },
      { label: '협회 연혁',   href: '/about#history' },
      { label: '주요 사업',   href: '/about#activities' },
      { label: '문의하기',   href: '/contact' },
    ],
  },
  {
    heading: '프로그램',
    links: [
      { label: '행사 일정',   href: '/events' },
      { label: '교육 프로그램', href: '/education' },
      { label: '반려동물 여행', href: '/travel' },
      { label: '메이트쉽 멤버십', href: '/mateship' },
      { label: '회비·후원',     href: '/support' },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subbed, setSubbed] = useState(false);
  const [agreeMkt, setAgreeMkt] = useState(false);
  const isMobile = useIsMobile();
  const px = isMobile ? '20px' : '60px';

  const handleSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (!agreeMkt) return;
    try {
      await fetch('/api/data/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), created_at: new Date().toISOString() }),
      });
    } catch {}
    setEmail('');
    setSubbed(true);
    setTimeout(() => setSubbed(false), 4000);
  };

  return (
    <footer style={{ background: '#f8fafb', borderTop: '1px solid #e5e7eb' }} role="contentinfo">
      {/* Main grid */}
      <div style={{
        padding: `${isMobile ? '40px' : '56px'} ${px} ${isMobile ? '32px' : '40px'}`,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr 1.4fr',
        gap: isMobile ? 32 : 48,
        borderBottom: '1px solid #e5e7eb',
      }}>

        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 3, height: 22, borderRadius: 2, background: '#16a34a', flexShrink: 0 }} />
            <span style={{ fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", fontSize: 13, fontWeight: 700, color: '#111', letterSpacing: '0.08em' }}>GWAA</span>
          </div>
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65 }}>
            사단법인 강원도반려동물협회<br />
            반려동물과 사람이 함께 행복한<br />강원도 문화를 만들어갑니다.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <motion.a
              href="https://pf.kakao.com/_wipZX"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, borderColor: '#FEE500' }}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#fff', border: '1px solid #e5e7eb',
                fontSize: 13, fontWeight: 700, color: '#6b7280',
                fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif",
                textDecoration: 'none',
              }}
              aria-label="카카오채널"
            >
              K
            </motion.a>
            <motion.a
              href="tel:033-813-0333"
              whileHover={{ scale: 1.1, borderColor: '#16a34a' }}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#fff', border: '1px solid #e5e7eb',
                fontSize: 13, color: '#6b7280', textDecoration: 'none',
              }}
              aria-label="전화"
            >
              📞
            </motion.a>
          </div>
        </div>

        {/* Nav cols — on mobile, show as 2-col row */}
        {isMobile ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {NAV_COLS.map((col) => (
              <div key={col.heading}>
                <h4 style={{ fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", fontSize: 12, letterSpacing: '0.06em', color: '#16a34a', marginBottom: 14, fontWeight: 700 }}>
                  {col.heading.toUpperCase()}
                </h4>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map((l) => (
                    <Link key={l.href} href={l.href} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>
                      {l.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        ) : (
          NAV_COLS.map((col) => (
            <div key={col.heading}>
              <h4 style={{ fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", fontSize: 12, letterSpacing: '0.06em', color: '#16a34a', marginBottom: 16, fontWeight: 700 }}>
                {col.heading.toUpperCase()}
              </h4>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((l) => (
                  <Link key={l.href} href={l.href} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', transition: 'color 0.15s' }} className="hover:text-gray-700">
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))
        )}

        {/* Newsletter */}
        <div>
          <h4 style={{ fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", fontSize: 12, letterSpacing: '0.06em', color: '#16a34a', marginBottom: 12, fontWeight: 700 }}>
            NEWSLETTER
          </h4>
          <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 16 }}>
            GWAA 새 행사, 교육 일정, 메이트쉽 소식을<br />이메일로 가장 먼저 받아보세요.
          </p>
          <AnimatePresence mode="wait">
            {subbed ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ padding: '12px 16px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 13, color: '#16a34a', fontWeight: 600 }}
              >
                ✓ 구독 완료! 감사합니다 🐾
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSub} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소 입력"
                  required
                  style={{ background: '#fff', border: '1px solid #e5e7eb', color: '#111', borderRadius: 10 }}
                />
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>
                  <input type="checkbox" checked={agreeMkt} onChange={(e) => setAgreeMkt(e.target.checked)} required style={{ marginTop: 2, accentColor: '#16a34a' }} />
                  <span>[필수] 광고성 정보(행사·교육·혜택 안내) 수신 및 이메일 수집·이용에 동의합니다. 수신거부는 언제든 가능합니다.</span>
                </label>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%', padding: '11px 16px', borderRadius: 10,
                    background: '#16a34a', color: '#fff',
                    fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
                    letterSpacing: '0.04em',
                  }}
                >
                  구독하기 →
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        padding: `16px ${px}`,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: 8,
      }}>
        <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.7 }}>
          <p>사단법인 강원도반려동물협회 · 대표: 이지영 · 사업자등록번호 891-82-00469</p>
          <p>강원특별자치도 원주시 천매봉길 20-9 · 033-813-0333 · ganimal1@naver.com</p>
          <p style={{ marginTop: 4 }}>© 2026 사단법인 강원도반려동물협회 All rights reserved.</p>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: '이용약관', href: '/terms' },
            { label: '개인정보처리방침', href: '/privacy' },
            { label: '환불 정책', href: '/refund' },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none', fontWeight: 600, transition: 'color 0.15s' }} className="hover:text-gray-600">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
