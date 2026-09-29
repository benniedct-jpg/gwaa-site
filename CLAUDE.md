@AGENTS.md

# GWAA 사이트 (gwaa.or.kr) — 프로젝트 규칙

## 스택 (package.json 기준, 임의로 버전 올리지 말 것)
- Next.js 16 App Router · React 19.2 · TypeScript · Tailwind CSS v4 · framer-motion 12 · lucide-react
- DB: Supabase (`lib/db`, `supabase/schema.sql`) · 메일: Resend (`lib/email.ts`) · 배포: Vercel (cron: `/api/cron/billing`)
- Next 16은 `middleware.ts` 대신 `proxy.ts`를 쓴다. 학습 데이터 속 옛 Next 문법을 쓰지 말고 `node_modules/next/dist/docs/` 또는 Context7로 먼저 확인.
- AWS 불가. 새 라이브러리 추가는 이유를 먼저 말하고 승인 후.

## 구조
- `app/` 라우트 (events, classes, sellers, membership, mateship, travel, education, admin, api …)
- `components/ui` 공용 UI(Button, Badge, Input, Eyebrow, SeoTags 등) → 새로 만들기 전에 여기부터 재사용
- `components/sections/<페이지>` 페이지별 섹션 · `components/layout` Nav/Footer/KakaoFloat
- `lib/` 도메인 로직(행사 상태, 예약, 회원, 결제) · `_행사_슬러그_매핑표.md` 행사 슬러그 기준

## 명령
- 개발 `npm run dev` · 린트 `npm run lint` · 타입 `npx tsc --noEmit` · 빌드 `npm run build`
- 완료 조건: 린트 + 타입 + 빌드 통과. 실패 상태로 완료 보고 금지.
- 운영 배포(`vercel --prod`)는 수현씨 확인 후에만. 먼저 프리뷰(`vercel`) URL로 검수.

## 디자인
- 색·폰트·간격·라운드·그림자는 `app/globals.css`의 `@theme` 토큰만 사용. hex/px 하드코딩 금지, 새 값이 필요하면 토큰으로 추가.
- 폰트: Noto Sans KR(본문) · Gothic A1 / Black Han Sans(헤드라인) · Bebas Neue(영문·숫자 디스플레이)
- 한글 조판: `word-break: keep-all`, 헤드라인 `text-wrap: balance`, 본문 `text-wrap: pretty`, 본문 line-height 1.6~1.8, 헤드라인 자간 -2~-4%.
- 디자인팀 기준(`02-AI팀/팀-프롬프트/디자인팀.md`)의 "AI 디자인 티" 금지 목록 준수.
- 모바일 우선. 방문자 대부분이 카카오톡·인스타 인앱 브라우저로 들어온다 → 인앱 환경(`InAppBrowserBanner`)과 iOS 사파리를 항상 고려.
- 모션은 framer-motion, `prefers-reduced-motion` 존중, 150~400ms.

## 화면 검수 (UI 변경 시 필수)
- chrome-devtools MCP로 375 / 768 / 1440 폭 스크린샷 → 문제 수정 → 재촬영. 콘솔 에러·404 확인.
- og:title / og:description / og:image, 카카오톡 공유 미리보기, 이미지 webp·lazy.

## 워딩
- 화면 문구는 `02-AI팀/팀-프롬프트/마케팅팀.md` 기준(클리셰 금지어, 한국어 말맛).
- 용어: "반려견/반려동물/보호자". "애완" 금지.
- 자리표시 문구(lorem, "제목 입력") 금지. 모르는 사실·숫자는 `[확인 필요: OO]`로 남기고 보고.

## 민감 영역 — 수정 전 계획부터 보여줄 것
- 결제(PG·빌링키·계좌이체), 예약·정원(`bookingsDb`, `classesCatalog`), 회원·회비, 관리자 인증(`adminAuth`), 발송 메일.
- 테스트 요청은 `[테스트]` 접두어 데이터로만, 끝나면 정리.
- `.env.local` 값 출력·커밋 금지.
