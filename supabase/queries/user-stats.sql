-- SideQuest user stats.
-- Paste into Supabase → SQL Editor → Run. Read-only: it changes nothing.
-- Every save writes game_saves.updated_at, so "active" = saved progress in that window.

-- 1) Headline numbers
select
  count(*)                                                              as total_players,
  count(*) filter (where updated_at > now() - interval '1 day')         as daily_active,
  count(*) filter (where updated_at > now() - interval '7 days')        as weekly_active,
  count(*) filter (where updated_at > now() - interval '30 days')       as monthly_active,
  count(*) filter (where coalesce((data->>'totalXp')::int, 0) > 0)      as completed_a_quest,
  count(*) filter (where u.email is not null)                           as saved_with_email
from public.game_saves s
left join auth.users u on u.id = s.user_id;

-- 2) Retention: of people who started in a given week, how many are still active this week?
select
  date_trunc('week', u.created_at)::date                                as signup_week,
  count(*)                                                              as signed_up,
  count(*) filter (where s.updated_at > now() - interval '7 days')      as still_active,
  round(100.0 * count(*) filter (where s.updated_at > now() - interval '7 days') / count(*), 1) as pct_still_active
from public.game_saves s
join auth.users u on u.id = s.user_id
group by 1
order by 1 desc
limit 12;

-- 3) How far people get (level is roughly XP-based; this buckets by total XP)
select
  case
    when coalesce((data->>'totalXp')::int, 0) = 0     then '0 xp (never finished a quest)'
    when (data->>'totalXp')::int < 250                then '1-249 xp'
    when (data->>'totalXp')::int < 1000               then '250-999 xp'
    when (data->>'totalXp')::int < 3000               then '1k-3k xp'
    else '3k+ xp'
  end as progress,
  count(*) as players
from public.game_saves
group by 1
order by min(coalesce((data->>'totalXp')::int, 0));
