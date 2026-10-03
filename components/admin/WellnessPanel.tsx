'use client';

/**
 * 관리자 > 웰니스 설문 — 원주 2026 웰니스클럽 3D 행사장 페이지의
 * 만족도조사 응답(경품존 6번째 도장)과 스탬프 투어 스캔 현황을 보여준다.
 * 데이터: GET /api/wonju-2026/survey, GET /api/wonju-2026/stamp
 */
import { useCallback, useEffect, useRef, useState } from 'react';

type Row = {
  id?: number; rating: number; best: string[]; how: string | null; from_region: string | null;
  again: string | null; comment: string | null; stamps: string[]; device_id: string | null; created_at: string;
};
type Summary = {
  total: number; avgRating: number; ratingDist: number[]; withComment: number;
  best: Record<string, number>; how: Record<string, number>; from: Record<string, number>; again: Record<string, number>;
};
type StampSummary = { byStamp: Record<string, number>; participants: number; games5: number; all6: number };

const EVENT = 'wonju-2026';
const STAMP_LABEL: Record<string, string> = { g4: 'D · 게임4', g5: 'C · 게임5', g6: 'A · 게임6', g7: 'B · 게임7', g8: 'E · 게임8', survey: '★ 설문' };
const STAMP_ORDER = ['g4', 'g5', 'g6', 'g7', 'g8', 'survey'];

async function fetchAll(): Promise<[{ rows?: Row[]; summary?: Summary }, StampSummary]> {
  return Promise.all([
    fetch(`/api/wonju-2026/survey?event=${EVENT}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`설문 ${r.status}`)))),
    fetch(`/api/wonju-2026/stamp?event=${EVENT}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`스탬프 ${r.status}`)))),
  ]);
}

const card: React.CSSProperties = { background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '20px 22px' };
const h2: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 14 };
const big: React.CSSProperties = { fontFamily: "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif", fontSize: 34, color: '#111', lineHeight: 1 };
const small: React.CSSProperties = { fontSize: 11, color: '#9ca3af', letterSpacing: '0.05em', marginBottom: 6 };
const btn = (primary = false): React.CSSProperties => ({
  fontSize: 12, fontFamily: "system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif", padding: '8px 18px', borderRadius: 6, cursor: 'pointer', fontWeight: 700,
  border: `1.5px solid ${primary ? '#16a34a' : '#e5e7eb'}`, background: primary ? '#f0fdf4' : 'none', color: primary ? '#166534' : '#6b7280',
});

