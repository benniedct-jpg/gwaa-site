import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '강원 반려동물 응급 가이드 — 야간·24시 동물병원 | GWAA 강원도반려동물협회',
  description:
    '강원도 반려동물 응급 가이드. 심야 응급 거점(춘천·원주)과 권역별 이동 길잡이, 지금 바로 병원에 가야 하는 증상, 위험 음식·중독 대처, 상황별 응급처치 12가지.',
  keywords: ['강원 24시 동물병원', '춘천 반려동물 응급의료센터', '원주 24시 동물병원', '강릉 야간 동물병원', '강아지 응급처치', '강아지 중독 음식'],
};

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const TEAL = '#12A79D';
const TEAL_DK = '#0D7E76';
const RED = '#dc2626';
const RED_BG = '#fef2f2';
const RED_BD = '#fecaca';

/* ── 심야 응급 거점 (최종 확인 2026. 10. · 공개 자료 교차검증 — 방문 전 전화 필수) ── */
const NIGHT_HOSPITALS = [
  {
    region: '춘천',
    name: '강원대학교 수의과대학 부속동물병원 반려동물 응급의료센터',
    phone: '033-250-8206',
    hours: '월~토 21:00 ~ 익일 09:00 · 일요일 24시간',
    notes: ['춘천시 협력 공공 응급의료센터 — 강원 영서 북부의 심야 응급 1순위', '춘천시민 진료비 일부 할인', '수의과대학 부속이라 중증·수술 대응력이 높아요'],
    official: true,
  },
  {
    region: '원주',
    name: '원주24시스카이동물메디컬센터',
    phone: '033-813-9975',
    hours: '24시 운영 표방 (원주시 등록 동물병원)',
    notes: ['강원 영서 남부의 심야 거점 — 심야 응급 수용 여부는 출발 전 전화로 확인', '원주시 서원대로 502 (단구동 골드프라자)'],
    official: false,
  },
];

const DAY_EXTENDED = [
  {
    region: '강릉',
    name: '보듬동물병원',
    phone: '033-655-7975',
    hours: '09:00 ~ 21:00 · 19시 이후 전화 예약 필수 · 야간 진료비 추가',
    note: '간판에 24시가 있지만 심야 상주 체계는 아니에요 — 밤 9시 이후는 반드시 전화로 가능 여부 확인',
  },
];

/* ── 권역별 심야 길잡이 (이동 시간은 승용차 기준 대략치) ── */
const REGION_GUIDE: { area: string; first: string; detail: string }[] = [
  { area: '춘천 · 화천 · 양구 · 홍천 북부', first: '춘천 응급의료센터', detail: '033-250-8206 — 밤 9시 이후 강원 영서 북부의 유일한 상주 응급' },
  { area: '원주 · 횡성 · 영월 남부', first: '원주 스카이', detail: '033-813-9975 — 영서 남부 거점. 제천·충주권에서도 가장 가까운 축' },
  { area: '강릉 · 평창 · 정선', first: '21시 전엔 강릉 보듬 → 심야는 원주 또는 춘천', detail: '강릉에서 원주·춘천 모두 약 1시간 40분 — 전화 상담으로 이동 여부부터 판단하세요' },
  { area: '속초 · 양양 · 고성 · 인제', first: '심야 상주 병원 없음 → 춘천 응급의료센터', detail: '속초에서 춘천 약 1시간 30분(서울양양고속도로). 사전에 동네 병원의 야간 연락처를 받아두는 게 최선입니다' },
  { area: '동해 · 삼척 · 태백', first: '심야 상주 병원 없음 → 원주 스카이', detail: '약 1시간 40분~2시간 거리 — 강원에서 가장 취약한 권역이라 평소 대비가 특히 중요해요' },
];

/* ── 지금 바로 병원 — 레드 플래그 ── */
const RED_FLAGS = [
  '의식이 없거나 불러도 축 늘어져 있어요',
  '혀·잇몸이 보라색이거나 창백한 회색이에요',
  '입을 벌리고 괴로워하며 숨을 쉬어요 (호흡곤란)',
  '경련이 5분 이상 지속되거나 연달아 반복돼요',
  '배가 갑자기 빵빵해지고 헛구역질만 해요 (대형견 위염전 — 수 시간 내 치명적)',
  '소변을 보려고 애쓰는데 나오지 않아요 (특히 수컷 고양이)',
  '독성 음식·약·화학물질을 먹었거나 먹은 것 같아요',
  '차에 치였거나 높은 곳에서 떨어졌어요 (겉이 멀쩡해 보여도)',
  '안구가 돌출됐거나 눈을 심하게 다쳤어요',
  '출산 중 30분 이상 힘을 줘도 새끼가 나오지 않아요',
];

