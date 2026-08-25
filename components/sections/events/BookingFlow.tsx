'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Map as MapIcon, Loader2, CheckCircle2, Clock } from 'lucide-react';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const GREEN = '#16a34a';
const GREEN_DK = '#15803d';
const BORDER = '#e5e7eb';
const MUTED = '#6b7280';

// ── 상수 (booking.html 로직 이식) ──
const FESTIVAL_DATES = ['2026-09-04', '2026-09-05', '2026-09-06'];
const DATE_LABELS: Record<string, { d: string; w: string }> = {
  '2026-09-04': { d: '9/4', w: '금' },
  '2026-09-05': { d: '9/5', w: '토' },
  '2026-09-06': { d: '9/6', w: '일' },
};
type DateOpt = { label: string; sub: string; dates: string[] };
const DATE_OPTIONS: Record<'day' | 'two', DateOpt[]> = {
  day: [
    { label: '9/4 (금)', sub: '9/4(금) 당일', dates: ['2026-09-04'] },
    { label: '9/5 (토)', sub: '9/5(토) 당일', dates: ['2026-09-05'] },
    { label: '9/6 (일)', sub: '9/6(일) 당일', dates: ['2026-09-06'] },
  ],
  two: [{ label: '금 · 토 · 일', sub: '9/4(금) ~ 9/6(일)', dates: ['2026-09-04', '2026-09-05', '2026-09-06'] }],
};

// 요금 (2박 3일 · 기본 2인 기준) — 존 등급별
type Tier = 'near' | 'far' | 'fence';
const TIER_PRICE: Record<Tier, number> = { near: 155000, far: 135000, fence: 185000 };
const TIER_LABEL: Record<Tier, string> = { near: '근접 일반존', far: '넓은 일반존', fence: '반려동물 펜스존' };
const DAY_PRICE = 20000;     // 당일권 1인
const EXTRA_PERSON = 40000;  // 기본 2인 초과 1인당
const RG_EXTRA_PERSON = 30000; // 낭만기버존 전용 — 기본 2인 초과 1인당
const EXTRA_DOG = 10000;     // 1인당 1마리 초과 1두당

// 이메일 형식 검사 + 흔한 도메인 오타 제안 (오탈자 반송 방지)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COMMON_DOMAINS = ['naver.com', 'gmail.com', 'daum.net', 'hanmail.net', 'kakao.com', 'nate.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'yahoo.com'];
function editDist(a: string, b: string): number {
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0]; d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return d[b.length];
}
// 도메인이 흔한 도메인과 1~2글자 차이면 교정안 제안 (회사메일 등 먼 도메인은 건드리지 않음)
function suggestEmail(email: string): string | null {
  const at = email.lastIndexOf('@');
  if (at < 1) return null;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1).toLowerCase();
  if (!domain || domain.length < 4 || COMMON_DOMAINS.includes(domain)) return null;
  let best: string | null = null; let bestD = 99;
  for (const g of COMMON_DOMAINS) { const dd = editDist(domain, g); if (dd < bestD) { bestD = dd; best = g; } }
  return best && bestD >= 1 && bestD <= 2 ? `${local}@${best}` : null;
}

const seq = (p: string, n: number) => Array.from({ length: n }, (_, i) => p + (i + 1));
const seqD = (p: string, n: number) => Array.from({ length: n }, (_, i) => `${p}-${i + 1}`);
// 화면 표시용 라벨: 내부 ID는 고유('F1-1')로 두고, 사용자에겐 존 내 번호만('1') 노출
const siteLabel = (s: string | null) => (s && s.includes('-') ? s.split('-')[1] : (s || ''));
type Zone = { label: string; desc: string; sites: string[]; tier: Tier; poly: string };
const ZONES: Record<string, Zone> = {
  A:  { label: 'A 구역',  desc: '근접 일반존 · 무대/푸드존 인접', tier: 'near',  sites: seq('A', 16),  poly: '510,376 626,376 626,425 510,425' },
  B:  { label: 'B 구역',  desc: '근접 일반존',                 tier: 'near',  sites: seq('B', 10),  poly: '360,372 452,372 452,410 360,410' },
  C:  { label: 'C 구역',  desc: '근접 일반존',                 tier: 'near',  sites: seq('C', 24),  poly: '331,284 424,284 424,368 331,368' },
  D:  { label: 'D 구역',  desc: '근접 일반존',                 tier: 'near',  sites: seq('D', 10),  poly: '384,208 462,208 462,272 384,272' },
  E:  { label: 'E 구역',  desc: '무대와 조금 떨어진 대신 가장 넓고 저렴 · 근접존 대비 2만원 할인 · 그룹·대가족 추천', tier: 'far', sites: seq('E', 40), poly: '170,372 250,372 250,508 170,508' },
  F1: { label: 'F1 구역', desc: '반려동물 펜스존 · 오프리쉬·체험존 바로 앞', tier: 'fence', sites: seqD('F1', 8),  poly: '512,548 582,548 582,590 512,590' },
  F2: { label: 'F2 구역', desc: '반려동물 펜스존 · 오프리쉬·체험존 인접',   tier: 'fence', sites: seqD('F2', 10), poly: '448,482 528,482 528,538 448,538' },
  F3: { label: 'F3 구역', desc: '반려동물 펜스존 · 오프리쉬·체험존 인접',   tier: 'fence', sites: seqD('F3', 8),  poly: '542,482 622,482 622,538 542,538' },
  F4: { label: 'F4 구역', desc: '반려동물 펜스존 · 최대 규모·입구 인접',     tier: 'fence', sites: seqD('F4', 30), poly: '646,476 778,476 778,622 646,622' },
  // 낭만기버존 — 숨김 링크(?rg=코드) 전용. 지도/공개 목록엔 노출 안 됨(아래 map에서 필터). 자리번호 없이 존 단위 접수(site='')
  RG: { label: '낭만기버존', desc: '초대 전용 · 낭만기버 웰니스존 · 8×8m', tier: 'near', sites: seqD('RG', 18), poly: '' },
};
// 협회 자체 사용 등으로 온라인 예약을 막을 구역(마감 처리). 여기 키만 넣으면 지도·목록에서 '마감'으로 표시되고 선택 불가.
const BLOCKED_ZONE_KEYS: string[] = ['A'];
const BLOCKED_SITES = new Set(BLOCKED_ZONE_KEYS.flatMap((k) => ZONES[k].sites));
// 낭만기버존 숨김 링크 코드 — 공유용. 필요 시 이 값만 바꾸면 됨. 접속: /events/3?rg=<이 코드>
const RG_CODE = 'nangman-2026';

// 예약 후 계좌이체 안내(카드결제 실패·미사용 시 대체수단)
const ACCOUNT = { bank: 'NH농협은행', number: '301-0318-0756-61', holder: '사단법인 강원도반려동물협회' };

// 카드 즉시결제(PortOne V2) — 채널키가 설정돼 있을 때만 노출
const PORTONE_STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || '';
const PORTONE_CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || '';
const CARD_ENABLED = !!(PORTONE_STORE_ID && PORTONE_CHANNEL_KEY);
type PortOneSDK = { requestPayment: (o: Record<string, unknown>) => Promise<{ code?: string | null; message?: string; paymentId?: string }> };
// 인앱 브라우저(인스타·카톡·페북 등) 감지 — 앱 내 브라우저는 카드결제 후 복귀가 깨지기 쉬워 외부 브라우저로 안내
function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = (navigator.userAgent || '').toLowerCase();
  return /instagram|kakaotalk|fban|fbav|fb_iab|line\/|naver|daumapps|; wv\)/.test(ua);
}

const SITEMAP = '/images/events/jamboree-2026/sitemap.webp';

