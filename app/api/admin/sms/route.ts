import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db, type Booking } from '@/lib/bookingsDb';
import { verifyAdmin } from '@/lib/adminAuth';

export const maxDuration = 120;

// EUC-KR 기준 바이트(한글 2, 그 외 1) — SMS/LMS 판정용
const smsBytes = (s: string) => [...s].reduce((n, ch) => n + (ch.charCodeAt(0) > 127 ? 2 : 1), 0);

// 알리고 대량발송(개인화). 500건씩 배치.
async function aligoSend(recipients: { phone: string; msg: string }[], title: string) {
  const key = process.env.ALIGO_API_KEY, uid = process.env.ALIGO_USER_ID, sender = process.env.ALIGO_SENDER;
  if (!key || !uid || !sender) return { ok: false, sent: 0, failed: recipients.length, errors: ['문자 미설정 — ALIGO_API_KEY·ALIGO_USER_ID·ALIGO_SENDER 를 등록하세요.'] };
  const maxLen = recipients.reduce((m, r) => Math.max(m, smsBytes(r.msg)), 0);
  const msg_type = maxLen > 90 ? 'LMS' : 'SMS';
  let sent = 0, failed = 0; const errors: string[] = [];
  for (let i = 0; i < recipients.length; i += 500) {
    const batch = recipients.slice(i, i + 500);
    const p = new URLSearchParams();
    p.set('key', key); p.set('user_id', uid); p.set('sender', sender); p.set('msg_type', msg_type);
    if (msg_type !== 'SMS') p.set('title', title.slice(0, 44));
    p.set('cnt', String(batch.length));
    batch.forEach((r, idx) => { p.set(`rec_${idx + 1}`, r.phone); p.set(`msg_${idx + 1}`, r.msg); });
    try {
      const res = await fetch('https://apis.aligo.in/send_mass/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: p });
      const j = await res.json().catch(() => ({} as { result_code?: string | number; message?: string }));
      if (String(j.result_code) === '1') sent += batch.length;
      else { failed += batch.length; if (errors.length < 5) errors.push(String(j.message || `발송실패(code ${j.result_code})`)); }
    } catch (e) { failed += batch.length; if (errors.length < 5) errors.push(e instanceof Error ? e.message : String(e)); }
  }
  return { ok: failed === 0, sent, failed, errors, msg_type };
}

// 참가자 안내문자 발송 (관리자) — 재사용: event_id 로 어느 행사든
// body: { event_id?, message, testTo? }  ·  {이름} 치환 지원
export async function POST(req: NextRequest) {
  if (!verifyAdmin(req.cookies.get('gwaa_admin_auth')?.value)) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  if (!supaConfigured()) return NextResponse.json({ error: 'Supabase 미설정' }, { status: 503 });
  const { event_id, message, testTo } = await req.json() as { event_id?: number; message?: string; testTo?: string };
  if (!message || !message.trim()) return NextResponse.json({ error: '문구를 입력해 주세요.' }, { status: 400 });
  const title = '행사 안내';

  if (testTo) {
    const ph = String(testTo).replace(/\D/g, '');
    if (!/^01\d{8,9}$/.test(ph)) return NextResponse.json({ error: '테스트 번호 형식이 올바르지 않습니다.' }, { status: 400 });
    const r = await aligoSend([{ phone: ph, msg: message.replace(/\{이름\}/g, '테스트') }], title);
    return NextResponse.json({ mode: 'test', to: ph, ...r });
  }

  const eid = Number(event_id) || 0;
  let q = db().from('bookings').select('name,phone,status,event_id').eq('status', 'paid');
  if (eid) q = q.eq('event_id', eid);
  const { data } = await q;
  const seen = new Set<string>(); const recips: { phone: string; msg: string }[] = [];
  for (const b of (data as Booking[] ?? [])) {
    const ph = String(b.phone || '').replace(/\D/g, '');
    if (!/^01\d{8,9}$/.test(ph) || seen.has(ph)) continue; seen.add(ph);
    const name = String(b.name || '').split('/')[0].trim() || '참가자';
    recips.push({ phone: ph, msg: message.replace(/\{이름\}/g, name) });
  }
  if (!recips.length) return NextResponse.json({ error: '발송 대상(결제완료·전화번호 보유)이 없습니다.', total: 0 }, { status: 400 });
  const r = await aligoSend(recips, title);
  return NextResponse.json({ mode: 'all', total: recips.length, ...r });
}
