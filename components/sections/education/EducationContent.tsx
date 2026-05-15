'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Eyebrow from '@/components/ui/Eyebrow';
import CountUp from '@/components/shared/CountUp';
import { staggerContainer, fadeUp } from '@/lib/animations';

const TOC_ITEMS = [
  { id: 'agility', label: '어질리티 클럽' },
  { id: 'grades', label: '등급 체계' },
  { id: 'curriculum', label: '12주 커리큘럼' },
  { id: 'instructor', label: '전문 강사진' },
  { id: 'pricing', label: '수강료' },
  { id: 'obedience', label: 'OB 훈련' },
  { id: 'license', label: '국가자격증' },
  { id: 'etiquette', label: '에티켓 교육' },
  { id: 'apply', label: '신청' },
];

const WHY_CARDS = [
  { icon: '🚶', title: '산책이 즐거워져요', desc: '끌려다니지 않고, 옆에 나란히 걷는 산책의 즐거움을 경험해요.' },
  { icon: '🏠', title: '분리불안이 줄어요', desc: '혼자 있는 시간을 편안하게 받아들이는 법을 배워요.' },
  { icon: '🤝', title: '유대감이 깊어져요', desc: '같은 목표를 향해 함께 성장하면서 신뢰와 교감이 쌓여요.' },
  { icon: '🎉', title: '함께가 더 즐거워요', desc: '카페·캠핑·여행 어디서나 자연스럽게 함께할 수 있어요.' },
];

const GRADES = [
  {
    num: 'GRADE 01', name: '취미반', en: 'HOBBY CLASS',
    desc: '처음 만나는 어질리티. 낮은 장비부터 천천히 익숙해지면서 즐거움을 발견해요.',
    items: ['기본 핸들링과 장비 적응', '낮은 허들·터널 체험', '보호자와의 교감 중심', '다른 종목 체험 가능'],
    featured: false,
  },
  {
    num: 'GRADE 02', name: '중급반', en: 'INTERMEDIATE',
    desc: '레벨테스트 1단계 통과 후, 본격적인 기술을 익히면서 코스를 연결해 나가요.',
    items: ['다양한 장애물 (허들·터널·타이어)', '방향 전환 핸들링', '클럽 합동 훈련 참여', '노비스 1단계 도전'],
    featured: false,
  },
  {
    num: 'GRADE 03', name: '고급반', en: 'ADVANCED',
    desc: '레벨테스트 2단계 통과 후, 더 다양한 장비와 종합 코스를 완주해 보아요.',
    items: ['고급 장비 (A-프레임·도그워크·시소)', '위브폴 연속 통과', '종합 코스 완주 훈련', '노비스 2단계 대회 출전 대비'],
    featured: true,
  },
  {
    num: 'GRADE 04', name: '대회반', en: 'COMPETITION',
    desc: '레벨테스트 3단계 통과 후, 실전 대회를 향해 기록과 정확도를 다듬어 나가요.',
    items: ['실전 대회 코스 완주 훈련', '기록 단축 집중 트레이닝', '대회 매너·규정 교육', '클럽 대표팀 활동 기회'],
    featured: false,
  },
];

const CURRICULUM_PHASES = [
  { phase: 'PHASE 01 · 1~4주', color: '#16a34a', title: '긍정 인식과 자신감', desc: '허들·터널과 처음 친해지는 시간이에요. 칭찬과 보상으로 "어질리티는 즐겁다"는 느낌을 자연스럽게 익혀요.' },
  { phase: 'PHASE 02 · 5~8주', color: '#2563eb', title: '방향 전환과 호흡 맞추기', desc: '각도가 있는 코스로 방향 전환을 경험하고, 보호자의 신호를 따라가는 핸들링 기본기를 익혀요.' },
  { phase: 'PHASE 03 · 9~12주', color: '#d97706', title: '실전 코스 완주', desc: '초보 수준 어질리티 코스를 안정적으로 완주해요. 자기만의 속도로 자신 있게 마무리합니다.' },
];

type FormStep = 1 | 2 | 3;

