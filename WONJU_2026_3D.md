# 원주 2026 웰니스클럽 — 3D 행사장 · 만족도조사 DB · 스탬프 투어
> 제4회 원주시 반려동물 문화행사 WELLNESS CLUB · 10.17(토) 10:00–17:00 · 로아노크광장 일원
> 처음 올릴 때 **아래 '1. 최초 설정'** 만 하면 됩니다. 나머지는 참고용.

## 1. 최초 설정 (1회)
1. **Supabase 테이블 만들기** — Supabase 대시보드 → SQL Editor → `supabase/wellness_survey.sql` 내용을 붙여넣고 Run.
   - `wellness_surveys` (설문 응답) · `wellness_stamps` (QR 스캔 로그) 두 테이블 + RLS(서버만 읽고 씀).
   - 환경변수는 기존 것 그대로 사용: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (이미 Vercel에 있음). 추가 설정 없음.
2. **행사 카드에 연결** — 관리자(/admin) → 행사관리 → 원주 행사 카드의 **링크를 `/wonju-2026`** 으로, CTA 문구를 "3D로 행사장 보기 →" 로.
   - 링크가 `/wonju-2026` 으로 시작하면 행사 상세 페이지에 **"3D 행사장 미리보기" 블록**이 자동으로 들어갑니다 (`components/sections/events/Venue3D.tsx`).
3. **안내판 인쇄** — `https://gwaa.or.kr/wonju-2026/stamp-qr-A5.pdf` (A5 8장: 게임 5 + 만족도조사 1 + 3D 메인 1). 각 미니게임 안내판·경품존(26)에 붙이세요.

## 2. 주소
| 용도 | 주소 |
|--|--|
| 3D 행사장 (포스터 QR) | `https://gwaa.or.kr/wonju-2026` → `/wonju-2026/3d.html` 로 이동 |
| 미니게임 스탬프 QR | `https://gwaa.or.kr/wonju-2026/3d.html#stamp-g4` … `#stamp-g8` (4 유혹을 이겨라 · 5 반려견 야바위 · 6 똥 던지기 · 7 2m를 맞춰라 · 8 꼬순내 휘날리며) |
| 만족도조사 QR (경품존 26 · 6번째 도장) | `https://gwaa.or.kr/wonju-2026/3d.html#stamp-survey` |
| 당일 LIVE 모드 | `https://gwaa.or.kr/wonju-2026/3d.html#live` (10/17엔 자동) |
| QR 이미지 | `public/wonju-2026/qr/*.png` |

## 3. 데이터 흐름
- 관람객이 경품존 QR을 찍으면 3D 페이지 안에서 1분 설문 → `POST /api/wonju-2026/survey` → **Supabase `wellness_surveys`** 에 저장 → 6번째 도장.
- 게임 QR을 찍을 때마다 `POST /api/wonju-2026/stamp` 로 스캔 로그 (기기당 도장별 1회). 어떤 게임이 인기였는지, 완주율이 얼마였는지 집계용.
- 현장 통신이 끊겨도 응답은 폰에 저장됐다가 **연결되면 자동 재전송** (도장은 바로 찍힘).
- 같은 폰에서 설문을 두 번 보내면 두 번째는 '이미 제출'로 처리(DB unique) — 중복 집계 없음.
- 봇 방지: 허니팟 필드 + IP당 분당 20회 제한 + 선택지 화이트리스트(정해진 답 외에는 버림).
- **관리자 → "웰니스 설문" 탭** (`components/admin/WellnessPanel.tsx`): 응답 수·평균 만족도·문항별 분포·스탬프별 스캔 수·완주 수, 응답 목록, **CSV 내보내기**(`/api/wonju-2026/survey?format=csv`, 엑셀에서 한글 정상).
- Supabase 미설정(로컬 개발)일 땐 `.local-data/wellness_*.json` 에 저장.

## 4. 파일
| 파일 | 역할 |
|--|--|
| `public/wonju-2026/3d.html` | 3D 행사장 페이지 (단일 HTML, Three.js r128 CDN). 셀러명·시간표·장소 설명은 이 파일의 `PLACES`, `PROG` 배열 |
| `public/wonju-2026/og-3d.jpg` | 카카오톡·인스타 공유 미리보기 이미지 |
| `public/wonju-2026/qr/` · `stamp-qr-print.html` · `stamp-qr-A5.pdf` | 스탬프 QR 6종 + 3D 메인 QR, A5 안내판 |
| `app/api/wonju-2026/survey/route.ts` | 설문 저장(POST) · 관리자 조회/CSV(GET) |
| `app/api/wonju-2026/stamp/route.ts` | 스탬프 스캔 로그(POST) · 집계(GET) |
| `lib/wellnessDb.ts` | Supabase/로컬 저장 + 집계 함수 |
| `components/admin/WellnessPanel.tsx` | 관리자 "웰니스 설문" 탭 |
| `components/sections/events/Venue3D.tsx` | 행사 상세 페이지의 3D 미리보기 블록 |
| `supabase/wellness_survey.sql` | 테이블 생성 SQL |
| `next.config.ts` | `/wonju-2026` → `/wonju-2026/3d.html` 리다이렉트 |

## 5. 3D 페이지 수정 시
- `public/wonju-2026/3d.html` 만 바꾸고 push 하면 끝. 링크·QR은 그대로 유효.
- 설문 문항/선택지를 바꾸면 `app/api/wonju-2026/survey/route.ts` 의 `OPTS` 도 같이 맞춰야 저장됩니다(화이트리스트).
- 내 위치(GPS) 기본 좌표는 근사치 — 행사 전 현장에서 1회 보정: 다리 북단 입구에 서서 '내 위치 → 운영진·위치 보정'. 화면의 GEO.lat/lng 값을 `3d.html` 의 `const GEO={…}` 에 넣고 다시 올리면 모든 기기에 적용.
- 협회 사이트 밖(미리보기 링크, 파일로 열기)에서는 설문이 서버로 가지 않고 폰에만 저장됩니다(미리보기 모드). `?api=1` 을 붙이면 강제 전송.
