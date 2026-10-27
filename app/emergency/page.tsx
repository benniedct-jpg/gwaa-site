import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '강원 반려동물 응급 가이드 — 야간·24시 동물병원 | GWAA 강원도반려동물협회',
  description:
    '강원도 반려동물 응급상황 대처법과 야간·24시 동물병원 안내. 춘천 반려동물 응급의료센터, 원주·강릉 야간 진료 병원, 중독·이물 삼킴·열사병 응급 대처까지.',
  keywords: ['강원 24시 동물병원', '춘천 동물병원 응급', '원주 24시 동물병원', '강릉 야간 동물병원', '반려동물 응급처치'],
};

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const TEAL = '#12A79D';
const TEAL_DK = '#0D7E76';
const RED = '#dc2626';

// ── 확인된 야간·응급 진료 거점 (최종 확인 2026. 10. — 운영시간·비용은 변동될 수 있어 방문 전 전화 필수)
const HOSPITALS: {
  region: string;
  name: string;
  phone: string;
  hours: string;
  note?: string;
  official?: boolean;
}[] = [
  {
    region: '춘천',
    name: '강원대학교 수의과대학 부속동물병원 · 반려동물 응급의료센터',
    phone: '033-250-8206',
    hours: '월~토 21:00~익일 09:00 · 일요일 24시간',
    note: '춘천시 협력 응급의료센터 · 춘천시민 진료비 일부 할인',
    official: true,
  },
  {
    region: '원주',
    name: '원주24시스카이동물메디컬센터',
    phone: '033-813-9975',
    hours: '24시 운영 표방 · 심야 응급 수용 여부는 전화 확인',
  },
  {
    region: '강릉',
    name: '보듬동물병원',
    phone: '033-655-7975',
    hours: '09:00~21:00 · 19시 이후 전화 예약 필수',
    note: '상호에 24시가 있지만 심야 상주는 아니므로 반드시 전화 후 방문',
  },
];

