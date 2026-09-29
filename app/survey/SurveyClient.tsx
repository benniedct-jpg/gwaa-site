'use client';

import { useState } from 'react';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const GREEN = '#12A79D';
const GREEN_DK = '#0D7E76';

export type SurveyEvent = { id: number; title: string; date: string };

const PROGRAMS = ['도그쇼', '펫캐스트라 콘서트', '반려동물 운동회', '오프리쉬 놀이터', '셀러·체험부스', '미니게임', '포토존', '아나바다', '펫티켓 후원', '무료 건강검진·동물등록'];
const SOURCES = ['인스타그램·SNS', '지인 추천', '강릉시·협회 홍보', '현장에서 우연히', '기타'];
const REGIONS = ['강릉시', '강원(강릉 외)', '수도권(서울·경기·인천)', '충청권', '경상권', '전라·제주', '그 외 지역'];
const SUBRATINGS: { key: string; label: string }[] = [
  { key: 'rating_program', label: '프로그램·공연' },
  { key: 'rating_booth', label: '부스·체험' },
  { key: 'rating_facility', label: '편의시설(주차·화장실·동선)' },
  { key: 'rating_safety', label: '안전·질서·운영' },
];

function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}
          style={{ fontSize: 30, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: n <= value ? '#F5A524' : '#d1d5db' }}>★</button>
      ))}
    </div>
  );
}

