// 댕댕이 강원 여행 유형 테스트 — 질문·결과 데이터
// 3개 축(활동량 · 풍경 · 사교성) × 2 = 8가지 유형. 코드 3글자: [A|C][S|M][P|Q]
//  A 활발 / C 느긋   ·   S 바다 / M 산·숲   ·   P 인싸(행사) / Q 단짝(조용히)

export type Axis = 'energy' | 'scene' | 'social';
export type Letter = 'A' | 'C' | 'S' | 'M' | 'P' | 'Q';

export interface Question {
  axis: Axis;
  text: string;
  options: [{ label: string; letter: Letter }, { label: string; letter: Letter }];
}

export const QUESTIONS: Question[] = [
  {
    axis: 'energy',
    text: '현관에서 목줄 소리가 났다! 우리 아이는?',
    options: [
      { label: '이미 문 앞에서 빙글빙글 돌고 있다', letter: 'A' },
      { label: '기지개 한 번 켜고 천천히 걸어 나온다', letter: 'C' },
    ],
  },
  {
    axis: 'scene',
    text: '차 창문을 내렸을 때 더 신나 하는 냄새는?',
    options: [
      { label: '짭조름한 바닷바람', letter: 'S' },
      { label: '촉촉한 흙과 풀 냄새', letter: 'M' },
    ],
  },
  {
    axis: 'social',
    text: '산책길에서 처음 보는 강아지를 만나면?',
    options: [
      { label: '꼬리부터 흔들며 먼저 인사하러 간다', letter: 'P' },
      { label: '내 뒤로 살짝 숨거나 모른 척 지나간다', letter: 'Q' },
    ],
  },
  {
    axis: 'energy',
    text: '1시간 산책을 마치고 집에 돌아오면?',
    options: [
      { label: '장난감을 물고 와서 2차전을 요구한다', letter: 'A' },
      { label: '물 마시고 바로 꿀잠 모드', letter: 'C' },
    ],
  },
  {
    axis: 'scene',
    text: '여행지에서 우리 아이가 더 좋아할 순간은?',
    options: [
      { label: '모래사장을 마음껏 파헤치는 시간', letter: 'S' },
      { label: '낙엽 쌓인 숲길을 킁킁대며 걷는 시간', letter: 'M' },
    ],
  },
  {
    axis: 'social',
    text: '사람이 북적이는 축제 현장에 도착했다면?',
    options: [
      { label: '여기저기 구경하느라 신이 난다', letter: 'P' },
      { label: '한적한 구석 자리부터 찾는다', letter: 'Q' },
    ],
  },
];

export interface TravelType {
  code: string;
  emoji: string;
  name: string;
  tagline: string;
  desc: string;
  course: string;   // 어울리는 강원 여행 스타일
  tips: string[];
  match: string;    // 잘 맞는 유형 코드
  cta: { label: string; href: string };
}

