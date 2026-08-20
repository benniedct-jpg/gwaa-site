import { Resend } from 'resend';
import type { Booking } from '@/lib/bookingsDb';

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://gwaa-site.vercel.app').replace(/\/$/, '');
}

// 입장권 이메일 HTML
export function ticketEmailHtml(b: Booking, token: string) {
  const base = siteUrl();
  const ticketUrl = `${base}/t/${token}`;
  const qrUrl = `${base}/api/tickets/qr?token=${token}`;
  const siteTxt = String(b.site ?? '').includes('-') ? String(b.site).split('-')[1] : String(b.site ?? '');
  const place = b.booking_type === 'day' ? '축제 관람권 (사이트 없음)' : `${b.zone ?? ''} 구역 · ${siteTxt} 사이트`;
  const typeName = b.booking_type === 'day' ? '당일권' : (b.booking_label ? String(b.booking_label) : '2박 3일');
  // Gmail 웹훅(Apps Script)이 4바이트 이모지를 깨뜨려서 제거
  const stripEmoji = (s: string) => s.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️]/gu, '').replace(/[ \t]{2,}/g, ' ').trim();
  const classes = Array.isArray(b.tshirt_sizes) && b.tshirt_sizes.length ? (b.tshirt_sizes as string[]).map(stripEmoji).filter(Boolean).join('<br/>') : '';
  const row = (l: string, v: string) => `<tr><td style="padding:9px 0;color:#6b7280;font-size:13px">${l}</td><td style="padding:9px 0;text-align:right;font-weight:700;color:#111;font-size:14px">${v}</td></tr>`;
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4f6f5;font-family:-apple-system,'Apple SD Gothic Neo','Malgun Gothic',sans-serif">
  <div style="max-width:480px;margin:0 auto;padding:24px">
    <div style="background:#15803d;border-radius:16px 16px 0 0;padding:28px 24px;text-align:center">
      <div style="color:#bbf7d0;font-size:11px;letter-spacing:.18em;font-weight:700">PETSCOUT 2026 · E-TICKET</div>
      <div style="color:#fff;font-size:24px;font-weight:800;margin-top:6px">입장권이 발급되었습니다</div>
      <div style="color:rgba(255,255,255,.75);font-size:13px;margin-top:6px">2026. 9. 4(금) — 9. 6(일) · 강원도 고성 세계잼버리 수련장</div>
    </div>
    <div style="background:#fff;padding:28px 24px;text-align:center">
      <div style="font-size:13px;color:#6b7280;margin-bottom:14px">현장에서 아래 QR 코드를 스텝에게 보여주세요</div>
      <img src="${qrUrl}" alt="입장 QR" width="200" height="200" style="border:1px solid #e5e7eb;border-radius:12px;padding:8px;background:#fff" />
      <table style="width:100%;margin-top:22px;border-top:1px solid #e5e7eb">
        ${row('예약자', String(b.name ?? '-'))}
        ${row('티켓 종류', typeName)}
        ${row('일정', `${b.date_label ?? ''}`)}
        ${row('위치', place)}
        ${row('인원', b.headcount != null ? `${b.headcount}인` : '-')}
        ${row('반려견', `${b.pet_name ?? '-'}${b.pet_breed ? ` (${b.pet_breed})` : ''}`)}
        ${classes ? row('웰니스 클래스', classes) : ''}
      </table>
      <a href="${ticketUrl}" style="display:inline-block;margin-top:22px;background:#16a34a;color:#fff;text-decoration:none;padding:13px 28px;border-radius:9999px;font-weight:700;font-size:14px">입장권 열기</a>
    </div>
    <div style="background:#fff;border-radius:0 0 16px 16px;padding:18px 24px;border-top:1px solid #f0f0f0;text-align:center">
      <div style="font-size:12px;color:#9ca3af;line-height:1.7">강원도반려동물협회 · 033-813-0333 · ganimal1@naver.com<br/>본 메일은 발신 전용입니다.</div>
    </div>
  </div></body></html>`;
}

// 입금 안내(미입금 리마인더) 메일 HTML
export function reminderEmailHtml(b: Booking, deadline: string, isTest = false) {
  const base = siteUrl();
  const token = String(b.ticket_token ?? '');
  const ticketUrl = token ? `${base}/t/${token}` : base;
  const siteTxt = String(b.site ?? '').includes('-') ? String(b.site).split('-')[1] : String(b.site ?? '');
  const place = b.booking_type === 'day' ? '축제 관람권 (사이트 없음)' : `${b.zone ?? ''} 구역 · ${siteTxt} 사이트`;
  const amount = typeof b.amount === 'number' ? b.amount : Number(b.amount ?? 0);
  // Gmail 웹훅(Apps Script)이 4바이트 이모지를 깨뜨려서(한글은 OK) 이모지(astral) 제거
  const noEmoji = (s: string) => s.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️]/gu, '').replace(/[ \t]{2,}/g, ' ').trim();
  const name = noEmoji(String(b.name ?? '-'));
  const classesArr = (Array.isArray(b.tshirt_sizes) ? (b.tshirt_sizes as string[]) : []).map(noEmoji).filter(Boolean);
  const classes = classesArr.length ? classesArr.join('<br/>') : '';
  const row = (l: string, v: string) => `<tr><td style="padding:9px 0;color:#6b7280;font-size:13px">${l}</td><td style="padding:9px 0;text-align:right;font-weight:700;color:#111;font-size:14px">${v}</td></tr>`;
  const testBanner = isTest ? `<div style="background:#fef3c7;color:#92400e;border-radius:10px;padding:8px 12px;font-size:12px;font-weight:700;text-align:center;margin-bottom:12px">※ 이 메일은 실제 발송 전 테스트입니다 (확인용)</div>` : '';
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4f6f5;font-family:-apple-system,'Apple SD Gothic Neo','Malgun Gothic',sans-serif">
  <div style="max-width:480px;margin:0 auto;padding:24px">
    ${testBanner}
    <div style="background:#15803d;border-radius:16px 16px 0 0;padding:28px 24px;text-align:center">
      <div style="color:#bbf7d0;font-size:11px;letter-spacing:.18em;font-weight:700">PETSCOUT 2026 · 입금 안내</div>
      <div style="color:#fff;font-size:23px;font-weight:800;margin-top:6px">예약 입금을 안내드려요</div>
      <div style="color:rgba(255,255,255,.75);font-size:13px;margin-top:6px">2026. 9. 4(금) — 9. 6(일) · 강원도 고성 세계잼버리 수련장</div>
    </div>
    <div style="background:#fff;padding:26px 24px">
      <div style="font-size:14px;color:#374151;line-height:1.7">
        안녕하세요 <b>${name}</b>님, 강원도반려동물협회입니다.<br/>
        2026 Camping with Petscout 예약해 주셔서 감사해요!<br/><br/>
        아직 <b>입금이 확인되지 않아</b> 안내드립니다. <b>입금이 확인되면 예약이 확정</b>됩니다.
      </div>
      <table style="width:100%;margin-top:18px;border-top:1px solid #e5e7eb">
        ${row('예약자', name)}
        ${row('일정', String(b.date_label ?? ''))}
        ${row('위치', place)}
        ${row('인원', b.headcount != null ? `${b.headcount}인` : '-')}
        ${classes ? row('웰니스 클래스', classes) : ''}
        ${row('결제 금액', `<span style="color:#15803d;font-size:16px">${amount.toLocaleString()}원</span>`)}
      </table>
      <div style="margin-top:18px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px">
        <div style="font-size:13px;color:#166534;line-height:1.9">
          ▪ 입금 계좌 : <b>NH농협 301-0318-0756-61</b> (예금주: 사단법인 강원도반려동물협회)
        </div>
      </div>
      <div style="font-size:13px;color:#6b7280;line-height:1.7;margin-top:14px">
        입금이 확인되면 예약이 확정됩니다.
      </div>
      <div style="text-align:center">
        <a href="${ticketUrl}" style="display:inline-block;margin-top:20px;background:#16a34a;color:#fff;text-decoration:none;padding:13px 30px;border-radius:9999px;font-weight:700;font-size:14px">내 예약 확인하기</a>
      </div>
    </div>
    <div style="background:#fff;border-radius:0 0 16px 16px;padding:18px 24px;border-top:1px solid #f0f0f0;text-align:center">
      <div style="font-size:12px;color:#9ca3af;line-height:1.7">강원도반려동물협회 · 033-813-0333 · ganimal1@naver.com<br/>본 메일은 발신 전용입니다.</div>
    </div>
  </div></body></html>`;
}