/* ── 위험 음식·물질 ── */
const TOXIC: { level: string; color: string; bg: string; items: { name: string; why: string }[] }[] = [
  {
    level: '극히 위험 — 소량도 즉시 병원',
    color: '#991b1b', bg: '#fef2f2',
    items: [
      { name: '자일리톨 (껌·치약·일부 땅콩버터)', why: '급성 저혈당·간부전. 몸무게 1kg당 껌 반 개도 위험' },
      { name: '포도 · 건포도', why: '급성 신부전 — 안전한 양이 밝혀져 있지 않음' },
      { name: '다크초콜릿 · 카카오 함량 높은 것', why: '테오브로민 중독. 다크 20g도 소형견엔 응급' },
      { name: '부동액 (에틸렌글리콜)', why: '단맛이 나서 핥기 쉬움 — 수 시간 내 신부전' },
      { name: '살서제(쥐약) · 농약', why: '출혈·신경 증상이 며칠 뒤 나타나기도 — 먹은 즉시 병원' },
      { name: '백합과 식물 (고양이)', why: '꽃가루·꽃병 물만으로도 고양이 신부전' },
    ],
  },
  {
    level: '위험 — 양·체중 따라 응급',
    color: '#9a3412', bg: '#fff7ed',
    items: [
      { name: '양파 · 마늘 · 파 (익혀도 동일)', why: '용혈성 빈혈 — 국물·볶음밥 섭취도 누적 위험' },
      { name: '마카다미아', why: '구토·고열·뒷다리 힘 빠짐' },
      { name: '알코올 · 카페인', why: '소량에도 심박 이상·신경 증상' },
      { name: '생 빵 반죽', why: '위에서 발효·팽창 + 알코올 생성' },
      { name: '밀크초콜릿 · 코코아 과자', why: '양에 따라 위험 — 먹은 양과 체중을 메모해 전화' },
      { name: '자두·복숭아 씨, 옥수수 심', why: '장폐색 — 수술이 필요할 수 있어요' },
    ],
  },
];

