<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# GWAA 사이트 (gwaa.or.kr) — 에이전트 공통 지침

Codex·Claude·기타 에이전트 공통. 도구별 추가 지침은 `CLAUDE.md`. 사용자(수현) 프로필·답변 품질 기준은 `~/Downloads/AI-프로필/프로필/`(특히 `05_답변_품질기준.md`)를 따른다.

## 0. 먼저 알 것
- **이 폴더가 유일한 작업본.** `~/Documents/gwaa-site`, `~/Downloads/gwaa-next`는 오래된 클론 — 건드리지 않는다.
- **git ≠ 배포.** 프로덕션은 이 폴더를 `vercel`로 직접 올린 것. `origin/main`과 프로덕션이 다를 수 있다. git push는 배포가 아니다.
- **라이브가 진실.** `.local-data/*.json`, `lib/db/defaults.ts`는 폴백/시드라 오래됐다. 행사 존재·id·이미지·콘텐츠는 https://gwaa.or.kr 실제 페이지나 Supabase로 확인한 뒤 판단한다. 로컬 시드만 보고 "없다"고 결론 내리지 않는다.
- 비밀값은 `.env.local`과 Vercel에만. 값을 출력·커밋·채팅에 붙이지 않는다.
- 환경변수 이름(값은 적지 않음): `NEXT_PUBLIC_SITE_URL` · Supabase `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` · PortOne `NEXT_PUBLIC_PORTONE_STORE_ID/CHANNEL_KEY`, `PORTONE_API_SECRET` · `TOSS_SECRET_KEY` · 메일 `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_WEBHOOK_URL/SECRET` · 문자 `ALIGO_USER_ID/API_KEY/SENDER` · 카카오 `KAKAO_CLIENT_ID/CLIENT_SECRET/REST_KEY` · 관리자 `ADMIN_PASSWORD`, `ADMIN_SECRET`, `ADMIN_ALERT_EMAIL`, `STAFF_CODE` · `MEMBERSHIP_SECRET` · `CRON_SECRET`. 새 변수를 추가하면 이 목록도 갱신.

## 1. 스택 (package.json 기준, 임의로 버전 올리지 말 것)
- Next.js 16.2 App Router(Turbopack) · React 19.2 · TypeScript · Tailwind CSS v4(`app/globals.css` `@theme`, config 파일 없음) · framer-motion 12 · lucide-react · three
- DB: Supabase(`lib/db`, `supabase/schema.sql`) · 메일: Resend(`lib/email.ts`) · 결제: PortOne V2 + KCP(단건, 사이트코드 IP96K) · 배포: Vercel(프로젝트 `gwaa-site`, cron `/api/cron/billing`) · 분석: Vercel Analytics + Microsoft Clarity(`y6acwopk3j`)
- Next 16: `middleware.ts` 폐지 → **`proxy.ts`**(둘 다 있으면 빌드 실패). 옛 문법 금지, `node_modules/next/dist/docs/` 먼저.
- AWS 불가. 새 라이브러리는 이유를 먼저 말하고 승인 후.

## 2. 구조
- `app/` 라우트: events·classes·sellers·survey·membership·mateship·travel·education·contact·admin·refund·t/[token]·m/[token]·api
- `components/ui` 공용 UI(Button, Badge, Input, Eyebrow, SeoTags…) → 새로 만들기 전에 여기부터 재사용
- `components/sections/<페이지>` 페이지별 섹션 · `components/layout` Nav/Footer/KakaoFloat (인앱 브라우저 배너 컴포넌트 `InAppBrowserBanner`는 grep으로 위치 확인)
- `lib/` 도메인 로직(행사 상태·예약·회원·결제·메일·관리자 인증) · `_행사_슬러그_매핑표.md` 행사 id↔슬러그↔이미지 폴더 기준
- 이미지: `public/images/events/<슬러그>/NN.webp`

