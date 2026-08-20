'use client';

import Link from 'next/link';
import { MateshipPartner } from '@/types';

const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";

export default function BrandTemplate({ partner }: { partner: MateshipPartner }) {
  const { detail, name, icon, gradient, discount } = partner;
  if (!detail) return null;

  return (
    <main>
      {/* Hero */}
      <section style={{ background: gradient, padding: '72px 60px 56px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', padding: '5px 14px', borderRadius: 9999,
          border: '1px solid rgba(0,0,0,0.12)', marginBottom: 24,
          fontFamily: MONO, fontSize: 12, color: '#374151', letterSpacing: '0.06em',
        }}>
          MATESHIP PARTNER
        </div>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{icon}</div>
        <h1 style={{ fontFamily: BEBAS, fontSize: 'clamp(36px,6vw,64px)', color: '#111', lineHeight: 1.1, marginBottom: 8, letterSpacing: '0.02em' }}>
          {name}
        </h1>
        <p style={{ fontFamily: BEBAS, fontSize: 'clamp(20px,3vw,32px)', color: '#16a34a', letterSpacing: '0.04em', marginBottom: 20 }}>
          {detail.tagline}
        </p>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
          {detail.description}
        </p>
      </section>

      {/* 회원 혜택 */}
      <section style={{ padding: '72px 60px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: MONO, fontSize: 12, color: '#6b7280', letterSpacing: '0.06em', marginBottom: 8 }}>MEMBER BENEFIT</p>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(28px,4vw,44px)', color: '#111', marginBottom: 32, letterSpacing: '0.02em' }}>
            메이트쉽 회원 혜택
          </h2>
          <div style={{
            padding: '32px', borderRadius: 16,
            background: '#f0fdf4', border: '1.5px solid #bbf7d0',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <p style={{ fontFamily: MONO, fontSize: 12, color: '#16a34a', letterSpacing: '0.04em' }}>MEMBERS ONLY</p>
            <p style={{ fontFamily: BEBAS, fontSize: 40, color: '#16a34a', letterSpacing: '0.04em' }}>✨ {discount}</p>
          </div>
        </div>
      </section>

      {/* 이용 방법 */}
      {detail.howToUse && detail.howToUse.length > 0 && (
        <section style={{ padding: '72px 60px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontFamily: MONO, fontSize: 12, color: '#6b7280', letterSpacing: '0.06em', marginBottom: 8 }}>HOW TO USE</p>
            <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(28px,4vw,44px)', color: '#111', marginBottom: 32, letterSpacing: '0.02em' }}>
              이용 방법
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {detail.howToUse.map((step, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                  padding: '16px 20px', borderRadius: 12,
                  background: '#fff', border: '1px solid #e5e7eb',
                }}>
                  <span style={{
                    flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                    background: '#16a34a', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: BEBAS, fontSize: 16,
                  }}>
                    {i + 1}
                  </span>
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, paddingTop: 4 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 이용 안내 */}
      {detail.infoSections && detail.infoSections.length > 0 && (
        <section style={{ padding: '48px 60px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            {detail.infoSections.map((sec, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 10 }}>{sec.title}</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {sec.items.map((item, j) => (
                    <li key={j} style={{ fontSize: 13, color: '#6b7280', display: 'flex', gap: 8 }}>
                      <span style={{ color: '#d1d5db' }}>·</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '64px 60px', background: '#f0fdf4', textAlign: 'center' }}>
        <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(24px,3.5vw,36px)', color: '#111', marginBottom: 8, letterSpacing: '0.02em' }}>
          메이트쉽 회원만의 특별한 혜택
        </h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 32 }}>
          아직 메이트쉽 회원이 아니신가요? 지금 가입하고 모든 파트너 혜택을 누리세요.
        </p>
        {detail.cta && (
          <a
            href={detail.cta.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', padding: '15px 40px', borderRadius: 9999,
              background: '#16a34a', color: '#fff', fontWeight: 700,
              fontSize: 15, textDecoration: 'none', letterSpacing: '0.04em',
              boxShadow: '0 4px 20px rgba(22,163,74,0.3)',
            }}
          >
            {detail.cta.label}
          </a>
        )}
        <div style={{ marginTop: 24 }}>
          <Link href="/mateship#partners" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>
            ← 제휴업체 목록으로
          </Link>
        </div>
      </section>
    </main>
  );
}