const FIRST_AID: { title: string; emoji: string; dos: string[]; donts: string[] }[] = [
  {
    title: '초콜릿·포도·양파·자일리톨을 먹었어요 (중독)',
    emoji: '🍫',
    dos: [
      '먹은 것의 종류·양·시간을 메모하고 포장지를 챙기세요',
      '즉시 병원에 전화해 체중과 먹은 양을 알리고 지시를 받으세요',
      '소량이라도 자일리톨(껌·치약)·포도는 위험 — 바로 병원으로',
    ],
    donts: ['임의로 소금물·손가락으로 토하게 하지 마세요 (기도 흡인 위험)', '우유·민간요법으로 중화하려 하지 마세요'],
  },
  {
    title: '장난감·뼈·간식이 목에 걸렸어요 (이물·질식)',
    emoji: '🦴',
    dos: [
      '입안이 보이는 위치에 있고 쉽게 잡히면 조심히 제거',
      '호흡이 힘들어 보이면 지체 없이 가장 가까운 병원으로 이동하며 전화',
      '삼킨 이물(실·바늘·꼬치)은 그대로 두고 병원으로 — 당기면 장이 다칩니다',
    ],
    donts: ['보이지 않는 이물을 손가락으로 깊이 파내지 마세요', '실이 혀에 감겨 있으면 절대 자르거나 당기지 마세요'],
  },
  {
    title: '헥헥거림이 멈추지 않아요 (열사병·더위)',
    emoji: '🌡️',
    dos: [
      '그늘·실내로 옮기고 미지근한 물로 몸(특히 배·발바닥)을 적셔주세요',
      '선풍기 바람으로 서서히 체온을 내리며 병원에 전화',
      '의식이 처지면 바로 이동 — 이동 중에도 몸을 적신 수건으로',
    ],
    donts: ['얼음물·얼음팩으로 급랭하지 마세요 (혈관 수축으로 악화)', '억지로 물을 먹이지 마세요'],
  },
  {
    title: '갑자기 쓰러져 떨어요 (경련·발작)',
    emoji: '⚡',
    dos: [
      '주변의 부딪힐 물건을 치우고 조명을 어둡게, 조용하게',
      '시작 시간을 재세요 — 지속 시간이 진단에 중요합니다',
      '끝난 뒤 영상·시간을 가지고 병원으로 (5분 이상 지속되면 즉시 이동)',
    ],
    donts: ['경련 중 입에 손이나 물건을 넣지 마세요', '몸을 눌러 제압하지 마세요'],
  },
  {
    title: '피가 나요 / 높은 곳에서 떨어졌어요 (출혈·골절)',
    emoji: '🩹',
    dos: [
      '깨끗한 수건·거즈로 출혈 부위를 지그시 압박',
      '골절이 의심되면 몸을 최대한 고정한 채 담요에 눕혀 이동',
      '잇몸이 하얗게 질리면 내부 출혈 신호 — 즉시 병원으로',
    ],
    donts: ['지혈대를 임의로 세게 묶지 마세요', '다친 다리를 펴거나 맞추려 하지 마세요'],
  },
  {
    title: '벌에 쏘였어요 / 뱀에 물렸어요',
    emoji: '🐝',
    dos: [
      '벌침이 보이면 카드로 긁어 제거하고 냉찜질',
      '얼굴·입 주변이 붓거나 구토하면 알레르기 반응 — 즉시 병원',
      '뱀에 물리면 물린 부위를 심장보다 낮게 유지하고 안정시킨 채 바로 이동',
    ],
    donts: ['뱀에 물린 부위를 입으로 빨아내거나 절개하지 마세요', '핀셋으로 벌침을 집지 마세요 (독낭이 눌립니다)'],
  },
  {
    title: '구토·설사가 계속돼요',
    emoji: '🤢',
    dos: [
      '마지막으로 먹은 것·횟수·색(혈액·이물 여부)을 기록',
      '어린 강아지·노령견은 반나절만 지속돼도 탈수 위험 — 병원 상담',
      '구토물 사진을 찍어두면 진료에 도움이 됩니다',
    ],
    donts: ['굶기면 낫겠지 하고 하루 이상 방치하지 마세요', '사람 지사제·소화제를 먹이지 마세요'],
  },
];

