-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.

create table if not exists public.push_subscriptions (
  endpoint    text primary key,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  p256dh      text not null,
  auth        text not null,
  remind_hour int  not null default 18 check (remind_hour between 0 and 23),
  tz          text not null default 'UTC',
  created_at  timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "own subscriptions" on public.push_subscriptions;
create policy "own subscriptions" on public.push_subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Make sure saving progress works too (safe to re-run).
create table if not exists public.game_saves (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.game_saves enable row level security;
drop policy if exists "own save" on public.game_saves;
create policy "own save" on public.game_saves
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
