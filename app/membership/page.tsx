'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const KAKAO_ERR: Record<string, string> = {
  notmember: '카카오에 등록된 전화번호로 회원 정보를 찾을 수 없어요. 가입·회비 납부 여부를 협회로 확인해 주세요.',
  nophone: '전화번호 제공에 동의해야 회원 확인이 가능해요. 다시 시도해 주세요.',
  inactive: '아직 활성 회원이 아니에요. 회비 납부·승인 여부를 협회로 확인해 주세요.',
  kakao: '카카오 로그인 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.',
  config: '카카오 로그인 준비 중이에요. 잠시 후 다시 시도해 주세요.',
};

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";

const field: React.CSSProperties = {
  width: '100%', padding: '13px 15px', borderRadius: 12, border: '1.5px solid #e5e7eb',
  fontSize: 15, color: '#111', background: '#fafafa', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};

export default function MembershipLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [kakaoErr, setKakaoErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    const e = new URLSearchParams(window.location.search).get('error');
    if (e && KAKAO_ERR[e]) setKakaoErr(KAKAO_ERR[e]);
  }, []);

  const kakaoLogin = () => {
    if (!agree) { setKakaoErr('이용약관 및 개인정보 수집·이용에 동의해 주세요.'); return; }
    window.location.href = '/api/membership/kakao/start';
  };

  const submit = async () => {
    setErr('');
    if (!agree) { setErr('이용약관 및 개인정보 수집·이용에 동의해 주세요.'); return; }
    if (!phone.trim()) { setErr('전화번호를 입력해주세요.'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/membership/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), name: name.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data.error || '로그인에 실패했어요.'); return; }
      router.replace('/membership/card');
    } catch {
      setErr('로그인에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: '#f8fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: MONO }}>
      <div style={{ width: '100%', maxWidth: 380, background: '#fff', borderRadius: 24, padding: '36px 30px', boxShadow: '0 20px 50px rgba(0,0,0,0.08)' }}>
        <p style={{ fontSize: 12, color: '#16a34a', letterSpacing: '0.1em', fontWeight: 700, margin: '0 0 6px' }}>GWAA 메이트십</p>
        <h1 style={{ fontFamily: BEBAS, fontSize: 30, color: '#111', letterSpacing: '0.02em', margin: '0 0 8px' }}>회원가입</h1>
        <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: '0 0 18px' }}>카카오로 간편하게 가입하고 디지털 회원증을 받으세요.</p>

        {/* 약관·개인정보 동의 (필수) */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#4b5563', lineHeight: 1.5, margin: '0 0 16px', cursor: 'pointer' }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 2, accentColor: '#16a34a' }} />
          <span>
            <a href="/terms" target="_blank" style={{ color: '#16a34a', fontWeight: 600 }}>이용약관</a> 및{' '}
            <a href="/privacy" target="_blank" style={{ color: '#16a34a', fontWeight: 600 }}>개인정보 수집·이용</a>에 동의합니다 (필수)
          </span>
        </label>

        {/* 카카오로 회원가입 (기본) */}
        <button onClick={kakaoLogin} style={{ width: '100%', padding: '15px', borderRadius: 12, background: '#FEE500', color: '#3c1e1e', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>💬</span> 카카오로 시작하기
        </button>
        {kakaoErr && <p style={{ fontSize: 12.5, color: '#dc2626', margin: '10px 0 0', lineHeight: 1.5 }}>{kakaoErr}</p>}
        <p style={{ fontSize: 11.5, color: '#9ca3af', textAlign: 'center', lineHeight: 1.6, margin: '10px 0 0' }}>
          가입 시 회원 확인을 위해 전화번호를 제공받습니다.
        </p>

        {/* 이미 회원 — 전화번호 로그인 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0 16px' }}>
          <div style={{ flex: 1, height: 1, background: '#eef0f2' }} />
          <span style={{ fontSize: 11, color: '#9ca3af' }}>이미 회원이신가요?</span>
          <div style={{ flex: 1, height: 1, background: '#eef0f2' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="전화번호 (가입 시 등록)" inputMode="tel" style={field} />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" style={field} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          {err && <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{err}</p>}
          <button onClick={submit} disabled={busy} style={{ padding: '13px', borderRadius: 12, background: '#fff', color: '#16a34a', fontWeight: 700, fontSize: 14, border: '1.5px solid #16a34a', cursor: busy ? 'default' : 'pointer' }}>
            {busy ? '확인 중…' : '전화번호로 로그인'}
          </button>
        </div>

        <p style={{ fontSize: 11.5, color: '#9ca3af', textAlign: 'center', lineHeight: 1.6, margin: '20px 0 0' }}>
          회원 정보가 조회되지 않으면 협회(033-813-0333)로 문의해주세요.
        </p>
      </div>
    </main>
  );
}
