'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function KakaoFloat() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="fixed bottom-7 right-5 z-[999] flex items-center gap-3">
      {/* Tooltip label */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.92 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            style={{
              background: '#0a0a0a',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              padding: '8px 14px',
              borderRadius: 10,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue','Apple SD Gothic Neo','Noto Sans KR',sans-serif",
            }}
          >
            카카오채널 빠른 문의
            {/* Arrow */}
            <span style={{
              position: 'absolute', right: -5, top: '50%', transform: 'translateY(-50%)',
              width: 0, height: 0,
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderLeft: '5px solid #0a0a0a',
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        style={{ position: 'relative' }}
      >
        {/* Pulse ring */}
        <span style={{
          position: 'absolute', inset: -4, borderRadius: '50%',
          background: 'rgba(254,229,0,0.4)',
          animation: 'kakao-ring 2s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <Link
          href="https://pf.kakao.com/_wipZX"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            width: 56, height: 56, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#FEE500',
            boxShadow: '0 4px 20px rgba(254,229,0,0.5), 0 2px 8px rgba(0,0,0,0.15)',
            position: 'relative', zIndex: 1,
            opacity: 1,
          }}
          aria-label="카카오채널로 문의하기"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#3A1D1D">
            <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.618 1.574 4.917 3.963 6.294L5 21l4.576-2.452A11.2 11.2 0 0012 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z" />
          </svg>
        </Link>
      </motion.div>

      <style>{`
        @keyframes kakao-ring {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50%       { transform: scale(1.18); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
