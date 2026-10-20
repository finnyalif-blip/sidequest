// Supabase Edge Function: sends Sidequest reminders. Runs every hour (see SETUP-NOTIFICATIONS.md).
// For each device, in that device's own time zone:
//   1. Per-quest reminders: any active quest whose reminderHour is "now" gets a notification
//      (it repeats every day until the quest is completed or abandoned).
//   2. Daily nudge: if the device's nudge hour is "now" and no quest was finished today, send a general nudge
//      (skipped if a per-quest reminder was already sent this hour).
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") ?? "mailto:you@example.com",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

type Quest = { id?: string; title?: string; reminderHour?: number };

function localParts(tz: string, now: Date) {
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz, hour: "numeric", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
    });
    const p = Object.fromEntries(fmt.formatToParts(now).map((x) => [x.type, x.value]));
    return { hour: Number(p.hour), day: `${p.year}-${p.month}-${p.day}` };
  } catch {
    return null;
  }
}

function localDay(tz: string, iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return localParts(tz, d)?.day ?? null;
}

function questBody(titles: string[]) {
  if (titles.length === 1) return `Time for your quest: ${titles[0]}`;
  const shown = titles.slice(0, 2).join(", ");
  const more = titles.length > 2 ? ` +${titles.length - 2} more` : "";
  return `${titles.length} quests are waiting: ${shown}${more}`;
}

Deno.serve(async (req) => {
  // Only allow the scheduler (which sends the service-role key) to trigger this.
  const auth = req.headers.get("Authorization") ?? "";
  if (auth !== `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`) {
    return new Response("Forbidden", { status: 403 });
  }

  const now = new Date();
  const { data: subs, error } = await supabase.from("push_subscriptions").select("*");
  if (error) return new Response(error.message, { status: 500 });

  // Load each user's save once, even if they have several devices.
  const saves = new Map<string, Record<string, unknown>>();
  async function getGame(userId: string) {
    if (!saves.has(userId)) {
      const { data } = await supabase.from("game_saves").select("data").eq("user_id", userId).maybeSingle();
      saves.set(userId, (data?.data as Record<string, unknown>) ?? {});
    }
    return saves.get(userId)!;
  }

  let sent = 0, skipped = 0, removed = 0;

  async function push(sub: { endpoint: string; p256dh: string; auth: string }, payload: Record<string, string>) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title: "Sidequest", url: "/", ...payload }),
      );
      sent++;
      return true;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        removed++;
      }
      return false;
    }
  }

  for (const sub of subs ?? []) {
    const lp = localParts(sub.tz, now);
    if (!lp) { skipped++; continue; }

    const game = await getGame(sub.user_id);
    let didSomething = false;

    // 1. Per-quest reminders
    const active: Quest[] = [
      ...(Array.isArray(game.quests) ? (game.quests as Quest[]) : []),
      ...(Array.isArray(game.mainQuests) ? (game.mainQuests as Quest[]) : []),
    ];
    const due = active
      .filter((q) => Number.isInteger(q.reminderHour) && q.reminderHour === lp.hour && q.title)
      .map((q) => q.title as string);
    if (due.length > 0) {
      await push(sub, { body: questBody(due), tag: "sidequest-quests" });
      didSomething = true;
    }

    // 2. Daily nudge (only if nothing else was just sent, and no quest finished today)
    if (!didSomething && sub.remind_hour !== null && sub.remind_hour === lp.hour) {
      const completed: Array<{ completedAt?: string | number }> = Array.isArray(game.completed)
        ? (game.completed as Array<{ completedAt?: string | number }>)
        : [];
      const didToday = completed.some((c) => c.completedAt && localDay(sub.tz, new Date(c.completedAt).toISOString()) === lp.day);
      if (!didToday) {
        const streak = Number(game.streak) || 0;
        const body = streak >= 2
          ? `Your ${streak}-day streak is on the line. One quick quest keeps it alive.`
          : "A quest is waiting on your board. Got a few minutes?";
        await push(sub, { body, tag: "sidequest-daily" });
        didSomething = true;
      }
    }

    if (!didSomething) skipped++;
  }

  return new Response(JSON.stringify({ sent, skipped, removed }), { headers: { "Content-Type": "application/json" } });
});
