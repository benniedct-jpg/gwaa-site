// 웰니스 클래스 카탈로그 (현장 추가 구매용)
// 저장 형식: tshirt_sizes 컬럼에 `${label} × ${n}명` 문자열로 append (기존 예약과 동일 포맷)
export const DEFAULT_PRICE = 25000;   // 일반 웰니스 클래스
export const CLASS_CAP = 20;          // 타임별 정원 (아로마 상시체험은 정원 없음)

export type ClassSlot = { key: string; emoji: string; name: string; slot: string; label: string; startsAt: string; price: number; cap: number | null };

// slot 문자열 → 2026년 시작 ISO (지난 타임 판별용). 예: '9/5(토) 17:00'
function slotToISO(slot: string): string {
  const m = slot.match(/(\d{1,2})\/(\d{1,2}).*?(\d{1,2}):(\d{2})/);
  if (!m) return '';
  const [, mo, d, h, mi] = m;
  return `2026-${mo.padStart(2, '0')}-${d.padStart(2, '0')}T${h.padStart(2, '0')}:${mi}:00+09:00`;
}

type Def = { emoji: string; name: string; slots: string[]; price?: number; cap?: number | null };
const DEFS: Def[] = [
  { emoji: '🎵', name: '핸드팬 사운드힐링', slots: ['9/4(금) 19:00', '9/5(토) 09:00'] },
  { emoji: '🤸', name: '아크로요가', slots: ['9/5(토) 10:30', '9/5(토) 18:30'] },
  { emoji: '🌺', name: '훌라댄스 & 공연', slots: ['9/5(토) 14:00'] },
  { emoji: '🐶', name: '퍼피요가', slots: ['9/5(토) 15:30', '9/6(일) 09:00'] },
  { emoji: '🌿', name: '애니멀플로우', slots: ['9/5(토) 17:00', '9/6(일) 10:30'] },
  // 펫아로마: 상시체험 · 10,000원 · 정원 없음. 라벨은 기존 예약 포맷과 동일(타임 표기 없음)
  { emoji: '🧴', name: '아로마 DIY (치약·샴푸·롤온 택1)', slots: ['상시'], price: 10000, cap: null },
];

export const CLASS_SLOTS: ClassSlot[] = DEFS.flatMap((d) =>
  d.slots.map((s) => {
    const isAllday = s === '상시';
    return {
      key: `${d.name}|${s}`,
      emoji: d.emoji,
      name: d.name,
      slot: s,
      label: isAllday ? `${d.emoji} ${d.name}` : `${d.emoji} ${d.name} · ${s}`,
      startsAt: isAllday ? '' : slotToISO(s),
      price: d.price ?? DEFAULT_PRICE,
      cap: d.cap === undefined ? CLASS_CAP : d.cap,
    };
  }),
);

export const CLASS_BY_KEY: Record<string, ClassSlot> = Object.fromEntries(CLASS_SLOTS.map((c) => [c.key, c]));

export const classEntry = (label: string, n = 1) => `${label} × ${n}명`;
export const entryLabel = (e: string) => String(e).replace(/\s*×.*$/, '').trim();
export const entryCount = (e: string) => { const m = String(e).match(/×\s*(\d+)/); return m ? parseInt(m[1], 10) : 1; };
