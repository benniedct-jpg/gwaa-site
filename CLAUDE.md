@AGENTS.md

# Claude Code 전용 추가 지침

공통 규칙은 `AGENTS.md`. 여기는 Claude Code에서만 쓰는 도구·에이전트 연결.

## 도구
- 최신 API 확인: Context7 MCP 또는 `node_modules/next/dist/docs/`.
- 화면 검수: chrome-devtools MCP로 375 / 768 / 1440 스크린샷 → 수정 → 재촬영. UI 변경 후 `ui-polish` 스킬로 마무리.
- 라이브 확인: WebFetch로 gwaa.or.kr 실제 페이지를 본다(로컬 시드 금지).
- 출시 전: `/code-review`, playwright로 예약·결제·신청 E2E.

## AI팀 위임
- 카피·문구 → `marketing-team`, 시각·레이아웃 판단 → `design-team`, 전달 전 `qc-lead`. 팀 기준 문서: `02-AI팀/팀-프롬프트/{마케팅팀,디자인팀}.md`.
- 총괄(메인 세션)은 카피를 직접 쓰지 않는다.

## 메모리
- 사이트 운영 지식의 사람용 요약: `~/Downloads/AI-프로필/프로필/09_GWAA사이트_운영.md`. 새 사실이 확정되면 메모리와 함께 AGENTS.md §3·§9를 갱신한다.