export default function EmergencyPage() {
  return (
    <main style={{ fontFamily: MONO, background: '#f8fafb', minHeight: '100vh' }}>
      {/* 히어로 */}
      <section style={{ background: 'linear-gradient(160deg, #0D7E76, #12A79D)', color: '#fff', padding: '52px 20px 44px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.14em', fontWeight: 700, color: '#BFF3EC', marginBottom: 10 }}>EMERGENCY GUIDE</div>
          <h1 style={{ fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 800, lineHeight: 1.25, margin: 0, wordBreak: 'keep-all' }}>
            강원 반려동물 응급 가이드
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.92)', marginTop: 12, wordBreak: 'keep-all' }}>
            한밤중, 여행지에서 아이가 아플 때 — 당황하지 않도록 강원도반려동물협회가 정리했습니다.
          </p>
          {/* 긴급 3단계 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginTop: 22 }}>
            {[
              ['1', '침착하게 상태 확인', '의식·호흡·잇몸 색을 보고 증상을 메모하세요'],
              ['2', '병원에 먼저 전화', '무작정 달려가지 말고 진료 가능 여부와 응급 지시를 받으세요'],
              ['3', '안전하게 이동', '담요로 감싸 안정시키고, 먹은 것·구토물은 챙겨 가세요'],
            ].map(([n, t, d]) => (
              <div key={n} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}><span style={{ display: 'inline-flex', width: 22, height: 22, borderRadius: '50%', background: '#fff', color: TEAL_DK, alignItems: 'center', justifyContent: 'center', marginRight: 8, fontSize: 12 }}>{n}</span>{t}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, wordBreak: 'keep-all' }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 20px 60px' }}>
        {/* 야간·응급 병원 */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 6, wordBreak: 'keep-all' }}>야간·응급 진료 거점</h2>
          <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7, marginBottom: 6, wordBreak: 'keep-all' }}>
            협회가 공개 자료로 확인한 강원 지역 야간·응급 진료처입니다. 운영시간·응급 수용 여부는 수시로 바뀝니다 —
            <b style={{ color: RED }}> 어떤 경우든 출발 전에 반드시 전화로 확인하세요.</b>
          </p>
          <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>최종 확인 2026. 10. · 정보가 바뀌었다면 <a href="/contact" style={{ color: TEAL_DK }}>협회에 알려주세요</a></p>
          <div style={{ display: 'grid', gap: 12 }}>
            {HOSPITALS.map((h) => (
              <div key={h.name} style={{ background: '#fff', border: h.official ? `1.5px solid ${TEAL}` : '1px solid #e5e7eb', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 9999, background: '#EDFAF8', color: TEAL_DK }}>{h.region}</span>
                  {h.official && <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 9999, background: TEAL, color: '#fff' }}>지자체 협력 응급센터</span>}
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#111', wordBreak: 'keep-all' }}>{h.name}</span>
                </div>
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>🕐 {h.hours}</div>
                {h.note && <div style={{ fontSize: 12.5, color: '#92400e', lineHeight: 1.6, marginTop: 4, wordBreak: 'keep-all' }}>⚠️ {h.note}</div>}
                <a href={`tel:${h.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '11px 20px', borderRadius: 10, background: TEAL_DK, color: '#fff', fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
                  📞 {h.phone} 전화하기
                </a>
              </div>
            ))}
          </div>
          {/* 그 외 지역 */}
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 14, padding: '16px 18px', marginTop: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#9a3412', marginBottom: 6 }}>속초·동해·삼척 등 그 외 지역은?</div>
            <p style={{ fontSize: 13, color: '#7c2d12', lineHeight: 1.7, margin: 0, wordBreak: 'keep-all' }}>
              현재 강원 영동·접경 지역에는 심야 상주 동물병원이 확인되지 않습니다. 낮 시간에 미리 동네 병원의
              야간 연락 가능 여부를 물어 저장해 두시고, 응급 시에는 춘천 응급의료센터(033-250-8206)에 전화해
              상담 후 이동 여부를 결정하세요.
            </p>
          </div>
        </section>

        {/* 상황별 응급 대처 */}
        <section style={{ marginTop: 44 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 6, wordBreak: 'keep-all' }}>상황별 응급 대처</h2>
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

        {/* 평소 준비 */}
        <section style={{ marginTop: 44 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 14, wordBreak: 'keep-all' }}>평소에 준비해 두세요</h2>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 20px' }}>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: '#374151', lineHeight: 2 }}>
              <li style={{ wordBreak: 'keep-all' }}>집·여행지에서 가장 가까운 야간 병원 전화번호를 휴대폰에 저장</li>
              <li style={{ wordBreak: 'keep-all' }}>응급 키트: 거즈·자기점착붕대·생리식염수·넥카라·담요·이동장</li>
              <li style={{ wordBreak: 'keep-all' }}>아이의 체중·복용 약·알레르기를 메모해 두면 전화 상담이 빨라집니다</li>
              <li style={{ wordBreak: 'keep-all' }}>동물등록·인식표 — 응급 상황에서 보호자 연락의 마지막 수단입니다</li>
            </ul>
          </div>
        </section>

        {/* 면책 */}
        <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.7, marginTop: 28, wordBreak: 'keep-all' }}>
          ※ 본 가이드는 응급 상황의 초기 대처를 돕기 위한 참고 정보로, 수의사의 진료를 대체하지 않습니다.
          병원 정보는 공개 자료 기준이며 운영 사정에 따라 달라질 수 있습니다. — 사단법인 강원도반려동물협회
        </p>
      </div>
    </main>
  );
}
