'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useGWAADB } from '@/hooks/useGWAADB';
import { STORES } from '@/lib/db/gwaaDB';
import { MateshipPartner } from '@/types';
import Eyebrow from '@/components/ui/Eyebrow';
import { staggerContainer, fadeUp } from '@/lib/animations';
import { useIsMobile } from '@/hooks/useIsMobile';

const MONO = "'SF Mono','Menlo','Monaco','Consolas','Courier New',monospace";
const BEBAS = "'Bebas Neue', cursive";

const BENEFITS = [
  { num: '01', icon: '🏨', title: '숙박 할인', desc: '강원도 파트너 호텔, 리조트, 펜션에서 메이트쉽 회원 전용 특가. 인터넷 최저가 이하의 혜택을 누리세요.', color: 'blue' },
  { num: '02', icon: '☕', title: '카페 & 맛집', desc: '반려동물 동반 가능한 강원도 카페와 레스토랑에서 20~30% 할인 혜택을 제공합니다.', color: 'amber' },
  { num: '03', icon: '⛺', title: '캠핑 할인', desc: '반려견 동반 캠핑장에서 30% 이상 할인. 자연에서 반려동물과 함께하는 특별한 시간.', color: 'green' },
  { num: '04', icon: '🎪', title: '행사 우선 참여', desc: '모든 GWAA 행사에 회원 우선 신청권. 조기 마감되는 인기 행사를 놓치지 마세요.', color: 'green' },
  { num: '05', icon: '🎓', title: '교육 프로그램 할인', desc: '어질리티, 오비디언스, 반려동물행동지도사 자격증 교육에서 회원 할인 혜택을 받으세요.', color: 'blue' },
  { num: '06', icon: '🤝', title: '반려인 네트워크', desc: '강원도 반려인들과의 소통과 정보 공유. GWAA 커뮤니티에서 함께 성장하세요.', color: 'amber' },
];

const FAQS = [
  { q: '메이트쉽 가입 방법은 어떻게 되나요?', a: '카카오채널 또는 아래 가입 신청 폼을 통해 신청하실 수 있습니다. 담당자가 확인 후 24시간 이내 연락드립니다.' },
  { q: '멤버십 비용이 있나요?', a: '현재 메이트쉽 가입비 및 연회비에 대한 정보는 카카오채널 또는 033-813-0333으로 문의 바랍니다.' },
  { q: '어떤 지역에서 혜택을 받을 수 있나요?', a: '강원도 전역의 18개 이상 제휴업체에서 혜택을 받으실 수 있습니다. 춘천, 원주, 강릉, 속초, 양양, 고성, 평창 등 주요 지역 포함.' },
  { q: '반려동물 종류 및 크기 제한이 있나요?', a: '메이트쉽 가입에는 제한이 없습니다. 단, 개별 제휴업체별 입장 기준이 다를 수 있으니 방문 전 확인을 권장합니다.' },
  { q: '혜택은 언제부터 사용 가능한가요?', a: '가입 확인 후 즉시 메이트쉽 멤버 카드를 발급해 드립니다. 카드 수령 즉시 모든 혜택을 이용하실 수 있습니다.' },
];

const CALC_ITEMS = [
  { label: '호텔·리조트 숙박', icon: '🏨', unit: '박', max: 10, saving: 30000 },
  { label: '반려동물 카페',    icon: '☕', unit: '회', max: 24, saving: 5000  },
  { label: '캠핑장 이용',      icon: '⛺', unit: '박', max: 12, saving: 20000 },
  { label: '반려동물 행사',    icon: '🎪', unit: '회', max: 12, saving: 10000 },
  { label: '교육 프로그램',    icon: '🎓', unit: '회', max: 10, saving: 25000 },
  { label: '반려동물 용품',    icon: '🛍️', unit: '회', max: 24, saving: 8000  },
];

