'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { clientDB } from '@/lib/db/clientDB';
import { effectiveStatus, eventDates } from '@/lib/eventStatus';

// Store name constants (maps to API table names)
const STORES = {
  EVENT:    'eventCards',
  ARCHIVE:  'archiveEvents',
  MATESHIP: 'mateshipPartners',
  ACTIVITY: 'activityCards',
  LOOKBOOK: 'lookbookItems',
  PLACES:   'travelPlaces',
  HASHTAGS: 'pageHashtags',
  HERO:     'heroImages',
  GALLERY:  'galleryItems',
} as const;
import {
  EventCard, EventStatus, MateshipPartner, GalleryItem,
  ArchiveEvent, ActivityCard, LookbookItem, TravelPlace, PageHashtags,
} from '@/types';

type Tab = 'dashboard' | 'applications' | 'inquiries' | 'proposals' | 'members' | 'payments' | 'bookings' | 'classes' | 'sellers' | 'survey' | 'sms' | 'events' | 'archive' | 'partners' | 'images' | 'content' | 'travel' | 'settings';

type SurveyRow = {
  id: number; event_id: number; overall?: number; programs?: string; revisit?: number;
  rating_program?: number; rating_booth?: number; rating_facility?: number; rating_safety?: number;
  source?: string; region?: string; pet_with?: boolean; liked?: string; improve?: string; phone?: string; created_at?: string;
};
type SurveyStats = {
  total: number; overall: number | null; revisit: number | null;
  rating_program: number | null; rating_booth: number | null; rating_facility: number | null; rating_safety: number | null;
  programCounts: Record<string, number>; sourceCounts: Record<string, number>; regionCounts: Record<string, number>; petWith: number;
};

type Seller = {
  id: number; event_id: number; brand_name: string; rep_name: string; phone: string; email?: string;
  category?: string; items?: string; needs_power?: boolean; needs_table?: boolean; vehicle?: string;
  sns?: string; biz_no?: string; status: string; admin_note?: string; created_at?: string;
  join_type?: string; sponsor_items?: string; fee_paid?: boolean; notified_at?: string;
};

interface Payment { id?: number; payment_id?: string; kind?: string; amount?: number; name?: string; phone?: string; email?: string; status?: string; paid_at?: string; created_at?: string; }

interface Proposal {
  id?: number; kind?: string; name?: string; region?: string; category?: string;
  contact?: string; email?: string; link?: string; message?: string; created_at?: string;
}

interface Member {
  id?: number; member_no?: string; name?: string; phone?: string; email?: string;
  region?: string; status?: string; plan?: string; joined_at?: string; expires_at?: string;
  note?: string; created_at?: string;
}

type Booking = {
  id?: number; event_id?: number; booking_type?: string; booking_label?: string; date_label?: string;
  zone?: string; site?: string; headcount?: number; tshirt_sizes?: string[];
  name?: string; phone?: string; email?: string; pet_name?: string; pet_breed?: string;
  pet_age?: string; pet_vaccine?: string; request?: string; amount?: number;
  status?: string; created_at?: string; ticket_token?: string; checked_in_at?: string;
  pay_method?: string; payment_key?: string; paid_at?: string; ticket_sent_at?: string;
};

