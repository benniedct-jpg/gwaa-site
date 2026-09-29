'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Ticket } from 'lucide-react';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const GREEN = '#12A79D';
const GREEN_DK = '#0D7E76';

// 카드 즉시결제(PortOne V2) — 채널키가 설정돼 있을 때만 노출 (BookingFlow와 동일 방식)
const PORTONE_STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || '';
const PORTONE_CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || '';
const CARD_ENABLED = !!(PORTONE_STORE_ID && PORTONE_CHANNEL_KEY);
type PortOneSDK = { requestPayment: (o: Record<string, unknown>) => Promise<{ code?: string | null; message?: string; paymentId?: string }> };

type B = {
  token: string; status: string; name: string; booking_type: string; booking_label: string; date_label: string;
  zone: string; site: string; headcount: number; pet_name: string; pet_breed: string;
  classes: string[]; amount: number; checked_in_at: string;
  order_id: string; phone: string; email: string;
};

export default function TicketClient({ b, qrUrl }: { b: B; qrUrl: string }) {
  const [staffOpen, setStaffOpen] = useState(false);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ ok?: boolean; already?: boolean; msg?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(!!b.checked_in_at);
  const [checkinTime, setCheckinTime] = useState(b.checked_in_at || '');
  const [paying, setPaying] = useState(false);
  const [payMsg, setPayMsg] = useState('');
  const [cls, setCls] = useState<{ key: string; label: string; name: string; slot: string; emoji: string; price: number; closed: boolean; passed: boolean }[]>([]);
  const [selKeys, setSelKeys] = useState<string[]>([]);
  const [classBuying, setClassBuying] = useState(false);
  const [classMsg, setClassMsg] = useState('');

  const paid = b.status === 'paid';
  const toggleClass = (k: string) => setSelKeys((s) => s.includes(k) ? s.filter((x) => x !== k) : [...s, k]);
  const selTotal = selKeys.reduce((s, k) => s + (cls.find((c) => c.key === k)?.price || 0), 0);

  // 결제 승인 확인 → 성공 시 새로고침(서버가 paid 반영 → QR 활성화)
  const finishConfirm = async (orderId: string, paymentId: string) => {
    try {
      const conf = await fetch('/api/bookings/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: orderId, paymentId }) });
      const cj = await conf.json().catch(() => ({}));
      sessionStorage.removeItem('gwaa_ticket_pay');
      if (!conf.ok || !cj.ok) { setPayMsg(cj.error || '결제 확인에 실패했어요. 잠시 후 다시 시도하거나 033-813-0333로 문의해 주세요.'); setPaying(false); return; }
      window.location.reload();
    } catch {
      sessionStorage.removeItem('gwaa_ticket_pay');
      setPayMsg('결제 확인 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'); setPaying(false);
    }
  };

  // 카드 즉시결제 — 미입금 예약을 이 페이지에서 바로 확정
  const payCard = async () => {
    if (!CARD_ENABLED) { setPayMsg('카드결제 준비 중입니다. 계좌이체로 진행해 주세요.'); return; }
    const PortOne = (window as unknown as { PortOne?: PortOneSDK }).PortOne;
    if (!PortOne) { setPayMsg('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.'); return; }
    const amount = Number(b.amount) || 0;
    if (amount <= 0) { setPayMsg('결제 금액을 확인할 수 없습니다. 033-813-0333로 문의해 주세요.'); return; }
    const orderId = String(b.order_id || '');
    if (!orderId) { setPayMsg('예약 정보를 확인할 수 없습니다. 033-813-0333로 문의해 주세요.'); return; }
    const paymentId = orderId.replace(/[^a-zA-Z0-9]/g, ''); // PortOne V2 paymentId는 영숫자만
    setPayMsg(''); setPaying(true);
    sessionStorage.setItem('gwaa_ticket_pay', JSON.stringify({ orderId, paymentId })); // 모바일 리다이렉트 복귀 대비
    try {
      const resp = await PortOne.requestPayment({
        storeId: PORTONE_STORE_ID, channelKey: PORTONE_CHANNEL_KEY,
        paymentId, orderName: `펫스카웃 ${b.booking_label || '예약'}`,
        totalAmount: amount, currency: 'CURRENCY_KRW', payMethod: 'CARD',
        customer: { fullName: b.name || '', phoneNumber: b.phone || '', email: b.email || '' },
        redirectUrl: window.location.origin + window.location.pathname,
      });
      if (resp.code != null) { // 데스크톱 팝업: 실패/취소
        sessionStorage.removeItem('gwaa_ticket_pay');
        setPayMsg(`결제가 취소되었거나 실패했어요. [${resp.code}] ${resp.message ?? ''} — 다시 시도하거나 계좌이체로 진행하실 수 있어요.`);
        setPaying(false); return;
      }
      await finishConfirm(orderId, paymentId);
    } catch {
      sessionStorage.removeItem('gwaa_ticket_pay');
      setPayMsg('결제 처리 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'); setPaying(false);
    }
  };

  // SDK 로드 + 결제창 리다이렉트 복귀 처리(예약결제/클래스결제 공통)
  useEffect(() => {
    if (!CARD_ENABLED) return;
    if (!document.getElementById('portone-sdk')) {
      const s = document.createElement('script');
      s.id = 'portone-sdk'; s.src = 'https://cdn.portone.io/v2/browser-sdk.js'; s.async = true;
      document.body.appendChild(s);
    }
    const failCode = new URLSearchParams(window.location.search).get('code');
    // ① 클래스 추가결제 복귀
    const craw = sessionStorage.getItem('gwaa_class_pay');
    if (craw) {
      sessionStorage.removeItem('gwaa_class_pay');
      try { window.history.replaceState({}, '', new URL(window.location.href).pathname); } catch { /* noop */ }
      try {
        const { keys, paymentId } = JSON.parse(craw) as { keys: string[]; paymentId: string };
        if (failCode) setClassMsg('결제가 취소되었거나 실패했어요.');
        else if (keys?.length && paymentId) {
          setClassBuying(true);
          fetch('/api/classes/purchase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: b.token, keys, paymentId }) })
            .then((r) => r.json()).then((j) => { if (j.ok) window.location.reload(); else { setClassMsg(j.error || '클래스 추가에 실패했어요. (환불 필요 시 033-813-0333)'); setClassBuying(false); } })
            .catch(() => { setClassMsg('클래스 추가 확인 중 오류가 발생했어요.'); setClassBuying(false); });
        }
      } catch { /* noop */ }
      return;
    }
    // ② 미입금 예약결제 복귀
    if (paid) return;
    const raw = sessionStorage.getItem('gwaa_ticket_pay');
    if (raw) {
      try { window.history.replaceState({}, '', new URL(window.location.href).pathname); } catch { /* noop */ }
      try {
        const { orderId, paymentId } = JSON.parse(raw) as { orderId: string; paymentId: string };
        if (failCode) { sessionStorage.removeItem('gwaa_ticket_pay'); setPayMsg('결제가 취소되었거나 실패했어요. 다시 시도하거나 계좌이체로 진행하실 수 있어요.'); }
        else if (orderId && paymentId) { setPaying(true); finishConfirm(orderId, paymentId); }
      } catch { sessionStorage.removeItem('gwaa_ticket_pay'); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 입금완료(입장객) → 클래스 정원 현황 로드
  useEffect(() => {
    if (!paid) return;
    fetch('/api/classes/capacity').then((r) => r.json()).then((d) => setCls(d.classes || [])).catch(() => {});
  }, [paid]);

  // 웰니스 클래스 카드 추가결제
  const payClasses = async () => {
    if (!selKeys.length) return;
    if (!CARD_ENABLED) { setClassMsg('카드결제 준비 중입니다.'); return; }
    const PortOne = (window as unknown as { PortOne?: PortOneSDK }).PortOne;
    if (!PortOne) { setClassMsg('결제 모듈을 불러오는 중이에요. 잠시 후 다시 눌러주세요.'); return; }
    const keys = [...selKeys];
    const total = keys.reduce((s, k) => s + (cls.find((c) => c.key === k)?.price || 0), 0);
    const paymentId = `cls${b.token.slice(0, 10)}${Date.now()}`.replace(/[^a-zA-Z0-9]/g, '');
    setClassBuying(true); setClassMsg('');
    sessionStorage.setItem('gwaa_class_pay', JSON.stringify({ keys, paymentId }));
    try {
      const resp = await PortOne.requestPayment({
        storeId: PORTONE_STORE_ID, channelKey: PORTONE_CHANNEL_KEY,
        paymentId, orderName: `펫스카웃 웰니스 클래스 ${keys.length}건`,
        totalAmount: total, currency: 'CURRENCY_KRW', payMethod: 'CARD',
        customer: { fullName: b.name || '', phoneNumber: b.phone || '', email: b.email || '' },
        redirectUrl: window.location.origin + window.location.pathname,
      });
      if (resp.code != null) { sessionStorage.removeItem('gwaa_class_pay'); setClassMsg(`결제가 취소되었거나 실패했어요. [${resp.code}] ${resp.message ?? ''}`); setClassBuying(false); return; }
      const r = await fetch('/api/classes/purchase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: b.token, keys, paymentId }) });
      const j = await r.json();
      sessionStorage.removeItem('gwaa_class_pay');
      if (!r.ok || !j.ok) { setClassMsg(j.error || '클래스 추가에 실패했어요. (환불 필요 시 033-813-0333)'); setClassBuying(false); return; }
      window.location.reload();
    } catch { sessionStorage.removeItem('gwaa_class_pay'); setClassMsg('결제 처리 중 오류가 발생했어요.'); setClassBuying(false); }
  };
  const isDay = b.booking_type === 'day';
  const typeName = isDay ? '당일권' : (b.booking_label || '2박 3일');
  const siteTxt = b.site && b.site.includes('-') ? b.site.split('-')[1] : b.site;
  const place = isDay ? '축제 관람권 (사이트 없음)' : `${b.zone} 구역 · ${siteTxt} 사이트`;
  const fmtTime = (iso: string) => { if (!iso) return ''; const d = new Date(iso); return d.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); };

  const doCheckin = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/tickets/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: b.token, code }) });
      const j = await res.json();
      if (!res.ok) { setResult({ ok: false, msg: j.error || '체크인 실패' }); }
      else { setResult({ ok: true, already: j.already }); setCheckedIn(true); if (j.checked_in_at) setCheckinTime(String(j.checked_in_at)); }
    } catch { setResult({ ok: false, msg: '네트워크 오류' }); }
    finally { setLoading(false); }
  };

  const row = (l: string, v: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0', fontSize: 14 }}>
      <span style={{ color: '#6b7280' }}>{l}</span><span style={{ fontWeight: 700, color: '#111' }}>{v}</span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#eef2f0', fontFamily: MONO, padding: '24px 16px' }}>
      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ background: GREEN_DK, borderRadius: '18px 18px 0 0', padding: '26px 24px', textAlign: 'center' }}>
          <div style={{ color: '#BFF3EC', fontSize: 11, letterSpacing: '0.18em', fontWeight: 700 }}>PETSCOUT 2026 · E-TICKET</div>
          <div style={{ fontFamily: BEBAS, color: '#fff', fontSize: 30, letterSpacing: '0.02em', marginTop: 6 }}>입장권</div>
          <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, marginTop: 4 }}>2026. 9. 4(금) — 9. 6(일) · 강원도 고성 세계잼버리 수련장</div>
        </div>

        {/* 상태 배지 */}
        <div style={{ background: checkedIn ? '#D6F5F1' : paid ? '#EDFAF8' : '#fffbeb', borderLeft: `4px solid ${checkedIn ? GREEN : paid ? GREEN : '#F5A524'}`, padding: '12px 20px', fontSize: 13, fontWeight: 700, color: checkedIn || paid ? GREEN_DK : '#C9560F', display: 'flex', alignItems: 'center', gap: 8 }}>
          {checkedIn
            ? <><CheckCircle2 size={17} strokeWidth={2} /> 입장 완료{checkinTime ? ` · ${fmtTime(checkinTime)} 도착` : ''}</>
            : paid
              ? <><Ticket size={17} strokeWidth={2} /> 입금 확정 · 입장 대기</>
              : <><Ticket size={17} strokeWidth={2} /> 입금 확인 대기 중 — 입금 후 QR이 활성화됩니다</>}
        </div>

        {/* 티켓 종류 · 인원 · 위치 강조 박스 */}
        <div style={{ background: GREEN, color: '#fff', padding: '18px 20px', display: 'flex', gap: 14, justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.8, letterSpacing: '0.06em' }}>티켓 종류</div>
            <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2, marginTop: 4 }}>{typeName}</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.25)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.8, letterSpacing: '0.06em' }}>입장 인원</div>
            <div style={{ fontFamily: BEBAS, fontSize: 26, lineHeight: 1.1, marginTop: 2 }}>{b.headcount}명</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.25)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.8, letterSpacing: '0.06em' }}>안내 위치</div>
            <div style={{ fontFamily: BEBAS, fontSize: 26, lineHeight: 1.1, marginTop: 2 }}>{isDay ? '관람권' : `${b.zone}-${siteTxt}`}</div>
          </div>
        </div>

        {/* QR (입금 확정 시에만 활성) */}
        <div style={{ background: '#fff', padding: '26px 24px', textAlign: 'center' }}>
          {paid ? (
            <>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>현장에서 스텝에게 이 QR을 보여주세요</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="입장 QR" width={200} height={200} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 8, background: '#fff' }} />
            </>
          ) : (
            <div>
              {CARD_ENABLED && b.amount > 0 && (
                <div style={{ background: '#EDFAF8', border: `1px solid #BFF3EC`, borderRadius: 12, padding: '18px 18px 16px', marginBottom: 12, textAlign: 'left' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 4 }}>아직 결제 전이에요 🐾</div>
                  <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, marginBottom: 14 }}>카드로 지금 결제하면 <b style={{ color: GREEN_DK }}>바로 예약이 확정</b>되고 입장 QR이 활성화돼요.</div>
                  <button onClick={payCard} disabled={paying} style={{ width: '100%', padding: '15px', borderRadius: 12, border: 'none', background: paying ? '#8FEEE3' : GREEN, color: '#fff', fontSize: 15.5, fontWeight: 800, cursor: paying ? 'default' : 'pointer', fontFamily: MONO }}>
                    {paying ? '결제 처리 중…' : `💳 지금 카드로 결제하고 확정하기 (${b.amount.toLocaleString()}원)`}
                  </button>
                  {payMsg && <div style={{ color: '#dc2626', fontSize: 12.5, marginTop: 10, lineHeight: 1.6 }}>{payMsg}</div>}
                </div>
              )}
              <div style={{ padding: '18px 16px', background: '#f9fafb', borderRadius: 12, color: '#6b7280', fontSize: 13, lineHeight: 1.8, textAlign: 'center' }}>
                {b.amount > 0 && (
                  <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #eee' }}>
                    계좌이체를 원하시면 아래로 입금해 주세요<br />
                    <b style={{ color: '#111', fontSize: 14 }}>NH농협 301-0318-0756-61</b><br />
                    예금주 사단법인 강원도반려동물협회 · <b style={{ color: GREEN_DK }}>{b.amount.toLocaleString()}원</b><br />
                    입금자명 <b style={{ color: '#111' }}>{b.name}</b>님
                  </div>
                )}
                입금이 확인되면 이 화면에 <b style={{ color: '#111' }}>입장 QR</b>이 표시됩니다. 이 링크를 저장해 두세요.
              </div>
            </div>
          )}
        </div>

        {/* 상세 */}
        <div style={{ background: '#fff', padding: '20px 24px' }}>
          {row('예약자', b.name)}
          {row('일정', `${b.booking_label} · ${b.date_label}`)}
          {row('위치', place)}
          {row('반려견', b.pet_name ? `${b.pet_name}${b.pet_breed ? ` (${b.pet_breed})` : ''}` : '-')}
          {b.classes.length > 0 && (
            <div style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 6 }}>웰니스 클래스 ({b.classes.length})</div>
              {b.classes.map((c) => <div key={c} style={{ fontSize: 13.5, fontWeight: 700, color: '#111', padding: '2px 0' }}>· {c}</div>)}
            </div>
          )}
          {checkedIn && checkinTime && row('입장 시각', fmtTime(checkinTime))}
        </div>

        {/* 웰니스 클래스 추가 구매 (입금완료 입장객) */}
        {paid && CARD_ENABLED && (
          <div style={{ background: '#fff', padding: '20px 24px', borderTop: '8px solid #eef2f0' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 4 }}>🌿 웰니스 클래스 추가</div>
            <div style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 14, lineHeight: 1.65 }}>원하는 클래스를 골라 카드로 바로 추가하세요. <b>클래스당 25,000원</b> (아로마 10,000원) · 타임별 정원 20명 · <b>타임 시작 전까지만 취소</b> 가능합니다.</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {cls.map((c) => {
                const on = selKeys.includes(c.key);
                const disabled = c.closed || classBuying;
                return (
                  <button key={c.key} disabled={disabled} onClick={() => toggleClass(c.key)}
                    style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, cursor: disabled ? 'default' : 'pointer', fontFamily: MONO,
                      border: on ? `2px solid ${GREEN}` : '1.5px solid #e5e7eb', background: c.closed ? '#f9fafb' : on ? '#EDFAF8' : '#fff', opacity: c.closed ? 0.55 : 1 }}>
                    <span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{c.emoji} {c.name}</span>
                      <span style={{ display: 'block', fontSize: 12, color: '#6b7280', marginTop: 2 }}>{c.slot} · {c.price.toLocaleString()}원</span>
                    </span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap', color: c.closed ? '#9ca3af' : GREEN_DK }}>
                      {c.passed ? '지난 타임' : c.closed ? '마감' : (on ? '선택됨 ✓' : '신청 가능')}
                    </span>
                  </button>
                );
              })}
            </div>
            <button disabled={!selKeys.length || classBuying} onClick={payClasses}
              style={{ width: '100%', marginTop: 14, padding: '15px', borderRadius: 12, border: 'none', background: (!selKeys.length || classBuying) ? '#d1d5db' : GREEN, color: '#fff', fontSize: 15.5, fontWeight: 800, cursor: (!selKeys.length || classBuying) ? 'default' : 'pointer', fontFamily: MONO }}>
              {classBuying ? '결제 처리 중…' : selKeys.length ? `💳 카드로 결제 (${selTotal.toLocaleString()}원)` : '클래스를 선택하세요'}
            </button>
            {classMsg && <div style={{ fontSize: 12.5, color: '#dc2626', marginTop: 10, lineHeight: 1.6 }}>{classMsg}</div>}
          </div>
        )}

        {/* 스텝 체크인 */}
        <div style={{ background: '#fff', borderRadius: '0 0 18px 18px', padding: '18px 24px 24px', borderTop: '1px solid #f0f0f0' }}>
          {!staffOpen ? (
            <button onClick={() => setStaffOpen(true)} style={{ width: '100%', padding: '12px', borderRadius: 9999, border: `1.5px solid ${GREEN}`, background: '#fff', color: GREEN_DK, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: MONO }}>
              현장 스텝 · 입장 확인 →
            </button>
          ) : (
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>스텝 코드를 입력하면 입장 처리됩니다.</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="스텝 코드" type="password"
                  style={{ flex: 1, padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontFamily: MONO }} />
                <button onClick={doCheckin} disabled={loading || !code} style={{ padding: '0 20px', borderRadius: 8, border: 'none', background: loading || !code ? '#d1d5db' : GREEN, color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading || !code ? 'not-allowed' : 'pointer', fontFamily: MONO }}>
                  {loading ? '처리중' : '입장 확인'}
                </button>
              </div>
              {result && (
                <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: result.ok ? GREEN_DK : '#dc2626' }}>
                  {result.ok
                    ? (result.already
                        ? `이미 입장 처리됨${checkinTime ? ` (${fmtTime(checkinTime)} 도착)` : ''}`
                        : `✓ 입장 확인 완료 — ${typeName} · ${b.headcount}명 · ${isDay ? '관람권' : `${b.zone}-${siteTxt}`}${b.classes.length ? ` · 클래스 ${b.classes.length}개` : ''}${checkinTime ? ` · ${fmtTime(checkinTime)} 도착` : ''}`)
                    : result.msg}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 18 }}>강원도반려동물협회 · 033-813-0333</div>
      </div>
    </div>
  );
}