export default function EducationContent() {
  const [activeSection, setActiveSection] = useState('agility');
  const [step, setStep] = useState<FormStep>(1);
  const [course, setCourse] = useState('');
  const [count, setCount] = useState('1명');
  const [note, setNote] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const tocRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = TOC_ITEMS.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validate1 = () => {
    const e: Record<string, string> = {};
    if (!course) e.course = '교육 과정을 선택해 주세요.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validate2 = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = '이름을 입력해 주세요.';
    if (!/^01[0-9]\d{7,8}$/.test(phone.replace(/-/g, ''))) e.phone = '올바른 전화번호를 입력해 주세요.';
    if (!region) e.region = '지역을 선택해 주세요.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validate1()) return;
    if (step === 2) {
      if (!validate2()) return;
      try {
        const apps = JSON.parse(localStorage.getItem('gwaa_applications') || '[]');
        apps.push({ at: new Date().toISOString(), type: 'education', course, count, note, ownerName: name, ownerPhone: phone, ownerRegion: region });
        localStorage.setItem('gwaa_applications', JSON.stringify(apps));
      } catch {}
    }
    setStep((s) => (s + 1) as FormStep);
  };

  const prevStep = () => setStep((s) => (s - 1) as FormStep);

  return (
    <>
      {/* Why Education */}
      <section style={{ padding: '64px 60px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 36 }}>
            <Eyebrow text="WHY EDUCATION" />
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(28px, 4vw, 44px)', color: '#111', letterSpacing: '0.02em', marginBottom: 12 }}>
              왜 우리 강아지에게 <span style={{ color: '#16a34a' }}>교육이 필요할까요?</span>
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, fontWeight: 300 }}>
              교육은 강아지를 통제하기 위한 게 아니에요. <strong>일상이 더 편안해지고, 함께가 더 즐거워지는 경험</strong>이에요.
            </p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, maxWidth: 1100, margin: '0 auto' }}>
            {WHY_CARDS.map((c, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i * 0.08}
                whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(0,0,0,0.1)', borderColor: '#16a34a' }}
                style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '28px 22px', textAlign: 'center', cursor: 'default' }}
              >
                <div style={{ fontSize: 42, marginBottom: 14 }}>{c.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 8 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, fontWeight: 300 }}>{c.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* TOC */}
      <nav ref={tocRef} style={{
        position: 'sticky', top: 0, zIndex: 80,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 60px', display: 'flex', gap: 0, overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {TOC_ITEMS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            style={{
              whiteSpace: 'nowrap',
              fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 10, letterSpacing: '0.1em',
              fontWeight: 700, color: activeSection === id ? '#16a34a' : '#9ca3af',
              padding: '14px 20px',
              background: 'none',
              borderTopWidth: 0, borderRightWidth: 0, borderLeftWidth: 0,
              borderBottomWidth: 2,
              borderBottomStyle: 'solid',
              borderBottomColor: activeSection === id ? '#16a34a' : 'transparent',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Agility Hero */}
      <section id="agility" style={{
        background: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 50%,#f0fdf4 100%)',
        padding: '88px 60px', position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(22,163,74,.10) 1px, transparent 1px)',
          backgroundSize: '28px 28px', pointerEvents: 'none',
        }} />
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', position: 'relative' }}>
            <motion.div variants={fadeUp}>
              <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 10, letterSpacing: '0.14em', color: '#16a34a', marginBottom: 12 }}>DOGSPORTS · AGILITY CLUB</div>
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(40px,5vw,64px)', color: '#111', lineHeight: 0.95, letterSpacing: '0.02em', marginBottom: 20 }}>
                반려견과 함께<br />달리는 <span style={{ color: '#16a34a' }}>클럽</span>
              </h2>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, fontWeight: 300, marginBottom: 32 }}>
                보호자와 반려견이 한 팀이 되어 허들·터널 같은 장애물을 함께 넘는 <strong style={{ color: '#16a34a' }}>독스포츠</strong>예요.{' '}
                <strong style={{ color: '#111' }}>100% 칭찬 위주 훈련</strong>으로, 처음이어도 부담 없이 시작할 수 있어요.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
                {['클럽형 월결제', '4단계 등급', '2개월 레벨테스트', '100% 긍정 강화'].map((t) => (
                  <span key={t} style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 10, letterSpacing: '0.08em', padding: '6px 14px', borderRadius: 9999, border: '1px solid rgba(22,163,74,0.3)', color: '#16a34a', background: 'rgba(255,255,255,0.6)' }}>{t}</span>
                ))}
              </div>
              <button onClick={() => scrollTo('apply')} style={{ padding: '12px 28px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>클럽 가입 신청 →</button>
            </motion.div>

            <motion.div variants={fadeUp} custom={0.1}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: '#e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                {[{ num: '4', label: 'GRADE LEVELS' }, { num: '2mo', label: 'LEVEL TEST' }, { num: '연 1~2', label: 'COMPETITIONS' }].map(({ num, label }) => (
                  <div key={label} style={{ background: '#fff', padding: '24px 20px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: '#16a34a', lineHeight: 1, marginBottom: 6 }}>{num}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", letterSpacing: '0.06em' }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
                <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 9, letterSpacing: '0.1em', color: '#16a34a', marginBottom: 12 }}>WHY AGILITY?</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {['💪 체력과 균형감이 좋아져요', '🤝 보호자와 더 가까워져요', '🧠 문제 행동이 줄어들어요', '⭐ 자신감이 자라요'].map((t) => (
                    <div key={t} style={{ fontSize: 12, color: '#6b7280', fontWeight: 300, lineHeight: 1.6, padding: 10, background: '#f8fafb', borderRadius: 8 }}>{t}</div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Grade System */}
      <section id="grades" style={{ padding: '88px 60px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 40 }}>
            <Eyebrow text="GRADE SYSTEM" />
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(28px,4vw,48px)', color: '#111', letterSpacing: '0.02em', marginBottom: 12 }}>4단계 등급 체계</h2>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, fontWeight: 300, maxWidth: 560 }}>처음부터 끝까지, 반려견의 속도에 맞춰 4단계로 천천히 성장해요. <strong>2개월마다 레벨테스트</strong>로 다음 단계에 도전할 수 있어요.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {GRADES.map((g, i) => (
              <motion.div
                key={g.num}
                variants={fadeUp}
                custom={i * 0.07}
                whileHover={{ y: -4, borderColor: '#16a34a' }}
                style={{
                  border: `1.5px solid ${g.featured ? '#16a34a' : '#e5e7eb'}`,
                  borderRadius: 12, padding: '28px 24px', position: 'relative',
                  background: g.featured ? '#f0fdf4' : '#fff',
                }}
              >
                {g.featured && (
                  <div style={{ position: 'absolute', top: -1, right: 16, fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 8, letterSpacing: '0.1em', background: '#16a34a', color: '#fff', padding: '4px 10px', borderRadius: '0 0 8px 8px' }}>POPULAR</div>
                )}
                <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 10, letterSpacing: '0.1em', color: '#9ca3af', marginBottom: 8 }}>{g.num}</div>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: '#111', marginBottom: 4 }}>{g.name}</div>
                <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 10, color: '#16a34a', letterSpacing: '0.1em', marginBottom: 14 }}>{g.en}</div>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, fontWeight: 300, marginBottom: 16 }}>{g.desc}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {g.items.map((item) => (
                    <li key={item} style={{ fontSize: 12, color: '#6b7280', paddingLeft: 14, position: 'relative', lineHeight: 1.5, fontWeight: 300 }}>
                      <span style={{ position: 'absolute', left: 0, color: '#16a34a', fontWeight: 700 }}>·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 12-Week Curriculum */}
      <section id="curriculum" style={{ padding: '88px 60px', background: '#f8fafb', borderBottom: '1px solid #e5e7eb' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 40 }}>
            <Eyebrow text="12-WEEK PROGRAM" />
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(28px,4vw,48px)', color: '#111', letterSpacing: '0.02em', marginBottom: 12 }}>취미반은 이렇게 진행돼요</h2>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, fontWeight: 300, maxWidth: 560 }}>주 1회, 3개월 과정. 긍정 인식부터 실전 코스 완주까지 천천히 함께 성장해요.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
            {CURRICULUM_PHASES.map((p, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i * 0.08}
                whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(0,0,0,0.1)' }}
                style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '28px 24px', textAlign: 'center' }}
              >
                <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 10, letterSpacing: '0.12em', color: p.color, marginBottom: 10 }}>{p.phase}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 10 }}>{p.title}</div>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, fontWeight: 300, margin: 0 }}>{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Instructor */}
      <section id="instructor" style={{ padding: '88px 60px', background: '#f8fafb', position: 'relative', overflow: 'hidden', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(22,163,74,.05) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 48 }}>
            <Eyebrow text="EXPERT INSTRUCTOR" />
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(28px,4vw,48px)', color: '#111', letterSpacing: '0.02em', marginBottom: 12 }}>전문 강사진</h2>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, fontWeight: 300, maxWidth: 560 }}>국제 대회에서 국가대표팀을 이끈 글로벌 스탠다드 코칭을 전수합니다.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 64, alignItems: 'start', position: 'relative' }}>
            <motion.div variants={fadeUp} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 20, padding: '32px 28px', textAlign: 'center' }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#f0fdf4', border: '2px solid rgba(22,163,74,0.3)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🏆</div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: '#111', marginBottom: 4 }}>염지혜</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16, fontWeight: 300 }}>WISE DOG SCHOOL 대표 / 헤드코치</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['KKC 1급 공인 훈련사', '어질리티 국가대표 (3년 연속)', '세계대회 팀 리더'].map((b) => (
                  <div key={b} style={{ fontSize: 11, padding: '7px 12px', borderRadius: 9999, background: '#f0fdf4', border: '1px solid rgba(22,163,74,0.3)', color: '#16a34a' }}>{b}</div>
                ))}
              </div>
            </motion.div>
            <motion.div variants={fadeUp} custom={0.1} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { tag: 'CREDENTIAL 01', title: '9년차 KKC 1급 공인 훈련사', items: ['WISE DOG SCHOOL 대표 / IGP 3 타이틀 보유', '한국애견협회 1급 훈련사 및 복종 심사위원', '오산대학교 & 건국대학교 동물 보건행동/훈련학 교수'] },
                { tag: 'CREDENTIAL 02', title: '어질리티 국가대표 (3년 연속)', items: ['IFCS: 2024~2026 WAC 어질리티 한국 국가대표', 'WUSV: 2024~2026 월드 챔피언십 한국 대표 선발전 출전', 'IGP 아시아 D-1 2등 수상'] },
                { tag: 'CREDENTIAL 03', title: '세계대회 대한민국 팀 리더', items: ['2024~2026 IFCS 어질리티 세계대회 팀 리더', '2024 WUSV IGP 부리더 역임'] },
              ].map((c) => (
                <div key={c.tag} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
                  <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 9, letterSpacing: '0.12em', color: '#16a34a', marginBottom: 8 }}>{c.tag}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 12 }}>{c.title}</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {c.items.map((item) => (
                      <li key={item} style={{ fontSize: 13, color: '#6b7280', fontWeight: 300, lineHeight: 1.5, paddingLeft: 16, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#16a34a', fontWeight: 700 }}>·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '88px 60px', background: '#f8fafb', borderBottom: '1px solid #e5e7eb' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 40 }}>
            <Eyebrow text="PRICING" />
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(28px,4vw,48px)', color: '#111', letterSpacing: '0.02em', marginBottom: 12 }}>수강료 안내</h2>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, fontWeight: 300, maxWidth: 560 }}>협회 메이트쉽 회원은 모든 교육 과정에서 할인 혜택을 받습니다.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900, margin: '0 auto' }}>
            {/* Monthly */}
            <motion.div variants={fadeUp} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 20, padding: '40px 36px', position: 'relative' }}>
              <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 11, color: '#9ca3af', letterSpacing: '0.08em', marginBottom: 12 }}>MONTHLY · 월 결제</div>
              <div style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'line-through', marginBottom: 4 }}>비회원 월 500,000원</div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 48, color: '#111', lineHeight: 1, marginBottom: 4 }}>300,000<span style={{ fontSize: 20, color: '#6b7280' }}>원/월</span></div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 24 }}>협회 메이트쉽 회원 전용 할인가</div>
              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {['반별 주간 정기 훈련 (평일·주말반)', '전문 훈련사 1:1 목표 설정', '매 수업 후 진도 기록 관리', '레벨테스트 참가 자격', '클럽 합동 훈련 참여'].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#6b7280', fontWeight: 300 }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, flexShrink: 0 }}>✓</span>{item}
                  </li>
                ))}
              </ul>
              <button onClick={() => scrollTo('apply')} style={{ display: 'block', width: '100%', padding: '11px 18px', borderRadius: 9999, border: '1.5px solid #16a34a', background: 'transparent', color: '#16a34a', fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>월 결제로 시작하기 →</button>
            </motion.div>
            {/* 6 Months */}
            <motion.div variants={fadeUp} custom={0.08} style={{ background: '#fff', border: '1.5px solid #16a34a', borderRadius: 20, padding: '40px 36px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#16a34a', color: '#fff', fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 10, letterSpacing: '0.1em', fontWeight: 700, padding: '5px 18px', borderRadius: 9999 }}>BEST VALUE</div>
              <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 11, color: '#9ca3af', letterSpacing: '0.08em', marginBottom: 12 }}>6MONTHS · 6개월 일시결제</div>
              <div style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'line-through', marginBottom: 4 }}>비회원 3,000,000원</div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 48, color: '#111', lineHeight: 1, marginBottom: 4 }}>1,620,000<span style={{ fontSize: 20, color: '#6b7280' }}>원</span></div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 24 }}>월 270,000원 수준 <span style={{ background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999, marginLeft: 4 }}>10% 추가 할인</span></div>
              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {['월 결제 혜택 전체 포함', '6개월 장기 등록 할인 10% 추가 적용', '협회 회원가 + 추가 할인 동시 적용', '스타터 키트 우선 제공', '수료 시 협회 공식 수료증 발급'].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#6b7280', fontWeight: 300 }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, flexShrink: 0 }}>✓</span>{item}
                  </li>
                ))}
              </ul>
              <button onClick={() => scrollTo('apply')} style={{ display: 'block', width: '100%', padding: '11px 18px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', textAlign: 'center' }}>6개월 등록으로 절약하기 →</button>
              <div style={{ background: '#f0fdf4', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 8, padding: '14px 16px', fontSize: 12, color: '#16a34a', lineHeight: 1.6, marginTop: 16 }}>
                💡 메이트쉽 비회원도 신청 가능합니다. 가입 후 즉시 회원가 적용.{' '}
                <Link href="/mateship" style={{ color: '#16a34a', textDecoration: 'underline' }}>가입하기 →</Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Completion Benefits */}
      <section style={{ padding: '88px 60px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 40 }}>
            <Eyebrow text="COMPLETION BENEFITS" />
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(28px,4vw,48px)', color: '#111', letterSpacing: '0.02em', marginBottom: 12 }}>수료하면 이런 게 따라와요</h2>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, fontWeight: 300, maxWidth: 560 }}>목표를 달성하면 협회 공식 수료증과 함께 다양한 활동 기회가 열려요.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, maxWidth: 1000, margin: '0 auto' }}>
            {[
              { icon: '🎖️', title: '공식 수료증', desc: '강원도반려동물협회의 공식 수료증을 발급해 드려요.' },
              { icon: '🏨', title: '제휴 업체 할인', desc: '반려동물 호텔·용품점에서 회원 할인을 받을 수 있어요.' },
              { icon: '📣', title: '협회 활동 우선권', desc: '세미나·특강·시범 행사 등 협회 활동에 먼저 초대돼요.' },
            ].map((b, i) => (
              <motion.div key={i} variants={fadeUp} custom={i * 0.07} whileHover={{ borderColor: '#16a34a' }} style={{ border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{b.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 6 }}>{b.title}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.6, fontWeight: 300 }}>{b.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* OB Obedience */}
      <section id="obedience" style={{ padding: '88px 60px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
            <motion.div variants={fadeUp}>
              <span style={{ display: 'inline-block', fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', padding: '5px 12px', borderRadius: 9999, marginBottom: 14, background: '#dbeafe', color: '#1e40af' }}>OBEDIENCE · OB 훈련</span>
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(28px,3.5vw,44px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1.1, marginBottom: 10 }}>오비디언스 — 교감 복종 훈련</h2>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, fontWeight: 300, marginBottom: 24 }}>보호자의 신호에 반려견이 침착하게 반응하도록 <strong>함께 호흡 맞추는</strong> 훈련이에요. 2인 1조 팀 운영으로 집중도를 높이고, 초급부터 대회 수준까지 천천히 성장해요.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { tag: '운영 방식', title: '2인 1조 팀 운영', items: ['팀당 총 1시간 30분 수업', '1두당 20분씩 2타임 진행', '휴식 및 피드백 포함'] },
                  { tag: '목표 인원', title: '20명 정예 구성', items: ['소규모 집중 관리', '훈련사 개별 목표 설정', '종목 간 교차 체험 가능'] },
                ].map((c) => (
                  <div key={c.tag} style={{ background: '#f8fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 10, letterSpacing: '0.1em', color: '#2563eb', marginBottom: 8 }}>{c.tag}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 12 }}>{c.title}</div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {c.items.map((item) => (
                        <li key={item} style={{ fontSize: 13, color: '#6b7280', fontWeight: 300, lineHeight: 1.5, paddingLeft: 14, position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 0, color: '#2563eb', fontWeight: 700 }}>·</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
                {[{ name: '초급', target: '기초 복종 (앉아·기다려·이리와)' }, { name: '중급', target: '사회성 단계 (SD)' }, { name: '고급', target: '정밀 복종 (FD)' }, { name: '대회반', target: '대회 출전 (CD·BH)' }].map((l) => (
                  <div key={l.name} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 4 }}>{l.name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 300, lineHeight: 1.4 }}>{l.target}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => scrollTo('apply')} style={{ padding: '10px 24px', borderRadius: 9999, background: '#2563eb', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 2px 12px rgba(37,99,235,.3)' }}>OB 훈련 신청하기 →</button>
            </motion.div>
            <motion.div variants={fadeUp} custom={0.1} style={{ background: '#f8fafb', borderRadius: 20, padding: 32, border: '1px solid #e5e7eb' }}>
              <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 10, letterSpacing: '0.1em', color: '#2563eb', marginBottom: 16 }}>OB CURRICULUM</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {['기초 복종훈련 — 앉아, 엎드려, 기다려, 이리와', '고급 오비디언스 — 복합 명령, 원거리 제어 훈련', '사회화 훈련 — 사람·동물과의 상호작용', '문제 행동 교정 — 짖음, 분리불안, 공격성 개선', '클럽 합동 훈련 — 사회성 및 경쟁 심리 자극'].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#6b7280', fontWeight: 300, lineHeight: 1.55 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', flexShrink: 0, marginTop: 6, display: 'block' }} />
                    {item}
                  </li>
                ))}
              </ul>
              <div style={{ padding: 20, background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#111', marginBottom: 8 }}>운영 일정</div>
                <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 300, lineHeight: 1.8 }}>
                  평일반 — 오후 5시 이후<br />
                  주말반 — 점심 시간대 전후<br />
                  기본 회차 — 월 4회 기준<br />
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>* 수강생 희망 시 어질리티 교차 체험 가능</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* License */}
      <section id="license" style={{ padding: '88px 60px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)',
            border: '1.5px solid #e5e7eb', borderRadius: 20, padding: '52px 56px',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -60, right: 60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(22,163,74,.10)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 10, letterSpacing: '0.14em', color: '#16a34a', marginBottom: 14 }}>NATIONAL LICENSE</div>
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(36px,4vw,52px)', color: '#111', lineHeight: 1, letterSpacing: '0.02em', marginBottom: 16 }}>
                반려동물행동지도사<br /><span style={{ color: '#16a34a' }}>국가자격증</span>
              </h2>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, fontWeight: 300, marginBottom: 28 }}>국가 공인 반려동물행동지도사 자격증 취득을 목표로 체계적인 준비 과정을 제공합니다. 협회 교육 이수 후 자격증 취득까지 함께 지원합니다.</p>
              <button onClick={() => scrollTo('apply')} style={{ padding: '13px 28px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>자격증 과정 신청 →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { num: '01', title: '이론 교육', desc: '동물행동학, 훈련 이론, 동물복지 등 필기 시험 준비' },
                { num: '02', title: '실기 교육', desc: '실제 반려견 대상 실습 훈련 및 핸들링 기술 연습' },
                { num: '03', title: '시험 준비', desc: '모의고사 및 실기 점검, 취약 부분 집중 보완' },
                { num: '04', title: '자격증 취득', desc: '시험 접수부터 합격까지 협회가 함께 지원합니다' },
              ].map((s) => (
                <div key={s.num} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0fdf4', border: '1px solid rgba(22,163,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 11, color: '#16a34a', flexShrink: 0 }}>{s.num}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 3 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5, fontWeight: 300 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Etiquette */}
      <section id="etiquette" style={{ padding: '88px 60px', background: '#f8fafb', borderBottom: '1px solid #e5e7eb' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start', direction: 'rtl' }}>
            <motion.div variants={fadeUp} style={{ direction: 'ltr' }}>
              <span style={{ display: 'inline-block', fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', padding: '5px 12px', borderRadius: 9999, marginBottom: 14, background: '#fef9c3', color: '#854d0e' }}>ETIQUETTE</span>
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(28px,3.5vw,44px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1.1, marginBottom: 10 }}>반려동물 에티켓 교육</h2>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, fontWeight: 300, marginBottom: 24 }}>반려동물과 함께하는 공공장소 예절과 올바른 반려문화를 교육합니다. 보호자와 반려동물 모두를 위한 사회화 교육입니다.</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {['공공장소 에티켓 — 산책, 카페, 호텔, 교통수단', '사회화 훈련 — 낯선 환경, 사람, 다른 동물과의 적응', '올바른 반려문화 — 보호자 의무와 책임', '보호자 교육 — 반려동물 심리 이해, 스트레스 관리'].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#6b7280', fontWeight: 300, lineHeight: 1.55 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706', flexShrink: 0, marginTop: 6, display: 'block' }} />
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => scrollTo('apply')} style={{ padding: '10px 24px', borderRadius: 9999, background: '#d97706', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 2px 12px rgba(217,119,6,.3)' }}>이 과정 신청하기 →</button>
            </motion.div>
            <motion.div variants={fadeUp} custom={0.1} style={{ direction: 'ltr', borderRadius: 20, overflow: 'hidden', height: 320, background: 'linear-gradient(135deg,#fef9c3,#fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <span style={{ fontSize: 64, opacity: 0.5 }}>🌟</span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Apply Section */}
      <section id="apply" style={{ padding: '88px 60px', background: '#f8fafb', borderBottom: '1px solid #e5e7eb' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 48 }}>
            <Eyebrow text="HOW TO APPLY" />
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(28px,4vw,48px)', color: '#111', letterSpacing: '0.02em', marginBottom: 12 }}>교육 신청</h2>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, fontWeight: 300, maxWidth: 560 }}>원하는 교육 과정을 선택하고 신청하시면 담당자가 빠르게 안내해 드립니다.</p>
          </motion.div>

          {/* Multi-step Form */}
          <motion.div variants={fadeUp} style={{ maxWidth: 560, margin: '0 auto 48px' }}>
            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              {[1, 2, 3].map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 12, fontWeight: 700, flexShrink: 0, background: step >= s ? '#16a34a' : '#e5e7eb', color: step >= s ? '#fff' : '#9ca3af', transition: 'all 0.3s' }}>{s}</div>
                  {i < 2 && <div style={{ flex: 1, height: 2, background: step > s ? '#16a34a' : '#e5e7eb', transition: 'background 0.3s', margin: '0 4px' }} />}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontSize: 11, fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", letterSpacing: '0.05em' }}>
              {['과정 선택', '신청자 정보', '완료'].map((l, i) => (
                <span key={l} style={{ color: step === i + 1 ? '#16a34a' : '#9ca3af' }}>{l}</span>
              ))}
            </div>

            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 20, padding: '36px 40px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 20 }}>어떤 교육을 신청하시겠어요?</h3>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>교육 과정 <span style={{ color: '#16a34a' }}>*</span></label>
                      <select value={course} onChange={(e) => setCourse(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.course ? '#ef4444' : '#e5e7eb'}`, borderRadius: 10, fontSize: 14, color: '#111', background: '#fff', outline: 'none' }}>
                        <option value="">선택하세요</option>
                        <optgroup label="독스포츠 — 어질리티">
                          <option value="ag-a">어질리티 A등급 (입문)</option>
                          <option value="ag-b">어질리티 B등급 (초급)</option>
                          <option value="ag-c">어질리티 C등급 (중급)</option>
                          <option value="ag-d">어질리티 D등급 (고급)</option>
                        </optgroup>
                        <optgroup label="오비디언스">
                          <option value="ob-basic">OB 기초 과정</option>
                          <option value="ob-adv">OB 고급 과정</option>
                        </optgroup>
                        <option value="license">반려동물행동지도사 국가자격증</option>
                        <option value="etiquette">반려동물 에티켓 교육</option>
                      </select>
                      {errors.course && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.course}</p>}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>신청 인원</label>
                      <select value={count} onChange={(e) => setCount(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#111', background: '#fff', outline: 'none' }}>
                        <option>1명</option><option>2명</option><option>3명 이상</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>문의 사항 (선택)</label>
                      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="교육 일정, 비용, 반려동물 상태 등 궁금한 점을 적어주세요." style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#111', resize: 'vertical', minHeight: 80, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <button onClick={nextStep} style={{ width: '100%', padding: '12px 18px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>다음 단계 →</button>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 20 }}>신청자 정보를 입력해 주세요</h3>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>이름 <span style={{ color: '#16a34a' }}>*</span></label>
                      <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="홍길동" style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.name ? '#ef4444' : '#e5e7eb'}`, borderRadius: 10, fontSize: 14, color: '#111', outline: 'none', boxSizing: 'border-box' }} />
                      {errors.name && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.name}</p>}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>연락처 <span style={{ color: '#16a34a' }}>*</span></label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="010-0000-0000" style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.phone ? '#ef4444' : '#e5e7eb'}`, borderRadius: 10, fontSize: 14, color: '#111', outline: 'none', boxSizing: 'border-box' }} />
                      {errors.phone && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.phone}</p>}
                    </div>
                    <div style={{ marginBottom: 24 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>거주 지역 <span style={{ color: '#16a34a' }}>*</span></label>
                      <select value={region} onChange={(e) => setRegion(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${errors.region ? '#ef4444' : '#e5e7eb'}`, borderRadius: 10, fontSize: 14, color: '#111', background: '#fff', outline: 'none' }}>
                        <option value="">선택하세요</option>
                        {['춘천', '원주', '강릉', '동해', '속초', '홍천', '평창', '인제', '양양', '강원도 기타', '강원도 외 지역'].map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                      {errors.region && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.region}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={prevStep} style={{ flex: 1, padding: '12px 18px', borderRadius: 9999, border: '1.5px solid #e5e7eb', background: 'transparent', color: '#6b7280', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>← 이전</button>
                      <button onClick={nextStep} style={{ flex: 2, padding: '12px 18px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>신청 완료 →</button>
                    </div>
                  </motion.div>
                )}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} style={{ textAlign: 'center', padding: '12px 0 8px' }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 300 }} style={{ width: 64, height: 64, borderRadius: '50%', background: '#16a34a', color: '#fff', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>✓</motion.div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 8 }}>신청이 접수되었습니다!</h3>
                    <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 28 }}>카카오채널로 이동하시면 담당자가<br />상세 일정과 비용을 안내해 드립니다.</p>
                    <a href="https://pf.kakao.com/_wipZX" target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '13px 18px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>카카오채널로 이동하기 →</a>
                    <div style={{ background: '#f0fdf4', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 8, padding: '14px 16px', fontSize: 12, color: '#16a34a', lineHeight: 1.6, marginTop: 16 }}>
                      💡 메이트쉽 회원은 모든 교육 과정 할인 적용.{' '}
                      <Link href="/mateship" style={{ color: '#16a34a', textDecoration: 'underline' }}>가입하기 →</Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Contact Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900, margin: '0 auto' }}>
            {[
              { icon: '💬', title: '카카오채널로 신청', desc: '가장 빠른 방법. 카카오채널에서 원하는 교육 과정을 말씀해 주시면 담당자가 일정을 안내드립니다.', href: 'https://pf.kakao.com/_wipZX', label: '카카오로 신청하기 →', primary: true },
              { icon: '📞', title: '전화 신청', desc: '교육 과정 상세 내용, 일정, 비용 등을 전화로 자세히 안내해 드립니다.', href: 'tel:033-813-0333', label: '033-813-0333 전화하기', primary: false },
            ].map((c) => (
              <motion.div key={c.title} variants={fadeUp} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '32px 28px' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{c.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 8 }}>{c.title}</div>
                <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.7, fontWeight: 300, marginBottom: 20 }}>{c.desc}</p>
                <a href={c.href} target={c.primary ? '_blank' : undefined} rel={c.primary ? 'noopener noreferrer' : undefined}
                  style={{ display: 'inline-flex', padding: '10px 20px', borderRadius: 9999, background: c.primary ? '#16a34a' : 'transparent', color: c.primary ? '#fff' : '#16a34a', fontSize: 12, fontWeight: 700, textDecoration: 'none', border: `1.5px solid ${c.primary ? '#16a34a' : '#16a34a'}` }}>
                  {c.label}
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </>
  );
}