export default function SurveyClient({ event }: { event: SurveyEvent | null }) {
  const [overall, setOverall] = useState(0);
  const [programs, setPrograms] = useState<string[]>([]);
  const [sub, setSub] = useState<Record<string, number>>({});
  const [revisit, setRevisit] = useState(0);
  const [source, setSource] = useState('');
  const [region, setRegion] = useState('');
  const [petWith, setPetWith] = useState<boolean | null>(null);
  const [liked, setLiked] = useState('');
  const [improve, setImprove] = useState('');
  const [phone, setPhone] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);

  const toggleProgram = (p: string) => setPrograms((s) => s.includes(p) ? s.filter((x) => x !== p) : [...s, p]);

  const submit = async () => {
    if (!overall) { setMsg('전체 만족도를 선택해 주세요.'); return; }
    if (phone.trim() && !agree) { setMsg('경품 응모를 위해 개인정보 수집·이용 동의가 필요합니다.'); return; }
    setBusy(true); setMsg('');
    try {
      const r = await fetch('/api/survey/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event!.id, overall, programs,
          rating_program: sub.rating_program, rating_booth: sub.rating_booth,
          rating_facility: sub.rating_facility, rating_safety: sub.rating_safety,
          revisit, source, region, pet_with: petWith, liked: liked.trim(), improve: improve.trim(),
          phone: phone.trim(), privacy_agreed: agree,
        }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) { setMsg(j.error || '제출에 실패했어요. 잠시 후 다시 시도해 주세요.'); setBusy(false); return; }
      setDone(true);
    } catch { setMsg('처리 중 오류가 발생했어요.'); setBusy(false); }
  };

  const wrap: React.CSSProperties = { minHeight: '100vh', background: '#eef2f0', fontFamily: MONO, padding: '24px 16px' };
  const card: React.CSSProperties = { maxWidth: 460, margin: '0 auto', background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 6px 24px rgba(0,0,0,0.06)' };
  const q: React.CSSProperties = { fontSize: 14.5, fontWeight: 800, color: '#111', marginBottom: 10 };
  const sectionTop: React.CSSProperties = { paddingTop: 20, marginTop: 20, borderTop: '1px solid #f0f0f0' };
  const inp: React.CSSProperties = { width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 15, color: '#111', boxSizing: 'border-box', fontFamily: MONO };

  if (!event) {
    return (
      <div style={wrap}><div style={{ ...card, padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 8 }}>진행 중인 설문이 없어요</div>
        <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>현재 열려 있는 만족도 조사가 없습니다.<br />문의 033-813-0333</div>
      </div></div>
    );
  }

  if (done) {
    return (
      <div style={wrap}><div style={{ ...card, padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 46, marginBottom: 12 }}>🐾</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 10 }}>참여해 주셔서 감사합니다!</div>
        <div style={{ fontSize: 14.5, color: '#4b5563', lineHeight: 1.8 }}>소중한 의견은 다음 행사를 더 좋게 만드는 데<br />큰 힘이 됩니다. 감사합니다.</div>
        {phone.trim() && <div style={{ marginTop: 16, fontSize: 13, color: GREEN_DK, background: '#EDFAF8', border: '1px solid #BFF3EC', borderRadius: 10, padding: '12px 14px' }}>경품 응모가 완료되었어요. 당첨 시 개별 안내드립니다.</div>}
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 18 }}>문의 033-813-0333</div>
      </div></div>
    );
  }

  return (
    <div style={wrap}><div style={card}>
      <div style={{ background: GREEN_DK, padding: '26px 22px', textAlign: 'center' }}>
        <div style={{ color: '#BFF3EC', fontSize: 11, letterSpacing: '0.16em', fontWeight: 700 }}>SATISFACTION SURVEY</div>
        <div style={{ fontFamily: BEBAS, color: '#fff', fontSize: 25, letterSpacing: '0.02em', marginTop: 6, wordBreak: 'keep-all' }}>행사 만족도 조사</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12.5, marginTop: 5, wordBreak: 'keep-all' }}>{event.title}</div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11.5, marginTop: 4 }}>1분이면 충분해요. 참여해 주셔서 감사합니다 🙏</div>
      </div>
      <div style={{ padding: '22px 22px 28px' }}>

        <div style={q}>1. 오늘 행사, 전체적으로 만족하셨나요? *</div>
        <Stars value={overall} onChange={setOverall} />

        <div style={sectionTop} />
        <div style={q}>2. 참여·관람하신 프로그램 (복수 선택)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PROGRAMS.map((p) => {
            const on = programs.includes(p);
            return (
              <button key={p} type="button" onClick={() => toggleProgram(p)}
                style={{ fontSize: 13, padding: '8px 13px', borderRadius: 9999, cursor: 'pointer', fontFamily: MONO,
                  border: on ? `1.5px solid ${GREEN}` : '1.5px solid #e5e7eb', background: on ? '#EDFAF8' : '#fff', color: on ? GREEN_DK : '#4b5563', fontWeight: on ? 700 : 400 }}>{p}</button>
            );
          })}
        </div>

        <div style={sectionTop} />
        <div style={q}>3. 부문별 만족도</div>
        <div style={{ display: 'grid', gap: 12 }}>
          {SUBRATINGS.map((s) => (
            <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13.5, color: '#374151' }}>{s.label}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setSub((p) => ({ ...p, [s.key]: n }))}
                    style={{ fontSize: 22, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: n <= (sub[s.key] || 0) ? '#F5A524' : '#d1d5db' }}>★</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={sectionTop} />
        <div style={q}>4. 내년에도 참여하고 싶으신가요?</div>
        <Stars value={revisit} onChange={setRevisit} />

        <div style={sectionTop} />
        <div style={q}>5. 행사를 어떻게 알고 오셨나요?</div>
        <select value={source} onChange={(e) => setSource(e.target.value)} style={inp}>
          <option value="">선택해 주세요</option>
          {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <div style={sectionTop} />
        <div style={q}>6. 어느 지역에서 오셨나요?</div>
        <select value={region} onChange={(e) => setRegion(e.target.value)} style={inp}>
          <option value="">선택해 주세요</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <div style={sectionTop} />
        <div style={q}>7. 반려동물과 함께 오셨나요?</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['예', true], ['아니요', false]].map(([label, val]) => (
            <button key={String(label)} type="button" onClick={() => setPetWith(val as boolean)}
              style={{ flex: 1, fontSize: 14, padding: '11px', borderRadius: 10, cursor: 'pointer', fontFamily: MONO, fontWeight: 700,
                border: petWith === val ? `1.5px solid ${GREEN}` : '1.5px solid #e5e7eb', background: petWith === val ? '#EDFAF8' : '#fff', color: petWith === val ? GREEN_DK : '#4b5563' }}>{label as string}</button>
          ))}
        </div>

        <div style={sectionTop} />
        <div style={q}>8. 가장 좋았던 점</div>
        <textarea value={liked} onChange={(e) => setLiked(e.target.value)} rows={2} placeholder="기억에 남는 순간이 있다면 적어주세요 (선택)" style={{ ...inp, resize: 'vertical' }} />
        <div style={{ ...q, marginTop: 14 }}>9. 개선했으면 하는 점</div>
        <textarea value={improve} onChange={(e) => setImprove(e.target.value)} rows={2} placeholder="다음 행사를 위해 알려주세요 (선택)" style={{ ...inp, resize: 'vertical' }} />

        <div style={sectionTop} />
        <div style={q}>10. 경품 추첨 응모 (선택)</div>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, lineHeight: 1.6 }}>연락처를 남기시면 경품 추첨에 응모돼요. 당첨 시에만 개별 연락드립니다.</div>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="연락처 (010-0000-0000)" type="tel" style={inp} />
        {phone.trim() && (
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12, color: '#374151', cursor: 'pointer', marginTop: 10, lineHeight: 1.6, background: '#f9fafb', border: '1px solid #eee', borderRadius: 10, padding: '11px 13px' }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 17, height: 17, marginTop: 1, flexShrink: 0 }} />
            <span><b>[필수]</b> 경품 추첨·연락을 위해 연락처 수집·이용에 동의합니다. (당첨 안내 후 파기)</span>
          </label>
        )}

        <button disabled={busy} onClick={submit}
          style={{ width: '100%', marginTop: 22, padding: '16px', borderRadius: 12, border: 'none', background: busy ? '#d1d5db' : GREEN, color: '#fff', fontSize: 16, fontWeight: 800, cursor: busy ? 'default' : 'pointer', fontFamily: MONO }}>
          {busy ? '제출 중…' : '제출하기'}
        </button>
        {msg && <div style={{ fontSize: 12.5, color: '#dc2626', marginTop: 12, lineHeight: 1.6 }}>{msg}</div>}
        <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 16, textAlign: 'center' }}>주관 · 사단법인 강원도반려동물협회 · 033-813-0333</div>
      </div>
    </div></div>
  );
}
