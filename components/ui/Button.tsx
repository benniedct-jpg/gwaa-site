'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ButtonVariant, ButtonSize } from '@/types';

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: '#16a34a', color: '#fff',
    boxShadow: '0 2px 12px rgba(22,163,74,0.25)',
  },
  outline: {
    background: 'transparent', color: '#111',
    border: '1.5px solid #d1d5db',
  },
  white: {
    background: '#fff', color: '#111',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  dark: {
    background: '#0a0a0a', color: '#fff',
  },
  'ghost-white': {
    background: 'rgba(255,255,255,0.12)', color: '#fff',
    border: '1.5px solid rgba(255,255,255,0.2)',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { fontSize: 11, padding: '8px 18px', minHeight: 38 },
  md: { fontSize: 13, padding: '12px 26px', minHeight: 44 },
  lg: { fontSize: 14, padding: '15px 32px', minHeight: 48 },
};

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  external?: boolean;
  magnetic?: boolean;
}

export { GalleryBtn as Button };

function GalleryBtn({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', padding: '12px 28px',
        borderRadius: 9999, background: '#16a34a', color: '#fff',
        fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer',
        border: 'none', boxShadow: '0 2px 12px rgba(22,163,74,0.3)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
      }}
    >
      {children}
    </button>
  );
}

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  children,
  className,
  type = 'button',
  disabled,
  external,
  magnetic = true,
}: ButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const translateX = useTransform(x, [-0.5, 0.5], [-6, 6]);
  const translateY = useTransform(y, [-0.5, 0.5], [-4, 4]);

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
    fontWeight: 700,
    letterSpacing: '0.04em',
    borderRadius: 9999,
    cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    border: 'none',
    whiteSpace: 'nowrap' as const,
    position: 'relative',
    opacity: disabled ? 0.5 : 1,
    ...variantStyles[variant],
    ...sizeStyles[size],
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!magnetic || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const motionProps = magnetic ? { style: { x: translateX, y: translateY } } : {};

  const content = (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={className}
      {...motionProps}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {href ? (
        <Link
          href={href}
          style={baseStyle}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
        >
          {children}
        </Link>
      ) : (
        <button type={type} onClick={onClick} disabled={disabled} style={baseStyle}>
          {children}
        </button>
      )}
    </motion.div>
  );

  return content;
}
