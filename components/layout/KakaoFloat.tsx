'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function KakaoFloat() {
  return (
    <motion.div
      className="fixed bottom-7 right-7 z-[999]"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
    >
      <Link
        href="https://pf.kakao.com/_wipZX"
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: '#FEE500', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
        aria-label="카카오채널로 문의하기"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#000000">
          <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.618 1.574 4.917 3.963 6.294L5 21l4.576-2.452A11.2 11.2 0 0012 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z" />
        </svg>
      </Link>
    </motion.div>
  );
}
