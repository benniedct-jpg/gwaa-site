'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useGWAADB } from '@/hooks/useGWAADB';
import { TravelPlace } from '@/types';
import Eyebrow from '@/components/ui/Eyebrow';
import { fadeUp, staggerContainer } from '@/lib/animations';

const MONO  = "'SF Mono','Menlo','Monaco','Consolas','Courier New',monospace";
const BEBAS = "'Bebas Neue', cursive";

// ── 카테고리 ──
const CATEGORIES = [
  { key: '전체',    icon: '🗺️' },
  { key: '카페',    icon: '☕' },
  { key: '식당',    icon: '🍖' },
  { key: '호텔',    icon: '🏨' },
  { key: '캠핑',    icon: '⛺' },
  { key: '공원',    icon: '🌿' },
  { key: '트레킹',  icon: '🥾' },
  { key: '체험',    icon: '🎡' },
  { key: '레일바이크', icon: '🚂' },
];

// ── 지역 ──
const REGIONS = ['전체','춘천','원주','강릉','속초','양양','고성','평창','홍천','인제','삼척','정선','영월'];

const REGION_COLOR: Record<string, string> = {
  춘천: '#3b82f6', 원주: '#f59e0b', 강릉: '#06b6d4', 속초: '#10b981',
  양양: '#ec4899', 고성: '#22c55e', 평창: '#64748b', 홍천: '#84cc16',
  인제: '#8b5cf6', 삼척: '#3b82f6', 정선: '#eab308', 영월: '#f97316',
};

