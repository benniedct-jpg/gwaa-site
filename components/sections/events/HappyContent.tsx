'use client';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

const G = '#12A79D', GD = '#0D7E76', MUT = '#6b7280', LINE = '#e5e7eb';
const BEHAVIORS = ['짖음', '입질·공격성', '리드줄 당김', '분리불안', '사회성 부족', '기타'];

export default function HappyContent() {
  const isMobile = useIsMobile();
  const [f, setF] = useState({
    guardian_name: '', phone: '', wonju_resident: false,
    dog_name: '', breed: '', dog_age: '', dog_sex: '', dog_size: '', vaccinated: '',
    behavior_detail: '', motivation: '',
    attend_ok: false, privacy_agreed: false, photo_agreed: false, safety_agreed: false,
  });
  const [beh, setBeh] = useState<string[]>([]);
  const [done, setDone] = useState<null | 'ok' | 'already'>(null);
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const up = (k: string, v: unknown) => setF((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    setErr('');
    if (!f.guardian_name.trim() || !f.phone.trim()) return setErr('보호자 성함과 연락처를 입력해 주세요.');
    if (!f.attend_ok) return setErr('4주 전 회차 참여 가능 여부에 체크해 주세요.');
    if (!f.privacy_agreed) return setErr('개인정보 수집·이용 동의가 필요합니다.');
    if (!f.safety_agreed) return setErr('안전·책임 관련 안내 동의가 필요합니다.');
    setBusy(true);
    try {
      const r = await fetch('/api/happy/apply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, behaviors: beh.join(', ') }),
      });
      const j = await r.json();
      if (!r.ok) { setErr(j.error || '신청 중 오류가 발생했어요.'); setBusy(false); return; }
      setDone(j.already ? 'already' : 'ok');
    } catch { setErr('네트워크 오류가 발생했어요. 다시 시도해 주세요.'); }
    setBusy(false);
  };

  const wrap: React.CSSProperties = { maxWidth: 720, margin: '0 auto', padding: isMobile ? '8px 18px 56px' : '8px 24px 72px' };
  const label: React.CSSProperties = { display: 'block', fontSize: 13.5, fontWeight: 700, color: '#111', margin: '18px 0 7px' };
  const input: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${LINE}`, fontSize: 15, outline: 'none', background: '#fff' };
  const row2: React.CSSProperties = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 };
  const chip = (on: boolean): React.CSSProperties => ({ padding: '9px 15px', borderRadius: 999, border: `1.5px solid ${on ? G : '#d1d5db'}`, background: on ? '#EDFAF8' : '#fff', color: on ? GD : '#374151', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' });

  if (done) return (
    <div style={{ ...wrap, textAlign: 'center', paddingTop: 40 }}>
      <div style={{ fontSize: 46 }}>🐾</div>
      <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: '10px 0' }}>{done === 'already' ? '이미 신청이 접수되어 있어요' : '신청이 접수되었어요!'}</h3>
      <p style={{ color: MUT, lineHeight: 1.7 }}>협회 심사 후 <b>15명</b>을 선정해 <b>10월 2일(금)</b> 개별 연락드립니다.<br />신청해 주셔서 감사합니다.</p>
    </div>
  );

  return (
    <div style={wrap}>
      {/* 안내 */}
      <div style={{ background: '#EDFAF8', border: '1px solid #D6F5F1', borderRadius: 14, padding: isMobile ? 16 : 20, marginBottom: 8 }}>
        <div style={{ fontWeight: 800, color: GD, fontSize: 15, marginBottom: 8 }}>2026 원주시 반려견 산책교육 「햅삐」 2기 모집</div>
        <ul style={{ margin: 0, paddingLeft: 18, color: '#374151', fontSize: 13.5, lineHeight: 1.85 }}>
          <li>대상: <b>문제행동이 있는 반려견</b>과 보호자 (원주시 거주)</li>
          <li>교육: 2026.10.4~10.25 <b>매주 일요일 15:00~17:00</b> (4주 4회)</li>
          <li>모집: ~10.1 · 선정: <b>협회 심사 15명</b> · 결과발표: <b>10.2(금) 개별 연락</b></li>
          <li>참가비 무료 · 4회 모두 참여 가능한 분을 우선합니다</li>
        </ul>
      </div>

      <label style={label}>보호자 성함 *</label>
      <input style={input} value={f.guardian_name} onChange={(e) => up('guardian_name', e.target.value)} placeholder="홍길동" />
      <div style={row2}>
        <div><label style={label}>연락처 *</label><input style={input} value={f.phone} onChange={(e) => up('phone', e.target.value)} placeholder="010-0000-0000" inputMode="tel" /></div>
        <div><label style={label}>원주시 거주</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {[['예', true], ['아니오', false]].map(([t, v]) => <span key={String(t)} onClick={() => up('wonju_resident', v)} style={chip(f.wonju_resident === v)}>{t}</span>)}
          </div>
        </div>
      </div>

      <div style={row2}>
        <div><label style={label}>반려견 이름</label><input style={input} value={f.dog_name} onChange={(e) => up('dog_name', e.target.value)} /></div>
        <div><label style={label}>견종</label><input style={input} value={f.breed} onChange={(e) => up('breed', e.target.value)} /></div>
      </div>
      <div style={row2}>
        <div><label style={label}>나이</label><input style={input} value={f.dog_age} onChange={(e) => up('dog_age', e.target.value)} placeholder="예: 3살" /></div>
        <div><label style={label}>성별 · 중성화</label><input style={input} value={f.dog_sex} onChange={(e) => up('dog_sex', e.target.value)} placeholder="예: 수컷 / 중성화 O" /></div>
      </div>
      <div style={row2}>
        <div><label style={label}>크기</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            {['소형', '중형', '대형'].map((t) => <span key={t} onClick={() => up('dog_size', t)} style={chip(f.dog_size === t)}>{t}</span>)}
          </div>
        </div>
        <div><label style={label}>예방접종(광견병 등)</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            {['완료', '일부', '미접종'].map((t) => <span key={t} onClick={() => up('vaccinated', t)} style={chip(f.vaccinated === t)}>{t}</span>)}
          </div>
        </div>
      </div>

      <label style={label}>주요 문제행동 (복수 선택)</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {BEHAVIORS.map((t) => <span key={t} onClick={() => setBeh((s) => s.includes(t) ? s.filter((x) => x !== t) : [...s, t])} style={chip(beh.includes(t))}>{t}</span>)}
      </div>
      <label style={label}>문제행동 상세 (심사에 반영돼요) *</label>
      <textarea style={{ ...input, minHeight: 90, resize: 'vertical' }} value={f.behavior_detail} onChange={(e) => up('behavior_detail', e.target.value)} placeholder="어떤 상황에서 어떤 행동을 하는지 구체적으로 적어주세요." />
      <label style={label}>신청 동기 · 목표</label>
      <textarea style={{ ...input, minHeight: 70, resize: 'vertical' }} value={f.motivation} onChange={(e) => up('motivation', e.target.value)} />

      {/* 동의 */}
      <div style={{ marginTop: 22, borderTop: `1px solid ${LINE}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {([
          ['attend_ok', <>4주 전 회차(10/4·11·18·25, 일 15~17시) <b>참여 가능</b>합니다 *</>, null],
          ['privacy_agreed', <>[필수] <b>개인정보 수집·이용 동의</b></>, '수집항목: 성함·연락처·반려견 정보·신청내용 / 목적: 선정·안내 / 보유기간: 운영 종료 후 3개월 뒤 파기 / 원주시에 명단이 제공될 수 있습니다. 동의를 거부하실 수 있으나, 거부 시 신청이 제한됩니다.'],
          ['safety_agreed', <>[필수] <b>안전·책임 안내 동의</b></>, '반려견의 건강·접종·성향을 사실대로 고지하며, 심각한 공격성이 확인되면 안전을 위해 참여가 제한될 수 있음을 이해합니다.'],
          ['photo_agreed', <>[선택] 교육 중 <b>사진·영상 촬영·홍보 활용</b>에 동의합니다</>, null],
        ] as [string, React.ReactNode, string | null][]).map(([k, node, detail]) => (
          <div key={k}>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5, color: '#374151', cursor: 'pointer' }}>
              <input type="checkbox" checked={(f as never)[k]} onChange={(e) => up(k, e.target.checked)} style={{ width: 18, height: 18, accentColor: G, flexShrink: 0 }} />
              <span>{node}</span>
            </label>
            {detail && <details style={{ marginLeft: 28, marginTop: 4 }}><summary style={{ cursor: 'pointer', color: G, fontSize: 12 }}>자세히 보기</summary><p style={{ color: MUT, fontSize: 12, lineHeight: 1.65, margin: '6px 0 0' }}>{detail}</p></details>}
          </div>
        ))}
      </div>

      {err && <div style={{ color: '#dc2626', fontSize: 13.5, marginTop: 14, fontWeight: 600 }}>{err}</div>}
      <button onClick={submit} disabled={busy} style={{ width: '100%', marginTop: 18, padding: '15px', borderRadius: 12, border: 'none', background: busy ? '#9ca3af' : G, color: '#fff', fontSize: 16, fontWeight: 800, cursor: busy ? 'default' : 'pointer' }}>
        {busy ? '접수 중…' : '햅삐 2기 신청하기'}
      </button>
      <p style={{ fontSize: 11.5, color: MUT, textAlign: 'center', marginTop: 10 }}>협회 심사 후 15명 선정 · 결과는 10월 2일(금) 개별 연락드립니다</p>
    </div>
  );
}
