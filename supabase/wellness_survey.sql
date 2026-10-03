-- ═══════════════════════════════════════════════════════════════════
-- 웰니스클럽(원주 2026) 3D 행사장 — 만족도조사 · 스탬프 투어 DB
-- Supabase SQL Editor에 붙여넣고 Run (한 번만 실행하면 됩니다)
-- ═══════════════════════════════════════════════════════════════════

-- 1) 만족도조사 응답 (경품존 26번 · 6번째 도장)
create table if not exists wellness_surveys (
  id          bigserial primary key,
  event_slug  text        not null default 'wonju-2026',
  rating      smallint    not null check (rating between 1 and 5),  -- 발바닥 1~5
  best        text[]      not null default '{}',                     -- 가장 좋았던 곳 (복수)
  how         text,                                                  -- 어떻게 알게 됐나
  from_region text,                                                  -- 어디서 오셨나
  again       text,                                                  -- 다음에 또 올지
  comment     text,                                                  -- 자유 의견
  stamps      text[]      not null default '{}',                     -- 제출 시점의 게임 도장 목록
  device_id   text,                                                  -- 기기 식별자(브라우저 localStorage) — 중복 제출 방지용
  user_agent  text,
  created_at  timestamptz not null default now()
);

-- 같은 기기에서는 행사당 1회만 (중복 제출은 API가 '이미 제출' 처리)
create unique index if not exists wellness_surveys_device_uq
  on wellness_surveys (event_slug, device_id) where device_id is not null;
create index if not exists wellness_surveys_event_idx
  on wellness_surveys (event_slug, created_at desc);

-- 2) 스탬프 스캔 로그 (어느 게임 QR이 얼마나 찍혔는지 · 완주율 집계용)
create table if not exists wellness_stamps (
  id          bigserial primary key,
  event_slug  text        not null default 'wonju-2026',
  device_id   text        not null,
  stamp       text        not null,                                  -- g4 g5 g6 g7 g8 survey
  created_at  timestamptz not null default now(),
  unique (event_slug, device_id, stamp)
);
create index if not exists wellness_stamps_event_idx
  on wellness_stamps (event_slug, stamp);

-- 3) RLS — 공개 읽기 없음. 서버(service_role)만 읽고 씁니다. (anon 키로는 접근 불가)
alter table wellness_surveys enable row level security;
alter table wellness_stamps  enable row level security;

drop policy if exists "service write" on wellness_surveys;
create policy "service write" on wellness_surveys for all using (auth.role() = 'service_role');
drop policy if exists "service write" on wellness_stamps;
create policy "service write" on wellness_stamps  for all using (auth.role() = 'service_role');
