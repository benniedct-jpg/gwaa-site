// 메이트쉽 회비 — 화면 표기용 단일 기준값 (클라이언트·서버 공용, 서버 전용 모듈 import 금지)
// ※ 실제 청구 금액은 app/api/payments/portone/billing, app/api/cron/billing 의 MONTHLY 와 같아야 한다.
export const MONTHLY_FEE = 10000;
export const YEARLY_FEE = MONTHLY_FEE * 12;
