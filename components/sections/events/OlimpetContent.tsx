'use client';

import { useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const GREEN = '#12A79D';

// 포스터형 이미지 (클릭 시 확대)
function Poster({ src, alt, max, accent }: { src: string; alt: string; max: number; accent: string }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ background: '#f9fafb', border: '1px solid #eceff2', borderRadius: 16, padding: isMobile ? '16px' : '22px', display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          onClick={() => setOpen(true)}
          style={{ width: '100%', maxWidth: isMobile ? '100%' : max, height: 'auto', borderRadius: 12, boxShadow: `0 8px 26px ${accent}22`, display: 'block', cursor: 'zoom-in' }}
        />
      </div>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.86)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} style={{ maxWidth: '100%', maxHeight: '92vh', borderRadius: 10, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} />
        </div>
      )}
    </>
  );
}

export default function OlimpetContent() {
  const isMobile = useIsMobile();

  const wrap: React.CSSProperties = { marginTop: 8 };
  const section: React.CSSProperties = { marginBottom: isMobile ? 44 : 60 };
  const eyebrowRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 };
  const eyebrowBar = (color: string): React.CSSProperties => ({ width: 20, height: 2, background: color, borderRadius: 1 });
  const eyebrowTxt = (color: string): React.CSSProperties => ({ fontFamily: MONO, fontSize: 11, color, letterSpacing: '0.1em', fontWeight: 700 });
  const h2: React.CSSProperties = { fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#111', lineHeight: 1.32, letterSpacing: '-0.01em', marginBottom: 12, wordBreak: 'keep-all' };
  const body: React.CSSProperties = { fontSize: isMobile ? 14.5 : 16, color: '#374151', lineHeight: 1.8, wordBreak: 'keep-all' };

  const Step = ({ n, color, children }: { n: number; color: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 7, background: color, color: '#fff', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>{n}</span>
      <div style={{ fontSize: isMobile ? 14 : 15.5, color: '#374151', lineHeight: 1.7, wordBreak: 'keep-all' }}>{children}</div>
    </div>
  );

  const schedule: [string, string, string, boolean][] = [
    ['11:00', '🥏', '프리스비 & IGP (1)', false],
    ['12:00', '🏅', '국가대표 어질리티 쇼 & 체험 (1)', false],
    ['13:00', '🎤', 'MC가 진행하는 미니게임 (1)', false],
    ['14:00', '🎉', '개막식', true],
    ['14:10', '🥏', '프리스비 & IGP (2)', false],
    ['15:00', '🏅', '국가대표 어질리티 쇼 & 체험 (2)', false],
    ['16:00', '🎤', 'MC가 진행하는 미니게임 (2)', false],
    ['16:30', '🏆', '기다리개 대회', true],
  ];

  return (
    <div style={wrap}>
      {/* 인트로 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar(GREEN)} /><span style={eyebrowTxt(GREEN)}>PROGRAM GUIDE</span></div>
        <h2 style={h2}>알고 가면 더 즐거운 올림펫</h2>
        <p style={body}>
          제4회 강릉시 반려동물 문화축제 <b>올림펫</b>이 강릉종합운동장 야외공연장에서 하루 종일 열려요.
          반려견이 마음껏 뛰노는 오프리쉬 놀이터부터 셀러·체험부스, 미니게임, 포토존까지 —
          함께 뛰고 즐기고, 나눔으로 보람까지 챙기는 하루를 준비했습니다.
        </p>
        <Poster src="/images/events/olimpet-2026/intro.webp" alt="2026 올림펫 · 제4회 강릉시 반려동물 문화축제 · 9월 13일(일) 10:00~17:00 강릉종합운동장 야외공연장" max={420} accent={GREEN} />
      </div>

      {/* 릴스 콘테스트 (1등 50만원) — 최우선 훅 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar('#e11d48')} /><span style={eyebrowTxt('#e11d48')}>REELS CONTEST</span></div>
        <h2 style={h2}>🎬 올림펫 릴스 콘테스트 · 1등 상금 50만원</h2>
        <p style={{ ...body, marginBottom: 16 }}>
          여러분의 시선으로 올림펫을 담아주세요. 가장 빛나는 한 편에 <b>상금 50만원</b>,
          그리고 1등에게는 <b>GWAA 공식 크리에이터로 다음 행사 초대</b>까지!
        </p>
        <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
          <Step n={1} color="#e11d48">올림펫 현장에서 릴스 영상을 촬영해요 (반려동물과 함께라면 더 좋아요).</Step>
          <Step n={2} color="#e11d48"><b>GWAA 공식 인스타그램</b>으로 영상을 DM 전송해 주세요.</Step>
          <Step n={3} color="#e11d48">협회 심사(창의성·현장감·반려동물 매력) 후 1등 발표 — <b>팔로워 수 무관, 누구나 공평하게!</b></Step>
        </div>
        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, padding: '13px 16px', fontSize: isMobile ? 13 : 14, color: '#9f1239', lineHeight: 1.7, wordBreak: 'keep-all' }}>
          마감 <b>9월 14일(월) 밤 12시</b> · 발표 <b>9월 셋째 주</b> GWAA 인스타그램<br />
          사진으로 참여하고 싶다면 &lsquo;셀러브리티&rsquo; 이벤트로 응모하세요.
        </div>
        <Poster src="/images/events/olimpet-2026/reels-contest.webp" alt="올림펫 릴스 콘테스트 — 1등 상금 50만원, GWAA 공식 크리에이터 초대, GWAA 공식 인스타그램 DM 접수, 협회 심사" max={480} accent="#e11d48" />
      </div>

      {/* 스탬프 투어 경품 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar('#eab308')} /><span style={eyebrowTxt('#eab308')}>STAMP TOUR</span></div>
        <h2 style={h2}>🎁 행사 즐기고 경품 받자!</h2>
        <p style={{ ...body, marginBottom: 16 }}>
          미션 6가지를 즐기고 스탬프를 모으면 경품 뽑기 기회! 리플렛의 스탬프 투어 6칸을 채워보세요.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {['똥 던지기', '2m를 맞춰라', '반려견 야바위', '포토존 인증샷', '오프리쉬존 이용', '펫티켓 후원 참여'].map((m) => (
            <span key={m} style={{ fontSize: 13, fontWeight: 700, padding: '8px 14px', borderRadius: 9999, background: '#fefce8', border: '1px solid #fde68a', color: '#a16207' }}>{m}</span>
          ))}
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          <Step n={1} color="#eab308">스탬프는 각 프로그램 부스 인근, 지도상 <b>🍀 표시 지점</b>에서 받을 수 있어요.</Step>
          <Step n={2} color="#eab308">스탬프 투어 <b>6칸을 모두 채워야</b> 경품이 증정돼요.</Step>
          <Step n={3} color="#eab308">다 모으면 리플렛을 지참하고 지도상 <b>경품존 🎁 부스</b>로 오세요.</Step>
          <Step n={4} color="#eab308">뽑기를 통해 <b>경품을 랜덤</b>으로 받아가세요!</Step>
        </div>
        <Poster src="/images/events/olimpet-2026/stamptour.webp" alt="올림펫 스탬프 투어 경품 이벤트 — 똥 던지기·2m를 맞춰라·반려견 야바위·포토존·오프리쉬·펫티켓 후원 6미션 스탬프 완성 시 경품 추첨" max={420} accent="#eab308" />
      </div>

      {/* 셀러브리티 SNS 이벤트 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar(GREEN)} /><span style={eyebrowTxt(GREEN)}>SNS EVENT</span></div>
        <h2 style={h2}>📸 오늘의 주인공은 우리 아이 · 셀러브리티</h2>
        <p style={{ ...body, marginBottom: 18 }}>
          축제를 즐기는 반려동물의 순간을 사진으로 남겨 인스타그램에 올려주세요.
          가장 많은 <b>좋아요</b>를 받은 주인공에게 선물을 드립니다.
        </p>
        <div style={{ display: 'grid', gap: 12 }}>
          <Step n={1} color={GREEN}>올림펫 현장에서 축제를 즐기는 <b>반려동물 사진</b>을 찍어주세요.</Step>
          <Step n={2} color={GREEN}>인스타그램에 사진을 올리고 <b>#강릉시반려동물문화축제 #셀러브리티 #올림펫 #gwaa</b> 를 태그로 달아주세요.</Step>
          <Step n={3} color={GREEN}>축제 다음날 <b>9월 14일(월) 24:00</b> 기준, 좋아요를 가장 많이 받은 계정에 선물을 드려요.</Step>
        </div>
        <Poster src="/images/events/olimpet-2026/celebrity.webp" alt="셀러브리티 SNS 포토 이벤트 — 인스타그램에 반려동물 사진 업로드 후 해시태그, 좋아요 최다 계정 선물 증정" max={420} accent={GREEN} />
      </div>

      {/* 시간별 프로그램 (시간표) */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar('#F5A524')} /><span style={eyebrowTxt('#F5A524')}>SCHEDULE</span></div>
        <h2 style={h2}>시간별 프로그램</h2>
        <p style={{ ...body, marginBottom: 16 }}>하루 종일 이어지는 무대와 프로그램. 보고 싶은 순서를 미리 체크해 두세요. <b style={{ color: '#F5A524' }}>개막식·기다리개 대회</b>는 놓치면 아쉬워요!</p>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
          {schedule.map(([t, emoji, c, hi], i) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', borderTop: i ? '1px solid #f0f0f0' : 'none', background: hi ? '#fffbeb' : (i % 2 ? '#fafafa' : '#fff') }}>
              <div style={{ flexShrink: 0, width: isMobile ? 68 : 96, padding: '12px 14px', fontSize: isMobile ? 13 : 14.5, fontWeight: 800, color: hi ? '#C9560F' : '#0D7E76', fontFamily: MONO }}>{t}</div>
              <div style={{ flex: 1, padding: '12px 14px', fontSize: isMobile ? 13.5 : 15, color: '#111', fontWeight: hi ? 800 : 500, wordBreak: 'keep-all' }}>
                <span style={{ marginRight: 7 }}>{emoji}</span>{c}
                {hi && <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 800, color: '#fff', background: '#F5A524', padding: '2px 7px', borderRadius: 9999, verticalAlign: 'middle' }}>HIGHLIGHT</span>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: '#f3f4f6', borderRadius: 10, padding: '13px 16px', fontSize: isMobile ? 13 : 14, color: '#374151', lineHeight: 1.7, wordBreak: 'keep-all' }}>
          <b style={{ color: '#111' }}>상시 운영</b> — 셀러부스 · 체험부스 · 오프리쉬 · 2m를 맞춰라 · 똥 던지기 · 반려견 야바위 · 선수촌 식당 · 아나바다 · 펫티켓 후원
        </div>
        <Poster src="/images/events/olimpet-2026/timetable.webp" alt="올림펫 시간별 프로그램 — 프리스비 IGP, 국가대표 어질리티 쇼, 미니게임, 개막식, 기다리개 대회 시간표" max={420} accent="#F5A524" />
      </div>

      {/* 행사장 지도 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar('#F5A524')} /><span style={eyebrowTxt('#F5A524')}>VENUE MAP</span></div>
        <h2 style={h2}>한눈에 보는 행사장 동선</h2>
        <p style={body}>
          메인 무대와 시간별 프로그램 공간, 셀러·체험부스, 미니게임존, 포토존, 그리고 반려견이 마음껏 달리는
          오프리쉬 놀이터(프라이빗·어질리티·축구·노즈워크)까지. 도착 전에 동선을 미리 봐두면 기다림 없이 알차게 즐길 수 있어요.
          아나바다·경품존·펫티켓 후원 위치도 지도에서 확인하세요.
        </p>
        <Poster src="/images/events/olimpet-2026/map.webp" alt="올림펫 행사장 지도 — 메인 무대, 셀러·체험부스, 미니게임, 포토존, 오프리쉬 놀이터, 아나바다, 펫티켓 후원 위치 안내" max={560} accent="#F5A524" />
      </div>

      {/* 테마별 오프리쉬 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar(GREEN)} /><span style={eyebrowTxt(GREEN)}>OFF-LEASH</span></div>
        <h2 style={h2}>🐾 테마별 오프리쉬 놀이터</h2>
        <p style={{ ...body, marginBottom: 16 }}>목줄을 풀고 마음껏 뛰노는 네 가지 테마 놀이터. 우리 아이 성향에 맞는 곳에서 신나게 즐겨요.</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
          {[
            { en: 'AGILITY', ko: '어질리티 놀이터', desc: '목줄을 풀고 마음껏 뛰노는 놀이터', chips: ['소·중형견 오프리쉬 · 15kg 미만', '대형견 오프리쉬 · 15kg 이상'] },
            { en: 'FOOTBALL', ko: '반려견 축구 놀이터', desc: '반려견과 반려인이 함께하는 축구 대결 ⚽ 현장에서 만난 새 친구들과 팀을 꾸려 신나는 승부를!', chips: [] },
            { en: 'NOSEWORK', ko: '노즈워크 놀이터', desc: '', chips: ['이용 시간 · 최대 10분 (간식 셋팅시간 제외)', '사용 간식 · 기호성 좋은 기본 간식 제공 (알레르기 있으면 개인간식 필참)'] },
            { en: 'PRIVATE', ko: '단독 맞춤형 놀이터', desc: '', chips: ['옵션 A · 단독 프라이빗 오프리쉬', '옵션 B · 소규모(2~3팀) 사회화 오프리쉬'] },
          ].map((c) => (
            <div key={c.en} style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: '16px 18px', background: '#fff' }}>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', color: '#9ca3af', fontWeight: 800 }}>{c.en} <span style={{ color: '#d1d5db' }}>OFF-LEASH</span></div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#111', margin: '6px 0 8px' }}>{c.ko}</div>
              {c.desc && <p style={{ fontSize: isMobile ? 13.5 : 14, color: '#4b5563', lineHeight: 1.65, marginBottom: c.chips.length ? 8 : 0, wordBreak: 'keep-all' }}>{c.desc}</p>}
              {c.chips.map((ch) => (
                <div key={ch} style={{ fontSize: 12.5, color: '#374151', padding: '3px 0', lineHeight: 1.5, wordBreak: 'keep-all' }}>
                  <span style={{ color: GREEN, fontWeight: 800, marginRight: 6 }}>·</span>{ch}
                </div>
              ))}
            </div>
          ))}
        </div>
        <Poster src="/images/events/olimpet-2026/offleash.webp" alt="올림펫 테마별 오프리쉬 놀이터 — 어질리티(소중형견·대형견), 반려견 축구, 노즈워크, 단독 프라이빗 오프리쉬" max={480} accent={GREEN} />
      </div>

      {/* ESG 아나바다 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar('#ec4899')} /><span style={eyebrowTxt('#ec4899')}>ESG CAMPAIGN</span></div>
        <h2 style={h2}>아껴 쓰고 나눠 쓰는, 아나바다</h2>
        <p style={{ ...body, marginBottom: 16 }}>
          쓰지 않는 반려동물 용품, 이제 필요한 누군가에게. 좋은 물건은 저렴하게 장만하고,
          부스 수익은 좋은 일에 쓰입니다.
        </p>
        <ul style={{ margin: '0 0 16px', padding: 0, listStyle: 'none', display: 'grid', gap: 9 }}>
          {[
            '반려동물 용품을 비롯한 다양한 물품을 기부하실 수 있어요.',
            '판매 가격은 기부자가 직접 정해 가격표를 부착해 주세요.',
            '구매 대금은 현금 또는 계좌이체로만 결제할 수 있어요.',
            '다른 분이 쓸 수 있도록 깨끗하고 상태 좋은 물품만 기부해 주세요.',
            '식품·간식류는 미개봉 제품에 한하며, 소비기한을 꼭 확인해 주세요.',
          ].map((t) => (
            <li key={t} style={{ display: 'flex', gap: 9, fontSize: isMobile ? 13.5 : 15, color: '#374151', lineHeight: 1.65, wordBreak: 'keep-all' }}>
              <span style={{ color: '#ec4899', fontWeight: 800, flexShrink: 0 }}>·</span>{t}
            </li>
          ))}
        </ul>
        <div style={{ background: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: 12, padding: '13px 16px', fontSize: isMobile ? 13.5 : 14.5, color: '#be185d', fontWeight: 700, lineHeight: 1.6, wordBreak: 'keep-all' }}>
          아나바다 부스의 수익은 전액 <b>강릉시 동물사랑센터에 기부</b>됩니다.
        </div>
        <Poster src="/images/events/olimpet-2026/anabada.webp" alt="ESG 캠페인 아나바다 — 쓰지 않는 중고 반려동물 용품 기부·나눔, 수익은 강릉시 동물사랑센터 기부" max={420} accent="#ec4899" />
      </div>

      {/* 펫티켓 후원 */}
      <div style={section}>
        <div style={eyebrowRow}><span style={eyebrowBar('#0ea5e9')} /><span style={eyebrowTxt('#0ea5e9')}>DONATION</span></div>
        <h2 style={h2}>배변봉투 하나가, 두 배의 후원으로</h2>
        <p style={{ ...body, marginBottom: 18 }}>
          펫티켓을 지키면 그대로 후원이 됩니다. 참여한 무게(KG)에 따라
          강릉시 동물사랑센터에 후원물품이 전달돼요.
        </p>
        <div style={{ display: 'grid', gap: 12 }}>
          <Step n={1} color="#0ea5e9">행사 당일, 지도에 표시된 <b>&lsquo;펫티켓 후원&rsquo;</b> 장소에 배변봉투 수거함이 마련돼 있어요.</Step>
          <Step n={2} color="#0ea5e9">수거함에 배변봉투를 넣어주시면, 참여 무게에 따라 강릉시 동물사랑센터에 <b>후원물품</b>이 전달됩니다.</Step>
          <Step n={3} color="#0ea5e9">후원 결과는 이후 <b>GWAA 인스타그램</b>에 공개해요.</Step>
        </div>
        <Poster src="/images/events/olimpet-2026/petiquette.webp" alt="펫티켓 후원 — 배변봉투를 수거함에 넣으면 무게에 따라 강릉시 동물사랑센터에 후원물품 전달" max={420} accent="#0ea5e9" />
      </div>
    </div>
  );
}