// 발송: 앱스스크립트 웹훅 우선 → Resend → 미설정. (임의 to/subject/html)
export async function sendMailRaw(to: string, subject: string, html: string): Promise<{ sent: boolean; reason?: string }> {
  if (!to) return { sent: false, reason: '수신 이메일 없음' };
  const webhook = process.env.MAIL_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ to, subject, html, secret: process.env.MAIL_WEBHOOK_SECRET || 'petscout-mail-2026' }),
        redirect: 'follow',
      });
      const text = await res.text().catch(() => '');
      let j: { ok?: boolean; error?: string } = {};
      try { j = JSON.parse(text); } catch { /* 리다이렉트 등 */ }
      if (j.ok) return { sent: true };
      if (j.error) return { sent: false, reason: `앱스스크립트: ${j.error}` };
      if (res.status >= 200 && res.status < 400) return { sent: true };
      return { sent: false, reason: `웹훅 응답 코드 ${res.status}` };
    } catch (e) {
      return { sent: false, reason: e instanceof Error ? e.message : String(e) };
    }
  }
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, reason: '메일 발송 미설정' };
  const from = process.env.MAIL_FROM || 'GWAA 펫스카웃 <onboarding@resend.dev>';
  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) return { sent: false, reason: error.message };
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : String(e) };
  }
}

