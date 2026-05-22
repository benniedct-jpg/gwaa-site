'use client';

import { CSSProperties } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: CSSProperties;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.4s ease infinite',
        ...style,
      }}
    />
  );
}

/** Card-shaped skeleton for grid layouts */
export function CardSkeleton({ aspectRatio = '1/1' }: { aspectRatio?: string }) {
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1.5px solid #f0f0f0' }}>
      <div style={{ aspectRatio, background: '#f3f4f6', animation: 'skeleton-shimmer 1.4s ease infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg,#f3f4f6 25%,#e9ebee 50%,#f3f4f6 75%)' }} />
      <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Skeleton height={12} width="40%" borderRadius={6} />
        <Skeleton height={20} width="80%" borderRadius={6} />
        <Skeleton height={11} width="60%" borderRadius={6} />
      </div>
    </div>
  );
}

/** Inline shimmer animation — added to globals */
export function SkeletonStyle() {
  return (
    <style>{`
      @keyframes skeleton-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  );
}
