'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/useIsMobile';

const TIPS = [
  { icon: '💧', title: '수분 보충', text: '반려동물에게 신선한 물을 항상 제공하세요. 하루 체중 1kg당 50ml의 수분이 필요합니다.' },
  { icon: '🚶', title: '규칙적인 산책', text: '매일 같은 시간에 산책하면 반려동물의 심리적 안정에 도움이 됩니다.' },
  { icon: '🦷', title: '구강 관리', text: '주 2~3회 이상 양치질을 해주세요. 구강 건강이 전신 건강과 직결됩니다.' },
  { icon: '🐾', title: '발바닥 관리', text: '산책 후 발바닥을 닦아주고, 발톱이 너무 길어지지 않도록 정기적으로 관리하세요.' },
  { icon: '💊', title: '정기 검진', text: '성견은 연 1회, 7세 이상은 연 2회 건강 검진을 권장합니다.' },
  { icon: '🎾', title: '놀이 시간', text: '하루 30분 이상 반려동물과 함께 놀아주세요. 인지 능력과 사회성이 향상됩니다.' },
  { icon: '🛁', title: '목욕 주기', text: '강아지는 2~4주에 한 번 목욕이 적당합니다. 과도한 목욕은 피부를 건조하게 합니다.' },
  { icon: '🌡️', title: '적정 온도', text: '반려동물이 쉬는 공간의 온도를 18~24°C로 유지해주세요.' },
  { icon: '🥩', title: '균형 잡힌 식사', text: '반려동물의 나이와 체중에 맞는 사료를 선택하고, 일정한 시간에 급여하세요.' },
  { icon: '🪮', title: '정기 그루밍', text: '털 엉킴을 방지하고 피부 상태를 확인하기 위해 정기적으로 빗질해 주세요.' },
  { icon: '🏥', title: '예방접종', text: '연간 예방접종 일정을 지켜 전염병을 예방하세요. 광견병 접종은 의무입니다.' },
  { icon: '😴', title: '충분한 수면', text: '성견은 12~14시간, 강아지는 16~18시간의 수면이 필요합니다. 조용한 잠자리를 마련해 주세요.' },
  { icon: '👁️', title: '눈 건강', text: '눈곱이 자주 끼거나 눈물이 많으면 수의사 진료가 필요합니다. 정기적으로 눈을 확인하세요.' },
  { icon: '🎓', title: '기초 훈련', text: '앉아, 기다려, 이리와 같은 기초 명령어 훈련은 안전과 소통에 필수입니다.' },
];

export default function DailyTip() {
  const [tip, setTip] = useState(TIPS[0]);
  const isMobile = useIsMobile();

  useEffect(() => {
    const day = new Date().getDate() % TIPS.length;
    setTip(TIPS[day]);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      style={{
        padding: isMobile ? '20px 20px' : '32px 60px',
        borderBottom: '1px solid #e5e7eb',
        background: '#f0fdf4',
        display: 'flex', alignItems: 'center', gap: 16,
        flexWrap: isMobile ? 'wrap' : 'nowrap',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
        background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
      }}>
        {tip.icon}
      </div>
      <div>
        <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 9, color: '#16a34a', letterSpacing: '0.12em', marginBottom: 4 }}>
          TODAY&apos;S PET TIP
        </div>
        <div style={{ fontSize: isMobile ? 13 : 14, color: '#111', fontWeight: 700, marginBottom: 2 }}>{tip.title}</div>
        <p style={{ fontSize: isMobile ? 12 : 13, color: '#374151', lineHeight: 1.7, margin: 0 }}>{tip.text}</p>
      </div>
    </motion.section>
  );
}