/* ── 상황별 응급 대처 ── */
const FIRST_AID: { title: string; emoji: string; dos: string[]; donts: string[] }[] = [
  {
    title: '위험한 걸 먹었어요 (중독)',
    emoji: '🍫',
    dos: [
      '무엇을 · 얼마나 · 언제 먹었는지 메모하고 포장지·남은 것을 챙기세요',
      '즉시 병원에 전화해 체중과 섭취량을 알리고 지시를 받으세요',
      '증상이 없어도 위 표의 "극히 위험" 항목이면 바로 병원으로 — 중독은 증상이 늦게 옵니다',
    ],
    donts: ['소금물·과산화수소·손가락으로 임의로 토하게 하지 마세요 (흡인성 폐렴 위험)', '우유·숯가루 등 민간요법으로 시간을 쓰지 마세요'],
  },
  {
    title: '목에 뭐가 걸렸어요 (이물·질식)',
    emoji: '🦴',
    dos: [
      '입을 열어 눈에 보이고 쉽게 잡히는 것만 조심히 제거',
      '호흡이 막힌 소형견은 뒷다리를 들어 거꾸로 세우고 어깨뼈 사이를 손바닥으로 4~5회 두드려 보세요',
      '실·바늘·꼬치를 삼켰다면 그대로 두고 병원으로 — 당기면 장이 찢어집니다',
    ],
    donts: ['보이지 않는 이물을 손가락으로 깊이 파내지 마세요 (더 밀려 들어갑니다)', '혀 밑에 실이 감겨 있으면 절대 자르거나 당기지 마세요'],
  },
  {
    title: '배가 갑자기 빵빵해요 (위염전 · 대형견 최응급)',
    emoji: '🚨',
    dos: [
      '식후 과격한 운동 뒤 배가 부풀고 헛구역질·침흘림·안절부절이면 위염전을 의심하세요',
      '망설일 시간이 없습니다 — 수술 가능한 병원(춘천 응급센터·원주 스카이)에 전화하며 바로 출발',
      '리트리버·셰퍼드 등 가슴 깊은 대형견 보호자는 이 증상을 꼭 기억해 두세요',
    ],
    donts: ['가스가 빠지길 기다리며 지켜보지 마세요 — 수 시간 내 쇼크로 진행합니다', '물이나 음식을 주지 마세요'],
  },
  {
    title: '헥헥거림이 멈추지 않아요 (열사병)',
    emoji: '🌡️',
    dos: [
      '그늘·실내로 옮기고 미지근한 물로 배·겨드랑이·발바닥을 적셔주세요',
      '선풍기 바람으로 서서히 체온을 내리며 병원에 전화 (직장 체온 40℃ 이상이면 응급)',
      '의식이 처지면 적신 수건으로 감싸고 바로 이동',
    ],
    donts: ['얼음물·얼음팩으로 급랭하지 마세요 (혈관 수축으로 오히려 악화)', '의식이 흐린 아이에게 억지로 물을 먹이지 마세요'],
  },
  {
    title: '갑자기 쓰러져 떨어요 (경련·발작)',
    emoji: '⚡',
    dos: [
      '부딪힐 물건을 치우고 조명을 줄이고 조용하게 — 만지지 말고 지켜보세요',
      '시작 시각을 확인하고 가능하면 영상을 찍으세요 (진단에 가장 큰 도움)',
      '끝난 뒤 멍한 상태가 정상입니다 — 안정 후 병원으로. 5분 이상 지속·반복되면 즉시 이동',
    ],
    donts: ['경련 중 입에 손·수건·물건을 넣지 마세요 (혀를 삼키지 않습니다)', '몸을 눌러 제압하지 마세요'],
  },
  {
    title: '피가 나요 / 떨어졌어요 (출혈·골절)',
    emoji: '🩹',
    dos: [
      '깨끗한 거즈·수건으로 출혈 부위를 5분 이상 지그시 압박 (중간에 떼서 확인하지 않기)',
      '골절 의심 부위는 만지지 말고 담요·수건으로 몸 전체를 감싸 고정해 이동',
      '잇몸이 하얗게 질리거나 배가 부풀면 보이지 않는 내부 출혈 — 즉시 병원',
    ],
    donts: ['지혈대를 임의로 세게 묶지 마세요', '어긋난 다리를 펴서 맞추려 하지 마세요'],
  },
  {
    title: '벌에 쏘였어요 / 뱀에 물렸어요',
    emoji: '🐝',
    dos: [
      '벌침이 보이면 카드 모서리로 긁어 제거하고 냉찜질',
      '얼굴·입 주변 부종, 구토, 호흡 이상이면 아나필락시스 — 즉시 병원',
      '뱀이라면 물린 부위를 심장보다 낮게, 최대한 움직이지 않게 안고 바로 이동 (뱀 사진이 있으면 치료에 도움)',
    ],
    donts: ['물린 부위를 입으로 빨거나 칼로 째지 마세요', '핀셋으로 벌침을 집지 마세요 (독주머니가 눌려 독이 더 들어갑니다)'],
  },
  {
    title: '어린 강아지가 축 처져요 (저혈당)',
    emoji: '🍼',
    dos: [
      '3개월 미만 소형 자견이 밥을 거르고 비틀거리면 저혈당 의심',
      '의식이 있으면 꿀이나 설탕물을 잇몸에 소량 발라주며 병원으로',
      '몸을 담요로 따뜻하게 감싸 체온을 지켜주세요',
    ],
    donts: ['의식이 없는 아이 입에 액체를 부어넣지 마세요 (기도로 넘어갑니다)'],
  },
  {
    title: '감전됐어요 / 데였어요 (감전·화상)',
    emoji: '🔌',
    dos: [
      '감전은 전원부터 차단 — 그 전엔 절대 맨손으로 만지지 마세요',
      '화상 부위는 흐르는 시원한 물로 10분 정도 식히고 깨끗한 천으로 덮어 이동',
      '전기 코드를 문 뒤에는 입안 화상·폐수종이 늦게 올 수 있어 멀쩡해 보여도 진료를 받으세요',
    ],
    donts: ['화상 부위에 연고·치약·기름을 바르지 마세요', '물집을 터뜨리지 마세요'],
  },
  {
    title: '물에 빠졌어요 (익수)',
    emoji: '🌊',
    dos: [
      '구조 후 머리를 몸보다 낮게 해 기도의 물이 빠지게 하세요',
      '호흡을 확인하고, 체온이 떨어지지 않게 수건으로 감싸 병원으로',
      '한 번 잘 놀았어도 몇 시간 뒤 이차 익수(폐수종)가 올 수 있어 당일 진료 권장',
    ],
    donts: ['배를 눌러 억지로 물을 토하게 하지 마세요'],
  },
  {
    title: '눈이 이상해요 (안구 손상)',
    emoji: '👁️',
    dos: [
      '눈을 비비지 못하게 넥카라를 씌우는 게 최우선',
      '안구가 돌출됐다면 생리식염수를 적신 거즈로 덮고 즉시 병원 (시간이 시력을 결정합니다)',
      '이물이 보여도 꺼내지 말고 그대로 병원으로',
    ],
    donts: ['사람용 안약을 임의로 넣지 마세요', '돌출된 안구를 밀어 넣으려 하지 마세요'],
  },
  {
    title: '구토·설사가 계속돼요',
    emoji: '🤢',
    dos: [
      '횟수·색(혈액·커피색·이물)을 기록하고 구토물 사진을 찍어두세요',
      '자견·노령견·소형견은 반나절만 지속돼도 탈수 위험 — 병원 상담',
      '피가 섞이거나 축 처지면 기다리지 말고 바로 병원',
    ],
    donts: ['하루 이상 굶기며 지켜보지 마세요', '사람 지사제·소화제를 먹이지 마세요'],
  },
];

