-- GWAA Next.js — Supabase 테이블 생성 SQL
-- Supabase 대시보드 > SQL Editor에 붙여넣기 후 실행

-- 1. hero_images
create table if not exists public.hero_images (
  id          bigserial primary key,
  "order"     int not null default 0,
  image_data  text,
  label       text
);
alter table public.hero_images enable row level security;
create policy "public read" on public.hero_images for select using (true);
create policy "service write" on public.hero_images for all using (auth.role() = 'service_role');

-- 2. activity_cards
create table if not exists public.activity_cards (
  id          bigserial primary key,
  "order"     int not null default 0,
  image_data  text,
  tag         text,
  tag_color   text,
  icon        text,
  title       text,
  description text,
  link        text,
  link_text   text
);
alter table public.activity_cards enable row level security;
create policy "public read" on public.activity_cards for select using (true);
create policy "service write" on public.activity_cards for all using (auth.role() = 'service_role');

-- 3. event_cards
create table if not exists public.event_cards (
  id          bigserial primary key,
  "order"     int not null default 0,
  image_data  text,
  images      jsonb default '[]',
  title       text,
  date_text   text,
  location    text,
  description text,
  content     text,
  status      text default 'live',
  link        text,
  benefit     text,
  cta_text    text
);
alter table public.event_cards enable row level security;
create policy "public read" on public.event_cards for select using (true);
create policy "service write" on public.event_cards for all using (auth.role() = 'service_role');

-- 4. archive_events
create table if not exists public.archive_events (
  id          bigserial primary key,
  "order"     int not null default 0,
  feat        boolean default false,
  year        int,
  title       text,
  location    text,
  ppl         text,
  date_text   text,
  place       text,
  part        text,
  description text,
  image_data  text,
  image_data2 text
);
alter table public.archive_events enable row level security;
create policy "public read" on public.archive_events for select using (true);
create policy "service write" on public.archive_events for all using (auth.role() = 'service_role');

-- 5. travel_places
create table if not exists public.travel_places (
  id          bigserial primary key,
  "order"     int not null default 0,
  region      text,
  type        text,
  type_label  text,
  name        text,
  icon        text,
  address     text,
  feature     text,
  description text,
  pet_info    text,
  is_partner  boolean default false,
  image_data  text,
  map_url     text,
  hours       text,
  price       text
);
alter table public.travel_places enable row level security;
create policy "public read" on public.travel_places for select using (true);
create policy "service write" on public.travel_places for all using (auth.role() = 'service_role');

-- 6. mateship_partners
create table if not exists public.mateship_partners (
  id          bigserial primary key,
  "order"     int not null default 0,
  name        text,
  region      text,
  type        text,
  discount    text,
  icon        text,
  gradient    text,
  link        text,
  image_data  text
);
alter table public.mateship_partners enable row level security;
create policy "public read" on public.mateship_partners for select using (true);
create policy "service write" on public.mateship_partners for all using (auth.role() = 'service_role');

-- 7. lookbook_items
create table if not exists public.lookbook_items (
  id          bigserial primary key,
  "order"     int not null default 0,
  image_data  text,
  label       text,
  link        text,
  is_main     boolean default false
);
alter table public.lookbook_items enable row level security;
create policy "public read" on public.lookbook_items for select using (true);
create policy "service write" on public.lookbook_items for all using (auth.role() = 'service_role');

-- 8. gallery_items
create table if not exists public.gallery_items (
  id          bigserial primary key,
  "order"     int not null default 0,
  image_data  text,
  caption     text,
  active      boolean default true
);
alter table public.gallery_items enable row level security;
create policy "public read" on public.gallery_items for select using (true);
create policy "service write" on public.gallery_items for all using (auth.role() = 'service_role');

-- 9. page_hashtags
create table if not exists public.page_hashtags (
  page        text primary key,
  "order"     int not null default 0,
  tags        jsonb default '[]'
);
alter table public.page_hashtags enable row level security;
create policy "public read" on public.page_hashtags for select using (true);
create policy "service write" on public.page_hashtags for all using (auth.role() = 'service_role');
