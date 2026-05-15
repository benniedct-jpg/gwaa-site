'use client';

const ITEMS = [
  '반려동물과 함께, 강원도를 제한 없이',
  '2021 — 2025 · 누적 참가자 4만명+',
  '메이트쉽 멤버십 · 연간 40만원 이상 절약',
  '독스포츠 어질리티 · 오비디언스 교육',
  '반려동물행동지도사 국가자격증',
  '강원도 제휴업체 18곳 이상',
  '반려동물 동반 여행 · 트레킹 · 캠핑',
];

export default function Ticker() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div style={{ background: '#16a34a', padding: '10px 0', overflow: 'hidden', userSelect: 'none' }}>
      <div
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: 'ticker-scroll 28s linear infinite',
        }}
        className="ticker-track"
      >
        {doubled.map((item, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 14,
            padding: '0 24px',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#fff',
            flexShrink: 0,
          }}>
            {item}
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
