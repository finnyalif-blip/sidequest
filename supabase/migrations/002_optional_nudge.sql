-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Lets the "daily nudge for all quests" be switched off while per-quest reminders keep working.
alter table public.push_subscriptions alter column remind_hour drop not null;