// 입금 안내 메일 발송
export async function sendReminderEmail(b: Booking, deadline: string, overrideTo?: string, isTest = false) {
  const to = overrideTo || String(b.email ?? '');
  const cleanName = String(b.name ?? '').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}️]/gu, '').trim();
  const subject = `${isTest ? '[테스트]' : ''}[펫스카웃 2026] ${cleanName}님, 예약 입금 안내드려요`;
  return sendMailRaw(to, subject, reminderEmailHtml(b, deadline, isTest));
}

// 발송: 1) 구글 앱스스크립트 웹훅(Gmail·무료) 우선 → 2) Resend → 3) 미설정
export async function sendTicketEmail(b: Booking, token: string): Promise<{ sent: boolean; reason?: string }> {
  const to = String(b.email ?? '');
  if (!to) return { sent: false, reason: '수신 이메일 없음' };
  const subject = '[펫스카웃 2026] 입장권이 발급되었습니다';
  const html = ticketEmailHtml(b, token);

  // 1) 구글 앱스스크립트 웹훅 (Gmail 발송, API키·도메인 불필요)
  const webhook = process.env.MAIL_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ to, subject, html, secret: process.env.MAIL_WEBHOOK_SECRET || 'petscout-mail-2026' }),
        redirect: 'follow',
      });
      const text = await res.text().catch(() => '');
      let j: { ok?: boolean; error?: string } = {};
      try { j = JSON.parse(text); } catch { /* 리다이렉트 등으로 본문이 JSON이 아닐 수 있음 */ }
      if (j.ok) return { sent: true };
      if (j.error) return { sent: false, reason: `앱스스크립트: ${j.error}` };
      // 본문을 못 읽어도 POST가 도달하면 doPost가 실행되어 메일이 발송됨 → 2xx/3xx면 성공 처리
      if (res.status >= 200 && res.status < 400) return { sent: true };
      return { sent: false, reason: `웹훅 응답 코드 ${res.status}` };
    } catch (e) {
      return { sent: false, reason: e instanceof Error ? e.message : String(e) };
    }
  }

  // 2) Resend (RESEND_API_KEY 있을 때)
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, reason: '메일 발송 미설정 (MAIL_WEBHOOK_URL 또는 RESEND_API_KEY 필요)' };
  const from = process.env.MAIL_FROM || 'GWAA 펫스카웃 <onboarding@resend.dev>';
  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) return { sent: false, reason: error.message };
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : String(e) };
  }
}
