'use client';

import { motion } from 'framer-motion';
import CountUp from '@/components/shared/CountUp';
import Eyebrow from '@/components/ui/Eyebrow';
import { staggerContainer, fadeUp } from '@/lib/animations';
import { useIsMobile } from '@/hooks/useIsMobile';

const VALUES = [
  { label: '설립 목적', text: '반려동물과 사람이 함께 행복한 강원도 문화 조성' },
  { label: '핵심 가치', text: '교육 · 나눔 · 연결 · 성장' },
  { label: '활동 지역', text: '강원특별자치도 전역 (18개 시군)' },
  { label: '운영 규모', text: '2021년 창립 이후 누적 4만명+ 참여' },
];

const ACTIVITIES = [
  { icon: '🎪', title: '행사 기획 · 운영', desc: '강원도 전역에서 트레킹, 캠핑, 문화축제 등 반려동물 행사를 직접 기획하고 운영합니다. 2021년부터 4만명+가 함께했습니다.', href: '/events', color: '#16a34a' },
  { icon: '🎓', title: '반려동물 교육', desc: '독스포츠 어질리티·오비디언스 정규 교육과 반려동물행동지도사 국가자격증 취득 과정을 운영합니다.', href: '/education', color: '#2563eb' },
  { icon: '🤝', title: '메이트쉽 멤버십', desc: '강원도 전역 18개 이상 제휴업체 혜택과 GWAA 프로그램 할인으로 연간 40만원 이상 절약하는 멤버십입니다.', href: '/mateship', color: '#d97706' },
  { icon: '🌿', title: '반려동물 여행', desc: '강원도 반려동물 동반 여행 코스, 호텔·리조트·카페·캠핑장 정보를 큐레이션합니다.', href: '/travel', color: '#0891b2' },
  { icon: '📋', title: '자격 인증 · 심판', desc: '반려동물행동지도사 국가자격증 교육기관으로 공인 독스포츠 심판을 배출합니다.', href: '/education#license', color: '#7c3aed' },
  { icon: '🌱', title: '반려 문화 개선', desc: '펫티켓 캠페인, 플로깅 봉사, 지식포럼을 통해 강원도 반려동물 공존 문화 수준을 높여갑니다.', href: '/about#history', color: '#dc2626' },
];

export default function AboutContent() {
  const isMobile = useIsMobile();
  const px = isMobile ? '20px' : '60px';
  const py = isMobile ? '56px' : '88px';

  return (
    <>
      {/* Vision */}
      <section id="vision" style={{ padding: `${py} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#f8fafb' }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 32 : 60,
          }}
        >
          <motion.div variants={fadeUp}>
            <Eyebrow text="VISION" />
            <blockquote style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: isMobile ? 32 : 'clamp(28px, 4vw, 48px)',
              color: '#111', letterSpacing: '0.02em', lineHeight: 1.1,
              marginBottom: 20,
            }}>
              &ldquo;문화가 바뀌어야<br />반려생활이 달라집니다&rdquo;
            </blockquote>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, fontWeight: 300 }}>
              GWAA는 반려동물과 사람이 함께 살아가는 문화를 만드는 사단법인입니다. 교육, 행사, 멤버십을 통해 강원도 반려동물 문화의 기준을 높여갑니다.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {VALUES.map((v, i) => (
              <motion.div
                key={v.label}
                variants={fadeUp}
                custom={i * 0.06}
                style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: isMobile ? '16px 18px' : '20px 22px' }}
              >
                <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 9, color: '#16a34a', letterSpacing: '0.12em', marginBottom: 8 }}>
                  {v.label}
                </div>
                <p style={{ fontSize: isMobile ? 12 : 13, color: '#111', fontWeight: 500, lineHeight: 1.6 }}>{v.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Activity Cards */}
      <section style={{ padding: `${py} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 48 }}>
            <Eyebrow text="WHAT WE DO" />
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? 32 : 'clamp(26px,5.5vw,52px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1 }}>
              주요 사업
            </h2>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: isMobile ? 12 : 16,
          }}>
            {ACTIVITIES.map((item, i) => (
              <motion.a
                key={item.title}
                href={item.href}
                variants={fadeUp}
                custom={i * 0.06}
                whileHover={!isMobile ? { y: -10, boxShadow: '0 16px 40px rgba(0,0,0,0.1)' } : undefined}
                style={{
                  background: '#fff', border: '1.5px solid #e5e7eb',
                  borderRadius: isMobile ? 14 : 20,
                  padding: isMobile ? '18px 16px' : '28px 26px',
                  textDecoration: 'none', color: 'inherit',
                  position: 'relative', overflow: 'hidden',
                  display: 'block',
                }}
              >
                <div style={{
                  position: 'absolute', top: -40, right: -40,
                  width: 120, height: 120, borderRadius: '50%',
                  background: item.color, opacity: 0.08,
                  pointerEvents: 'none',
                }} />
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: isMobile ? 40 : 52, height: isMobile ? 40 : 52,
                    borderRadius: 12, background: `${item.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isMobile ? 20 : 26, marginBottom: isMobile ? 10 : 16,
                  }}>
                    {item.icon}
                  </div>
                  <h3 style={{
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: isMobile ? 17 : 22,
                    color: '#111', letterSpacing: '0.02em',
                    marginBottom: isMobile ? 6 : 10, lineHeight: 1.15,
                  }}>
                    {item.title}
                  </h3>
                  {!isMobile && (
                    <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.75, fontWeight: 300, marginBottom: 16 }}>
                      {item.desc}
                    </p>
                  )}
                  <div style={{ marginTop: isMobile ? 8 : 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: item.color }}>자세히 →</span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section style={{ padding: `${isMobile ? '48px' : '64px'} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, textAlign: 'center' }}
        >
          {[
            { val: 40000, suf: '+', label: '누적 참가자' },
            { val: 90,    suf: '회+', label: '진행 행사' },
            { val: 4,     suf: '년+', label: '운영 연혁' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              custom={i * 0.06}
              style={{ padding: `${isMobile ? '28px' : '40px'} 0`, borderRight: i < 2 ? '1px solid #e5e7eb' : 'none' }}
            >
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? 'clamp(28px,8vw,40px)' : 'clamp(36px, 5vw, 56px)', color: '#16a34a', lineHeight: 1, marginBottom: 8 }}>
                <CountUp value={s.val} suffix={s.suf} />
              </div>
              <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: isMobile ? 9 : 10, color: '#6b7280', letterSpacing: '0.1em' }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
}
