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
  // 초기값을 최종값으로 둔다 — 검색엔진·미리보기·JS 지연 환경에서 '0+'로 보이던 문제 방지.
  // 화면에 들어오면 0으로 내렸다가 카운트업.
  const count = useMotionValue(value);
  const rounded = useTransform(count, (v) => `${Math.round(v).toLocaleString('ko-KR')}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    count.set(0);
    const ctrl = animate(count, value, {
      duration,
      ease: [1, 0, 0.2, 1],
    });
    return ctrl.stop;
  }, [inView, value, duration, count]);

  return <motion.span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>{rounded}</motion.span>;
}
