'use client';

import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import RecapSection from './RecapSection';
import SponsorMarquee from './SponsorMarquee';
import {
  Tent, Music, Globe, Gift, Dog, Volleyball, Wind, Lock, Droplets, Waves, Flame,
  ShoppingBag, Telescope, UtensilsCrossed, MapPin, Backpack, PawPrint,
  ChevronDown, Check, Users, type LucideIcon,
} from 'lucide-react';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
// 라틴·숫자는 Bebas, 한글은 Black Han Sans로 폴백 → 강렬한 한글 제목
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const GREEN = '#16a34a';
const GREEN_DK = '#15803d';
const WARM = '#f59e0b';        // 축제 온기 포인트 컬러 (캠프파이어/가을)
const MUTED = '#6b7280';

const cardBase: React.CSSProperties = { background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14 };
const cardTint: React.CSSProperties = { background: '#f4f8f4', border: '1px solid #d8e8d8', borderRadius: 14 };

// 아이콘 배지 (일관된 처리) — warm: 밤·축제 요소는 따뜻한 톤
function IconBadge({ Icon, size = 40, warm = false }: { Icon: LucideIcon; size?: number; warm?: boolean }) {
  const color = warm ? WARM : GREEN;
  const bg = warm ? '#fffbeb' : '#f0fdf4';
  const bd = warm ? '#fde68a' : '#dcfce7';
  return (
    <div style={{ width: size, height: size, borderRadius: 11, background: bg, border: `1px solid ${bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={Math.round(size * 0.52)} color={color} strokeWidth={1.75} />
    </div>
  );
}

// 2026 펫스카웃 캠프 & 펫페스티벌 상세 콘텐츠 (event id=3) — 제안서 v7 기준
export default function PetscoutContent() {
  const isMobile = useIsMobile();
  const [dayIdx, setDayIdx] = useState(1);      // 기본 DAY 2 (메인)
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  // 낭만기버 전용 링크(?rg=코드)면 rgMode — BookingFlow의 RG_CODE와 동일해야 함
  const [rgMode, setRgMode] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).get('rg') !== 'nangman-2026') return;
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setRgMode(true);
  }, []);

  const Eyebrow = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <span style={{ width: 20, height: 2, background: GREEN, borderRadius: 1 }} />
      <span style={{ fontFamily: MONO, fontSize: 11, color: GREEN, letterSpacing: '0.08em', fontWeight: 700 }}>{children}</span>
    </div>
  );
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 style={{ fontFamily: BEBAS, fontWeight: 800, fontSize: isMobile ? 29 : 36, color: '#111', letterSpacing: '0.01em', lineHeight: 1.15, marginBottom: isMobile ? 16 : 20, wordBreak: 'keep-all' }}>{children}</h2>
  );

  const highlights: { Icon: LucideIcon; title: string; desc: string; warm?: boolean }[] = [
    { Icon: Tent, title: '일반 캠퍼도, 반려견과 함께여도', desc: '150여 개 사이트. 캠핑만 즐겨도, 반려견과 함께 와도 좋아요.' },
    { Icon: Music, title: '낮부터 밤까지, 진짜 축제', desc: '도그쇼·마켓·체험부터 밤엔 인디밴드·이박사 공연·캠프파이어·야외 영화제까지.', warm: true },
    { Icon: Globe, title: '세계잼버리 수련장에서', desc: '고성 세계잼버리 수련장, 그 드넓은 대지 위에서 열려요.' },
    { Icon: Gift, title: '오면 받는 웰컴키트', desc: '참가자 전원에게 기념 굿즈를 드려요.' },
  ];

  const petZones: { Icon: LucideIcon; title: string; desc: string }[] = [
    { Icon: Dog, title: '일반 오프리쉬', desc: '목줄 풀고 마음껏 뛰노는 기본 오프리쉬 놀이터.' },
    { Icon: Volleyball, title: '반려인 축구 오프리쉬', desc: '강아지들이 방해하는 변수 속, 반려인끼리 팀 대결.' },
    { Icon: Wind, title: '대형 노즈워크 오프리쉬', desc: '대형 노즈워크 천에 숨긴 냄새·간식을 안전하게 탐색.' },
    { Icon: Lock, title: '프라이빗 오프리쉬', desc: '겁 많고 소심한 반려견을 위한 1인 독립 공간.' },
    { Icon: Droplets, title: '반려견 목욕차', desc: '전문 업체가 온수로 씻기고 드라이까지. 캠핑으로 지저분해진 반려견을 깔끔하게. (유료·예약제)' },
    { Icon: Users, title: '사회성 적응 소그룹존', desc: '사회성이 서투른 반려견을 위한 적응형 소그룹 존.' },
  ];

  const booths = ['천연 연고 만들기 (사람·반려견 공용)', '동물등록 부스', '반려견 행동교정', '숲속 사우나', '심신안정 명상', '선라이즈 요가'];
  const paidBooths = [{ name: '코닥 포토부스', price: '2,000원' }];

  const moreZones: { Icon: LucideIcon; title: string; desc: string; warm?: boolean }[] = [
    { Icon: ShoppingBag, title: '브랜드존 · 마켓', desc: '반려동물·캠핑 브랜드 마켓. 체험·특가·포토존까지.' },
    { Icon: Telescope, title: '별자리 관찰존', desc: '천체망원경과 해설로 즐기는 밤하늘 스타게이징.', warm: true },
    { Icon: UtensilsCrossed, title: '푸드트럭 존', desc: '하루 종일 열리는 다양한 먹거리 존.' },
  ];

  const schedule = [
    {
      day: 'DAY 1', date: '9/4 (금)', theme: '입소 · 야간 무대',
      rows: [
        { time: '12:00~', title: '입소 (오후 12시부터)', desc: '오후 12시부터 입소 · 텐트·장비 설치 · 웰컴키트 수령 · 일반 사이트는 사이트 내 주차, 펫존(개별 펜스)은 안전을 위해 차량 진입 불가' },
        { time: '16:00', title: '인디밴드 해티스', desc: '메인 무대 라이브 (~17:30)' },
        { time: '18:00', title: '인디밴드 레드씨 (Red C)', desc: '메인 무대 라이브 (~19:30)' },
        { time: '20:00', title: '캠프파이어', desc: '브랜드존 중앙' },
        { time: '20:00', title: '야외 영화제 (Camping Cinema)', desc: '대형 스크린·빈백존 · 반려견과 함께 (~22:00)' },
      ],
    },
    {
      day: 'DAY 2', date: '9/5 (토)', theme: '메인 데이',
      rows: [
        { time: '07:00', title: '선라이즈 요가', desc: '브랜드존 · 하루를 여는 힐링 요가 (~08:30)' },
        { time: '07:00', title: '심신안정 명상', desc: '무대 · 자연 소리와 함께하는 명상 (~08:30)' },
        { time: '10:00', title: '강원 반려동물 문화행사 개막', desc: 'PetScout 공식 시작 · 메인 무대 오프닝' },
        { time: '10:00', title: '어질리티 쇼', desc: '오프리쉬존 · 장애물 코스 스피드 경기 (~12:00)' },
        { time: '12:30', title: '참여형 이벤트 + 강아지 장기자랑', desc: '무대 · 카카오톡 채널 빙고게임, 초성 맞추기 등' },
        { time: '16:00', title: '인디밴드 피싱걸스', desc: '메인 무대 라이브 (~17:30)' },
        { time: '18:00', title: '인디밴드 나타샤', desc: '메인 무대 라이브 (~19:30)' },
        { time: '20:00', title: '이박사 공연', desc: '메인 무대 · 축제의 밤을 여는 특별 공연 (~22:00)' },
        { time: '20:00', title: '캠프파이어', desc: '브랜드존 중앙' },
      ],
    },
    {
      day: 'DAY 3', date: '9/6 (일)', theme: '마무리',
      rows: [
        { time: '07:00', title: '선라이즈 요가', desc: '브랜드존 (~08:30)' },
        { time: '07:00', title: '심신안정 명상', desc: '무대 (~08:30)' },
        { time: '~15:00', title: '사이트 정리 및 자유 퇴소', desc: '별도 퇴소 절차 없음 · 오후 3시 전 자유 퇴장' },
      ],
    },
  ];

  const fees = [
    { label: '근접 일반존 (A~D)', price: '155,000원', unit: '/ 2박3일 · 2인', tiers: ['넉넉한 10×10m 대형', '무대·푸드존 인접', '캠핑 사이트 60면'] },
    { label: '원거리 일반존 (E)', price: '135,000원', unit: '/ 2박3일 · 2인', tiers: ['넉넉한 10×10m 대형', '근접존 대비 2만원 할인', '캠핑 사이트 40면'] },
    { label: '반려동물 펜스존 (F)', price: '185,000원', unit: '/ 2박3일 · 2인', tiers: ['넉넉한 10×10m · 독립 펜스', '펫 전용 사이트 52면'] },
  ];

  // 현장 숲속 사우나존(신규) + 근처 사우나·온천 안내
  const saunas = [
    {
      Icon: Flame, badge: '현장 · 무료', grad: 'linear-gradient(135deg,#166534,#22c55e)',
      name: '숲속 사우나존',
      benefit: '숲속에서 즐기는 핫앤콜드 리커버리! 사우나로 몸을 뜨겁게 달군 뒤 아이스 버킷(냉수)에 풍덩 — 캠핑의 피로가 확 풀려요. 참가자 누구나 무료로 이용할 수 있어요.',
      dist: '행사장 내 · 무료', addr: '펫스카웃 행사장 · 숲속 사우나존', tel: '',
      url: '', onsite: true,
    },
    {
      Icon: Droplets, badge: '천연 온천', grad: 'linear-gradient(135deg,#0d9488,#2dd4bf)',
      name: '파인리즈 리조트',
      benefit: '지하 1,100m에서 솟는 40℃ 천연 미네랄 온천. 잼버리장 바로 옆이라 이동이 가장 편해요.',
      dist: '잼버리장 인접', addr: '강원 고성군 토성면 잼버리동로 267', tel: '1577-6399',
      url: 'https://www.pineridge.co.kr/page/spa/hot_sauna.asp',
    },
    {
      Icon: Waves, badge: '해수 사우나', grad: 'linear-gradient(135deg,#0284c7,#38bdf8)',
      name: '켄싱턴리조트 설악비치',
      benefit: '동해 바닷물을 데운 해수 사우나. 오전 6시부터 열어 이른 아침에도 개운하게 씻을 수 있어요.',
      dist: '차로 약 5분', addr: '강원 고성군 토성면 동해대로 4800', tel: '033-631-7601',
      url: 'https://map.naver.com/p/entry/place/1515190710',
    },
    {
      Icon: Wind, badge: '사우나·찜질', grad: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
      name: '일성콘도 고성',
      benefit: '사우나·찜질방을 갖춘 동해 인근 콘도. 온 가족이 함께 뜨끈하게 몸을 풀기 좋아요. 단, 사우나 이용 가능 시간이 따로 정해져 있으니 방문 전 전화로 확인해 주세요.',
      dist: '차로 약 5분', addr: '강원 고성군 토성면', tel: '02-546-8293',
      url: 'https://condogo.co.kr/__new/condo/condo_view.php?idx=27',
    },
  ];

  // 장비 렌탈 — 텐트 없어도 몸만 오면 OK (네이버 스토어 연결)
  const rentals = [
    { name: '에어텐트 6.3', badge: '에어텐트', grad: 'linear-gradient(135deg,#16a34a,#4ade80)', desc: '펌프로 빠르게 부풀리는 에어텐트. 설영이 서툴러도 걱정 없어요.', url: 'https://smartstore.naver.com/funny_joy/products/13703291049' },
    { name: '에어텐트 8.0', badge: '대형 에어텐트', grad: 'linear-gradient(135deg,#0ea5e9,#7dd3fc)', desc: '더 넓은 공간의 대형 에어텐트. 가족·단체에 넉넉해요.', url: 'https://smartstore.naver.com/funny_joy/products/13703341143' },
    { name: '4종 구성품 세트', badge: '장비 세트', grad: 'linear-gradient(135deg,#f59e0b,#fbbf24)', desc: '캠핑에 필요한 기본 장비 4종 구성. 필요한 것만 간편하게.', url: 'https://smartstore.naver.com/funny_joy/products/13703352911' },
  ];

  // 웰니스 클래스 (유료) — 낭만기버 웰니스존 · 25,000원/클래스
  const wcImg = '/images/events/jamboree-2026/classes';
  const wellnessClasses = [
    { emoji: '🐶', name: '퍼피요가', host: '소울얼라인먼트', grad: 'linear-gradient(135deg,#16a34a,#4ade80)', img: `${wcImg}/puppy.webp`, desc: '반려견과 자연 속에서 교감하는 힐링 요가 (반려동물 없이도 참여 가능)', when: '9/5(토) 15:30 · 9/6(일) 09:00' },
    { emoji: '🤸', name: '아크로요가', host: 'TJ & 징조', grad: 'linear-gradient(135deg,#0284c7,#38bdf8)', img: `${wcImg}/acro.webp`, desc: '함께 호흡하며 균형을 만드는 파트너 요가 (혼자도 참여 가능)', when: '9/5(토) 10:30 · 18:30' },
    { emoji: '🐾', name: '애니멀플로우', host: '최민호', grad: 'linear-gradient(135deg,#65a30d,#a3e635)', img: `${wcImg}/animalflow.webp`, desc: '동물의 움직임을 담은 전신 맨몸 운동', when: '9/5(토) 17:00 · 9/6(일) 10:30' },
    { emoji: '🎵', name: '핸드팬 사운드힐링', host: '하택후', grad: 'linear-gradient(135deg,#7c3aed,#a78bfa)', img: `${wcImg}/handpan.webp`, desc: '잔잔한 핸드팬 선율로 몸과 마음을 쉬어가는 시간', when: '9/4(금) 19:00 · 9/5(토) 09:00' },
    { emoji: '🌺', name: '훌라댄스', host: '훌라당 (온다)', grad: 'linear-gradient(135deg,#db2777,#fb7185)', img: `${wcImg}/hula.webp`, desc: '하와이의 리듬과 함께 몸과 마음을 자유롭게 움직이는 클래스', when: '9/5(토) 14:00' },
    { emoji: '🧴', name: '아로마 DIY 상시체험', host: '1인 10,000원', grad: 'linear-gradient(135deg,#0ea5e9,#7dd3fc)', img: `${wcImg}/aroma.webp`, desc: '반려동물용 아로마 치약·샴푸·롤온을 직접 만드는 상시 체험 (셋 중 택1)', when: '9/5(토) 상시 10:00~18:00' },
  ];
  const wellnessSchedule = [
    { day: '9/4 금', time: '19:00~20:00', cls: '🎵 핸드팬 사운드힐링', host: '하택후' },
    { day: '9/5 토', time: '09:00~10:00', cls: '🎵 핸드팬 사운드힐링', host: '하택후' },
    { day: '9/5 토', time: '10:30~11:30', cls: '🤸 아크로요가', host: 'TJ & 징조' },
    { day: '9/5 토', time: '14:00~15:00', cls: '🌺 훌라댄스 & 공연', host: '온다' },
    { day: '9/5 토', time: '15:30~16:30', cls: '🐶 퍼피요가', host: '소울얼라인먼트' },
    { day: '9/5 토', time: '17:00~18:00', cls: '🌿 애니멀플로우', host: '최민호' },
    { day: '9/5 토', time: '18:30~19:30', cls: '🤸 아크로요가', host: 'TJ & 징조' },
    { day: '9/6 일', time: '09:00~10:00', cls: '🐶 퍼피요가', host: '소울얼라인먼트' },
    { day: '9/6 일', time: '10:30~11:30', cls: '🌿 애니멀플로우', host: '최민호' },
    { day: '9/5 토', time: '상시 10:00~18:00', cls: '🧴 아로마 DIY (치약·샴푸·롤온 택1)', host: '상시체험' },
  ];

  const faqs = [
    { q: '반려견이 없어도 참가할 수 있나요?', a: '물론입니다. 일반 캠퍼·가족·연인 모두 환영합니다. 반려견 동반은 선택이며, 무대 공연·체험부스·캠프파이어 등 대부분의 프로그램을 함께 즐기실 수 있습니다.' },
    { q: '사이트 종류는 어떻게 되나요?', a: '모든 캠핑 사이트는 넉넉한 10×10m 대형 규격으로, 보통 6~8m인 일반 캠핑 축제보다 넓습니다. 근접 일반존(A~D) 60면, 원거리 일반존(E) 40면, 반려동물 펜스존(F1~F4) 52면, 총 152면으로 구성됩니다. 원거리 E존은 근접존 대비 2만원 저렴하고, 펜스존은 독립 울타리가 있어 반려견 활동에 좋습니다. 예약 화면에서 원하는 자리를 직접 선택하세요.' },
    { q: '예방접종이 안 된 반려견도 입장 가능한가요?', a: '다른 반려견과 참가자의 안전을 위해 기본 예방접종 완료를 권장합니다. 예약 시 접종 여부를 입력받습니다.' },
    { q: '텐트·장비가 없어도 참가할 수 있나요?', a: '네, 몸만 오셔도 됩니다. 설치가 간편한 에어텐트와 기본 장비 세트를 대여할 수 있어요 (네이버 스토어 신청 · 아래 「장비 없이 가볍게 오세요」 참고). 숙박 없이 프로그램만 즐기고 싶다면 당일권(20,000원/인)도 있습니다.' },
    { q: '퇴소는 언제까지 하나요?', a: '마지막 날(9/6) 오후 5시 전까지 자유롭게 퇴장하시면 됩니다. 별도의 퇴소 절차는 없습니다.' },
    { q: '샤워실·탈의실·화장실이 있나요?', a: '샤워실과 탈의실이 마련되어 있습니다(머리 감을 공간 포함). 화장실은 각 구역 근처에 별도로 있고, 휴지도 비치할 예정이지만 개별로 조금 챙겨 오시면 더 편안합니다.' },
    { q: '설거지·조리 시설은 어떻게 되나요?', a: '개수대와 전자레인지가 있습니다. 다만 세제는 비치되지 않으니 개별로 지참해 주세요. 버너·이소가스 등 조리 장비도 미리 준비해 오시길 권합니다.' },
    { q: '물이나 먹거리는 현장에서 구할 수 있나요?', a: '식수는 고성 해양심층수로 넉넉히 나눠드릴 예정입니다. 현장에는 다양한 푸드트럭이 오전 10시부터 밤 10시까지 운영됩니다. 매점 등은 준비 중이니, 필요한 식재료는 미리 챙겨 오시길 권합니다.' },
    { q: '입소 시간과 차량 외출은 어떻게 되나요?', a: '입소는 9월 4일(금) 오후 12시부터 자유롭게 가능하며, 지도에 표시된 행사장 입구로만 진입하실 수 있습니다(현장 유도 사인 안내). 마트·주변 관광을 위한 외출도 가능하며, 차량 통제 시간은 밤 10시입니다. 안전을 위해 펫존(개별 펜스)은 차량 진입이 불가합니다.' },
  ];

  const wrap: React.CSSProperties = { marginBottom: isMobile ? 56 : 80 };
  const cardPad: React.CSSProperties = { padding: isMobile ? '20px 18px' : '24px 22px' };
  const activeDay = schedule[dayIdx];

  return (
    <div style={{ marginTop: isMobile ? 8 : 16 }}>

      {/* 행사 후기(RECAP) — 비공개(RECAP_PUBLISHED=false). ?recap=preview 로만 미리보기. 행사 후 사진 채우고 공개 */}
      <RecapSection />

      {/* 컨셉 인트로 */}
      <div style={{ ...wrap, position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${GREEN_DK} 0%, #146c34 55%, #1b5e34 100%)`, borderRadius: 18, padding: isMobile ? '28px 22px' : '48px 44px', color: '#fff' }}>
        {/* 따뜻한 축제 글로우 */}
        <div style={{ position: 'absolute', top: -60, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.35), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <span style={{ display: 'inline-block', background: WARM, color: '#3a2600', fontSize: 11.5, fontWeight: 800, letterSpacing: '0.06em', padding: '5px 12px', borderRadius: 9999, marginBottom: 14 }}>
            2박 3일 · 강원 고성 캠핑 페스티벌
          </span>
          <h2 style={{ fontFamily: BEBAS, fontWeight: 800, fontSize: isMobile ? 30 : 44, letterSpacing: '0.01em', lineHeight: 1.14, marginBottom: 14, color: '#fff', wordBreak: 'keep-all' }}>
            일반 캠퍼도, 반려견과 함께여도<br />모두를 위한 캠핑 축제
          </h2>
          <p style={{ fontSize: isMobile ? 15 : 16.5, lineHeight: 1.85, color: 'rgba(255,255,255,0.92)', maxWidth: 600, letterSpacing: '-0.01em', wordBreak: 'keep-all' }}>
            강원 고성 세계잼버리 수련장에서 열리는 2박 3일 캠핑 축제.<br />
            일반 캠퍼도, 반려견과 함께여도 좋아요.<br /><br />
            낮엔 도그쇼·마켓·체험,<br />
            밤엔 인디밴드·이박사 공연·캠프파이어까지.
          </p>
        </div>
      </div>

      {/* 한눈에 보는 요약 — 인포그래픽 */}
      <div style={wrap}>
        <Eyebrow>AT A GLANCE</Eyebrow>
        <H>한눈에 보는 펫스카웃</H>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: isMobile ? 10 : 14 }}>
          {[
            { Icon: Tent, big: '2박 3일', label: '9/4(금)~6(일) · 고성' },
            { Icon: MapPin, big: '150+ 사이트', label: '10×10m 대형 캠핑' },
            { Icon: Music, big: '라이브 5팀', label: '인디밴드 + 이박사' },
            { Icon: Wind, big: '웰니스 5클래스', label: '요가·사운드힐링 등' },
            { Icon: PawPrint, big: '오프리쉬 5존', label: '+ 무료 체험부스' },
            { Icon: Gift, big: '웰컴키트', label: '예약 전원 증정' },
          ].map((s) => (
            <div key={s.big} style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: 14, padding: isMobile ? '16px 12px' : '20px 16px', textAlign: 'center' }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: '#fff', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <s.Icon size={22} color={GREEN} strokeWidth={2} />
              </div>
              <div style={{ fontFamily: BEBAS, fontSize: isMobile ? 18 : 21, color: '#111', letterSpacing: '0.01em', lineHeight: 1.12, wordBreak: 'keep-all' }}>{s.big}</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 4, wordBreak: 'keep-all', lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 핵심 매력 */}
      <div style={wrap}>
        <Eyebrow>WHY PETSCOUT</Eyebrow>
        <H>이 축제만의 매력</H>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: isMobile ? 12 : 16 }}>
          {highlights.map((h) => (
            <div key={h.title} style={{ ...cardBase, ...cardPad }}>
              <div style={{ marginBottom: 12 }}><IconBadge Icon={h.Icon} warm={h.warm} /></div>
              <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, color: '#111', marginBottom: 7, wordBreak: 'keep-all' }}>{h.title}</div>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.72, wordBreak: 'keep-all' }}>{h.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 숲속 사우나 · 아이스버킷 (감성 전용 섹션) */}
      <div style={wrap}>
        <Eyebrow>SAUNA & RECOVERY</Eyebrow>
        <H>숲속 사우나 · 아이스버킷</H>
        <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e8e8e8', background: '#000', lineHeight: 0 }}>
          <video src="/images/events/jamboree-2026/sauna.mp4" poster="/images/events/jamboree-2026/sauna-poster.webp" autoPlay muted loop playsInline preload="metadata" style={{ width: '100%', display: 'block' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Flame size={20} color="#ea580c" strokeWidth={2} /></div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Droplets size={20} color="#0284c7" strokeWidth={2} /></div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 800, color: '#111', lineHeight: 1.4 }}>불에 달군 몸, 얼음물에 풍덩 — 핫앤콜드 리커버리</div>
            <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6, marginTop: 4, wordBreak: 'keep-all' }}>숲 한가운데 텐트 사우나로 뜨겁게 데우고 아이스 버킷에 풍덩. 캠핑의 피로가 확 풀리는 프리미엄 회복 코스. <b style={{ color: GREEN_DK }}>참가자 누구나 무료.</b></p>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {['🔥 핀란드식 텐트 사우나', '❄️ 천연 냉수 아이스버킷', '💪 캠핑 후 근육 회복', '🌲 숲 한가운데 힐링', '🆓 참가자 전원 무료'].map((t) => (
            <span key={t} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontWeight: 700, fontSize: 13, padding: '8px 14px', borderRadius: 9999, wordBreak: 'keep-all' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* 무대 앞 빈백존 — 편하게 즐기는 공연 */}
      <div style={wrap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 14 : 22, background: 'linear-gradient(135deg,#1f2937,#0f172a)', borderRadius: 16, padding: isMobile ? '20px 20px' : '26px 30px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div aria-hidden style={{ position: 'absolute', right: -8, top: -16, fontSize: 120, opacity: 0.1, lineHeight: 1 }}>🛋️</div>
          <div aria-hidden style={{ flexShrink: 0, fontSize: isMobile ? 40 : 54, lineHeight: 1 }}>🛋️</div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: '#fbbf24', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>STAGE BEANBAG ZONE</div>
            <div style={{ fontSize: isMobile ? 17 : 21, fontWeight: 800, lineHeight: 1.35, wordBreak: 'keep-all' }}>메인 무대 앞엔 <span style={{ color: '#fbbf24' }}>빈백</span>이 깔려 있어요</div>
            <p style={{ fontSize: isMobile ? 13 : 14, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, marginTop: 6, wordBreak: 'keep-all' }}>인디밴드 라이브도, 이박사 공연도, 밤엔 야외 영화까지 — 딱딱한 자리 대신 푹신한 빈백에 기대 누워서 무대 바로 앞에서 편하게 즐기세요.</p>
          </div>
        </div>
      </div>

      {/* 프로그램 시간표 — DAY 탭 */}
      <div style={wrap}>
        <Eyebrow>SCHEDULE</Eyebrow>
        <H>프로그램 시간표</H>
        {/* 전체 일정 포스터 (탭하면 크게) */}
        <a href="/images/events/jamboree-2026/schedule.webp" target="_blank" rel="noopener noreferrer"
          style={{ display: 'block', borderRadius: 14, overflow: 'hidden', border: '1px solid #e8e8e8', marginBottom: 10, position: 'relative' }}>
          <img src="/images/events/jamboree-2026/schedule.webp" alt="Camping with Petscout 전체 일정표" style={{ width: '100%', display: 'block' }} />
          <span style={{ position: 'absolute', right: 10, bottom: 10, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 9999 }}>탭하면 크게 보기 🔍</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0 12px' }}>
          <span style={{ width: 18, height: 2, background: GREEN, borderRadius: 1 }} />
          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#374151' }}>요일별 자세히 보기</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {schedule.map((d, i) => {
            const on = i === dayIdx;
            return (
              <button key={d.day} onClick={() => setDayIdx(i)}
                style={{ flex: 1, padding: isMobile ? '10px 6px' : '12px 10px', borderRadius: 12, cursor: 'pointer',
                  border: `1.5px solid ${on ? GREEN : '#e5e7eb'}`, background: on ? GREEN : '#fff', textAlign: 'center', fontFamily: MONO, transition: 'all .15s' }}>
                <div style={{ fontFamily: BEBAS, fontSize: isMobile ? 17 : 19, letterSpacing: '0.04em', color: on ? '#fff' : '#111', lineHeight: 1 }}>{d.day}</div>
                <div style={{ fontSize: 11, marginTop: 3, color: on ? 'rgba(255,255,255,0.85)' : '#6b7280', fontWeight: 600 }}>{d.date}</div>
              </button>
            );
          })}
        </div>
        <div style={{ ...cardBase, overflow: 'hidden' }}>
          <div style={{ background: GREEN_DK, padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: BEBAS, fontSize: 20, color: '#fff', letterSpacing: '0.04em' }}>{activeDay.day}</span>
              <span style={{ fontSize: 12, color: '#86efac', fontWeight: 700 }}>{activeDay.date}</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 3, letterSpacing: '0.02em' }}>{activeDay.theme}</div>
          </div>
          <div>
            {activeDay.rows.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: isMobile ? '13px 18px' : '14px 22px', borderBottom: i < activeDay.rows.length - 1 ? '1px solid #f2f2f2' : 'none' }}>
                <div style={{ fontFamily: BEBAS, fontSize: 16, color: GREEN, letterSpacing: '0.02em', minWidth: 54, flexShrink: 0, paddingTop: 1 }}>{r.time}</div>
                <div>
                  <div style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, color: '#111', marginBottom: 3, wordBreak: 'keep-all' }}>{r.title}</div>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, wordBreak: 'keep-all' }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 10 }}>* 야외 프로그램은 기상·현장 상황에 따라 변동될 수 있습니다.</p>
      </div>

      {/* PET ZONE */}
      <div style={wrap}>
        <Eyebrow>PET ZONE</Eyebrow>
        <H>오프리쉬존 5가지 컨셉</H>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: isMobile ? 12 : 14 }}>
          {petZones.map((p) => (
            <div key={p.title} style={{ ...cardTint, display: 'flex', gap: 14, alignItems: 'flex-start', padding: isMobile ? '18px 16px' : '20px 22px' }}>
              <IconBadge Icon={p.Icon} size={38} />
              <div>
                <div style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, color: '#111', marginBottom: 5, wordBreak: 'keep-all' }}>{p.title}</div>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.68, wordBreak: 'keep-all' }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 체험 부스 — pill */}
      <div style={wrap}>
        <Eyebrow>BOOTHS</Eyebrow>
        <H>무료 체험 부스</H>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 8 : 10 }}>
          {booths.map((b) => (
            <span key={b} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 9999, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 13.5, fontWeight: 600, color: '#15803d', wordBreak: 'keep-all' }}>{b}<span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>무료</span></span>
          ))}
          {paidBooths.map((b) => (
            <span key={b.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 9999, background: '#f9fafb', border: '1px solid #e8e8e8', fontSize: 13.5, fontWeight: 600, color: '#374151', wordBreak: 'keep-all' }}>{b.name}<span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>{b.price}</span></span>
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 14, lineHeight: 1.6 }}>천연 연고 만들기(사람·반려견 함께 쓸 수 있어요)·동물등록·행동교정 상담부터 숲속 사우나·아침 명상·요가까지 무료로 즐기실 수 있어요. 코닥 포토부스만 2,000원이며, 이 외에도 일부 유료 체험부스가 별도 운영됩니다.</p>
      </div>

      {/* 더 즐길거리 */}
      <div style={wrap}>
        <Eyebrow>MORE TO ENJOY</Eyebrow>
        <H>더 즐길거리</H>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: isMobile ? 12 : 14 }}>
          {moreZones.map((z) => (
            <div key={z.title} style={{ ...cardBase, ...cardPad }}>
              <div style={{ marginBottom: 12 }}><IconBadge Icon={z.Icon} warm={z.warm} /></div>
              <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, color: '#111', marginBottom: 7, wordBreak: 'keep-all' }}>{z.title}</div>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.72, wordBreak: 'keep-all' }}>{z.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 현장 참여 게임 티저 — 궁금증 유발 */}
      <div style={wrap}>
        <Eyebrow>PLAY &amp; WIN</Eyebrow>
        <H>현장 참여 게임 &amp; 경품</H>
        <div style={{ background: 'linear-gradient(135deg,#15803d,#166534)', borderRadius: 16, padding: isMobile ? '22px 20px' : '30px 32px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div aria-hidden style={{ position: 'absolute', right: -10, top: -10, fontSize: 120, opacity: 0.12, lineHeight: 1 }}>🎁</div>
          <div style={{ fontSize: isMobile ? 17 : 20, fontWeight: 800, lineHeight: 1.35, wordBreak: 'keep-all', position: 'relative' }}>
            무대에서 펼쳐지는 참여 게임, <span style={{ color: '#bbf7d0' }}>참여만 해도 경품 찬스</span> 🎯
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0 12px', position: 'relative' }}>
            {['카톡 채널 빙고', '초성 퀴즈', '강아지 장기자랑', '버스킹 장기자랑', '깜짝 미션'].map((g) => (
              <span key={g} style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.28)', borderRadius: 9999, padding: '7px 15px', fontSize: 13.5, fontWeight: 700 }}>{g}</span>
            ))}
          </div>
          <div style={{ fontSize: isMobile ? 13 : 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, wordBreak: 'keep-all', position: 'relative' }}>
            상품과 자세한 룰은 <b style={{ color: '#fff' }}>현장에서 공개</b>돼요 👀 — 어떤 경품이 걸렸을지, 와서 확인해보세요.
          </div>
        </div>
      </div>

      {/* 웰니스 클래스 (유료) */}
      <div style={wrap}>
        <Eyebrow>WELLNESS CLASS</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <H>웰니스 클래스</H>
          <span style={{ display: 'inline-block', background: WARM, color: '#3a2600', fontSize: 12, fontWeight: 800, letterSpacing: '0.04em', padding: '4px 11px', borderRadius: 9999, marginBottom: isMobile ? 10 : 14 }}>유료 · 선택 예약</span>
        </div>
        <p style={{ fontSize: isMobile ? 14 : 15, color: MUTED, lineHeight: 1.7, margin: '-4px 0 16px', wordBreak: 'keep-all' }}>
          자연 속에서 몸과 마음을 깨우는 특별한 시간. <b style={{ color: '#374151' }}>국내 최고 전문가들과 함께하는</b> 웰니스 클래스를 만나보세요. (낭만기버 웰니스존)
        </p>

        {/* 웰니스 감성 배너 */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: isMobile ? '16 / 11' : '21 / 7', borderRadius: 14, overflow: 'hidden', marginBottom: isMobile ? 16 : 20 }}>
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'url(/images/events/jamboree-2026/wellness-hero.webp) center 42%/cover no-repeat' }} />
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.05) 100%)' }} />
          <div style={{ position: 'absolute', left: isMobile ? 18 : 30, bottom: isMobile ? 16 : 24, right: 18, color: '#fff' }}>
            <div style={{ fontFamily: BEBAS, fontSize: isMobile ? 23 : 32, letterSpacing: '0.01em', lineHeight: 1.12, textShadow: '0 2px 12px rgba(0,0,0,0.45)', wordBreak: 'keep-all' }}>몸도 마음도, 자연 속에서 리셋</div>
            <div style={{ fontSize: isMobile ? 12.5 : 14, color: 'rgba(255,255,255,0.92)', marginTop: 6, wordBreak: 'keep-all', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>숲속 사우나 · 요가 · 사운드힐링 — 반려견 곁에서 나도 회복하는 시간</div>
          </div>
        </div>

        {/* 가격 안내 */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: isMobile ? '14px 16px' : '16px 20px', marginBottom: isMobile ? 14 : 18, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontFamily: BEBAS, fontSize: isMobile ? 26 : 30, color: '#b45309' }}>{rgMode ? '15,000원' : '25,000원'}</span>
            <span style={{ fontSize: 13, color: '#92400e', fontWeight: 700 }}> / 1인 · 클래스별</span>
          </div>
          <span style={{ fontSize: 12.5, color: '#92400e', lineHeight: 1.6, wordBreak: 'keep-all', flex: 1, minWidth: 200 }}>
            캠핑 이용료와 <b>별도 결제</b>이며, 원하는 클래스만 골라 예약하실 수 있어요. <b>아로마 DIY 상시체험은 1인 10,000원</b>이에요.
          </span>
        </div>

        {/* 클래스 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: isMobile ? 12 : 14 }}>
          {wellnessClasses.map((c) => (
            <div key={c.name} style={{ ...cardBase, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 5', background: c.grad, backgroundImage: c.img ? `url(${c.img})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-end', justifyContent: c.img ? 'flex-start' : 'center', fontSize: 44 }}>
                {c.img && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.12) 42%, transparent 62%)' }} />}
                {c.img ? (
                  <div style={{ position: 'relative', padding: '14px 16px', color: '#fff' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, textShadow: '0 1px 5px rgba(0,0,0,0.45)', lineHeight: 1.2 }}>{c.emoji} {c.name}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.92, marginTop: 2 }}>{c.host}</div>
                  </div>
                ) : c.emoji}
              </div>
              <p style={{ margin: 0, padding: '11px 14px 12px', fontSize: 12.5, color: MUTED, lineHeight: 1.62, wordBreak: 'keep-all', flex: 1 }}>{c.desc}</p>
              <div style={{ padding: '9px 14px', fontSize: 12.5, color: '#374151', background: '#f9fafb', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', borderTop: '1px solid #f1f1f1' }}>🗓 {c.when}</div>
            </div>
          ))}
        </div>

        {/* 전체 시간표 */}
        <div style={{ ...cardBase, marginTop: isMobile ? 14 : 18, overflow: 'hidden' }}>
          <div style={{ padding: isMobile ? '12px 16px' : '14px 20px', borderBottom: '1px solid #eee', fontSize: 14, fontWeight: 800, color: '#111' }}>전체 시간표 <span style={{ fontSize: 12, fontWeight: 400, color: MUTED }}>· 2박 3일 총 9세션</span></div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 380 }}>
              <tbody>
                {wellnessSchedule.map((s, i) => (
                  <tr key={i} style={{ borderBottom: i < wellnessSchedule.length - 1 ? '1px solid #f1f1f1' : 'none' }}>
                    <td style={{ padding: '10px 16px', fontSize: 12.5, fontWeight: 700, color: GREEN_DK, whiteSpace: 'nowrap' }}>{s.day}</td>
                    <td style={{ padding: '10px 8px', fontSize: 12.5, color: MUTED, whiteSpace: 'nowrap', fontFamily: MONO }}>{s.time}</td>
                    <td style={{ padding: '10px 8px', fontSize: 13, color: '#111', fontWeight: 600, wordBreak: 'keep-all' }}>{s.cls}</td>
                    <td style={{ padding: '10px 16px', fontSize: 12.5, color: MUTED, whiteSpace: 'nowrap', textAlign: 'right' }}>{s.host}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 12, lineHeight: 1.6, wordBreak: 'keep-all' }}>
          * 강사·시간표는 현장 사정에 따라 일부 변경될 수 있습니다. 클래스 예약 방법은 예약 완료 후 별도 안내드립니다.
        </p>
      </div>

      {/* 요금 */}
      <div style={wrap}>
        <Eyebrow>PRICING</Eyebrow>
        <H>참가 요금</H>

        {/* 밸류 스택 — 참가비에 포함되는 것 */}
        <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: 14, padding: isMobile ? '20px 18px' : '24px', marginBottom: isMobile ? 12 : 14 }}>
          <div style={{ fontSize: isMobile ? 16 : 17, fontWeight: 700, color: GREEN_DK, marginBottom: 5 }}>참가비에 다 들어있어요</div>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 16, lineHeight: 1.6, wordBreak: 'keep-all' }}>
            {rgMode
              ? <>낭만기버 캠핑존 2박 3일 기준, 아래가 전부 포함돼요. <span style={{ color: '#6b7280' }}>(2인 기준)</span></>
              : <>2박 3일 기준 <b style={{ color: GREEN }}>1인 하루 약 22,500원</b>이면 아래가 전부 포함돼요. <span style={{ color: '#6b7280' }}>(2인 기준)</span></>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: isMobile ? '9px' : '10px 18px' }}>
            {['사이트 이용', '웰컴키트 (굿즈)', '인디밴드 4팀·이박사 공연', '야외 영화제 관람', '오프리쉬 5존 · 무료 체험 부스', '별자리 관찰존'].map((x) => (
              <div key={x} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#374151', wordBreak: 'keep-all' }}>
                <Check size={16} color={GREEN} strokeWidth={2.75} style={{ flexShrink: 0 }} /> {x}
              </div>
            ))}
          </div>
        </div>

        {rgMode ? (
          <div style={{ ...cardBase, padding: isMobile ? '24px 20px' : '28px 24px', maxWidth: 460, margin: '0 auto' }}>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 8, letterSpacing: '0.04em', fontWeight: 600, textAlign: 'center' }}>낭만기버 캠핑존 (VIP)</div>
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <span style={{ fontFamily: BEBAS, fontSize: 34, color: GREEN }}>155,000원</span>
              <span style={{ fontSize: 12, color: MUTED }}> / 2박3일 · 2인</span>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['울산바위 뷰 전용 캠핑존', '8×8m 사이트', '무대·푸드존 인접', '캠핑 사이트 18면'].map((x) => (
                <div key={x} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#374151', wordBreak: 'keep-all' }}>
                  <Check size={16} color={GREEN} strokeWidth={2.75} style={{ flexShrink: 0 }} /> {x}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: isMobile ? 12 : 14 }}>
              {fees.map((f) => (
                <div key={f.label} style={{ ...cardBase, padding: isMobile ? '20px 18px' : '24px 20px' }}>
                  <div style={{ fontSize: 12, color: MUTED, marginBottom: 8, letterSpacing: '0.04em', fontWeight: 600, textAlign: 'center' }}>{f.label}</div>
                  <div style={{ marginBottom: 14, textAlign: 'center' }}>
                    <span style={{ fontFamily: BEBAS, fontSize: 30, color: GREEN }}>{f.price}</span>
                    <span style={{ fontSize: 12, color: MUTED }}> {f.unit}</span>
                  </div>
                  <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {f.tiers.map((t) => (
                      <div key={t} style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.4, textAlign: f.tiers.length > 1 ? 'left' : 'center' }}>{t}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: isMobile ? '12px 14px' : '14px 18px', marginTop: 16, textAlign: 'center' }}>
              <span style={{ fontSize: isMobile ? 13.5 : 14.5, color: '#92400e', fontWeight: 700, wordBreak: 'keep-all', lineHeight: 1.6 }}>
                모든 캠핑 사이트는 <b style={{ color: WARM }}>넉넉한 10×10m 대형 규격</b> — 보통 6~8m인 일반 캠핑 축제보다 넓어, 텐트·타프에 반려견 공간까지 여유로워요.
              </span>
            </div>
          </>
        )}
        <p style={{ textAlign: 'center', fontSize: isMobile ? 14 : 15, color: GREEN_DK, fontWeight: 700, marginTop: 18, lineHeight: 1.65, wordBreak: 'keep-all' }}>
          쏟아지는 별, 반려견과의 첫 캠핑, 캠프파이어의 밤 —<br />값을 매길 수 없는 사흘이 기다려요.
        </p>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 12, lineHeight: 1.7 }}>
          {rgMode ? (
            <>
              * 낭만기버 캠핑존 요금은 <b style={{ color: '#6b7280' }}>2박 3일 · 기본 2인</b> 기준. 추가 인원 <b style={{ color: '#6b7280' }}>1인당 +30,000원</b> · 반려견 <b style={{ color: '#6b7280' }}>1마리 무료</b>, 2마리부터 <b style={{ color: '#6b7280' }}>1두당 +10,000원</b>.<br />
              * 웰니스 클래스는 <b style={{ color: '#6b7280' }}>1개당 15,000원</b> (선택).<br />
              * 원하는 자리는 아래 예약 화면에서 선택하세요.
            </>
          ) : (
            <>
              * <b style={{ color: '#6b7280' }}>당일권 20,000원 / 1인</b> — 숙박·웰컴키트 없이 프로그램만 이용.<br />
              * 사이트 요금은 <b style={{ color: '#6b7280' }}>2박 3일 · 기본 2인</b> 기준. 추가 인원 <b style={{ color: '#6b7280' }}>1인당 +40,000원</b> · 반려견 <b style={{ color: '#6b7280' }}>1마리 무료</b>, 2마리부터 <b style={{ color: '#6b7280' }}>1두당 +10,000원</b>.<br />
              * 정확한 잔여석·자리 선택은 아래 예약 화면에서 확인하세요.
            </>
          )}
        </p>
      </div>

      {/* 이용 안내 */}
      <div style={wrap}>
        <Eyebrow>INFORMATION</Eyebrow>
        <H>오기 전에 확인하세요</H>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: isMobile ? 12 : 14 }}>
          {[
            { Icon: MapPin, t: '장소', d: '강원 고성군 토성면 잼버리로 244\n세계잼버리 수련장 · 주차 가능' },
            { Icon: Backpack, t: '준비물', d: '캠핑 장비·개인 방한용품\n(장비 미보유 시 텐트 렌탈·당일권)\n반려견 동반 시 목줄·배변봉투·물그릇\n⚡ 전 사이트 전기 사용 불가 — 보조배터리·파워뱅크 필수' },
            { Icon: PawPrint, t: '반려견 동반 안내', d: '리드줄 필수 · 배변 처리\n기본 예방접종 권장 · 맹견 동반 사전 문의' },
          ].map((x) => (
            <div key={x.t} style={{ ...cardBase, padding: isMobile ? '20px 18px' : '22px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <x.Icon size={18} color={GREEN} strokeWidth={1.9} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{x.t}</span>
              </div>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.75, whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>{x.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 장비 렌탈 — 텐트 없어도 몸만 오면 OK */}
      <div style={wrap}>
        <Eyebrow>GEAR RENTAL</Eyebrow>
        <H>장비 없이 가볍게 오세요</H>
        <p style={{ fontSize: isMobile ? 14 : 15, color: MUTED, lineHeight: 1.7, margin: '-4px 0 18px', wordBreak: 'keep-all' }}>
          텐트·캠핑 장비가 없어도 괜찮아요. <b style={{ color: '#374151' }}>몸만 오셔도 됩니다</b> — 필요한 장비만 골라 대여하세요. 설치가 간편한 <b style={{ color: '#374151' }}>에어텐트</b>부터 기본 장비 세트까지, 네이버 스토어에서 바로 신청할 수 있어요.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: isMobile ? 12 : 14 }}>
          {rentals.map((r) => (
            <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" style={{ ...cardBase, overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: r.grad, height: 92, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Tent size={34} color="#fff" strokeWidth={1.8} />
                <span style={{ position: 'absolute', top: 10, left: 12, background: 'rgba(255,255,255,0.92)', color: '#111', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 9999 }}>{r.badge}</span>
              </div>
              <div style={{ padding: isMobile ? '15px 16px 16px' : '18px 18px 18px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>{r.name}</div>
                <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.65, margin: 0, wordBreak: 'keep-all', flex: 1 }}>{r.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 2 }}>
                  <span style={{ fontSize: 12, color: GREEN, fontWeight: 700, whiteSpace: 'nowrap' }}>네이버 스토어에서 신청 →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 12, lineHeight: 1.6, wordBreak: 'keep-all' }}>
          * 대여 품목·요금·수령 및 반납 방법은 업체(네이버 스토어) 안내를 따릅니다. 신청 전 상세 페이지에서 확인해 주세요.
        </p>
      </div>

      {/* 근처 사우나·온천 — 잼버리 야외샤워실은 찬물만 나옴 */}
      <div style={wrap}>
        <Eyebrow>HOT SHOWER</Eyebrow>
        <H>따뜻하게 씻고 싶다면</H>
        <p style={{ fontSize: isMobile ? 14 : 15, color: MUTED, lineHeight: 1.7, margin: '-4px 0 18px', wordBreak: 'keep-all' }}>
          <b style={{ color: '#374151' }}>따뜻하게 씻는 건</b> 차로 가까운 사우나·온천에서 해결하세요. (잼버리장 야외 샤워실은 찬물만 나옵니다.)
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: isMobile ? 12 : 14 }}>
          {saunas.filter((s) => !('onsite' in s && s.onsite)).map((s) => {
            const onsite = 'onsite' in s && s.onsite;
            const cardStyle: React.CSSProperties = { ...cardBase, overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', border: onsite ? `2px solid ${GREEN}` : cardBase.border };
            const inner = (
              <>
                <div style={{ background: s.grad, height: 92, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <s.Icon size={34} color="#fff" strokeWidth={1.8} />
                  <span style={{ position: 'absolute', top: 10, left: 12, background: 'rgba(255,255,255,0.92)', color: '#111', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 9999 }}>{s.badge}</span>
                </div>
                <div style={{ padding: isMobile ? '15px 16px 16px' : '18px 18px 18px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>{s.name}</div>
                  <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.65, margin: 0, wordBreak: 'keep-all', flex: 1 }}>{s.benefit}</p>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12.5, color: '#374151' }}>
                    <MapPin size={14} color={GREEN} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ wordBreak: 'keep-all' }}>{s.addr}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderTop: '1px solid #f0f0f0', paddingTop: 10, marginTop: 2 }}>
                    <span style={{ fontSize: 12, color: GREEN_DK, fontWeight: 700, wordBreak: 'keep-all' }}>{onsite ? s.dist : `${s.dist} · ${s.tel}`}</span>
                    <span style={{ fontSize: 12, color: GREEN, fontWeight: 700, whiteSpace: 'nowrap' }}>{onsite ? '행사장 내 이용' : '공식 페이지 →'}</span>
                  </div>
                </div>
              </>
            );
            return onsite
              ? <div key={s.name} style={cardStyle}>{inner}</div>
              : <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" style={cardStyle}>{inner}</a>;
          })}
        </div>
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 12, lineHeight: 1.6, wordBreak: 'keep-all' }}>
          * 운영시간·요금·정기휴무는 시설 사정에 따라 달라질 수 있어요. 방문 전 각 시설로 확인해 주세요.
        </p>
      </div>

      {/* FAQ — 아코디언 */}
      <div style={{ marginBottom: isMobile ? 8 : 16 }}>
        <Eyebrow>FAQ</Eyebrow>
        <H>자주 묻는 질문</H>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q} style={{ ...cardBase, borderColor: open ? '#bbf7d0' : '#e8e8e8', overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(open ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: isMobile ? '16px 18px' : '18px 22px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: MONO }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111', wordBreak: 'keep-all' }}>{f.q}</span>
                  <ChevronDown size={18} color={open ? GREEN : '#6b7280'} strokeWidth={2} style={{ flexShrink: 0, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
                </button>
                {open && (
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.75, wordBreak: 'keep-all', padding: isMobile ? '0 18px 18px' : '0 22px 20px', margin: 0 }}>{f.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <SponsorMarquee />

    </div>
  );
}
