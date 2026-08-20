'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useGWAADB } from '@/hooks/useGWAADB';
import { STORES } from '@/lib/db/gwaaDB';
import { MateshipPartner } from '@/types';
import Eyebrow from '@/components/ui/Eyebrow';
import CountUp from '@/components/shared/CountUp';
import { staggerContainer, fadeUp } from '@/lib/animations';
import { useIsMobile } from '@/hooks/useIsMobile';
import ProposalModal from '@/components/shared/ProposalModal';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";

const BENEFITS = [
  { num: '01', icon: '🏨', title: '숙박 할인', desc: '강원 곳곳 파트너 호텔·리조트·펜션을 회원가로. 우리 애랑 떠나는 하룻밤이 한결 가벼워져요.', color: 'blue' },
  { num: '02', icon: '☕', title: '카페 & 맛집', desc: '반려동물 동반 카페·맛집에서 20~30% 할인. 눈치 안 보고, 우리 애랑 같이 앉아요.', color: 'amber' },
  { num: '03', icon: '⛺', title: '캠핑 할인', desc: '반려견 동반 캠핑장 30% 이상 할인. 자연 속에서 보내는 하루, 부담은 덜어드릴게요.', color: 'green' },
  { num: '04', icon: '🎪', title: '행사 우선 참여', desc: 'GWAA 행사는 식구가 먼저예요. 금방 마감되는 인기 행사, 자리부터 맡아드릴게요.', color: 'green' },
  { num: '05', icon: '🎓', title: '교육 프로그램 할인', desc: '어질리티·오비디언스·행동지도사 교육을 회원 할인가로. 우리 애랑 한 뼘 더 가까워져요.', color: 'blue' },
  { num: '06', icon: '🤝', title: '반려인 네트워크', desc: '강원 반려인끼리 모여 정보도, 하루도 나눠요. 혼자보다 같이가 든든하니까요.', color: 'amber' },
  { num: '07', icon: '🥩', title: '사료·간식 할인', desc: '파트너 펫푸드 브랜드를 회원 전용가로. 매달 나가는 사료값, 꾸준히 아껴져요.', color: 'green' },
];

const FAQS = [
  { q: '가입은 어떻게 하나요?', a: '카카오채널이나 아래 신청 폼에 남겨주시면, 담당자가 하루 안에 연락드려요.' },
  { q: '가입비가 있나요?', a: '가입비·연회비는 카카오채널이나 033-813-0333으로 편하게 물어봐 주세요. 바로 안내드릴게요.' },
  { q: '어디서 혜택을 받을 수 있어요?', a: '춘천·원주·강릉·속초·양양·고성·평창 등 강원 곳곳, 18곳이 넘는 제휴 브랜드에서 받으실 수 있어요.' },
  { q: '우리 애가 대형견인데, 가입에 제한이 있나요?', a: '가입에는 아무 제한이 없어요. 다만 가게마다 입장 기준이 조금씩 달라서, 방문 전에 한 번 확인해 주시면 좋아요.' },
  { q: '혜택은 언제부터 쓸 수 있나요?', a: '가입이 확인되면 폰에서 바로 쓰는 디지털 회원증(QR)을 발급해 드려요. 실물 카드 없이, 제휴처에서 QR만 보여주면 끝이에요.' },
  { q: '사료·간식 할인은 어떻게 받아요?', a: '로그인 후 디지털 회원증 화면에서 회원 전용 할인가로 구매하실 수 있어요. 비회원에게 새어나가지 않도록 회원만 접근하는 방식이라, 혜택은 오롯이 식구들 몫이에요.' },
];

const CALC_ITEMS = [
  { label: '호텔·리조트 숙박', icon: '🏨', unit: '박', max: 10, saving: 30000 },
  { label: '반려동물 카페',    icon: '☕', unit: '회', max: 24, saving: 5000  },
  { label: '캠핑장 이용',      icon: '⛺', unit: '박', max: 12, saving: 20000 },
  { label: '반려동물 행사',    icon: '🎪', unit: '회', max: 12, saving: 10000 },
  { label: '교육 프로그램',    icon: '🎓', unit: '회', max: 10, saving: 25000 },
  { label: '반려동물 용품',    icon: '🛍️', unit: '회', max: 24, saving: 8000  },
  { label: '사료·간식',        icon: '🥩', unit: '회', max: 12, saving: 12000 },
];

const STATS = [
  { value: 40000, suffix: '+', label: '함께한 반려인' },
  { value: 5,     suffix: '년+', label: '쉬지 않은 해' },
  { value: 18,    suffix: '개+', label: '손잡은 강원 브랜드' },
];

