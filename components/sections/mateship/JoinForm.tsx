'use client';

import { useState } from 'react';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import { Input } from '@/components/ui/Input';

const GREEN = '#16a34a';
// 카드 제목 글꼴 — 사이트 공통 제목 글꼴(Gothic A1)과 동일
const HEAD = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const REGIONS = ['춘천', '원주', '강릉', '속초·양양·고성', '동해·삼척', '평창·정선·영월', '그 외 강원', '강원 외 지역'];

// 메이트쉽 가입 신청 폼 — 관리자 '신청내역'(applications)에 접수된다.
// 온라인 정기결제가 중단된 동안의 가입 창구: 이름·연락처만 받고 담당자가 연락해 안내.
export default function JoinForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const digits = phone.replace(/[^0-9]/g, '');
    if (!name.trim()) { setError('이름을 입력해 주세요.'); return; }
    if (digits.length < 9 || digits.length > 11) { setError('연락받으실 전화번호를 확인해 주세요.'); return; }
    if (!agree) { setError('개인정보 수집·이용에 동의해 주세요.'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/data/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: '',
          course: '메이트쉽 가입 신청',
          region,
          message: '메이트쉽 페이지 가입 신청 폼',
          created_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error || '접수에 실패했어요. 잠시 후 다시 시도하거나 카카오채널로 남겨 주세요.');
        return;
      }
      track('mateship_apply', { region: region || '미선택' });
      setDone(true);
    } catch {
      setError('네트워크 오류로 접수하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div role="status" style={{ background: '#fff', border: '1.5px solid #bbf7d0', borderRadius: 18, padding: '36px 28px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden="true">🐾</div>
        <h3 style={{ fontFamily: HEAD, fontSize: 22, color: '#111', letterSpacing: '0.02em', marginBottom: 8 }}>신청이 접수됐어요</h3>
        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, wordBreak: 'keep-all' }}>
          담당자가 확인하고 남겨주신 번호로 연락드릴게요.
          <br />급하시면 카카오채널이나 033-813-0333으로 문의해 주세요.
        </p>
      </div>
    );
  }

  const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 6 };

  return (
    <form onSubmit={submit} noValidate style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 18, padding: '28px 24px', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
      <h3 style={{ fontFamily: HEAD, fontSize: 20, color: '#111', letterSpacing: '0.02em', marginBottom: 4 }}>30초 가입 신청</h3>
      <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 20 }}>이름과 연락처만 남기면 담당자가 연락드려요. 결제는 안내받은 뒤에 진행돼요.</p>

      <div style={{ marginBottom: 14 }}>
        <label htmlFor="join-name" style={label}>이름</label>
        <Input id="join-name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" maxLength={40} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label htmlFor="join-phone" style={label}>전화번호</label>
        <Input id="join-phone" name="tel" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" maxLength={20} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="join-region" style={label}>사는 지역 <span style={{ fontWeight: 500, color: '#6b7280' }}>(선택)</span></label>
        <select
          id="join-region" value={region} onChange={(e) => setRegion(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 15, color: region ? '#111' : '#6b7280', background: '#fafafa', fontFamily: 'inherit' }}
        >
          <option value="">선택 안 함</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 16, cursor: 'pointer' }}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, accentColor: GREEN, flexShrink: 0 }} />
        <span>
          [필수] 가입 상담을 위한 개인정보(이름·전화번호·지역) 수집·이용에 동의합니다.{' '}
          <Link href="/privacy" target="_blank" style={{ color: GREEN, fontWeight: 700 }}>자세히</Link>
        </span>
      </label>

      {error && <p role="alert" style={{ fontSize: 13, color: '#dc2626', marginBottom: 12 }}>{error}</p>}

      <button
        type="submit" disabled={busy}
        style={{
          width: '100%', padding: '15px 20px', borderRadius: 12, border: 'none',
          background: busy ? '#86efac' : GREEN, color: '#fff', fontSize: 15, fontWeight: 800,
          cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit',
        }}
      >
        {busy ? '접수 중…' : '가입 신청하기'}
      </button>
    </form>
  );
}
