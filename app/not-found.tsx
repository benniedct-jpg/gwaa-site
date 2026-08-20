import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
      <div style={{ fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", fontSize: 10, letterSpacing: '0.14em', color: '#16a34a', marginBottom: 16 }}>404 — NOT FOUND</div>
      <h1 style={{ fontFamily: "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif", fontSize: 'clamp(60px, 15vw, 120px)', color: '#111', lineHeight: 0.9, letterSpacing: '0.02em', marginBottom: 24 }}>
        페이지를<br /><span style={{ color: '#16a34a' }}>찾을 수 없어요</span>
      </h1>
      <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.8, marginBottom: 40, maxWidth: 400, fontWeight: 300 }}>
        요청하신 페이지가 존재하지 않거나 이동되었습니다.<br />홈으로 돌아가 다시 시도해 주세요.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{ display: 'inline-flex', padding: '12px 28px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
          홈으로 가기 →
        </Link>
        <Link href="/contact" style={{ display: 'inline-flex', padding: '12px 28px', borderRadius: 9999, border: '1.5px solid #e5e7eb', color: '#374151', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
          문의하기
        </Link>
      </div>
    </div>
  );
}