// ── 추천 코스 ──
const COURSES = [
  {
    id: 'gangneung',
    title: '강릉 1박2일',
    subtitle: '트레킹 + 경포 호캉스',
    duration: '1박2일', theme: '액티브', distance: '약 80km',
    tags: ['트레킹', '5성급 호텔', '해변', '반려견 식당'],
    cover: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    color: '#06b6d4',
    days: [
      {
        label: 'DAY 1',
        stops: [
          { time: '09:00', place: '바우길 선자령 코스', icon: '🥾', tip: '해발 1,157m, 평탄한 능선길. 이른 아침 출발 추천 (주차 무료).' },
          { time: '13:00', place: '그릴웍스', icon: '🍖', tip: '전 견종 실내 동반 가능한 정통 텍사스 바베큐 레스토랑.' },
          { time: '15:00', place: '체크이스트 카페', icon: '☕', tip: '사천해변 뷰, 감성 인테리어. 반려견 전용 간식 판매.' },
          { time: '17:00', place: '세인트존스호텔 체크인', icon: '🏨', tip: '경포해변 5성급. 체중 제한 없음, 반려견 전용 어메니티 제공.' },
        ],
      },
      {
        label: 'DAY 2',
        stops: [
          { time: '07:30', place: '경포해변 일출 산책', icon: '🌊', tip: '이른 아침 고요한 해변. 비성수기엔 목줄 완화 구역 있음.' },
          { time: '10:00', place: '강릉 중앙시장 구경', icon: '🛒', tip: '반려견 동반으로 시장 외곽 둘러보기.' },
          { time: '12:00', place: '귀가', icon: '🚗', tip: '서울까지 약 2시간 30분.' },
        ],
      },
    ],
  },
  {
    id: 'sokcho-yangyang',
    title: '속초·양양 당일치기',
    subtitle: '영랑호 산책 + 해변 + 서핑 마을',
    duration: '당일', theme: '힐링', distance: '약 60km',
    tags: ['해변', '공원', '반려견 놀이터', '서핑 마을'],
    cover: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&q=80',
    color: '#10b981',
    days: [
      {
        label: '코스',
        stops: [
          { time: '09:00', place: '영랑호 반려견 놀이터', icon: '🐾', tip: '소·대형 분리 운동장, 어질리티 시설. 무료 주차.' },
          { time: '11:00', place: '설악해맞이공원', icon: '🌊', tip: '모래사장에서 자유롭게 뛰어놀기. 비성수기 비교적 한적.' },
          { time: '13:00', place: '청초호 수변공원', icon: '🍱', tip: '도시락 피크닉 또는 근처 반려견 동반 식당 이용.' },
          { time: '15:00', place: '인구해변 (양양)', icon: '🏄', tip: '서퍼와 강아지가 공존하는 이국적 분위기. 주변 반려견 카페 다수.' },
          { time: '17:00', place: '귀가', icon: '🚗', tip: '서울까지 약 2시간 30분 (고속도로).' },
        ],
      },
    ],
  },
  {
    id: 'chuncheon',
    title: '춘천 당일치기',
    subtitle: '강아지숲 + 소양강 + 레일바이크',
    duration: '당일', theme: '체험', distance: '약 40km',
    tags: ['테마파크', '레일바이크', '산책'],
    cover: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
    color: '#3b82f6',
    days: [
      {
        label: '코스',
        stops: [
          { time: '10:00', place: '강아지숲 테마파크', icon: '🌲', tip: '3만 평 자연 숲. 리드줄 없는 대·소형 운동장, 노즈워크 산책로, 수영장. 월 휴무.' },
          { time: '13:30', place: '근처 레스토랑 점심', icon: '🍽️', tip: '강아지숲 주변 반려견 동반 카페 및 레스토랑 이용.' },
          { time: '15:00', place: '경강레일바이크 (강촌)', icon: '🚂', tip: '펫바이크 운영 (10kg 이하, 2마리). 북한강 철교 위 7.2km 코스.' },
          { time: '17:00', place: '소양강댐 산책', icon: '🌊', tip: '댐 주변 공원에서 여유로운 마무리 산책.' },
          { time: '18:30', place: '귀가', icon: '🚗', tip: '서울까지 약 1시간 30분.' },
        ],
      },
    ],
  },
  {
    id: 'pyeongchang',
    title: '대관령·평창 1박2일',
    subtitle: '하늘목장 + 눈·별 리조트 힐링',
    duration: '1박2일', theme: '힐링', distance: '약 120km',
    tags: ['목장체험', '리조트', '설원', '별 관측'],
    cover: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    color: '#64748b',
    days: [
      {
        label: 'DAY 1',
        stops: [
          { time: '10:00', place: '하늘목장', icon: '🐄', tip: '해발 1,000m 목장. 반려견 목줄 필수, 넓은 초원 산책. 입장료 有.' },
          { time: '13:00', place: '대관령 주변 점심', icon: '🍽️', tip: '대관령면 반려견 동반 식당.' },
          { time: '15:00', place: '휘닉스파크 체크인', icon: '🏔️', tip: '펫 전용 객실 운영. 애견하우스·배변패드 등 어메니티 제공.' },
          { time: '저녁', place: '리조트 내 별 관측', icon: '⭐', tip: '대관령 청정 하늘에서 반려견과 함께 별 감상.' },
        ],
      },
      {
        label: 'DAY 2',
        stops: [
          { time: '09:00', place: '리조트 주변 산책', icon: '🥾', tip: '고원 청정 공기 속 반려견과 모닝 산책.' },
          { time: '11:00', place: '이효석문화마을', icon: '🌿', tip: '메밀꽃밭 주변 산책 (계절 따라 다름).' },
          { time: '13:00', place: '귀가', icon: '🚗', tip: '서울까지 약 2시간.' },
        ],
      },
    ],
  },
  {
    id: 'east-coast',
    title: '동해안 그랜드 투어 2박3일',
    subtitle: '고성 → 속초 → 강릉 남북 종단',
    duration: '2박3일', theme: '드라이브', distance: '약 200km',
    tags: ['해변', '트레킹', '호텔', '레일바이크', '해수욕'],
    cover: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80',
    color: '#22c55e',
    days: [
      {
        label: 'DAY 1 · 고성',
        stops: [
          { time: '오전', place: '화진포 해수욕장', icon: '🌊', tip: '국내 최북단 청정 해변. 반려견 동반 산책 가능.' },
          { time: '오후', place: '건봉사 주변 산책', icon: '🏔️', tip: '천년 고찰 주변 청정 산림. 목줄 필수.' },
          { time: '저녁', place: '속초 숙박', icon: '🏨', tip: '속초 반려동물 동반 숙소 이용.' },
        ],
      },
      {
        label: 'DAY 2 · 속초',
        stops: [
          { time: '오전', place: '영랑호 + 설악해맞이공원', icon: '🌊', tip: '속초 핵심 코스. 반려견 놀이터 + 해변 산책.' },
          { time: '오후', place: '청초호 산책 + 속초 해장국', icon: '🍲', tip: '속초 시내 구경. 반려견 동반 식당 이용.' },
          { time: '저녁', place: '강릉 이동·숙박', icon: '🏨', tip: '세인트존스호텔 또는 강릉 반려견 펜션.' },
        ],
      },
      {
        label: 'DAY 3 · 강릉',
        stops: [
          { time: '오전', place: '선자령 트레킹 (단축 코스)', icon: '🥾', tip: '체력에 맞게 선자령 일부 코스 탐방.' },
          { time: '점심', place: '그릴웍스', icon: '🍖', tip: '전 견종 동반 가능. 강릉 대표 반려견 레스토랑.' },
          { time: '귀가', place: '경강고속도로', icon: '🚗', tip: '서울까지 약 2시간 30분.' },
        ],
      },
    ],
  },
];

