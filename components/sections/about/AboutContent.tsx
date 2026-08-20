'use client';

import { motion } from 'framer-motion';
import CountUp from '@/components/shared/CountUp';
import Eyebrow from '@/components/ui/Eyebrow';
import { staggerContainer, fadeUp } from '@/lib/animations';
import { useIsMobile } from '@/hooks/useIsMobile';

const HISTORY: {
  year: number;
  events: { month: string; title: string; loc: string; ppl?: string; tag: string; tagColor: string; desc: string }[];
}[] = [
  {
    year: 2026,
    events: [
      { month: '', title: '제1회 청주시 반려동물 문화행사 — 학교종이댕댕댕', loc: '청주', tag: '문화행사', tagColor: '#16a34a', desc: '청주시에서 처음 열린 반려동물 문화행사. 학교를 콘셉트로 한 체험형 프로그램으로, 반려동물과 보호자가 함께 배우고 참여했다. 강원도를 넘어 충청권으로 확장된 GWAA의 첫 발걸음이다.' },
      { month: '06월', title: '원주시 반려견 산책교육 — 햅삐 산책크루 3기', loc: '원주', tag: '교육', tagColor: '#2563eb', desc: '2025년 1·2기에 이어 세 번째로 이어진 원주시 공식 반려견 산책 교육 프로그램. 문제행동이 있는 반려견과 보호자가 함께 성장하는 6주 과정.' },
    ],
  },
  {
    year: 2025,
    events: [
      { month: '10월', title: '제3회 강릉시반려동물문화축제 — 올림펫', loc: '강릉', ppl: '3,500+', tag: '문화축제', tagColor: '#16a34a', desc: '강릉이 세 번째로 품은 반려동물 문화의 장. 올림픽의 도시 강릉에서 반려동물과 사람이 함께하는 이 도시의 비전을 다시 확인했다.' },
      { month: '06월', title: '2025 활짝펫', loc: '가평', ppl: '5,000+', tag: '문화축제', tagColor: '#16a34a', desc: '꽃이 피듯 웃음도 핀다. 가평에서 열린 반려동물 문화행사에 5,000여 명이 모였다.' },
      { month: '05~11월', title: '원주시 반려견 산책교육 — 햅삐 산책크루 1기·2기', loc: '원주', tag: '교육', tagColor: '#2563eb', desc: '원주시와 함께한 반려견 동반 산책 실습 교육. 1기·2기에 걸쳐 문제행동이 있는 반려견과 보호자가 매주 일요일 함께 걸으며 올바른 산책법을 익혔다.' },
      { month: '10~12월', title: '가평군 유기견 사회화 교육 및 입양홍보 사업', loc: '가평', tag: '사회공헌', tagColor: '#dc2626', desc: '가평군 유기동물보호소와 협력하여 유기견의 사회화 훈련을 지원하고 올바른 입양 문화를 안내했다. 구매가 아닌 입양으로 가족을 만나는 문화를 위한 GWAA의 사회공헌 프로그램.' },
      { month: '10월', title: 'Mission Dog Trekking 2025', loc: '고성', ppl: '300+', tag: '트레킹', tagColor: '#0891b2', desc: '고성 자연 속에서 반려견과 함께 걷는 트레킹 프로그램. 자연과 반려동물, 사람이 하나 되는 시간.' },
      { month: '08월', title: 'Beach Yoga 2025 고성', loc: '고성', tag: '힐링', tagColor: '#0891b2', desc: '고성 해변에서 반려동물과 함께하는 요가 & 힐링 프로그램. 20일간 반려동물과 보호자 모두를 위한 휴식의 자리.' },
    ],
  },
  {
    year: 2024,
    events: [
      { month: '12월', title: '공존거리 0cm — Small Forum for Pets', loc: '원주', tag: '포럼', tagColor: '#7c3aed', desc: '수의사·훈련사·시민이 한 공간에서 반려동물 공존을 논하다. 강연이 아닌 대화, 거리를 지운 열린 포럼.' },
      { month: '10월', title: '제2회 원주시 반려동물문화행사 — 펫밀리', loc: '원주', ppl: '5,000', tag: '문화축제', tagColor: '#16a34a', desc: '원주 중앙공원에서 가족과 같은 반려동물, 그 가족 모두가 함께한 하루. 역대 최대 규모.' },
      { month: '10월', title: '제2회 강릉시반려동물문화축제 — 올림펫', loc: '강릉', ppl: '3,500', tag: '문화축제', tagColor: '#16a34a', desc: '강릉이 두 번째로 품은 반려동물 문화의 장. 더 넓어진 공간, 더 다양해진 프로그램으로 돌아온 올림펫 2024.' },
      { month: '10월', title: '삼척해안 반려견 트레킹 & 페스타', loc: '삼척', ppl: '2,000', tag: '트레킹', tagColor: '#0891b2', desc: '삼척의 수려한 해안선을 반려견과 함께 걷다. 2회에 걸쳐 2,000명이 강원도 자연을 새롭게 경험했다.' },
      { month: '05~10월', title: '원주시 반려견 이동식 운동장 (8회)', loc: '원주', ppl: '2,190', tag: '캠페인', tagColor: '#d97706', desc: '고정된 공간 없이 직접 찾아가는 이동형 반려견 운동장. 원주 8개 장소에서 총 2,190명이 이용했다.' },
      { month: '05~10월', title: '원주시 반려가족을 위한 맞춤교육 (8회)', loc: '원주', tag: '교육', tagColor: '#2563eb', desc: '이동식 운동장과 연계하여 연 8회 진행된 반려가족 맞춤 교육. 기본예절·문제행동·올바른 돌봄을 현장에서 바로 배우는 생활밀착형 프로그램.' },
      { month: '06월', title: '댕댕플로깅 인식개선 캠페인', loc: '강원도', tag: '캠페인', tagColor: '#d97706', desc: '반려견 산책을 환경 미화와 결합한 인식개선 캠페인. 산책이 지구를 바꾼다는 작은 실천의 기록.' },
      { month: '04월', title: '제3회 강원도반려동물문화축제 — 강릉', loc: '강릉', tag: '문화축제', tagColor: '#16a34a', desc: '강릉에서 열린 GWAA 세 번째 문화축제. 도를 넘어 도시가 반려동물 문화의 무대가 됐다.' },
      { month: '04월', title: '제4회 강원도반려동물협회 문화축제 — 원주', loc: '원주', tag: '문화축제', tagColor: '#16a34a', desc: '해를 거듭하며 성장해온 GWAA 문화축제의 네 번째. 원주 시민들과 함께 새로운 반려동물 문화를 만들었다.' },
    ],
  },
  {
    year: 2023,
    events: [
      { month: '10월', title: '제1회 강릉시반려동물문화축제 — 올림펫', loc: '강릉', ppl: '3,000', tag: '문화축제', tagColor: '#16a34a', desc: '올림픽의 도시 강릉에서 처음으로 열린 반려동물 문화 축제. 강릉이 반려동물과 보호자 모두를 위한 생활문화 공간으로 진화하는 첫 걸음.' },
      { month: '06월', title: '반려동물 재난위기 대비 가이드북 배포', loc: '전국', tag: '출판', tagColor: '#6b7280', desc: '반려동물과 보호자가 재난 상황에서 함께 살아남는 방법. GWAA가 직접 제작·배포한 실용 가이드.' },
      { month: '06월', title: '반려동물 취창업 특강', loc: '원주', tag: '교육', tagColor: '#2563eb', desc: '강원도 반려동물 산업 취창업 희망자를 대상으로 한 특강. 지역 반려동물 산업의 성장을 지원하는 GWAA의 교육 사업.' },
      { month: '05월', title: '강릉 반려동물 재난구호 키트 기부', loc: '강릉', tag: '사회공헌', tagColor: '#dc2626', desc: '강릉 지역에 반려동물 재난구호키트와 위치추적 인식표를 기부. 강릉시와 MOU 체결 후 동물사랑센터 현장 전달. 재난 상황에서도 반려동물을 지키기 위한 GWAA의 손길.' },
      { month: '03~05월', title: '댕댕플로깅 유니브 서포터즈 1기', loc: '원주', tag: '캠페인', tagColor: '#d97706', desc: '상지대·한라대 학생들과 함께한 3개월간의 플로깅 캠페인. 대학과 협력한 첫 시민 참여형 인식개선 프로젝트.' },
      { month: '01월', title: '인제에코페스티벌 반려동물사진전', loc: '인제', tag: '전시', tagColor: '#6b7280', desc: '인제에코페스티벌 내 반려동물 사진전 기획·운영. 강원도 생태 가치와 반려동물 문화를 하나의 시선으로 담아낸 전시.' },
    ],
  },
  {
    year: 2022,
    events: [
      { month: '11월', title: '전국댕댕자랑 반려동물 사진공모전', loc: '원주/온라인', ppl: '1,340', tag: '공모전', tagColor: '#6b7280', desc: '전국 1,340개의 반려동물 사진이 모인 공모전. 사랑하는 존재를 카메라에 담고 싶은 보호자들의 마음이 모였다.' },
      { month: '05~09월', title: '펫티켓 플로깅 캠페인', loc: '원주', tag: '캠페인', tagColor: '#d97706', desc: '한국승강기안전공단과 함께한 반려동물 예절 + 환경정화 캠페인. 매달 원주 시내를 함께 걸으며 펫티켓 문화를 심었다.' },
      { month: '06월', title: '펫타로 무료체험 행사', loc: '원주', tag: '체험', tagColor: '#6b7280', desc: '반려동물의 마음을 들여다보는 펫타로 무료 체험 행사. 보호자와 반려동물의 소통을 색다른 방식으로 연결했다.' },
      { month: '04월', title: '펫푸드 원데이클래스', loc: '원주', tag: '교육', tagColor: '#2563eb', desc: '반려동물을 위한 수제 먹거리를 직접 만들어보는 첫 교육 클래스. 협회의 첫 정기 소모임 프로그램.' },
    ],
  },
  {
    year: 2021,
    events: [
      { month: '11월', title: '제1회 강원도반려동물문화축제', loc: '원주', ppl: '1,500', tag: '창립 행사', tagColor: '#16a34a', desc: '강원도반려동물협회가 처음으로 주최한 반려동물 문화 축제. 강원도에 반려동물 문화의 첫 씨앗을 심은 날. 1,500여 명이 함께했다.' },
    ],
  },
];

