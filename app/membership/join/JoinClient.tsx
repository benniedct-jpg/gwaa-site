'use client';

import { useEffect, useState } from 'react';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const GREEN = '#12A79D';
const GREEN_DK = '#0D7E76';
const FEE = 120000;

const PORTONE_STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || '';
const PORTONE_CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || '';
const CARD_ENABLED = !!(PORTONE_STORE_ID && PORTONE_CHANNEL_KEY);
type PortOneSDK = { requestPayment: (o: Record<string, unknown>) => Promise<{ code?: string | null; message?: string; paymentId?: string }> };

const BENEFITS = [
  { icon: '🏷️', t: '전국 반려 제휴처 할인', d: '병원·미용·호텔·카페·용품 등 제휴처에서 회원 전용 할인' },
  { icon: '🎪', t: '협회 행사 할인·우선 예약', d: '올림펫 등 협회 주최 행사 참가비 할인과 우선 예약 혜택' },
  { icon: '📱', t: '디지털 회원증', d: '휴대폰 QR 회원증으로 제휴처에서 바로 회원 확인' },
  { icon: '🐾', t: '반려문화 기여', d: '회비는 반려문화 확산·유기동물 지원 등 협회 활동에 쓰여요' },
];

export default function JoinClient() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!CARD_ENABLED) return;
    if (!document.getElementById('portone-sdk')) {
      const s = document.createElement('script');
      s.id = 'portone-sdk'; s.src = 'https://cdn.portone.io/v2/browser-sdk.js'; s.async = true;
      document.body.appendChild(s);
    }
    // 모바일 리다이렉트 복귀 처리
    const raw = sessionStorage.getItem('gwaa_member_join');
    if (raw) {
      sessionStorage.removeItem('gwaa_member_join');
      const failCode = new URLSearchParams(window.location.search).get('code');
      try { window.history.replaceState({}, '', new URL(window.location.href).pathname); } catch { /* noop */ }
      try {
        const p = JSON.parse(raw) as { name: string; phone: string; email: string; region: string; paymentId: string };
        if (failCode) setMsg('결제가 취소되었거나 실패했어요. 다시 시도해 주세요.');
        else if (p.paymentId) finalize(p);
      } catch { /* noop */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finalize = async (p: { name: string; phone: string; email: string; region: string; paymentId: string }) => {
    setBusy(true); setMsg('가입 처리 중…');
    try {
      const r = await fetch('/api/membership/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
      const j = await r.json();
      if (!r.ok || !j.ok) { setMsg(j.error || '가입 처리에 실패했어요. (문의 033-813-0333)'); setBusy(false); return; }
      window.location.href = '/membership/card';
    } catch { setMsg('처리 중 오류가 발생했어요.'); setBusy(false); }
  };

  const pay = async () => {
    if (!name.trim() || !phone.trim()) { setMsg('이름과 연락처를 입력해 주세요.'); return; }
    if (!agree) { setMsg('개인정보 수집·이용 동의가 필요합니다.'); return; }
    if (!CARD_ENABLED) { setMsg('결제 준비 중입니다.'); return; }
    const PortOne = (window as unknown as { PortOne?: PortOneSDK }).PortOne;
    if (!PortOne) { setMsg('결제 모듈을 불러오는 중이에요. 잠시 후 다시 눌러주세요.'); return; }
    const info = { name: name.trim(), phone: phone.trim(), email: email.trim(), region: region.trim() };
    const paymentId = `mem${Date.now()}${Math.random().toString(36).slice(2, 7)}`.replace(/[^a-zA-Z0-9]/g, '');
    setBusy(true); setMsg('');
    sessionStorage.setItem('gwaa_member_join', JSON.stringify({ ...info, paymentId }));
    try {
      const resp = await PortOne.requestPayment({
        storeId: PORTONE_STORE_ID, channelKey: PORTONE_CHANNEL_KEY,
        paymentId, orderName: 'GWAA 멤버십 연회비',
        totalAmount: FEE, currency: 'CURRENCY_KRW', payMethod: 'CARD',
        customer: { fullName: info.name, phoneNumber: info.phone },
        redirectUrl: window.location.origin + window.location.pathname,
      });
      if (resp.code != null) { sessionStorage.removeItem('gwaa_member_join'); setMsg(`결제가 취소되었거나 실패했어요. [${resp.code}] ${resp.message ?? ''}`); setBusy(false); return; }
      sessionStorage.removeItem('gwaa_member_join');
      await finalize({ ...info, paymentId });
    } catch { sessionStorage.removeItem('gwaa_member_join'); setMsg('결제 처리 중 오류가 발생했어요.'); setBusy(false); }
  };

  const wrap: React.CSSProperties = { minHeight: '100vh', background: '#eef2f0', fontFamily: MONO, padding: '24px 16px' };
  const card: React.CSSProperties = { maxWidth: 460, margin: '0 auto', background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 6px 24px rgba(0,0,0,0.06)' };
  const inp: React.CSSProperties = { width: '100%', padding: '13px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 15, color: '#111', boxSizing: 'border-box', fontFamily: MONO };
  const lab: React.CSSProperties = { fontSize: 12.5, fontWeight: 800, color: '#374151', margin: '2px 0 6px' };

  return (
    <div style={wrap}><div style={card}>
      <div style={{ background: GREEN_DK, padding: '28px 22px', textAlign: 'center' }}>
        <div style={{ color: '#BFF3EC', fontSize: 11, letterSpacing: '0.18em', fontWeight: 700 }}>GWAA MEMBERSHIP</div>
        <div style={{ fontFamily: BEBAS, color: '#fff', fontSize: 28, letterSpacing: '0.02em', marginTop: 6 }}>멤버십 가입</div>
        <div style={{ color: 'rgba(255,255,255,0.82)', fontSize: 13, marginTop: 6 }}>월 <b style={{ color: '#fff' }}>1만원</b> 꼴 · 연 {FEE.toLocaleString()}원 일시결제 · 1년 혜택</div>
      </div>
      <div style={{ padding: '22px 22px 28px' }}>
        {/* 혜택 */}
        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {BENEFITS.map((b) => (
            <div key={b.t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#f7faf8', border: '1px solid #e6efe9', borderRadius: 12, padding: '12px 14px' }}>
              <span style={{ fontSize: 22, lineHeight: 1.1 }}>{b.icon}</span>
              <span>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 800, color: '#111' }}>{b.t}</span>
                <span style={{ display: 'block', fontSize: 12.5, color: '#6b7280', marginTop: 2, lineHeight: 1.55, wordBreak: 'keep-all' }}>{b.d}</span>
              </span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 13, fontWeight: 800, color: '#111', marginBottom: 10 }}>가입 정보</div>
        <div style={{ display: 'grid', gap: 10 }}>
          <div><div style={lab}>이름 *</div><input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" style={inp} /></div>
          <div><div style={lab}>연락처 *</div><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" type="tel" style={inp} /></div>
          <div><div style={lab}>이메일</div><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="선택" type="email" style={inp} /></div>
          <div><div style={lab}>지역</div><input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="예) 강원 원주" style={inp} /></div>
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12.5, color: '#374151', cursor: 'pointer', marginTop: 16, lineHeight: 1.6, background: '#f9fafb', border: '1px solid #eee', borderRadius: 10, padding: '12px 14px' }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 18, height: 18, marginTop: 1, flexShrink: 0 }} />
          <span><b>[필수]</b> 개인정보 수집·이용 동의 — 회원 관리·회원증 발급·혜택 제공을 위해 이름·연락처·이메일·지역을 수집하며, 관련 법령에 따라 보관 후 파기합니다.</span>
        </label>

        <button disabled={busy} onClick={pay}
          style={{ width: '100%', marginTop: 18, padding: '16px', borderRadius: 12, border: 'none', background: busy ? '#d1d5db' : GREEN, color: '#fff', fontSize: 16, fontWeight: 800, cursor: busy ? 'default' : 'pointer', fontFamily: MONO }}>
          {busy ? '처리 중…' : `💳 가입하기 · 월 1만원 (연 ${FEE.toLocaleString()}원 결제)`}
        </button>
        {msg && <div style={{ fontSize: 12.5, color: msg.includes('처리 중') ? '#6b7280' : '#dc2626', marginTop: 12, lineHeight: 1.6 }}>{msg}</div>}
        <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 16, lineHeight: 1.7, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
          ※ 연 1회 결제 · 유효기간 1년 · 결제 후 디지털 회원증이 즉시 발급됩니다.<br />※ 이미 회원이시면 <a href="/membership" style={{ color: GREEN_DK, fontWeight: 700 }}>회원증 보기</a> · 문의 033-813-0333
        </div>
      </div>
    </div></div>
  );
}
