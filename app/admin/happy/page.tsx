'use client';
import { useEffect, useState, useCallback } from 'react';

type App = {
  id: number; created_at: string; guardian_name: string; phone: string; wonju_resident: boolean;
  dog_name: string; breed: string; dog_age: string; dog_sex: string; dog_size: string; vaccinated: string;
  behaviors: string; behavior_detail: string; motivation: string; photo_agreed: boolean; selected: boolean; status: string;
};

export default function HappyAdmin() {
  const [items, setItems] = useState<App[]>([]);
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/happy/apply', { cache: 'no-store' });
    if (r.status === 401) { setErr('관리자 로그인이 필요합니다. /admin/login 에서 로그인 후 다시 열어주세요.'); setLoading(false); return; }
    const j = await r.json(); setItems(j.items || []); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = async (id: number, selected: boolean) => {
    setItems((s) => s.map((x) => x.id === id ? { ...x, selected } : x));
    await fetch('/api/happy/apply', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, selected }) });
  };
  const csv = () => {
    const head = ['신청일', '선정', '보호자', '연락처', '원주거주', '반려견', '견종', '나이', '성별중성화', '크기', '접종', '문제행동', '상세', '동기', '촬영동의'];
    const rows = items.map((a) => [a.created_at?.slice(0, 10), a.selected ? 'O' : '', a.guardian_name, a.phone, a.wonju_resident ? 'O' : '', a.dog_name, a.breed, a.dog_age, a.dog_sex, a.dog_size, a.vaccinated, a.behaviors, a.behavior_detail, a.motivation, a.photo_agreed ? 'O' : '']);
    const body = [head, ...rows].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + body], { type: 'text/csv' })); a.download = 'happy2_applications.csv'; a.click();
  };

  const selCount = items.filter((x) => x.selected).length;
  const td: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid #eee', fontSize: 13, verticalAlign: 'top' };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px 80px', fontFamily: 'system-ui,sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>햅삐 2기 신청 · 심사</h1>
      <p style={{ color: '#6b7280', margin: '6px 0 14px' }}>신청 {items.length}명 · 선정 <b style={{ color: '#12A79D' }}>{selCount}/15</b>
        <button onClick={csv} style={{ marginLeft: 14, padding: '6px 14px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 13 }}>CSV 내보내기</button>
        <button onClick={load} style={{ marginLeft: 8, padding: '6px 14px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 13 }}>새로고침</button>
      </p>
      {err && <div style={{ color: '#dc2626', fontWeight: 600 }}>{err}</div>}
      {loading ? <div>불러오는 중…</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead><tr style={{ background: '#EDFAF8', textAlign: 'left' }}>
              {['선정', '보호자', '연락처', '원주', '반려견', '크기/접종', '문제행동', '상세·동기'].map((h) => <th key={h} style={{ padding: '9px 10px', fontSize: 12.5, color: '#0D7E76' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} style={{ background: a.selected ? '#f6fef9' : '#fff' }}>
                  <td style={td}><input type="checkbox" checked={a.selected} onChange={(e) => toggle(a.id, e.target.checked)} style={{ width: 20, height: 20, accentColor: '#12A79D' }} /></td>
                  <td style={td}>{a.guardian_name}</td>
                  <td style={td}>{a.phone}</td>
                  <td style={td}>{a.wonju_resident ? 'O' : '-'}</td>
                  <td style={td}>{a.dog_name}<br /><span style={{ color: '#6b7280' }}>{a.breed} {a.dog_age} {a.dog_sex}</span></td>
                  <td style={td}>{a.dog_size} / {a.vaccinated}</td>
                  <td style={td}>{a.behaviors}</td>
                  <td style={{ ...td, maxWidth: 320, whiteSpace: 'pre-wrap' }}>{a.behavior_detail}{a.motivation ? `\n· ${a.motivation}` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
