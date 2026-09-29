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
    <div style="background:#0D7E76;border-radius:16px 16px 0 0;padding:28px 24px;text-align:center">
      <div style="color:#BFF3EC;font-size:11px;letter-spacing:.18em;font-weight:700">PETSCOUT 2026 · E-TICKET</div>
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
      <a href="${ticketUrl}" style="display:inline-block;margin-top:22px;background:#12A79D;color:#fff;text-decoration:none;padding:13px 28px;border-radius:9999px;font-weight:700;font-size:14px">입장권 열기</a>
    </div>
    <div style="background:#fff;border-radius:0 0 16px 16px;padding:18px 24px;border-top:1px solid #f0f0f0;text-align:center">
      <div style="font-size:12px;color:#9ca3af;line-height:1.7">강원도반려동물협회 · 033-813-0333 · ganimal1@naver.com<br/>본 메일은 발신 전용입니다.</div>
    </div>
  </div></body></html>`;
}

// 입금 안내(미입금 리마인더) 메일 HTML
export function reminderEmailHtml(b: Booking, deadline: string, isTest = false, kind: 'receipt' | 'reminder' = 'reminder') {
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
  const isReceipt = kind === 'receipt';
  const kicker = isReceipt ? 'PETSCOUT 2026 · 예약 접수 완료' : 'PETSCOUT 2026 · 입금 안내';
  const headline = isReceipt ? '예약이 접수되었어요!' : '예약 입금을 안내드려요';
  const introLine = isReceipt
    ? '<b>아래 계좌로 입금해 주시면 예약이 확정</b>됩니다.'
    : '아직 <b>입금이 확인되지 않아</b> 안내드립니다. <b>입금이 확인되면 예약이 확정</b>됩니다.';
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4f6f5;font-family:-apple-system,'Apple SD Gothic Neo','Malgun Gothic',sans-serif">
  <div style="max-width:480px;margin:0 auto;padding:24px">
    ${testBanner}
    <div style="background:#0D7E76;border-radius:16px 16px 0 0;padding:28px 24px;text-align:center">
      <div style="color:#BFF3EC;font-size:11px;letter-spacing:.18em;font-weight:700">${kicker}</div>
      <div style="color:#fff;font-size:23px;font-weight:800;margin-top:6px">${headline}</div>
      <div style="color:rgba(255,255,255,.75);font-size:13px;margin-top:6px">2026. 9. 4(금) — 9. 6(일) · 강원도 고성 세계잼버리 수련장</div>
    </div>
    <div style="background:#fff;padding:26px 24px">
      <div style="font-size:14px;color:#374151;line-height:1.7">
        안녕하세요 <b>${name}</b>님, 강원도반려동물협회입니다.<br/>
        2026 Camping with Petscout 예약해 주셔서 감사해요!<br/><br/>
        ${introLine}
      </div>
      <table style="width:100%;margin-top:18px;border-top:1px solid #e5e7eb">
        ${row('예약자', name)}
        ${row('일정', String(b.date_label ?? ''))}
        ${row('위치', place)}
        ${row('인원', b.headcount != null ? `${b.headcount}인` : '-')}
        ${classes ? row('웰니스 클래스', classes) : ''}
        ${row('결제 금액', `<span style="color:#0D7E76;font-size:16px">${amount.toLocaleString()}원</span>`)}
      </table>
      <div style="margin-top:18px;background:#EDFAF8;border:1px solid #BFF3EC;border-radius:12px;padding:16px">
        <div style="font-size:12px;color:#0D7E76;font-weight:700;letter-spacing:.02em;margin-bottom:8px">아래 계좌로 입금해 주세요</div>
        <div style="font-size:14px;color:#0A5F59;line-height:2">
          ▪ 입금 계좌 : <b style="font-size:16px">NH농협 301-0318-0756-61</b><br/>
          ▪ 예금주 : <b>사단법인 강원도반려동물협회</b><br/>
          ▪ 입금 금액 : <b style="color:#0D7E76">${amount.toLocaleString()}원</b><br/>
          ▪ 입금자명 : <b>${name}</b>님 성함으로 입금해 주세요<br/>
          <span style="font-size:12px;color:#6b7280">(예약자명과 다르게 입금하실 경우 033-813-0333로 알려주세요)</span>
        </div>
      </div>
      <div style="font-size:13px;color:#6b7280;line-height:1.7;margin-top:14px">
        입금이 확인되면 예약이 확정됩니다.
      </div>
      <div style="text-align:center">
        <a href="${ticketUrl}" style="display:inline-block;margin-top:20px;background:#12A79D;color:#fff;text-decoration:none;padding:13px 30px;border-radius:9999px;font-weight:700;font-size:14px">내 예약 확인하기</a>
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
export async function sendReminderEmail(b: Booking, deadline: string, overrideTo?: string, isTest = false, kind: 'receipt' | 'reminder' = 'reminder') {
  const to = overrideTo || String(b.email ?? '');
  const cleanName = String(b.name ?? '').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}️]/gu, '').trim();
  const subject = kind === 'receipt'
    ? `${isTest ? '[테스트]' : ''}[펫스카웃 2026] ${cleanName}님, 예약이 접수되었어요 (입금 안내)`
    : `${isTest ? '[테스트]' : ''}[펫스카웃 2026] ${cleanName}님, 예약 입금 안내드려요`;
  return sendMailRaw(to, subject, reminderEmailHtml(b, deadline, isTest, kind));
}

// ── 미입금 회수 캠페인 메일 (카드결제 열림 안내 + 1탭 결제 링크) ──
export function recoveryEmailHtml(b: Booking) {
  const base = siteUrl();
  const token = String(b.ticket_token ?? '');
  const link = token ? `${base}/t/${token}` : base;
  const strip = (s: string) => s.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️]/gu, '').replace(/[ \t]{2,}/g, ' ').trim();
  const name = strip(String(b.name ?? '')) || '고객';
  const schedule = [String(b.booking_label ?? ''), String(b.date_label ?? '')].filter(Boolean).join(' · ');
  const amount = (typeof b.amount === 'number' ? b.amount : Number(b.amount ?? 0)).toLocaleString();
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4f6f5;font-family:-apple-system,'Apple SD Gothic Neo','Malgun Gothic',sans-serif">
  <div style="max-width:480px;margin:0 auto;padding:24px">
    <div style="background:#0D7E76;border-radius:16px 16px 0 0;padding:26px 24px;text-align:center">
      <div style="color:#BFF3EC;font-size:11px;letter-spacing:.18em;font-weight:700">PETSCOUT 2026</div>
      <div style="color:#fff;font-size:21px;font-weight:800;margin-top:6px">예약 확정만 남았어요</div>
      <div style="color:rgba(255,255,255,.75);font-size:12px;margin-top:6px">2026. 9. 4(금) — 9. 6(일) · 강원도 고성</div>
    </div>
    <div style="background:#fff;padding:26px 24px">
      <div style="font-size:14.5px;color:#374151;line-height:1.75">
        <b>${name}</b>님, 안녕하세요. 강원도반려동물협회입니다.<br/><br/>
        9월 4일, 강원 고성에서 열리는 반려견과 함께하는 <b>2박 3일 캠핑 페스티벌</b>이 이제 닷새 앞으로 다가왔어요.<br/><br/>
        ${name}님께서 선택해두신 자리가 현재 <b>결제 전 상태</b>라 아직 예약이 최종 확정되지 않았습니다. 인기 구역부터 빠르게 마감되고 있어, 예약을 놓치지 않으시도록 미리 안내드려요.
      </div>
      <div style="margin-top:18px;background:#EDFAF8;border:1px solid #BFF3EC;border-radius:12px;padding:16px 18px">
        <div style="font-size:15px;font-weight:800;color:#0D7E76;margin-bottom:6px">이제 카드로도 바로 결제할 수 있어요</div>
        <div style="font-size:13.5px;color:#374151;line-height:1.7">기존에는 계좌이체만 가능했지만, 이제 예약 페이지에서 카드 결제가 가능합니다. 아래 버튼을 누르면 결제와 동시에 예약이 확정되고, 입장 QR코드까지 바로 발급돼요.</div>
      </div>
      <div style="text-align:center;margin:22px 0 8px">
        <a href="${link}" style="display:inline-block;background:#12A79D;color:#fff;text-decoration:none;padding:15px 34px;border-radius:9999px;font-weight:800;font-size:15.5px">예약 확정하기 →</a>
      </div>
      <div style="text-align:center;font-size:12px;color:#9ca3af;margin-bottom:18px">예약 내용 : ${schedule} · <b style="color:#0D7E76">${amount}원</b></div>
      <div style="font-size:13.5px;color:#4b5563;line-height:1.75;border-top:1px solid #f0f0f0;padding-top:16px">
        낮에는 반려견과 함께 고성에서 캠핑을, 밤에는 이박사 외 라이브 무대와 캠프파이어가 함께합니다. 예약자 전원에게 드리는 웰컴키트도 준비되어 있어요.<br/><br/>
        계좌이체가 더 편하신 경우에도 위 예약 페이지에서 그대로 진행하실 수 있습니다.<br/>
        궁금한 점은 언제든 편하게 연락 주세요. <b>033-813-0333</b><br/><br/>
        고성에서 반려견과 함께 만나요.
      </div>
    </div>
    <div style="background:#fff;border-radius:0 0 16px 16px;padding:16px 24px;border-top:1px solid #f0f0f0;text-align:center">
      <div style="font-size:11.5px;color:#9ca3af;line-height:1.7">강원도반려동물협회 · 033-813-0333 · ganimal1@naver.com</div>
    </div>
  </div></body></html>`;
}