// 웰니스 클래스 (유료 · 선택) — 1개당 25,000원, 캠핑료와 별도. 저장은 tshirt_sizes 컬럼 재활용
const CLASS_PRICE = 25000;
const RG_CLASS_PRICE = 15000; // 낭만기버존 전용 웰니스 클래스 가격
const AROMA_PRICE = 10000; // 아로마 DIY — 신청 인원당 1만원(낭만기버·일반 동일)
type ClassType = { emoji: string; name: string; host: string; desc: string; grad: string; img?: string; slots: string[] };
const CLS_IMG = '/images/events/jamboree-2026/classes';
const CLASS_TYPES: ClassType[] = [
  { emoji: '🐶', name: '퍼피요가', host: '고성 소울얼라인먼트', desc: '반려견과 함께 호흡·교감. 비반려인도 참여 가능', grad: 'linear-gradient(135deg,#16a34a,#4ade80)', img: `${CLS_IMG}/puppy.webp`, slots: ['9/5(토) 15:30', '9/6(일) 09:00'] },
  { emoji: '🤸', name: '아크로요가', host: 'TJ & 징조', desc: '요가·균형 운동 결합. 혼자 와도 파트너 매칭', grad: 'linear-gradient(135deg,#0284c7,#38bdf8)', img: `${CLS_IMG}/acro.webp`, slots: ['9/5(토) 10:30', '9/5(토) 18:30'] },
  { emoji: '🌿', name: '애니멀플로우', host: '최민호', desc: '동물 움직임 맨몸 운동. 코어·유연성', grad: 'linear-gradient(135deg,#65a30d,#a3e635)', img: `${CLS_IMG}/animalflow.webp`, slots: ['9/5(토) 17:00', '9/6(일) 10:30'] },
  { emoji: '🎵', name: '핸드팬 사운드힐링', host: '하택후', desc: '핸드팬 울림 속 깊은 힐링', grad: 'linear-gradient(135deg,#7c3aed,#a78bfa)', img: `${CLS_IMG}/handpan.webp`, slots: ['9/4(금) 19:00', '9/5(토) 09:00'] },
  { emoji: '🌺', name: '훌라댄스 & 공연', host: '온다', desc: '하와이 리듬과 자유로운 움직임', grad: 'linear-gradient(135deg,#db2777,#fb7185)', img: `${CLS_IMG}/hula.webp`, slots: ['9/5(토) 14:00'] },
];
const classLabel = (c: ClassType, slot: string) => `${c.emoji} ${c.name} · ${slot}`;

type TypeKey = 'day' | 'two';
type Avail = { site: string; booking_dates: string[] };