function SavingsCalculator() {
  const [quantities, setQuantities] = useState(CALC_ITEMS.map(() => 2));
  const total = CALC_ITEMS.reduce((sum, item, i) => sum + item.saving * quantities[i], 0);
  const isMobile = useIsMobile();
  const px = isMobile ? '20px' : '60px';

  return (
    <section id="calculator" style={{ padding: `${isMobile ? '56px' : '88px'} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#f0fdf4', position: 'relative', overflow: 'hidden' }}>
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 7, repeat: Infinity }}
        style={{ position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: '#16a34a', filter: 'blur(140px)', pointerEvents: 'none' }}
      />
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} style={{ position: 'relative' }}>
        <motion.div variants={fadeUp} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 28,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 24, height: 2, background: '#16a34a', borderRadius: 1 }} />
              <span style={{ fontFamily: MONO, fontSize: 10, color: '#16a34a', letterSpacing: '0.14em' }}>SAVINGS CALCULATOR</span>
            </div>
            <h2 style={{ fontFamily: BEBAS, fontSize: isMobile ? 32 : 'clamp(26px, 5vw, 48px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1 }}>
              연간 절약 계산기
            </h2>
          </div>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={total}
              initial={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              transition={{ duration: 0.2 }}
              style={{ textAlign: isMobile ? 'left' : 'right' }}
            >
              <div style={{ fontFamily: MONO, fontSize: 10, color: '#6b7280', marginBottom: 4 }}>예상 연간 절약액</div>
              <div style={{ fontFamily: BEBAS, fontSize: isMobile ? 32 : 'clamp(32px, 4vw, 48px)', color: '#16a34a', letterSpacing: '0.04em' }}>
                {total.toLocaleString('ko-KR')}원
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 10 }}>
          {CALC_ITEMS.map((item, i) => (
            <motion.div key={item.label} variants={fadeUp} custom={i * 0.05} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: '#111', fontWeight: 500 }}>{item.icon} {item.label}</span>
                <span style={{ fontFamily: MONO, fontSize: 12, color: '#16a34a', fontWeight: 700 }}>
                  {(item.saving * quantities[i]).toLocaleString('ko-KR')}원
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={item.max}
                value={quantities[i]}
                onChange={(e) => {
                  const q = [...quantities];
                  q[i] = Number(e.target.value);
                  setQuantities(q);
                }}
                style={{ width: '100%', accentColor: '#16a34a' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af', marginTop: 6, fontFamily: MONO }}>
                <span>0{item.unit}</span>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>{quantities[i]}{item.unit}</span>
                <span>{item.max}{item.unit}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const px = isMobile ? '20px' : '60px';

  return (
    <section id="faq" style={{ padding: `${isMobile ? '56px' : '88px'} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#f8fafb' }}>
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
        <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
          <Eyebrow text="FAQ" />
          <h2 style={{ fontFamily: BEBAS, fontSize: isMobile ? 32 : 'clamp(26px, 5.5vw, 52px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1 }}>
            자주 묻는 질문
          </h2>
        </motion.div>

        <div style={{ maxWidth: 720 }}>
          {FAQS.map((faq, i) => (
            <motion.div key={i} variants={fadeUp} custom={i * 0.04} style={{ borderBottom: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ fontSize: 14, color: '#111', fontWeight: 500, lineHeight: 1.5 }}>{faq.q}</span>
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  style={{ fontSize: 20, color: open === i ? '#16a34a' : '#9ca3af', flexShrink: 0, marginLeft: 16 }}
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.75, paddingBottom: 18 }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default function MateshipContent() {
  const { data: partners, loading } = useGWAADB<MateshipPartner>(STORES.MATESHIP);
  const isMobile = useIsMobile();
  const px = isMobile ? '20px' : '60px';
  const py = isMobile ? '56px' : '88px';

  return (
    <>
      <SavingsCalculator />

      {/* Benefits */}
      <section id="benefits" style={{ padding: `${py} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#f8fafb' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
            <Eyebrow text="FULL BENEFITS" />
            <h2 style={{ fontFamily: BEBAS, fontSize: isMobile ? 32 : 'clamp(26px, 5.5vw, 52px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1 }}>
              전체 혜택
            </h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 12 : 16 }}>
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.num}
                variants={fadeUp}
                custom={i * 0.05}
                whileHover={!isMobile ? { y: -4, boxShadow: '0 8px 28px rgba(0,0,0,0.08)' } : undefined}
                style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: isMobile ? '18px 20px' : '24px 26px' }}
              >
                <div style={{ fontFamily: MONO, fontSize: 10, color: '#9ca3af', marginBottom: 8 }}>{b.num}</div>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{b.icon}</div>
                <h3 style={{ fontFamily: BEBAS, fontSize: 20, color: '#111', letterSpacing: '0.02em', marginBottom: 6 }}>{b.title}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, fontWeight: 300 }}>{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Partners */}
      <section id="partners" style={{ padding: `${py} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
            <Eyebrow text="PARTNERS" />
            <h2 style={{ fontFamily: BEBAS, fontSize: isMobile ? 32 : 'clamp(26px, 5.5vw, 52px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1 }}>
              제휴업체
            </h2>
          </motion.div>
          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: isMobile ? 10 : 14 }}>
              {partners.map((p, i) => (
                <motion.div
                  key={p.id ?? i}
                  variants={fadeUp}
                  custom={i * 0.04}
                  whileHover={!isMobile ? { y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' } : undefined}
                  style={{ borderRadius: 14, overflow: 'hidden', border: '1.5px solid #e5e7eb' }}
                >
                  <div style={{ height: 70, background: p.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>
                    {p.imageData ? <img src={p.imageData} alt={p.name} style={{ height: 50, objectFit: 'contain' }} /> : p.icon}
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 3 }}>{p.name}</h3>
                    <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>{p.region} · {p.type}</p>
                    <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>✨ {p.discount}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* Join Steps */}
      <section id="join" style={{ padding: `${py} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#f8fafb' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 32 }}>
            <Eyebrow text="HOW TO JOIN" />
            <h2 style={{ fontFamily: BEBAS, fontSize: isMobile ? 32 : 'clamp(26px, 5.5vw, 52px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1 }}>
              가입 방법
            </h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 20 : 20 }}>
            {['카카오채널 또는 신청 폼 작성', '담당자 확인 및 안내 연락', '가입비 납부 및 서류 제출', '멤버 카드 발급 및 혜택 시작'].map((step, i) => (
              <motion.div key={i} variants={fadeUp} custom={i * 0.06} style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 12px', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BEBAS, fontSize: 20, color: '#fff' }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{step}</p>
              </motion.div>
            ))}
          </div>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginTop: 36 }}>
            <Link
              href="https://pf.kakao.com/_wipZX"
              target="_blank"
              style={{
                display: 'inline-flex', alignItems: 'center', padding: '13px 32px',
                borderRadius: 9999, background: '#16a34a', color: '#fff',
                fontSize: 14, fontWeight: 700, letterSpacing: '0.04em',
                boxShadow: '0 4px 20px rgba(22,163,74,0.35)',
                whiteSpace: 'nowrap',
              }}
            >
              카카오채널로 문의하기 →
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <FAQAccordion />
    </>
  );
}
