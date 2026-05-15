'use client';

import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useTransform, animate, motion } from 'framer-motion';

interface CountUpProps {
  value: number;
  suffix?: string;
  duration?: number;
}

export default function CountUp({ value, suffix = '', duration = 2 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${Math.round(v).toLocaleString('ko-KR')}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(count, value, {
      duration,
      ease: [1, 0, 0.2, 1],
    });
    return ctrl.stop;
  }, [inView, value, duration, count]);

  return <motion.span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>{rounded}</motion.span>;
}