## 3. 시스템 맵 — 어디를 고치나
| 기능 | 핵심 파일 / 테이블 | 규칙 |
|---|---|---|
| 행사 상태 | `lib/eventStatus.ts`(`effectiveStatus`·`pickFlagship`·`ddayFrom`), `event_cards.start_date/end_date` | 날짜로 upcoming/live/ended 자동, KST. 수동 `status='ended'`는 존중. 새 행사는 관리자에서 시작·종료일 입력(하루 행사는 시작=종료) |
| 예약·결제 | `components/sections/events/BookingFlow.tsx`, `app/api/bookings/*`, `app/api/bookings/confirm`, `app/t/[token]`(예약확인+1탭 카드결제), `lib/db`(`bookingsDb`) | `CARD_ENABLED` 플래그. 모바일 결제 복귀는 전체 리로드 → 실패/취소(`code`)는 confirm 호출 없이 안내, 성공만 confirm, `#booking-anchor`로 자동 스크롤 |
| 웰니스 클래스 | BookingFlow `classQty/aromaQty`, `classesCatalog` | 숙박 인원과 무관, 클래스별 신청 인원 단위. 아로마 1만원(RG 동일), 그 외 일반 2.5만/RG 1.5만 |
| 메일 | `lib/email.ts`(`kind: 'receipt'|'reminder'`) | 접수 즉시=환영 톤, 리마인더=독촉 톤. 입금·예약 안내에 송금수수료 문구 금지 — `app/refund`에만 |
| 메이트십 회원 | `app/membership/{join,card}`, `app/m/[token]`, `app/api/membership/*`, `lib/membership/token.ts`, 테이블 `members`·`proposals` | 연회비 120,000원 PortOne 일반결제. 회원증 QR 60초 TTL, 세션 쿠키 `gwaa_member` 30일. 로그인은 임시 전화+이름 → 카카오 로그인 전환 예정. 자체몰 안 함(면세사업자) |
| 프리마켓 셀러 | `app/sellers`, `app/api/sellers/apply`, `app/api/admin/sellers`, 테이블 `event_sellers`, `event_cards.seller_open`, `EventDetailClient.SELLER_EVENT_IDS` | 후원물품 or 참가비 2만원 택1, 심사 승인, 참가비 환불 불가. 새 행사 = `seller_open=true` + `SELLER_EVENT_IDS` 추가 |
| 만족도조사 | `app/survey`, `app/api/survey/submit`, `app/api/admin/survey`, 테이블 `survey_responses`, `event_cards.survey_open` | 다음 행사는 `survey_open` 플래그만 켜면 `/survey`가 자동 전환 |
| 행사 후기 | `RecapSection.tsx`(events/3), `RecapGosung.tsx`(events/2), `RECAP_PUBLISHED` | 사진은 webp·하나의 보정 프리셋·4:5 그리드. 영상은 H.264로 변환(카톡 HEVC는 웹 재생 불가) |
| 관리자 | `app/admin`, `proxy.ts`(쿠키 `gwaa_admin_auth`), `lib/adminAuth.ts`(HMAC 서명 쿠키 8h), `app/api/admin/auth`(IP당 5회 실패→1시간 잠금+경고 메일, 테이블 `admin_login_attempts`) | 개인정보 API(`bookings` 목록, `data/[store]`, `admin/*`, `tickets/send`)는 전부 관리자 인증 필수 |
| SEO | `app/layout.tsx`(Organization JSON-LD, 네이버 인증 메타), `app/events/[id]/page.tsx`(`EVENT_SEO`, Event+FAQPage), `app/sitemap.ts`, `app/robots.ts` | 제목 `GWAA {행사명} — {지역} \| 강원도반려동물협회`, 설명 155자. 협회 주소 메타 미노출. "전국구" 같은 직설 라벨 금지 |
| 도메인 | hosting.kr DNS: A @ → Vercel, CNAME www → cname.vercel-dns.com. `proxy.ts`가 `gwaa-site.vercel.app` → gwaa.or.kr 308(API 제외) | 광고 랜딩은 gwaa.or.kr/events/N 직접 |

