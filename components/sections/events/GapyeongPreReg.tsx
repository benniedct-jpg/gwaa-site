'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";

const TIMETABLE = [
  { time: '11:00 – 11:30', prog: '입장 및 승차권 배부',  icon: '🎟️' },
  { time: '11:30 – 12:30', prog: '명다방 신청곡',        icon: '🎵' },
  { time: '12:30 – 13:30', prog: '빙고게임',             icon: '🎯' },
  { time: '13:30 – 14:30', prog: '어쿠스틱 라이브 열차', icon: '🎸' },
  { time: '14:30 – 15:00', prog: '댕댕자랑',             icon: '🐾' },
  { time: '15:00 – 16:30', prog: '댕댕 OX 퀴즈',        icon: '❓' },
  { time: '15:30 – 16:30', prog: '7080 라이브',          icon: '🎤' },
  { time: '16:30 – 17:00', prog: '폐회식',               icon: '🎉' },
];

const WORKSHOPS = [
  '반려견 샴푸 만들기',
  '반려견 치약 만들기',
  '반려견 케이크 만들기',
  '달고나 만들기',
];

const ALWAYS = [
  '반려견 기초 건강검진',
  '유기견 입양 상담',
  '셀러부스',
  '책방 코너',
  '푸드트럭',
  '피크닉존',
];

const HOOKS = [
  { icon: '🎟️', label: '입장 무료' },
  { icon: '🎵', label: '7080 라이브' },
  { icon: '🧪', label: '무료 워크숍 4종' },
  { icon: '📚', label: '책방 코너' },
  { icon: '🐾', label: '반려견 동반 OK' },
];