export default function BookingFlow({ eventId }: { eventId: number }) {
  const isMobile = useIsMobile();
  const px = isMobile ? '20px' : '40px';

  const [step, setStep] = useState(1);
  const [type, setType] = useState<'day' | 'two' | null>(null);
  const [typeLabel, setTypeLabel] = useState('');
  const [nights, setNights] = useState(0);
  const [dates, setDates] = useState<string[] | null>(null);
  const [dateLabel, setDateLabel] = useState('');
  const [zone, setZone] = useState<string | null>(null);
  const [site, setSite] = useState<string | null>(null);
  const [headcount, setHeadcount] = useState(2);
  const [dogCount, setDogCount] = useState(1);
  const [classQty, setClassQty] = useState<Record<string, number>>({}); // 세션 라벨 → 신청 인원(숙박인원과 무관)
  const [aromaQty, setAromaQty] = useState(0); // 아로마 DIY 신청 인원
  const setQty = (label: string, n: number) => setClassQty((p) => { const q = { ...p }; if (n > 0) q[label] = n; else delete q[label]; return q; });

  const [booked, setBooked] = useState<Avail[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', petName: '', petBreed: '', petAge: '', petVaccine: '', request: '' });
  const [emailConfirm, setEmailConfirm] = useState(''); // 이메일 재확인(오타 반송 방지)
  const [agree, setAgree] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [doneData, setDoneData] = useState<Record<string, unknown> | null>(null);
  const [paid, setPaid] = useState(false); // 카드결제 확정 여부
  const [payMsg, setPayMsg] = useState(''); // 카드결제 안내/오류 메시지
  const [inApp, setInApp] = useState(false); // 인앱 브라우저 여부(결제 복귀 안내용)
  const [linkCopied, setLinkCopied] = useState(false);
  useEffect(() => { setInApp(isInAppBrowser()); }, []);
  const [rgMode, setRgMode] = useState(false); // 낭만기버존 전용(숨김 링크) 모드

  // 잔여석 로드
  const loadAvailability = useCallback(() => {
    fetch(`/api/bookings?event=${eventId}&mode=availability`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Avail[]) => setBooked(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [eventId]);

  // 카드결제 SDK 로드 + 모바일 결제창 리다이렉트 복귀 처리
  useEffect(() => {
    if (!CARD_ENABLED) return;
    if (!document.getElementById('portone-sdk')) {
      const s = document.createElement('script');
      s.id = 'portone-sdk'; s.src = 'https://cdn.portone.io/v2/browser-sdk.js'; s.async = true;
      document.body.appendChild(s);
    }
    // 모바일(사파리 등): 결제창에서 이 페이지로 리다이렉트 복귀 — 저장해둔 예약으로 이어서 처리
    const raw = sessionStorage.getItem('gwaa_booking_pay');
    if (raw) {
      sessionStorage.removeItem('gwaa_booking_pay');
      // 복귀 URL 결과 파라미터: 실패/취소 시 code·message, 성공 시 paymentId·transactionType
      const sp = new URLSearchParams(window.location.search);
      const failCode = sp.get('code');
      const failMsg = sp.get('message');
      try { window.history.replaceState({}, '', new URL(window.location.href).pathname); } catch { /* noop */ }
      // 사파리는 리다이렉트=전체 새로고침 → 페이지 최상단에서 시작함. 예약 위젯으로 즉시 스크롤(원점 복귀처럼 보이는 문제 방지)
      const scrollToBooking = () => { setTimeout(() => { try { document.getElementById('booking-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch { /* noop */ } }, 250); };
      try {
        const { done, paymentId } = JSON.parse(raw) as { done: Record<string, unknown>; paymentId: string };
        if (done?.order_id && paymentId) {
          // 예약은 이미 접수(pending)됨 → 결과와 무관하게 step4 복원(입력값·자리 유지)
          setDoneData(done); setStep(4);
          scrollToBooking();
          if (failCode) {
            // 결제 실패·취소 — confirm 호출 없이 재시도/계좌이체 안내 + 안내 메일 자동 발송
            setSubmitting(false);
            setPayMsg(`결제가 취소되었거나 실패했어요. [${failCode}] ${failMsg ?? ''} — 아래에서 다시 결제하시거나 계좌이체로 진행하실 수 있어요.`.replace(/\s+—/, ' —'));
            try { fetch('/api/bookings/notify-unpaid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: done.order_id }) }).catch(() => {}); } catch { /* noop */ }
          } else {
            // 성공(또는 결과 파라미터 없음) — 서버 승인검증
            setSubmitting(true);
            fetch('/api/bookings/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: done.order_id, paymentId }) })
              .then((r) => r.json().catch(() => ({})))
              .then((cj) => { if (cj.ok) setPaid(true); else setPayMsg(cj.error || '결제가 완료되지 않았어요. 아래에서 다시 결제하시거나 계좌이체로 진행하실 수 있어요.'); })
              .catch(() => setPayMsg('결제 확인 중 오류가 발생했어요. 계좌이체로 진행하실 수 있어요.'))
              .finally(() => setSubmitting(false));
          }
        }
      } catch { /* 저장값 파손 시 무시 */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { loadAvailability(); }, [loadAvailability]);

  // 낭만기버존 숨김 링크(?rg=코드) 진입 시 — 2박3일·존단위 접수 모드로 전환하고 폼 단계로 바로 이동
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).get('rg') !== RG_CODE) return;
    // URL 쿼리는 브라우저 전용 → SSR 하이드레이션 불일치를 피하려면 마운트 후 반영해야 함(의도된 setState)
    /* eslint-disable react-hooks/set-state-in-effect */
    setRgMode(true);
    setType('two'); setTypeLabel('2박 3일'); setNights(2);
    setDates(DATE_OPTIONS.two[0].dates); setDateLabel(DATE_OPTIONS.two[0].sub);
    setHeadcount(2); setDogCount(1);
    setZone('RG'); setSite(null);
    setStep(3);
    /* eslint-enable react-hooks/set-state-in-effect */
    // 예약 위젯으로 스크롤 (초대 링크로 들어오면 바로 폼이 보이도록)
    setTimeout(() => document.getElementById('booking-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
  }, []);

  // ── 헬퍼 ──
  const typeKey = (): TypeKey => (nights === 0 ? 'day' : 'two');
  const requiredDates = (): string[] => dates || DATE_OPTIONS[typeKey()][0].dates;
  const siteBookedDates = (s: string): string[] => {
    const rows = booked.filter((b) => b.site === s);
    return rows.flatMap((b) => b.booking_dates || []);
  };
  const isSiteAvailable = (s: string): boolean => {
    if (BLOCKED_SITES.has(s)) return false; // 마감 구역(협회 자체 사용)
    const bd = siteBookedDates(s);
    return !requiredDates().some((d) => bd.includes(d));
  };
  const zoneFullyBooked = (key: string): boolean => ZONES[key].sites.every((s) => !isSiteAvailable(s));

  const unitPrice = (): number => {
    if (type === 'day') return DAY_PRICE;
    const z = zone ? ZONES[zone] : null;
    return z ? TIER_PRICE[z.tier] : 0;
  };
  const clsPrice = rgMode ? RG_CLASS_PRICE : CLASS_PRICE;
  const classCost = () => Object.values(classQty).reduce((a, b) => a + b, 0) * clsPrice + aromaQty * AROMA_PRICE; // 세션별 신청 인원 × 가격 + 아로마 인원 × 1만원
  const payAmount = (): number => {
    const hc = headcount || 0;
    if (!hc) return 0;
    if (type === 'day') return DAY_PRICE * hc + classCost();
    const base = unitPrice();
    if (!base) return 0;
    const extraP = Math.max(0, hc - 2) * (rgMode ? RG_EXTRA_PERSON : EXTRA_PERSON);
    const extraD = Math.max(0, (dogCount || 0) - 1) * EXTRA_DOG;
    return base + extraP + extraD + classCost();
  };

  // ── 스텝 이동 ──
  const goStep = (n: number) => {
    if (n === 2) { setZone(null); setSite(null); loadAvailability(); }
    setStep(n);
    if (typeof window !== 'undefined') {
      const el = document.getElementById('booking-anchor');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const proceedFromStep1 = () => { if (type === 'day') { setZone(null); setSite(null); goStep(3); } else goStep(2); };

  // 타입 선택
  const selectType = (t: 'day' | 'two', label: string, ni: number) => {
    setType(t); setTypeLabel(label); setNights(ni); setDates(null); setDateLabel('');
    setHeadcount(t === 'day' ? 1 : 2); // 당일권=1인 기본(20,000), 캠핑=사이트 기준 2인
    const opts = DATE_OPTIONS[t];
    if (opts.length === 1) { setDates(opts[0].dates); setDateLabel(opts[0].sub); }
  };

  // 계좌번호 원클릭 복사 (입금 마찰 최소화)
  const copyAccount = () => {
    const num = ACCOUNT.number.replace(/-/g, '');
    navigator.clipboard?.writeText(num).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }).catch(() => {});
  };

  // ── 지도 줌/팬 ──
  const vpRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const pan = useRef({ down: false, moved: false, sx: 0, sy: 0, sl: 0, st: 0 });
  const doZoom = (dir: number) => {
    setZoom((z) => (dir === 0 ? 1 : Math.min(3.5, Math.max(1, +(z + dir * 0.5).toFixed(2)))));
  };
  const onDown = (x: number, y: number) => {
    if (zoom <= 1 || !vpRef.current) return;
    pan.current = { down: true, moved: false, sx: x, sy: y, sl: vpRef.current.scrollLeft, st: vpRef.current.scrollTop };
  };
  const onMove = (x: number, y: number) => {
    const p = pan.current; if (!p.down || !vpRef.current) return;
    const dx = x - p.sx, dy = y - p.sy;
    if (!p.moved && Math.abs(dx) + Math.abs(dy) > 6) p.moved = true;
    if (p.moved) { vpRef.current.scrollLeft = p.sl - dx; vpRef.current.scrollTop = p.st - dy; }
  };
  const onUp = () => { pan.current.down = false; };
  useEffect(() => {
    const mv = (e: MouseEvent) => onMove(e.pageX, e.pageY);
    window.addEventListener('mousemove', mv); window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', onUp); };
  });

  const selectZone = (key: string) => {
    setZone(key); setSite(null);
  };
  const selectSite = (s: string) => setSite(s);

  // ── 제출 ──
  const submit = async (viaTransfer = false) => {
    setErrorMsg('');
    if (!form.name || !form.phone || !form.email) { setErrorMsg('예약자 정보를 모두 입력해 주세요.'); return; }
    if (!EMAIL_RE.test(form.email.trim())) { setErrorMsg('이메일 형식을 확인해 주세요. (예: example@naver.com)'); return; }
    if (form.email.trim().toLowerCase() !== emailConfirm.trim().toLowerCase()) { setErrorMsg('이메일과 이메일 재확인이 일치하지 않습니다. 입장권이 이 주소로 발송되니 정확히 입력해 주세요.'); return; }
    if (rgMode && !site) { setErrorMsg('낭만기버존 자리를 선택해 주세요.'); return; }
    if (dogCount > 0 && !form.petName) { setErrorMsg('반려견 이름을 입력해 주세요.'); return; }
    if (!agree) { setErrorMsg('개인정보 수집·이용 및 참가 안내에 동의해 주세요.'); return; }
    if (payAmount() <= 0) { setErrorMsg('결제 금액을 확인할 수 없습니다. 인원/사이트를 확인해 주세요.'); return; }

    const classList = [
      ...Object.entries(classQty).map(([label, n]) => `${label} × ${n}명`),
      ...(aromaQty > 0 ? [`🧴 아로마 DIY (치약·샴푸·롤온 택1) × ${aromaQty}명`] : []),
    ];
    const amount = payAmount();
    const payload = {
      event_id: eventId,
      booking_type: type, booking_label: typeLabel,
      date_label: dateLabel, booking_dates: requiredDates(),
      zone: rgMode ? '낭만기버존' : zone, site: site,
      headcount, tshirt_sizes: classList, // tshirt_sizes 컬럼 재활용 = 구매한 웰니스 클래스(신청 인원 포함)
      name: form.name, phone: form.phone, email: form.email.trim(),
      pet_name: form.petName, pet_breed: form.petBreed, pet_age: form.petAge, pet_vaccine: form.petVaccine,
      request: (type !== 'day' && dogCount > 0) ? (form.request ? `${form.request}\n(반려견 ${dogCount}마리)` : `반려견 ${dogCount}마리`) : form.request, amount,
      agree_privacy: agree, agree_portrait: agree,
      pay_method: (!CARD_ENABLED || viaTransfer) ? 'transfer' : 'card', // 예약 시 선택한 결제수단(의향)
    };
    setSubmitting(true);
    try {
      // 1) 결제 대기 예약 생성 (자리 홀드 + order_id 발급)
      const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.status === 409) {
        setErrorMsg('선택하신 자리가 방금 예약되었습니다. 다른 자리를 선택해 주세요.');
        setSubmitting(false); loadAvailability(); goStep(2); return;
      }
      const created = await res.json();
      if (!res.ok || !created.order_id) throw new Error(created.error || '접수 실패');

      // 2) 예약 접수 완료 → 카드결제 가능하면 결제창 즉시 호출(고민 없이 바로 결제), 아니면 계좌이체 안내
      const dd = { ...payload, order_id: created.order_id, ticket_token: created.ticket_token, classes: classList };
      setDoneData(dd);
      loadAvailability(); // 방금 잡은 자리를 잔여석에 즉시 반영
      setStep(4);
      if (CARD_ENABLED && !viaTransfer) {
        payCard(dd); // 카드 선택 시 접수 즉시 결제창 호출 · 취소 시 step4의 카드 재시도/계좌이체로 폴백
      } else {
        setSubmitting(false); // 계좌이체 선택(또는 카드 비활성) → step4에서 입금 계좌 안내
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setErrorMsg('예약 접수 중 오류가 발생했습니다. ' + (e?.message || ''));
      setSubmitting(false);
    }
  };

  // ── 카드 즉시결제 (접수된 예약을 결제창으로 확정) ──
  // 결제 실패·취소로 미입금 상태가 된 예약자에게 입금/결제 안내 메일 자동 발송(서버가 pending 건만 발송)
  const notifyUnpaid = (orderId?: string) => {
    if (!orderId) return;
    try { fetch('/api/bookings/notify-unpaid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: orderId }) }).catch(() => {}); } catch { /* noop */ }
  };

  const payCard = async (data?: Record<string, unknown>) => {
    const d = (data ?? doneData) as Record<string, unknown> | null;
    if (!d?.order_id) return;
    if (!CARD_ENABLED) { setPayMsg('카드결제 준비 중입니다. 계좌이체로 진행해 주세요.'); return; }
    const PortOne = (window as unknown as { PortOne?: PortOneSDK }).PortOne;
    if (!PortOne) { setPayMsg('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.'); return; }
    const amount = Number(d.amount) || 0;
    if (amount <= 0) { setPayMsg('결제 금액을 확인할 수 없습니다.'); return; }
    const orderId = String(d.order_id);
    const paymentId = orderId.replace(/[^a-zA-Z0-9]/g, ''); // PortOne V2 paymentId는 영숫자만
    setPayMsg('');
    // 모바일 리다이렉트 대비: 복귀 후 승인 확인할 수 있게 보관
    sessionStorage.setItem('gwaa_booking_pay', JSON.stringify({ done: d, paymentId }));
    setSubmitting(true);
    try {
      const resp = await PortOne.requestPayment({
        storeId: PORTONE_STORE_ID, channelKey: PORTONE_CHANNEL_KEY,
        paymentId, orderName: `펫스카웃 ${String(d.booking_label || '예약')}`,
        totalAmount: amount, currency: 'CURRENCY_KRW', payMethod: 'CARD',
        customer: { fullName: String(d.name || ''), phoneNumber: String(d.phone || ''), email: String(d.email || '') },
        redirectUrl: window.location.origin + window.location.pathname,
      });
      // 데스크톱 팝업: 여기로 결과가 돌아옴 (모바일은 리다이렉트되어 useEffect에서 처리)
      if (resp.code != null) {
        sessionStorage.removeItem('gwaa_booking_pay');
        setPayMsg(`결제가 취소되었거나 실패했어요. [${resp.code}] ${resp.message ?? ''} — 계좌이체로도 진행하실 수 있어요.`);
        notifyUnpaid(orderId); // 결제 실패 → 안내 메일 자동 발송
        setSubmitting(false); return;
      }
      const conf = await fetch('/api/bookings/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: orderId, paymentId }) });
      const cj = await conf.json().catch(() => ({}));
      sessionStorage.removeItem('gwaa_booking_pay');
      if (!conf.ok || !cj.ok) { setPayMsg(cj.error || '결제 확인에 실패했어요. 잠시 후 다시 시도하시거나 계좌이체로 진행해 주세요.'); notifyUnpaid(orderId); setSubmitting(false); return; }
      setPaid(true); setSubmitting(false);
    } catch {
      sessionStorage.removeItem('gwaa_booking_pay');
      setPayMsg('결제 처리 중 오류가 발생했어요. 계좌이체로 진행하실 수 있어요.');
      notifyUnpaid(orderId); // 결제 실패/오류 → 안내 메일 자동 발송(서버가 pending 건만 발송)
      setSubmitting(false);
    }
  };

  // ── 스타일 헬퍼 ──
  const card = (selected: boolean): React.CSSProperties => ({
    border: `2px solid ${selected ? GREEN : BORDER}`, borderRadius: 14, padding: '22px 18px',
    cursor: 'pointer', background: selected ? '#f0fdf4' : '#fff', textAlign: 'center',
    transition: 'all .15s', boxShadow: selected ? `0 0 0 3px rgba(22,163,74,.12)` : 'none',
  });
  const nextBtn = (disabled: boolean): React.CSSProperties => ({
    display: 'block', width: '100%', maxWidth: 340, margin: '28px auto 0',
    background: disabled ? '#d1d5db' : GREEN, color: '#fff', border: 'none', borderRadius: 10,
    padding: '15px 24px', fontSize: 15, fontWeight: 700, fontFamily: MONO,
    cursor: disabled ? 'not-allowed' : 'pointer',
  });
  const stepChip = (n: number, label: string) => {
    const active = step === n, done = step > n;
    const dim = n === 2 && type === 'day';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', opacity: dim ? 0.35 : 1,
        color: active ? '#fff' : done ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: MONO }}>
        <span style={{ width: 22, height: 22, borderRadius: '50%', background: active ? GREEN : done ? GREEN_DK : 'rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{n}</span>
        {!isMobile && <span style={{ fontWeight: active ? 700 : 400 }}>{label}</span>}
      </div>
    );
  };

  const selZone = zone ? ZONES[zone] : null;
  const addCnt = Math.max(0, headcount - 2);
  const extraDogCnt = Math.max(0, dogCount - 1);
  const total = payAmount();

  return (
    <div id="booking-anchor" style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 18, overflow: 'hidden', scrollMarginTop: 80 }}>
      {/* 헤더 */}
      <div style={{ background: GREEN_DK, padding: isMobile ? '28px 20px 22px' : '36px 40px 28px', textAlign: 'center' }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.18em', color: '#bbf7d0', fontWeight: 700, marginBottom: 8 }}>PETSCOUT 2026 · {rgMode ? 'INVITE ONLY' : 'BOOKING'}</div>
        <h2 style={{ fontFamily: BEBAS, fontSize: isMobile ? 26 : 34, color: '#fff', letterSpacing: '0.02em', lineHeight: 1.1, marginBottom: 8 }}>{rgMode ? '낭만기버존 예약' : '캠핑 사이트 예약'}</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: MONO }}>{rgMode ? '초대 전용 · 낭만기버 웰니스존 · 8×8m · 2박 3일 (9/4~9/6)' : '2026. 9. 4(금) — 9. 6(일) · 강원도 고성 세계잼버리 수련장'}</p>
      </div>

      {/* 스텝바 */}
      {step < 4 && !rgMode && (
        <div style={{ background: GREEN, display: 'flex', justifyContent: 'center', padding: '12px 8px', gap: isMobile ? 2 : 8 }}>
          {stepChip(1, '일정·타입')}
          {stepChip(2, '사이트 선택')}
          {stepChip(3, '예약 정보')}
        </div>
      )}

      <div style={{ padding: isMobile ? '28px 20px 40px' : `40px ${px} 52px` }}>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div>
            <h3 style={{ fontFamily: BEBAS, fontSize: 22, textAlign: 'center', marginBottom: 24, color: '#111' }}>참가 일정을 선택하세요</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: 14, maxWidth: 560, margin: '0 auto' }}>
              {([
                ['day', 0, '당일권',  '당일',    '금·토·일 중 선택', '입장권',      '20,000원',  '/인'],
                ['two', 2, '2박 3일', '2박 3일', '9/4(금) — 6(일)',  '캠핑 사이트', '135,000원', '/사이트~'],
              ] as const).map(([t, ni, label, night, sub, plabel, price, punit]) => (
                <div key={t} onClick={() => selectType(t, label, ni)} style={card(type === t)}>
                  <span style={{ display: 'inline-block', background: GREEN, color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', padding: '3px 10px', borderRadius: 20, marginBottom: 12 }}>{label}</span>
                  <div style={{ fontFamily: BEBAS, fontSize: 22, marginBottom: 4, color: '#111' }}>{night}</div>
                  <div style={{ fontSize: 13, color: MUTED, marginBottom: 12 }}>{sub}</div>
                  <div style={{ fontSize: 13, color: MUTED, borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
                    {plabel}<br /><strong style={{ color: GREEN, fontSize: 18 }}>{price}</strong>{punit}
                    {t !== 'day' && <><br /><span style={{ fontSize: 11 }}>기본 2인 · 추가 1인당 +40,000원 · 존별 상이</span></>}
                  </div>
                </div>
              ))}
            </div>

            {type && DATE_OPTIONS[type].length > 1 && (
              <div style={{ maxWidth: 720, margin: '26px auto 0', textAlign: 'center' }}>
                <h4 style={{ fontFamily: BEBAS, fontSize: 16, marginBottom: 14, color: '#111' }}>이용 날짜를 선택하세요</h4>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {DATE_OPTIONS[type].map((o) => {
                    const sel = dateLabel === o.sub;
                    return (
                      <div key={o.sub} onClick={() => { setDates(o.dates); setDateLabel(o.sub); }} style={{ border: `2px solid ${sel ? GREEN : BORDER}`, borderRadius: 10, background: sel ? '#f0fdf4' : '#fff', cursor: 'pointer', padding: '13px 20px', minWidth: 150, boxShadow: sel ? `0 0 0 3px rgba(22,163,74,.12)` : 'none' }}>
                        <strong style={{ display: 'block', fontSize: 15, marginBottom: 2 }}>{o.label}</strong>
                        <span style={{ fontSize: 12, color: MUTED }}>{o.sub}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button disabled={!type || !dateLabel} style={nextBtn(!type || !dateLabel)} onClick={proceedFromStep1}>
              {type === 'day' ? '다음 — 예약 정보 입력' : '다음 — 사이트 선택'}
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div>
            <h3 style={{ fontFamily: BEBAS, fontSize: 22, textAlign: 'center', marginBottom: 24, color: '#111' }}>원하는 사이트를 선택하세요</h3>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
              {/* 지도 */}
              <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
                <div ref={vpRef} onMouseDown={(e) => onDown(e.pageX, e.pageY)}
                  style={{ position: 'relative', border: `2px solid ${BORDER}`, borderRadius: 12, background: '#fff', overflow: 'auto', maxHeight: '72vh', cursor: zoom > 1 ? 'grab' : 'default' }}>
                  <div style={{ position: 'relative', width: `${zoom * 100}%`, transition: 'width .15s ease' }}>
                    <img src={SITEMAP} alt="펫스카웃 2026 사이트 배치도" style={{ width: '100%', display: 'block' }} draggable={false} />
                    <svg viewBox="0 0 894 709" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                      {Object.entries(ZONES).filter(([key]) => key !== 'RG').map(([key, z]) => {
                        const coords = z.poly.split(' ').map((p) => p.split(',').map(Number));
                        const cx = coords.reduce((s, p) => s + p[0], 0) / coords.length;
                        const cy = coords.reduce((s, p) => s + p[1], 0) / coords.length;
                        const full = zoneFullyBooked(key);
                        const sel = zone === key;
                        return (
                          <g key={key} onClick={() => { if (!pan.current.moved && !full) selectZone(key); pan.current.moved = false; }} style={{ cursor: full ? 'not-allowed' : 'pointer' }}>
                            <polygon points={z.poly}
                              fill={sel ? 'rgba(22,163,74,0.5)' : full ? 'rgba(200,50,50,0.2)' : 'rgba(22,163,74,0.15)'}
                              stroke={sel ? GREEN : full ? '#c83232' : GREEN} strokeWidth={sel ? 2.5 : 1.5} />
                            <text x={cx} y={cy + 4} textAnchor="middle" style={{ fill: '#14532d', fontSize: 11, fontWeight: 700, pointerEvents: 'none', fontFamily: MONO }}>{key}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => doZoom(-1)} style={zoomBtn}>－</button>
                  <span style={{ fontSize: 14, fontWeight: 700, minWidth: 48, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
                  <button type="button" onClick={() => doZoom(1)} style={zoomBtn}>＋</button>
                  <button type="button" onClick={() => doZoom(0)} style={{ ...zoomBtn, width: 'auto', padding: '0 14px', fontSize: 13, color: MUTED }}>원래대로</button>
                  {!isMobile && <span style={{ fontSize: 12, color: MUTED, marginLeft: 'auto' }}>＋로 확대 후 드래그하여 이동</span>}
                </div>
                {/* 구역 바로 선택 — 지도에서 못 찾는 소규모 존(F1·F3 등)도 한 번에 선택 (잔여 수는 미표시) */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 7 }}>구역 바로 선택</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {Object.entries(ZONES).filter(([key]) => key !== 'RG').map(([key, z]) => {
                      const full = z.sites.every((s) => !isSiteAvailable(s));
                      const sel = zone === key;
                      return (
                        <button key={key} type="button" disabled={full}
                          onClick={() => selectZone(key)}
                          style={{ padding: '7px 12px', borderRadius: 9999, border: `1.5px solid ${sel ? GREEN : full ? '#e5e7eb' : BORDER}`, background: sel ? GREEN : full ? '#f3f4f6' : '#fff', color: sel ? '#fff' : full ? '#9ca3af' : '#374151', fontSize: 12.5, fontWeight: 700, cursor: full ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                          {z.label.replace(' 구역', '')}{full ? ' · 마감' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
                  <Legend color="rgba(22,163,74,0.4)" border={GREEN} label="예약 가능" />
                  <Legend color="rgba(22,163,74,0.6)" border={GREEN} label="선택 중" />
                  <Legend color="rgba(200,50,50,0.25)" border="#c83232" label="예약 완료" />
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', lineHeight: 1.6, fontWeight: 600 }}>
                  ⚡ <strong>전 사이트 전기 사용 불가</strong> — 보조배터리·파워뱅크를 꼭 준비해 주세요.
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: MUTED, background: '#f9fafb', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 12px', lineHeight: 1.6 }}>
                  <strong style={{ color: GREEN_DK }}>FP · 패밀리 프라이빗존</strong>은 통임대 전용 구역으로 온라인 개별 예약 대상이 아닙니다. 이용을 원하시면 협회(033-813-0333)로 문의해 주세요.
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: GREEN_DK, background: '#f0fdf4', border: `1px solid #bbf7d0`, borderRadius: 8, padding: '10px 12px', lineHeight: 1.6, fontWeight: 600 }}>
                  👥 <strong>단체·기업 예약(다수 사이트)</strong>은 별도 구역 배정·할인이 가능합니다. 협회(033-813-0333 · ganimal1@naver.com)로 문의해 주세요.
                </div>
              </div>

              {/* 패널 */}
              <div style={{ width: isMobile ? '100%' : 300, flexShrink: 0 }}>
                <div style={{ background: '#fff', border: `2px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
                  {!selZone ? (
                    <div style={{ textAlign: 'center', padding: '36px 16px', color: MUTED, fontSize: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><MapIcon size={30} color={GREEN} strokeWidth={1.6} /></div>
                      지도에서 구역을 클릭하면<br />상세 정보가 표시됩니다
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontFamily: BEBAS, fontSize: 22, color: GREEN_DK, marginBottom: 6 }}>{selZone.label}</div>
                      <div style={{ fontSize: 13, color: MUTED, marginBottom: 14 }}>{selZone.desc}</div>
                      <div style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 14px', marginBottom: 14 }}>
                        <div style={{ fontSize: 12, color: MUTED, marginBottom: 4 }}>
                          {TIER_LABEL[selZone.tier]} · 2박 3일 (기본 2인)
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: GREEN }}>{TIER_PRICE[selZone.tier].toLocaleString()}원</div>
                        <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>추가 1인 +{EXTRA_PERSON.toLocaleString()}원 · 반려견 1마리 무료 · 2마리부터 +{EXTRA_DOG.toLocaleString()}원</div>
                      </div>

                      {/* 날짜칩 */}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                        {FESTIVAL_DATES.map((d) => {
                          const on = requiredDates().includes(d); const L = DATE_LABELS[d];
                          return (
                            <div key={d} style={{ flex: 1, textAlign: 'center', border: `1.5px solid ${on ? GREEN : BORDER}`, borderRadius: 8, padding: '7px 4px', background: on ? GREEN : '#fff', color: on ? '#fff' : MUTED }}>
                              <strong style={{ display: 'block', fontSize: 13 }}>{L.d}</strong>
                              <span style={{ fontSize: 10, opacity: 0.85 }}>{L.w}{on ? ' 이용' : ''}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* 인원 */}
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>참가 인원 <span style={{ fontSize: 11, fontWeight: 400, color: MUTED }}>(사이트 1개 · 기본 2인)</span></label>
                        <select value={headcount} onChange={(e) => setHeadcount(parseInt(e.target.value))} style={selectStyle}>
                          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n === 5 ? '5인 이상' : `${n}인`}</option>)}
                        </select>
                      </div>

                      {/* 반려견 수 */}
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>반려견 수 <span style={{ fontSize: 11, fontWeight: 400, color: MUTED }}>(1마리 무료 · 2마리부터 +1만원)</span></label>
                        <select value={dogCount} onChange={(e) => setDogCount(parseInt(e.target.value))} style={selectStyle}>
                          {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n === 5 ? '5마리 이상' : `${n}마리`}</option>)}
                        </select>
                        <p style={{ fontSize: 12, color: GREEN_DK, margin: '7px 0 0', lineHeight: 1.5, fontWeight: 600 }}>🐾 반려견 없이 오시나요? <b>0마리</b>를 선택하세요 — 공연·클래스·캠핑 모두 즐기실 수 있어요.</p>
                      </div>

                      {/* 사이트 목록 */}
                      <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>사이트 선택</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                        {selZone.sites.map((s) => {
                          const avail = isSiteAvailable(s); const sel = site === s;
                          return (
                            <button key={s} type="button" disabled={!avail} onClick={() => avail && selectSite(s)}
                              style={{ padding: '6px 4px', borderRadius: 6, border: `1.5px solid ${sel ? GREEN : avail ? BORDER : '#ddd'}`, background: sel ? GREEN : avail ? '#fff' : '#f5f5f5', color: sel ? '#fff' : avail ? '#374151' : '#bbb', fontSize: 12, fontWeight: 700, cursor: avail ? 'pointer' : 'not-allowed', fontFamily: MONO }}>{siteLabel(s)}</button>
                          );
                        })}
                      </div>

                      {/* 총액 */}
                      {site && (
                        <div style={{ marginTop: 14, padding: '12px 14px', background: GREEN_DK, borderRadius: 8, textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 3 }}>{typeLabel} · {headcount}인 · 반려견 {dogCount}마리 · {selZone.label} {siteLabel(site)}</div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>총 <span style={{ color: '#bbf7d0' }}>{total.toLocaleString()}원</span></div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                            사이트 {unitPrice().toLocaleString()}원 (2인){addCnt > 0 ? ` + 추가 ${addCnt}인 ${(addCnt * EXTRA_PERSON).toLocaleString()}원` : ''}{extraDogCnt > 0 ? ` + 반려견 ${extraDogCnt}두 ${(extraDogCnt * EXTRA_DOG).toLocaleString()}원` : ''}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button disabled={!site} style={nextBtn(!site)} onClick={() => goStep(3)}>다음 — 예약 정보 입력</button>
                <button onClick={() => goStep(1)} style={backText}>← 일정 선택으로 돌아가기</button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {/* 요약 */}
            <div style={{ background: GREEN_DK, borderRadius: 12, padding: '18px 22px', marginBottom: 26, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <Summary label="일정" value={typeLabel} />
              <Summary label="날짜" value={dateLabel || '-'} />
              {type === 'day'
                ? <Summary label="유형" value="축제 관람권" />
                : rgMode
                  ? <><Summary label="구역" value="낭만기버존 (8×8m)" /><Summary label="자리" value={site ? siteLabel(site) : '-'} /></>
                  : <><Summary label="구역" value={selZone?.label || '-'} /><Summary label="사이트" value={site ? siteLabel(site) : '-'} /></>}
              <Summary label="인원" value={`${headcount}인`} />
              <Summary label="예약금액" value={`${total.toLocaleString()}원`} highlight />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
              {rgMode && (
                <div style={{ gridColumn: '1 / -1', border: `2px solid ${site ? GREEN : BORDER}`, borderRadius: 12, padding: isMobile ? 14 : 18, background: site ? '#f0fdf4' : '#fff' }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 4 }}>낭만기버존 자리 선택 *</label>
                  <p style={{ fontSize: 12.5, color: MUTED, margin: '0 0 12px', lineHeight: 1.6 }}>8×8m · 초대 전용 · 원하는 자리를 선택하세요{site ? ` — 선택: ${siteLabel(site)}번` : ''}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(6,1fr)' : 'repeat(9,1fr)', gap: 6 }}>
                    {ZONES.RG.sites.map((s) => {
                      const avail = isSiteAvailable(s); const sel = site === s;
                      return (
                        <button key={s} type="button" disabled={!avail} onClick={() => setSite(s)}
                          style={{ padding: '8px 4px', borderRadius: 8, border: `1.5px solid ${sel ? GREEN : avail ? BORDER : '#ddd'}`, background: sel ? GREEN : avail ? '#fff' : '#f5f5f5', color: sel ? '#fff' : avail ? '#374151' : '#bbb', fontSize: 13, fontWeight: 700, cursor: avail ? 'pointer' : 'not-allowed', fontFamily: MONO }}>{siteLabel(s)}</button>
                      );
                    })}
                  </div>
                </div>
              )}
              <Field label="예약자 이름 *"><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="홍길동" /></Field>
              <Field label="연락처 *"><input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="010-0000-0000" /></Field>
              <Field label="이메일 * (입장권이 이 주소로 발송됩니다)"><input style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@naver.com" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} /></Field>
              {(() => { const s = suggestEmail(form.email.trim()); return s ? (
                <div style={{ marginTop: -4, marginBottom: 8, fontSize: 12.5, color: '#b45309' }}>
                  혹시 <strong>{s}</strong> 아닌가요?{' '}
                  <button type="button" onClick={() => { setForm({ ...form, email: s }); setEmailConfirm(s); }} style={{ color: '#16a34a', fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12.5 }}>적용</button>
                </div>
              ) : null; })()}
              <Field label="이메일 재확인 *"><input style={inputStyle} value={emailConfirm} onChange={(e) => setEmailConfirm(e.target.value)} placeholder="이메일을 한 번 더 입력" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} /></Field>
              {emailConfirm.trim() !== '' && form.email.trim().toLowerCase() !== emailConfirm.trim().toLowerCase() && (
                <div style={{ marginTop: -4, marginBottom: 8, fontSize: 12.5, color: '#dc2626' }}>이메일이 일치하지 않아요. 다시 확인해 주세요.</div>
              )}
              {type === 'day' && (
                <>
                  <Field label="참가 인원 (관람) *">
                    <select style={inputStyle} value={headcount} onChange={(e) => setHeadcount(parseInt(e.target.value))}>
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n === 5 ? '5인 이상' : `${n}인`}</option>)}
                    </select>
                  </Field>
                  <Field label="반려견 수">
                    <select style={inputStyle} value={dogCount} onChange={(e) => setDogCount(parseInt(e.target.value))}>
                      {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n === 5 ? '5마리 이상' : `${n}마리`}</option>)}
                    </select>
                    <p style={{ fontSize: 12, color: GREEN_DK, margin: '7px 0 0', lineHeight: 1.5, fontWeight: 600 }}>🐾 반려견 없이 오시면 <b>0마리</b> 선택 — 반려견 없이도 관람·체험 모두 가능해요.</p>
                  </Field>
                </>
              )}
              {rgMode && (
                <>
                  <Field label="참가 인원 * (기본 2인)">
                    <select style={inputStyle} value={headcount} onChange={(e) => setHeadcount(parseInt(e.target.value))}>
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n === 5 ? '5인 이상' : `${n}인`}</option>)}
                    </select>
                  </Field>
                  <Field label="반려견 수 * (1마리 무료·2마리부터 +1만원)">
                    <select style={inputStyle} value={dogCount} onChange={(e) => setDogCount(parseInt(e.target.value))}>
                      {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n === 5 ? '5마리 이상' : `${n}마리`}</option>)}
                    </select>
                  </Field>
                </>
              )}
              {dogCount > 0 && (
                <>
                  <Field label="반려견 이름 *"><input style={inputStyle} value={form.petName} onChange={(e) => setForm({ ...form, petName: e.target.value })} placeholder="몽이" /></Field>
                  <Field label="견종 (선택)"><input style={inputStyle} value={form.petBreed} onChange={(e) => setForm({ ...form, petBreed: e.target.value })} placeholder="말티즈" /></Field>
                  <Field label="반려견 나이 (선택)"><input style={inputStyle} value={form.petAge} onChange={(e) => setForm({ ...form, petAge: e.target.value })} placeholder="3살" /></Field>
                  <Field label="예방접종 완료 여부 (선택)">
                    <select style={inputStyle} value={form.petVaccine} onChange={(e) => setForm({ ...form, petVaccine: e.target.value })}>
                      <option value="">선택 안 함</option><option value="yes">완료</option><option value="no">미완료</option>
                    </select>
                  </Field>
                </>
              )}


              {/* 웰니스 클래스 추가 (유료·선택) */}
              <div style={{ gridColumn: '1 / -1', border: `2px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? 16 : 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>웰니스 클래스 추가</span>
                  <span style={{ fontSize: 11, fontWeight: 700, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: 9999 }}>클래스 1인 {clsPrice.toLocaleString()}원 · 아로마 1인 10,000원</span>
                </div>
                <p style={{ fontSize: 12.5, color: MUTED, margin: '0 0 14px', lineHeight: 1.6, wordBreak: 'keep-all' }}>원하는 세션과 신청 인원(명)을 선택하세요. 숙박 인원과 무관하게 신청 인원만큼만 결제됩니다.</p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                  {CLASS_TYPES.map((c) => (
                    <div key={c.name} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 8, background: c.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, backgroundImage: c.img ? `url(${c.img})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>{c.img ? '' : c.emoji}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111' }}>{c.name}</div>
                          <div style={{ fontSize: 11.5, color: MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.host} · {c.desc}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 10px 10px' }}>
                        {c.slots.map((slot) => {
                          const label = classLabel(c, slot);
                          const q = classQty[label] || 0;
                          return (
                            <div key={slot} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, border: `1.5px solid ${q ? GREEN : BORDER}`, borderRadius: 8, padding: '5px 8px', background: q ? '#f0fdf4' : '#fff' }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', fontFamily: MONO }}>{slot}</span>
                              <select value={q} onChange={(e) => setQty(label, parseInt(e.target.value))} style={{ fontSize: 12, padding: '3px 6px', borderRadius: 6, border: `1px solid ${BORDER}`, background: '#fff' }}>
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n === 0 ? '인원 선택' : `${n}명`}</option>)}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {/* 아로마 DIY 상시체험 */}
                <div style={{ marginTop: 10, border: `1px solid ${BORDER}`, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', gap: 10, padding: 10, flexWrap: 'wrap' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: 'linear-gradient(135deg,#0ea5e9,#7dd3fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🧴</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111' }}>아로마 DIY <span style={{ fontSize: 11, fontWeight: 700, color: '#b45309' }}>· 1인 10,000원</span></div>
                    <div style={{ fontSize: 11.5, color: MUTED, wordBreak: 'keep-all' }}>펫 아로마 치약·샴푸·롤온 만들기 (택1) · 9/5(토) 상시 10:00~18:00</div>
                  </div>
                  <select value={aromaQty} onChange={(e) => setAromaQty(parseInt(e.target.value))} style={{ fontSize: 12, padding: '5px 8px', borderRadius: 6, border: `1px solid ${BORDER}`, background: '#fff' }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n === 0 ? '인원 선택' : `${n}명`}</option>)}
                  </select>
                </div>
                {(Object.keys(classQty).length > 0 || aromaQty > 0) && (
                  <div style={{ marginTop: 12, background: '#f0fdf4', border: `1px solid #dcfce7`, borderRadius: 8, padding: '10px 14px', fontSize: 12.5, color: GREEN_DK, fontWeight: 700, lineHeight: 1.7 }}>
                    {Object.entries(classQty).map(([l, n]) => <div key={l}>· {l} — {n}명 × {clsPrice.toLocaleString()}원</div>)}
                    {aromaQty > 0 && <div>· 🧴 아로마 DIY — {aromaQty}명 × 10,000원</div>}
                    <div style={{ marginTop: 4 }}>추가 합계 +{classCost().toLocaleString()}원</div>
                  </div>
                )}
                <p style={{ fontSize: 11, color: '#9ca3af', margin: '10px 0 0' }}>* 클래스 이미지는 준비 중입니다.</p>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="요청사항"><textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.request} onChange={(e) => setForm({ ...form, request: e.target.value })} placeholder="특이사항이나 요청사항을 입력해 주세요." /></Field>
              </div>

              <div style={{ gridColumn: '1 / -1', background: '#f9fafb', borderRadius: 8, padding: 16, fontSize: 13, color: MUTED, lineHeight: 1.7 }}>
                <strong style={{ color: '#111' }}>개인정보 수집·이용 및 참가 안내 동의 (필수)</strong>
                <div style={{ marginTop: 8 }}>
                  <strong>① 개인정보 수집·이용</strong> — 수집 항목: 이름, 연락처, 이메일, 반려동물 정보 / 목적: 행사 참가자 관리·안내 및 <strong>현장 사진·영상의 행사 기록·홍보(웹사이트·SNS·간행물 등) 활용</strong> / 보유 기간: 행사 종료 후 즉시 파기. (촬영을 원치 않으시면 현장 스태프에게 말씀해 주시면 노출을 최소화합니다.)
                </div>
                <div style={{ marginTop: 6 }}>
                  <strong>② 안전 및 책임</strong> — 반려견의 관리 책임은 보호자에게 있으며, <strong>보호자의 부주의로 발생한 사고(반려견 간 사고, 물림, 분실, 부상 등)에 대해 협회는 책임지지 않습니다.</strong> (다만 협회의 고의 또는 중대한 과실로 인한 경우는 제외합니다.)
                </div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3, accentColor: GREEN }} />
                  <span style={{ color: '#111', fontWeight: 600 }}>위 개인정보 수집·이용, 촬영·홍보 활용 및 참가 안내 사항에 모두 동의합니다</span>
                </label>
              </div>
            </div>

            {/* 웰컴키트 — 결제 직전 가치 강조 */}
            <a href="/images/events/jamboree-2026/welcomekit.webp" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 20, padding: '12px 14px', border: `1px solid ${GREEN}`, background: '#f0fdf4', borderRadius: 12, textDecoration: 'none', color: 'inherit' }}>
              <img src="/images/events/jamboree-2026/welcomekit.webp" alt="예약 전원 증정 웰컴키트" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: `1px solid ${BORDER}` }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: GREEN_DK, lineHeight: 1.35 }}>예약 전원에게 웰컴키트 증정 🎁</div>
                <div style={{ fontSize: 12.5, color: MUTED, marginTop: 3, lineHeight: 1.5, wordBreak: 'keep-all' }}>러닝벨트·맥가이버툴·LED랜턴·에코백·사료샘플 등. 추가 인원에게도 모두 드려요. (탭하면 크게)</div>
              </div>
            </a>

            {CARD_ENABLED && inApp && (
              <div style={{ background: '#fff7ed', border: '1px solid #fdba74', borderRadius: 10, padding: '12px 14px', marginTop: 12, fontSize: 12.5, color: '#9a3412', lineHeight: 1.65, textAlign: 'left' }}>
                ⚠️ 인스타·카톡 앱 안에서 여시면 <b>결제 후 화면이 안 돌아올 수 있어요.</b> 원활한 카드결제를 위해 Chrome·Safari 등 기본 브라우저로 열어주세요.
                <button type="button" onClick={() => { try { navigator.clipboard?.writeText(window.location.href); setLinkCopied(true); } catch { /* noop */ } }} style={{ display: 'block', width: '100%', marginTop: 8, padding: '9px', borderRadius: 8, border: '1px solid #fdba74', background: '#fff', color: '#9a3412', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>{linkCopied ? '✓ 링크 복사됨 — 브라우저에 붙여넣어 여세요' : '📋 링크 복사하기'}</button>
              </div>
            )}

            <div style={{ background: '#f0fdf4', border: `2px solid ${GREEN}`, borderRadius: 10, padding: '14px 18px', marginTop: 12, textAlign: 'center', fontSize: 14, color: MUTED }}>
              입금 예정 금액 &nbsp; <strong style={{ fontSize: 22, color: GREEN, fontWeight: 700 }}>{total.toLocaleString()}원</strong>
              <div style={{ fontSize: 12, marginTop: 4 }}>{CARD_ENABLED ? '예약 접수 후 다음 화면에서 카드 즉시결제 또는 계좌이체로 확정합니다.' : '예약 접수 후 다음 화면에서 입금 계좌를 안내해 드립니다. (계좌이체 접수)'}</div>
              <div style={{ fontSize: 11.5, marginTop: 6, color: '#6b7280' }}>
                취소·환불은 <a href="/refund" target="_blank" style={{ color: GREEN, fontWeight: 600 }}>환불 정책</a>을 따릅니다. (행사 7일 전 전액 · 3~6일 전 50% · 2일 전~당일 불가)
              </div>
            </div>

            {errorMsg && <div style={{ color: '#dc2626', fontSize: 13, textAlign: 'center', marginTop: 14 }}>{errorMsg}</div>}

            {CARD_ENABLED ? (
              isMobile ? (
                // 모바일: 계좌이체를 기본(초록)으로, 카드는 아래(보조). 모바일 카드결제가 KCP측 이슈로 불안정해서 계좌이체 우선.
                <>
                  <button type="button" disabled={submitting} onClick={() => submit(true)} style={{ ...nextBtn(submitting), maxWidth: '100%', marginTop: 20 }}>
                    {submitting ? '예약 접수 중...' : `🏦 계좌이체로 예약하기 (${total.toLocaleString()}원)`}
                  </button>
                  <button type="button" disabled={submitting} onClick={() => submit()} style={{ display: 'block', width: '100%', maxWidth: '100%', margin: '10px 0 0', padding: '15px', borderRadius: 12, border: `1.5px solid ${GREEN}`, background: '#fff', color: GREEN_DK, fontWeight: 700, fontSize: 15, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.5 : 1 }}>
                    💳 카드로 결제하기
                  </button>
                  <div style={{ fontSize: 12, color: MUTED, textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>휴대폰에서는 계좌이체가 가장 확실해요. 카드 결제도 가능합니다.</div>
                </>
              ) : (
                // 데스크톱: 카드 즉시결제가 정상 동작 → 카드를 기본으로.
                <>
                  <button disabled={submitting} onClick={() => submit()} style={{ ...nextBtn(submitting), maxWidth: '100%', marginTop: 20 }}>
                    {submitting ? '예약 접수 중...' : `💳 카드로 결제하고 예약 확정 (${total.toLocaleString()}원)`}
                  </button>
                  <button type="button" disabled={submitting} onClick={() => submit(true)} style={{ display: 'block', width: '100%', maxWidth: '100%', margin: '10px 0 0', padding: '15px', borderRadius: 12, border: `1.5px solid ${GREEN}`, background: '#fff', color: GREEN_DK, fontWeight: 700, fontSize: 15, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.5 : 1 }}>
                    🏦 계좌이체로 예약하기
                  </button>
                  <div style={{ fontSize: 12, color: MUTED, textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>계좌이체를 선택하면 다음 화면에서 입금 계좌를 안내해 드려요.</div>
                </>
              )
            ) : (
              <button disabled={submitting} onClick={() => submit()} style={{ ...nextBtn(submitting), maxWidth: '100%', marginTop: 20 }}>
                {submitting ? '예약 접수 중...' : `예약 접수하기 (${total.toLocaleString()}원)`}
              </button>
            )}
            {!rgMode && <button onClick={() => goStep(type === 'day' ? 1 : 2)} style={backText}>← {type === 'day' ? '일정' : '사이트'} 선택으로 돌아가기</button>}
          </div>
        )}

        {/* ── STEP 4 ── */}
        {step === 4 && doneData && (() => {
          const d = doneData as Record<string, unknown>;
          const isDay = d.booking_type === 'day';
          const dAmount = Number(d.amount) || 0;
          return (
          <div style={{ textAlign: 'center', padding: isMobile ? '20px 0' : '40px 0' }}>
            {submitting ? (
              <>
                <style>{'@keyframes gwaaspin{to{transform:rotate(360deg)}}'}</style>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}><Loader2 size={40} color={GREEN} strokeWidth={2} style={{ animation: 'gwaaspin 1s linear infinite' }} /></div>
                <h3 style={{ fontFamily: BEBAS, fontSize: 26, color: GREEN_DK, marginBottom: 12 }}>결제 승인 확인 중...</h3>
                <p style={{ fontSize: 14, color: MUTED }}>잠시만 기다려 주세요. 창을 닫지 마세요.</p>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>{paid ? <CheckCircle2 size={56} color={GREEN} strokeWidth={1.6} /> : <Clock size={56} color="#f59e0b" strokeWidth={1.6} />}</div>
                <h3 style={{ fontFamily: BEBAS, fontSize: 28, color: paid ? GREEN_DK : '#b45309', marginBottom: 6 }}>{paid ? '예약이 확정되었습니다' : '예약 대기중'}</h3>
                <p style={{ fontSize: 14, color: GREEN, fontWeight: 700, marginBottom: 18 }}>{paid ? '결제가 완료되어 입장권을 보내드렸어요 🐾' : (CARD_ENABLED ? '카드로 즉시 결제하거나, 계좌이체로 확정하세요 🐾' : '아래 계좌로 입금하시면 예약이 확정됩니다 🐾')}</p>
                <div style={{ background: '#fff', border: `2px solid ${BORDER}`, borderRadius: 12, padding: 22, maxWidth: 420, margin: '0 auto 16px', textAlign: 'left' }}>
                  <DoneRow label="예약자" value={String(d.name)} />
                  <DoneRow label="일정" value={`${d.booking_label} · ${d.date_label}`} />
                  <DoneRow label="사이트" value={isDay ? '축제 관람권' : (d.zone === '낭만기버존' ? `낭만기버존 · ${siteLabel(String(d.site))}번` : `${d.zone} 구역 · ${siteLabel(String(d.site))}`)} />
                  <DoneRow label="인원" value={`${d.headcount}인`} />
                  {Array.isArray(d.classes) && (d.classes as string[]).length > 0 && (
                    <div style={{ padding: '10px 0 2px' }}>
                      <div style={{ fontSize: 13, color: MUTED, marginBottom: 6 }}>웰니스 클래스</div>
                      {(d.classes as string[]).map((c) => <div key={c} style={{ fontSize: 13, fontWeight: 700, color: '#111', padding: '2px 0' }}>· {c}</div>)}
                    </div>
                  )}
                </div>
                {d.ticket_token && (
                  <a href={`/t/${String(d.ticket_token)}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', maxWidth: 420, margin: '0 auto 16px', background: GREEN_DK, color: '#fff', textDecoration: 'none', borderRadius: 12, padding: '14px 20px', textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
                    🎫 내 입장권(QR) 확인하기 →<div style={{ fontSize: 11.5, fontWeight: 400, color: 'rgba(255,255,255,0.8)', marginTop: 3 }}>입금 확인 후 입장 QR이 활성화됩니다 · 링크를 저장해 두세요</div>
                  </a>
                )}
                {paid ? (
                <div style={{ background: '#f0fdf4', border: `2px solid ${GREEN}`, borderRadius: 12, padding: 22, maxWidth: 420, margin: '0 auto 20px', textAlign: 'left' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: GREEN_DK, marginBottom: 6 }}>✅ 결제가 완료되었습니다</div>
                  <div style={{ fontSize: 13.5, color: '#111', lineHeight: 1.7 }}>입장권(QR)을 이메일<strong>({String(d.email)})</strong>로 보내드렸어요. 위 <strong>내 입장권</strong> 버튼에서도 확인하실 수 있습니다.</div>
                </div>
                ) : (
                <>
                {CARD_ENABLED && (
                  <>
                    {inApp && (
                      <div style={{ background: '#fff7ed', border: '1px solid #fdba74', borderRadius: 10, padding: '12px 14px', maxWidth: 420, margin: '0 auto 10px', fontSize: 12.5, color: '#9a3412', lineHeight: 1.65, textAlign: 'left' }}>
                        ⚠️ 인스타·카톡 앱 안에서는 결제 후 화면이 안 돌아올 수 있어요. Chrome·Safari 등 기본 브라우저로 열어주세요.
                        <button type="button" onClick={() => { try { navigator.clipboard?.writeText(window.location.href); setLinkCopied(true); } catch { /* noop */ } }} style={{ display: 'block', width: '100%', marginTop: 8, padding: '9px', borderRadius: 8, border: '1px solid #fdba74', background: '#fff', color: '#9a3412', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>{linkCopied ? '✓ 링크 복사됨 — 브라우저에 붙여넣어 여세요' : '📋 링크 복사하기'}</button>
                      </div>
                    )}
                    <button type="button" onClick={() => payCard()} style={isMobile
                      ? { display: 'block', width: '100%', maxWidth: 420, margin: '0 auto 8px', padding: '13px', borderRadius: 12, border: `1.5px solid ${GREEN}`, background: '#fff', color: GREEN_DK, fontWeight: 700, fontSize: 14, cursor: 'pointer' }
                      : { display: 'block', width: '100%', maxWidth: 420, margin: '0 auto 8px', padding: '16px', borderRadius: 12, border: 'none', background: GREEN, color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>💳 카드로 즉시 결제하고 확정하기</button>
                    <div style={{ fontSize: 12, color: MUTED, marginBottom: 14 }}>{isMobile ? '휴대폰에서는 아래 계좌이체를 권장해요.' : '카드 결제 시 입장권이 바로 발송됩니다 · 또는 아래 계좌이체'}</div>
                  </>
                )}
                {payMsg && <div style={{ maxWidth: 420, margin: '0 auto 12px', fontSize: 13, color: '#dc2626', fontWeight: 600, lineHeight: 1.6 }}>{payMsg}</div>}
                <div style={{ background: '#f0fdf4', border: `2px solid ${GREEN}`, borderRadius: 12, padding: 22, maxWidth: 420, margin: '0 auto 20px', textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: GREEN_DK, marginBottom: 12 }}>{CARD_ENABLED ? '🏦 계좌이체로 입금' : '💳 입금 계좌'}</div>
                  <DoneRow label="은행" value={ACCOUNT.bank} />
                  <DoneRow label="계좌번호" value={ACCOUNT.number} highlight />
                  <button type="button" onClick={copyAccount} style={{ width: '100%', margin: '8px 0 2px', padding: '11px', borderRadius: 9, border: `1.5px solid ${GREEN}`, background: copied ? GREEN : '#fff', color: copied ? '#fff' : GREEN_DK, fontWeight: 800, fontSize: 13.5, cursor: 'pointer', fontFamily: MONO }}>
                    {copied ? '✓ 계좌번호 복사됨' : '📋 계좌번호 복사하기'}
                  </button>
                  <DoneRow label="예금주" value={ACCOUNT.holder} />
                  <DoneRow label="입금 금액" value={`${dAmount.toLocaleString()}원`} highlight />
                  <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.75, marginTop: 12, marginBottom: 0 }}>
                    · 입금자명은 <strong style={{ color: '#111' }}>예약자 성함({String(d.name)})</strong>으로 해주세요.<br />
                    · <strong style={{ color: '#111' }}>예약 후 3일 이내</strong> 입금해 주세요. (미입금 시 자동 취소)<br />
                    · 입금이 확인되면 예약이 최종 확정되고 안내드립니다.
                  </p>
                </div>
                </>
                )}
                <div style={{ fontSize: 13, color: MUTED }}>문의 · 강원도반려동물협회 033-813-0333 · ganimal1@naver.com</div>
              </>
            )}
          </div>
          );
        })()}
      </div>
    </div>
  );
}

// ── 작은 서브 컴포넌트 ──
const zoomBtn: React.CSSProperties = { width: 40, height: 40, borderRadius: 8, border: `2px solid ${BORDER}`, background: '#fff', fontSize: 18, fontWeight: 700, color: GREEN_DK, cursor: 'pointer', fontFamily: MONO, lineHeight: 1 };
const selectStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: `2px solid ${BORDER}`, borderRadius: 8, fontSize: 14, fontFamily: MONO, background: '#fff' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', border: `2px solid ${BORDER}`, borderRadius: 8, fontSize: 15, fontFamily: MONO, background: '#fff', color: '#1f2937' };
const backText: React.CSSProperties = { display: 'block', textAlign: 'center', margin: '14px auto 0', fontSize: 14, color: MUTED, cursor: 'pointer', background: 'none', border: 'none', fontFamily: MONO };

function Legend({ color, border, label }: { color: string; border: string; label: string }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: MUTED }}><span style={{ width: 12, height: 12, borderRadius: 2, background: color, border: `1.5px solid ${border}` }} />{label}</div>;
}
function Summary({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div><div style={{ fontSize: 16, fontWeight: 700, color: highlight ? '#bbf7d0' : '#fff', fontFamily: BEBAS, letterSpacing: '0.02em' }}>{value}</div></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><label style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{label}</label>{children}</div>;
}
function DoneRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${BORDER}`, fontSize: 14 }}><span style={{ color: MUTED }}>{label}</span><span style={{ fontWeight: 700, color: highlight ? GREEN : '#111' }}>{value}</span></div>;
}
