import type { EventStatus } from '@/types';

// 행사 상태를 날짜로 자동 판정하는 단일 소스. (모든 비교는 KST 기준)
// 우선순위: 명시 start_date/end_date → date_text 파싱 → 수동 status
// 이렇게 하면 "날짜 지났는데 업커밍" 문제가 자동으로 해소됩니다.

export type EventLike = {
  id?: number;
  order?: number;
  status?: EventStatus;
  date?: string;             // date_text (사람이 읽는 문자열)
  startDate?: string | null; // start_date (YYYY-MM-DD)
  endDate?: string | null;   // end_date (YYYY-MM-DD)
};

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
// 해당 시각의 KST 달력일을 정수(에폭 이후 일수)로 — 서버 타임존과 무관하게 일관.
const kstDayNum = (d: Date) => Math.floor((d.getTime() + KST_OFFSET_MS) / 86400000);
const pad2 = (n: number) => String(n).padStart(2, '0');
const kstDate = (y: number, m: number, d: number) => new Date(`${y}-${pad2(m)}-${pad2(d)}T00:00:00+09:00`);

// "2026.07.10 — 2026.08.21", "2026. 9. 13.(일)", "2026. 7. 18" 등에서 날짜 추출(KST)
function parseDateText(s?: string): { start: Date | null; end: Date | null } {
  if (!s) return { start: null, end: null };
  const re = /(\d{4})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]\s*(\d{1,2})/g;
  const dates: Date[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const d = kstDate(Number(m[1]), Number(m[2]), Number(m[3]));
    if (!isNaN(d.getTime())) dates.push(d);
  }
  if (!dates.length) return { start: null, end: null };
  return { start: dates[0], end: dates[dates.length - 1] };
}

export function eventDates(ev: EventLike): { start: Date | null; end: Date | null } {
  const sd = ev.startDate ? new Date(ev.startDate + 'T00:00:00+09:00') : null;
  const ed = ev.endDate ? new Date(ev.endDate + 'T00:00:00+09:00') : null;
  if ((sd && !isNaN(sd.getTime())) || (ed && !isNaN(ed.getTime()))) {
    return { start: sd && !isNaN(sd.getTime()) ? sd : ed, end: ed && !isNaN(ed.getTime()) ? ed : sd };
  }
  return parseDateText(ev.date);
}

// 날짜 기반 실효 상태. 날짜를 못 구하면 수동 status를 그대로 사용.
export function effectiveStatus(ev: EventLike, now: Date = new Date()): EventStatus {
  const today = kstDayNum(now);
  const { start, end } = eventDates(ev);
  // 관리자가 명시적으로 종료 처리한 건 존중(아카이브 확정)
  if (ev.status === 'ended') return 'ended';
  if (end) {
    if (kstDayNum(end) < today) return 'ended';
    if (start && kstDayNum(start) <= today && today <= kstDayNum(end)) return 'live';
    return 'upcoming';
  }
  return ev.status ?? 'upcoming';
}

export function isEnded(ev: EventLike, now?: Date): boolean {
  return effectiveStatus(ev, now) === 'ended';
}

// D-day (양수=남은 일수, 0=오늘, 음수=지남). 날짜 없으면 null. (KST 기준)
export function ddayFrom(ev: EventLike, now: Date = new Date()): number | null {
  const { start } = eventDates(ev);
  if (!start) return null;
  return kstDayNum(start) - kstDayNum(now);
}

// 홈/목록 대표 행사 자동 선정 = 종료 안 된 행사 중 시작일이 가장 임박한(또는 진행 중인) 행사
export function pickFlagship<T extends EventLike>(events: T[], now: Date = new Date()): T | null {
  const live = events.filter((e) => effectiveStatus(e, now) !== 'ended');
  if (!live.length) return null;
  return [...live].sort((a, b) => {
    const sa = eventDates(a).start?.getTime() ?? Infinity;
    const sb = eventDates(b).start?.getTime() ?? Infinity;
    return sa - sb;
  })[0];
}
