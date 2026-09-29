import Link from 'next/link';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";

// 셀러 모집이 열린 행사가 있을 때만 홈에 노출되는 CTA 배너
export default function SellerBanner({ eventTitle }: { eventTitle?: string }) {
  return (
    <section style={{ padding: '0 20px', margin: '0 auto', maxWidth: 1200 }}>
      <Link href="/sellers" style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          background: 'linear-gradient(135deg,#12A79D,#0D7E76)', borderRadius: 18,
          padding: '26px 24px', margin: '0 0 8px', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', color: '#BFF3EC', fontWeight: 700, marginBottom: 6 }}>FLEA MARKET · SELLER 모집중</div>
            <div style={{ fontFamily: BEBAS, fontSize: 'clamp(20px,4.4vw,28px)', letterSpacing: '0.01em', lineHeight: 1.15, wordBreak: 'keep-all' }}>
              프리마켓 셀러를 찾아요{eventTitle ? ` · ${eventTitle}` : ''}
            </div>
            <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.9)', marginTop: 6, wordBreak: 'keep-all' }}>후원물품 제공 시 참가비 무료 · 온라인 간편 신청</div>
          </div>
          <span style={{ flexShrink: 0, background: '#EF7726', color: '#3A1A06', fontWeight: 800, fontSize: 14, padding: '12px 26px', borderRadius: 9999, boxShadow: '0 6px 16px rgba(35,34,32,0.18)' }}>셀러 신청하기 →</span>
        </div>
      </Link>
    </section>
  );
}
