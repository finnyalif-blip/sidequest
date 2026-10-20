// Supabase Edge Function: sends the daily Sidequest reminder.
// Runs every hour (see SETUP-NOTIFICATIONS.md). For each device whose chosen reminder hour
// is "now" in its own time zone, it sends a push unless that player already finished a quest today.
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

Deno.serve(async (req) => {
  // Only allow the scheduler (which sends the service-role key) to trigger this.
  const auth = req.headers.get("Authorization") ?? "";
  if (auth !== `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`) {
    return new Response("Forbidden", { status: 403 });
  }

  const now = new Date();
  const { data: subs, error } = await supabase.from("push_subscriptions").select("*");
  if (error) return new Response(error.message, { status: 500 });

  let sent = 0, skipped = 0, removed = 0;

  for (const sub of subs ?? []) {
    const lp = localParts(sub.tz, now);
    if (!lp || lp.hour !== sub.remind_hour) { skipped++; continue; }

    const { data: save } = await supabase.from("game_saves").select("data").eq("user_id", sub.user_id).maybeSingle();
    const game = save?.data ?? {};
    const completed: Array<{ completedAt?: string }> = Array.isArray(game.completed) ? game.completed : [];
    const didToday = completed.some((c) => c.completedAt && localDay(sub.tz, c.completedAt) === lp.day);
    if (didToday) { skipped++; continue; }

    const streak = Number(game.streak) || 0;
    const body = streak >= 2
      ? `Your ${streak}-day streak is on the line. One quick quest keeps it alive.`
      : "A quest is waiting on your board. Got a few minutes?";

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title: "Sidequest", body, url: "/", tag: "sidequest-daily" }),
      );
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        removed++;
      }
    }
  }

  return new Response(JSON.stringify({ sent, skipped, removed }), { headers: { "Content-Type": "application/json" } });
});
