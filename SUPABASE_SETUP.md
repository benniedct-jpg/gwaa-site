# Supabase 설정 가이드

## 1단계 — 프로젝트 생성
1. https://supabase.com 접속 → "Start your project" 클릭
2. GitHub 계정으로 로그인
3. "New project" 클릭
   - Organization: 개인 계정 선택
   - Project name: `gwaa`
   - Database Password: 안전한 비밀번호 설정 (기록해두기)
   - Region: **Northeast Asia (Tokyo)** 선택
4. "Create new project" 클릭 → 약 2분 대기

## 2단계 — 테이블 생성
1. 좌측 메뉴 "SQL Editor" 클릭
2. "New query" 클릭
3. `supabase/schema.sql` 파일 내용 전체 복사해서 붙여넣기 → "Run" 실행

## 3단계 — 초기 데이터 입력
1. SQL Editor에서 "New query" 클릭
2. `supabase/seed.sql` 파일 내용 전체 복사해서 붙여넣기 → "Run" 실행

## 4단계 — API 키 확인
1. 좌측 메뉴 "Settings" → "API" 클릭
2. 다음 두 가지 값 복사:
   - **Project URL**: `https://xxxx.supabase.co`
   - **anon public key**: `eyJ...` 로 시작하는 긴 문자열
3. 추가로 "Service role" key도 복사 (secret)

## 5단계 — Vercel 환경변수 설정
Claude에게 다음 3가지 값을 알려주세요:
- `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key
