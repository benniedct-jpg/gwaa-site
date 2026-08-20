'use client';

// PG 심사용 테스트 결제 페이지 (숨김 · 라이브 예약 흐름과 무관)
// - 라이브 예약은 계좌이체 그대로. 이 페이지는 PortOne V2 테스트채널로 결제모듈만 호출한다.
// - storeId / channelKey 는 PortOne 콘솔의 "테스트채널"에서 발급된 값을 환경변수로 넣는다:
//     NEXT_PUBLIC_PORTONE_STORE_ID , NEXT_PUBLIC_PORTONE_CHANNEL_KEY
// - 테스트 결제는 결제대행사에서 자동 환불된다(일부 간편결제 제외).

import { useEffect, useState } from 'react';

const SDK_SRC = 'https://cdn.portone.io/v2/browser-sdk.js';

type PortOneSDK = {
  requestPayment: (req: Record<string, unknown>) => Promise<Record<string, unknown>>;
};
function getPortOne(): PortOneSDK | undefined {
  return (window as unknown as { PortOne?: PortOneSDK }).PortOne;
}

export default function PgTestPage() {
  const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || '';
  const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || '';
  const configured = !!(storeId && channelKey);

  const [sdkReady, setSdkReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>('');
  const [payMethod, setPayMethod] = useState<'CARD' | 'EASY_PAY'>('CARD');

  // V2 브라우저 SDK 로드 (CDN)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (getPortOne()) { setSdkReady(true); return; }
    const s = document.createElement('script');
    s.src = SDK_SRC;
    s.onload = () => setSdkReady(true);
    s.onerror = () => setResult('SDK 로드 실패 — 네트워크를 확인하세요.');
    document.head.appendChild(s);
  }, []);

  // 모바일 리다이렉트 복귀 결과 표시
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const code = sp.get('code'); const message = sp.get('message'); const paymentId = sp.get('paymentId');
    if (!code && !paymentId) return;
    setResult(code != null
      ? `❌ 실패/취소: ${code} — ${message ?? ''}`
      : `✅ 결제창 호출·승인 완료\npaymentId: ${paymentId ?? ''}\n(테스트 결제는 결제대행사에서 자동 환불됩니다)`);
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  const pay = async () => {
    const PortOne = getPortOne();
    if (!PortOne) { setResult('SDK가 아직 로드되지 않았습니다.'); return; }
    if (!configured) { setResult('storeId / channelKey 환경변수가 설정되지 않았습니다.'); return; }
    setBusy(true); setResult('');
    try {
      const paymentId = `test${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
      const req: Record<string, unknown> = {
        storeId,
        channelKey,
        paymentId,
        orderName: '펫스카웃 2026 테스트 결제',
        totalAmount: 1000,
        currency: 'CURRENCY_KRW',
        payMethod,
        customer: { fullName: '테스트결제', phoneNumber: '010-0000-0000', email: 'test@test.com' },
      };
      // KPN 간편결제는 어떤 간편결제 수단인지(카카오페이) 필수 지정
      if (payMethod === 'EASY_PAY') {
        req.easyPay = { easyPayProvider: 'EASY_PAY_PROVIDER_KAKAOPAY' };
      }
      // 모바일은 리다이렉트 방식 — redirectUrl 필수(없으면 결제창 호출이 예외로 실패)
      req.redirectUrl = window.location.origin + window.location.pathname;
      const resp = await PortOne.requestPayment(req);
      // resp.code 가 있으면 실패/취소
      if (resp && resp.code != null) {
        setResult(`❌ 실패/취소: ${String(resp.code)} — ${String(resp.message ?? '')}`);
      } else {
        setResult(`✅ 결제창 호출·승인 완료\npaymentId: ${String(resp?.paymentId ?? paymentId)}\n(테스트 결제는 결제대행사에서 자동 환불됩니다)`);
      }
    } catch (e) {
      setResult(`오류: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const box: React.CSSProperties = { maxWidth: 520, margin: '60px auto', padding: 28, border: '1px solid #e5e7eb', borderRadius: 16, background: '#fff', fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif" };

  return (
    <div style={{ background: '#f8fafb', minHeight: '100vh', padding: '0 16px' }}>
      <div style={box}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 9999, padding: '4px 12px', display: 'inline-block', marginBottom: 14 }}>PG 심사용 · 테스트 결제</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: '0 0 6px' }}>포트원 결제 연동 테스트</h1>
        <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7, margin: '0 0 20px' }}>
          이 페이지는 <b>PG 심사 전용</b> 테스트 결제 페이지입니다. 실제 예약·결제 흐름(계좌이체)과 무관하며, 테스트 결제는 결제대행사에서 자동 환불됩니다.
        </p>

        {!configured && (
          <div style={{ fontSize: 12.5, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', marginBottom: 18, lineHeight: 1.7 }}>
            ⚠️ 아직 <b>storeId / channelKey</b>가 설정되지 않았습니다.<br />
            PortOne 콘솔에서 <b>테스트채널</b>을 추가한 뒤, 아래 환경변수를 설정하세요:<br />
            · <code>NEXT_PUBLIC_PORTONE_STORE_ID</code><br />
            · <code>NEXT_PUBLIC_PORTONE_CHANNEL_KEY</code>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['CARD', 'EASY_PAY'] as const).map((m) => (
            <button key={m} type="button" onClick={() => setPayMethod(m)}
              style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1.5px solid ${payMethod === m ? '#16a34a' : '#e5e7eb'}`, background: payMethod === m ? '#f0fdf4' : '#fff', color: payMethod === m ? '#166534' : '#374151', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {m === 'CARD' ? '카드 (한국결제네트웍스)' : '간편결제 (카카오페이)'}
            </button>
          ))}
        </div>

        <button type="button" onClick={pay} disabled={busy || !sdkReady}
          style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: busy || !sdkReady ? '#d1d5db' : '#16a34a', color: '#fff', fontSize: 15, fontWeight: 800, cursor: busy || !sdkReady ? 'not-allowed' : 'pointer' }}>
          {busy ? '결제창 호출 중…' : !sdkReady ? 'SDK 로딩 중…' : '테스트 결제하기 (1,000원)'}
        </button>

        {result && (
          <pre style={{ marginTop: 18, fontSize: 12.5, color: '#111', background: '#f3f4f6', borderRadius: 10, padding: '14px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.6 }}>{result}</pre>
        )}

        <div style={{ marginTop: 20, fontSize: 11.5, color: '#9ca3af', lineHeight: 1.7 }}>
          store: {storeId || '(미설정)'} · channel: {channelKey ? channelKey.slice(0, 10) + '…' : '(미설정)'}
        </div>
      </div>
    </div>
  );
}