function Bars({ data, total, order }: { data: Record<string, number>; total: number; order?: string[] }) {
  const keys = order ?? Object.keys(data).sort((a, b) => (data[b] ?? 0) - (data[a] ?? 0));
  if (!keys.length) return <div style={{ fontSize: 12, color: '#9ca3af' }}>아직 응답이 없습니다</div>;
  const max = Math.max(1, ...keys.map((k) => data[k] ?? 0));
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {keys.map((k) => {
        const n = data[k] ?? 0;
        return (
          <div key={k} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 64px', alignItems: 'center', gap: 10, fontSize: 12 }}>
            <span style={{ color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k}</span>
            <div style={{ height: 10, background: '#f3f4f6', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ width: `${(n / max) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#4ade80,#16a34a)', borderRadius: 5 }} />
            </div>
            <span style={{ color: '#6b7280', textAlign: 'right' }}>{n}{total ? ` · ${Math.round((n / total) * 100)}%` : ''}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function WellnessPanel({ onToast }: { onToast?: (msg: string, err?: boolean) => void }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [sum, setSum] = useState<Summary | null>(null);
  const [st, setSt] = useState<StampSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlyComment, setOnlyComment] = useState(false);
  // 부모의 showToast는 렌더마다 새 함수 → ref로 받아 load가 매 렌더 재생성되지 않게 함
  const toastRef = useRef(onToast);
  useEffect(() => { toastRef.current = onToast; }, [onToast]);

  // 최초 1회는 effect에서, 이후는 새로고침 버튼에서 호출. 상태 갱신은 모두 콜백(비동기)에서만.
  const load = useCallback(() =>
    fetchAll()
      .then(([s, t]) => { setRows(s.rows ?? []); setSum(s.summary ?? null); setSt(t ?? null); })
      .catch((e) => { toastRef.current?.(`불러오기 실패: ${e instanceof Error ? e.message : String(e)}`, true); })
      .finally(() => setLoading(false)),
  []);
  useEffect(() => { load(); }, [load]);

  const paw = (n: number) => '🐾'.repeat(n) + '·'.repeat(5 - n);
  const list = onlyComment ? rows.filter((r) => (r.comment || '').trim()) : rows;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', var(--font-gothic), 'Apple SD Gothic Neo', sans-serif", fontSize: 32, color: '#111', marginBottom: 4 }}>웰니스 설문 · 스탬프</h1>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>제4회 원주시 반려동물 문화행사 WELLNESS CLUB (10.17) — 3D 행사장 페이지 만족도조사 · 스탬프 투어 현황</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setLoading(true); load(); }} style={btn(true)} disabled={loading}>{loading ? '불러오는 중…' : '↻ 새로고침'}</button>
          <a href={`/api/wonju-2026/survey?event=${EVENT}&format=csv`} style={{ ...btn(), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>CSV 내보내기</a>
          <a href="/wonju-2026/3d.html" target="_blank" rel="noreferrer" style={{ ...btn(), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>3D 행사장 열기 ↗</a>
        </div>
      </div>

      {/* 숫자 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 20 }}>
        {[
          { label: '설문 응답', num: sum?.total ?? 0, sub: '경품존 · 6번째 도장' },
          { label: '평균 만족도', num: sum ? sum.avgRating.toFixed(2) : '–', sub: '발바닥 5점 만점' },
          { label: '의견 남김', num: sum?.withComment ?? 0, sub: '자유 의견 작성' },
          { label: '스탬프 참여', num: st?.participants ?? 0, sub: 'QR 1개 이상 찍은 기기' },
          { label: '게임 5개 완주', num: st?.games5 ?? 0, sub: '미니게임 도장 모두' },
          { label: '도장 6개 완성', num: st?.all6 ?? 0, sub: '설문까지 · 경품 대상' },
        ].map(({ label, num, sub }) => (
          <div key={label} style={card}>
            <div style={small}>{label}</div>
            <div style={big}>{num}</div>
            <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* 집계 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div style={card}>
          <div style={h2}>만족도 분포</div>
          <Bars data={{ '🐾×5 아주 좋아요': sum?.ratingDist[4] ?? 0, '🐾×4': sum?.ratingDist[3] ?? 0, '🐾×3': sum?.ratingDist[2] ?? 0, '🐾×2': sum?.ratingDist[1] ?? 0, '🐾×1 아쉬워요': sum?.ratingDist[0] ?? 0 }} total={sum?.total ?? 0} order={['🐾×5 아주 좋아요', '🐾×4', '🐾×3', '🐾×2', '🐾×1 아쉬워요']} />
        </div>
        <div style={card}>
          <div style={h2}>가장 좋았던 곳 (복수 선택)</div>
          <Bars data={sum?.best ?? {}} total={sum?.total ?? 0} />
        </div>
        <div style={card}>
          <div style={h2}>어떻게 알게 됐나요</div>
          <Bars data={sum?.how ?? {}} total={sum?.total ?? 0} />
        </div>
        <div style={card}>
          <div style={h2}>어디서 오셨나요</div>
          <Bars data={sum?.from ?? {}} total={sum?.total ?? 0} />
        </div>
        <div style={card}>
          <div style={h2}>다음에도 오실 건가요</div>
          <Bars data={sum?.again ?? {}} total={sum?.total ?? 0} />
        </div>
        <div style={card}>
          <div style={h2}>스탬프별 QR 스캔 수</div>
          <Bars data={Object.fromEntries(STAMP_ORDER.map((k) => [STAMP_LABEL[k], st?.byStamp[k] ?? 0]))} total={st?.participants ?? 0} order={STAMP_ORDER.map((k) => STAMP_LABEL[k])} />
        </div>
      </div>

      {/* 응답 목록 */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setOnlyComment(false)} style={{ ...btn(!onlyComment) }}>전체 {rows.length}</button>
        <button onClick={() => setOnlyComment(true)} style={{ ...btn(onlyComment) }}>의견 있는 응답만 {sum?.withComment ?? 0}</button>
      </div>
      <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'auto' }}>
        {list.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
            아직 응답이 없습니다. 행사 당일 경품존(26) 안내판의 만족도조사 QR을 찍으면 여기에 쌓입니다.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f9fafb', color: '#6b7280', textAlign: 'left' }}>
                {['#', '제출일시', '만족도', '좋았던 곳', '알게 된 경로', '지역', '재방문', '의견', '게임 도장'].map((h) => (
                  <th key={h} style={{ padding: '10px 12px', fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => (
                <tr key={r.id ?? i} style={{ borderBottom: '1px solid #f3f4f6', verticalAlign: 'top' }}>
                  <td style={{ padding: '10px 12px', color: '#9ca3af' }}>{r.id ?? ''}</td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#374151' }}>{new Date(r.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }} title={`${r.rating}점`}>{paw(r.rating)}</td>
                  <td style={{ padding: '10px 12px', color: '#374151' }}>{(r.best || []).join(', ')}</td>
                  <td style={{ padding: '10px 12px', color: '#374151', whiteSpace: 'nowrap' }}>{r.how ?? ''}</td>
                  <td style={{ padding: '10px 12px', color: '#374151', whiteSpace: 'nowrap' }}>{r.from_region ?? ''}</td>
                  <td style={{ padding: '10px 12px', color: '#374151', whiteSpace: 'nowrap' }}>{r.again ?? ''}</td>
                  <td style={{ padding: '10px 12px', color: '#111', minWidth: 220, whiteSpace: 'pre-wrap' }}>{r.comment ?? ''}</td>
                  <td style={{ padding: '10px 12px', color: '#6b7280', whiteSpace: 'nowrap' }}>{(r.stamps || []).filter((s) => s !== 'survey').length}/5</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