## 4. 명령·완료 조건
- 개발 `npm run dev` · 린트 `npm run lint` · 타입 `npx tsc --noEmit` · 빌드 `npm run build`
- 완료 조건: **린트 + 타입 + 빌드 통과 + 375/768/1440 스크린샷 검수**(줄바꿈·이미지 잘림·콘솔 에러·404). 실패 상태로 완료 보고 금지.
- 배포: 먼저 `vercel`(프리뷰 URL)로 검수 → **수현 확인 후에만 `vercel --prod`**.

## 5. 디자인
- 색·폰트·간격·라운드·그림자는 `app/globals.css` `@theme` 토큰만. hex/px 하드코딩 금지. 브랜드 토큰: 틸 `--color-teal*`(#2BAFA8/#157F79) · 오렌지 `--color-orange*`(#EF7726/#C9560F). 옛 `--color-green*`은 틸 별칭 — 신규 코드는 teal/orange 사용.
- 폰트: Noto Sans KR(본문) · Gothic A1 / Black Han Sans(헤드라인) · Bebas Neue(영문·숫자)
- 한글 조판: `word-break: keep-all`, 헤드라인 `text-wrap: balance`, 본문 `text-wrap: pretty`, 본문 line-height 1.6~1.8, 헤드라인 자간 -2~-4%
- 톤: 권위가 아니라 반려인에게 친숙·따뜻하게. 프리미엄 + 모션(Linear·Stripe급), 지역색 팔레트 금지. 아이콘은 lucide.
- 모바일 우선. 방문자 대부분이 카카오톡·인스타 인앱 브라우저 → `InAppBrowserBanner`와 iOS 사파리 항상 고려.
- 모션 framer-motion, `prefers-reduced-motion` 존중, 150~400ms. 이미지 webp·lazy, og 태그·카카오 공유 미리보기 확인.

## 6. 워딩
- 용어: 반려견/반려동물/보호자. "애완" 금지, "개" 단독 금지(강아지·댕댕이·반려견).
- 존댓말이되 친근하게("예약이 확정되었어요!"). 공문체 지양. 클리셰·자리표시 문구(lorem, "제목 입력") 금지.
- 모르는 사실·숫자는 `[확인 필요: OO]`로 남기고 보고. 금액 계산은 코드로.

## 7. 민감 영역 — 수정 전 계획부터 보여줄 것
- 결제(PG·빌링키·계좌이체), 예약·정원(`bookingsDb`, `classesCatalog`), 회원·회비, 관리자 인증(`adminAuth`), 메일 발송, 개인정보 API.
- 이 영역을 건드리면 요청받지 않아도 **리스크 1~3줄 먼저**(취소·환불·우천 정책, 전자상거래 표기, 개인정보 동의, 협회가 손해 보는 지점).
- **실데이터 일괄 변경 금지.** 예약·회원·결제 행을 일괄 삭제·취소하지 않는다. 실명+실제 연락처 = 실데이터. 테스트는 `[테스트]` 접두어 데이터로만, 끝나면 건별 정리. 애매하면 수현에게 먼저. (2026-07 실제 예약 3건 오취소 사고 있음)
- 외부 메일·문자 대량 발송 전 테스트 1통을 수현에게 먼저.

## 8. 작업 절차 & 보고
1. 라이브(gwaa.or.kr·Supabase)에서 현재 상태 확인 → 2. 민감 영역이면 리스크·계획 먼저 → 3. 수정 → 린트·타입·빌드 → 스크린샷 → 4. 프리뷰 배포 → 확인 후 프로덕션.
- 보고: ① 바꾼 것(표) ② 프리뷰/라이브 URL ③ 가정 ④ [확인 필요] ⑤ 다음 액션 1줄. 과정 서술 금지.

## 9. 남은 과제 (2026-10)
- 카카오 로그인 전환 — `KAKAO_*` 환경변수와 코드가 이미 일부 있음, 라이브 적용 상태 확인 후 진행 · 행사 할인 ↔ 멤버십 연동(BookingFlow) · 관리자 연회비 매출 집계·만료 갱신 안내
- `ADMIN_PASSWORD` 강도·`STAFF_CODE` 기본값 교체(수현 액션) · 행사 id 19(강릉 산불 구호) 이미지 오연결 · 미입금 예약 회수 메일(문안 확정 후)
