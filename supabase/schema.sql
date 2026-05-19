-- GWAA Database Schema
-- Run this in Supabase SQL Editor

-- Hero Images (fixed 3 slots)
create table if not exists hero_images (
  id   integer primary key,
  image_data text
);
insert into hero_images (id) values (1),(2),(3) on conflict do nothing;

-- Activity Cards
create table if not exists activity_cards (
  id          bigserial primary key,
  "order"     bigint default 0,
  image_data  text,
  tag         text,
  tag_color   text default 'green',
  icon        text,
  title       text,
  description text,
  link        text,
  link_text   text
);

-- Event Cards
create table if not exists event_cards (
  id          bigserial primary key,
  "order"     bigint default 0,
  image_data  text,
  images      text[] default '{}',
  title       text,
  date_text   text,
  location    text,
  description text,
  content     text,
  status      text default 'upcoming',
  link        text,
  benefit     text,
  cta_text    text default '신청하기 →'
);

-- Archive Events
create table if not exists archive_events (
  id          bigserial primary key,
  "order"     bigint default 0,
  feat        boolean default false,
  year        integer,
  title       text,
  location    text,
  ppl         text,
  date_text   text,
  place       text,
  part        text,
  organizer   text,
  description text,
  image_data  text,
  image_data2 text,
  images      text[] default '{}'
);

-- Travel Places
create table if not exists travel_places (
  id          bigserial primary key,
  "order"     bigint default 0,
  region      text,
  type        text,
  type_label  text,
  name        text,
  icon        text,
  address     text,
  feature     text,
  description text,
  pet_info    text,
  hours       text,
  price       text,
  is_partner  boolean default false,
  image_data  text,
  map_url     text
);

-- Mateship Partners
create table if not exists mateship_partners (
  id          bigserial primary key,
  "order"     bigint default 0,
  name        text,
  region      text,
  type        text,
  discount    text,
  icon        text,
  gradient    text,
  link        text,
  image_data  text
);

-- Lookbook Items
create table if not exists lookbook_items (
  id          bigserial primary key,
  "order"     bigint default 0,
  image_data  text,
  label       text,
  link        text,
  is_main     boolean default false
);

-- Gallery Items
create table if not exists gallery_items (
  id          bigserial primary key,
  "order"     bigint default 0,
  image_data  text,
  caption     text,
  active      boolean default true
);

-- Page Hashtags
create table if not exists page_hashtags (
  page        text primary key,
  tags        text[] default '{}'
);

-- Enable Row Level Security (public read, authenticated write)
alter table hero_images      enable row level security;
alter table activity_cards   enable row level security;
alter table event_cards      enable row level security;
alter table archive_events   enable row level security;
alter table travel_places    enable row level security;
alter table mateship_partners enable row level security;
alter table lookbook_items   enable row level security;
alter table gallery_items    enable row level security;
alter table page_hashtags    enable row level security;

-- Public read policies
create policy "public read hero"        on hero_images         for select using (true);
create policy "public read activity"    on activity_cards      for select using (true);
create policy "public read events"      on event_cards         for select using (true);
create policy "public read archive"     on archive_events      for select using (true);
create policy "public read travel"      on travel_places       for select using (true);
create policy "public read mateship"    on mateship_partners   for select using (true);
create policy "public read lookbook"    on lookbook_items      for select using (true);
create policy "public read gallery"     on gallery_items       for select using (true);
create policy "public read hashtags"    on page_hashtags       for select using (true);

-- Full access policies (using service key from admin API routes)
create policy "service all hero"        on hero_images         for all using (true);
create policy "service all activity"    on activity_cards      for all using (true);
create policy "service all events"      on event_cards         for all using (true);
create policy "service all archive"     on archive_events      for all using (true);
create policy "service all travel"      on travel_places       for all using (true);
create policy "service all mateship"    on mateship_partners   for all using (true);
create policy "service all lookbook"    on lookbook_items      for all using (true);
create policy "service all gallery"     on gallery_items       for all using (true);
create policy "service all hashtags"    on page_hashtags       for all using (true);
