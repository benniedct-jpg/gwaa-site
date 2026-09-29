'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/useIsMobile';
import { PET_TIPS, TIP_CATEGORIES } from '@/lib/petTips';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const GREEN = '#12A79D';

export default function TipsClient() {
  const isMobile = useIsMobile();
  const [cat, setCat] = useState('전체');
  const list = cat === '전체' ? PET_TIPS : PET_TIPS.filter((t) => t.cat === cat);
  const px = isMobile ? '20px' : '60px';

  return (
    <section style={{ padding: `${isMobile ? '32px' : '48px'} ${px} 64px`, background: '#f8fafb' }}>
      {/* 카테고리 필터 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {TIP_CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            style={{ fontSize: 13, padding: '8px 15px', borderRadius: 9999, cursor: 'pointer', fontFamily: MONO,
              border: cat === c ? `1.5px solid ${GREEN}` : '1.5px solid #e5e7eb', background: cat === c ? GREEN : '#fff', color: cat === c ? '#fff' : '#6b7280', fontWeight: 700 }}>{c}</button>
        ))}
      </div>

      {/* 팁 카드 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 12 : 16 }}>
        {list.map((t) => (
          <div key={t.title} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ width: 40, height: 40, borderRadius: '50%', background: '#EDFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{t.icon}</span>
              <span>
                <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#0D7E76' }}>{t.cat}</span>
                <span style={{ display: 'block', fontSize: 15, fontWeight: 800, color: '#111' }}>{t.title}</span>
              </span>
            </div>
            <p style={{ fontSize: 13.5, color: '#4b5563', lineHeight: 1.7, margin: 0, wordBreak: 'keep-all' }}>{t.text}</p>
          </div>
        ))}
      </div>

      {/* 멤버십 유도 */}
      <div style={{ marginTop: 40, background: 'linear-gradient(135deg,#12A79D,#0D7E76)', borderRadius: 18, padding: isMobile ? '24px 20px' : '32px', color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, marginBottom: 8, wordBreak: 'keep-all' }}>반려생활, 혜택까지 챙기고 싶다면?</div>
        <p style={{ fontSize: isMobile ? 13.5 : 15, color: 'rgba(255,255,255,0.9)', lineHeight: 1.7, marginBottom: 18, wordBreak: 'keep-all' }}>GWAA 멤버십으로 전국 반려 제휴처 할인·행사 할인·디지털 회원증까지. 월 1만원 꼴이에요.</p>
        <Link href="/membership/join" style={{ display: 'inline-block', background: '#fff', color: '#0D7E76', fontWeight: 800, fontSize: 14.5, padding: '13px 28px', borderRadius: 9999, textDecoration: 'none' }}>멤버십 가입하기 →</Link>
      </div>
    </section>
  );
}
