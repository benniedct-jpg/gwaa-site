import { readToken } from '@/lib/membership/token';
import { dbGet } from '@/lib/db/serverDB';

export const dynamic = 'force-dynamic';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";

type State = 'valid' | 'expired' | 'inactive' | 'invalid';

export default async function MemberVerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const q = readToken(token, 'q');

  let state: State = 'invalid';
  let member: Record<string, unknown> | null = null;

  if (q) {
    if (q.expired) {
      state = 'expired';
    } else {
      const m = (await dbGet('members', q.memberId)) as Record<string, unknown> | null;
      if (m && m.status === 'active') {
        state = 'valid';
        member = m;
      } else if (m) {
        state = 'inactive';
      }
    }
  }

  const THEME: Record<State, { bg: string; accent: string; icon: string; title: string; sub: string }> = {
    valid:    { bg: '#f0fdf4', accent: '#16a34a', icon: '✓', title: '유효한 회원입니다', sub: '회원 할인을 적용해 주세요.' },
    expired:  { bg: '#fff7ed', accent: '#f59e0b', icon: '⟳', title: 'QR이 만료됐어요', sub: '회원 화면에서 QR을 새로고침한 뒤 다시 스캔해 주세요.' },
    inactive: { bg: '#fef2f2', accent: '#dc2626', icon: '!', title: '비활성 회원입니다', sub: '회비 미납/만료 상태예요. 할인 적용이 어렵습니다.' },
    invalid:  { bg: '#fef2f2', accent: '#dc2626', icon: '✕', title: '유효하지 않은 회원증', sub: '올바른 회원증 QR이 아니에요.' },
  };
  const t = THEME[state];

  return (
    <main style={{ minHeight: '100dvh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: MONO }}>
      <div style={{ width: '100%', maxWidth: 380, background: '#fff', borderRadius: 24, padding: '40px 28px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.10)' }}>
        <div style={{ width: 84, height: 84, borderRadius: '50%', background: t.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, margin: '0 auto 20px', lineHeight: 1 }}>
          {t.icon}
        </div>
        <p style={{ fontSize: 12, color: t.accent, letterSpacing: '0.1em', fontWeight: 700, margin: '0 0 8px' }}>GWAA 메이트십</p>
        <h1 style={{ fontSize: 23, color: '#111', fontWeight: 800, margin: '0 0 8px' }}>{t.title}</h1>
        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: '0 0 24px' }}>{t.sub}</p>

        {member && (
          <div style={{ textAlign: 'left', background: '#f9fafb', border: '1px solid #eef0f2', borderRadius: 14, padding: '16px 18px' }}>
            <Row label="이름" value={String(member.name ?? '')} />
            <Row label="회원번호" value={String(member.member_no ?? '')} mono />
            {member.region ? <Row label="지역" value={String(member.region)} /> : null}
            <Row label="상태" value="활성 회원" accent="#16a34a" />
          </div>
        )}

        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 20 }}>
          {new Date().toLocaleString('ko-KR')} 확인
        </p>
      </div>
    </main>
  );
}

function Row({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
      <span style={{ fontSize: 13, color: '#9ca3af' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: accent ?? '#111', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</span>
    </div>
  );
}
