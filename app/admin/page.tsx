'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gwaaDB, STORES } from '@/lib/db/gwaaDB';
import {
  EventCard, EventStatus, MateshipPartner, GalleryItem,
  ArchiveEvent, ActivityCard, LookbookItem, TravelPlace, PageHashtags,
} from '@/types';

const ADMIN_PW = 'gwaa2026!';

type Tab = 'dashboard' | 'applications' | 'events' | 'archive' | 'partners' | 'images' | 'content' | 'travel' | 'settings';

type Application = {
  at: string; type: 'mateship' | 'education';
  ownerName?: string; ownerPhone?: string; ownerRegion?: string;
  course?: string; count?: string; note?: string;
  petType?: string; petAge?: string; petName?: string;
};

type HeroImage = { id: number; imageData?: string };

function Toast({ msg, err }: { msg: string; err?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
      style={{ position: 'fixed', bottom: 24, right: 24, background: '#1a1a1a', color: '#fff', padding: '11px 18px', borderRadius: 8, fontSize: 13, zIndex: 9999, borderLeft: `3px solid ${err ? '#ef4444' : '#4ade80'}`, boxShadow: '0 4px 20px rgba(0,0,0,.3)' }}
    >{msg}</motion.div>
  );
}

const modalOverlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 24 };
const modalBoxStyle: React.CSSProperties = { background: '#fff', borderRadius: 20, padding: 36, width: 'min(540px, 100%)', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,.2)' };
const fieldStyle: React.CSSProperties = { marginBottom: 16 };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#111', outline: 'none', boxSizing: 'border-box' };
const btnSave: React.CSSProperties = { padding: '8px 20px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' };
const btnCancel: React.CSSProperties = { padding: '8px 20px', borderRadius: 9999, border: '1.5px solid #e5e7eb', background: 'transparent', color: '#6b7280', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
const btnEdit: React.CSSProperties = { fontSize: 11, padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'none', cursor: 'pointer', color: '#6b7280' };
const btnDel: React.CSSProperties = { fontSize: 11, padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'none', cursor: 'pointer', color: '#ef4444' };

function SectionHeader({ title, sub, onAdd, addLabel = '+ 추가' }: { title: string; sub?: string; onAdd?: () => void; addLabel?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: '#111', marginBottom: 4 }}>{title}</h1>
        {sub && <p style={{ fontSize: 13, color: '#9ca3af' }}>{sub}</p>}
      </div>
      {onAdd && <button onClick={onAdd} style={{ padding: '8px 18px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{addLabel}</button>}
    </div>
  );
}

function ImageUploadBox({ imageData, onPick, onRemove, ratio = '16/9', placeholder = '🖼️' }: { imageData?: string | null; onPick: (e: React.ChangeEvent<HTMLInputElement>) => void; onRemove?: () => void; ratio?: string; placeholder?: string }) {
  return (
    <div style={fieldStyle}>
      <div style={{ aspectRatio: ratio, borderRadius: 8, background: imageData ? `url(${imageData}) center/cover` : 'linear-gradient(135deg,#f0fdf4,#dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, border: '1.5px solid #e5e7eb', marginBottom: 8 }}>
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
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [loginErr, setLoginErr] = useState(false);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null);

  // Data states
  const [apps, setApps] = useState<Application[]>([]);
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

  useEffect(() => {
    if (sessionStorage.getItem('gwaa_admin') === '1') setAuthed(true);
  }, []);

  const showToast = (msg: string, err?: boolean) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 3000);
  };

  const doLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PW) {
      sessionStorage.setItem('gwaa_admin', '1');
      setAuthed(true);
      loadAll();
    } else {
      setLoginErr(true);
      setTimeout(() => setLoginErr(false), 2500);
    }
  };

  const doLogout = () => { sessionStorage.removeItem('gwaa_admin'); setAuthed(false); setPw(''); };

  const loadAll = async () => {
    try {
      setApps(JSON.parse(localStorage.getItem('gwaa_applications') || '[]'));
      setEvents(await gwaaDB.getAll<EventCard>(STORES.EVENT));
      setPartners(await gwaaDB.getAll<MateshipPartner>(STORES.MATESHIP));
      setArchives(await gwaaDB.getAll<ArchiveEvent>(STORES.ARCHIVE));
      setActivityCards(await gwaaDB.getAll<ActivityCard>(STORES.ACTIVITY));
      setLookbookItems(await gwaaDB.getAll<LookbookItem>(STORES.LOOKBOOK));
      setTravelPlaces(await gwaaDB.getAll<TravelPlace>(STORES.PLACES));
      const hts = await gwaaDB.getAll<PageHashtags>(STORES.HASHTAGS);
      setHashtags(hts);
      const draft: Record<string, string> = {};
      hts.forEach((h) => { draft[h.page] = h.tags.join(', '); });
      setHashtagDraft(draft);
      const heroes: HeroImage[] = [];
      for (let i = 1; i <= 3; i++) {
        const h = await gwaaDB.get<HeroImage>(STORES.HERO, i);
        heroes.push(h || { id: i });
      }
      setHeroImages(heroes);
      setGalleryItems(await gwaaDB.getAll<GalleryItem>(STORES.GALLERY));
    } catch { showToast('데이터 로딩 실패', true); }
  };

  useEffect(() => { if (authed) loadAll(); }, [authed]);

  const switchTab = (t: Tab) => {
    setTab(t);
    if (t === 'dashboard' || t === 'applications') {
      setApps(JSON.parse(localStorage.getItem('gwaa_applications') || '[]'));
    }
  };

  // ─── CSV export ───
  const exportCSV = () => {
    const header = ['신청일시', '유형', '신청자', '연락처', '지역', '내용'];
    const rows = apps.map((a) => [new Date(a.at).toLocaleString('ko-KR'), a.type === 'mateship' ? '메이트쉽' : '교육신청', a.ownerName || '', a.ownerPhone || '', a.ownerRegion || '', a.course || a.petType || '']);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `gwaa_apps_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const clearApplications = () => {
    if (!confirm('전체 신청 내역을 삭제하시겠습니까?')) return;
    localStorage.removeItem('gwaa_applications'); setApps([]); showToast('전체 삭제 완료');
  };

  // ─── Event CRUD ───
  const saveEvent = async () => {
    if (!editEvent.title?.trim()) { showToast('행사명을 입력해 주세요', true); return; }
    try {
      const data: EventCard = { id: editEvent._key, title: editEvent.title || '', date: editEvent.date || '', loc: editEvent.loc || '', desc: editEvent.desc || '', content: editEvent.content || '', status: (editEvent.status || 'upcoming') as EventStatus, link: editEvent.link || '', benefit: editEvent.benefit || '', ctaText: editEvent.ctaText || '신청하기 →', imageData: editEvent.imageData ?? null, images: editEvent.images || [], order: editEvent.order || Date.now() };
      editEvent._key ? await gwaaDB.put(STORES.EVENT, data) : await gwaaDB.add(STORES.EVENT, data);
      setEventModal(false); setEditEvent({});
      setEvents(await gwaaDB.getAll<EventCard>(STORES.EVENT));
      showToast('행사 저장 완료');
    } catch { showToast('저장 실패', true); }
  };
  const deleteEvent = async (key: number) => {
    if (!confirm('이 행사를 삭제하시겠습니까?')) return;
    await gwaaDB.remove(STORES.EVENT, key);
    setEvents(await gwaaDB.getAll<EventCard>(STORES.EVENT)); showToast('삭제 완료');
  };

  // ─── Archive CRUD ───
  const saveArchive = async () => {
    if (!editArchive.title?.trim()) { showToast('행사명을 입력해 주세요', true); return; }
    try {
      const imgs = editArchive.images || [];
      const data: ArchiveEvent = { id: editArchive._key, order: editArchive.order || Date.now(), feat: editArchive.feat ?? false, year: Number(editArchive.year) || new Date().getFullYear(), title: editArchive.title || '', loc: editArchive.loc || '', ppl: editArchive.ppl || '', date: editArchive.date || '', place: editArchive.place || '', part: editArchive.part || '', organizer: editArchive.organizer || '', desc: editArchive.desc || '', imageData: imgs[0] ?? null, imageData2: imgs[1] ?? null, images: imgs };
      editArchive._key ? await gwaaDB.put(STORES.ARCHIVE, data) : await gwaaDB.add(STORES.ARCHIVE, data);
      setArchiveModal(false); setEditArchive({});
      setArchives(await gwaaDB.getAll<ArchiveEvent>(STORES.ARCHIVE));
      showToast('아카이브 저장 완료');
    } catch { showToast('저장 실패', true); }
  };
  const deleteArchive = async (key: number) => {
    if (!confirm('이 아카이브 행사를 삭제하시겠습니까?')) return;
    await gwaaDB.remove(STORES.ARCHIVE, key);
    setArchives(await gwaaDB.getAll<ArchiveEvent>(STORES.ARCHIVE)); showToast('삭제 완료');
  };

  // ─── Partner CRUD ───
  const savePartner = async () => {
    if (!editPartner.name?.trim()) { showToast('업체명을 입력해 주세요', true); return; }
    try {
      const data: MateshipPartner = { id: editPartner._key, name: editPartner.name || '', region: editPartner.region || '', type: editPartner.type || 'cafe', discount: editPartner.discount || '', icon: editPartner.icon || '🏢', gradient: editPartner.gradient || 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', link: editPartner.link || '', imageData: editPartner.imageData ?? null, order: editPartner.order || Date.now() };
      editPartner._key ? await gwaaDB.put(STORES.MATESHIP, data) : await gwaaDB.add(STORES.MATESHIP, data);
      setPartnerModal(false); setEditPartner({});
      setPartners(await gwaaDB.getAll<MateshipPartner>(STORES.MATESHIP));
      showToast('업체 저장 완료');
    } catch { showToast('저장 실패', true); }
  };
  const deletePartner = async (key: number) => {
    if (!confirm('이 업체를 삭제하시겠습니까?')) return;
    await gwaaDB.remove(STORES.MATESHIP, key);
    setPartners(await gwaaDB.getAll<MateshipPartner>(STORES.MATESHIP)); showToast('삭제 완료');
  };

  // ─── Activity Card CRUD ───
  const saveActivity = async () => {
    if (!editActivity.title?.trim()) { showToast('카드 제목을 입력해 주세요', true); return; }
    try {
      const data: ActivityCard = { id: editActivity._key, order: editActivity.order || Date.now(), imageData: editActivity.imageData ?? null, tag: editActivity.tag || '', tagColor: (editActivity.tagColor || 'green') as ActivityCard['tagColor'], icon: editActivity.icon || '🐾', title: editActivity.title || '', desc: editActivity.desc || '', link: editActivity.link || '', linkText: editActivity.linkText || '자세히 보기' };
      editActivity._key ? await gwaaDB.put(STORES.ACTIVITY, data) : await gwaaDB.add(STORES.ACTIVITY, data);
      setActivityModal(false); setEditActivity({});
      setActivityCards(await gwaaDB.getAll<ActivityCard>(STORES.ACTIVITY));
      showToast('활동카드 저장 완료');
    } catch { showToast('저장 실패', true); }
  };
  const deleteActivity = async (key: number) => {
    if (!confirm('이 활동카드를 삭제하시겠습니까?')) return;
    await gwaaDB.remove(STORES.ACTIVITY, key);
    setActivityCards(await gwaaDB.getAll<ActivityCard>(STORES.ACTIVITY)); showToast('삭제 완료');
  };

  // ─── Lookbook CRUD ───
  const saveLookbook = async (item: LookbookItem) => {
    await gwaaDB.put(STORES.LOOKBOOK, item);
    setLookbookItems(await gwaaDB.getAll<LookbookItem>(STORES.LOOKBOOK));
    showToast('룩북 저장 완료');
  };
  const deleteLookbook = async (key: number) => {
    if (!confirm('이 룩북 항목을 삭제하시겠습니까?')) return;
    await gwaaDB.remove(STORES.LOOKBOOK, key);
    setLookbookItems(await gwaaDB.getAll<LookbookItem>(STORES.LOOKBOOK)); showToast('삭제 완료');
  };

  // ─── Travel CRUD ───
  const saveTravel = async () => {
    if (!editTravel.name?.trim()) { showToast('장소명을 입력해 주세요', true); return; }
    try {
      const data: TravelPlace = { id: editTravel._key, order: editTravel.order || Date.now(), region: editTravel.region || '', type: editTravel.type || 'cafe', typeLabel: editTravel.typeLabel || '', name: editTravel.name || '', icon: editTravel.icon || '📍', address: editTravel.address || '', feature: editTravel.feature || '', desc: editTravel.desc || '', petInfo: editTravel.petInfo || '', isPartner: editTravel.isPartner ?? false, imageData: editTravel.imageData ?? null, mapUrl: editTravel.mapUrl || '' };
      editTravel._key ? await gwaaDB.put(STORES.PLACES, data) : await gwaaDB.add(STORES.PLACES, data);
      setTravelModal(false); setEditTravel({});
      setTravelPlaces(await gwaaDB.getAll<TravelPlace>(STORES.PLACES));
      showToast('여행지 저장 완료');
    } catch { showToast('저장 실패', true); }
  };
  const deleteTravel = async (key: number) => {
    if (!confirm('이 여행지를 삭제하시겠습니까?')) return;
    await gwaaDB.remove(STORES.PLACES, key);
    setTravelPlaces(await gwaaDB.getAll<TravelPlace>(STORES.PLACES)); showToast('삭제 완료');
  };

  // ─── Hero images ───
  const pickHeroImage = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const b64 = await gwaaDB.toBase64(file);
      await gwaaDB.put(STORES.HERO, { id, imageData: b64 });
      setHeroImages((prev) => prev.map((h) => h.id === id ? { ...h, imageData: b64 } : h));
      showToast(`슬라이드 ${id} 업로드 완료`);
    } catch { showToast('업로드 실패', true); }
  };
  const removeHeroImage = async (id: number) => {
    await gwaaDB.put(STORES.HERO, { id });
    setHeroImages((prev) => prev.map((h) => h.id === id ? { id } : h));
    showToast(`슬라이드 ${id} 삭제`);
  };

  // ─── Gallery ───
  const addGalleryItem = async () => {
    await gwaaDB.add<GalleryItem>(STORES.GALLERY, { order: Date.now(), imageData: null, caption: '새 갤러리 사진', active: true });
    setGalleryItems(await gwaaDB.getAll<GalleryItem>(STORES.GALLERY));
    showToast('갤러리 항목 추가됨');
  };
  const pickGalleryImage = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const { ok, error } = gwaaDB.validateImage(file);
    if (!ok) { showToast(error!, true); return; }
    try {
      const b64 = await gwaaDB.toBase64(file);
      const existing = galleryItems.find((g) => g.id === id);
      if (!existing) return;
      await gwaaDB.put<GalleryItem>(STORES.GALLERY, { ...existing, imageData: b64 });
      setGalleryItems(await gwaaDB.getAll<GalleryItem>(STORES.GALLERY));
      showToast('갤러리 이미지 업로드 완료');
    } catch { showToast('업로드 실패', true); }
  };
  const updateGalleryCaption = async (id: number, caption: string) => {
    const existing = galleryItems.find((g) => g.id === id); if (!existing) return;
    await gwaaDB.put<GalleryItem>(STORES.GALLERY, { ...existing, caption });
    setGalleryItems((prev) => prev.map((g) => g.id === id ? { ...g, caption } : g));
  };
  const toggleGalleryActive = async (id: number) => {
    const existing = galleryItems.find((g) => g.id === id); if (!existing) return;
    await gwaaDB.put<GalleryItem>(STORES.GALLERY, { ...existing, active: !existing.active });
    setGalleryItems((prev) => prev.map((g) => g.id === id ? { ...g, active: !g.active } : g));
  };
  const removeGalleryImage = async (id: number) => {
    const existing = galleryItems.find((g) => g.id === id); if (!existing) return;
    await gwaaDB.put<GalleryItem>(STORES.GALLERY, { ...existing, imageData: null });
    setGalleryItems((prev) => prev.map((g) => g.id === id ? { ...g, imageData: null } : g));
    showToast('이미지 삭제');
  };
  const deleteGalleryItem = async (id: number) => {
    if (!confirm('이 갤러리 항목을 삭제하시겠습니까?')) return;
    await gwaaDB.remove(STORES.GALLERY, id);
    setGalleryItems(await gwaaDB.getAll<GalleryItem>(STORES.GALLERY)); showToast('삭제 완료');
  };

  // ─── Hashtags ───
  const saveHashtag = async (page: PageHashtags['page']) => {
    const raw = hashtagDraft[page] || '';
    const tags = raw.split(',').map((t) => t.trim()).filter(Boolean);
    await gwaaDB.put<PageHashtags>(STORES.HASHTAGS, { page, tags });
    showToast(`${page} 해시태그 저장 완료`);
  };

  const navBtnStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 10, letterSpacing: '0.08em',
    color: active ? '#4ade80' : 'rgba(255,255,255,0.4)',
    background: active ? 'rgba(74,222,128,.08)' : 'none',
    border: 'none', padding: '8px 14px', borderRadius: 6, cursor: 'pointer', transition: 'all .2s',
  });

  // ─── Login screen ───
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: 24 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: '44px 48px', width: 'min(420px, 100%)' }}>
          <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 13, letterSpacing: '0.12em', color: '#4ade80', marginBottom: 8 }}>GWAA — ADMIN</div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: '#fff', lineHeight: 1, letterSpacing: '0.02em', marginBottom: 32 }}>관리자<br />로그인</div>
          <form onSubmit={doLogin}>
            <div style={fieldStyle}>
              <label style={{ ...labelStyle, color: 'rgba(255,255,255,0.5)' }}>비밀번호</label>
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="비밀번호 입력" autoComplete="current-password" style={{ ...inputStyle, background: 'rgba(255,255,255,.04)', borderColor: 'rgba(255,255,255,.1)', color: '#fff' }} />
              {loginErr && <p style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>비밀번호가 올바르지 않습니다.</p>}
            </div>
            <button type="submit" style={{ width: '100%', padding: '12px 18px', borderRadius: 9999, background: '#4ade80', color: '#0a0a0a', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 8 }}>로그인</button>
          </form>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.2)', marginTop: 20, textAlign: 'center' }}>강원도반려동물협회 내부 관리 시스템</p>
        </motion.div>
      </div>
    );
  }

  const tabs: [Tab, string][] = [
    ['dashboard', '대시보드'], ['applications', '신청내역'], ['events', '행사관리'],
    ['archive', '아카이브'], ['partners', '제휴업체'], ['images', '이미지'],
    ['content', '콘텐츠'], ['travel', '여행지'], ['settings', '설정'],
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Admin Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#0a0a0a', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.07)', gap: 16 }}>
        <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 12, letterSpacing: '0.1em', color: '#4ade80', flexShrink: 0 }}>GWAA ADMIN</div>
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
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, marginBottom: 8, color: '#111' }}>대시보드</h1>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 28 }}>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[{ label: '전체 신청', num: apps.length, sub: '누적' }, { label: '메이트쉽', num: apps.filter(a => a.type === 'mateship').length, sub: '가입 신청' }, { label: '교육 신청', num: apps.filter(a => a.type === 'education').length, sub: '교육 프로그램' }, { label: '등록 행사', num: events.length, sub: '진행중·예정 포함' }].map(({ label, num, sub }) => (
                <div key={label} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '22px 24px' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 36, color: '#111', lineHeight: 1 }}>{num}</div>
                  <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4 }}>{sub}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #e5e7eb' }}>
                <div><div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>최근 신청 내역</div><div style={{ fontSize: 12, color: '#9ca3af' }}>최근 5건</div></div>
                <button onClick={() => switchTab('applications')} style={{ fontSize: 12, fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", padding: '8px 18px', border: '1.5px solid #e5e7eb', borderRadius: 6, background: 'none', cursor: 'pointer', color: '#6b7280' }}>전체 보기 →</button>
              </div>
              <AppTable apps={apps.slice(-5).reverse()} short />
            </div>
          </div>
        )}

        {/* ── Applications ── */}
        {tab === 'applications' && (
          <div>
            <SectionHeader title="신청 내역" sub="메이트쉽 가입 & 교육 신청 접수 목록" />
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button onClick={exportCSV} style={{ fontSize: 12, fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", padding: '8px 18px', border: '1.5px solid #e5e7eb', borderRadius: 6, background: 'none', cursor: 'pointer', color: '#6b7280' }}>CSV 내보내기</button>
              <button onClick={clearApplications} style={{ fontSize: 12, fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", padding: '8px 18px', border: '1.5px solid #fca5a5', borderRadius: 6, background: 'none', cursor: 'pointer', color: '#ef4444' }}>전체 삭제</button>
            </div>
            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <AppTable apps={[...apps].reverse()} />
            </div>
          </div>
        )}

        {/* ── Events ── */}
        {tab === 'events' && (
          <div>
            <SectionHeader title="행사 관리" sub="다가오는 행사 목록 관리" onAdd={() => { setEditEvent({}); setEventModal(true); }} addLabel="+ 행사 추가" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {events.map((ev) => (
                <div key={ev.id} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                  {ev.imageData && <div style={{ height: 100, background: `url(${ev.imageData}) center/cover` }} />}
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>{ev.title}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>{ev.date} · {ev.loc}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setEditEvent({ ...ev, _key: ev.id }); setEventModal(true); }} style={btnEdit}>수정</button>
                      <button onClick={() => deleteEvent(ev.id!)} style={btnDel}>삭제</button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => { setEditEvent({}); setEventModal(true); }} style={{ background: '#f8fafc', border: '2px dashed #d1d5db', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', minHeight: 140 }}>
                <span style={{ fontSize: 24, opacity: 0.4 }}>+</span>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>행사 추가</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Archive ── */}
        {tab === 'archive' && (
          <div>
            <SectionHeader title="아카이브 행사" sub="지난 행사 기록 관리 — 행사 페이지 벤토 그리드에 표시" onAdd={() => { setEditArchive({}); setArchiveModal(true); }} addLabel="+ 행사 추가" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {archives.map((arc) => (
                <div key={arc.id} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ height: 120, background: arc.imageData ? `url(${arc.imageData}) center/cover` : 'linear-gradient(135deg,#e8f5e9,#a5d6a7)', display: 'flex', alignItems: 'flex-end', padding: 12, position: 'relative' }}>
                    {arc.feat && <span style={{ position: 'absolute', top: 10, left: 10, background: '#16a34a', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 9999 }}>FEATURED</span>}
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 3 }}>{arc.title}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>{arc.year} · {arc.loc} · {arc.ppl}명</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { const imgs = arc.images && arc.images.length > 0 ? arc.images : [arc.imageData, arc.imageData2].filter((x): x is string => !!x); setEditArchive({ ...arc, _key: arc.id, images: imgs }); setArchiveModal(true); }} style={btnEdit}>수정</button>
                      <button onClick={() => deleteArchive(arc.id!)} style={btnDel}>삭제</button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => { setEditArchive({}); setArchiveModal(true); }} style={{ background: '#f8fafc', border: '2px dashed #d1d5db', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', minHeight: 160 }}>
                <span style={{ fontSize: 24, opacity: 0.4 }}>+</span>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>행사 추가</span>
              </button>
            </div>
          </div>
        )}

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
                  {pt.discount && <div style={{ fontSize: 12, color: '#16a34a', marginBottom: 10 }}>{pt.discount}</div>}
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
                          <label style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, cursor: 'pointer', border: '1.5px solid #16a34a', background: '#f0fdf4', color: '#16a34a' }}>
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
                <button onClick={addGalleryItem} style={{ padding: '6px 14px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>+ 추가</button>
              </div>
              <div style={{ padding: '20px 22px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                  {galleryItems.map((g) => (
                    <div key={g.id} style={{ border: `1.5px ${g.imageData ? 'solid #e5e7eb' : 'dashed #d1d5db'}`, borderRadius: 12, overflow: 'hidden', opacity: g.active ? 1 : 0.55 }}>
                      <div style={{ aspectRatio: '1/1', background: g.imageData ? `url(${g.imageData}) center/cover` : 'linear-gradient(135deg,#f0fdf4,#dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {!g.imageData && <span style={{ fontSize: 32, opacity: 0.4 }}>🐾</span>}
                      </div>
                      <div style={{ padding: '10px 14px' }}>
                        <input value={g.caption} onChange={(e) => setGalleryItems((prev) => prev.map((x) => x.id === g.id ? { ...x, caption: e.target.value } : x))} onBlur={(e) => updateGalleryCaption(g.id!, e.target.value)} placeholder="사진 설명" style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 8px', fontSize: 11, marginBottom: 8, outline: 'none', boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          <label style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', border: '1.5px solid #16a34a', background: '#f0fdf4', color: '#16a34a' }}>
                            이미지 <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => pickGalleryImage(g.id!, e)} />
                          </label>
                          {g.imageData && <button onClick={() => removeGalleryImage(g.id!)} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'none', cursor: 'pointer', color: '#9ca3af' }}>삭제</button>}
                          <button onClick={() => toggleGalleryActive(g.id!)} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: g.active ? '#f0fdf4' : '#f8fafc', cursor: 'pointer', color: g.active ? '#16a34a' : '#9ca3af', fontWeight: 600 }}>{g.active ? '활성' : '비활성'}</button>
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
                  <div style={{ fontSize: 11, color: '#16a34a', marginBottom: 10 }}>{ac.link}</div>
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
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: '#111', marginBottom: 4 }}>룩북</h2>
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>홈페이지 룩북 갤러리 항목</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                {lookbookItems.map((lb) => (
                  <div key={lb.id} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ aspectRatio: '3/4', background: lb.imageData ? `url(${lb.imageData}) center/cover` : 'linear-gradient(135deg,#f0fdf4,#dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {lb.isMain && <span style={{ position: 'absolute', top: 8, left: 8, background: '#16a34a', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 9999 }}>MAIN</span>}
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 4 }}>{lb.label}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8, wordBreak: 'break-all' }}>{lb.link}</div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <label style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', border: '1.5px solid #16a34a', background: '#f0fdf4', color: '#16a34a' }}>
                          이미지 <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const b64 = await gwaaDB.toBase64(f); saveLookbook({ ...lb, imageData: b64 }); }} />
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
                      <th key={h} style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 10, letterSpacing: '0.08em', color: '#9ca3af', textAlign: 'left', padding: '11px 16px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
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
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, background: pl.isPartner ? '#f0fdf4' : '#f8fafc', color: pl.isPartner ? '#16a34a' : '#9ca3af', fontWeight: 700 }}>{pl.isPartner ? '파트너' : '일반'}</span>
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
                    <div style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 10, color: '#9ca3af', letterSpacing: '0.08em', marginBottom: 12 }}>{page.toUpperCase()}</div>
                    <textarea
                      value={hashtagDraft[page] || ''}
                      onChange={(e) => setHashtagDraft((prev) => ({ ...prev, [page]: e.target.value }))}
                      rows={3}
                      placeholder="#강원도반려동물협회, #GWAA, #메이트쉽"
                      style={{ ...inputStyle, resize: 'vertical', fontSize: 13 }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                      <button onClick={() => saveHashtag(page)} style={{ padding: '7px 18px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>저장</button>
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
              <ImageUploadBox imageData={editEvent.imageData} placeholder="🎪" onPick={async (e) => { const f = e.target.files?.[0]; if (!f) return; setEditEvent((p) => ({ ...p, imageData: undefined })); const b64 = await gwaaDB.toBase64(f); setEditEvent((p) => ({ ...p, imageData: b64 })); }} onRemove={() => setEditEvent((p) => ({ ...p, imageData: undefined }))} />
              <div style={fieldStyle}><label style={labelStyle}>행사명 *</label><input value={editEvent.title || ''} onChange={(e) => setEditEvent((p) => ({ ...p, title: e.target.value }))} placeholder="2026 반려동물 축제" style={inputStyle} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fieldStyle}><label style={labelStyle}>날짜</label><input value={editEvent.date || ''} onChange={(e) => setEditEvent((p) => ({ ...p, date: e.target.value }))} placeholder="2026.05.01" style={inputStyle} /></div>
                <div style={fieldStyle}><label style={labelStyle}>장소</label><input value={editEvent.loc || ''} onChange={(e) => setEditEvent((p) => ({ ...p, loc: e.target.value }))} placeholder="강릉" style={inputStyle} /></div>
              </div>
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
                  <span style={{ fontSize: 11, color: '#6b7280', fontFamily: "'SF Mono','Menlo','Monaco','Consolas',monospace" }}>
                    {(editArchive.images || []).length} / 20
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {(editArchive.images || []).map((img, idx) => (
                    <div
                      key={idx}
                      className="group"
                      style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: idx === 0 ? '2px solid #16a34a' : '1.5px solid #e5e7eb', cursor: idx === 0 ? 'default' : 'pointer' }}
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
                        <span style={{ position: 'absolute', bottom: 4, left: 4, background: '#16a34a', color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 3, letterSpacing: '0.04em' }}>대표</span>
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
                          const b64s = await Promise.all(toProcess.map((f) => gwaaDB.toBase64(f)));
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
              <ImageUploadBox imageData={editPartner.imageData} placeholder="🏢" onPick={async (e) => { const f = e.target.files?.[0]; if (!f) return; const b64 = await gwaaDB.toBase64(f); setEditPartner((p) => ({ ...p, imageData: b64 })); }} onRemove={() => setEditPartner((p) => ({ ...p, imageData: undefined }))} />
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
              <ImageUploadBox imageData={editActivity.imageData} placeholder="🐾" ratio="16/9" onPick={async (e) => { const f = e.target.files?.[0]; if (!f) return; const b64 = await gwaaDB.toBase64(f); setEditActivity((p) => ({ ...p, imageData: b64 })); }} onRemove={() => setEditActivity((p) => ({ ...p, imageData: undefined }))} />
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
              <ImageUploadBox imageData={editTravel.imageData} placeholder="📍" ratio="16/9" onPick={async (e) => { const f = e.target.files?.[0]; if (!f) return; const b64 = await gwaaDB.toBase64(f); setEditTravel((p) => ({ ...p, imageData: b64 })); }} onRemove={() => setEditTravel((p) => ({ ...p, imageData: undefined }))} />
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

      <AnimatePresence>{toast && <Toast msg={toast.msg} err={toast.err} />}</AnimatePresence>
    </div>
  );
}

function AppTable({ apps, short }: { apps: Application[]; short?: boolean }) {
  if (apps.length === 0) {
    return <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody><tr><td style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 13 }}>신청 내역이 없습니다</td></tr></tbody></table>;
  }
  const thStyle: React.CSSProperties = { fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace", fontSize: 10, letterSpacing: '0.08em', color: '#9ca3af', textAlign: 'left', padding: '11px 20px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' };
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
              <td style={tdStyle}>{new Date(a.at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
              <td style={tdStyle}><span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 9999, fontWeight: 700, background: a.type === 'mateship' ? '#f0fdf4' : '#eff6ff', color: a.type === 'mateship' ? '#166534' : '#1e40af' }}>{a.type === 'mateship' ? '메이트쉽' : '교육'}</span></td>
              <td style={tdStyle}>{a.ownerName || '-'}</td>
              <td style={tdStyle}>{a.ownerPhone || '-'}</td>
              {!short && <td style={tdStyle}>{a.ownerRegion || '-'}</td>}
              <td style={tdStyle}>{a.course || a.petType || a.petName || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
