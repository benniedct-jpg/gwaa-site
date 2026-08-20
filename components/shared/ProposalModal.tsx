'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";

const REGIONS = ['춘천','원주','강릉','속초','양양','고성','평창','홍천','인제','삼척','정선','영월','기타'];

type Kind = 'travel' | 'mateship';

const COPY: Record<Kind, { title: string; sub: string; catLabel: string; catPlaceholder: string; nameLabel: string }> = {
  travel: {
    title: '우리 매장 등록 제안',
    sub: '반려동물 동반이 가능한 우리 매장을 강원 여행 지도에 등록하고 싶으신가요? 정보를 남겨주시면 검토 후 연락드립니다.',
    catLabel: '업종',
    catPlaceholder: '카페 · 식당 · 호텔 · 캠핑 · 공원 등',
    nameLabel: '매장(장소)명',
  },
  mateship: {
    title: '제휴 파트너 제안',
    sub: 'GWAA 메이트쉽 제휴 파트너로 함께하고 싶으신가요? 업체 정보와 제안 내용을 남겨주시면 담당자가 검토 후 연락드립니다.',
    catLabel: '업종',
    catPlaceholder: '숙박 · 카페 · 캠핑 · 펫푸드 · 교육 등',
    nameLabel: '업체(브랜드)명',
  },
};

const field: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1.5px solid #e5e7eb', fontSize: 14, color: '#111',
  background: '#fafafa', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};
const label: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 700, color: '#374151',
  marginBottom: 6, letterSpacing: '0.01em',
};

export default function ProposalModal({
  kind,
  open,
  onClose,
}: {
  kind: Kind;
  open: boolean;
  onClose: () => void;
}) {
  const c = COPY[kind];
  const [form, setForm] = useState({ name: '', region: '', category: '', contact: '', email: '', link: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // Esc 로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  // 닫힐 때 상태 초기화
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => { setDone(false); setError(''); setForm({ name: '', region: '', category: '', contact: '', email: '', link: '', message: '' }); }, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    setError('');
    if (!form.name.trim()) { setError('업체명을 입력해주세요.'); return; }
    if (!form.contact.trim()) { setError('연락처를 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/data/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, ...form, created_at: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error('전송에 실패했어요');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '전송에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 460, background: '#fff', borderRadius: 20,
              maxHeight: '90vh', overflowY: 'auto', position: 'relative',
              boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
            }}
          >
            {/* 닫기 */}
            <button
              onClick={onClose}
              aria-label="닫기"
              style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 9999, border: 'none', background: '#f3f4f6', color: '#6b7280', fontSize: 17, cursor: 'pointer', lineHeight: 1 }}
            >✕</button>

            {done ? (
              <div style={{ padding: '48px 32px 44px', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 9999, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 26 }}>✓</div>
                <h3 style={{ fontFamily: BEBAS, fontSize: 26, color: '#111', letterSpacing: '0.02em', margin: '0 0 8px' }}>제안이 접수됐어요</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: '0 0 24px' }}>담당자가 검토 후 남겨주신 연락처로 연락드릴게요. 감사합니다!</p>
                <button onClick={onClose} style={{ padding: '12px 32px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>닫기</button>
              </div>
            ) : (
              <div style={{ padding: '30px 28px 28px' }}>
                <p style={{ fontFamily: MONO, fontSize: 11, color: '#16a34a', letterSpacing: '0.1em', fontWeight: 700, margin: '0 0 6px' }}>
                  {kind === 'travel' ? 'PLACE PROPOSAL' : 'PARTNERSHIP PROPOSAL'}
                </p>
                <h3 style={{ fontFamily: BEBAS, fontSize: 27, color: '#111', letterSpacing: '0.02em', margin: '0 0 8px' }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: '0 0 22px' }}>{c.sub}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={label}>{c.nameLabel} <span style={{ color: '#dc2626' }}>*</span></label>
                    <input value={form.name} onChange={set('name')} placeholder={c.nameLabel} style={field} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label style={label}>지역</label>
                      <select value={form.region} onChange={set('region')} style={{ ...field, cursor: 'pointer' }}>
                        <option value="">선택</option>
                        {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1.4 }}>
                      <label style={label}>{c.catLabel}</label>
                      <input value={form.category} onChange={set('category')} placeholder={c.catPlaceholder} style={field} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label style={label}>연락처 <span style={{ color: '#dc2626' }}>*</span></label>
                      <input value={form.contact} onChange={set('contact')} placeholder="010-0000-0000" style={field} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={label}>이메일</label>
                      <input value={form.email} onChange={set('email')} placeholder="선택 입력" type="email" style={field} />
                    </div>
                  </div>
                  <div>
                    <label style={label}>홈페이지 · 인스타 링크</label>
                    <input value={form.link} onChange={set('link')} placeholder="선택 입력" style={field} />
                  </div>
                  <div>
                    <label style={label}>{kind === 'travel' ? '매장 소개 · 반려동물 동반 조건' : '제안 내용 · 제공 가능한 혜택'}</label>
                    <textarea value={form.message} onChange={set('message')} rows={3}
                      placeholder={kind === 'travel' ? '예) 전 견종 실내 동반 가능, 반려견 메뉴 있음' : '예) 회원 20% 할인 제공 가능, 반려견 동반 객실 운영'}
                      style={{ ...field, resize: 'vertical', lineHeight: 1.5 }} />
                  </div>

                  {error && <p style={{ fontSize: 12.5, color: '#dc2626', margin: 0 }}>{error}</p>}

                  <button
                    onClick={submit}
                    disabled={submitting}
                    style={{
                      marginTop: 4, padding: '14px', borderRadius: 12,
                      background: submitting ? '#86efac' : '#16a34a', color: '#fff',
                      fontWeight: 700, fontSize: 15, border: 'none',
                      cursor: submitting ? 'default' : 'pointer', letterSpacing: '0.02em',
                    }}
                  >
                    {submitting ? '전송 중...' : '제안 보내기'}
                  </button>
                  <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                    남겨주신 정보는 제휴·등록 검토 목적으로만 사용됩니다.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
