'use client';

import { useEffect, useState } from 'react';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const GREEN = '#12A79D';
const GREEN_DK = '#0D7E76';

const PORTONE_STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || '';
const PORTONE_CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || '';
const CARD_ENABLED = !!(PORTONE_STORE_ID && PORTONE_CHANNEL_KEY);
type PortOneSDK = { requestPayment: (o: Record<string, unknown>) => Promise<{ code?: string | null; message?: string; paymentId?: string }> };

type Cls = { key: string; label: string; name: string; slot: string; emoji: string; price: number; closed: boolean; passed: boolean };

export default function ClassesClient() {
  const [cls, setCls] = useState<Cls[]>([]);
  const [sel, setSel] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [buying, setBuying] = useState(false);
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState<{ name: string; classes: string[]; total: number } | null>(null);

  const total = sel.reduce((s, k) => s + (cls.find((c) => c.key === k)?.price || 0), 0);
  const toggle = (k: string) => setSel((s) => s.includes(k) ? s.filter((x) => x !== k) : [...s, k]);

  const loadCatalog = () => fetch('/api/classes/capacity').then((r) => r.json()).then((d) => setCls(d.classes || [])).catch(() => {});

  useEffect(() => {
    loadCatalog();
    if (!CARD_ENABLED) return;
    if (!document.getElementById('portone-sdk')) {
      const s = document.createElement('script');
      s.id = 'portone-sdk'; s.src = 'https://cdn.portone.io/v2/browser-sdk.js'; s.async = true;
      document.body.appendChild(s);
    }
    // 모바일 리다이렉트 복귀 처리
    const raw = sessionStorage.getItem('gwaa_walkin_pay');
    if (raw) {
      sessionStorage.removeItem('gwaa_walkin_pay');
      const failCode = new URLSearchParams(window.location.search).get('code');
      try { window.history.replaceState({}, '', new URL(window.location.href).pathname); } catch { /* noop */ }
      try {
        const p = JSON.parse(raw) as { name: string; phone: string; keys: string[]; paymentId: string };
        if (failCode) setMsg('결제가 취소되었거나 실패했어요. 다시 시도해 주세요.');
        else if (p.keys?.length && p.paymentId) {
          setBuying(true);
          fetch('/api/classes/walkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
            .then((r) => r.json()).then((j) => { if (j.ok) setDone({ name: p.name, classes: j.classes || [], total: j.total || 0 }); else setMsg(j.error || '신청 처리에 실패했어요. (문의 033-813-0333)'); })
            .catch(() => setMsg('처리 중 오류가 발생했어요.')).finally(() => setBuying(false));
        }
      } catch { /* noop */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pay = async () => {
    if (!name.trim() || !phone.trim()) { setMsg('이름과 연락처를 입력해 주세요.'); return; }
    if (!sel.length) { setMsg('클래스를 선택해 주세요.'); return; }
    if (!CARD_ENABLED) { setMsg('카드결제 준비 중입니다.'); return; }
    const PortOne = (window as unknown as { PortOne?: PortOneSDK }).PortOne;
    if (!PortOne) { setMsg('결제 모듈을 불러오는 중이에요. 잠시 후 다시 눌러주세요.'); return; }
    const keys = [...sel];
    const paymentId = `wcls${Date.now()}${Math.random().toString(36).slice(2, 7)}`.replace(/[^a-zA-Z0-9]/g, '');
    setBuying(true); setMsg('');
    sessionStorage.setItem('gwaa_walkin_pay', JSON.stringify({ name: name.trim(), phone: phone.trim(), keys, paymentId }));
    try {
      const resp = await PortOne.requestPayment({
        storeId: PORTONE_STORE_ID, channelKey: PORTONE_CHANNEL_KEY,
        paymentId, orderName: `펫스카웃 웰니스 클래스 ${keys.length}건`,
        totalAmount: total, currency: 'CURRENCY_KRW', payMethod: 'CARD',
        customer: { fullName: name.trim(), phoneNumber: phone.trim() },
        redirectUrl: window.location.origin + window.location.pathname,
      });
      if (resp.code != null) { sessionStorage.removeItem('gwaa_walkin_pay'); setMsg(`결제가 취소되었거나 실패했어요. [${resp.code}] ${resp.message ?? ''}`); setBuying(false); return; }
      const r = await fetch('/api/classes/walkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), phone: phone.trim(), keys, paymentId }) });
      const j = await r.json();
      sessionStorage.removeItem('gwaa_walkin_pay');
      if (!r.ok || !j.ok) { setMsg(j.error || '신청 처리에 실패했어요. (문의 033-813-0333)'); setBuying(false); return; }
      setDone({ name: name.trim(), classes: j.classes || [], total: j.total || 0 });
    } catch { sessionStorage.removeItem('gwaa_walkin_pay'); setMsg('결제 처리 중 오류가 발생했어요.'); setBuying(false); }
  };

  const wrap: React.CSSProperties = { minHeight: '100vh', background: '#eef2f0', fontFamily: MONO, padding: '24px 16px' };
  const card: React.CSSProperties = { maxWidth: 440, margin: '0 auto', background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 6px 24px rgba(0,0,0,0.06)' };
  const inp: React.CSSProperties = { width: '100%', padding: '13px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 15, color: '#111', boxSizing: 'border-box', fontFamily: MONO };

  if (done) {
    return (
      <div style={wrap}><div style={{ ...card, padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>✅</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 8 }}>신청 완료!</div>
        <div style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7 }}>{done.name}님, 아래 클래스가 신청되었어요.<br />클래스 시간에 맞춰 진행 부스로 와주세요.</div>
        <div style={{ background: '#EDFAF8', border: '1px solid #BFF3EC', borderRadius: 12, padding: '14px 16px', margin: '16px 0', textAlign: 'left' }}>
          {done.classes.map((c) => <div key={c} style={{ fontSize: 13.5, fontWeight: 700, color: GREEN_DK, padding: '3px 0' }}>· {c}</div>)}
          <div style={{ borderTop: '1px solid #d6ecd8', marginTop: 8, paddingTop: 8, fontSize: 13, color: '#111', fontWeight: 800 }}>결제 {done.total.toLocaleString()}원</div>
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af' }}>문의 033-813-0333</div>
      </div></div>
    );
  }

  return (
    <div style={wrap}><div style={card}>
      <div style={{ background: GREEN_DK, padding: '24px 22px', textAlign: 'center' }}>
        <div style={{ color: '#BFF3EC', fontSize: 11, letterSpacing: '0.18em', fontWeight: 700 }}>CAMPING WITH PETSCOUT 2026</div>
        <div style={{ fontFamily: BEBAS, color: '#fff', fontSize: 26, letterSpacing: '0.02em', marginTop: 6 }}>웰니스 클래스 현장 신청</div>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4 }}>원하는 클래스를 고르고 카드로 바로 결제하세요</div>
      </div>
      <div style={{ padding: '22px 22px 28px' }}>
        <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" style={inp} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="연락처 (010-0000-0000)" type="tel" style={inp} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#111', marginBottom: 8 }}>클래스 선택</div>
        <div style={{ display: 'grid', gap: 8 }}>
          {cls.map((c) => {
            const on = sel.includes(c.key);
            return (
              <button key={c.key} disabled={c.closed || buying} onClick={() => toggle(c.key)}
                style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '13px 14px', borderRadius: 12, cursor: c.closed ? 'default' : 'pointer', fontFamily: MONO,
                  border: on ? `2px solid ${GREEN}` : '1.5px solid #e5e7eb', background: c.closed ? '#f9fafb' : on ? '#EDFAF8' : '#fff', opacity: c.closed ? 0.5 : 1 }}>
                <span>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: '#111' }}>{c.emoji} {c.name}</span>
                  <span style={{ display: 'block', fontSize: 12, color: '#6b7280', marginTop: 2 }}>{c.slot} · {c.price.toLocaleString()}원</span>
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', color: c.closed ? '#9ca3af' : GREEN_DK }}>
                  {c.passed ? '지난 타임' : c.closed ? '마감' : (on ? '선택됨 ✓' : '신청')}
                </span>
              </button>
            );
          })}
        </div>
        <button disabled={!sel.length || !name.trim() || !phone.trim() || buying} onClick={pay}
          style={{ width: '100%', marginTop: 18, padding: '16px', borderRadius: 12, border: 'none', background: (!sel.length || !name.trim() || !phone.trim() || buying) ? '#d1d5db' : GREEN, color: '#fff', fontSize: 16, fontWeight: 800, cursor: (!sel.length || !name.trim() || !phone.trim() || buying) ? 'default' : 'pointer', fontFamily: MONO }}>
          {buying ? '결제 처리 중…' : total > 0 ? `💳 카드로 결제 (${total.toLocaleString()}원)` : '클래스를 선택하세요'}
        </button>
        {msg && <div style={{ fontSize: 12.5, color: '#dc2626', marginTop: 12, lineHeight: 1.6 }}>{msg}</div>}
        <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 16, lineHeight: 1.7, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
          ※ 타임 시작 전까지만 취소 가능 · 정원 마감 시 신청 불가<br />※ 문의 033-813-0333
        </div>
      </div>
    </div></div>
  );
}