function SocialProof() {
  const isMobile = useIsMobile();
  return (
    <section style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        }}
      >
        {STATS.map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            custom={i * 0.1}
            style={{
              textAlign: 'center',
              padding: isMobile ? '36px 20px' : '52px 0',
              borderBottom: isMobile && i < STATS.length - 1 ? '1px solid #e5e7eb' : 'none',
              borderRight: !isMobile && i < STATS.length - 1 ? '1px solid #e5e7eb' : 'none',
            }}
          >
            <div style={{ fontFamily: BEBAS, fontSize: isMobile ? 'clamp(40px,10vw,56px)' : 'clamp(48px,5.5vw,64px)', color: '#16a34a', lineHeight: 1, letterSpacing: '0.02em', marginBottom: 10 }}>
              <CountUp value={stat.value} suffix={stat.suffix} />
            </div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: '#6b7280', letterSpacing: '0.02em' }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function SavingsCalculator() {
  const [quantities, setQuantities] = useState(CALC_ITEMS.map(() => 2));
  const total = CALC_ITEMS.reduce((sum, item, i) => sum + item.saving * quantities[i], 0);
  const isMobile = useIsMobile();
  const px = isMobile ? '20px' : '60px';

  return (
    <section id="calculator" style={{ padding: `${isMobile ? '48px' : '68px'} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#f0fdf4', position: 'relative', overflow: 'hidden' }}>
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.05, 0.10, 0.05] }}
        transition={{ duration: 7, repeat: Infinity }}
        style={{ position: 'absolute', top: '-20%', right: '-10%', width: 360, height: 360, borderRadius: '50%', background: '#16a34a', filter: 'blur(80px)', pointerEvents: 'none' }}
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
              <span style={{ fontFamily: MONO, fontSize: 12, color: '#16a34a', letterSpacing: '0.06em' }}>SAVINGS CALCULATOR</span>
            </div>
            <h2 style={{ fontFamily: BEBAS, fontSize: isMobile ? 27 : 'clamp(24px, 3.4vw, 36px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1 }}>
              1년이면 이만큼 아껴요
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
              <div style={{ fontFamily: MONO, fontSize: 12, color: '#6b7280', marginBottom: 4 }}>내 예상 절약액</div>
              <div style={{ fontFamily: BEBAS, fontSize: isMobile ? 32 : 'clamp(32px, 4vw, 48px)', color: '#16a34a', letterSpacing: '0.04em' }}>
                {total.toLocaleString('ko-KR')}원
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? 10 : 14 }}>
          {CALC_ITEMS.map((item, i) => (
            <motion.div
              key={item.label}
              variants={fadeUp}
              custom={i * 0.05}
              style={{
                background: '#fff',
                border: '1.5px solid #e5e7eb',
                borderRadius: 14,
                padding: '16px 18px',
                ...(!isMobile && CALC_ITEMS.length % 2 !== 0 && i === CALC_ITEMS.length - 1
                  ? { gridColumn: 'span 2' }
                  : {}),
              }}
            >
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginTop: 6, fontFamily: MONO }}>
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
    <section id="faq" style={{ padding: `${isMobile ? '48px' : '68px'} ${px}`, paddingBottom: isMobile ? '120px' : '88px', borderBottom: '1px solid #e5e7eb', background: '#f8fafb' }}>
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
        <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
          <Eyebrow text="FAQ" />
          <h2 style={{ fontFamily: BEBAS, fontSize: isMobile ? 27 : 'clamp(24px, 3.6vw, 38px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1 }}>
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
                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, paddingBottom: 18 }}>{faq.a}</p>
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
  const [proposalOpen, setProposalOpen] = useState(false);
  const px = isMobile ? '20px' : '60px';
  const py = isMobile ? '48px' : '68px';

  return (
    <>
      {/* 모바일 스티키 CTA */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 400,
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid #e5e7eb',
          padding: '12px 20px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}>
          <Link
            href="#join"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '14px 20px',
              borderRadius: 12,
              background: '#16a34a',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
            }}
          >
            지금 식구 되기 →
          </Link>
        </div>
      )}

      {/* 1. Social Proof — 숫자로 신뢰 */}
      <SocialProof />

      {/* 2. Benefits — 혜택 먼저 이해 */}
      <section id="benefits" style={{ padding: `${py} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#f8fafb' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
            <Eyebrow text="FULL BENEFITS" />
            <h2 style={{ fontFamily: BEBAS, fontSize: isMobile ? 27 : 'clamp(24px, 3.6vw, 38px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1 }}>
              메이트라서 누리는 것들
            </h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 12 : 16 }}>
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.num}
                variants={fadeUp}
                custom={i * 0.05}
                whileHover={!isMobile ? { y: -4, boxShadow: '0 8px 28px rgba(0,0,0,0.08)' } : undefined}
                style={{
                  background: '#fff',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 14,
                  padding: isMobile ? '18px 20px' : '24px 26px',
                }}
              >
                <div style={{ fontFamily: MONO, fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{b.num}</div>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{b.icon}</div>
                <h3 style={{ fontFamily: BEBAS, fontSize: 20, color: '#111', letterSpacing: '0.02em', marginBottom: 6 }}>{b.title}</h3>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, fontWeight: 400 }}>{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 3. Calculator — 혜택 이해 후 내 절약액 확인 */}
      <SavingsCalculator />

      {/* 4. Partners */}
      <section id="partners" style={{ padding: `${py} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
            <Eyebrow text="PARTNERS" />
            <h2 style={{ fontFamily: BEBAS, fontSize: isMobile ? 27 : 'clamp(24px, 3.6vw, 38px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1 }}>
              함께하는 브랜드
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
                  <Link
                    href={`/mateship/${p.id ?? p.order}`}
                    style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{ height: 70, background: p.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>
                      {p.imageData ? <img src={p.imageData} alt={p.name} style={{ height: 50, objectFit: 'contain' }} /> : p.icon}
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 3 }}>{p.name}</h3>
                      <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 3 }}>{p.region} · {p.type}</p>
                      <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>✨ {p.discount}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* 업체 제휴 제안 CTA */}
          <motion.div variants={fadeUp} style={{ marginTop: isMobile ? 24 : 32 }}>
            <div style={{
              background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 18,
              padding: isMobile ? '24px 22px' : '30px 36px',
              display: 'flex', flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 16,
            }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: '#16a34a', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 8 }}>FOR BUSINESSES</div>
                <h3 style={{ fontFamily: BEBAS, fontSize: isMobile ? 24 : 30, color: '#111', letterSpacing: '0.02em', margin: '0 0 6px' }}>함께할 브랜드, 찾고 있어요</h3>
                <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.6, margin: 0, wordBreak: 'keep-all' }}>
                  반려동물 · 여행 · 캠핑 · 펫푸드 브랜드라면, 4만 반려인과 이어드릴게요. 먼저 손 내밀어 주시면 바로 연락드릴게요.
                </p>
              </div>
              <button
                onClick={() => setProposalOpen(true)}
                style={{
                  flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 30px', borderRadius: 9999, background: '#16a34a', color: '#fff',
                  fontSize: 14.5, fontWeight: 700, letterSpacing: '0.02em', border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(22,163,74,0.28)', whiteSpace: 'nowrap',
                }}
              >
                제휴 제안하기 →
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 5. Join — 가입까지 24시간 */}
      <section id="join" style={{ padding: `${py} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#f0fdf4' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 12 }}>
            <Eyebrow text="HOW TO JOIN" />
            <h2 style={{ fontFamily: BEBAS, fontSize: isMobile ? 27 : 'clamp(24px, 3.6vw, 38px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1, marginBottom: 8 }}>
              오늘 신청하면, 이번 주말부터 식구예요
            </h2>
            <p style={{ fontSize: 14, color: '#374151', marginBottom: 32 }}>신청부터 디지털 회원증 발급까지, 하루면 충분해요.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 20 : 20, marginBottom: 40 }}>
            {['카카오채널이나 신청 폼에 남기기', '담당자가 확인하고 연락드려요', '가입 안내받고 서류 제출', '디지털 회원증 받고 바로 혜택 시작'].map((step, i) => (
              <motion.div key={i} variants={fadeUp} custom={i * 0.06} style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 12px', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BEBAS, fontSize: 20, color: '#fff' }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{step}</p>
              </motion.div>
            ))}
          </div>
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="https://pf.kakao.com/_wipZX"
              target="_blank"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '15px 36px', borderRadius: 9999,
                background: '#16a34a', color: '#fff',
                fontSize: 15, fontWeight: 700, letterSpacing: '0.04em',
                boxShadow: '0 4px 20px rgba(22,163,74,0.35)',
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}
            >
              카카오채널로 가입하기 →
            </Link>
            <Link
              href="tel:033-813-0333"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '15px 36px', borderRadius: 9999,
                background: '#fff', color: '#374151',
                border: '1.5px solid #d1d5db',
                fontSize: 15, fontWeight: 600, letterSpacing: '0.04em',
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}
            >
              📞 033-813-0333
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 6. FAQ */}
      <FAQAccordion />

      <ProposalModal kind="mateship" open={proposalOpen} onClose={() => setProposalOpen(false)} />
    </>
  );
}
