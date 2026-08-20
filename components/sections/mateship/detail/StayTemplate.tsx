'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MateshipPartner } from '@/types';

const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";

export default function StayTemplate({ partner }: { partner: MateshipPartner }) {
  const { detail, name, icon, gradient, region } = partner;
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  if (!detail) return null;

  return (
    <main>
      {/* Hero */}
      <section style={{ background: '#111', padding: '72px 60px 56px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', padding: '5px 14px', borderRadius: 9999,
          border: '1px solid #374151', marginBottom: 24,
          fontFamily: MONO, fontSize: 12, color: '#6b7280', letterSpacing: '0.06em',
        }}>
          MATESHIP EXCLUSIVE
        </div>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
        <h1 style={{ fontFamily: BEBAS, fontSize: 'clamp(36px,6vw,64px)', color: '#fff', lineHeight: 1.1, marginBottom: 8, letterSpacing: '0.02em' }}>
          {name}
        </h1>
        <p style={{ fontFamily: BEBAS, fontSize: 'clamp(24px,4vw,40px)', color: '#16a34a', letterSpacing: '0.04em', marginBottom: 20 }}>
          {detail.tagline}
        </p>
        <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.6, maxWidth: 480, margin: '0 auto 16px' }}>
          {detail.description}
        </p>
        {detail.validPeriod && (
          <p style={{ fontFamily: MONO, fontSize: 12, color: '#4b5563', letterSpacing: '0.04em' }}>
            {detail.validPeriod}
          </p>
        )}
        <div style={{ marginTop: 32 }}>
          <a href="#price" style={{
            display: 'inline-block', padding: '13px 32px', borderRadius: 9999,
            background: '#16a34a', color: '#fff', fontWeight: 700,
            fontSize: 14, textDecoration: 'none', letterSpacing: '0.04em',
          }}>
            요금 확인하기 ↓
          </a>
        </div>
      </section>

      {/* 가격 비교 */}
      {(detail.originalPrice || detail.memberPrice) && (
        <section style={{ background: '#18181b', padding: '56px 60px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', padding: '5px 14px', borderRadius: 9999,
            border: '1px solid #374151', marginBottom: 32,
            fontFamily: MONO, fontSize: 12, color: '#6b7280', letterSpacing: '0.06em',
          }}>
            MEMBERS ONLY PRICE
          </div>
          <div style={{ display: 'flex', gap: 48, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            {detail.originalPrice && (
              <div>
                <p style={{ fontFamily: MONO, fontSize: 12, color: '#4b5563', marginBottom: 8 }}>일반 예약가</p>
                <p style={{ fontSize: 28, color: '#6b7280', textDecoration: 'line-through' }}>{detail.originalPrice}</p>
              </div>
            )}
            <div style={{ fontSize: 32, color: '#374151' }}>→</div>
            {detail.memberPrice && (
              <div>
                <p style={{ fontFamily: MONO, fontSize: 12, color: '#16a34a', marginBottom: 8 }}>메이트쉽가</p>
                <p style={{ fontFamily: BEBAS, fontSize: 52, color: '#16a34a', lineHeight: 1, letterSpacing: '0.02em' }}>
                  {detail.memberPrice}
                </p>
              </div>
            )}
          </div>
          {detail.discountRate && (
            <p style={{ marginTop: 16, fontSize: 13, color: '#6b7280' }}>
              <span style={{ color: '#16a34a', fontWeight: 700 }}>{detail.discountRate}</span> — 이 가격은 메이트쉽 회원만 이용할 수 있습니다.
            </p>
          )}
        </section>
      )}

      {/* 객실 요금표 */}
      {detail.priceRows && detail.priceRows.length > 0 && (
        <section id="price" style={{ padding: '72px 60px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <p style={{ fontFamily: MONO, fontSize: 12, color: '#6b7280', letterSpacing: '0.06em', marginBottom: 8 }}>ROOM RATE</p>
            <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(28px,4vw,44px)', color: '#111', marginBottom: 32, letterSpacing: '0.02em' }}>
              객실 요금
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {detail.priceRows.map((row, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', borderRadius: 12,
                  background: '#f9fafb', border: '1px solid #e5e7eb',
                  gap: 12, flexWrap: 'wrap',
                }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 2 }}>{row.label}</p>
                    {row.sublabel && <p style={{ fontSize: 12, color: '#6b7280' }}>{row.sublabel}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {row.badge && (
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                        background: '#dcfce7', color: '#16a34a',
                        fontSize: 12, fontWeight: 700, marginBottom: 4,
                      }}>
                        {row.badge}
                      </span>
                    )}
                    <p style={{ fontFamily: BEBAS, fontSize: 22, color: '#16a34a', letterSpacing: '0.04em' }}>
                      {row.memberPrice}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 반려견 안내 */}
      {detail.petInfo && (
        <section style={{ padding: '72px 60px', background: '#f0fdf4', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <p style={{ fontFamily: MONO, fontSize: 12, color: '#16a34a', letterSpacing: '0.06em', marginBottom: 8 }}>PET GUIDE</p>
            <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(28px,4vw,44px)', color: '#111', marginBottom: 8, letterSpacing: '0.02em' }}>
              🐾 반려동물 객실 안내
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 32 }}>반려동물과 함께하는 특별한 호캉스</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 12 }}>기본 제공 어메니티</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {detail.petInfo.amenities.map((item, i) => (
                    <li key={i} style={{ fontSize: 13, color: '#374151', display: 'flex', gap: 8 }}>
                      <span style={{ color: '#16a34a' }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 12 }}>이용 안내</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {detail.petInfo.rules.map((item, i) => (
                    <li key={i} style={{ fontSize: 13, color: '#374151', display: 'flex', gap: 8 }}>
                      <span style={{ color: '#6b7280' }}>·</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 부대시설 */}
      {detail.facilities && detail.facilities.length > 0 && (
        <section style={{ padding: '72px 60px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <p style={{ fontFamily: MONO, fontSize: 12, color: '#6b7280', letterSpacing: '0.06em', marginBottom: 8 }}>FACILITIES</p>
            <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(28px,4vw,44px)', color: '#111', marginBottom: 8, letterSpacing: '0.02em' }}>
              부대시설 & 요금
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 32 }}>투숙객 전용 혜택</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {detail.facilities.map((f, i) => (
                <div key={i} style={{ padding: '20px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#f9fafb' }}>
                  <p style={{ fontSize: 20, marginBottom: 8 }}>{f.icon}</p>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 12 }}>{f.name}</h3>
                  {f.rows.map((r, j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{r.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{r.price}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 이용 안내 아코디언 */}
      {detail.infoSections && detail.infoSections.length > 0 && (
        <section style={{ padding: '72px 60px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <p style={{ fontFamily: MONO, fontSize: 12, color: '#6b7280', letterSpacing: '0.06em', marginBottom: 8 }}>INFO</p>
            <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(28px,4vw,44px)', color: '#111', marginBottom: 8, letterSpacing: '0.02em' }}>
              이용 안내
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 32 }}>체크인·아웃, 추가 요금, 취소 규정</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {detail.infoSections.map((sec, i) => (
                <div key={i} style={{ borderRadius: i === 0 ? '12px 12px 0 0' : i === detail.infoSections!.length - 1 ? '0 0 12px 12px' : '0', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <button
                    onClick={() => setOpenIdx(openIdx === i ? null : i)}
                    style={{
                      width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '16px 20px', background: '#fff', border: 'none', cursor: 'pointer',
                      fontSize: 14, fontWeight: 600, color: '#111', textAlign: 'left',
                    }}
                  >
                    {sec.title}
                    <span style={{ fontSize: 18, color: '#6b7280', transform: openIdx === i ? 'rotate(45deg)' : 'none', transition: '0.2s' }}>+</span>
                  </button>
                  {openIdx === i && (
                    <div style={{ padding: '0 20px 16px', background: '#fff' }}>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {sec.items.map((item, j) => (
                          <li key={j} style={{ fontSize: 13, color: '#374151', display: 'flex', gap: 8, lineHeight: 1.6 }}>
                            <span style={{ color: '#d1d5db', flexShrink: 0 }}>·</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 하단 CTA */}
      <section style={{ padding: '64px 60px', background: '#111', textAlign: 'center' }}>
        <p style={{ fontFamily: MONO, fontSize: 12, color: '#4b5563', letterSpacing: '0.06em', marginBottom: 16 }}>MEMBERS ONLY</p>
        <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(28px,4vw,44px)', color: '#fff', marginBottom: 8, letterSpacing: '0.02em' }}>
          지금 바로 메이트쉽 특별가로 예약하세요
        </h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 32 }}>회원 전용 최저가 — 다른 어디에서도 만날 수 없는 가격입니다.</p>
        {detail.cta && (
          <a
            href={detail.cta.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', padding: '15px 40px', borderRadius: 9999,
              background: '#16a34a', color: '#fff', fontWeight: 700,
              fontSize: 15, textDecoration: 'none', letterSpacing: '0.04em',
              boxShadow: '0 4px 20px rgba(34,197,94,0.35)',
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