const VALUES = [
  { label: '설립 목적', text: '반려동물과 사람이 함께 행복한 강원도 문화 조성' },
  { label: '핵심 가치', text: '교육 · 나눔 · 연결 · 성장' },
  { label: '활동 지역', text: '강원특별자치도 전역 (18개 시군)' },
  { label: '운영 규모', text: '2021년 창립 이후 누적 4만명+ 참여' },
];

const ACTIVITIES = [
  { icon: '🎪', title: '행사 기획 · 운영', desc: '강원도 전역에서 트레킹, 캠핑, 문화축제 등 반려동물 행사를 직접 기획하고 운영합니다. 2021년부터 4만 명 이상이 함께했습니다.', href: '/events', color: '#16a34a' },
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
              fontFamily: "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif",
              fontSize: isMobile ? 32 : 'clamp(28px, 4vw, 48px)',
              color: '#111', letterSpacing: '0.02em', lineHeight: 1.1,
              marginBottom: 20,
            }}>
              &ldquo;문화가 바뀌어야<br />반려생활이 달라집니다&rdquo;
            </blockquote>
            <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, fontWeight: 400 }}>
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
                <div style={{ fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", fontSize: 11, color: '#16a34a', letterSpacing: '0.06em', marginBottom: 8 }}>
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
            <h2 style={{ fontFamily: "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif", fontSize: isMobile ? 32 : 'clamp(26px,5.5vw,52px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1 }}>
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
                    fontFamily: "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif",
                    fontSize: isMobile ? 17 : 22,
                    color: '#111', letterSpacing: '0.02em',
                    marginBottom: isMobile ? 6 : 10, lineHeight: 1.15,
                  }}>
                    {item.title}
                  </h3>
                  {!isMobile && (
                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, fontWeight: 400, marginBottom: 16 }}>
                      {item.desc}
                    </p>
                  )}
                  <div style={{ marginTop: isMobile ? 8 : 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>자세히 →</span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </section>

      {/* History Timeline */}
      <section id="history" style={{ padding: `${py} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 64 }}>
            <Eyebrow text="HISTORY" />
            <h2 style={{ fontFamily: "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif", fontSize: isMobile ? 32 : 'clamp(26px,5.5vw,52px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1 }}>
              협회 연혁
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6, marginTop: 12, fontWeight: 400 }}>
              2021년 창립 이후 강원도 반려동물 문화를 만들어온 기록
            </p>
          </motion.div>

          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            {HISTORY.map((yearGroup, yi) => (
              <motion.div
                key={yearGroup.year}
                variants={fadeUp}
                custom={yi * 0.06}
                style={{ marginBottom: isMobile ? 40 : 56 }}
              >
                {/* Year header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  marginBottom: isMobile ? 16 : 24,
                }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif",
                    fontSize: isMobile ? 28 : 36,
                    color: '#16a34a',
                    letterSpacing: '0.02em',
                    lineHeight: 1,
                    flexShrink: 0,
                  }}>{yearGroup.year}</div>
                  <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                </div>

                {/* Events list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12 }}>
                  {yearGroup.events.map((ev, ei) => (
                    <div
                      key={ei}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '80px 1fr',
                        gap: isMobile ? 6 : 20,
                        background: '#f8fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: 12,
                        padding: isMobile ? '14px 16px' : '18px 24px',
                        alignItems: 'start',
                      }}
                    >
                      {/* Month */}
                      <div style={{
                        fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif",
                        fontSize: 11,
                        color: '#9ca3af',
                        letterSpacing: '0.06em',
                        paddingTop: isMobile ? 0 : 2,
                        fontWeight: 400,
                      }}>{ev.month}</div>

                      {/* Content */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                          <span style={{
                            display: 'inline-block',
                            fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif",
                            fontSize: 10,
                            letterSpacing: '0.06em',
                            color: ev.tagColor,
                            background: `${ev.tagColor}12`,
                            border: `1px solid ${ev.tagColor}30`,
                            padding: '2px 8px',
                            borderRadius: 9999,
                            fontWeight: 600,
                          }}>{ev.tag}</span>
                          {ev.ppl && (
                            <span style={{
                              fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif",
                              fontSize: 10,
                              color: '#6b7280',
                              letterSpacing: '0.04em',
                            }}>{ev.ppl}명 참여</span>
                          )}
                          <span style={{
                            fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif",
                            fontSize: 10,
                            color: '#9ca3af',
                            letterSpacing: '0.04em',
                          }}>📍 {ev.loc}</span>
                        </div>
                        <div style={{
                          fontSize: isMobile ? 14 : 15,
                          fontWeight: 600,
                          color: '#111',
                          lineHeight: 1.4,
                          marginBottom: 5,
                          wordBreak: 'keep-all',
                        }}>{ev.title}</div>
                        {!isMobile && (
                          <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, fontWeight: 400, wordBreak: 'keep-all' }}>
                            {ev.desc}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
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
            { val: 5,     suf: '년+', label: '운영 연혁' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              custom={i * 0.06}
              style={{ padding: `${isMobile ? '28px' : '40px'} 0`, borderRight: i < 2 ? '1px solid #e5e7eb' : 'none' }}
            >
              <div style={{ fontFamily: "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif", fontSize: isMobile ? 'clamp(28px,8vw,40px)' : 'clamp(36px, 5vw, 56px)', color: '#16a34a', lineHeight: 1, marginBottom: 8 }}>
                <CountUp value={s.val} suffix={s.suf} />
              </div>
              <div style={{ fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", fontSize: 12, color: '#6b7280', letterSpacing: '0.02em' }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
}
