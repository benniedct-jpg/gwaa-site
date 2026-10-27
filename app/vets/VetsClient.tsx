'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { GW_VETS } from '@/lib/data/gwVets';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const TEAL_DK = '#0D7E76';

const SIGUNGU_ORDER = [
  '춘천시', '원주시', '강릉시', '속초시', '동해시', '삼척시', '태백시',
  '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군',
];

export default function VetsClient() {
  const [sigungu, setSigungu] = useState('춘천시');
  const [q, setQ] = useState('');

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    GW_VETS.forEach((v) => { c[v.sigungu] = (c[v.sigungu] || 0) + 1; });
    return c;
  }, []);

  const list = useMemo(() => {
    const kw = q.trim();
    let base = kw ? GW_VETS : GW_VETS.filter((v) => v.sigungu === sigungu);
    if (kw) base = base.filter((v) => v.name.includes(kw) || v.address.includes(kw) || v.sigungu.includes(kw));
    return base;
  }, [sigungu, q]);

  const mapQuery = (name: string, sg: string) => encodeURIComponent(`강원 ${sg} ${name}`);

  return (
    <main style={{ fontFamily: MONO, background: '#f8fafb', minHeight: '100vh' }}>
      {/* 히어로 */}
      <section style={{ background: 'linear-gradient(160deg, #0D7E76, #12A79D)', color: '#fff', padding: '48px 20px 38px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.14em', fontWeight: 700, color: '#BFF3EC', marginBottom: 10 }}>FIND A VET</div>
          <h1 style={{ fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 800, lineHeight: 1.25, margin: 0, wordBreak: 'keep-all' }}>
            강원 동물병원 찾기
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.92)', marginTop: 12, wordBreak: 'keep-all' }}>
            강원 18개 시군 동물병원 {GW_VETS.length}곳. 우리 동네를 고르면 지도·후기·전화번호까지 바로 이어드려요.
          </p>
          <Link href="/emergency" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '11px 18px', borderRadius: 10, background: '#fff', color: TEAL_DK, fontSize: 13.5, fontWeight: 800, textDecoration: 'none' }}>
            🆘 밤이거나 응급이라면 — 응급 가이드 바로가기
          </Link>
        </div>
      </section>

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '28px 20px 60px' }}>
        {/* 검색 */}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="병원 이름·동네로 검색 (예: 스카이, 교동)"
          style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 15, color: '#111', boxSizing: 'border-box', fontFamily: MONO, background: '#fff' }}
        />

        {/* 시군 칩 */}
        {!q.trim() && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
            {SIGUNGU_ORDER.map((sg) => {
              const on = sigungu === sg;
              return (
                <button
                  key={sg}
                  onClick={() => setSigungu(sg)}
                  style={{ fontSize: 12.5, padding: '8px 14px', borderRadius: 9999, cursor: 'pointer', fontWeight: 700, fontFamily: MONO,
                    border: on ? `1.5px solid ${TEAL_DK}` : '1.5px solid #e5e7eb', background: on ? '#EDFAF8' : '#fff', color: on ? TEAL_DK : '#6b7280' }}
                >
                  {sg.replace(/(시|군)$/, '')} {counts[sg] || 0}
                </button>
              );
            })}
          </div>
        )}

        {/* 결과 */}
        <div style={{ fontSize: 13, color: '#6b7280', margin: '18px 0 10px' }}>
          {q.trim() ? `'${q.trim()}' 검색 결과 ` : `${sigungu} `}<b style={{ color: '#111' }}>{list.length}</b>곳
          <span style={{ color: '#9ca3af' }}> · 진료시간·휴무는 병원마다 달라요 — 방문 전 전화 확인을 추천해요</span>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {list.map((v) => (
            <div key={v.sigungu + v.name + v.address} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#111', wordBreak: 'keep-all' }}>{v.name}</span>
                {q.trim() && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 9999, background: '#EDFAF8', color: TEAL_DK }}>{v.sigungu}</span>}
              </div>
              <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, wordBreak: 'keep-all' }}>📍 {v.sigungu} {v.address}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <a href={`https://map.kakao.com/?q=${mapQuery(v.name, v.sigungu)}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12.5, fontWeight: 800, padding: '9px 16px', borderRadius: 9, background: '#FEE500', color: '#191919', textDecoration: 'none' }}>
                  카카오맵 — 전화·후기·길찾기
                </a>
                <a href={`https://map.naver.com/p/search/${mapQuery(v.name, v.sigungu)}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12.5, fontWeight: 800, padding: '9px 16px', borderRadius: 9, background: '#03C75A', color: '#fff', textDecoration: 'none' }}>
                  네이버지도 — 리뷰 보기
                </a>
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <p style={{ fontSize: 13, color: '#9ca3af', padding: '40px 0', textAlign: 'center' }}>검색 결과가 없어요. 다른 이름이나 동네로 찾아보세요.</p>
          )}
        </div>

        {/* 출처·안내 */}
        <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.7, marginTop: 24, wordBreak: 'keep-all' }}>
          ※ 출처: 강원특별자치도 동물병원 현황 (2025. 2. 기준, 18개 시군 162개소). 신규 개원·폐업이 반영되지 않았을 수
          있어요 — 지도 버튼에서 최신 영업 정보와 이용자 후기를 꼭 확인하세요. 목록에 군·축협 소속 등 일반 진료를
          하지 않는 기관이 일부 포함될 수 있습니다. 잘못된 정보는 <a href="/contact" style={{ color: TEAL_DK }}>협회에 알려주세요</a>.
        </p>
      </div>
    </main>
  );
}