/* ── 바이탈 정상 범위 ── */
const VITALS = [
  ['체온 (직장)', '38.0 ~ 39.2℃', '40℃ 이상 또는 37℃ 이하면 응급'],
  ['호흡수 (안정 시)', '성견 15~30회/분', '잠잘 때 40회 이상이면 심장·폐 점검'],
  ['심박수', '소형견 90~160 · 대형견 60~120회/분', '잇몸을 눌렀다 뗐을 때 2초 안에 분홍색 회복이 정상'],
];

export default function EmergencyPage() {
  return (
    <main style={{ fontFamily: MONO, background: '#f8fafb', minHeight: '100vh' }}>
      {/* 히어로 */}
      <section style={{ background: 'linear-gradient(160deg, #0D7E76, #12A79D)', color: '#fff', padding: '52px 20px 44px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.14em', fontWeight: 700, color: '#BFF3EC', marginBottom: 10 }}>EMERGENCY GUIDE</div>
          <h1 style={{ fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 800, lineHeight: 1.25, margin: 0, wordBreak: 'keep-all' }}>
            강원 반려동물 응급 가이드
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.92)', marginTop: 12, wordBreak: 'keep-all' }}>
            강원도의 심야 응급 체계는 춘천·원주 두 축입니다. 어느 지역에서든 가장 빠른 길을 안내할게요 —
            행사와 교육으로 강원을 다니는 강원도반려동물협회가 정리했습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginTop: 22 }}>
            {[
              ['1', '침착하게 상태 확인', '의식·호흡·잇몸 색을 보고 아래 응급 신호와 비교하세요'],
              ['2', '병원에 먼저 전화', '무작정 달려가지 말고 진료 가능 여부와 응급 지시를 받으세요'],
              ['3', '안전하게 이동', '담요로 감싸 안정시키고, 먹은 것·구토물·포장지를 챙기세요'],
            ].map(([n, t, d]) => (
              <div key={n} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}><span style={{ display: 'inline-flex', width: 22, height: 22, borderRadius: '50%', background: '#fff', color: TEAL_DK, alignItems: 'center', justifyContent: 'center', marginRight: 8, fontSize: 12 }}>{n}</span>{t}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, wordBreak: 'keep-all' }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '36px 20px 60px' }}>
        {/* 레드 플래그 */}
        <section>
          <div style={{ background: RED_BG, border: `1.5px solid ${RED_BD}`, borderRadius: 16, padding: '20px 22px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: RED, margin: '0 0 4px', wordBreak: 'keep-all' }}>🚨 이 중 하나라도 해당되면, 지금 바로 병원입니다</h2>
            <p style={{ fontSize: 12.5, color: '#7f1d1d', margin: '0 0 12px', lineHeight: 1.6 }}>아래 증상은 "지켜보기"가 통하지 않는 응급 신호예요. 전화하면서 동시에 출발하세요.</p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: '#450a0a', lineHeight: 1.95 }}>
              {RED_FLAGS.map((f) => <li key={f} style={{ wordBreak: 'keep-all' }}>{f}</li>)}
            </ul>
          </div>
        </section>

        {/* 심야 응급 거점 */}
        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 6, wordBreak: 'keep-all' }}>심야 응급 거점 — 강원엔 두 곳입니다</h2>
          <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7, marginBottom: 16, wordBreak: 'keep-all' }}>
            밤 9시 이후 상주 응급이 확인되는 곳은 춘천과 원주뿐이에요. 운영 사정은 수시로 바뀌니
            <b style={{ color: RED }}> 어떤 경우든 출발 전에 반드시 전화 확인</b>하세요. <span style={{ color: '#9ca3af' }}>(최종 확인 2026. 10.)</span>
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            {NIGHT_HOSPITALS.map((h) => (
              <div key={h.name} style={{ background: '#fff', border: h.official ? `1.5px solid ${TEAL}` : '1px solid #e5e7eb', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 9999, background: '#EDFAF8', color: TEAL_DK }}>{h.region}</span>
                  {h.official && <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 9999, background: TEAL, color: '#fff' }}>지자체 협력 응급센터</span>}
                  <span style={{ fontSize: 15.5, fontWeight: 800, color: '#111', wordBreak: 'keep-all' }}>{h.name}</span>
                </div>
                <div style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.7, fontWeight: 700 }}>🕐 {h.hours}</div>
                <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12.5, color: '#6b7280', lineHeight: 1.8 }}>
                  {h.notes.map((n) => <li key={n} style={{ wordBreak: 'keep-all' }}>{n}</li>)}
                </ul>
                <a href={`tel:${h.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '12px 22px', borderRadius: 10, background: TEAL_DK, color: '#fff', fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
                  📞 {h.phone} 전화하기
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 권역별 길잡이 */}
        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 6, wordBreak: 'keep-all' }}>우리 지역에선 어디로 가야 하나요?</h2>
          <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7, marginBottom: 16, wordBreak: 'keep-all' }}>
            심야 기준 권역별 1순위 경로입니다. 이동 시간이 1시간을 넘는 지역이라면, 먼저 전화 상담으로
            "지금 이동하는 게 맞는지"부터 확인하는 게 안전해요.
          </p>
          <div style={{ display: 'grid', gap: 10 }}>
            {REGION_GUIDE.map((r) => (
              <div key={r.area} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: TEAL_DK, marginBottom: 3 }}>{r.area}</div>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: '#111', marginBottom: 3, wordBreak: 'keep-all' }}>→ {r.first}</div>
                <div style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.6, wordBreak: 'keep-all' }}>{r.detail}</div>
              </div>
            ))}
          </div>
          {/* 주간·연장 진료 */}
          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            {DAY_EXTENDED.map((h) => (
              <div key={h.name} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 9999, background: '#EDFAF8', color: TEAL_DK }}>{h.region} · 연장 진료</span>
                  <span style={{ fontSize: 14.5, fontWeight: 800, color: '#111' }}>{h.name}</span>
                </div>
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>🕐 {h.hours}</div>
                <div style={{ fontSize: 12.5, color: '#92400e', lineHeight: 1.6, marginTop: 3, wordBreak: 'keep-all' }}>⚠️ {h.note}</div>
                <a href={`tel:${h.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '10px 18px', borderRadius: 10, background: '#fff', border: `1.5px solid ${TEAL_DK}`, color: TEAL_DK, fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
                  📞 {h.phone}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 위험 음식·물질 */}
        <section style={{ marginTop: 44 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 6, wordBreak: 'keep-all' }}>먹으면 안 되는 것들 — 위험도별 정리</h2>
          <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7, marginBottom: 16, wordBreak: 'keep-all' }}>
            중독은 증상이 늦게 나타나는 경우가 많아요. 먹는 걸 봤다면 증상이 없어도 <b>무엇을·얼마나·언제</b>를 메모하고 바로 전화하세요.
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            {TOXIC.map((g) => (
              <div key={g.level} style={{ background: g.bg, border: `1px solid ${g.color}33`, borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: g.color, marginBottom: 10 }}>{g.level}</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {g.items.map((it) => (
                    <div key={it.name} style={{ display: 'grid', gridTemplateColumns: 'minmax(130px, 38%) 1fr', gap: 10, fontSize: 13, lineHeight: 1.6 }}>
                      <div style={{ fontWeight: 800, color: '#111', wordBreak: 'keep-all' }}>{it.name}</div>
                      <div style={{ color: '#4b5563', wordBreak: 'keep-all' }}>{it.why}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 상황별 응급 대처 */}
        <section style={{ marginTop: 44 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 6, wordBreak: 'keep-all' }}>상황별 응급 대처 12가지</h2>
          <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7, marginBottom: 16, wordBreak: 'keep-all' }}>
            병원으로 가기 전, 해야 할 것과 절대 하지 말아야 할 것.
          </p>
          <div style={{ display: 'grid', gap: 10 }}>
            {FIRST_AID.map((f) => (
              <details key={f.title} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '4px 18px' }}>
                <summary style={{ fontSize: 15, fontWeight: 800, color: '#111', padding: '14px 0', cursor: 'pointer', listStyle: 'none', wordBreak: 'keep-all' }}>
                  {f.emoji} {f.title}
                </summary>
                <div style={{ paddingBottom: 16 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: TEAL_DK, marginBottom: 6 }}>이렇게 하세요</div>
                  <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: 13.5, color: '#374151', lineHeight: 1.8 }}>
                    {f.dos.map((d) => <li key={d} style={{ wordBreak: 'keep-all' }}>{d}</li>)}
                  </ul>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: RED, marginBottom: 6 }}>하지 마세요</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: '#374151', lineHeight: 1.8 }}>
                    {f.donts.map((d) => <li key={d} style={{ wordBreak: 'keep-all' }}>{d}</li>)}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* 바이탈 */}
        <section style={{ marginTop: 44 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 6, wordBreak: 'keep-all' }}>우리 아이의 정상 수치를 알아두세요</h2>
          <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7, marginBottom: 14, wordBreak: 'keep-all' }}>
            평소 수치를 알고 있으면 "이상하다"를 숫자로 판단할 수 있어요. 건강할 때 한 번 재보세요.
          </p>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
            {VITALS.map(([k, v, note], i) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: 'minmax(110px, 30%) 1fr', gap: 10, padding: '13px 18px', borderTop: i ? '1px solid #f3f4f6' : 'none', fontSize: 13.5, lineHeight: 1.6 }}>
                <div style={{ fontWeight: 800, color: '#111' }}>{k}</div>
                <div style={{ color: '#374151', wordBreak: 'keep-all' }}><b style={{ color: TEAL_DK }}>{v}</b><br /><span style={{ fontSize: 12.5, color: '#6b7280' }}>{note}</span></div>
              </div>
            ))}
          </div>
        </section>

        {/* 평소 준비 + 비용 */}
        <section style={{ marginTop: 44 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 14, wordBreak: 'keep-all' }}>평소에 준비해 두세요</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 8 }}>🧰 응급 키트</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#374151', lineHeight: 1.9 }}>
                <li>거즈·자기점착붕대·생리식염수</li>
                <li>넥카라·담요·이동장</li>
                <li>디지털 체온계 (직장용)·일회용 장갑</li>
                <li>체중·복용 약·알레르기 메모 카드</li>
              </ul>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 8 }}>📋 미리 해둘 일</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#374151', lineHeight: 1.9 }}>
                <li>우리 권역 1순위 병원 번호를 휴대폰에 저장</li>
                <li>동네 병원에 "야간엔 어디로 가면 되냐"고 미리 물어두기</li>
                <li>동물등록·인식표 — 응급 시 보호자 연락의 마지막 수단</li>
                <li>심야 진료는 할증·예치금이 있을 수 있어요 — 카드 지참</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 면책 */}
        <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.7, marginTop: 28, wordBreak: 'keep-all' }}>
          ※ 본 가이드는 응급 상황의 초기 대처를 돕기 위한 참고 정보로, 수의사의 진료를 대체하지 않습니다.
          병원 정보는 공개 자료 기준(2026. 10. 확인)이며 운영 사정에 따라 달라질 수 있습니다.
          잘못되었거나 바뀐 정보가 있다면 <a href="/contact" style={{ color: TEAL_DK }}>협회에 알려주세요</a>. — 사단법인 강원도반려동물협회
        </p>
      </div>
    </main>
  );
}
