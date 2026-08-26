'use client';

import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/useIsMobile';

const BASE = '/images/events/jamboree-2026/sponsors';
const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";

// 통일감: 모든 로고를 동일 높이 흰 카드에 contain 배치 → 색/비율 제각각이어도 정돈돼 보임
const LOGOS: { s: string; n: string }[] = [
  { s: 'korea-scout', n: '한국스카우트연맹' },
  { s: 'gangwon', n: '강원특별자치도' },
  { s: 'josera', n: 'Josera' },
  { s: 'nuheal', n: 'nu&heal' },
  { s: 'allifeat', n: 'Allifeat' },
  { s: 'campers-agit', n: "Camper's Agit" },
  { s: 'tailiz', n: 'TAILIZ' },
  { s: 'insectdog', n: 'InsectDog' },
  { s: 'petien', n: 'peti·en' },
  { s: 'hoho', n: 'hoho' },
  { s: 'kkukpet', n: '꾹펫' },
  { s: 'donghae', n: '동해 형씨' },
];

export default function SponsorMarquee() {
  const isMobile = useIsMobile();
  const H = isMobile ? 62 : 78;         // 카드 높이(통일)
  const logoH = isMobile ? 30 : 38;     // 로고 최대 높이(통일)
  const gap = isMobile ? 12 : 16;
  const row = [...LOGOS, ...LOGOS];     // 이음새 없이 무한 루프용 2벌
  const fade = 'linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%)';

  return (
    <section style={{ background: '#f8fafb', borderTop: '1px solid #eef1f4', padding: isMobile ? '40px 0 44px' : '58px 0 62px', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: isMobile ? 22 : 30, padding: '0 20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 18, height: 2, background: '#16a34a', borderRadius: 1 }} />
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', color: '#16a34a', fontWeight: 700 }}>SPONSORS &amp; PARTNERS</span>
          <span style={{ width: 18, height: 2, background: '#16a34a', borderRadius: 1 }} />
        </div>
        <h2 style={{ fontFamily: BEBAS, fontSize: isMobile ? 24 : 32, color: '#111', letterSpacing: '0.02em', margin: 0 }}>함께해주시는 후원사</h2>
      </div>

      <div style={{ position: 'relative', WebkitMaskImage: fade, maskImage: fade }}>
        <motion.div
          style={{ display: 'flex', width: 'max-content', willChange: 'transform' }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ ease: 'linear', duration: isMobile ? 30 : 42, repeat: Infinity }}
        >
          {row.map((l, i) => (
            <div
              key={i}
              aria-hidden={i >= LOGOS.length}
              style={{
                flex: '0 0 auto', height: H, marginRight: gap,
                minWidth: isMobile ? 118 : 150,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#fff', border: '1px solid #e8ebee', borderRadius: 12,
                padding: isMobile ? '0 18px' : '0 26px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <img
                src={`${BASE}/${l.s}.png`}
                alt={l.n}
                loading="lazy"
                style={{ height: logoH, width: 'auto', maxWidth: isMobile ? 108 : 150, objectFit: 'contain', display: 'block' }}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