export async function sendRecoveryEmail(b: Booking, overrideTo?: string, isTest = false) {
  const to = overrideTo || String(b.email ?? '');
  const cleanName = String(b.name ?? '').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}️]/gu, '').trim() || '고객';
  const subject = `${isTest ? '[테스트] ' : ''}[펫스카웃 2026] ${cleanName}님, 예약 확정만 남았어요 — 이제 카드결제 됩니다`;
  return sendMailRaw(to, subject, recoveryEmailHtml(b));
}

// ── 예약 취소 안내 + 재예약 유도 메일 (미입금 취소분) · 이모지 미사용(웹훅 깨짐 방지) ──
export function rebookEmailHtml(b: Booking) {
  const base = siteUrl();
  const link = `${base}/events/3`;
  const name = String(b.name ?? '').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️]/gu, '').trim() || '고객';
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4f6f5;font-family:-apple-system,'Apple SD Gothic Neo','Malgun Gothic',sans-serif">
  <div style="max-width:480px;margin:0 auto;padding:24px">
    <div style="background:#0D7E76;border-radius:16px 16px 0 0;padding:26px 24px;text-align:center">
      <div style="color:#BFF3EC;font-size:11px;letter-spacing:.18em;font-weight:700">PETSCOUT 2026</div>
      <div style="color:#fff;font-size:21px;font-weight:800;margin-top:6px">예약 취소 안내</div>
      <div style="color:rgba(255,255,255,.75);font-size:12px;margin-top:6px">2026. 9. 4(금) — 9. 6(일) · 강원도 고성</div>
    </div>
    <div style="background:#fff;padding:26px 24px">
      <div style="font-size:14.5px;color:#374151;line-height:1.75">
        <b>${name}</b>님, 안녕하세요. 강원도반려동물협회입니다.<br/><br/>
        ${name}님께서 신청해주신 예약이 <b>입금 기한 내 입금이 확인되지 않아 취소 처리</b>되었음을 안내드립니다.<br/><br/>
        참여를 원하시면 아래에서 원하시는 사이트로 <b>다시 예약</b>해 주세요. 이제 <b>카드로 바로 결제</b>하실 수 있어, 예약과 동시에 확정됩니다.
      </div>
      <div style="text-align:center;margin:22px 0 10px">
        <a href="${link}" style="display:inline-block;background:#12A79D;color:#fff;text-decoration:none;padding:15px 34px;border-radius:9999px;font-weight:800;font-size:15.5px">다시 예약하기 →</a>
      </div>
      <div style="font-size:13.5px;color:#4b5563;line-height:1.75;border-top:1px solid #f0f0f0;padding-top:16px">
        궁금한 점은 언제든 편하게 연락 주세요. <b>033-813-0333</b>
      </div>
    </div>
    <div style="background:#fff;border-radius:0 0 16px 16px;padding:16px 24px;border-top:1px solid #f0f0f0;text-align:center">
      <div style="font-size:11.5px;color:#9ca3af;line-height:1.7">강원도반려동물협회 · 033-813-0333 · ganimal1@naver.com</div>
    </div>
  </div></body></html>`;
}

export async function sendRebookEmail(b: Booking, overrideTo?: string, isTest = false) {
  const to = overrideTo || String(b.email ?? '');
  const cleanName = String(b.name ?? '').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}️]/gu, '').trim() || '고객';
  const subject = `${isTest ? '[테스트] ' : ''}[펫스카웃 2026] ${cleanName}님, 예약이 취소되었어요 — 재예약 안내`;
  return sendMailRaw(to, subject, rebookEmailHtml(b));
}

// ── 프리마켓 셀러 선정 안내 메일 ──
export type SellerLite = {
  brand_name?: string; rep_name?: string; email?: string;
  join_type?: string; sponsor_items?: string;
};

export function sellerSelectEmailHtml(s: SellerLite, isTest = false) {
  const strip = (v: string) => v.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️]/gu, '').replace(/[ \t]{2,}/g, ' ').trim();
  const brand = strip(String(s.brand_name ?? '')) || '셀러';
  const rep = strip(String(s.rep_name ?? ''));
  const isFee = s.join_type === 'fee';
  const feeBox = `
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px 18px;margin:16px 0;font-size:14px;color:#7c2d12;line-height:1.9">
      <b style="color:#c2410c">■ 참가비 안내 (2만원)</b><br/>
      <b>선정된 셀러에 한해</b> 수납하며, 참가비는 <b>올바른 반려문화 확산</b>을 위해 사용됩니다.<br/>
      ▪ 입금 계좌 : <b style="font-size:16px">NH농협 301-0318-0756-61</b><br/>
      ▪ 예금주 : <b>사단법인 강원도반려동물협회</b><br/>
      ▪ 입금 금액 : <b>20,000원</b><br/>
      ▪ 입금자명 : <b>${brand}</b> 또는 대표자 성함으로 입금해 주세요<br/>
      ▪ 입금 기한 : <b>10월 10일(토)까지</b><br/>
      <span style="color:#0D7E76">※ 참가비는 전액 올바른 반려문화 확산을 위해 사용됩니다. (참가 확약 성격으로 환불이 어려운 점 양해 부탁드립니다)</span>
    </div>`;
  const sponsorBox = `
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px 18px;margin:16px 0;font-size:14px;color:#1e3a8a;line-height:1.9">
      <b style="color:#1d4ed8">■ 후원물품 안내</b><br/>
      신청해 주신 후원물품 <b>${strip(String(s.sponsor_items ?? '')) || '(신청 내역)'}</b> 을(를)<br/>
      행사 당일 부스 준비 시 함께 전달해 주세요. 후원물품은 방문객 나눔·경품으로 사용됩니다.
    </div>`;
  return `
  <div style="max-width:560px;margin:0 auto;font-family:'Apple SD Gothic Neo','Noto Sans KR',sans-serif;color:#111;padding:8px">
    <div style="background:#0D7E76;border-radius:14px 14px 0 0;padding:26px 24px;text-align:center">
      <div style="color:#BFF3EC;font-size:11px;letter-spacing:0.15em;font-weight:700">2026 원주 웰니스클럽 · 프리마켓 셀러</div>
      <div style="color:#fff;font-size:22px;font-weight:800;margin-top:8px">${isTest ? '[테스트] ' : ''}셀러 선정 안내</div>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 14px 14px;padding:24px 22px;font-size:15px;line-height:1.8">
      <p><b>${brand}</b>${rep ? ` (${rep})` : ''} 님, 안녕하세요.<br/>
      2026 원주시 반려동물 문화행사 <b>&lt;웰니스클럽&gt;</b> 프리마켓 셀러로 <b>선정</b>되셨습니다. 함께해 주셔서 감사합니다!</p>
      <div style="background:#EDFAF8;border:1px solid #BFF3EC;border-radius:10px;padding:14px 16px;margin:16px 0;font-size:14px;color:#0D7E76;line-height:1.9">
        ▪ 일시 : <b>2026. 10. 17.(토) 10:00 ~ 17:00</b><br/>
        ▪ 장소 : <b>로아노크광장 일원 (원주시 봉산동 899-2)</b><br/>
        ▪ 부스 위치·집결 시간 등 운영 세부사항은 <b>개별 안내</b>드립니다.
      </div>
      ${isFee ? feeBox : sponsorBox}
      <p style="font-size:13.5px;color:#6b7280;line-height:1.8">
        부스 배치·전기·주차 등 문의는 아래 연락처로 주세요.<br/>
        문의 : <b>033-813-0333</b> · 사단법인 강원도반려동물협회
      </p>
    </div>
  </div>`;
}

export async function sendSellerSelectEmail(s: SellerLite, overrideTo?: string, isTest = false) {
  const to = overrideTo || String(s.email ?? '');
  const brand = String(s.brand_name ?? '').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}️]/gu, '').trim() || '셀러';
  const subject = `${isTest ? '[테스트] ' : ''}[2026 웰니스클럽] ${brand}님, 프리마켓 셀러로 선정되셨습니다`;
  return sendMailRaw(to, subject, sellerSelectEmailHtml(s, isTest));
}

// ── 프리마켓 셀러 신청 접수 확인 메일 (신청 즉시) ──
export function sellerApplyEmailHtml(s: SellerLite) {
  const strip = (v: string) => v.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️]/gu, '').replace(/[ \t]{2,}/g, ' ').trim();
  const brand = strip(String(s.brand_name ?? '')) || '셀러';
  const isFee = s.join_type === 'fee';
  return `
  <div style="max-width:560px;margin:0 auto;font-family:'Apple SD Gothic Neo','Noto Sans KR',sans-serif;color:#111;padding:8px">
    <div style="background:#0D7E76;border-radius:14px 14px 0 0;padding:24px;text-align:center">
      <div style="color:#BFF3EC;font-size:11px;letter-spacing:0.15em;font-weight:700">2026 원주 웰니스클럽 · 프리마켓 셀러</div>
      <div style="color:#fff;font-size:21px;font-weight:800;margin-top:8px">셀러 신청이 접수되었어요</div>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 14px 14px;padding:24px 22px;font-size:15px;line-height:1.8">
      <p><b>${brand}</b> 님, 프리마켓 셀러 신청을 접수했습니다. 감사합니다!</p>
      <div style="background:#EDFAF8;border:1px solid #BFF3EC;border-radius:10px;padding:14px 16px;margin:14px 0;font-size:14px;color:#0D7E76;line-height:1.9">
        ▪ 신청 참가 방식 : <b>${isFee ? '참가비 2만원' : '후원물품 제공(무료)'}</b><br/>
        ▪ 협회 <b>심사 후 선정 결과</b>를 개별 안내드립니다.<br/>
        ${isFee ? '▪ 선정되면 참가비 계좌를 안내드려요. (참가비는 올바른 반려문화 확산을 위해 사용됩니다)' : '▪ 선정되면 후원물품 전달 방법을 안내드려요.'}
      </div>
      <p style="font-size:13px;color:#6b7280">문의 : <b>033-813-0333</b> · 사단법인 강원도반려동물협회</p>
    </div>
  </div>`;
}

export async function sendSellerApplyEmail(s: SellerLite) {
  const to = String(s.email ?? '');
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(to)) return { sent: false, reason: '이메일 없음' };
  const brand = String(s.brand_name ?? '').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}️]/gu, '').trim() || '셀러';
  return sendMailRaw(to, `[2026 웰니스클럽] ${brand}님, 셀러 신청이 접수되었어요`, sellerApplyEmailHtml(s));
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
