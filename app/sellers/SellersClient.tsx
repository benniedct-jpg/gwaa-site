'use client';

import { useState, useEffect } from 'react';

const MONO = "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const BEBAS = "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif";
const GREEN = '#12A79D';
const GREEN_DK = '#0D7E76';

export type OpenEvent = { id: number; title: string; date: string; loc: string };

const CATEGORIES = ['반려동물 수제간식', '반려동물 용품·의류', '반려동물 소품·액세서리', '수제 디저트·푸드', '핸드메이드·소품', '체험·프로그램', '기타'];

export default function SellersClient({ events }: { events: OpenEvent[] }) {
  const [eventId, setEventId] = useState<number>(events[0]?.id ?? 0);
  const [brand, setBrand] = useState('');
  const [rep, setRep] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [items, setItems] = useState('');
  const [joinType, setJoinType] = useState<'sponsor' | 'fee'>('sponsor');
  const [sponsorItems, setSponsorItems] = useState('');
  const [power, setPower] = useState(false);
  const [table, setTable] = useState(false);
  const [vehicle, setVehicle] = useState('');
  const [sns, setSns] = useState('');
  const [strengths, setStrengths] = useState('');
  const [logoData, setLogoData] = useState('');   // base64 data URL
  const [logoName, setLogoName] = useState('');
  const [bizNo, setBizNo] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [locked, setLocked] = useState(false); // 특정 행사 페이지에서 진입 시 행사 고정
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState<{ brand: string; already: boolean; join: 'sponsor' | 'fee' } | null>(null);

  const ev = events.find((e) => e.id === eventId);

  // 행사 상세에서 넘어온 ?event=ID 가 있으면 해당 행사로 고정 (오분류 방지 · 드롭다운 숨김)
  useEffect(() => {
    const q = Number(new URLSearchParams(window.location.search).get('event'));
    if (q && events.some((e) => e.id === q)) { setEventId(q); setLocked(true); }
  }, [events]);

  const pickLogo = (f: File | null) => {
    if (!f) { setLogoData(''); setLogoName(''); return; }
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(f.type)) {
      setMsg('로고는 PNG·JPG·WebP 이미지로 올려주세요. (SVG·기타 형식은 받을 수 없어요)'); return;
    }
    if (f.size > 3 * 1024 * 1024) { setMsg('로고 파일은 3MB 이하로 올려주세요.'); return; }
    const reader = new FileReader();
    reader.onload = () => { setLogoData(String(reader.result || '')); setLogoName(f.name); setMsg(''); };
    reader.readAsDataURL(f);
  };

  const submit = async () => {
    if (!brand.trim() || !rep.trim() || !phone.trim()) { setMsg('브랜드명·대표자·연락처를 입력해 주세요.'); return; }
    if (joinType === 'sponsor' && !sponsorItems.trim()) { setMsg('후원물품 제공을 선택하셨어요. 제공하실 물품·수량을 적어주세요.'); return; }
    if (!agree) { setMsg('개인정보 수집·이용 동의가 필요합니다.'); return; }
    setBusy(true); setMsg('');
    try {
      const r = await fetch('/api/sellers/apply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId, brand_name: brand.trim(), rep_name: rep.trim(), phone: phone.trim(),
          email: email.trim(), category, items: items.trim(),
          join_type: joinType, sponsor_items: sponsorItems.trim(),
          needs_power: power, needs_table: table, vehicle: vehicle.trim(),
          sns: sns.trim(), biz_no: bizNo.trim(), privacy_agreed: agree,
          strengths: strengths.trim(), logo_base64: logoData || undefined,
        }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) { setMsg(j.error || '신청 처리에 실패했어요. (문의 033-813-0333)'); setBusy(false); return; }
      setDone({ brand: brand.trim(), already: !!j.already, join: joinType });
    } catch { setMsg('처리 중 오류가 발생했어요.'); setBusy(false); }
  };

  const wrap: React.CSSProperties = { minHeight: '100vh', background: '#eef2f0', fontFamily: MONO, padding: '24px 16px' };
  const card: React.CSSProperties = { maxWidth: 460, margin: '0 auto', background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 6px 24px rgba(0,0,0,0.06)' };
  const inp: React.CSSProperties = { width: '100%', padding: '13px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 15, color: '#111', boxSizing: 'border-box', fontFamily: MONO };
  const lab: React.CSSProperties = { fontSize: 12.5, fontWeight: 800, color: '#374151', margin: '2px 0 6px' };
  const sectionTitle: React.CSSProperties = { fontSize: 13, fontWeight: 800, color: GREEN_DK, margin: '18px 0 8px', paddingTop: 14, borderTop: '1px solid #f0f0f0' };

  if (!events.length) {
    return (
      <div style={wrap}><div style={{ ...card, padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🛍️</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 8 }}>현재 모집 중인 셀러가 없어요</div>
        <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>다음 프리마켓 셀러 모집을 준비 중입니다.<br />문의 033-813-0333</div>
      </div></div>
    );
  }

  if (done) {
    return (
      <div style={wrap}><div style={{ ...card, padding: '36px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>🎉</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 8 }}>{done.already ? '이미 신청되어 있어요' : '셀러 신청 완료!'}</div>
        <div style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7 }}>
          {done.brand} 님, {done.already ? '동일한 연락처로 접수된 신청이 있어요.' : '신청이 접수되었어요.'}<br />
          협회 심사 후 <b>선정 결과를 개별 안내</b>드립니다.
        </div>
        <div style={{ background: '#EDFAF8', border: '1px solid #BFF3EC', borderRadius: 12, padding: '14px 16px', margin: '18px 0', fontSize: 13, color: GREEN_DK, lineHeight: 1.7, textAlign: 'left' }}>
          · 심사는 신청 순·품목 구성 등을 종합 검토해요.<br />
          {done.join === 'fee'
            ? <>· <b>선정되면 참가비 2만원 계좌를 개별 안내</b>드려요. (참가비는 올바른 반려문화 확산을 위해 사용돼요)<br /></>
            : <>· 후원물품은 선정 후 협회와 <b>전달 방법을 안내</b>드려요.<br /></>}
          · 결과 안내까지 며칠 소요될 수 있어요.<br />
          · 문의 033-813-0333
        </div>
      </div></div>
    );
  }

  return (
    <div style={wrap}><div style={card}>
      <div style={{ background: GREEN_DK, padding: '26px 22px', textAlign: 'center' }}>
        <div style={{ color: '#BFF3EC', fontSize: 11, letterSpacing: '0.18em', fontWeight: 700 }}>FLEA MARKET · SELLER</div>
        <div style={{ fontFamily: BEBAS, color: '#fff', fontSize: 27, letterSpacing: '0.02em', marginTop: 6 }}>프리마켓 셀러 모집</div>
        <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 12.5, marginTop: 5 }}>후원물품 제공 시 참가비 무료 · 또는 참가비 2만원</div>
      </div>
      <div style={{ padding: '22px 22px 28px' }}>
        {/* 행사 선택 — 행사 페이지에서 진입(locked)했거나 행사가 하나면 고정 표시 */}
        {events.length > 1 && !locked ? (
          <>
            <div style={lab}>참가 행사</div>
            <select value={eventId} onChange={(e) => setEventId(Number(e.target.value))} style={{ ...inp, marginBottom: 6 }}>
              {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </>
        ) : (
          <div style={{ background: '#EDFAF8', border: '1px solid #BFF3EC', borderRadius: 10, padding: '12px 14px', marginBottom: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{ev?.title}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{ev?.date}{ev?.loc ? ` · ${ev.loc}` : ''}</div>
          </div>
        )}

        <div style={sectionTitle}>기본 정보</div>
        <div style={{ display: 'grid', gap: 10 }}>
          <div><div style={lab}>브랜드/상호명 *</div><input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="예) 멍냥공방" style={inp} /></div>
          <div><div style={lab}>대표자명 *</div><input value={rep} onChange={(e) => setRep(e.target.value)} placeholder="이름" style={inp} /></div>
          <div><div style={lab}>연락처 *</div><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" type="tel" style={inp} /></div>
          <div><div style={lab}>이메일</div><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="선정 결과 안내용 (선택)" type="email" style={inp} /></div>
          <div>
            <div style={lab}>판매 카테고리</div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={inp}>
              <option value="">선택해 주세요</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><div style={lab}>판매 품목 상세</div><textarea value={items} onChange={(e) => setItems(e.target.value)} placeholder="어떤 상품을 판매하실지 적어주세요" rows={3} style={{ ...inp, resize: 'vertical' }} /></div>
        </div>

        <div style={sectionTitle}>참가 방식 (택1)</div>
        <div style={{ fontSize: 11.5, color: '#6b7280', marginBottom: 10, lineHeight: 1.6 }}>참가비는 올바른 반려문화 확산을 위해 사용돼요. 후원물품(방문객 나눔·경품용)을 제공하시면 참가비가 면제됩니다.</div>
        <div style={{ display: 'grid', gap: 8 }}>
          {([
            { k: 'sponsor', t: '후원물품 제공 (참가비 무료)', d: '방문객 나눔·경품용 물품 제공 → 참가비 면제' },
            { k: 'fee', t: '참가비 2만원', d: '선정 후 계좌이체 안내 · 올바른 반려문화 확산에 사용' },
          ] as const).map((o) => {
            const on = joinType === o.k;
            return (
              <button key={o.k} onClick={() => setJoinType(o.k)}
                style={{ textAlign: 'left', padding: '13px 14px', borderRadius: 12, cursor: 'pointer', fontFamily: MONO,
                  border: on ? `2px solid ${GREEN}` : '1.5px solid #e5e7eb', background: on ? '#EDFAF8' : '#fff' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{on ? '● ' : '○ '}{o.t}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{o.d}</div>
              </button>
            );
          })}
        </div>
        {joinType === 'sponsor' && (
          <div style={{ marginTop: 10 }}>
            <div style={lab}>제공 후원물품 (내용·수량) *</div>
            <textarea value={sponsorItems} onChange={(e) => setSponsorItems(e.target.value)} placeholder="예) 수제간식 30개 · 반려견 장난감 20개 (약 2만원 상당)" rows={2} style={{ ...inp, resize: 'vertical' }} />
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>※ 협회 심사 시 물품 구성을 확인해요. 대략 2만원 상당을 권장합니다.</div>
          </div>
        )}

        <div style={sectionTitle}>부스 요구사항</div>
        <div style={{ display: 'grid', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#111', cursor: 'pointer' }}>
            <input type="checkbox" checked={power} onChange={(e) => setPower(e.target.checked)} style={{ width: 18, height: 18 }} /> 전기 사용 필요
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#111', cursor: 'pointer' }}>
            <input type="checkbox" checked={table} onChange={(e) => setTable(e.target.checked)} style={{ width: 18, height: 18 }} /> 테이블/의자 대여 필요
          </label>
          <div><div style={lab}>차량 진입 (차종/번호)</div><input value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="현장 진입 차량이 있으면 적어주세요 (선택)" style={inp} /></div>
        </div>

        <div style={sectionTitle}>브랜드 소개 (선택이지만 강력 추천!)</div>
        <div style={{ background: '#EDFAF8', border: '1px solid #BFF3EC', borderRadius: 10, padding: '10px 14px', marginBottom: 10, fontSize: 12.5, color: '#0A5F59', lineHeight: 1.65 }}>
          아래 정보는 <b>행사장 지도·홈페이지 부스 소개·현장 MC 멘트</b>에 그대로 쓰여요.
          꼼꼼히 적어주실수록 방문객에게 부스가 더 돋보입니다.
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <div style={lab}>인스타그램 / SNS</div>
            <input value={sns} onChange={(e) => setSns(e.target.value)} placeholder="예: @gwaa_market 또는 스마트스토어 링크" style={inp} />
            <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 5 }}>행사장 지도와 홈페이지 부스 소개에서 바로 연결돼요</div>
          </div>
          <div>
            <div style={lab}>브랜드 로고</div>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => pickLogo(e.target.files?.[0] ?? null)} style={{ ...inp, padding: '10px 12px' }} />
            {logoData && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoData} alt="로고 미리보기" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }} />
                <span style={{ fontSize: 12, color: '#6b7280' }}>{logoName}</span>
                <button type="button" onClick={() => pickLogo(null)} style={{ fontSize: 11.5, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>삭제</button>
              </div>
            )}
            <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 5, lineHeight: 1.6 }}>
              PNG·JPG · 3MB 이하 · <b>배경 투명 PNG + 정방형</b>이면 가장 예쁘게 실려요<br />
              행사장 지도·3D맵·홈페이지 부스 소개에 노출됩니다
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={lab}>우리 브랜드의 강점·특장점</div>
              <span style={{ fontSize: 11, color: strengths.length > 100 ? '#dc2626' : '#9ca3af' }}>{strengths.length}/120</span>
            </div>
            <textarea value={strengths} onChange={(e) => setStrengths(e.target.value.slice(0, 120))} rows={3} maxLength={120}
              placeholder={'예: 전 제품 국내산 수제·무방부제 간식 / 알러지 맞춤 상담 가능\n한두 문장이 좋아요 — 현장에서 MC가 이 문구로 부스를 소개해요'}
              style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
            <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 5 }}>부스 소개 문구와 현장 MC 멘트에 그대로 활용돼요</div>
          </div>
          <div><div style={lab}>사업자등록번호</div><input value={bizNo} onChange={(e) => setBizNo(e.target.value)} placeholder="000-00-00000 (선택)" style={inp} /></div>
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12.5, color: '#374151', cursor: 'pointer', marginTop: 20, lineHeight: 1.6, background: '#f9fafb', border: '1px solid #eee', borderRadius: 10, padding: '12px 14px' }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 18, height: 18, marginTop: 1, flexShrink: 0 }} />
          <span><b>[필수]</b> 개인정보 수집·이용 동의 — 셀러 선정·행사 운영·연락을 위해 브랜드명·대표자명·연락처·이메일을 수집하며, 행사 종료 후 관련 법령에 따라 보관 후 파기합니다. 제출하신 브랜드 로고·SNS·소개 문구는 행사장 지도, 홈페이지, 현장 안내 등 행사 홍보에 활용될 수 있습니다.</span>
        </label>

        <button disabled={busy} onClick={submit}
          style={{ width: '100%', marginTop: 18, padding: '16px', borderRadius: 12, border: 'none', background: busy ? '#d1d5db' : GREEN, color: '#fff', fontSize: 16, fontWeight: 800, cursor: busy ? 'default' : 'pointer', fontFamily: MONO }}>
          {busy ? '접수 중…' : '셀러 신청하기'}
        </button>
        {msg && <div style={{ fontSize: 12.5, color: '#dc2626', marginTop: 12, lineHeight: 1.6 }}>{msg}</div>}
        <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 16, lineHeight: 1.7, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
          ※ 신청 후 협회 심사를 거쳐 선정 결과를 개별 안내드립니다.<br />※ 문의 033-813-0333
        </div>
      </div>
    </div></div>
  );
}