// ── 반려동물 크기 badge ──
function PetBadge({ petInfo }: { petInfo: string }) {
  const has = (k: string) => petInfo.toLowerCase().includes(k);
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {(has('소형') || has('전 견종') || has('모든')) && <span style={{ fontFamily: MONO, fontSize: 9, padding: '2px 6px', borderRadius: 9999, background: '#dcfce7', color: '#16a34a', fontWeight: 700 }}>소형</span>}
      {(has('중형') || has('전 견종') || has('모든')) && <span style={{ fontFamily: MONO, fontSize: 9, padding: '2px 6px', borderRadius: 9999, background: '#fef3c7', color: '#d97706', fontWeight: 700 }}>중형</span>}
      {(has('대형') || has('전 견종') || has('모든') || has('체중 제한 없')) && <span style={{ fontFamily: MONO, fontSize: 9, padding: '2px 6px', borderRadius: 9999, background: '#fee2e2', color: '#dc2626', fontWeight: 700 }}>대형</span>}
    </div>
  );
}

export default function TravelContent({ initialData }: { initialData?: TravelPlace[] }) {
  const { data: places, loading } = useGWAADB<TravelPlace>('travelPlaces', initialData);
  const [search,      setSearch]      = useState('');
  const [region,      setRegion]      = useState('전체');
  const [category,    setCategory]    = useState('전체');
  const [partnerOnly, setPartnerOnly] = useState(false);
  const [openCourse,  setOpenCourse]  = useState<string | null>(null);
  const [isMobile,    setIsMobile]    = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── shorthand padding ──
  const px = isMobile ? '16px' : '60px';
  const py = isMobile ? '40px' : '72px';

  const filtered = useMemo(() => {
    return places.filter((p) => {
      if (region !== '전체' && p.region !== region) return false;
      const cat = category;
      if (cat !== '전체') {
        const t = (p.type + p.typeLabel).toLowerCase();
        const catMap: Record<string,string[]> = {
          카페: ['카페'], 식당: ['식당','레스토랑','맛집'],
          호텔: ['호텔','리조트','펜션'], 캠핑: ['캠핑','글램핑'],
          공원: ['공원','산책','해변','해수욕'], 트레킹: ['트레킹','등산','둘레'],
          체험: ['체험','동물원','테마'], 레일바이크: ['레일바이크','레일'],
        };
        const keywords = catMap[cat] ?? [cat.toLowerCase()];
        if (!keywords.some((k) => t.includes(k))) return false;
      }
      if (partnerOnly && !p.isPartner) return false;
      if (search) {
        const q = search.toLowerCase();
        const text = `${p.name} ${p.region} ${p.typeLabel} ${p.feature} ${p.address}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [places, region, category, partnerOnly, search]);

  return (
    <>
      {/* ─── STATS ─── */}
      <section style={{ padding: `20px ${px}`, borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, auto)',
          gap: isMobile ? '16px' : '48px',
          justifyContent: isMobile ? undefined : 'start',
        }}>
          {[
            { n: `${places.length || 50}+`, label: '등록 장소', icon: '📍' },
            { n: '16',  label: '강원도 지역',  icon: '🗺️' },
            { n: '5',   label: '추천 코스',    icon: '🧭' },
            { n: '100%', label: '반려동물 동반 가능', icon: '🐾' },
          ].map(({ n, label, icon }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: isMobile ? 18 : 20 }}>{icon}</span>
              <div>
                <div style={{ fontFamily: BEBAS, fontSize: isMobile ? 18 : 22, color: '#16a34a', lineHeight: 1, letterSpacing: '0.02em' }}>{n}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: '#9ca3af', letterSpacing: '0.08em' }}>{label.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── COURSES ─── */}
      <section style={{ padding: `${py} ${px}`, borderBottom: '1px solid #e5e7eb', background: '#f8fafb' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
            <Eyebrow text="CURATED COURSES" />
            <h2 style={{ fontFamily: BEBAS, fontSize: isMobile ? 32 : 'clamp(28px,5vw,52px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1, marginBottom: 8 }}>
              추천 반려동물 여행 코스
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
              강원도 현지 데이터를 기반으로 엄선한 코스. 반려동물 동반 조건을 모두 검증했습니다.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {COURSES.map((course, i) => {
              const isOpen = openCourse === course.id;
              return (
                <motion.div key={course.id} variants={fadeUp} custom={i * 0.05}>
                  <div
                    style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', cursor: 'pointer' }}
                    onClick={() => setOpenCourse(isOpen ? null : course.id)}
                  >
                    {/* Cover */}
                    <div style={{ position: 'relative', height: 150, background: `url(${course.cover}) center/cover`, overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65))' }} />
                      <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', gap: 6 }}>
                        <span style={{ fontFamily: MONO, fontSize: 9, background: course.color, color: '#fff', padding: '3px 8px', borderRadius: 9999, fontWeight: 700, letterSpacing: '0.08em' }}>{course.duration.toUpperCase()}</span>
                        <span style={{ fontFamily: MONO, fontSize: 9, background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '3px 8px', borderRadius: 9999, letterSpacing: '0.08em', backdropFilter: 'blur(4px)' }}>{course.theme}</span>
                      </div>
                      <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
                        <h3 style={{ fontFamily: BEBAS, fontSize: 20, color: '#fff', letterSpacing: '0.02em', lineHeight: 1, marginBottom: 2 }}>{course.title}</h3>
                        <p style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.06em' }}>{course.subtitle}</p>
                      </div>
                    </div>

                    {/* Tags + toggle */}
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {course.tags.slice(0, 3).map((t) => (
                          <span key={t} style={{ fontFamily: MONO, fontSize: 9, padding: '2px 7px', borderRadius: 9999, background: '#f3f4f6', color: '#6b7280', letterSpacing: '0.06em' }}>{t}</span>
                        ))}
                      </div>
                      <span style={{ fontSize: 14, color: '#9ca3af', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s', display: 'block' }}>▾</span>
                    </div>

                    {/* Expanded itinerary */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ overflow: 'hidden' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f0f0f0' }}>
                            {course.days.map((day) => (
                              <div key={day.label} style={{ marginTop: 14 }}>
                                <div style={{ fontFamily: MONO, fontSize: 9, color: course.color, fontWeight: 700, letterSpacing: '0.14em', marginBottom: 10 }}>{day.label}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                  {day.stops.map((stop, si) => (
                                    <div key={si} style={{ display: 'flex', gap: 10, paddingBottom: si < day.stops.length - 1 ? 10 : 0, position: 'relative' }}>
                                      {si < day.stops.length - 1 && (
                                        <div style={{ position: 'absolute', left: 15, top: 24, bottom: 0, width: 1, background: '#e5e7eb' }} />
                                      )}
                                      <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: '50%', background: '#f8fafb', border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, zIndex: 1 }}>{stop.icon}</div>
                                      <div style={{ flex: 1, paddingTop: 3 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                                          <span style={{ fontFamily: MONO, fontSize: 9, color: '#9ca3af', letterSpacing: '0.06em' }}>{stop.time}</span>
                                          <span style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{stop.place}</span>
                                        </div>
                                        <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{stop.tip}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ─── PLACES DATABASE ─── */}
      <section style={{ padding: `${py} ${px} 88px`, background: '#fff' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
            <Eyebrow text="PET TRAVEL DATABASE" />
            <h2 style={{ fontFamily: BEBAS, fontSize: isMobile ? 32 : 'clamp(28px,5vw,52px)', color: '#111', letterSpacing: '0.02em', lineHeight: 1, marginBottom: 6 }}>
              강원도 반려동물 여행지
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280' }}>운영시간 · 입장료 · 반려동물 조건을 모두 확인할 수 있습니다.</p>
          </motion.div>

          {/* Search */}
          <motion.div variants={fadeUp} style={{ marginBottom: 16 }}>
            <div style={{ position: 'relative', maxWidth: 480 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="장소명, 지역, 특징으로 검색..."
                style={{ width: '100%', padding: '11px 14px 11px 38px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 14, color: '#111', background: '#fafafa', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 16 }}>✕</button>
              )}
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div variants={fadeUp} style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Region chips — horizontal scroll on mobile */}
            <div style={{
              display: 'flex', gap: 6, flexWrap: isMobile ? 'nowrap' : 'wrap',
              overflowX: isMobile ? 'auto' : 'visible',
              paddingBottom: isMobile ? 4 : 0,
              WebkitOverflowScrolling: 'touch' as any,
              msOverflowStyle: 'none' as any,
            }}>
              {REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  style={{
                    padding: '6px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', border: '1.5px solid', flexShrink: 0,
                    background: region === r ? (REGION_COLOR[r] || '#16a34a') : 'transparent',
                    color: region === r ? '#fff' : '#6b7280',
                    borderColor: region === r ? (REGION_COLOR[r] || '#16a34a') : '#d1d5db',
                    transition: 'all 0.18s', whiteSpace: 'nowrap',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Category + Partner — horizontal scroll on mobile */}
            <div style={{
              display: 'flex', gap: 6, flexWrap: isMobile ? 'nowrap' : 'wrap', alignItems: 'center',
              overflowX: isMobile ? 'auto' : 'visible',
              paddingBottom: isMobile ? 4 : 0,
              WebkitOverflowScrolling: 'touch' as any,
              msOverflowStyle: 'none' as any,
            }}>
              {CATEGORIES.map(({ key, icon }) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  style={{
                    padding: '6px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', border: '1.5px solid', flexShrink: 0,
                    background: category === key ? '#111' : 'transparent',
                    color: category === key ? '#fff' : '#6b7280',
                    borderColor: category === key ? '#111' : '#d1d5db',
                    transition: 'all 0.18s', whiteSpace: 'nowrap',
                  }}
                >
                  {icon} {key}
                </button>
              ))}
              <button
                onClick={() => setPartnerOnly(!partnerOnly)}
                style={{
                  padding: '6px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', border: '1.5px solid', flexShrink: 0,
                  background: partnerOnly ? '#fef3c7' : 'transparent',
                  color: partnerOnly ? '#92400e' : '#6b7280',
                  borderColor: partnerOnly ? '#fde68a' : '#d1d5db',
                  transition: 'all 0.18s', whiteSpace: 'nowrap',
                }}
              >
                ⭐ 파트너만
              </button>
            </div>
          </motion.div>

          {/* Result count */}
          <motion.div variants={fadeUp} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: '#9ca3af', letterSpacing: '0.06em' }}>
              {filtered.length}곳의 장소
            </span>
            {(region !== '전체' || category !== '전체' || partnerOnly || search) && (
              <button
                onClick={() => { setRegion('전체'); setCategory('전체'); setPartnerOnly(false); setSearch(''); }}
                style={{ fontFamily: MONO, fontSize: 10, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', letterSpacing: '0.04em' }}
              >
                필터 초기화
              </button>
            )}
          </motion.div>

          {/* Cards */}
          {loading ? (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: MONO, fontSize: 12, color: '#9ca3af', letterSpacing: '0.12em' }}>LOADING...</span>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: isMobile ? 14 : 18,
            }}>
              <AnimatePresence mode="popLayout">
                {filtered.map((place, i) => (
                  <motion.div
                    key={place.id ?? i}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.22 }}
                    whileHover={!isMobile ? { y: -4, boxShadow: '0 12px 36px rgba(0,0,0,0.09)' } : undefined}
                    style={{
                      background: '#fff',
                      border: `1.5px solid ${place.isPartner ? '#fde68a' : '#e5e7eb'}`,
                      borderRadius: 16,
                      overflow: 'hidden',
                      transition: 'box-shadow 0.2s',
                    }}
                  >
                    {/* Image */}
                    <div style={{
                      position: 'relative',
                      aspectRatio: isMobile ? '16/9' : '4/3',
                      background: place.imageData
                        ? `url(${place.imageData}) center/cover no-repeat`
                        : 'linear-gradient(135deg,#e8f5e9,#c8e6c9)',
                    }}>
                      <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 5 }}>
                        <span style={{ fontFamily: MONO, fontSize: 9, background: REGION_COLOR[place.region] || '#16a34a', color: '#fff', padding: '3px 7px', borderRadius: 9999, fontWeight: 700, letterSpacing: '0.06em' }}>{place.region}</span>
                        <span style={{ fontFamily: MONO, fontSize: 9, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '3px 7px', borderRadius: 9999, letterSpacing: '0.04em', backdropFilter: 'blur(4px)' }}>{place.typeLabel || place.type}</span>
                      </div>
                      {place.isPartner && (
                        <div style={{ position: 'absolute', top: 10, right: 10 }}>
                          <span style={{ fontFamily: MONO, fontSize: 8, background: '#fef3c7', color: '#92400e', padding: '3px 7px', borderRadius: 9999, fontWeight: 700, border: '1px solid #fde68a' }}>⭐ PARTNER</span>
                        </div>
                      )}
                      {/* No-image fallback label */}
                      {!place.imageData && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 36 }}>{place.icon}</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '14px 16px 16px' }}>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111', lineHeight: 1.2, marginBottom: 4 }}>
                        {place.icon} {place.name}
                      </h3>
                      <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{place.feature}</p>

                      {/* Pet conditions */}
                      <div style={{ marginBottom: 8 }}>
                        <PetBadge petInfo={place.petInfo || ''} />
                        {place.petInfo && (
                          <p style={{ fontFamily: MONO, fontSize: 10, color: '#6b7280', marginTop: 4, lineHeight: 1.5 }}>{place.petInfo}</p>
                        )}
                      </div>

                      {/* Hours + Price + Address */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10, paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                        {place.hours && (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                            <span style={{ fontFamily: MONO, fontSize: 9, color: '#9ca3af', letterSpacing: '0.04em', flexShrink: 0, paddingTop: 1 }}>⏰</span>
                            <span style={{ fontSize: 11, color: '#374151', lineHeight: 1.4 }}>{place.hours}</span>
                          </div>
                        )}
                        {place.price && (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                            <span style={{ fontFamily: MONO, fontSize: 9, color: '#9ca3af', letterSpacing: '0.04em', flexShrink: 0, paddingTop: 1 }}>💰</span>
                            <span style={{ fontSize: 11, color: '#374151', lineHeight: 1.4 }}>{place.price}</span>
                          </div>
                        )}
                        {place.address && (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                            <span style={{ fontFamily: MONO, fontSize: 9, color: '#9ca3af', letterSpacing: '0.04em', flexShrink: 0, paddingTop: 1 }}>📍</span>
                            <span style={{ fontSize: 11, color: '#374151', lineHeight: 1.4 }}>{place.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p style={{
                        fontSize: 12, color: '#6b7280', lineHeight: 1.65, marginBottom: 12,
                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
                      }}>
                        {place.desc}
                      </p>

                      {/* Map link */}
                      {place.mapUrl && (
                        <a
                          href={place.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            fontFamily: MONO, fontSize: 10, color: '#fff',
                            fontWeight: 700, letterSpacing: '0.06em', textDecoration: 'none',
                            background: '#16a34a', padding: '6px 12px', borderRadius: 8,
                          }}
                        >
                          🗺️ 지도 보기
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filtered.length === 0 && !loading && (
                <div style={{ gridColumn: '1/-1', padding: '60px 0', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                  <p style={{ fontSize: 14, color: '#6b7280' }}>검색 결과가 없습니다. 다른 키워드나 필터를 시도해보세요.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
}
