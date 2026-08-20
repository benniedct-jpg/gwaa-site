'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const REFRESH_SEC = 45;

interface Me {
  name: string; member_no: string; status: string;
  region?: string; joined_at?: string; expires_at?: string; recurring?: boolean;
}

export default function MembershipCardPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrTs, setQrTs] = useState(() => Date.now());
  const [count, setCount] = useState(REFRESH_SEC);

  useEffect(() => {
    fetch('/api/membership/me')
      .then((r) => {
        if (r.status === 401) { router.replace('/membership'); return null; }
        return r.ok ? r.json() : null;
      })
      .then((d) => { if (d) setMe(d); })
      .finally(() => setLoading(false));
  }, [router]);

  const refreshQr = useCallback(() => { setQrTs(Date.now()); setCount(REFRESH_SEC); }, []);

  useEffect(() => {
    if (!me) return;
    const t = setInterval(() => {
      setCount((c) => {
        if (c <= 1) { setQrTs(Date.now()); return REFRESH_SEC; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [me]);

  const logout = async () => {
    await fetch('/api/membership/logout', { method: 'POST' });
    router.replace('/membership');
  };

  const [askCancel, setAskCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);
  const cancelBilling = async () => {
    setCancelling(true);
    const r = await fetch('/api/membership/cancel-billing', { method: 'POST' });
    setCancelling(false);
    if (r.ok) { setAskCancel(false); setCancelDone(true); setMe((m) => (m ? { ...m, recurring: false } : m)); }
  };

  if (loading) {
    return <Center><span style={{ fontFamily: MONO, color: '#9ca3af', fontSize: 14 }}>불러오는 중…</span></Center>;
  }
  if (!me) return null;

  return (
    <Center>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* 회원증 카드 */}
        <div style={{ background: 'linear-gradient(150deg,#16a34a,#15803d)', borderRadius: 26, padding: '26px 26px 30px', color: '#fff', boxShadow: '0 24px 60px rgba(22,163,74,0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.14em', fontWeight: 700, opacity: 0.9 }}>GWAA 메이트십</span>
            <span style={{ fontFamily: MONO, fontSize: 11, background: 'rgba(255,255,255,0.22)', padding: '4px 10px', borderRadius: 9999, fontWeight: 700 }}>
              {me.status === 'active' ? '활성 회원' : me.status}
            </span>
          </div>

          {/* QR */}
          <div style={{ background: '#fff', borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              key={qrTs}
              src={`/api/membership/qr?ts=${qrTs}`}
              alt="회원증 QR"
              width={220}
              height={220}
              style={{ width: 220, height: 220, display: 'block' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <span style={{ fontFamily: MONO, fontSize: 12, color: '#9ca3af' }}>{count}초 후 자동 갱신</span>
              <button onClick={refreshQr} style={{ fontFamily: MONO, fontSize: 12, color: '#16a34a', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>새로고침 ↻</button>
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <div style={{ fontFamily: BEBAS, fontSize: 30, letterSpacing: '0.02em', lineHeight: 1 }}>{me.name}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 14, opacity: 0.9, marginTop: 6 }}>{me.member_no}</div>
            {me.expires_at && (
              <div style={{ fontFamily: MONO, fontSize: 12, opacity: 0.8, marginTop: 4 }}>유효기간 · {me.expires_at}까지</div>
            )}
          </div>
        </div>

        <p style={{ fontFamily: MONO, fontSize: 12, color: '#9ca3af', textAlign: 'center', lineHeight: 1.6, margin: '18px 0 0' }}>
          제휴처에서 이 QR을 스캔하면 회원 확인이 완료돼요.<br />QR은 보안을 위해 45초마다 바뀝니다.
        </p>

        {/* 정기결제 해지 */}
        {me.recurring && !cancelDone && (
          <div style={{ marginTop: 20, padding: '14px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, textAlign: 'center' }}>
            {!askCancel ? (
              <>
                <p style={{ fontFamily: MONO, fontSize: 12.5, color: '#6b7280', margin: '0 0 10px', lineHeight: 1.6 }}>매월 자동결제(정기결제)가 설정되어 있어요.</p>
                <button onClick={() => setAskCancel(true)} style={{ fontFamily: MONO, fontSize: 13, color: '#dc2626', fontWeight: 700, background: 'none', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>정기결제 해지</button>
              </>
            ) : (
              <>
                <p style={{ fontFamily: MONO, fontSize: 12.5, color: '#374151', margin: '0 0 10px', lineHeight: 1.6 }}>정기결제를 해지하시겠어요?<br />남은 유효기간까지는 회원 혜택이 유지되고, 다음 결제일부터 청구되지 않아요.</p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button onClick={cancelBilling} disabled={cancelling} style={{ fontFamily: MONO, fontSize: 13, color: '#fff', fontWeight: 700, background: '#dc2626', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: cancelling ? 'default' : 'pointer', opacity: cancelling ? 0.6 : 1 }}>{cancelling ? '처리 중…' : '해지하기'}</button>
                  <button onClick={() => setAskCancel(false)} style={{ fontFamily: MONO, fontSize: 13, color: '#6b7280', background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>취소</button>
                </div>
              </>
            )}
          </div>
        )}
        {cancelDone && (
          <p style={{ fontFamily: MONO, fontSize: 12.5, color: '#16a34a', textAlign: 'center', margin: '18px 0 0', lineHeight: 1.6 }}>✓ 정기결제가 해지되었습니다.<br />다음 결제일부터 청구되지 않아요.</p>
        )}

        <button onClick={logout} style={{ display: 'block', margin: '20px auto 0', fontFamily: MONO, fontSize: 13, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          로그아웃
        </button>
      </div>
    </Center>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ minHeight: '100dvh', background: '#f8fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {children}
    </main>
  );
}
