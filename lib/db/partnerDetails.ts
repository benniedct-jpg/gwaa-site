import { PartnerDetail } from '@/types';

// order 번호 → 상세 데이터
export const PARTNER_DETAILS: Record<number, PartnerDetail> = {

  // ── 1. 세인트존스호텔 (stay) ─────────────────────────────────────
  1: {
    templateType: 'stay',
    tagline: '메이트쉽 특별 요금',
    description: '메이트쉽 회원만을 위한 특별한 가격으로 세인트존스의 프리미엄 객실을 만나보세요.',
    validPeriod: '2026. 04. 01 – 06. 30 · 세금 포함 · 1박 기준',
    originalPrice: '180,000원~',
    memberPrice: '85,000원~',
    discountRate: '최대 53% 이상 할인',
    priceRows: [
      { label: '슈페리어 더블 / 할리우드', sublabel: '오션뷰 ✕ · 기준 2인', memberPrice: '85,000원', badge: '최대 53% OFF' },
      { label: '슈페리어 트윈',             sublabel: '오션뷰 ✕ · 기준 2인', memberPrice: '95,000원', badge: '최대 52% OFF' },
      { label: '슈페리어 패밀리 트윈',      sublabel: '오션뷰 ✕ · 최대 4인', memberPrice: '110,000원', badge: '최대 50% OFF' },
      { label: '골드 파셜 더블 / 트윈',    sublabel: '반 오션뷰 · 기준 2인', memberPrice: '120,000원', badge: '최대 48% OFF' },
      { label: '골드 파셜 패밀리 트윈',    sublabel: '반 오션뷰 · 최대 4인', memberPrice: '135,000원', badge: '최대 47% OFF' },
      { label: '골드 오션 더블 / 트윈',    sublabel: '오션뷰 · 7~11층',      memberPrice: '150,000원', badge: '최대 46% OFF' },
      { label: '이그제큐티브 오션',         sublabel: '오션뷰 · 12~15층',     memberPrice: '170,000원', badge: '최대 44% OFF' },
      { label: 'EFL 라운지',               sublabel: '라운지 이용 포함',      memberPrice: '200,000원', badge: '최대 42% OFF' },
      { label: '펫룸 더블 / 트윈',         sublabel: '반려견 동반 · 오션뷰 ✕', memberPrice: '130,000원', badge: '최대 40% OFF' },
    ],
    petInfo: {
      amenities: ['반려견 침구, 식기, 수건', '배변 패드, 화장실', '반려견 전용 샴푸', '펫 전용 풀장 무료 이용'],
      rules: ['최대 2마리 동반 가능', '추가 반려견 1마리당 35,000원/박', '맹견은 입마개 필수, 시설 이용 시 케이지 필요'],
    },
    facilities: [
      {
        icon: '🍽️', name: '조식 뷔페',
        rows: [
          { label: '현장 성인',          price: '49,000원' },
          { label: '사전구매 주말',      price: '35,000원' },
          { label: '사전구매 평일 2인',  price: '39,000원 → 29,400원' },
        ],
      },
      {
        icon: '🏊', name: '인피니티 풀',
        rows: [
          { label: '현장 성인',    price: '35,000원' },
          { label: '사전구매 성인', price: '30,000원' },
          { label: '현장 소인',    price: '20,000원' },
          { label: '사전구매 소인', price: '15,000원' },
        ],
      },
      {
        icon: '♨️', name: '사우나',
        rows: [
          { label: '성인', price: '11,000원' },
          { label: '소인', price: '7,000원' },
        ],
      },
    ],
    infoSections: [
      {
        title: '체크인 / 체크아웃',
        items: [
          '비수기 평일 체크인 15:00 / 주말·공휴일 16:00',
          '체크아웃 11:00',
          '얼리·레이트 체크인 22,000원/시간',
        ],
      },
      {
        title: '추가 요금',
        items: [
          '추가 침구 22,000원 / 추가 베드 44,000원',
          '추가 주차(2대째~) 10,000원',
          '피트니스, 생수 2병, Wi-Fi, 주차 1대 무료 포함',
        ],
      },
      {
        title: '취소·환불',
        items: [
          '비수기: 3일 전 100% / 2일 전 70% / 1일 전 50% / 당일 환불 불가',
          '성수기: 7일 전 100% / 5~6일 전 70% / 3~4일 전 50% / 2일 전~노쇼 환불 불가',
          '성수기 기간: 4/30~5/4, 5/23~24, 6/2~13',
        ],
      },
    ],
    cta: { label: '카카오채널로 예약 문의하기 →', url: 'https://pf.kakao.com/_wipZX' },
  },

  // ── 2. 피닉스파크 리조트 (stay) ──────────────────────────────────
  2: {
    templateType: 'stay',
    tagline: '메이트쉽 회원 특별가',
    description: '평창 피닉스파크에서 반려동물과 함께하는 프리미엄 리조트 라이프. 메이트쉽 회원만의 특별 요금을 누리세요.',
    memberPrice: '회원가 적용',
    discountRate: '회원 할인',
    infoSections: [
      { title: '이용 안내', items: ['상세 요금 및 예약은 카카오채널로 문의해 주세요.', '반려동물 동반 객실 별도 운영'] },
    ],
    cta: { label: '혜택 문의하기 →', url: 'https://pf.kakao.com/_wipZX' },
  },

  // ── 3. 퍼피파크 애견카페 (service) ───────────────────────────────
  3: {
    templateType: 'service',
    tagline: '메이트쉽 회원 30% 할인',
    description: '원주 퍼피파크에서 반려동물과 함께하는 특별한 카페 타임. 메이트쉽 회원은 모든 메뉴 30% 할인.',
    discountRate: '30% 할인',
    infoSections: [
      { title: '이용 안내', items: ['메이트쉽 회원 카드 제시 시 할인 적용', '반려동물 동반 필수'] },
    ],
    cta: { label: '혜택 문의하기 →', url: 'https://pf.kakao.com/_wipZX' },
  },

  // ── 4. 죽도해변 반려견 캠핑장 (stay) ─────────────────────────────
  4: {
    templateType: 'stay',
    tagline: '메이트쉽 회원 30% 할인',
    description: '양양 죽도해변에서 반려견과 함께하는 해변 캠핑. 메이트쉽 회원은 30% 할인된 가격으로 이용하실 수 있습니다.',
    discountRate: '30% 할인',
    infoSections: [
      { title: '이용 안내', items: ['메이트쉽 회원 카드 제시 시 할인 적용', '반려견 동반 캠핑 사이트 운영'] },
    ],
    cta: { label: '혜택 문의하기 →', url: 'https://pf.kakao.com/_wipZX' },
  },

  // ── 5. 반려동물 테마파크 (service) ───────────────────────────────
  5: {
    templateType: 'service',
    tagline: '메이트쉽 회원 할인',
    description: '홍천 반려동물 테마파크에서 반려동물과 함께하는 특별한 하루. 메이트쉽 회원 전용 할인가로 이용하세요.',
    infoSections: [
      { title: '이용 안내', items: ['상세 요금 및 예약은 카카오채널로 문의해 주세요.'] },
    ],
    cta: { label: '혜택 문의하기 →', url: 'https://pf.kakao.com/_wipZX' },
  },

  // ── 6. 삼성동 예한의원 (service) ─────────────────────────────────
  6: {
    templateType: 'service',
    tagline: '메이트쉽 회원 할인',
    description: '서울 삼성동 예한의원에서 메이트쉽 회원 전용 할인 혜택을 누리세요.',
    infoSections: [
      { title: '이용 안내', items: ['메이트쉽 회원 카드 제시 시 할인 적용', '자세한 내용은 카카오채널로 문의해 주세요.'] },
    ],
    cta: { label: '혜택 문의하기 →', url: 'https://pf.kakao.com/_wipZX' },
  },

  // ── 7. 인터불고 호텔 (stay) ───────────────────────────────────────
  7: {
    templateType: 'stay',
    tagline: '메이트쉽 특별회원가',
    description: '원주 인터불고 호텔에서 메이트쉽 회원만을 위한 특별 요금으로 프리미엄 숙박을 경험하세요.',
    discountRate: '특별회원가',
    infoSections: [
      { title: '이용 안내', items: ['상세 요금 및 예약은 카카오채널로 문의해 주세요.'] },
    ],
    cta: { label: '혜택 문의하기 →', url: 'https://pf.kakao.com/_wipZX' },
  },

  // ── 8. 인섹트도그 (brand) ─────────────────────────────────────────
  8: {
    templateType: 'brand',
    tagline: '메이트쉽 회원 전용가',
    description: '곤충 단백질 기반 프리미엄 반려견 사료 인섹트도그. 메이트쉽 회원은 회원 전용가로 구매하세요.',
    howToUse: ['메이트쉽 회원 번호 제시 시 전용 할인가 자동 적용', '온라인 스토어 또는 파트너 매장 이용 가능'],
    cta: { label: '회원 할인 받기 →', url: 'https://pf.kakao.com/_wipZX' },
  },

  // ── 9. 배기도그 (brand) ───────────────────────────────────────────
  9: {
    templateType: 'brand',
    tagline: '메이트쉽 회원 전용가',
    description: '배기도그 프리미엄 반려견 사료. 메이트쉽 회원은 회원 전용가로 구매하세요.',
    howToUse: ['메이트쉽 회원 번호 제시 시 전용 할인가 자동 적용'],
    cta: { label: '회원 할인 받기 →', url: 'https://pf.kakao.com/_wipZX' },
  },

  // ── 10. 요세라독 (brand) ──────────────────────────────────────────
  10: {
    templateType: 'brand',
    tagline: '메이트쉽 회원 전용가',
    description: '요세라독 반려견 케어 브랜드. 메이트쉽 회원 전용가로 프리미엄 제품을 만나보세요.',
    howToUse: ['메이트쉽 회원 번호 제시 시 전용 할인가 자동 적용'],
    cta: { label: '회원 할인 받기 →', url: 'https://pf.kakao.com/_wipZX' },
  },

  // ── 11. 요세라캣 (brand) ──────────────────────────────────────────
  11: {
    templateType: 'brand',
    tagline: '메이트쉽 회원 전용가',
    description: '요세라캣 반려묘 케어 브랜드. 메이트쉽 회원 전용가로 프리미엄 제품을 만나보세요.',
    howToUse: ['메이트쉽 회원 번호 제시 시 전용 할인가 자동 적용'],
    cta: { label: '회원 할인 받기 →', url: 'https://pf.kakao.com/_wipZX' },
  },

  // ── 12. 레오나르도 (service) ──────────────────────────────────────
  12: {
    templateType: 'service',
    tagline: '메이트쉽 회원 할인',
    description: '레오나르도에서 메이트쉽 회원 전용 할인 혜택을 누리세요.',
    infoSections: [
      { title: '이용 안내', items: ['메이트쉽 회원 카드 제시 시 할인 적용', '자세한 내용은 카카오채널로 문의해 주세요.'] },
    ],
    cta: { label: '혜택 문의하기 →', url: 'https://pf.kakao.com/_wipZX' },
  },

  // ── 13. 베지독 (brand) ────────────────────────────────────────────
  13: {
    templateType: 'brand',
    tagline: '메이트쉽 회원 전용가',
    description: '채식 기반 프리미엄 반려견 사료 베지독. 메이트쉽 회원은 회원 전용가로 구매하세요.',
    howToUse: ['메이트쉽 회원 번호 제시 시 전용 할인가 자동 적용'],
    cta: { label: '회원 할인 받기 →', url: 'https://pf.kakao.com/_wipZX' },
  },

  // ── 14. 나투어리베 (brand) ────────────────────────────────────────
  14: {
    templateType: 'brand',
    tagline: '메이트쉽 회원 전용가',
    description: '나투어리베 반려동물 케어 브랜드. 메이트쉽 회원 전용가로 프리미엄 제품을 만나보세요.',
    howToUse: ['메이트쉽 회원 번호 제시 시 전용 할인가 자동 적용'],
    cta: { label: '회원 할인 받기 →', url: 'https://pf.kakao.com/_wipZX' },
  },
};