// ── 클래스(웰니스) 신청 집계 — bookings의 tshirt_sizes에서 파싱 ──
// 단가: 낭만기버존(RG) 15,000 · 아로마 10,000 · 그 외 25,000 (홈페이지 결제 기준)
type ClassRow = { person: string; slot: string; count: number; tier: 'RG' | '일반' | '아로마'; unit: number; amount: number };
type ClassGroup = { name: string; count: number; amount: number; rows: ClassRow[] };
function classBreakdown(bookings: Booking[]): { groups: ClassGroup[]; totalCount: number; totalAmount: number } {
  const strip = (s: string) => s.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️]/gu, '').replace(/\s{2,}/g, ' ').trim();
  const isDummy = (b: Booking) => String(b.email ?? '').toLowerCase() === 'bennie.dct@gmail.com' || /홍보용|광고용|테스트/.test(String(b.name ?? ''));
  const norm = (l: string) => { const s = strip(l); if (s.includes('아로마')) return '아로마 DIY'; if (s.includes('핸드팬')) return '핸드팬 사운드힐링'; if (s.includes('아크로')) return '아크로요가'; if (s.includes('훌라')) return '훌라댄스 & 공연'; if (s.includes('퍼피')) return '퍼피요가'; if (s.includes('애니멀')) return '애니멀플로우'; return s.split(' · ')[0]; };
  const slotOf = (l: string) => { const s = strip(l); const m = s.match(/·\s*(.+?)(?:\s*×|$)/); return (m ? m[1] : '').replace(/아로마.*/, '').trim(); };
  const order = ['핸드팬 사운드힐링', '아크로요가', '훌라댄스 & 공연', '퍼피요가', '애니멀플로우', '아로마 DIY'];
  const map: Record<string, ClassGroup> = {};
  for (const b of bookings) {
    if (b.status === 'cancelled' || isDummy(b)) continue;
    const arr = Array.isArray(b.tshirt_sizes) ? b.tshirt_sizes : [];
    const rg = b.zone === '낭만기버존';
    for (const e of arr) {
      const cnt = /×\s*(\d+)\s*명/.test(e) ? Number(RegExp.$1) : 1;
      const name = norm(e); const isAroma = name === '아로마 DIY';
      const tier: ClassRow['tier'] = isAroma ? '아로마' : rg ? 'RG' : '일반';
      const unit = isAroma ? 10000 : rg ? 15000 : 25000;
      const g = map[name] = map[name] || { name, count: 0, amount: 0, rows: [] };
      g.count += cnt; g.amount += unit * cnt;
      g.rows.push({ person: String(b.name ?? ''), slot: isAroma ? '택1' : slotOf(e), count: cnt, tier, unit, amount: unit * cnt });
    }
  }
  const groups = Object.values(map).sort((a, b) => {
    const ia = order.indexOf(a.name), ib = order.indexOf(b.name);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  groups.forEach((g) => g.rows.sort((a, b) => a.slot.localeCompare(b.slot) || a.person.localeCompare(b.person)));
  return { groups, totalCount: groups.reduce((s, g) => s + g.count, 0), totalAmount: groups.reduce((s, g) => s + g.amount, 0) };
}

type Application = {
  id?: number;
  at?: string; type?: 'mateship' | 'education';
  ownerName?: string; ownerPhone?: string; ownerRegion?: string;
  course?: string; count?: string; note?: string;
  petType?: string; petAge?: string; petName?: string;
  // 현재 공개 폼(문의하기·교육신청)이 저장하는 스키마
  name?: string; phone?: string; email?: string; region?: string; message?: string; created_at?: string;
};

// 문의(contact)=지역 없음 / 교육·메이트쉽 신청=지역 있음 으로 구분
const isInquiry = (a: Application) => !(a.region || a.ownerRegion);
const appDate = (a: Application) => a.created_at || a.at || '';
const appName = (a: Application) => a.name || a.ownerName || '-';
const appPhone = (a: Application) => a.phone || a.ownerPhone || '-';

type HeroImage = { id: number; imageData?: string };

function Toast({ msg, err }: { msg: string; err?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
      style={{ position: 'fixed', bottom: 24, right: 24, background: '#1a1a1a', color: '#fff', padding: '11px 18px', borderRadius: 8, fontSize: 13, zIndex: 9999, borderLeft: `3px solid ${err ? '#ef4444' : '#4FE0D3'}`, boxShadow: '0 4px 20px rgba(0,0,0,.3)' }}
    >{msg}</motion.div>
  );
}

const modalOverlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 24 };
const modalBoxStyle: React.CSSProperties = { background: '#fff', borderRadius: 20, padding: 36, width: 'min(540px, 100%)', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,.2)' };
const fieldStyle: React.CSSProperties = { marginBottom: 16 };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#111', outline: 'none', boxSizing: 'border-box' };
const btnSave: React.CSSProperties = { padding: '8px 20px', borderRadius: 9999, background: '#12A79D', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' };
const btnCancel: React.CSSProperties = { padding: '8px 20px', borderRadius: 9999, border: '1.5px solid #e5e7eb', background: 'transparent', color: '#6b7280', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
const btnEdit: React.CSSProperties = { fontSize: 11, padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'none', cursor: 'pointer', color: '#6b7280' };
const btnDel: React.CSSProperties = { fontSize: 11, padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'none', cursor: 'pointer', color: '#ef4444' };

function SectionHeader({ title, sub, onAdd, addLabel = '+ 추가' }: { title: string; sub?: string; onAdd?: () => void; addLabel?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h1 style={{ fontFamily: "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif", fontSize: 32, color: '#111', marginBottom: 4 }}>{title}</h1>
        {sub && <p style={{ fontSize: 13, color: '#9ca3af' }}>{sub}</p>}
      </div>
      {onAdd && <button onClick={onAdd} style={{ padding: '8px 18px', borderRadius: 9999, background: '#12A79D', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{addLabel}</button>}
    </div>
  );
}

function ImageUploadBox({ imageData, onPick, onRemove, ratio = '16/9', placeholder = '🖼️' }: { imageData?: string | null; onPick: (e: React.ChangeEvent<HTMLInputElement>) => void; onRemove?: () => void; ratio?: string; placeholder?: string }) {
  return (
    <div style={fieldStyle}>
      <div style={{ aspectRatio: ratio, borderRadius: 8, background: imageData ? `url(${imageData}) center/cover` : 'linear-gradient(135deg,#EDFAF8,#D6F5F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, border: '1.5px solid #e5e7eb', marginBottom: 8 }}>
        {!imageData && placeholder}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <label style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, cursor: 'pointer', border: '1.5px solid #e5e7eb', color: '#374151' }}>
          이미지 선택 <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={onPick} />
        </label>
        {imageData && onRemove && <button type="button" onClick={onRemove} style={{ fontSize: 11, padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'none', cursor: 'pointer', color: '#9ca3af' }}>삭제</button>}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [recovering, setRecovering] = useState('');
  const [recoveryMsg, setRecoveryMsg] = useState('');
  const [smsEvent, setSmsEvent] = useState<number>(3);
  const [smsMsg, setSmsMsg] = useState('');
  const [smsSending, setSmsSending] = useState('');
  const [smsResult, setSmsResult] = useState('');
  const [bType, setBType] = useState<'all' | 'day' | 'stay'>('all');
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null);

  // Data states
  const [apps, setApps] = useState<Application[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [newMember, setNewMember] = useState<Partial<Member>>({ status: 'active' });
  const [memberSearch, setMemberSearch] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [sellerFilter, setSellerFilter] = useState('all');
  const [sellerEvt, setSellerEvt] = useState<number | 'all'>('all');
  const [survey, setSurvey] = useState<{ responses: SurveyRow[]; stats: SurveyStats | null }>({ responses: [], stats: null });
  const [noShowOnly, setNoShowOnly] = useState(false);
  const [events, setEvents] = useState<EventCard[]>([]);
  const [partners, setPartners] = useState<MateshipPartner[]>([]);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([{ id: 1 }, { id: 2 }, { id: 3 }]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [archives, setArchives] = useState<ArchiveEvent[]>([]);
  const [activityCards, setActivityCards] = useState<ActivityCard[]>([]);
  const [lookbookItems, setLookbookItems] = useState<LookbookItem[]>([]);
  const [travelPlaces, setTravelPlaces] = useState<TravelPlace[]>([]);
  const [hashtags, setHashtags] = useState<PageHashtags[]>([]);

  // Modal states
  const [eventModal, setEventModal] = useState(false);
  const [partnerModal, setPartnerModal] = useState(false);
  const [archiveModal, setArchiveModal] = useState(false);
  const [activityModal, setActivityModal] = useState(false);
  const [travelModal, setTravelModal] = useState(false);

  // Edit states
  const [editEvent, setEditEvent] = useState<Partial<EventCard> & { _key?: number }>({});
  const [editPartner, setEditPartner] = useState<Partial<MateshipPartner> & { _key?: number }>({});
  const [editArchive, setEditArchive] = useState<Partial<ArchiveEvent> & { _key?: number }>({});
  const [editActivity, setEditActivity] = useState<Partial<ActivityCard> & { _key?: number }>({});
  const [editTravel, setEditTravel] = useState<Partial<TravelPlace> & { _key?: number }>({});
  const [hashtagDraft, setHashtagDraft] = useState<Record<string, string>>({});
  const [imagePickerArc, setImagePickerArc] = useState<ArchiveEvent | null>(null);
  const arcDragSrcRef = useRef<number | null>(null);   // ref로 stale closure 방지
  const [arcDragSrcIdx, setArcDragSrcIdx] = useState<number | null>(null); // 시각 효과용
  const [arcDragOverIdx, setArcDragOverIdx] = useState<number | null>(null);

  useEffect(() => { loadAll(); }, []);

  const showToast = (msg: string, err?: boolean) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 3000);
  };

  const doLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.replace('/admin/login');
  };

  const fetchApps = async (): Promise<Application[]> =>
    fetch('/api/data/applications').then((r) => (r.ok ? r.json() : [])).catch(() => []);

  // ── 회원관리 ──
  const genMemberNo = () => {
    const yr = new Date().getFullYear();
    const n = members.filter((m) => (m.member_no || '').includes(`GW-${yr}`)).length + 1;
    return `GW-${yr}-${String(n).padStart(4, '0')}`;
  };
  const reloadMembers = async () =>
    setMembers(await fetch('/api/data/members').then((r) => (r.ok ? r.json() : [])).catch(() => []));
  const saveMember = async () => {
    if (!newMember.name?.trim() || !newMember.phone?.trim()) { showToast('이름과 전화번호는 필수입니다', true); return; }
    const body = {
      member_no: newMember.member_no?.trim() || genMemberNo(),
      name: newMember.name.trim(), phone: newMember.phone.trim(),
      email: newMember.email?.trim() || null, region: newMember.region?.trim() || null,
      status: newMember.status || 'active',
      joined_at: newMember.joined_at || new Date().toISOString().slice(0, 10),
      expires_at: newMember.expires_at || null, note: newMember.note?.trim() || null,
    };
    try {
      const res = await fetch('/api/data/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      showToast('회원이 등록되었습니다');
      setNewMember({ status: 'active' });
      await reloadMembers();
    } catch (e) { showToast(`등록 실패: ${e instanceof Error ? e.message : String(e)}`, true); }
  };
  const updateMemberStatus = async (m: Member, status: string) => {
    try {
      const res = await fetch('/api/data/members', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...m, status }) });
      if (!res.ok) throw new Error(await res.text());
      setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, status } : x)));
    } catch (e) { showToast(`변경 실패: ${e instanceof Error ? e.message : String(e)}`, true); }
  };
  const deleteMember = async (m: Member) => {
    if (!confirm(`${m.name} 회원을 삭제하시겠습니까?`)) return;
    try {
      await fetch(`/api/data/members?id=${m.id}`, { method: 'DELETE' });
      setMembers((prev) => prev.filter((x) => x.id !== m.id));
      showToast('삭제되었습니다');
    } catch (e) { showToast(`삭제 실패: ${e instanceof Error ? e.message : String(e)}`, true); }
  };

  const fetchBookings = async (): Promise<Booking[]> =>
    fetch('/api/bookings').then((r) => (r.ok ? r.json() : [])).catch(() => []);

  const updateBookingStatus = async (b: Booking, action: 'cancel' | 'confirm') => {
    const label = action === 'cancel' ? '취소' : '입금확정';
    const seat = b.site ? `${b.zone || ''} ${b.site}` : (b.booking_type === 'day' ? '관람권' : (b.zone || '관람권'));
    const confirmMsg = action === 'cancel'
      ? `${b.name || ''}님의 예약(${seat})을(를) 취소 처리할까요?\n취소하면 해당 자리가 즉시 다시 열립니다.`
      : `${b.name || ''}님의 예약(${seat})을(를) 입금확정하고 입장권(QR) 메일을 발송할까요?\n(${b.email || '이메일 없음'})`;
    if (!confirm(confirmMsg)) return;
    try {
      const res = await fetch('/api/bookings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: b.id, action }) });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || '처리 실패');
      setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: j.status } : x)));
      if (action === 'confirm' && j.mail) {
        if (j.mail.sent) showToast(`입금확정 완료 · 입장권 메일 발송됨 → ${b.email || ''}`);
        else showToast(`입금확정됨. 단, 메일 발송 실패: ${j.mail.reason || ''} — [✉ 메일발송]으로 재시도하세요`, true);
      } else {
        showToast(`예약을 ${label} 처리했습니다.`);
      }
    } catch (e) { showToast(`${label} 실패: ${e instanceof Error ? e.message : String(e)}`, true); }
  };

  const sendTicketMail = async (b: Booking) => {
    if (b.status !== 'paid') { showToast('입금확정 후 발송할 수 있습니다.', true); return; }
    if (!confirm(`${b.name || ''}님(${b.email || '이메일 없음'})에게 입장권(QR) 메일을 발송할까요?`)) return;
    try {
      const res = await fetch('/api/tickets/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: b.id }) });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || '발송 실패');
      showToast(`입장권 메일을 보냈습니다 → ${j.to}`);
      setBookings(await fetchBookings()); // 발송 표시 갱신
    } catch (e) { showToast(`메일 발송 실패: ${e instanceof Error ? e.message : String(e)}`, true); }
  };

  const loadAll = async () => {
    try {
      setApps(await fetchApps());
      setProposals(await fetch('/api/data/proposals').then((r) => (r.ok ? r.json() : [])).catch(() => []));
      setMembers(await fetch('/api/data/members').then((r) => (r.ok ? r.json() : [])).catch(() => []));
      setBookings(await fetchBookings());
      setEvents(await clientDB.getAll<EventCard>(STORES.EVENT));
      setPartners(await clientDB.getAll<MateshipPartner>(STORES.MATESHIP));
      setArchives(await clientDB.getAll<ArchiveEvent>(STORES.ARCHIVE));
      setActivityCards(await clientDB.getAll<ActivityCard>(STORES.ACTIVITY));
      setLookbookItems(await clientDB.getAll<LookbookItem>(STORES.LOOKBOOK));
      setTravelPlaces(await clientDB.getAll<TravelPlace>(STORES.PLACES));
      const hts = await clientDB.getAll<PageHashtags>(STORES.HASHTAGS);
      setHashtags(hts);
      const draft: Record<string, string> = {};
      hts.forEach((h) => { draft[h.page] = h.tags.join(', '); });
      setHashtagDraft(draft);
      const heroes = await clientDB.getAll<HeroImage>(STORES.HERO);
      const heroMap: Record<number, HeroImage> = {};
      heroes.forEach((h) => { heroMap[h.id!] = h; });
      setHeroImages([1,2,3].map((i) => heroMap[i] || { id: i }));
      setGalleryItems(await clientDB.getAll<GalleryItem>(STORES.GALLERY));
    } catch (err) { console.error('로딩 오류:', err); showToast(`로딩 실패: ${err instanceof Error ? err.message : String(err)}`, true); }
  };


  const sendRecovery = async (mode: 'test' | 'group-a' | 'all' | 'rebook-test' | 'rebook', count: number) => {
    const isTest = mode === 'test' || mode === 'rebook-test';
    if (!isTest && !confirm(`${mode === 'rebook' ? '재예약 안내' : '미입금 회수'} 메일을 ${count}명에게 발송할까요?`)) return;
    setRecovering(mode); setRecoveryMsg('');
    try {
      const res = await fetch('/api/admin/recovery-send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, testTo: 'bennie.dct@gmail.com' }) });
      const j = await res.json();
      if (!res.ok) setRecoveryMsg(`❌ 실패: ${j.error || res.status}`);
      else if (isTest) setRecoveryMsg(`✅ 테스트 발송 → ${j.to} (${j.sent ? '성공' : '실패: ' + (j.reason || '')})${j.targetCount != null ? ` · 대상 ${j.targetCount}명` : ''}`);
      else setRecoveryMsg(`✅ 발송 완료 — 성공 ${j.sent} · 실패 ${j.failed}${j.errors?.length ? '\n' + j.errors.join('\n') : ''}`);
    } catch (e) { setRecoveryMsg(`❌ 오류: ${e instanceof Error ? e.message : String(e)}`); }
    finally { setRecovering(''); }
  };

  const sendSms = async (mode: 'test' | 'all') => {
    if (!smsMsg.trim()) { showToast('문구를 입력해 주세요', true); return; }
    let testTo: string | undefined;
    if (mode === 'test') { const n = prompt('테스트로 받을 번호를 입력하세요 (내 휴대폰)', '010'); if (!n) return; testTo = n; }
    if (mode === 'all' && !confirm('선택한 행사의 결제완료 참가자 전원에게 안내문자를 발송할까요?\n(문자는 건당 비용이 발생합니다)')) return;
    setSmsSending(mode); setSmsResult('');
    try {
      const res = await fetch('/api/admin/sms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event_id: smsEvent, message: smsMsg, testTo }) });
      const j = await res.json();
      if (!res.ok) setSmsResult(`❌ ${j.error || res.status}${j.errors?.length ? ' · ' + j.errors.join(' / ') : ''}`);
      else if (mode === 'test') setSmsResult(`✅ 테스트 발송 → ${j.to} (${j.sent ? '성공' : '실패'})${j.errors?.length ? ' · ' + j.errors.join(' / ') : ''}`);
      else setSmsResult(`✅ 발송 완료 — 대상 ${j.total} · 성공 ${j.sent} · 실패 ${j.failed}${j.errors?.length ? '\n' + j.errors.join('\n') : ''}`);
    } catch (e) { setSmsResult(`❌ 오류: ${e instanceof Error ? e.message : String(e)}`); }
    finally { setSmsSending(''); }
  };

  const switchTab = async (t: Tab) => {
    setTab(t);
    if (t === 'dashboard' || t === 'applications' || t === 'inquiries') {
      setApps(await fetchApps());
    }
    if (t === 'dashboard' || t === 'bookings' || t === 'classes') {
      setBookings(await fetchBookings());
    }
    if (t === 'payments') {
      setPayments(await fetch('/api/admin/payments').then((r) => (r.ok ? r.json() : [])).catch(() => []));
    }
    if (t === 'sellers') {
      setSellers(await fetchSellers());
    }
    if (t === 'survey') {
      setSurvey(await fetch('/api/admin/survey').then((r) => (r.ok ? r.json() : { responses: [], stats: null })).catch(() => ({ responses: [], stats: null })));
    }
  };

  const exportSurveyCSV = () => {
    const rows = survey.responses;
    const header = ['제출일시', '전체만족', '재방문의향', '프로그램만족', '부스만족', '편의시설', '안전운영', '참여프로그램', '방문경로', '거주지역', '반려동물동반', '좋았던점', '개선점', '연락처'];
    const body = rows.map((s) => [
      s.created_at ? new Date(s.created_at).toLocaleString('ko-KR') : '', s.overall ?? '', s.revisit ?? '',
      s.rating_program ?? '', s.rating_booth ?? '', s.rating_facility ?? '', s.rating_safety ?? '',
      s.programs ?? '', s.source ?? '', s.region ?? '', s.pet_with === true ? '예' : s.pet_with === false ? '아니요' : '', s.liked ?? '', s.improve ?? '', s.phone ?? '',
    ]);
    const csv = [header, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `gwaa_survey_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const fetchSellers = async (): Promise<Seller[]> =>
    fetch('/api/admin/sellers').then((r) => (r.ok ? r.json() : { sellers: [] })).then((j) => j.sellers || []).catch(() => []);

  const updateSeller = async (id: number, patch: { status?: string; admin_note?: string; fee_paid?: boolean }) => {
    const r = await fetch('/api/admin/sellers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...patch }) });
    if (!r.ok) { showToast('변경 실패', true); return; }
    setSellers(await fetchSellers());
    showToast('반영 완료');
  };

  const isEmail = (e?: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(e ?? ''));
  const sendSellerNotify = async (mode: 'test' | 'all', evt: number | 'all' = 'all') => {
    if (mode === 'test') {
      const to = prompt('테스트 수신 이메일 (참가비·후원물품 샘플 각 1통 발송):', 'bennie.dct@gmail.com');
      if (!to) return;
      showToast('테스트 발송 중…');
      const r = await fetch('/api/admin/sellers/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'test', testTo: to }) });
      const j = await r.json();
      showToast(j.ok ? `테스트 ${j.sent}통 발송 완료` : `실패: ${j.reason || j.error || ''}`, !j.ok);
      return;
    }
    const scope = evt === 'all' ? sellers : sellers.filter((s) => s.event_id === evt);
    const evLabel = evt === 'all' ? '전체 행사' : (events.find((e) => e.id === evt)?.title || `행사 #${evt}`);
    const approvedMail = scope.filter((s) => s.status === 'approved' && isEmail(s.email) && !s.notified_at);
    const noMail = scope.filter((s) => s.status === 'approved' && !isEmail(s.email));
    if (!approvedMail.length) { showToast('발송할 대상이 없어요 (승인+이메일+미발송)', true); return; }
    if (!confirm(`[${evLabel}] 선정(승인) 셀러에게 선정 안내 메일을 발송할까요?\n\n· 발송 대상(승인+이메일+미발송): ${approvedMail.length}명\n· 이메일 없어 문자로 통보 필요: ${noMail.length}명\n\n(이미 발송된 셀러는 자동 제외됩니다)`)) return;
    showToast('발송 중…');
    const body: Record<string, unknown> = { mode: 'all' };
    if (evt !== 'all') body.event_id = evt;
    const r = await fetch('/api/admin/sellers/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok) { showToast(`실패: ${j.error || ''}`, true); return; }
    setSellers(await fetchSellers());
    showToast(`선정 메일 ${j.sent}/${j.total}건 발송${j.fails?.length ? ` · 실패 ${j.fails.length}` : ''}`, !!j.fails?.length);
  };

  // ─── CSV export ───
  const exportCSV = () => {
    const header = ['신청일시', '유형', '신청자', '연락처', '지역', '내용'];
    const rows = apps.map((a) => [appDate(a) ? new Date(appDate(a)).toLocaleString('ko-KR') : '', isInquiry(a) ? '문의' : (a.type === 'mateship' ? '메이트쉽' : '교육신청'), appName(a) === '-' ? '' : appName(a), appPhone(a) === '-' ? '' : appPhone(a), a.email || '', a.region || a.ownerRegion || '', a.course || '', a.message || '']);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `gwaa_apps_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const clearApplications = async () => {
    if (!confirm('전체 신청 내역을 삭제하시겠습니까?')) return;
    await Promise.all(
      apps.map((a) => (a as { id?: number }).id)
        .filter((id): id is number => id != null)
        .map((id) => fetch(`/api/data/applications?id=${id}`, { method: 'DELETE' })),
    );
    setApps([]); showToast('전체 삭제 완료');
  };

  // ─── Event CRUD ───
  const saveEvent = async () => {
    if (!editEvent.title?.trim()) { showToast('행사명을 입력해 주세요', true); return; }
    try {
      const base = { title: editEvent.title || '', date: editEvent.date || '', startDate: editEvent.startDate || null, endDate: editEvent.endDate || null, loc: editEvent.loc || '', desc: editEvent.desc || '', content: editEvent.content || '', status: (editEvent.status || 'upcoming') as EventStatus, link: editEvent.link || '', benefit: editEvent.benefit || '', ctaText: editEvent.ctaText || '신청하기 →', imageData: editEvent.imageData ?? null, images: editEvent.images || [], order: editEvent.order || Date.now(), sellerOpen: !!editEvent.sellerOpen, surveyOpen: !!editEvent.surveyOpen };
      editEvent._key ? await clientDB.put(STORES.EVENT, { ...base, id: editEvent._key }) : await clientDB.add(STORES.EVENT, base);
      setEventModal(false); setEditEvent({});
      setEvents(await clientDB.getAll<EventCard>(STORES.EVENT));
      showToast('행사 저장 완료');
    } catch (err) { console.error('행사 저장 오류:', err); showToast(`저장 실패: ${err instanceof Error ? err.message : String(err)}`, true); }
  };
  const deleteEvent = async (key: number) => {
    if (!confirm('이 행사를 삭제하시겠습니까?')) return;
    await clientDB.remove(STORES.EVENT, key);
    setEvents(await clientDB.getAll<EventCard>(STORES.EVENT)); showToast('삭제 완료');
  };

  // ─── Archive CRUD ───
  const saveArchive = async () => {
    if (!editArchive.title?.trim()) { showToast('행사명을 입력해 주세요', true); return; }
    try {
      const imgs = editArchive.images || [];
      const base = { order: editArchive.order || Date.now(), feat: editArchive.feat ?? false, year: Number(editArchive.year) || new Date().getFullYear(), title: editArchive.title || '', loc: editArchive.loc || '', ppl: editArchive.ppl || '', date: editArchive.date || '', place: editArchive.place || '', part: editArchive.part || '', organizer: editArchive.organizer || '', desc: editArchive.desc || '', imageData: imgs[0] ?? null, imageData2: imgs[1] ?? null, images: imgs };
      editArchive._key ? await clientDB.put(STORES.ARCHIVE, { ...base, id: editArchive._key }) : await clientDB.add(STORES.ARCHIVE, base);
      setArchiveModal(false); setEditArchive({});
      setArchives(await clientDB.getAll<ArchiveEvent>(STORES.ARCHIVE));
      showToast('아카이브 저장 완료');
    } catch (err) { console.error('아카이브 저장 오류:', err); showToast(`저장 실패: ${err instanceof Error ? err.message : String(err)}`, true); }
  };
  const deleteArchive = async (key: number) => {
    if (!confirm('이 아카이브 행사를 삭제하시겠습니까?')) return;
    await clientDB.remove(STORES.ARCHIVE, key);
    setArchives(await clientDB.getAll<ArchiveEvent>(STORES.ARCHIVE)); showToast('삭제 완료');
  };

  const reorderArchiveImages = async (fromIdx: number, toIdx: number) => {
    if (!imagePickerArc || fromIdx === toIdx) return;
    const imgs = [...(imagePickerArc.images || [])];
    const [moved] = imgs.splice(fromIdx, 1);
    imgs.splice(toIdx, 0, moved);
    const updated = { ...imagePickerArc, images: imgs };
    setImagePickerArc(updated);
    setArchives(prev => prev.map(a => a.order === imagePickerArc.order ? updated : a));
    try { await clientDB.put(STORES.ARCHIVE, updated); showToast('이미지 순서 변경 완료'); }
    catch { showToast('로컬 저장 완료', false); }
  };

  const deleteArchiveImage = async (imgSrc: string) => {
    if (!imagePickerArc) return;
    const imgs = (imagePickerArc.images || []).filter(i => i !== imgSrc);
    const newRep = imagePickerArc.imageData === imgSrc ? (imgs[0] ?? null) : imagePickerArc.imageData;
    const updated = { ...imagePickerArc, images: imgs, imageData: newRep };
    setImagePickerArc(updated);
    setArchives(prev => prev.map(a => a.order === imagePickerArc.order ? updated : a));
    try { await clientDB.put(STORES.ARCHIVE, updated); showToast('이미지 삭제 완료'); }
    catch { showToast('로컬 저장 완료', false); }
  };

  const setRepresentativeImage = async (arc: ArchiveEvent, imgSrc: string) => {
    const imgs = [...(arc.images || [])];
    const pos = imgs.indexOf(imgSrc);
    if (pos > 0) { imgs.splice(pos, 1); imgs.unshift(imgSrc); }
    const updated = { ...arc, imageData: imgSrc, images: imgs };
    // order(required)로 매칭 — 낙관적 업데이트
    setArchives((prev) => prev.map((a) => a.order === arc.order ? updated : a));
    setImagePickerArc(updated);
    try {
      await clientDB.put(STORES.ARCHIVE, updated);
      showToast('대표 이미지 저장 완료');
    } catch {
      showToast('Supabase 미설정 — 새로고침 시 초기화됩니다', true);
    }
  };

  const moveArchiveOrder = async (arc: ArchiveEvent, direction: 'up' | 'down') => {
    const sorted = [...archives].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex((a) => a.order === arc.order);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const target = sorted[swapIdx];
    const arcOrder = arc.order;
    const tgtOrder = target.order;

    // order(required)로 매칭 — 낙관적 업데이트
    setArchives((prev) =>
      prev.map((a) => {
        if (a.order === arcOrder) return { ...a, order: tgtOrder };
        if (a.order === tgtOrder) return { ...a, order: arcOrder };
        return a;
      })
    );

    try {
      // unique constraint 방지: 임시값 → target 먼저 → arc 마지막
      await clientDB.put(STORES.ARCHIVE, { ...arc, order: Date.now() });
      await clientDB.put(STORES.ARCHIVE, { ...target, order: arcOrder });
      await clientDB.put(STORES.ARCHIVE, { ...arc,    order: tgtOrder });
      showToast('순서 변경 완료');
    } catch {
      showToast('Supabase 미설정 — 새로고침 시 초기화됩니다', true);
    }
  };

  // ─── Partner CRUD ───
  const savePartner = async () => {
    if (!editPartner.name?.trim()) { showToast('업체명을 입력해 주세요', true); return; }
    try {
      const base = { name: editPartner.name || '', region: editPartner.region || '', type: editPartner.type || 'cafe', discount: editPartner.discount || '', icon: editPartner.icon || '🏢', gradient: editPartner.gradient || 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', link: editPartner.link || '', imageData: editPartner.imageData ?? null, order: editPartner.order || Date.now() };
      editPartner._key ? await clientDB.put(STORES.MATESHIP, { ...base, id: editPartner._key }) : await clientDB.add(STORES.MATESHIP, base);
      setPartnerModal(false); setEditPartner({});
      setPartners(await clientDB.getAll<MateshipPartner>(STORES.MATESHIP));
      showToast('업체 저장 완료');
    } catch (err) { console.error('업체 저장 오류:', err); showToast(`저장 실패: ${err instanceof Error ? err.message : String(err)}`, true); }
  };
  const deletePartner = async (key: number) => {
    if (!confirm('이 업체를 삭제하시겠습니까?')) return;
    await clientDB.remove(STORES.MATESHIP, key);
    setPartners(await clientDB.getAll<MateshipPartner>(STORES.MATESHIP)); showToast('삭제 완료');
  };

  // ─── Activity Card CRUD ───
  const saveActivity = async () => {
    if (!editActivity.title?.trim()) { showToast('카드 제목을 입력해 주세요', true); return; }
    try {
      const base = { order: editActivity.order || Date.now(), imageData: editActivity.imageData ?? null, tag: editActivity.tag || '', tagColor: (editActivity.tagColor || 'green') as ActivityCard['tagColor'], icon: editActivity.icon || '🐾', title: editActivity.title || '', desc: editActivity.desc || '', link: editActivity.link || '', linkText: editActivity.linkText || '자세히 보기' };
      editActivity._key ? await clientDB.put(STORES.ACTIVITY, { ...base, id: editActivity._key }) : await clientDB.add(STORES.ACTIVITY, base);
      setActivityModal(false); setEditActivity({});
      setActivityCards(await clientDB.getAll<ActivityCard>(STORES.ACTIVITY));
      showToast('활동카드 저장 완료');
    } catch (err) { console.error('활동카드 저장 오류:', err); showToast(`저장 실패: ${err instanceof Error ? err.message : String(err)}`, true); }
  };
  const deleteActivity = async (key: number) => {
    if (!confirm('이 활동카드를 삭제하시겠습니까?')) return;
    await clientDB.remove(STORES.ACTIVITY, key);
    setActivityCards(await clientDB.getAll<ActivityCard>(STORES.ACTIVITY)); showToast('삭제 완료');
  };

  // ─── Lookbook CRUD ───
  const saveLookbook = async (item: LookbookItem) => {
    await clientDB.put(STORES.LOOKBOOK, item);
    setLookbookItems(await clientDB.getAll<LookbookItem>(STORES.LOOKBOOK));
    showToast('룩북 저장 완료');
  };
  const deleteLookbook = async (key: number) => {
    if (!confirm('이 룩북 항목을 삭제하시겠습니까?')) return;
    await clientDB.remove(STORES.LOOKBOOK, key);
    setLookbookItems(await clientDB.getAll<LookbookItem>(STORES.LOOKBOOK)); showToast('삭제 완료');
  };

  // ─── Travel CRUD ───
  const saveTravel = async () => {
    if (!editTravel.name?.trim()) { showToast('장소명을 입력해 주세요', true); return; }
    try {
      const base = { order: editTravel.order || Date.now(), region: editTravel.region || '', type: editTravel.type || 'cafe', typeLabel: editTravel.typeLabel || '', name: editTravel.name || '', icon: editTravel.icon || '📍', address: editTravel.address || '', feature: editTravel.feature || '', desc: editTravel.desc || '', petInfo: editTravel.petInfo || '', isPartner: editTravel.isPartner ?? false, imageData: editTravel.imageData ?? null, mapUrl: editTravel.mapUrl || '', hours: editTravel.hours || '', price: editTravel.price || '' };
      editTravel._key ? await clientDB.put(STORES.PLACES, { ...base, id: editTravel._key }) : await clientDB.add(STORES.PLACES, base);
      setTravelModal(false); setEditTravel({});
      setTravelPlaces(await clientDB.getAll<TravelPlace>(STORES.PLACES));
      showToast('여행지 저장 완료');
    } catch (err) { console.error('여행지 저장 오류:', err); showToast(`저장 실패: ${err instanceof Error ? err.message : String(err)}`, true); }
  };
  const deleteTravel = async (key: number) => {
    if (!confirm('이 여행지를 삭제하시겠습니까?')) return;
    await clientDB.remove(STORES.PLACES, key);
    setTravelPlaces(await clientDB.getAll<TravelPlace>(STORES.PLACES)); showToast('삭제 완료');
  };

  // ─── Hero images ───
  const pickHeroImage = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const b64 = await clientDB.toBase64(file);
      await clientDB.put(STORES.HERO, { id, imageData: b64 });
      setHeroImages((prev) => prev.map((h) => h.id === id ? { ...h, imageData: b64 } : h));
      showToast(`슬라이드 ${id} 업로드 완료`);
    } catch (err) { console.error('히어로 업로드 오류:', err); showToast(`업로드 실패: ${err instanceof Error ? err.message : String(err)}`, true); }
  };
  const removeHeroImage = async (id: number) => {
    await clientDB.put(STORES.HERO, { id });
    setHeroImages((prev) => prev.map((h) => h.id === id ? { id } : h));
    showToast(`슬라이드 ${id} 삭제`);
  };

  // ─── Gallery ───
  const addGalleryItem = async () => {
    await clientDB.add<GalleryItem>(STORES.GALLERY, { order: Date.now(), imageData: null, caption: '새 갤러리 사진', active: true });
    setGalleryItems(await clientDB.getAll<GalleryItem>(STORES.GALLERY));
    showToast('갤러리 항목 추가됨');
  };
  const pickGalleryImage = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const { ok, error } = clientDB.validateImage(file);
    if (!ok) { showToast(error!, true); return; }
    try {
      const b64 = await clientDB.toBase64(file);
      const existing = galleryItems.find((g) => g.id === id);
      if (!existing) return;
      await clientDB.put<GalleryItem>(STORES.GALLERY, { ...existing, imageData: b64 });
      setGalleryItems(await clientDB.getAll<GalleryItem>(STORES.GALLERY));
      showToast('갤러리 이미지 업로드 완료');
    } catch (err) { console.error('갤러리 업로드 오류:', err); showToast(`업로드 실패: ${err instanceof Error ? err.message : String(err)}`, true); }
  };
  const updateGalleryCaption = async (id: number, caption: string) => {
    const existing = galleryItems.find((g) => g.id === id); if (!existing) return;
    await clientDB.put<GalleryItem>(STORES.GALLERY, { ...existing, caption });
    setGalleryItems((prev) => prev.map((g) => g.id === id ? { ...g, caption } : g));
  };
  const toggleGalleryActive = async (id: number) => {
    const existing = galleryItems.find((g) => g.id === id); if (!existing) return;
    await clientDB.put<GalleryItem>(STORES.GALLERY, { ...existing, active: !existing.active });
    setGalleryItems((prev) => prev.map((g) => g.id === id ? { ...g, active: !g.active } : g));
  };
  const removeGalleryImage = async (id: number) => {
    const existing = galleryItems.find((g) => g.id === id); if (!existing) return;
    await clientDB.put<GalleryItem>(STORES.GALLERY, { ...existing, imageData: null });
    setGalleryItems((prev) => prev.map((g) => g.id === id ? { ...g, imageData: null } : g));
    showToast('이미지 삭제');
  };
  const deleteGalleryItem = async (id: number) => {
    if (!confirm('이 갤러리 항목을 삭제하시겠습니까?')) return;
    await clientDB.remove(STORES.GALLERY, id);
    setGalleryItems(await clientDB.getAll<GalleryItem>(STORES.GALLERY)); showToast('삭제 완료');
  };

  // ─── Hashtags ───
  const saveHashtag = async (page: PageHashtags['page']) => {
    const raw = hashtagDraft[page] || '';
    const tags = raw.split(',').map((t) => t.trim()).filter(Boolean);
    await clientDB.put<PageHashtags>(STORES.HASHTAGS, { page, tags });
    showToast(`${page} 해시태그 저장 완료`);
  };

  const navBtnStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", fontSize: 10, letterSpacing: '0.08em',
    color: active ? '#4FE0D3' : 'rgba(255,255,255,0.4)',
    background: active ? 'rgba(74,222,128,.08)' : 'none',
    border: 'none', padding: '8px 14px', borderRadius: 6, cursor: 'pointer', transition: 'all .2s',
  });

  const tabs: [Tab, string][] = [
    ['dashboard', '대시보드'], ['inquiries', '문의'], ['applications', '신청내역'], ['proposals', '제안접수'], ['members', '회원관리'], ['payments', '결제내역'], ['bookings', '예약내역'], ['classes', '클래스'], ['sellers', '셀러'], ['survey', '만족도'], ['sms', '안내문자'], ['events', '행사관리'],
    ['archive', '아카이브'], ['partners', '제휴업체'], ['images', '이미지'],
    ['content', '콘텐츠'], ['travel', '여행지'], ['settings', '설정'],
  ];

  const mLabel: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4 };
  const mInput: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111', background: '#fafafa', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };

  const exportSellersCSV = (rowsIn?: Seller[]) => {
    const src = rowsIn ?? sellers;
    const stTxt = (s: string) => ({ pending: '대기', approved: '승인', waitlist: '보류', rejected: '반려' }[s] || s);
    const evName = (id?: number) => events.find((e) => e.id === id)?.title || `행사 #${id}`;
    const header = ['행사', '신청일시', '상태', '참가방식', '후원물품', '참가비입금', '브랜드', '대표자', '연락처', '이메일', '카테고리', '판매품목', '전기', '테이블', '차량', 'SNS', '사업자번호', '메모'];
    const rows = src.map((s) => [
      evName(s.event_id), s.created_at ? new Date(s.created_at).toLocaleString('ko-KR') : '', stTxt(s.status),
      s.join_type === 'fee' ? '참가비 2만원' : '후원물품', s.sponsor_items || '', s.join_type === 'fee' ? (s.fee_paid ? '입금완료' : '미입금') : '해당없음',
      s.brand_name || '', s.rep_name || '', s.phone || '',
      s.email || '', s.category || '', s.items || '', s.needs_power ? 'O' : '', s.needs_table ? 'O' : '', s.vehicle || '', s.sns || '', s.biz_no || '', s.admin_note || '',
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `gwaa_sellers_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportClassesCSV = (bk: Booking[]) => {
    const { groups } = classBreakdown(bk);
    const header = ['클래스', '슬롯', '신청자', '인원', '단가', '금액', '구분'];
    const rows: (string | number)[][] = [];
    groups.forEach((g) => g.rows.forEach((r) => rows.push([g.name, r.slot, r.person, r.count, r.unit, r.amount, r.tier])));
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `gwaa_classes_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportBookingsCSV = () => {
    const header = ['신청일시', '상태', '일정', '날짜', '구역', '사이트', '인원', '웰니스클래스', '예약자', '연락처', '이메일', '반려견', '견종', '접종', '금액', '요청'];
    const stTxt = (s?: string) => s === 'paid' ? '입금확정' : s === 'cancelled' ? '취소됨' : '입금대기';
    const rows = bookings.map((b) => [
      b.created_at ? new Date(b.created_at).toLocaleString('ko-KR') : '', stTxt(b.status), b.booking_label || '', b.date_label || '',
      b.zone || '', b.site || '', b.headcount != null ? `${b.headcount}인` : '', (b.tshirt_sizes || []).join(' / '),
      b.name || '', b.phone || '', b.email || '', b.pet_name || '', b.pet_breed || '',
      b.pet_vaccine === 'yes' ? '완료' : b.pet_vaccine === 'no' ? '미완료' : '', b.amount != null ? String(b.amount) : '', b.request || '',
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `gwaa_bookings_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Admin Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#0a0a0a', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.07)', gap: 16 }}>
        <div style={{ fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", fontSize: 12, letterSpacing: '0.1em', color: '#4FE0D3', flexShrink: 0 }}>GWAA ADMIN</div>
        <nav style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
          {tabs.map(([t, l]) => (
            <button key={t} onClick={() => switchTab(t)} style={navBtnStyle(tab === t)}>{l}</button>
          ))}
        </nav>
        <button onClick={doLogout} style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', background: 'none', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', flexShrink: 0 }}>로그아웃</button>
      </header>

      <main style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>

        {/* ── Dashboard ── */}
        {tab === 'dashboard' && (
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif", fontSize: 32, marginBottom: 8, color: '#111' }}>대시보드</h1>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 28 }}>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[{ label: '문의', num: apps.filter(isInquiry).length, sub: '문의하기 접수' }, { label: '신청', num: apps.filter(a => !isInquiry(a)).length, sub: '교육·메이트쉽' }, { label: '예약', num: bookings.length, sub: '전체 예약' }, { label: '등록 행사', num: events.length, sub: '진행중·예정 포함' }].map(({ label, num, sub }) => (
                <div key={label} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '22px 24px' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
                  <div style={{ fontFamily: "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif", fontSize: 36, color: '#111', lineHeight: 1 }}>{num}</div>
                  <div style={{ fontSize: 11, color: '#12A79D', marginTop: 4 }}>{sub}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #e5e7eb' }}>
                <div><div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>최근 신청 내역</div><div style={{ fontSize: 12, color: '#9ca3af' }}>최근 5건</div></div>
                <button onClick={() => switchTab('applications')} style={{ fontSize: 12, fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", padding: '8px 18px', border: '1.5px solid #e5e7eb', borderRadius: 6, background: 'none', cursor: 'pointer', color: '#6b7280' }}>전체 보기 →</button>
              </div>
              <AppTable apps={apps.filter(a => !isInquiry(a)).slice(-5).reverse()} short />
            </div>
          </div>
        )}

        {/* ── Inquiries (문의하기) ── */}
        {tab === 'inquiries' && (
          <div>
            <SectionHeader title="문의" sub="홈페이지 문의하기로 접수된 내용" />
            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <InquiryTable apps={apps.filter(isInquiry).reverse()} />
            </div>
          </div>
        )}

        {/* ── Applications ── */}
        {tab === 'applications' && (
          <div>
            <SectionHeader title="신청 내역" sub="교육 신청 · 메이트쉽 가입 접수 목록 (문의는 '문의' 탭)" />
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button onClick={exportCSV} style={{ fontSize: 12, fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", padding: '8px 18px', border: '1.5px solid #e5e7eb', borderRadius: 6, background: 'none', cursor: 'pointer', color: '#6b7280' }}>CSV 내보내기</button>
              <button onClick={clearApplications} style={{ fontSize: 12, fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", padding: '8px 18px', border: '1.5px solid #fca5a5', borderRadius: 6, background: 'none', cursor: 'pointer', color: '#ef4444' }}>전체 삭제</button>
            </div>
            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <AppTable apps={apps.filter(a => !isInquiry(a)).reverse()} />
            </div>
          </div>
        )}

        {/* ── Proposals (제휴·등록 제안) ── */}
        {tab === 'proposals' && (
          <div>
            <SectionHeader title="제안 접수" sub="여행지 등록 제안 & 메이트쉽 제휴 제안 목록" />
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>
              총 {proposals.length}건 · 여행지 {proposals.filter((p) => p.kind === 'travel').length}건 · 제휴 {proposals.filter((p) => p.kind === 'mateship').length}건
            </div>
            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'auto' }}>
              {proposals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 13 }}>접수된 제안이 없습니다</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                      {['접수일시', '유형', '업체/장소명', '지역', '업종', '연락처', '이메일', '링크', '내용'].map((h) => (
                        <th key={h} style={{ padding: '12px 14px', fontSize: 12, color: '#6b7280', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...proposals].reverse().map((p, i) => (
                      <tr key={p.id ?? i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '11px 14px', color: '#6b7280', whiteSpace: 'nowrap' }}>{p.created_at ? new Date(p.created_at).toLocaleString('ko-KR') : ''}</td>
                        <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 9999, background: p.kind === 'mateship' ? '#fef3c7' : '#D6F5F1', color: p.kind === 'mateship' ? '#92400e' : '#12A79D' }}>
                            {p.kind === 'mateship' ? '제휴 제안' : '여행지 등록'}
                          </span>
                        </td>
                        <td style={{ padding: '11px 14px', fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>{p.name || ''}</td>
                        <td style={{ padding: '11px 14px', color: '#374151', whiteSpace: 'nowrap' }}>{p.region || '-'}</td>
                        <td style={{ padding: '11px 14px', color: '#374151', whiteSpace: 'nowrap' }}>{p.category || '-'}</td>
                        <td style={{ padding: '11px 14px', color: '#374151', whiteSpace: 'nowrap' }}>{p.contact || ''}</td>
                        <td style={{ padding: '11px 14px', color: '#374151', whiteSpace: 'nowrap' }}>{p.email || '-'}</td>
                        <td style={{ padding: '11px 14px', color: '#2563eb', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.link ? <a href={p.link.startsWith('http') ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>{p.link}</a> : '-'}
                        </td>
                        <td style={{ padding: '11px 14px', color: '#374151', maxWidth: 260, whiteSpace: 'pre-wrap' }}>{p.message || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── Members (회원관리) ── */}
        {tab === 'members' && (
          <div>
            <SectionHeader title="회원 관리" sub="디지털 회원증 발급 대상 · 회비 납부 회원 등록/관리" />
            {/* 회원 추가 폼 */}
            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 10, alignItems: 'end' }}>
              <div><label style={mLabel}>이름 *</label><input value={newMember.name || ''} onChange={(e) => setNewMember((p) => ({ ...p, name: e.target.value }))} style={mInput} placeholder="홍길동" /></div>
              <div><label style={mLabel}>전화번호 *</label><input value={newMember.phone || ''} onChange={(e) => setNewMember((p) => ({ ...p, phone: e.target.value }))} style={mInput} placeholder="010-0000-0000" /></div>
              <div><label style={mLabel}>지역</label><input value={newMember.region || ''} onChange={(e) => setNewMember((p) => ({ ...p, region: e.target.value }))} style={mInput} placeholder="원주" /></div>
              <div><label style={mLabel}>상태</label><select value={newMember.status || 'active'} onChange={(e) => setNewMember((p) => ({ ...p, status: e.target.value }))} style={mInput}><option value="active">활성</option><option value="expired">만료</option><option value="pending">대기</option></select></div>
              <div><label style={mLabel}>가입일</label><input type="date" value={newMember.joined_at || ''} onChange={(e) => setNewMember((p) => ({ ...p, joined_at: e.target.value }))} style={mInput} /></div>
              <div><label style={mLabel}>만료일</label><input type="date" value={newMember.expires_at || ''} onChange={(e) => setNewMember((p) => ({ ...p, expires_at: e.target.value }))} style={mInput} /></div>
              <button onClick={saveMember} style={{ padding: '9px 18px', background: '#12A79D', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', height: 37 }}>+ 회원 추가</button>
            </div>
            {/* 검색 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12 }}>
              <input value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} placeholder="이름·전화·회원번호 검색" style={{ ...mInput, maxWidth: 280 }} />
              <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>총 {members.length}명 · 활성 {members.filter((m) => m.status === 'active').length}명</span>
            </div>
            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'auto' }}>
              {(() => {
                const q = memberSearch.trim().toLowerCase();
                const filtered = q ? members.filter((m) => `${m.name} ${m.phone} ${m.member_no} ${m.region}`.toLowerCase().includes(q)) : members;
                if (filtered.length === 0) return <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 13 }}>{members.length === 0 ? '등록된 회원이 없습니다' : '검색 결과 없음'}</div>;
                return (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead><tr style={{ background: '#f9fafb', textAlign: 'left' }}>{['회원번호', '이름', '전화', '지역', '상태', '가입일', '만료일', '관리'].map((h) => <th key={h} style={{ padding: '11px 14px', fontSize: 12, color: '#6b7280', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid #e5e7eb' }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {[...filtered].reverse().map((m, i) => (
                        <tr key={m.id ?? i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#374151', whiteSpace: 'nowrap' }}>{m.member_no}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>{m.name}</td>
                          <td style={{ padding: '10px 14px', color: '#374151', whiteSpace: 'nowrap' }}>{m.phone}</td>
                          <td style={{ padding: '10px 14px', color: '#374151', whiteSpace: 'nowrap' }}>{m.region || '-'}</td>
                          <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                            <select value={m.status || 'active'} onChange={(e) => updateMemberStatus(m, e.target.value)} style={{ fontSize: 12, padding: '3px 6px', borderRadius: 6, border: '1px solid #e5e7eb', background: m.status === 'active' ? '#D6F5F1' : m.status === 'expired' ? '#fee2e2' : '#fef3c7', color: m.status === 'active' ? '#12A79D' : m.status === 'expired' ? '#dc2626' : '#92400e', fontWeight: 700, cursor: 'pointer' }}>
                              <option value="active">활성</option><option value="expired">만료</option><option value="pending">대기</option>
                            </select>
                          </td>
                          <td style={{ padding: '10px 14px', color: '#6b7280', whiteSpace: 'nowrap' }}>{m.joined_at || '-'}</td>
                          <td style={{ padding: '10px 14px', color: '#6b7280', whiteSpace: 'nowrap' }}>{m.expires_at || '-'}</td>
                          <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}><button onClick={() => deleteMember(m)} style={{ fontSize: 12, color: '#ef4444', background: 'none', border: '1px solid #fca5a5', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>삭제</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>
        )}

        {/* ── Payments (결제내역) ── */}
        {tab === 'payments' && (
          <div>
            <SectionHeader title="결제 내역" sub="회비·후원 온라인 결제 내역 (회비 결제는 회원으로 자동 등록됩니다)" />
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>
              총 {payments.length}건 · 완료 {payments.filter((p) => p.status === 'paid').length}건 · 회비 {payments.filter((p) => p.kind === 'membership').length}건 · 후원 {payments.filter((p) => p.kind === 'donation').length}건 · 합계 {payments.filter((p) => p.status === 'paid').reduce((s, p) => s + (Number(p.amount) || 0), 0).toLocaleString()}원
            </div>
            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'auto' }}>
              {payments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 13 }}>결제 내역이 없습니다 (포트원 연동 후 표시됩니다)</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                      {['결제일시', '유형', '이름', '연락처', '이메일', '금액', '상태'].map((h) => (
                        <th key={h} style={{ padding: '12px 14px', fontSize: 12, color: '#6b7280', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, i) => (
                      <tr key={p.id ?? i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '11px 14px', color: '#6b7280', whiteSpace: 'nowrap' }}>{(p.paid_at || p.created_at) ? new Date(p.paid_at || p.created_at!).toLocaleString('ko-KR') : ''}</td>
                        <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 9999, background: p.kind === 'membership' ? '#D6F5F1' : '#fef3c7', color: p.kind === 'membership' ? '#12A79D' : '#92400e' }}>
                            {p.kind === 'membership' ? '회비' : '후원'}
                          </span>
                        </td>
                        <td style={{ padding: '11px 14px', fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>{p.name || ''}</td>
                        <td style={{ padding: '11px 14px', color: '#374151', whiteSpace: 'nowrap' }}>{p.phone || '-'}</td>
                        <td style={{ padding: '11px 14px', color: '#374151', whiteSpace: 'nowrap' }}>{p.email || '-'}</td>
                        <td style={{ padding: '11px 14px', fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>{(Number(p.amount) || 0).toLocaleString()}원</td>
                        <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 9999, background: p.status === 'paid' ? '#D6F5F1' : '#f3f4f6', color: p.status === 'paid' ? '#12A79D' : '#6b7280' }}>
                            {p.status === 'paid' ? '완료' : (p.status || '대기')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── Bookings ── */}
        {tab === 'bookings' && (
          <div>
            <SectionHeader title="예약 내역" sub="펫스카웃 2026 캠핑 사이트 예약 접수 목록" />
            {(() => {
              const validEmail = (e: unknown) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(e ?? ''));
              const real = bookings.filter((b) => b.status === 'pending' && Number(b.amount) > 0 && validEmail(b.email) && String(b.email).toLowerCase() !== 'bennie.dct@gmail.com' && !/홍보용|광고용/.test(String(b.name ?? '')));
              const daysOld = (b: Booking) => (Date.now() - new Date(String(b.created_at)).getTime()) / 86400000;
              const groupA = real.filter((b) => daysOld(b) <= 7);
              const pot = real.reduce((s, b) => s + (Number(b.amount) || 0), 0);
              const rebookSeen = new Set<string>(); const rebookTargets: Booking[] = [];
              for (const b of bookings) { if (b.site === 'F4-14' && b.status === 'cancelled') { const e = String(b.email ?? '').toLowerCase(); if (!e || rebookSeen.has(e)) continue; rebookSeen.add(e); rebookTargets.push(b); } }
              const rbtn = (bg: string, on = true): React.CSSProperties => ({ fontSize: 12.5, fontWeight: 700, fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", padding: '9px 16px', border: 'none', borderRadius: 8, background: on ? bg : '#d1d5db', color: '#fff', cursor: on && !recovering ? 'pointer' : 'default', opacity: recovering ? 0.6 : 1 });
              return (
                <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 12, padding: '16px 18px', marginBottom: 18 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#92400e', marginBottom: 4 }}>💳 미입금 회수메일</div>
                  <div style={{ fontSize: 12.5, color: '#78350f', marginBottom: 12, lineHeight: 1.6 }}>카드결제 안내 + 각자 예약확인 링크를 미입금 예약자에게 발송해요. 대상 <b>{real.length}명</b> · 잠재 <b>{pot.toLocaleString()}원</b> · A그룹(최근 7일) <b>{groupA.length}명</b></div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button disabled={!!recovering} onClick={() => sendRecovery('test', 1)} style={rbtn('#6b7280')}>테스트 발송(나에게)</button>
                    <button disabled={!!recovering || !groupA.length} onClick={() => sendRecovery('group-a', groupA.length)} style={rbtn('#F5A524', !!groupA.length)}>A그룹 {groupA.length}명 발송</button>
                    <button disabled={!!recovering || !real.length} onClick={() => sendRecovery('all', real.length)} style={rbtn('#12A79D', !!real.length)}>전체 {real.length}명 발송</button>
                  </div>
                  <div style={{ borderTop: '1px dashed #fde68a', marginTop: 14, paddingTop: 12 }}>
                    <div style={{ fontSize: 12.5, color: '#78350f', marginBottom: 8 }}>재예약 안내 — F4-14 미입금 취소분 <b>{rebookTargets.length}명</b> (입금 미확인으로 취소 → 다른 자리 재예약 유도)</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button disabled={!!recovering} onClick={() => sendRecovery('rebook-test', 1)} style={rbtn('#6b7280')}>재예약 테스트(나에게)</button>
                      <button disabled={!!recovering || !rebookTargets.length} onClick={() => sendRecovery('rebook', rebookTargets.length)} style={rbtn('#0ea5e9', !!rebookTargets.length)}>재예약 안내 {rebookTargets.length}명 발송</button>
                    </div>
                  </div>
                  {recovering && <div style={{ fontSize: 12, color: '#92400e', marginTop: 10 }}>발송 중… 잠시만요 ({recovering})</div>}
                  {recoveryMsg && <div style={{ fontSize: 12.5, color: '#0A5F59', marginTop: 10, fontWeight: 600, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{recoveryMsg}</div>}
                </div>
              );
            })()}
            {(() => {
              const paid = bookings.filter((b) => b.status === 'paid');
              const arrived = paid.filter((b) => b.checked_in_at);
              const noshow = paid.filter((b) => !b.checked_in_at);
              const isDayB = (b: Booking) => b.booking_type === 'day';
              const paidDay = paid.filter(isDayB);
              const paidStay = paid.filter((b) => !isDayB(b));
              const sumHead = (a: Booking[]) => a.reduce((s, b) => s + (Number(b.headcount) || 0), 0);
              const dayHead = sumHead(paidDay), stayHead = sumHead(paidStay);
              const pill = (bg: string, c: string): React.CSSProperties => ({ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 9999, background: bg, color: c });
              const fbtn = (active: boolean, activeBg = '#12A79D'): React.CSSProperties => ({ fontSize: 12, padding: '8px 18px', border: `1.5px solid ${active ? activeBg : '#e5e7eb'}`, borderRadius: 6, background: active ? activeBg : 'none', cursor: 'pointer', color: active ? '#fff' : '#6b7280', fontWeight: 700, fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif" });
              return (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={pill('#EDFAF8', '#0A5F59')}>확정 {paid.length}건</span>
                    <span style={pill('#D6F5F1', '#12A79D')}>도착 {arrived.length}</span>
                    <span style={pill('#fef3c7', '#C9560F')}>미도착 {noshow.length}</span>
                  </div>
                  {/* 유형·인원 요약 (입금확정 기준) */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={pill('#eff6ff', '#1e40af')}>당일권 {paidDay.length}건 · {dayHead}명</span>
                    <span style={pill('#EDFAF8', '#0A5F59')}>숙박 {paidStay.length}건 · {stayHead}명</span>
                    <span style={pill('#f5f3ff', '#6d28d9')}>총 입장인원 {dayHead + stayHead}명</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>(입금확정 기준 · 건수 · 인원 합계)</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button onClick={async () => setBookings(await fetchBookings())} style={{ ...fbtn(false), border: '1.5px solid #12A79D', background: '#EDFAF8', color: '#0A5F59' }}>↻ 새로고침</button>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>유형:</span>
                    <button onClick={() => setBType('all')} style={fbtn(bType === 'all')}>전체</button>
                    <button onClick={() => setBType('day')} style={fbtn(bType === 'day', '#1e40af')}>당일권</button>
                    <button onClick={() => setBType('stay')} style={fbtn(bType === 'stay')}>숙박</button>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>| 입장:</span>
                    <button onClick={() => setNoShowOnly(false)} style={fbtn(!noShowOnly)}>전체</button>
                    <button onClick={() => setNoShowOnly(true)} style={fbtn(noShowOnly, '#F5A524')}>미도착만</button>
                    <button onClick={exportBookingsCSV} style={{ ...fbtn(false) }}>CSV 내보내기</button>
                  </div>
                </>
              );
            })()}
            {(() => {
              let list = noShowOnly ? bookings.filter((b) => b.status === 'paid' && !b.checked_in_at) : [...bookings];
              if (bType === 'day') list = list.filter((b) => b.booking_type === 'day');
              else if (bType === 'stay') list = list.filter((b) => b.booking_type !== 'day');
              return (
                <>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>표시 <b>{list.length}건</b> {bType === 'day' ? '(당일권)' : bType === 'stay' ? '(숙박)' : ''}{noShowOnly ? ' · 미도착만' : ''}</div>
                  <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'auto' }}>
                    <BookingTable bookings={list} onUpdate={updateBookingStatus} onSend={sendTicketMail} />
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ── 클래스 (웰니스 프로그램 신청 명단·금액) ── */}
        {tab === 'classes' && (() => {
          const classBk = bookings.filter((b) => Array.isArray(b.tshirt_sizes) && b.tshirt_sizes.length);
          const { groups, totalCount, totalAmount } = classBreakdown(bookings);
          const tierBadge = (t: ClassRow['tier']) => {
            const m = { RG: { bg: '#eef2ff', c: '#3730a3' }, 일반: { bg: '#f3f4f6', c: '#374151' }, 아로마: { bg: '#fdf4ff', c: '#a21caf' } }[t];
            return <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 6, background: m.bg, color: m.c }}>{t} {t !== '아로마' ? '' : ''}</span>;
          };
          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <SectionHeader title="클래스 신청 명단·금액" sub="웰니스 프로그램 클래스별 신청자·금액 (홈페이지 결제 기준)" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={async () => setBookings(await fetchBookings())} style={{ fontSize: 12, padding: '8px 14px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151' }}>새로고침</button>
                  <button onClick={() => exportClassesCSV(bookings)} style={{ fontSize: 12, padding: '8px 14px', borderRadius: 8, border: 'none', background: '#12A79D', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>CSV 내보내기</button>
                </div>
              </div>
              {groups.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9ca3af', padding: '40px 0', textAlign: 'center' }}>클래스 신청 내역이 없습니다.</p>
              ) : (
                <>
                  <div style={{ background: '#EDFAF8', border: '1px solid #BFF3EC', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div><span style={{ fontSize: 12, color: '#6b7280' }}>총 신청 </span><b style={{ fontSize: 18, color: '#0D7E76' }}>{totalCount}명</b></div>
                    <div><span style={{ fontSize: 12, color: '#6b7280' }}>총 금액 </span><b style={{ fontSize: 18, color: '#0D7E76' }}>{totalAmount.toLocaleString()}원</b></div>
                    <div style={{ fontSize: 11, color: '#9ca3af', alignSelf: 'center' }}>단가: 낭만기버존 15,000 · 아로마 10,000 · 일반 25,000</div>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#c2410c', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '10px 14px', marginBottom: 16, lineHeight: 1.6 }}>
                    ※ 홈페이지 예약 기준 집계예요. <b>현장결제·별도 계좌입금분</b>(예: 김유선 현장·황보연 계좌입금)은 여기 안 잡힐 수 있으니 은행 입금내역과 함께 확인하세요.
                  </div>
                  <div style={{ display: 'grid', gap: 16 }}>
                    {groups.map((g) => (
                      <div key={g.name} style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                          <b style={{ fontSize: 14, color: '#111' }}>{g.name}</b>
                          <span style={{ fontSize: 13, color: '#0D7E76', fontWeight: 700 }}>{g.count}명 · {g.amount.toLocaleString()}원</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            {g.rows.map((r, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '8px 16px', fontSize: 13, color: '#111', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.person}{r.count > 1 ? ` (${r.count}명)` : ''}</td>
                                <td style={{ padding: '8px 10px', fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{r.slot}</td>
                                <td style={{ padding: '8px 10px' }}>{tierBadge(r.tier)}</td>
                                <td style={{ padding: '8px 16px', fontSize: 13, color: '#111', textAlign: 'right', whiteSpace: 'nowrap' }}>{r.amount.toLocaleString()}원</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 12 }}>클래스 포함 예약 {classBk.length}건 기준</p>
                </>
              )}
            </div>
          );
        })()}

        {/* ── 셀러 (프리마켓 셀러 모집) ── */}
        {tab === 'sellers' && (() => {
          const evName = (id?: number) => events.find((e) => e.id === id)?.title || `행사 #${id}`;
          // 행사 필터 먼저 적용
          const byEvent = sellerEvt === 'all' ? sellers : sellers.filter((s) => s.event_id === sellerEvt);
          const counts = { all: byEvent.length, pending: 0, approved: 0, waitlist: 0, rejected: 0 } as Record<string, number>;
          byEvent.forEach((s) => { counts[s.status] = (counts[s.status] || 0) + 1; });
          const list = sellerFilter === 'all' ? byEvent : byEvent.filter((s) => s.status === sellerFilter);
          const statusChips: [string, string][] = [['all', `전체 ${counts.all}`], ['pending', `대기 ${counts.pending}`], ['approved', `승인 ${counts.approved}`], ['waitlist', `보류 ${counts.waitlist}`], ['rejected', `반려 ${counts.rejected}`]];
          // 신청이 들어온 행사 목록
          const evtIds = [...new Set(sellers.map((s) => s.event_id))];
          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <SectionHeader title="프리마켓 셀러" sub="행사별 신청 셀러 심사·관리 · 승인/보류/반려" />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={async () => setSellers(await fetchSellers())} style={{ fontSize: 12, padding: '8px 14px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151' }}>새로고침</button>
                  <button onClick={() => sendSellerNotify('test')} style={{ fontSize: 12, padding: '8px 14px', borderRadius: 8, border: '1px solid #12A79D', background: '#fff', color: '#0D7E76', cursor: 'pointer', fontWeight: 700 }}>선정메일 테스트</button>
                  <button onClick={() => sendSellerNotify('all', sellerEvt)} style={{ fontSize: 12, padding: '8px 14px', borderRadius: 8, border: 'none', background: '#0D7E76', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>선정메일 발송</button>
                  <button onClick={() => exportSellersCSV(byEvent)} style={{ fontSize: 12, padding: '8px 14px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer', fontWeight: 700 }}>CSV</button>
                </div>
              </div>
              {/* 행사 필터 */}
              {evtIds.length > 1 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: '#9ca3af', alignSelf: 'center', marginRight: 2 }}>행사</span>
                  <button onClick={() => setSellerEvt('all')} style={{ fontSize: 12, padding: '7px 14px', borderRadius: 9999, cursor: 'pointer', border: sellerEvt === 'all' ? '1.5px solid #111' : '1.5px solid #e5e7eb', background: sellerEvt === 'all' ? '#111' : '#fff', color: sellerEvt === 'all' ? '#fff' : '#6b7280', fontWeight: 700 }}>전체 행사</button>
                  {evtIds.map((id) => (
                    <button key={id} onClick={() => setSellerEvt(id)} style={{ fontSize: 12, padding: '7px 14px', borderRadius: 9999, cursor: 'pointer', border: sellerEvt === id ? '1.5px solid #111' : '1.5px solid #e5e7eb', background: sellerEvt === id ? '#111' : '#fff', color: sellerEvt === id ? '#fff' : '#6b7280', fontWeight: 700 }}>{evName(id)} ({sellers.filter((s) => s.event_id === id).length})</button>
                  ))}
                </div>
              )}
              {/* 상태 필터 */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {statusChips.map(([k, l]) => (
                  <button key={k} onClick={() => setSellerFilter(k)} style={{ fontSize: 12, padding: '7px 14px', borderRadius: 9999, cursor: 'pointer', border: sellerFilter === k ? '1.5px solid #12A79D' : '1.5px solid #e5e7eb', background: sellerFilter === k ? '#EDFAF8' : '#fff', color: sellerFilter === k ? '#0D7E76' : '#6b7280', fontWeight: 700 }}>{l}</button>
                ))}
              </div>
              {byEvent.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9ca3af', padding: '40px 0', textAlign: 'center' }}>접수된 셀러 신청이 없습니다.</p>
              ) : (
                <SellerTable sellers={list} onUpdate={updateSeller} eventName={sellerEvt === 'all' ? evName : undefined} />
              )}
            </div>
          );
        })()}

        {/* ── 만족도 조사 결과 ── */}
        {tab === 'survey' && (() => {
          const st = survey.stats;
          const fmt = (v: number | null) => v == null ? '—' : `${v.toFixed(2)} / 5`;
          const statCards: [string, string][] = st ? [
            ['전체 만족도', fmt(st.overall)], ['재방문 의향', fmt(st.revisit)],
            ['프로그램·공연', fmt(st.rating_program)], ['부스·체험', fmt(st.rating_booth)],
            ['편의시설', fmt(st.rating_facility)], ['안전·운영', fmt(st.rating_safety)],
          ] : [];
          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <SectionHeader title="만족도 조사" sub="리플릿 QR 설문 응답·집계 · 행사별 재사용" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={async () => setSurvey(await fetch('/api/admin/survey').then((r) => r.json()))} style={{ fontSize: 12, padding: '8px 14px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151' }}>새로고침</button>
                  <button onClick={exportSurveyCSV} style={{ fontSize: 12, padding: '8px 14px', borderRadius: 8, border: 'none', background: '#12A79D', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>CSV 내보내기</button>
                </div>
              </div>
              {!st || st.total === 0 ? (
                <p style={{ fontSize: 13, color: '#9ca3af', padding: '40px 0', textAlign: 'center' }}>아직 제출된 설문 응답이 없습니다.</p>
              ) : (
                <>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>총 <b style={{ color: '#111' }}>{st.total}</b>명 응답 · 반려동물 동반 {st.petWith}명</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
                    {statCards.map(([label, val]) => (
                      <div key={label} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', background: '#fff' }}>
                        <div style={{ fontSize: 11.5, color: '#6b7280', marginBottom: 6 }}>{label}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#0D7E76' }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 20 }}>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: '#111', marginBottom: 8 }}>참여 프로그램 TOP</div>
                      {Object.entries(st.programCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([p, c]) => (
                        <div key={p} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#4b5563', padding: '3px 0' }}><span>{p}</span><b>{c}</b></div>
                      ))}
                    </div>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: '#111', marginBottom: 8 }}>방문 경로 (홍보 효과)</div>
                      {Object.entries(st.sourceCounts).sort((a, b) => b[1] - a[1]).map(([s, c]) => (
                        <div key={s} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#4b5563', padding: '3px 0' }}><span>{s}</span><b>{c}</b></div>
                      ))}
                    </div>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: '#111', marginBottom: 8 }}>거주 지역 (방문객 유입)</div>
                      {Object.entries(st.regionCounts).sort((a, b) => b[1] - a[1]).map(([s, c]) => (
                        <div key={s} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#4b5563', padding: '3px 0' }}><span>{s}</span><b>{c}</b></div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {survey.responses.filter((s) => s.liked || s.improve).slice(0, 40).map((s) => (
                      <div key={s.id} style={{ border: '1px solid #eee', borderRadius: 10, padding: '12px 14px', fontSize: 13, lineHeight: 1.6 }}>
                        <span style={{ fontSize: 11, color: '#F5A524' }}>{'★'.repeat(s.overall || 0)}{'☆'.repeat(5 - (s.overall || 0))}</span>
                        {s.liked && <div style={{ color: '#0D7E76', marginTop: 4 }}>👍 {s.liked}</div>}
                        {s.improve && <div style={{ color: '#C9560F', marginTop: 4 }}>🔧 {s.improve}</div>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* ── SMS (참가자 안내문자) ── */}
        {tab === 'sms' && (
          <div>
            <SectionHeader title="참가자 안내문자" sub="결제완료 참가자에게 문자 발송 · 행사별 재사용 · {이름} 자동 치환" />
            {(() => {
              const bytes = [...smsMsg].reduce((n, ch) => n + (ch.charCodeAt(0) > 127 ? 2 : 1), 0);
              const type = bytes > 90 ? 'LMS(장문)' : 'SMS(단문)';
              const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, color: '#111', boxSizing: 'border-box', fontFamily: 'inherit' };
              const busy = !!smsSending;
              return (
                <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '20px 22px', maxWidth: 640 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>행사 선택</label>
                  <select value={smsEvent} onChange={(e) => setSmsEvent(Number(e.target.value))} style={{ ...inp, marginBottom: 14 }}>
                    <option value={0}>전체 행사</option>
                    {events.map((ev) => <option key={ev.id ?? ev.order} value={(ev.id ?? ev.order) as number}>{ev.title}</option>)}
                  </select>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>문구  <span style={{ color: '#9ca3af', fontWeight: 400 }}>({'{이름}'} 은 참가자 이름으로 자동 치환)</span></label>
                  <textarea value={smsMsg} onChange={(e) => setSmsMsg(e.target.value)} rows={6} placeholder={'예: [펫스카웃 2026] {이름}님, 9/4(금) 오후 12시부터 입장 가능합니다. 입구 안내 확인 부탁드려요. 문의 033-813-0333'} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
                  <div style={{ fontSize: 12, color: '#9ca3af', margin: '6px 0 16px' }}>글자 {smsMsg.length}자 · 약 {bytes}byte → <b style={{ color: bytes > 90 ? '#C9560F' : '#12A79D' }}>{type}</b></div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button disabled={busy} onClick={() => sendSms('test')} style={{ fontSize: 13, fontWeight: 700, padding: '10px 16px', border: 'none', borderRadius: 8, background: '#6b7280', color: '#fff', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, fontFamily: 'inherit' }}>테스트 발송(내 번호)</button>
                    <button disabled={busy} onClick={() => sendSms('all')} style={{ fontSize: 13, fontWeight: 700, padding: '10px 16px', border: 'none', borderRadius: 8, background: '#12A79D', color: '#fff', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, fontFamily: 'inherit' }}>참가자 전체 발송</button>
                  </div>
                  {smsSending && <div style={{ fontSize: 12, color: '#92400e', marginTop: 10 }}>발송 중… ({smsSending})</div>}
                  {smsResult && <div style={{ fontSize: 12.5, color: smsResult.startsWith('✅') ? '#0A5F59' : '#dc2626', marginTop: 10, fontWeight: 600, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{smsResult}</div>}
                  <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 14, lineHeight: 1.7, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                    ※ 대상 = 선택 행사의 <b>결제완료 + 전화번호 보유</b> 참가자(번호 중복 자동 제거).<br />
                    ※ 문자 발송은 <b>알리고(aligo) API키·발신번호</b> 등록 후 작동합니다. (발신번호 사전등록 필요)<br />
                    ※ 건당 비용 발생 · 정보성 안내 문구 권장(광고성이면 (광고)·수신거부 필수).
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Events ── */}
        {tab === 'events' && (
          <div>
            <SectionHeader title="행사 관리" sub="다가오는 행사 먼저 · 상태·기간·모집여부 자동 표시" onAdd={() => { setEditEvent({}); setEventModal(true); }} addLabel="+ 행사 추가" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[...events].sort((a, b) => {
                const ea = effectiveStatus(a) === 'ended', eb = effectiveStatus(b) === 'ended';
                if (ea !== eb) return ea ? 1 : -1; // 예정/진행중 먼저
                const sa = eventDates(a).start?.getTime() ?? 0, sb = eventDates(b).start?.getTime() ?? 0;
                return ea ? sb - sa : sa - sb; // 예정=임박순 / 종료=최근순
              }).map((ev) => {
                const est = effectiveStatus(ev);
                const stMeta = { upcoming: { t: '예정', c: '#c2410c', bg: '#fff7ed' }, live: { t: '진행중', c: '#0D7E76', bg: '#EDFAF8' }, ended: { t: '종료', c: '#6b7280', bg: '#f3f4f6' }, soon: { t: '임박', c: '#c2410c', bg: '#fff7ed' } }[est];
                const { start, end } = eventDates(ev);
                const period = start ? `${start.toISOString().slice(0, 10)}${end && end.getTime() !== start.getTime() ? ` ~ ${end.toISOString().slice(0, 10)}` : ''}` : (ev.date || '날짜 미설정');
                return (
                <div key={ev.id} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '1/1', background: ev.imageData ? `url(${ev.imageData}) center/cover` : 'linear-gradient(135deg,#e8f5e9,#c8e6c9)' }} />
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 9999, color: stMeta.c, background: stMeta.bg }}>{stMeta.t}</span>
                      {ev.sellerOpen && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, color: '#0D7E76', background: '#EDFAF8', border: '1px solid #BFF3EC' }}>셀러모집</span>}
                      {ev.surveyOpen && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe' }}>설문중</span>}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>{ev.title}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>{period} · {ev.loc}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button onClick={() => { setEditEvent({ ...ev, _key: ev.id }); setEventModal(true); }} style={btnEdit}>수정</button>
                      <button onClick={() => deleteEvent(ev.id!)} style={btnDel}>삭제</button>
                      <a href={`/events/${ev.id}`} target="_blank" rel="noopener noreferrer" style={{ ...btnEdit, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>미리보기</a>
                    </div>
                  </div>
                </div>
                );
              })}
              <button onClick={() => { setEditEvent({}); setEventModal(true); }} style={{ background: '#f8fafc', border: '2px dashed #d1d5db', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', minHeight: 140 }}>
                <span style={{ fontSize: 24, opacity: 0.4 }}>+</span>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>행사 추가</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Archive ── */}
        {tab === 'archive' && (() => {
          const sortedForAdmin = [...archives].sort((a, b) => (a.order || 0) - (b.order || 0));
          return (
          <div>
            <SectionHeader title="아카이브 행사" sub="지난 행사 기록 관리 — ↑↓ 로 순서 조정, 썸네일 클릭으로 대표 이미지 설정" onAdd={() => { setEditArchive({}); setArchiveModal(true); }} addLabel="+ 행사 추가" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {sortedForAdmin.map((arc, listIdx) => {
                const thumb = arc.imageData || (arc.images && arc.images[0]) || null;
                return (
                <div key={arc.order} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                  {/* 썸네일 — 클릭 시 이미지 피커 오픈 */}
                  <div
                    onClick={() => setImagePickerArc(arc)}
                    style={{
                      height: 120, cursor: 'pointer', position: 'relative',
                      background: thumb ? `url(${thumb}) center/cover` : 'linear-gradient(135deg,#e8f5e9,#a5d6a7)',
                    }}
                  >
                    {arc.feat && <span style={{ position: 'absolute', top: 10, left: 10, background: '#12A79D', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 9999 }}>FEATURED</span>}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.4)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}
                    >
                      <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>🖼️ 대표 이미지 선정</span>
                    </div>
                    {arc.images && arc.images.length > 0 && (
                      <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>
                        📷 {arc.images.length}장
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 3 }}>{arc.title}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>{arc.year} · {arc.loc} {arc.ppl ? `· ${arc.ppl}명` : ''}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* 순서 버튼 */}
                      <button onClick={() => moveArchiveOrder(arc, 'up')} disabled={listIdx === 0} style={{ fontSize: 13, padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'none', cursor: listIdx === 0 ? 'default' : 'pointer', color: listIdx === 0 ? '#d1d5db' : '#374151' }}>↑</button>
                      <button onClick={() => moveArchiveOrder(arc, 'down')} disabled={listIdx === sortedForAdmin.length - 1} style={{ fontSize: 13, padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'none', cursor: listIdx === sortedForAdmin.length - 1 ? 'default' : 'pointer', color: listIdx === sortedForAdmin.length - 1 ? '#d1d5db' : '#374151' }}>↓</button>
                      <span style={{ fontSize: 10, color: '#d1d5db', userSelect: 'none' }}>|</span>
                      <button onClick={() => { const imgs = arc.images && arc.images.length > 0 ? arc.images : [arc.imageData, arc.imageData2].filter((x): x is string => !!x); setEditArchive({ ...arc, _key: arc.id, images: imgs }); setArchiveModal(true); }} style={btnEdit}>수정</button>
                      <button onClick={() => deleteArchive(arc.id!)} style={btnDel}>삭제</button>
                    </div>
                  </div>
                </div>
              )})}
              <button onClick={() => { setEditArchive({}); setArchiveModal(true); }} style={{ background: '#f8fafc', border: '2px dashed #d1d5db', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', minHeight: 160 }}>
                <span style={{ fontSize: 24, opacity: 0.4 }}>+</span>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>행사 추가</span>
              </button>
            </div>
          </div>
          );
        })()}

        {/* ── Partners ── */}
        {tab === 'partners' && (
          <div>
            <SectionHeader title="제휴업체" sub="강원도 반려동물 제휴업체 목록" onAdd={() => { setEditPartner({}); setPartnerModal(true); }} addLabel="+ 업체 추가" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {partners.map((pt) => (
                <div key={pt.id} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{pt.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 3 }}>{pt.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>{pt.region} · {pt.type}</div>
                  {pt.discount && <div style={{ fontSize: 12, color: '#12A79D', marginBottom: 10 }}>{pt.discount}</div>}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditPartner({ ...pt, _key: pt.id }); setPartnerModal(true); }} style={btnEdit}>수정</button>
                    <button onClick={() => deletePartner(pt.id!)} style={btnDel}>삭제</button>
                  </div>
                </div>
              ))}
              <button onClick={() => { setEditPartner({}); setPartnerModal(true); }} style={{ background: '#f8fafc', border: '2px dashed #d1d5db', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', minHeight: 140 }}>
                <span style={{ fontSize: 24, opacity: 0.4 }}>+</span>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>업체 추가</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Images ── */}
        {tab === 'images' && (
          <div>
            <SectionHeader title="이미지 관리" sub="홈페이지 이미지 · JPG / PNG / WebP · 장당 최대 2MB" />
            {/* Hero */}
            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ padding: '16px 22px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>히어로 슬라이드</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>메인 페이지 상단 슬라이드 배경 이미지 (슬라이드 1~3)</div>
              </div>
              <div style={{ padding: '20px 22px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                  {heroImages.map((h) => (
                    <div key={h.id} style={{ border: `1.5px ${h.imageData ? 'solid #e5e7eb' : 'dashed #d1d5db'}`, borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ aspectRatio: '16/9', background: h.imageData ? `url(${h.imageData}) center/cover` : '#f8fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {!h.imageData && <span style={{ fontSize: 11, color: '#9ca3af' }}>이미지 없음</span>}
                      </div>
                      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>슬라이드 {h.id}</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <label style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, cursor: 'pointer', border: '1.5px solid #12A79D', background: '#EDFAF8', color: '#12A79D' }}>
                            업로드 <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => pickHeroImage(h.id, e)} />
                          </label>
                          {h.imageData && <button onClick={() => removeHeroImage(h.id)} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'none', cursor: 'pointer', color: '#9ca3af' }}>삭제</button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Gallery */}
            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1px solid #e5e7eb' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>이벤트 갤러리</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>행사 페이지 상단 포토 갤러리 — 활성화된 순서대로 최대 5장 표시</div>
                </div>
                <button onClick={addGalleryItem} style={{ padding: '6px 14px', borderRadius: 9999, background: '#12A79D', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>+ 추가</button>
              </div>
              <div style={{ padding: '20px 22px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                  {galleryItems.map((g) => (
                    <div key={g.id} style={{ border: `1.5px ${g.imageData ? 'solid #e5e7eb' : 'dashed #d1d5db'}`, borderRadius: 12, overflow: 'hidden', opacity: g.active ? 1 : 0.55 }}>
                      <div style={{ aspectRatio: '1/1', background: g.imageData ? `url(${g.imageData}) center/cover` : 'linear-gradient(135deg,#EDFAF8,#D6F5F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {!g.imageData && <span style={{ fontSize: 32, opacity: 0.4 }}>🐾</span>}
                      </div>
                      <div style={{ padding: '10px 14px' }}>
                        <input value={g.caption} onChange={(e) => setGalleryItems((prev) => prev.map((x) => x.id === g.id ? { ...x, caption: e.target.value } : x))} onBlur={(e) => updateGalleryCaption(g.id!, e.target.value)} placeholder="사진 설명" style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 8px', fontSize: 11, marginBottom: 8, outline: 'none', boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          <label style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', border: '1.5px solid #12A79D', background: '#EDFAF8', color: '#12A79D' }}>
                            이미지 <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => pickGalleryImage(g.id!, e)} />
                          </label>
                          {g.imageData && <button onClick={() => removeGalleryImage(g.id!)} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'none', cursor: 'pointer', color: '#9ca3af' }}>삭제</button>}
                          <button onClick={() => toggleGalleryActive(g.id!)} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: g.active ? '#EDFAF8' : '#f8fafc', cursor: 'pointer', color: g.active ? '#12A79D' : '#9ca3af', fontWeight: 600 }}>{g.active ? '활성' : '비활성'}</button>
                          <button onClick={() => deleteGalleryItem(g.id!)} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 6, border: '1px solid #fca5a5', background: 'none', cursor: 'pointer', color: '#ef4444' }}>제거</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addGalleryItem} style={{ background: '#f8fafc', border: '2px dashed #d1d5db', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', minHeight: 180 }}>
                    <span style={{ fontSize: 24, opacity: 0.4 }}>+</span>
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>사진 추가</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Content (Activity + Lookbook) ── */}
        {tab === 'content' && (
          <div>
            {/* Activity Cards */}
            <SectionHeader title="활동카드" sub="홈페이지 / 협회소개 페이지 활동 카드 관리" onAdd={() => { setEditActivity({}); setActivityModal(true); }} addLabel="+ 카드 추가" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 40 }}>
              {activityCards.map((ac) => (
                <div key={ac.id} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{ac.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>{ac.title}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 3 }}>{ac.tag}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10, lineHeight: 1.5 }}>{ac.desc?.slice(0, 60)}{(ac.desc?.length || 0) > 60 ? '…' : ''}</div>
                  <div style={{ fontSize: 11, color: '#12A79D', marginBottom: 10 }}>{ac.link}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditActivity({ ...ac, _key: ac.id }); setActivityModal(true); }} style={btnEdit}>수정</button>
                    <button onClick={() => deleteActivity(ac.id!)} style={btnDel}>삭제</button>
                  </div>
                </div>
              ))}
              <button onClick={() => { setEditActivity({}); setActivityModal(true); }} style={{ background: '#f8fafc', border: '2px dashed #d1d5db', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', minHeight: 140 }}>
                <span style={{ fontSize: 24, opacity: 0.4 }}>+</span>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>카드 추가</span>
              </button>
            </div>

            {/* Lookbook */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 32 }}>
              <h2 style={{ fontFamily: "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif", fontSize: 24, color: '#111', marginBottom: 4 }}>룩북</h2>
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>홈페이지 룩북 갤러리 항목</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                {lookbookItems.map((lb) => (
                  <div key={lb.id} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ aspectRatio: '3/4', background: lb.imageData ? `url(${lb.imageData}) center/cover` : 'linear-gradient(135deg,#EDFAF8,#D6F5F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {lb.isMain && <span style={{ position: 'absolute', top: 8, left: 8, background: '#12A79D', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 9999 }}>MAIN</span>}
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 4 }}>{lb.label}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8, wordBreak: 'break-all' }}>{lb.link}</div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <label style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', border: '1.5px solid #12A79D', background: '#EDFAF8', color: '#12A79D' }}>
                          이미지 <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const b64 = await clientDB.toStorageUrl(f); saveLookbook({ ...lb, imageData: b64 }); }} />
                        </label>
                        <button onClick={async () => { const newLabel = prompt('레이블 입력:', lb.label); if (newLabel !== null) saveLookbook({ ...lb, label: newLabel }); }} style={btnEdit}>레이블</button>
                        <button onClick={async () => { const newLink = prompt('링크 URL 입력:', lb.link); if (newLink !== null) saveLookbook({ ...lb, link: newLink }); }} style={btnEdit}>링크</button>
                        <button onClick={() => deleteLookbook(lb.id!)} style={btnDel}>삭제</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Travel ── */}
        {tab === 'travel' && (
          <div>
            <SectionHeader title="여행지 관리" sub="강원도 반려동물 동반 여행지 목록" onAdd={() => { setEditTravel({}); setTravelModal(true); }} addLabel="+ 여행지 추가" />
            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['장소명', '지역', '유형', '주소', '파트너', '조작'].map((h) => (
                      <th key={h} style={{ fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", fontSize: 10, letterSpacing: '0.08em', color: '#9ca3af', textAlign: 'left', padding: '11px 16px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {travelPlaces.map((pl) => (
                    <tr key={pl.id}>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: 13, fontWeight: 600, color: '#111' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {pl.imageData && <div style={{ width: 40, height: 40, borderRadius: 8, background: `url(${pl.imageData}) center/cover`, flexShrink: 0 }} />}
                          {pl.name}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: 13, color: '#6b7280' }}>{pl.region}</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: 13, color: '#6b7280' }}>{pl.type}</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: 12, color: '#9ca3af', maxWidth: 200 }}>{pl.address}</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, background: pl.isPartner ? '#EDFAF8' : '#f8fafc', color: pl.isPartner ? '#12A79D' : '#9ca3af', fontWeight: 700 }}>{pl.isPartner ? '파트너' : '일반'}</span>
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { setEditTravel({ ...pl, _key: pl.id }); setTravelModal(true); }} style={btnEdit}>수정</button>
                          <button onClick={() => deleteTravel(pl.id!)} style={btnDel}>삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {travelPlaces.length === 0 && <div style={{ textAlign: 'center', padding: 40, fontSize: 13, color: '#9ca3af' }}>여행지가 없습니다. 추가해 주세요.</div>}
            </div>
          </div>
        )}

        {/* ── Settings (Hashtags) ── */}
        {tab === 'settings' && (
          <div>
            <SectionHeader title="페이지 해시태그 설정" sub="각 페이지 상단에 표시될 해시태그를 쉼표로 구분하여 입력하세요" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
              {(['index', 'events', 'travel', 'education', 'mateship', 'about'] as PageHashtags['page'][]).map((page) => {
                const labels: Record<string, string> = { index: '홈페이지', events: '행사', travel: '여행', education: '교육', mateship: '메이트쉽', about: '협회소개' };
                return (
                  <div key={page} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '22px 24px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>{labels[page]} 페이지</div>
                    <div style={{ fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", fontSize: 10, color: '#9ca3af', letterSpacing: '0.08em', marginBottom: 12 }}>{page.toUpperCase()}</div>
                    <textarea
                      value={hashtagDraft[page] || ''}
                      onChange={(e) => setHashtagDraft((prev) => ({ ...prev, [page]: e.target.value }))}
                      rows={3}
                      placeholder="#강원도반려동물협회, #GWAA, #메이트쉽"
                      style={{ ...inputStyle, resize: 'vertical', fontSize: 13 }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                      <button onClick={() => saveHashtag(page)} style={{ padding: '7px 18px', borderRadius: 9999, background: '#12A79D', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>저장</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ── Event Modal ── */}
      <AnimatePresence>
        {eventModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && setEventModal(false)} style={modalOverlayStyle}>
            <motion.div initial={{ y: 20, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.97 }} onClick={(e) => e.stopPropagation()} style={modalBoxStyle}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 20 }}>{editEvent._key ? '행사 수정' : '행사 추가'}</h2>
              <ImageUploadBox imageData={editEvent.imageData} placeholder="🎪" onPick={async (e) => { const f = e.target.files?.[0]; if (!f) return; setEditEvent((p) => ({ ...p, imageData: undefined })); const b64 = await clientDB.toStorageUrl(f); setEditEvent((p) => ({ ...p, imageData: b64 })); }} onRemove={() => setEditEvent((p) => ({ ...p, imageData: undefined }))} />
              <div style={fieldStyle}><label style={labelStyle}>행사명 *</label><input value={editEvent.title || ''} onChange={(e) => setEditEvent((p) => ({ ...p, title: e.target.value }))} placeholder="2026 반려동물 축제" style={inputStyle} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fieldStyle}><label style={labelStyle}>날짜 표기 (카드에 보이는 문구)</label><input value={editEvent.date || ''} onChange={(e) => setEditEvent((p) => ({ ...p, date: e.target.value }))} placeholder="2026. 9. 13.(일) 10:00~17:00" style={inputStyle} /></div>
                <div style={fieldStyle}><label style={labelStyle}>장소</label><input value={editEvent.loc || ''} onChange={(e) => setEditEvent((p) => ({ ...p, loc: e.target.value }))} placeholder="강릉종합운동장 · 강원 강릉" style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fieldStyle}><label style={labelStyle}>시작일 (자동 상태·D-day용)</label><input type="date" value={editEvent.startDate || ''} onChange={(e) => setEditEvent((p) => ({ ...p, startDate: e.target.value }))} style={inputStyle} /></div>
                <div style={fieldStyle}><label style={labelStyle}>종료일 (지나면 자동 종료)</label><input type="date" value={editEvent.endDate || ''} onChange={(e) => setEditEvent((p) => ({ ...p, endDate: e.target.value }))} style={inputStyle} /></div>
              </div>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '-6px 0 14px', lineHeight: 1.6 }}>※ 시작일/종료일을 채우면 날짜가 지난 뒤 <b>자동으로 &lsquo;지난 행사&rsquo;로 이동</b>하고, 홈 대표행사·D-day가 자동 계산돼요. 하루 행사는 시작일·종료일을 같게 넣으세요.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#111', cursor: 'pointer', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '11px 13px', background: editEvent.sellerOpen ? '#EDFAF8' : '#fff' }}>
                  <input type="checkbox" checked={!!editEvent.sellerOpen} onChange={(e) => setEditEvent((p) => ({ ...p, sellerOpen: e.target.checked }))} style={{ width: 17, height: 17 }} />
                  🛍️ 프리마켓 셀러 모집 열기
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#111', cursor: 'pointer', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '11px 13px', background: editEvent.surveyOpen ? '#EDFAF8' : '#fff' }}>
                  <input type="checkbox" checked={!!editEvent.surveyOpen} onChange={(e) => setEditEvent((p) => ({ ...p, surveyOpen: e.target.checked }))} style={{ width: 17, height: 17 }} />
                  📋 만족도조사 열기
                </label>
              </div>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '-6px 0 14px', lineHeight: 1.6 }}>※ 셀러 모집을 켜면 홈 배너·/sellers·행사 상세에 신청 버튼이 노출돼요. 만족도조사를 켜면 /survey QR 설문이 이 행사로 연결됩니다.</p>
              <div style={fieldStyle}><label style={labelStyle}>짧은 설명 (카드용)</label><textarea value={editEvent.desc || ''} onChange={(e) => setEditEvent((p) => ({ ...p, desc: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
              <div style={fieldStyle}><label style={labelStyle}>상세 내용</label><textarea value={editEvent.content || ''} onChange={(e) => setEditEvent((p) => ({ ...p, content: e.target.value }))} rows={5} placeholder="행사 소개, 일정, 참가 방법 등 자세한 내용" style={{ ...inputStyle, resize: 'vertical' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fieldStyle}><label style={labelStyle}>상태</label>
                  <select value={editEvent.status || 'upcoming'} onChange={(e) => setEditEvent((p) => ({ ...p, status: e.target.value as EventStatus }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="live">진행중</option><option value="soon">사전예약</option><option value="upcoming">예정</option><option value="ended">종료</option>
                  </select>
                </div>
                <div style={fieldStyle}><label style={labelStyle}>링크 URL</label><input value={editEvent.link || ''} onChange={(e) => setEditEvent((p) => ({ ...p, link: e.target.value }))} placeholder="/events/..." style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fieldStyle}><label style={labelStyle}>혜택 텍스트</label><input value={editEvent.benefit || ''} onChange={(e) => setEditEvent((p) => ({ ...p, benefit: e.target.value }))} placeholder="⭐ 메이트쉽 회원 우선 예약" style={inputStyle} /></div>
                <div style={fieldStyle}><label style={labelStyle}>CTA 버튼</label><input value={editEvent.ctaText || ''} onChange={(e) => setEditEvent((p) => ({ ...p, ctaText: e.target.value }))} placeholder="신청하기 →" style={inputStyle} /></div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}><button onClick={() => setEventModal(false)} style={btnCancel}>취소</button><button onClick={saveEvent} style={btnSave}>저장</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Archive Modal ── */}
      <AnimatePresence>
        {archiveModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && setArchiveModal(false)} style={modalOverlayStyle}>
            <motion.div initial={{ y: 20, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.97 }} onClick={(e) => e.stopPropagation()} style={modalBoxStyle}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 20 }}>{editArchive._key ? '아카이브 수정' : '아카이브 행사 추가'}</h2>
              <div style={fieldStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label style={labelStyle}>행사 이미지 (최대 20장)</label>
                  <span style={{ fontSize: 11, color: '#6b7280', fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif" }}>
                    {(editArchive.images || []).length} / 20
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {(editArchive.images || []).map((img, idx) => (
                    <div
                      key={idx}
                      className="group"
                      style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: idx === 0 ? '2px solid #12A79D' : '1.5px solid #e5e7eb', cursor: idx === 0 ? 'default' : 'pointer' }}
                      onClick={() => {
                        if (idx === 0) return;
                        setEditArchive((p) => {
                          const imgs = [...(p.images || [])];
                          const [picked] = imgs.splice(idx, 1);
                          imgs.unshift(picked);
                          return { ...p, images: imgs };
                        });
                      }}
                    >
                      <div style={{ width: '100%', height: '100%', background: `url(${img}) center/cover` }} />
                      {idx !== 0 && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                          <span className="text-white text-[9px] font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity text-center leading-tight px-1">★ 대표<br/>설정</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setEditArchive((p) => ({ ...p, images: (p.images || []).filter((_, i) => i !== idx) })); }}
                        style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0, zIndex: 2 }}
                      >×</button>
                      {idx === 0 && (
                        <span style={{ position: 'absolute', bottom: 4, left: 4, background: '#12A79D', color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 3, letterSpacing: '0.04em' }}>대표</span>
                      )}
                    </div>
                  ))}
                  {(editArchive.images || []).length < 20 && (
                    <label style={{ aspectRatio: '1', borderRadius: 8, border: '2px dashed #d1d5db', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#f9fafb', gap: 3 }}>
                      <span style={{ fontSize: 22, color: '#9ca3af', lineHeight: 1 }}>+</span>
                      <span style={{ fontSize: 9, color: '#9ca3af' }}>추가</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          const current = editArchive.images || [];
                          const toProcess = files.slice(0, 20 - current.length);
                          const b64s: string[] = [];
                          for (const f of toProcess) {
                            const { ok, error } = clientDB.validateImage(f);
                            if (!ok) { showToast(error!, true); e.target.value = ''; return; }
                            b64s.push(await clientDB.toStorageUrl(f));
                          }
                          setEditArchive((p) => ({ ...p, images: [...(p.images || []), ...b64s] }));
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>
                <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 6 }}>이미지를 클릭하면 대표 이미지로 설정됩니다. 최대 20장, 여러 장 동시 선택 가능.</p>
              </div>
              <div style={fieldStyle}><label style={labelStyle}>행사명 *</label><input value={editArchive.title || ''} onChange={(e) => setEditArchive((p) => ({ ...p, title: e.target.value }))} placeholder="강릉시반려동물문화축제" style={inputStyle} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div style={fieldStyle}><label style={labelStyle}>연도</label><input value={editArchive.year || ''} onChange={(e) => setEditArchive((p) => ({ ...p, year: Number(e.target.value) }))} placeholder="2024" type="number" style={inputStyle} /></div>
                <div style={fieldStyle}><label style={labelStyle}>지역</label><input value={editArchive.loc || ''} onChange={(e) => setEditArchive((p) => ({ ...p, loc: e.target.value }))} placeholder="강릉" style={inputStyle} /></div>
                <div style={fieldStyle}><label style={labelStyle}>참가자 수</label><input value={editArchive.ppl || ''} onChange={(e) => setEditArchive((p) => ({ ...p, ppl: e.target.value }))} placeholder="3,500" style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fieldStyle}><label style={labelStyle}>날짜</label><input value={editArchive.date || ''} onChange={(e) => setEditArchive((p) => ({ ...p, date: e.target.value }))} placeholder="2024.09.14–15" style={inputStyle} /></div>
                <div style={fieldStyle}><label style={labelStyle}>장소명</label><input value={editArchive.place || ''} onChange={(e) => setEditArchive((p) => ({ ...p, place: e.target.value }))} placeholder="강릉솔올공원" style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fieldStyle}><label style={labelStyle}>운영 역할 (PART)</label><input value={editArchive.part || ''} onChange={(e) => setEditArchive((p) => ({ ...p, part: e.target.value }))} placeholder="프로젝트 자체 기획 · 제작 · 운영" style={inputStyle} /></div>
                <div style={fieldStyle}><label style={labelStyle}>주최 (ORGANIZER)</label><input value={editArchive.organizer || ''} onChange={(e) => setEditArchive((p) => ({ ...p, organizer: e.target.value }))} placeholder="가평군" style={inputStyle} /></div>
              </div>
              <div style={fieldStyle}><label style={labelStyle}>개요 (OVERVIEW)</label><textarea value={editArchive.desc || ''} onChange={(e) => setEditArchive((p) => ({ ...p, desc: e.target.value }))} rows={5} placeholder="행사의 목적, 성격, 주요 콘텐츠를 설명하는 전체 소개글을 작성하세요." style={{ ...inputStyle, resize: 'vertical' }} /></div>
              <div style={fieldStyle}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  <input type="checkbox" checked={editArchive.feat ?? false} onChange={(e) => setEditArchive((p) => ({ ...p, feat: e.target.checked }))} style={{ width: 16, height: 16 }} />
                  FEATURED 표시 (벤토 그리드에서 강조)
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}><button onClick={() => setArchiveModal(false)} style={btnCancel}>취소</button><button onClick={saveArchive} style={btnSave}>저장</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Partner Modal ── */}
      <AnimatePresence>
        {partnerModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && setPartnerModal(false)} style={modalOverlayStyle}>
            <motion.div initial={{ y: 20, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.97 }} onClick={(e) => e.stopPropagation()} style={modalBoxStyle}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 20 }}>{editPartner._key ? '업체 수정' : '업체 추가'}</h2>
              <ImageUploadBox imageData={editPartner.imageData} placeholder="🏢" onPick={async (e) => { const f = e.target.files?.[0]; if (!f) return; const b64 = await clientDB.toStorageUrl(f); setEditPartner((p) => ({ ...p, imageData: b64 })); }} onRemove={() => setEditPartner((p) => ({ ...p, imageData: undefined }))} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fieldStyle}><label style={labelStyle}>업체명 *</label><input value={editPartner.name || ''} onChange={(e) => setEditPartner((p) => ({ ...p, name: e.target.value }))} placeholder="퍼피파크 애견카페" style={inputStyle} /></div>
                <div style={fieldStyle}><label style={labelStyle}>지역</label><input value={editPartner.region || ''} onChange={(e) => setEditPartner((p) => ({ ...p, region: e.target.value }))} placeholder="원주" style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fieldStyle}><label style={labelStyle}>업종</label>
                  <select value={editPartner.type || 'cafe'} onChange={(e) => setEditPartner((p) => ({ ...p, type: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="cafe">카페</option><option value="hotel">호텔/펜션</option><option value="camping">캠핑장</option><option value="park">공원/관광지</option><option value="shop">용품점</option><option value="hospital">동물병원</option>
                  </select>
                </div>
                <div style={fieldStyle}><label style={labelStyle}>아이콘 이모지</label><input value={editPartner.icon || ''} onChange={(e) => setEditPartner((p) => ({ ...p, icon: e.target.value }))} placeholder="☕" style={inputStyle} /></div>
              </div>
              <div style={fieldStyle}><label style={labelStyle}>할인 혜택</label><input value={editPartner.discount || ''} onChange={(e) => setEditPartner((p) => ({ ...p, discount: e.target.value }))} placeholder="음료 10% 할인" style={inputStyle} /></div>
              <div style={fieldStyle}><label style={labelStyle}>링크 URL</label><input value={editPartner.link || ''} onChange={(e) => setEditPartner((p) => ({ ...p, link: e.target.value }))} placeholder="https://..." style={inputStyle} /></div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}><button onClick={() => setPartnerModal(false)} style={btnCancel}>취소</button><button onClick={savePartner} style={btnSave}>저장</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Activity Modal ── */}
      <AnimatePresence>
        {activityModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && setActivityModal(false)} style={modalOverlayStyle}>
            <motion.div initial={{ y: 20, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.97 }} onClick={(e) => e.stopPropagation()} style={modalBoxStyle}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 20 }}>{editActivity._key ? '활동카드 수정' : '활동카드 추가'}</h2>
              <ImageUploadBox imageData={editActivity.imageData} placeholder="🐾" ratio="16/9" onPick={async (e) => { const f = e.target.files?.[0]; if (!f) return; const b64 = await clientDB.toStorageUrl(f); setEditActivity((p) => ({ ...p, imageData: b64 })); }} onRemove={() => setEditActivity((p) => ({ ...p, imageData: undefined }))} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fieldStyle}><label style={labelStyle}>아이콘 이모지</label><input value={editActivity.icon || ''} onChange={(e) => setEditActivity((p) => ({ ...p, icon: e.target.value }))} placeholder="🎪" style={inputStyle} /></div>
                <div style={fieldStyle}><label style={labelStyle}>태그</label><input value={editActivity.tag || ''} onChange={(e) => setEditActivity((p) => ({ ...p, tag: e.target.value }))} placeholder="반려동물 행사" style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fieldStyle}><label style={labelStyle}>태그 색상</label>
                  <select value={editActivity.tagColor || 'green'} onChange={(e) => setEditActivity((p) => ({ ...p, tagColor: e.target.value as ActivityCard['tagColor'] }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="green">초록</option><option value="blue">파랑</option><option value="amber">주황</option><option value="purple">보라</option>
                  </select>
                </div>
                <div style={fieldStyle}><label style={labelStyle}>제목 *</label><input value={editActivity.title || ''} onChange={(e) => setEditActivity((p) => ({ ...p, title: e.target.value }))} placeholder="행사 기획 · 운영" style={inputStyle} /></div>
              </div>
              <div style={fieldStyle}><label style={labelStyle}>설명</label><textarea value={editActivity.desc || ''} onChange={(e) => setEditActivity((p) => ({ ...p, desc: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fieldStyle}><label style={labelStyle}>링크 URL</label><input value={editActivity.link || ''} onChange={(e) => setEditActivity((p) => ({ ...p, link: e.target.value }))} placeholder="/events" style={inputStyle} /></div>
                <div style={fieldStyle}><label style={labelStyle}>링크 텍스트</label><input value={editActivity.linkText || ''} onChange={(e) => setEditActivity((p) => ({ ...p, linkText: e.target.value }))} placeholder="자세히 보기" style={inputStyle} /></div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}><button onClick={() => setActivityModal(false)} style={btnCancel}>취소</button><button onClick={saveActivity} style={btnSave}>저장</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Travel Modal ── */}
      <AnimatePresence>
        {travelModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && setTravelModal(false)} style={modalOverlayStyle}>
            <motion.div initial={{ y: 20, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.97 }} onClick={(e) => e.stopPropagation()} style={modalBoxStyle}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 20 }}>{editTravel._key ? '여행지 수정' : '여행지 추가'}</h2>
              <ImageUploadBox imageData={editTravel.imageData} placeholder="📍" ratio="16/9" onPick={async (e) => { const f = e.target.files?.[0]; if (!f) return; const b64 = await clientDB.toStorageUrl(f); setEditTravel((p) => ({ ...p, imageData: b64 })); }} onRemove={() => setEditTravel((p) => ({ ...p, imageData: undefined }))} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fieldStyle}><label style={labelStyle}>장소명 *</label><input value={editTravel.name || ''} onChange={(e) => setEditTravel((p) => ({ ...p, name: e.target.value }))} placeholder="솔비치 호텔" style={inputStyle} /></div>
                <div style={fieldStyle}><label style={labelStyle}>지역</label><input value={editTravel.region || ''} onChange={(e) => setEditTravel((p) => ({ ...p, region: e.target.value }))} placeholder="양양" style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fieldStyle}><label style={labelStyle}>유형 코드</label>
                  <select value={editTravel.type || 'hotel'} onChange={(e) => setEditTravel((p) => ({ ...p, type: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="hotel">호텔/리조트</option><option value="cafe">카페</option><option value="park">공원/해변</option><option value="camping">캠핑장</option><option value="attraction">관광지</option>
                  </select>
                </div>
                <div style={fieldStyle}><label style={labelStyle}>아이콘 이모지</label><input value={editTravel.icon || ''} onChange={(e) => setEditTravel((p) => ({ ...p, icon: e.target.value }))} placeholder="🏨" style={inputStyle} /></div>
              </div>
              <div style={fieldStyle}><label style={labelStyle}>주소</label><input value={editTravel.address || ''} onChange={(e) => setEditTravel((p) => ({ ...p, address: e.target.value }))} placeholder="강원도 양양군..." style={inputStyle} /></div>
              <div style={fieldStyle}><label style={labelStyle}>특징 (한 줄)</label><input value={editTravel.feature || ''} onChange={(e) => setEditTravel((p) => ({ ...p, feature: e.target.value }))} placeholder="반려견 전용 해변 바로 앞" style={inputStyle} /></div>
              <div style={fieldStyle}><label style={labelStyle}>설명</label><textarea value={editTravel.desc || ''} onChange={(e) => setEditTravel((p) => ({ ...p, desc: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
              <div style={fieldStyle}><label style={labelStyle}>반려동물 안내</label><input value={editTravel.petInfo || ''} onChange={(e) => setEditTravel((p) => ({ ...p, petInfo: e.target.value }))} placeholder="소형견 동반 가능 · 목줄 착용 필수" style={inputStyle} /></div>
              <div style={fieldStyle}><label style={labelStyle}>운영시간</label><input value={editTravel.hours || ''} onChange={(e) => setEditTravel((p) => ({ ...p, hours: e.target.value }))} placeholder="09:00–18:00 (월요일 휴무)" style={inputStyle} /></div>
              <div style={fieldStyle}><label style={labelStyle}>요금 안내</label><input value={editTravel.price || ''} onChange={(e) => setEditTravel((p) => ({ ...p, price: e.target.value }))} placeholder="성인 10,000원 / 반려동물 무료" style={inputStyle} /></div>
              <div style={fieldStyle}><label style={labelStyle}>지도 링크 URL</label><input value={editTravel.mapUrl || ''} onChange={(e) => setEditTravel((p) => ({ ...p, mapUrl: e.target.value }))} placeholder="https://naver.me/..." style={inputStyle} /></div>
              <div style={fieldStyle}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  <input type="checkbox" checked={editTravel.isPartner ?? false} onChange={(e) => setEditTravel((p) => ({ ...p, isPartner: e.target.checked }))} style={{ width: 16, height: 16 }} />
                  메이트쉽 파트너 업체 (할인 혜택 제공)
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}><button onClick={() => setTravelModal(false)} style={btnCancel}>취소</button><button onClick={saveTravel} style={btnSave}>저장</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Image Picker Modal ── */}
      <AnimatePresence>
        {imagePickerArc && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setImagePickerArc(null)}
            style={modalOverlayStyle}
          >
            <motion.div
              initial={{ y: 20, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              style={{ ...modalBoxStyle, width: 'min(900px, 100%)', maxWidth: '95vw' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>대표 이미지 선정</h2>
                <button onClick={() => setImagePickerArc(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>×</button>
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
                {imagePickerArc.title} — {(imagePickerArc.images || []).length}장 · 클릭: 대표 설정 / ⠿ 드래그: 순서 변경 / × 버튼: 삭제
              </p>
              {(!imagePickerArc.images || imagePickerArc.images.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: '#9ca3af' }}>이미지가 없습니다</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, maxHeight: '65vh', overflowY: 'auto', paddingRight: 4 }}>
                  {(imagePickerArc.images || []).map((img, idx) => {
                    const isRep = img === imagePickerArc.imageData || (idx === 0 && !imagePickerArc.imageData);
                    const isDragging = arcDragSrcIdx === idx;
                    const isDragOver = arcDragOverIdx === idx && arcDragSrcIdx !== idx;
                    return (
                      <div
                        key={img}
                        onDragOver={(e) => { e.preventDefault(); setArcDragOverIdx(idx); }}
                        onDragLeave={() => setArcDragOverIdx(null)}
                        onDrop={(e) => { e.preventDefault(); const src = arcDragSrcRef.current; if (src !== null && src !== idx) reorderArchiveImages(src, idx); arcDragSrcRef.current = null; setArcDragSrcIdx(null); setArcDragOverIdx(null); }}
                        onClick={() => { if (!isRep) setRepresentativeImage(imagePickerArc, img); }}
                        onMouseEnter={(e) => { if (!isRep) (e.currentTarget.querySelector('.hover-overlay') as HTMLElement | null)?.style.setProperty('opacity','1'); }}
                        onMouseLeave={(e) => { (e.currentTarget.querySelector('.hover-overlay') as HTMLElement | null)?.style.setProperty('opacity','0'); }}
                        style={{
                          position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
                          border: isDragOver ? '2px dashed #12A79D' : isRep ? '3px solid #12A79D' : '2px solid #e5e7eb',
                          cursor: isRep ? 'default' : 'pointer',
                          opacity: isDragging ? 0.35 : 1,
                          transition: 'opacity 0.15s, border-color 0.1s',
                          flexShrink: 0,
                        }}
                      >
                        {/* 드래그 핸들 */}
                        <div
                          draggable
                          onDragStart={(e) => { e.stopPropagation(); arcDragSrcRef.current = idx; setArcDragSrcIdx(idx); }}
                          onDragEnd={() => { arcDragSrcRef.current = null; setArcDragSrcIdx(null); setArcDragOverIdx(null); }}
                          onClick={(e) => e.stopPropagation()}
                          style={{ position: 'absolute', top: 4, left: 4, color: '#fff', fontSize: 12, lineHeight: 1, cursor: 'grab', zIndex: 2, textShadow: '0 1px 2px rgba(0,0,0,.8)', userSelect: 'none', padding: '2px 3px', borderRadius: 2, background: 'rgba(0,0,0,0.35)' }}
                        >⠿</div>
                        {/* 삭제 버튼 */}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteArchiveImage(img); }}
                          style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: 'rgba(239,68,68,0.85)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, padding: 0 }}
                        >×</button>
                        <img
                          src={img} alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
                        />
                        <div
                          className="hover-overlay"
                          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.42)', opacity: 0, transition: 'opacity 0.15s', pointerEvents: 'none' }}
                        />
                        {isRep && (
                          <span style={{ position: 'absolute', bottom: 4, left: 4, background: '#12A79D', color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 3, letterSpacing: '0.04em', pointerEvents: 'none' }}>대표</span>
                        )}
                        <span style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 8, padding: '1px 4px', borderRadius: 3, pointerEvents: 'none' }}>{idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button onClick={() => setImagePickerArc(null)} style={btnSave}>완료</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{toast && <Toast msg={toast.msg} err={toast.err} />}</AnimatePresence>
    </div>
  );
}

function AppTable({ apps, short }: { apps: Application[]; short?: boolean }) {
  if (apps.length === 0) {
    return <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody><tr><td style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 13 }}>신청 내역이 없습니다</td></tr></tbody></table>;
  }
  const thStyle: React.CSSProperties = { fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", fontSize: 10, letterSpacing: '0.08em', color: '#9ca3af', textAlign: 'left', padding: '11px 20px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' };
  const tdStyle: React.CSSProperties = { fontSize: 13, color: '#6b7280', padding: '13px 20px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle' };
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>신청일시</th><th style={thStyle}>유형</th><th style={thStyle}>신청자</th><th style={thStyle}>연락처</th>
            {!short && <th style={thStyle}>지역</th>}<th style={thStyle}>내용</th>
          </tr>
        </thead>
        <tbody>
          {apps.map((a, i) => (
            <tr key={i}>
              <td style={tdStyle}>{appDate(a) ? new Date(appDate(a)).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
              <td style={tdStyle}><span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 9999, fontWeight: 700, background: a.type === 'mateship' ? '#EDFAF8' : '#eff6ff', color: a.type === 'mateship' ? '#0A5F59' : '#1e40af' }}>{a.type === 'mateship' ? '메이트쉽' : '교육'}</span></td>
              <td style={tdStyle}>{appName(a)}</td>
              <td style={tdStyle}>{appPhone(a)}</td>
              {!short && <td style={tdStyle}>{a.region || a.ownerRegion || '-'}</td>}
              <td style={tdStyle}>{a.course || a.message || a.petType || a.petName || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SellerTable({ sellers, onUpdate, eventName }: { sellers: Seller[]; onUpdate: (id: number, patch: { status?: string; admin_note?: string; fee_paid?: boolean }) => void; eventName?: (id?: number) => string }) {
  const STAT: Record<string, { label: string; bg: string; color: string }> = {
    pending: { label: '대기', bg: '#fef3c7', color: '#92400e' },
    approved: { label: '승인', bg: '#D6F5F1', color: '#0D7E76' },
    waitlist: { label: '보류', bg: '#e0e7ff', color: '#3730a3' },
    rejected: { label: '반려', bg: '#fee2e2', color: '#b91c1c' },
  };
  const chip = (on: boolean, txt: string) => on ? <span style={{ fontSize: 11, background: '#EDFAF8', color: '#0D7E76', border: '1px solid #BFF3EC', borderRadius: 6, padding: '2px 7px', marginRight: 5 }}>{txt}</span> : null;
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {sellers.map((s) => {
        const st = STAT[s.status] || STAT.pending;
        return (
          <div key={s.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  {eventName && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, color: '#374151', background: '#f3f4f6', border: '1px solid #e5e7eb' }}>{eventName(s.event_id)}</span>}
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>{s.brand_name}</span>
                  <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 9999, fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                  {s.join_type === 'fee'
                    ? <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 9999, fontWeight: 700, background: s.fee_paid ? '#D6F5F1' : '#fff7ed', color: s.fee_paid ? '#0D7E76' : '#c2410c', border: `1px solid ${s.fee_paid ? '#BFF3EC' : '#fed7aa'}` }}>참가비 2만원{s.fee_paid ? ' · 입금완료' : ' · 미입금'}</span>
                    : <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 9999, fontWeight: 700, background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>후원물품</span>}
                  {s.notified_at && <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 9999, fontWeight: 700, background: '#D6F5F1', color: '#0D7E76' }}>✓ 선정메일 발송</span>}
                  {s.category && <span style={{ fontSize: 11, color: '#6b7280' }}>· {s.category}</span>}
                </div>
                <div style={{ fontSize: 12.5, color: '#4b5563', lineHeight: 1.7 }}>
                  대표 {s.rep_name} · {s.phone}{s.email ? ` · ${s.email}` : ''}
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>{s.created_at ? new Date(s.created_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}</div>
            </div>

            {s.items && <div style={{ fontSize: 12.5, color: '#374151', marginTop: 8, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{s.items}</div>}
            {s.join_type !== 'fee' && s.sponsor_items && (
              <div style={{ fontSize: 12.5, color: '#1e40af', marginTop: 8, lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 8, padding: '8px 10px' }}>
                🎁 후원물품: {s.sponsor_items}
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              {chip(!!s.needs_power, '전기 필요')}
              {chip(!!s.needs_table, '테이블 필요')}
              {s.vehicle && <span style={{ fontSize: 11, color: '#6b7280' }}>🚗 {s.vehicle} </span>}
              {s.sns && <span style={{ fontSize: 11, color: '#6b7280' }}>· {s.sns} </span>}
              {s.biz_no && <span style={{ fontSize: 11, color: '#6b7280' }}>· 사업자 {s.biz_no}</span>}
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              {(['approved', 'waitlist', 'rejected', 'pending'] as const).map((tg) => {
                const meta = STAT[tg];
                const active = s.status === tg;
                return (
                  <button key={tg} disabled={active} onClick={() => onUpdate(s.id, { status: tg })}
                    style={{ fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 8, cursor: active ? 'default' : 'pointer',
                      border: active ? 'none' : `1px solid ${meta.color}33`, background: active ? meta.bg : '#fff', color: meta.color, opacity: active ? 0.6 : 1 }}>
                    {active ? `● ${meta.label}` : meta.label}
                  </button>
                );
              })}
              {s.join_type === 'fee' && (
                <button onClick={() => onUpdate(s.id, { fee_paid: !s.fee_paid })}
                  style={{ fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', marginLeft: 'auto',
                    border: '1px solid #fdba74', background: s.fee_paid ? '#D6F5F1' : '#fff7ed', color: s.fee_paid ? '#0D7E76' : '#c2410c' }}>
                  {s.fee_paid ? '✓ 입금완료 (해제)' : '참가비 입금확인'}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input defaultValue={s.admin_note || ''} placeholder="관리자 메모 (엔터로 저장)"
                onKeyDown={(e) => { if (e.key === 'Enter') onUpdate(s.id, { admin_note: (e.target as HTMLInputElement).value }); }}
                style={{ flex: 1, fontSize: 12, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, color: '#111', fontFamily: 'inherit' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InquiryTable({ apps }: { apps: Application[] }) {
  if (apps.length === 0) {
    return <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody><tr><td style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 13 }}>문의 내역이 없습니다</td></tr></tbody></table>;
  }
  const thStyle: React.CSSProperties = { fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", fontSize: 10, letterSpacing: '0.08em', color: '#9ca3af', textAlign: 'left', padding: '11px 20px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' };
  const tdStyle: React.CSSProperties = { fontSize: 13, color: '#6b7280', padding: '13px 20px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'top' };
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>접수일시</th><th style={thStyle}>유형</th><th style={thStyle}>이름</th>
            <th style={thStyle}>연락처</th><th style={thStyle}>이메일</th><th style={thStyle}>문의 내용</th>
          </tr>
        </thead>
        <tbody>
          {apps.map((a, i) => (
            <tr key={i}>
              <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{appDate(a) ? new Date(appDate(a)).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
              <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}><span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 9999, fontWeight: 700, background: '#fef3c7', color: '#92400e' }}>{a.course || '문의'}</span></td>
              <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: '#111', fontWeight: 600 }}>{a.name || a.ownerName || '-'}</td>
              <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{a.phone || a.ownerPhone || '-'}</td>
              <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{a.email || '-'}</td>
              <td style={{ ...tdStyle, minWidth: 300, whiteSpace: 'pre-wrap', color: '#374151', lineHeight: 1.6 }}>{a.message || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BookingTable({ bookings, onUpdate, onSend }: { bookings: Booking[]; onUpdate?: (b: Booking, action: 'cancel' | 'confirm') => void; onSend?: (b: Booking) => void }) {
  if (bookings.length === 0) {
    return <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody><tr><td style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 13 }}>예약 내역이 없습니다</td></tr></tbody></table>;
  }
  const thStyle: React.CSSProperties = { fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", fontSize: 10, letterSpacing: '0.08em', color: '#9ca3af', textAlign: 'left', padding: '11px 16px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' };
  const tdStyle: React.CSSProperties = { fontSize: 13, color: '#6b7280', padding: '13px 16px', borderBottom: '1px solid #e5e7eb', verticalAlign: 'middle', whiteSpace: 'nowrap' };
  const statusInfo = (s?: string) => s === 'paid' ? { t: '입금확정', bg: '#D6F5F1', c: '#12A79D' }
    : s === 'cancelled' ? { t: '취소됨', bg: '#fee2e2', c: '#dc2626' }
    : { t: '입금대기', bg: '#fef3c7', c: '#92400e' };
  const actBtn = (bg: string, c: string): React.CSSProperties => ({ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, border: 'none', background: bg, color: c, cursor: 'pointer', fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif" });
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={thStyle}>신청일시</th><th style={thStyle}>상태</th><th style={thStyle}>도착</th><th style={thStyle}>일정</th><th style={thStyle}>사이트</th><th style={thStyle}>인원</th>
          <th style={thStyle}>예약자</th><th style={thStyle}>연락처</th><th style={thStyle}>이메일</th><th style={thStyle}>발송</th><th style={thStyle}>반려견</th>
          <th style={thStyle}>접종</th><th style={thStyle}>금액</th><th style={{ ...thStyle, position: 'sticky', right: 0, zIndex: 3, boxShadow: '-6px 0 8px -6px rgba(0,0,0,0.12)' }}>관리</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((b, i) => {
          const st = statusInfo(b.status);
          const cancelled = b.status === 'cancelled';
          return (
          <tr key={b.id ?? i} style={cancelled ? { opacity: 0.5 } : undefined}>
            <td style={tdStyle}>{b.created_at ? new Date(b.created_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
            <td style={tdStyle}>
              <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 9999, fontWeight: 700, background: st.bg, color: st.c }}>{st.t}</span>
              {(() => {
                const paidCard = !!b.payment_key;                       // 실제 카드결제 완료
                const cardIntent = !paidCard && b.pay_method === 'card'; // 카드 선택했으나 미완료(시도/이탈)
                const transfer = !paidCard && b.pay_method === 'transfer';
                let label: string | null = null, color = '#6b7280';
                if (paidCard) { label = '💳 카드결제'; color = '#12A79D'; }
                else if (cardIntent) { label = '💳 카드선택'; color = '#9ca3af'; }
                else if (transfer) { label = '🏦 계좌'; color = '#6b7280'; }
                return label ? <div style={{ fontSize: 10, fontWeight: 700, marginTop: 3, color }}>{label}</div> : null;
              })()}
            </td>
            <td style={tdStyle}>{b.status !== 'paid' ? <span style={{ fontSize: 11, color: '#9ca3af' }}>—</span>
              : b.checked_in_at
                ? <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 9999, background: '#D6F5F1', color: '#12A79D' }}>✓ {new Date(b.checked_in_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                : <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 9999, background: '#fef3c7', color: '#C9560F' }}>미도착</span>}</td>
            <td style={tdStyle}><span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 9999, fontWeight: 700, background: '#EDFAF8', color: '#0A5F59' }}>{b.booking_label || '-'}</span><div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{b.date_label || ''}</div></td>
            <td style={{ ...tdStyle, textDecoration: cancelled ? 'line-through' : 'none' }}>
              {b.site ? `${b.zone || ''} ${b.site}` : (b.booking_type === 'day' ? '관람권' : (b.zone || '관람권'))}
              {Array.isArray(b.tshirt_sizes) && b.tshirt_sizes.length > 0 && <div style={{ fontSize: 11, color: '#7c3aed', marginTop: 2, textDecoration: 'none' }}>+ 클래스 {b.tshirt_sizes.length}개</div>}
            </td>
            <td style={tdStyle}>{b.headcount != null ? `${b.headcount}인` : '-'}</td>
            <td style={tdStyle}>{b.name || '-'}</td>
            <td style={tdStyle}>{b.phone || '-'}</td>
            <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{b.email || <span style={{ color: '#d1d5db' }}>없음</span>}</td>
            <td style={tdStyle}>{b.ticket_sent_at
              ? <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 9999, background: '#D6F5F1', color: '#12A79D' }}>✓ 발송<br/>{new Date(b.ticket_sent_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
              : (b.status === 'paid' ? <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af' }}>미발송</span> : <span style={{ color: '#d1d5db' }}>—</span>)}</td>
            <td style={tdStyle}>{b.pet_name ? `${b.pet_name} (${b.pet_breed || ''})` : '-'}</td>
            <td style={tdStyle}>{b.pet_vaccine === 'yes' ? '완료' : b.pet_vaccine === 'no' ? '미완료' : '-'}</td>
            <td style={{ ...tdStyle, fontWeight: 700, color: '#12A79D' }}>{b.amount != null ? `${b.amount.toLocaleString()}원` : '-'}</td>
            <td style={{ ...tdStyle, position: 'sticky', right: 0, background: '#fff', zIndex: 1, boxShadow: '-6px 0 8px -6px rgba(0,0,0,0.12)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                {onUpdate && !cancelled && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {b.status !== 'paid' && <button onClick={() => onUpdate(b, 'confirm')} style={actBtn('#D6F5F1', '#0A5F59')}>입금확정</button>}
                    {b.status === 'paid' && onSend && b.email && <button onClick={() => onSend(b)} style={actBtn(b.ticket_sent_at ? '#EDFAF8' : '#dbeafe', b.ticket_sent_at ? '#12A79D' : '#1d4ed8')}>{b.ticket_sent_at ? '✉ 재발송' : '✉ 메일발송'}</button>}
                    <button onClick={() => onUpdate(b, 'cancel')} style={actBtn('#fee2e2', '#dc2626')}>취소</button>
                  </div>
                )}
                {b.ticket_token && <a href={`/t/${b.ticket_token}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#2563eb', fontWeight: 700 }}>🎫 입장권 링크</a>}
                {cancelled && !b.ticket_token && <span style={{ fontSize: 11, color: '#9ca3af' }}>—</span>}
              </div>
            </td>
          </tr>
          );
        })}
      </tbody>
    </table>
  );
}
