'use client';

import { useEffect, useState } from 'react';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const GREEN = '#16a34a';

const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
const CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
const DONATE_PRESETS = [10000, 30000, 50000, 100000];

type PortOneResp = { code?: string; message?: string; paymentId?: string; billingKey?: string };
declare global {
  interface Window {
    PortOne?: {
      requestPayment: (o: Record<string, unknown>) => Promise<PortOneResp>;
      requestIssueBillingKey: (o: Record<string, unknown>) => Promise<PortOneResp>;
    };
  }
}

export default function SupportPage() {
  const [kind, setKind] = useState<'membership' | 'donation'>('membership');
  const [donateAmount, setDonateAmount] = useState(30000);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (document.getElementById('portone-sdk')) return;
    const s = document.createElement('script');
    s.id = 'portone-sdk';
    s.src = 'https://cdn.portone.io/v2/browser-sdk.js';
    document.body.appendChild(s);
  }, []);

  // 모바일 결제창 복귀 처리 — redirectUrl로 돌아온 경우 결과 파라미터로 이어서 처리
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const code = sp.get('code');
    const message = sp.get('message');
    const paymentId = sp.get('paymentId');
    const billingKey = sp.get('billingKey');
    const txType = sp.get('transactionType');
    if (!code && !paymentId && !billingKey && !txType) return;

    const clean = () => window.history.replaceState({}, document.title, window.location.pathname);
    let pending: { kind?: 'membership' | 'donation'; form?: { name: string; phone: string; email: string }; agree?: boolean } = {};
    try { pending = JSON.parse(sessionStorage.getItem('gwaa_pay_pending') || '{}'); } catch { /* noop */ }

    (async () => {
      if (pending.kind) setKind(pending.kind);
      if (code) {
        setMsg(`결제가 취소되었거나 실패했어요. [${code}] ${message ?? ''}`.trim());
        sessionStorage.removeItem('gwaa_pay_pending'); clean(); return;
      }
      setBusy(true);
      try {
        if (billingKey || txType === 'ISSUE_BILLING_KEY') {
          const f = pending.form || { name: '', phone: '', email: '' };
          const bill = await fetch('/api/payments/portone/billing', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ billingKey, name: f.name, phone: f.phone, email: f.email, agreePrivacy: pending.agree }),
          });
          const bj = await bill.json().catch(() => ({}));
          if (!bill.ok) setMsg(bj.error || '정기결제 등록에 실패했어요.'); else setDone(true);
        } else if (paymentId || txType === 'PAYMENT') {
          const conf = await fetch('/api/payments/portone/confirm', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
          const cj = await conf.json().catch(() => ({}));
          if (!conf.ok) setMsg(cj.error || '결제 검증에 실패했어요.'); else setDone(true);
        }
      } catch (e) {
        setMsg(`결제 확인 중 오류가 발생했어요. ${e instanceof Error ? e.message : ''}`.trim());
      } finally {
        setBusy(false); sessionStorage.removeItem('gwaa_pay_pending'); clean();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const amount = kind === 'membership' ? 10000 : donateAmount;

  const orderName = kind === 'membership' ? 'GWAA 멤버십 회비' : 'GWAA 후원금';

  const pay = async () => {
    setMsg('');
    if (!form.name || !form.phone || !form.email) { setMsg('납부자 정보를 모두 입력해 주세요.'); return; }
    if (!agree) { setMsg('개인정보 수집·이용에 동의해 주세요.'); return; }
    if (amount < 1000) { setMsg('금액을 확인해 주세요. (최소 1,000원)'); return; }

    if (!STORE_ID || !CHANNEL_KEY) {
      setMsg('결제 시스템 오픈 준비 중입니다. (심사 진행 중 — 곧 이용하실 수 있어요)');
      return;
    }
    if (!window.PortOne) { setMsg('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.'); return; }

    setBusy(true);
    // 모바일 리다이렉트 대비: 결제창 호출 전 폼 정보 보관(복귀 시 이어서 처리)
    const redirectUrl = window.location.origin + window.location.pathname;
    sessionStorage.setItem('gwaa_pay_pending', JSON.stringify({ kind, amount, form, agree }));
    try {
      if (kind === 'membership') {
        // 정기결제: 빌링키 발급 → 서버가 첫 달 결제 + 회원 등록
        const issueId = `gwaabilling${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
        const resp = await window.PortOne.requestIssueBillingKey({
          storeId: STORE_ID, channelKey: CHANNEL_KEY,
          billingKeyMethod: 'CARD', issueId, issueName: 'GWAA 멤버십 월 회비',
          customer: { fullName: form.name, phoneNumber: form.phone, email: form.email },
          redirectUrl,
        });
        if (resp.code != null || !resp.billingKey) { setMsg(`카드 등록이 취소되었거나 실패했어요. [${resp.code ?? '오류'}] ${resp.message ?? ''}`); setBusy(false); return; }

        const bill = await fetch('/api/payments/portone/billing', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ billingKey: resp.billingKey, name: form.name, phone: form.phone, email: form.email, agreePrivacy: agree }),
        });
        const bj = await bill.json().catch(() => ({}));
        if (!bill.ok) { setMsg(bj.error || '정기결제 등록에 실패했어요.'); setBusy(false); return; }
        sessionStorage.removeItem('gwaa_pay_pending');
        setDone(true);
        return;
      }

      // 후원(단건): 준비 → 결제창 → 검증
      // PortOne V2 paymentId는 영문·숫자만 허용(특수문자 불가) → 언더스코어 제거
      const paymentId = `gwaa${kind}${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
      const prep = await fetch('/api/payments/portone', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, kind, amount, name: form.name, phone: form.phone, email: form.email, agreePrivacy: agree }),
      });
      if (!prep.ok) { const e = await prep.json().catch(() => ({})); setMsg(e.error || '결제 준비 실패'); setBusy(false); return; }

      const resp = await window.PortOne.requestPayment({
        storeId: STORE_ID, channelKey: CHANNEL_KEY, paymentId, orderName,
        totalAmount: amount, currency: 'CURRENCY_KRW', payMethod: 'CARD',
        customer: { fullName: form.name, phoneNumber: form.phone, email: form.email },
        redirectUrl,
      });
      if (resp.code != null) { setMsg(`결제가 취소되었거나 실패했어요. [${resp.code}] ${resp.message ?? ''}`); setBusy(false); return; }

      const conf = await fetch('/api/payments/portone/confirm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });
      const cj = await conf.json().catch(() => ({}));
      if (!conf.ok) { setMsg(cj.error || '결제 검증에 실패했어요.'); setBusy(false); return; }

      sessionStorage.removeItem('gwaa_pay_pending');
      setDone(true);
    } catch (e) {
      setMsg(`결제 처리 중 오류가 발생했어요. ${e instanceof Error ? e.message : ''}`.trim());
    } finally {
      setBusy(false);
    }
  };

  const input: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14, fontFamily: MONO, boxSizing: 'border-box' };
  const tab = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '14px', borderRadius: 12, border: `1.5px solid ${active ? GREEN : '#e5e7eb'}`,
    background: active ? '#f0fdf4' : '#fff', color: active ? GREEN : '#6b7280', fontWeight: 700, fontSize: 14, cursor: 'pointer',
  });

  if (done) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', fontFamily: MONO, textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🐾</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 10 }}>
          {kind === 'membership' ? '회원 가입이 완료되었습니다' : '후원해 주셔서 감사합니다'}
        </h1>
        <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7 }}>
          {orderName} 결제가 완료되었습니다.<br />
          {kind === 'membership'
            ? '결제하신 전화번호로 카카오 로그인하시면 디지털 회원증이 발급됩니다.'
            : '강원도 반려동물 문화를 함께 만들어 주셔서 감사합니다.'}
        </p>
        {kind === 'membership' ? (
          <a href="/membership" style={{ display: 'inline-block', marginTop: 28, padding: '12px 24px', borderRadius: 10, background: GREEN, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>디지털 회원증 받기 →</a>
        ) : (
          <a href="/" style={{ display: 'inline-block', marginTop: 28, padding: '12px 24px', borderRadius: 10, background: GREEN, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>홈으로</a>
        )}
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '56px 24px 96px', fontFamily: MONO, color: '#374151' }}>
      <p style={{ fontSize: 12, color: GREEN, letterSpacing: '0.1em', fontWeight: 700, margin: '0 0 8px' }}>SUPPORT GWAA</p>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', marginBottom: 8 }}>회비 납부 · 후원하기</h1>
      <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 28 }}>
        여러분의 회비와 후원은 강원도 반려동물의 복지와 반려문화 확산 활동에 소중히 쓰입니다.
      </p>

      {/* 유형 선택 */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button onClick={() => setKind('membership')} style={tab(kind === 'membership')}>멤버십 회비<br /><span style={{ fontSize: 12, fontWeight: 500 }}>월 10,000원</span></button>
        <button onClick={() => setKind('donation')} style={tab(kind === 'donation')}>후원금<br /><span style={{ fontSize: 12, fontWeight: 500 }}>원하는 금액</span></button>
      </div>

      {/* 금액 */}
      {kind === 'donation' && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {DONATE_PRESETS.map((a) => (
              <button key={a} onClick={() => setDonateAmount(a)}
                style={{ padding: '12px', borderRadius: 10, border: `1.5px solid ${donateAmount === a ? GREEN : '#e5e7eb'}`, background: donateAmount === a ? '#f0fdf4' : '#fff', color: '#111', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                {a.toLocaleString()}원
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 납부자 정보 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        <input style={input} placeholder="이름" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input style={input} placeholder="연락처 (010-0000-0000)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <p style={{ fontSize: 11.5, color: GREEN, margin: '-2px 0 0', lineHeight: 1.5 }}>
          💬 회원증 발급을 위해 <b>카카오 로그인에 사용할 번호와 동일하게</b> 입력해 주세요.
        </p>
        <input style={input} type="email" placeholder="이메일" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>

      {/* 동의 */}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: '#4b5563', lineHeight: 1.5, marginBottom: 14, cursor: 'pointer' }}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 2, accentColor: GREEN }} />
        <span>
          <a href="/terms" target="_blank" style={{ color: GREEN, fontWeight: 600 }}>이용약관</a>,{' '}
          <a href="/privacy" target="_blank" style={{ color: GREEN, fontWeight: 600 }}>개인정보 수집·이용</a>,{' '}
          <a href="/refund" target="_blank" style={{ color: GREEN, fontWeight: 600 }}>환불 정책</a>에 동의합니다 (필수)
        </span>
      </label>

      {/* 정기결제 자동청구 고지 (회비) */}
      {kind === 'membership' && (
        <p style={{ fontSize: 11.5, color: '#6b7280', lineHeight: 1.6, marginBottom: 10, background: '#f9fafb', borderRadius: 8, padding: '10px 12px' }}>
          🔄 <b>정기결제 안내</b> — 카드 등록 후 <b>매월 10,000원이 자동으로 결제</b>되며, 회원 자격이 매월 갱신됩니다. 해지는 협회(033-813-0333) 또는 마이페이지에서 언제든 가능하며, 해지 시 다음 달부터 청구되지 않습니다.
        </p>
      )}

      {/* 영수증 고지 */}
      <p style={{ fontSize: 11.5, color: '#9ca3af', lineHeight: 1.6, marginBottom: 20 }}>
        ※ 현재 기부금영수증(소득공제)은 발급되지 않습니다. (지정기부금단체 재지정 진행 중) 멤버십 회비는 소득공제 대상이 아닙니다.
      </p>

      {msg && <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 14, lineHeight: 1.5 }}>{msg}</p>}

      <button onClick={pay} disabled={busy} style={{ width: '100%', padding: '16px', borderRadius: 12, background: GREEN, color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}>
        {busy ? '결제 진행 중...' : (kind === 'membership' ? '월 10,000원 정기결제 시작' : `${amount.toLocaleString()}원 후원하기`)}
      </button>
    </main>
  );
}
