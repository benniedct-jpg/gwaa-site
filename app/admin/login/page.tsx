'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";

export default function AdminLoginPage() {
  const router = useRouter();
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        router.replace('/admin');
      } else {
        const data = await res.json();
        setError(data.error || '비밀번호가 틀렸습니다.');
        setPw('');
      }
    } catch {
      setError('오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 360,
        background: '#fff',
        borderRadius: 16,
        border: '1.5px solid #e5e7eb',
        padding: '40px 36px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {/* Logo mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 16 }}>🐾</span>
          </div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif", fontSize: 18, color: '#111', letterSpacing: '0.04em', lineHeight: 1 }}>GWAA</div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: '#9ca3af', letterSpacing: '0.12em' }}>ADMIN</div>
          </div>
        </div>

        <h1 style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 6 }}>관리자 로그인</h1>
        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 28 }}>비밀번호를 입력하세요.</p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="비밀번호"
            autoFocus
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 10,
              border: error ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb',
              fontSize: 14,
              color: '#111',
              background: '#fafafa',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: MONO,
              letterSpacing: '0.1em',
            }}
          />
          {error && (
            <p style={{ fontSize: 12, color: '#ef4444', margin: 0 }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !pw}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              background: loading || !pw ? '#d1fae5' : '#16a34a',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading || !pw ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? '확인 중...' : '입장'}
          </button>
        </form>
      </div>
    </div>
  );
}