export default function GapyeongPreReg() {
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<string[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', count: '1' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const toggle = (w: string) =>
    setSelected((prev) => prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]);

  const submit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !selected.length) {
      setErrMsg('이름, 연락처, 체험 프로그램을 모두 선택해 주세요.');
      return;
    }
    setStatus('loading');
    setErrMsg('');
    try {
      const r = await fetch('/api/events/prereg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: 8, ...form, workshops: selected }),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error || '오류');
      }
      setStatus('done');
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : '오류가 발생했습니다.');
      setStatus('error');
    }
  };

  return (
    <div style={{ marginTop: 48 }}>

      {/* 훅 — 무드 카피 + 핵심 칩 */}
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: isMobile ? 20 : 25, fontWeight: 800, color: '#111', lineHeight: 1.4, marginBottom: 16, wordBreak: 'keep-all', letterSpacing: '-0.02em' }}>
          7080 레트로 음악이 흐르는 옛 가평역 터에서,<br />반려견과 함께 느리게 보내는 토요일.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {HOOKS.map((h) => (
            <span key={h.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#EDFAF8', border: '1px solid #BFF3EC', color: '#0D7E76', fontWeight: 700, fontSize: isMobile ? 12.5 : 13, padding: '7px 14px', borderRadius: 9999 }}>
              <span>{h.icon}</span> {h.label}
            </span>
          ))}
        </div>
        <p style={{ fontSize: isMobile ? 14 : 15, color: '#4b5563', lineHeight: 1.8, wordBreak: 'keep-all' }}>
          입장하면 직접 받는 <b style={{ color: '#111' }}>종이 승차권</b>, 댕댕자랑·빙고·OX 퀴즈로 이어지는 프로그램, 무료 반려견 워크숍, 책방에서 빌린 책을 피크닉존에서 읽는 오후 — 반려동물 없이 오셔도 충분히 즐기실 수 있습니다.
        </p>
      </div>

      {/* 3D 행사장 미리보기 — 원주 웰니스클럽과 동일 패턴 */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ width: 22, height: 3, background: '#c8762a', borderRadius: 2 }} />
          <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', color: '#c8762a' }}>3D PREVIEW</span>
        </div>
        <a
          href="/gapyeong-2026/3d.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', textDecoration: 'none', borderRadius: 16, overflow: 'hidden', background: '#2a1a08', color: '#f4ead2' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '5fr 4fr' }}>
            {/* 썸네일 */}
            <div style={{ background: '#1d1206', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/gapyeong-2026/og-3d.jpg"
                alt="멍춘선 1939 행사장 3D 전경 — 무대·체험부스 A–F·M 스테이션·셀러부스·책방 코너"
                style={{ width: '100%', aspectRatio: '1200/630', objectFit: 'cover', display: 'block' }}
              />
            </div>
            {/* 설명 */}
            <div style={{ padding: isMobile ? '20px 20px 24px' : '28px 26px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', color: '#d8a86a', fontWeight: 700 }}>11.14 (토) · 가평 음악역 1939</div>
              <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.01em', wordBreak: 'keep-all' }}>
                행사장을 3D로<br />미리 둘러보세요
              </div>
              <p style={{ fontSize: isMobile ? 13 : 14, color: '#d9c7a8', lineHeight: 1.7, margin: 0, wordBreak: 'keep-all' }}>
                무대 시간표, 체험부스 A–F, 셀러·책방, 주차장 위치를 하늘에서 보고, 멍춘선 강아지로 직접 걸어서도 둘러볼 수 있어요.
              </p>
              {/* 기능 뱃지 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['무대 시간표', '존별 탐색', '걸어서 보기', '체험부스 A–F', '우리 강아지'].map((t) => (
                  <span key={t} style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, letterSpacing: '0.05em', padding: '4px 9px', borderRadius: 99, border: '1px solid rgba(244,234,210,0.3)', color: '#e8d8b8' }}>{t}</span>
                ))}
              </div>
              {/* CTA */}
              <div style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 8, background: '#c8762a', color: '#2a1a08', fontSize: 14, fontWeight: 800, alignSelf: 'flex-start' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                3D로 행사장 미리보기
              </div>
            </div>
          </div>
        </a>
      </div>

      {/* 프로그램 이미지 (카드뉴스) */}
      <div style={{ marginBottom: 40, borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <Image
          src="/images/events/gapyeong-2026/program.png"
          alt="멍춘선 1939 시간별 프로그램 및 행사장 안내"
          width={800}
          height={1000}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          priority={false}
        />
      </div>

      {/* 시간표 */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontFamily: "'Bebas Neue',var(--font-gothic),sans-serif", fontSize: isMobile ? 24 : 28, color: '#111', letterSpacing: '0.02em' }}>
            시간별 프로그램
          </span>
        </div>
        <div style={{ border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          {TIMETABLE.map((row, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1.6fr' : '160px 1fr',
              borderBottom: i < TIMETABLE.length - 1 ? '1px solid #f0f0f0' : 'none',
            }}>
              <div style={{
                padding: isMobile ? '14px 16px' : '16px 24px',
                background: '#f8fafb',
                fontFamily: MONO,
                fontSize: isMobile ? 12 : 13,
                fontWeight: 700,
                color: '#374151',
                letterSpacing: '0.02em',
                borderRight: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
              }}>
                {row.time}
              </div>
              <div style={{
                padding: isMobile ? '14px 16px' : '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontFamily: MONO,
                fontSize: isMobile ? 13 : 14,
                fontWeight: 600,
                color: '#111',
              }}>
                <span>{row.icon}</span>
                {row.prog}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 상시 프로그램 */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: "'Bebas Neue',var(--font-gothic),sans-serif", fontSize: isMobile ? 24 : 28, color: '#111', letterSpacing: '0.02em', marginBottom: 16 }}>
          상시 프로그램
        </div>
        <div style={{ background: '#1B5E4A', borderRadius: 14, padding: isMobile ? '20px 20px' : '24px 28px' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: '#6EE7D8', letterSpacing: '0.1em', marginBottom: 12 }}>
            무료 체험 워크숍
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', marginBottom: 16 }}>
            {WORKSHOPS.map((w) => (
              <span key={w} style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 600, color: '#fff' }}>
                · {w}
              </span>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 14, display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
            {ALWAYS.map((a) => (
              <span key={a} style={{ fontFamily: MONO, fontSize: 12.5, color: 'rgba(255,255,255,0.75)' }}>
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 책방 코너 */}
      <div style={{ marginBottom: 48, borderRadius: 14, border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ background: '#faf7f0', padding: isMobile ? '18px 20px 14px' : '20px 24px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: '#92400e', letterSpacing: '0.1em' }}>BOOK CORNER</span>
          <div style={{ fontFamily: "'Bebas Neue',var(--font-gothic),sans-serif", fontSize: isMobile ? 22 : 26, color: '#111', letterSpacing: '0.02em', marginTop: 4 }}>책방 코너</div>
        </div>
        <div style={{ padding: isMobile ? '16px 20px' : '18px 24px', background: '#fff' }}>
          <p style={{ fontFamily: MONO, fontSize: isMobile ? 13.5 : 14, color: '#374151', lineHeight: 1.8, margin: 0, wordBreak: 'keep-all' }}>
            마음에 드는 책을 <b>무료로 빌려</b> 읽고, 소장하고 싶은 책은 <b>중고 가격</b>으로 구매하세요.<br />
            결제는 현금 또는 포트럭 가격으로 가능합니다.
          </p>
          <p style={{ fontFamily: MONO, fontSize: 12, color: '#9ca3af', marginTop: 10, lineHeight: 1.6 }}>
            피크닉존 돗자리 위에서, 반려견 옆에 앉아 — 가을 오후가 느려집니다.
          </p>
        </div>
      </div>

      {/* 장소 안내 */}
      <div style={{ marginBottom: 48, padding: isMobile ? '20px' : '24px 28px', background: '#f8fafb', borderRadius: 14, border: '1px solid #e5e7eb' }}>
        <div style={{ fontFamily: "'Bebas Neue',var(--font-gothic),sans-serif", fontSize: isMobile ? 22 : 26, color: '#111', letterSpacing: '0.02em', marginBottom: 14 }}>장소 안내</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ flexShrink: 0, fontFamily: MONO, fontSize: 12, fontWeight: 700, color: '#6b7280', paddingTop: 2 }}>주소</span>
            <span style={{ fontFamily: MONO, fontSize: isMobile ? 13 : 14, color: '#111', lineHeight: 1.6 }}>경기도 가평군 가평읍 가평로 61 (가평뮤직빌리지 음악역 1939, 구 가평역 터)</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ flexShrink: 0, fontFamily: MONO, fontSize: 12, fontWeight: 700, color: '#6b7280', paddingTop: 2 }}>주차</span>
            <span style={{ fontFamily: MONO, fontSize: isMobile ? 13 : 14, color: '#374151', lineHeight: 1.6 }}>행사장 인근 주차 가능. 주말 가평 혼잡 예상 — 대중교통(경춘선 가평역 도보 3분) 추천</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ flexShrink: 0, fontFamily: MONO, fontSize: 12, fontWeight: 700, color: '#6b7280', paddingTop: 2 }}>반려견</span>
            <span style={{ fontFamily: MONO, fontSize: isMobile ? 13 : 14, color: '#374151', lineHeight: 1.6 }}>목줄 착용 필수. 대형견은 입마개 권장. 배변봉투 지참 필수.</span>
          </div>
        </div>
      </div>

      {/* 3D 행사장 지도 */}
      <a
        href="/gapyeong-2026/3d.html"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'block', marginBottom: 48, textDecoration: 'none', borderRadius: 16, overflow: 'hidden', border: '1px solid #2a1a0a' }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #1c1209 0%, #2e1c0a 60%, #1a2410 100%)',
          padding: isMobile ? '22px 20px' : '26px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: '#c8762a', letterSpacing: '0.1em', marginBottom: 6 }}>
              3D VENUE MAP
            </div>
            <div style={{ fontFamily: "'Bebas Neue',var(--font-gothic),sans-serif", fontSize: isMobile ? 22 : 26, color: '#f5e6c8', letterSpacing: '0.02em', lineHeight: 1.1, marginBottom: 8 }}>
              행사장 3D 지도
            </div>
            <p style={{ fontFamily: MONO, fontSize: isMobile ? 12.5 : 13, color: 'rgba(245,230,200,0.6)', lineHeight: 1.65, margin: 0, wordBreak: 'keep-all' }}>
              명다방 · 체험부스 · 셀러부스 · 책방 위치를 미리 확인하세요.<br />
              <span style={{ color: '#ffd060' }}>🎁 선물 증정 프로그램</span> 위치도 표시되어 있어요.
            </p>
          </div>
          <div style={{ flexShrink: 0, width: isMobile ? 44 : 52, height: isMobile ? 44 : 52, borderRadius: '50%', border: '1.5px solid rgba(200,118,42,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: isMobile ? 20 : 24 }}>🗺️</span>
          </div>
        </div>
        <div style={{ background: '#14230f', padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: 'rgba(110,231,216,.7)', fontWeight: 600, letterSpacing: '0.03em' }}>가평군 × GWAA · 가평뮤직빌리지 음악역 1939</span>
          <span style={{ fontSize: 14, color: 'rgba(245,230,200,0.5)' }}>↗</span>
        </div>
      </a>

      {/* 사전예약 폼 */}
      <div id="prereg-anchor" style={{
        background: '#EDFAF8',
        border: '1.5px solid #B2E8E2',
        borderRadius: 16,
        padding: isMobile ? '24px 20px' : '32px 36px',
        marginBottom: 8,
      }}>
        <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: '#0D7E76', letterSpacing: '0.1em', marginBottom: 10 }}>
          FREE WORKSHOP PRE-REGISTRATION
        </div>
        <div style={{ fontFamily: "'Bebas Neue',var(--font-gothic),sans-serif", fontSize: isMobile ? 26 : 32, color: '#111', letterSpacing: '0.02em', lineHeight: 1.1, marginBottom: 8 }}>
          무료 체험 워크숍 사전예약
        </div>
        <p style={{ fontFamily: MONO, fontSize: 13, color: '#374151', lineHeight: 1.7, marginBottom: 24 }}>
          현장 선착순이지만, 사전 신청 시 자리가 우선 배정됩니다. 이름과 연락처를 남겨주세요 — 당일 안내 문자를 드립니다.
        </p>

        {status === 'done' ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
            <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: '#0D7E76', marginBottom: 6 }}>
              사전예약이 완료됐어요!
            </div>
            <div style={{ fontFamily: MONO, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
              행사 전날(11월 13일) 안내 문자를 보내드립니다.<br />
              11월 14일(토) 오전 11시, 가평 음악역 1939에서 만나요 🐾
            </div>
          </div>
        ) : (
          <>
            {/* 워크숍 선택 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10, letterSpacing: '0.04em' }}>
                참여할 워크숍 선택 (복수 선택 가능)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 8 }}>
                {WORKSHOPS.map((w) => {
                  const on = selected.includes(w);
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => toggle(w)}
                      style={{
                        padding: '11px 10px',
                        borderRadius: 10,
                        border: `1.5px solid ${on ? '#12A79D' : '#d1d5db'}`,
                        background: on ? '#12A79D' : '#fff',
                        color: on ? '#fff' : '#374151',
                        fontFamily: MONO,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        lineHeight: 1.5,
                        wordBreak: 'keep-all',
                      }}
                    >
                      {on ? '✓ ' : ''}{w}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 이름 */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                이름 *
              </label>
              <input
                type="text"
                placeholder="홍길동"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  border: '1.5px solid #d1d5db', fontFamily: MONO, fontSize: 14,
                  outline: 'none', boxSizing: 'border-box', background: '#fff',
                }}
              />
            </div>

            {/* 연락처 */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                연락처 *
              </label>
              <input
                type="tel"
                placeholder="010-0000-0000"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  border: '1.5px solid #d1d5db', fontFamily: MONO, fontSize: 14,
                  outline: 'none', boxSizing: 'border-box', background: '#fff',
                }}
              />
            </div>

            {/* 참여 인원 */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                참여 인원 (반려견 포함)
              </label>
              <select
                value={form.count}
                onChange={(e) => setForm((f) => ({ ...f, count: e.target.value }))}
                style={{
                  padding: '11px 14px', borderRadius: 10, border: '1.5px solid #d1d5db',
                  fontFamily: MONO, fontSize: 14, background: '#fff', width: 120,
                  outline: 'none',
                }}
              >
                {['1','2','3','4','5명 이상'].map((v) => (
                  <option key={v} value={v}>{v}명</option>
                ))}
              </select>
            </div>

            {errMsg && (
              <div style={{ fontFamily: MONO, fontSize: 12, color: '#dc2626', marginBottom: 14 }}>
                {errMsg}
              </div>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={status === 'loading'}
              style={{
                width: '100%', padding: '15px', borderRadius: 12,
                background: status === 'loading' ? '#6b7280' : '#12A79D',
                color: '#fff', border: 'none', fontFamily: MONO,
                fontSize: 15, fontWeight: 800, cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                letterSpacing: '0.04em', transition: 'background 0.15s',
              }}
            >
              {status === 'loading' ? '신청 중...' : '무료 사전예약 신청하기 →'}
            </button>

            <p style={{ fontFamily: MONO, fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 10, lineHeight: 1.6 }}>
              개인정보(이름·연락처)는 행사 당일 안내 목적으로만 사용되며, 행사 종료 후 즉시 파기됩니다.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
