// Web Push reminders for Sidequest.
// Needs: VITE_VAPID_PUBLIC_KEY in env, the push_subscriptions table, and the send-reminders edge function (see SETUP-NOTIFICATIONS.md).

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
const HOUR_KEY = "sidequest:reminderHour";
const NUDGE_KEY = "sidequest:nudgeOn";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export function reminderSupport() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    if (isIOS() && !isStandalone()) {
      return { supported: false, reason: "On iPhone, reminders only work once Sidequest is added to your Home Screen (Share → Add to Home Screen). Open it from there and try again." };
    }
    return { supported: false, reason: "This browser doesn't support notifications." };
  }
  if (!VAPID_PUBLIC_KEY) {
    return { supported: false, reason: "Reminders aren't set up on this site yet (missing VAPID key)." };
  }
  return { supported: true, reason: "" };
}

function savedHour() {
  try {
    const h = Number(window.localStorage.getItem(HOUR_KEY));
    return Number.isInteger(h) && h >= 0 && h <= 23 ? h : 18;
  } catch (e) {
    return 18;
  }
}

function savedNudge() {
  try {
    return window.localStorage.getItem(NUDGE_KEY) !== "0";
  } catch (e) {
    return true;
  }
}

export async function currentReminderState() {
  const support = reminderSupport();
  const base = { supported: support.supported, reason: support.reason, permission: "default", subscribed: false, hour: savedHour(), nudgeOn: savedNudge() };
  if (!("Notification" in window)) return base;
  base.permission = Notification.permission;
  if (!support.supported) return base;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    base.subscribed = !!sub && Notification.permission === "granted";
  } catch (e) {
    /* leave unsubscribed */
  }
  return base;
}

export async function enableReminders(supabase, user, hour, nudgeOn = true) {
  const support = reminderSupport();
  if (!support.supported) return { error: support.reason };
  if (!user) return { error: "Cloud saving needs to be on first." };
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return { error: "Notifications weren't allowed, so no reminders were set." };

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }
    const json = sub.toJSON();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const { error } = await supabase.from("push_subscriptions").upsert({
      endpoint: json.endpoint,
      user_id: user.id,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      remind_hour: nudgeOn ? hour : null,
      tz,
    });
    if (error) {
      await sub.unsubscribe();
      return { error: "Couldn't save your reminder. Try again in a moment." };
    }
    try { window.localStorage.setItem(HOUR_KEY, String(hour)); window.localStorage.setItem(NUDGE_KEY, nudgeOn ? "1" : "0"); } catch (e) { /* ignore */ }
    return {};
  } catch (e) {
    return { error: "Couldn't turn on reminders on this device." };
  }
}

export async function disableReminders(supabase) {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
    }
    return {};
  } catch (e) {
    return { error: "Couldn't turn off reminders." };
  }
}

// Saves the "daily nudge for all quests" choice (time + on/off). Always remembered on this device; sent to the server if reminders are on.
export async function updateNudge(supabase, hour, nudgeOn) {
  try { window.localStorage.setItem(HOUR_KEY, String(hour)); window.localStorage.setItem(NUDGE_KEY, nudgeOn ? "1" : "0"); } catch (e) { /* ignore */ }
  try {
    if (!("serviceWorker" in navigator)) return {};
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return {};
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const { error } = await supabase.from("push_subscriptions").update({ remind_hour: nudgeOn ? hour : null, tz }).eq("endpoint", sub.endpoint);
    if (error) return { error: "Couldn't change the reminder time." };
    return {};
  } catch (e) {
    return { error: "Couldn't change the reminder time." };
  }
}

// Keeps the server's idea of your time zone current (e.g. after travelling), so reminders arrive at your local time.
export async function syncTimezone(supabase) {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    await supabase.from("push_subscriptions").update({ tz }).eq("endpoint", sub.endpoint);
  } catch (e) {
    /* best effort */
  }
}

// Shows a notification right now, through the service worker, so you can confirm it works on this device.
export async function sendTestNotification() {
  try {
    if (Notification.permission !== "granted") return { error: "Notifications aren't allowed yet." };
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification("Sidequest", {
      body: "Test reminder — you're all set. ⚔️",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "sidequest-test",
      data: { url: "/" },
    });
    return {};
  } catch (e) {
    return { error: "Couldn't show a test notification." };
  }
}
