'use client';

import { useState } from 'react';
import { CheckCircle2, Ticket } from 'lucide-react';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const GREEN = '#16a34a';
const GREEN_DK = '#15803d';

type B = {
  token: string; status: string; name: string; booking_type: string; booking_label: string; date_label: string;
  zone: string; site: string; headcount: number; pet_name: string; pet_breed: string;
  classes: string[]; amount: number; checked_in_at: string;
};

export default function TicketClient({ b, qrUrl }: { b: B; qrUrl: string }) {
  const [staffOpen, setStaffOpen] = useState(false);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ ok?: boolean; already?: boolean; msg?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(!!b.checked_in_at);
  const [checkinTime, setCheckinTime] = useState(b.checked_in_at || '');

  const paid = b.status === 'paid';
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
          <div style={{ color: '#bbf7d0', fontSize: 11, letterSpacing: '0.18em', fontWeight: 700 }}>PETSCOUT 2026 · E-TICKET</div>
          <div style={{ fontFamily: BEBAS, color: '#fff', fontSize: 30, letterSpacing: '0.02em', marginTop: 6 }}>입장권</div>
          <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, marginTop: 4 }}>2026. 9. 4(금) — 9. 6(일) · 강원도 고성 세계잼버리 수련장</div>
        </div>

        {/* 상태 배지 */}
        <div style={{ background: checkedIn ? '#dcfce7' : paid ? '#f0fdf4' : '#fffbeb', borderLeft: `4px solid ${checkedIn ? GREEN : paid ? GREEN : '#f59e0b'}`, padding: '12px 20px', fontSize: 13, fontWeight: 700, color: checkedIn || paid ? GREEN_DK : '#b45309', display: 'flex', alignItems: 'center', gap: 8 }}>
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
            <div style={{ padding: '28px 16px', background: '#f9fafb', borderRadius: 12, color: '#6b7280', fontSize: 13.5, lineHeight: 1.7 }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>⏳</div>
              입금이 확인되면 이 화면에 <b style={{ color: '#111' }}>입장 QR</b>이 표시됩니다.<br />이 링크를 저장해 두세요.
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