export const TYPES: Record<string, TravelType> = {
  ASP: {
    code: 'ASP', emoji: '🏄', name: '파도타기 인싸견',
    tagline: '해변의 분위기 메이커',
    desc: '에너지도 넘치고 친구도 좋아하는 타입. 사람 많고 탁 트인 곳에서 가장 빛나요. 새로운 친구를 만날수록 더 신이 납니다.',
    course: '동해안 해변 산책 + 반려견 동반 축제',
    tips: ['긴 리드줄과 여벌 수건은 필수', '흥분하기 쉬우니 중간중간 물 마시는 시간을 챙겨 주세요'],
    match: 'CSP',
    cta: { label: '함께 갈 행사 보기', href: '/events' },
  },
  ASQ: {
    code: 'ASQ', emoji: '🌊', name: '새벽 바다 러너',
    tagline: '우리 둘만의 해변을 달린다',
    desc: '체력은 넘치지만 낯선 친구는 조금 부담스러운 타입. 사람 없는 이른 아침, 보호자와 단둘이 달리는 시간이 최고의 행복이에요.',
    course: '이른 아침 한적한 해변 달리기 + 조용한 숙소',
    tips: ['붐비는 시간대를 피해 일정을 잡아 보세요', '모래 묻은 발을 닦을 물티슈를 챙기면 좋아요'],
    match: 'CSQ',
    cta: { label: '강원 여행 가이드 보기', href: '/travel' },
  },
  AMP: {
    code: 'AMP', emoji: '⛺', name: '캠핑장 반장견',
    tagline: '숲속 모임의 중심',
    desc: '뛰어놀 숲도 좋고, 옆 텐트 친구도 궁금한 타입. 여럿이 함께하는 캠핑·트레킹 행사에서 금세 반장이 됩니다.',
    course: '반려견 동반 캠핑 · 단체 트레킹',
    tips: ['캠핑장에서는 긴 줄보다 고정 가능한 리드줄이 편해요', '진드기 예방을 미리 챙겨 주세요'],
    match: 'CMP',
    cta: { label: '캠핑·트레킹 행사 보기', href: '/events' },
  },
  AMQ: {
    code: 'AMQ', emoji: '🥾', name: '숲길 탐험대장',
    tagline: '조용한 숲을 끝까지 걷는다',
    desc: '냄새 맡을 것이 가득한 숲길을 보호자와 묵묵히 걷는 걸 좋아해요. 사람 많은 곳보다 한적한 트레킹 코스가 잘 맞습니다.',
    course: '한적한 숲길·계곡 트레킹',
    tips: ['코스가 길다면 휴대용 물그릇을 꼭 챙기세요', '산책 후 발바닥과 털 사이를 확인해 주세요'],
    match: 'CMQ',
    cta: { label: '강원 여행 가이드 보기', href: '/travel' },
  },
  CSP: {
    code: 'CSP', emoji: '☕', name: '오션뷰 카페 마스코트',
    tagline: '앉아만 있어도 인기 폭발',
    desc: '뛰는 것보다 사람 구경이 더 좋은 타입. 바다가 보이는 테라스에 앉아 있으면 지나가는 사람마다 인사를 건네요.',
    course: '바다 전망 카페 투어 + 가벼운 해변 산책',
    tips: ['반려견 동반 가능 여부는 방문 전에 꼭 확인하세요', '오래 앉아 있을 땐 방석이 있으면 편해요'],
    match: 'ASP',
    cta: { label: '제휴 카페·숙소 혜택 보기', href: '/mateship#benefits' },
  },
  CSQ: {
    code: 'CSQ', emoji: '🌅', name: '노을 감상가',
    tagline: '파도 소리 들으며 멍 때리기',
    desc: '조용한 바닷가에서 보호자 옆에 딱 붙어 쉬는 게 가장 좋은 타입. 일정은 느슨하게, 쉬는 시간은 넉넉하게 잡아 주세요.',
    course: '한적한 바닷가 숙소에서 쉬어 가는 여행',
    tips: ['이동 시간이 짧은 일정이 잘 맞아요', '익숙한 담요를 챙기면 낯선 숙소에서도 편히 쉬어요'],
    match: 'ASQ',
    cta: { label: '제휴 숙소 혜택 보기', href: '/mateship#benefits' },
  },
  CMP: {
    code: 'CMP', emoji: '🌿', name: '숲속 피크닉 인기견',
    tagline: '돗자리 위의 사교왕',
    desc: '뛰어다니진 않아도 친구들 사이에 있는 걸 좋아하는 타입. 잔디밭 피크닉이나 소규모 모임에서 편안해해요.',
    course: '잔디 공원 피크닉 · 소규모 클래스와 모임',
    tips: ['그늘 자리를 먼저 확보해 주세요', '간식은 다른 친구들과 나눠도 되는지 보호자에게 먼저 물어보세요'],
    match: 'AMP',
    cta: { label: '교육·클래스 보기', href: '/education' },
  },
  CMQ: {
    code: 'CMQ', emoji: '🍃', name: '산바람 힐링러',
    tagline: '고요한 숲에서 충전 중',
    desc: '조용하고 익숙한 리듬을 좋아하는 타입. 숲속 독채에서 보호자와 느긋하게 보내는 하루가 최고의 여행입니다.',
    course: '숲속 숙소에서 보내는 조용한 휴식',
    tips: ['낯선 곳에서는 적응 시간을 충분히 주세요', '짧은 산책을 여러 번 나누는 편이 좋아요'],
    match: 'AMQ',
    cta: { label: '강원 여행 가이드 보기', href: '/travel' },
  },
};

export const TYPE_CODES = Object.keys(TYPES);

/** 답변(글자 배열) → 유형 코드. 축마다 더 많이 고른 쪽, 동점이면 앞 글자. */
export function resolveType(answers: Letter[]): string {
  const n = (l: Letter) => answers.filter((a) => a === l).length;
  const pick = (a: Letter, b: Letter) => (n(a) >= n(b) ? a : b);
  return `${pick('A', 'C')}${pick('S', 'M')}${pick('P', 'Q')}`;
}

export function getType(code: string | undefined | null): TravelType | null {
  const key = (code || '').toUpperCase();
  return Object.prototype.hasOwnProperty.call(TYPES, key) ? TYPES[key] : null;
}
