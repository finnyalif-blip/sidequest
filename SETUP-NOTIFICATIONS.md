# Sidequest: fix saving + turn on reminders

Do these in order. Part 1 fixes saving for real. Part 2 turns on daily reminder notifications.

---

## Part 0: Put the new files in your project

Unzip `sidequest-update.zip` into your project folder and let it overwrite files with the same names.
You should end up with:

- `src/App.jsx` (replaces the old one)
- `src/notifications.js` (new)
- `src/main.jsx`, `index.html`
- `public/sw.js` (updated) and the other icon/manifest files
- `supabase/migrations/001_push_subscriptions.sql` (new)
- `supabase/functions/send-reminders/index.ts` (new)

---

## Part 1: Make saving work (about 5 minutes)

Good news: **even before you do anything here, progress now saves on the device automatically.**
This part turns on saving to the cloud, so it follows you across devices.

1. Go to supabase.com/dashboard and open your Sidequest project.
2. In the left sidebar, open **Authentication**, then **Sign In / Providers**.
3. Switch on **Allow anonymous sign-ins** and save.
4. In the left sidebar, open **SQL Editor** and click **New query**.
5. Open `supabase/migrations/001_push_subscriptions.sql`, copy all of it, paste it in, and click **Run**.
   (This creates the `game_saves` table with the right permissions, plus the table reminders need. It is safe to run more than once.)
6. Open Vercel, go to your project, then **Settings** and **Environment Variables**. Check that
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are both there. Vercel does not read your local `.env` file.
7. Deploy (see "Deploy" at the bottom), open the site, and tap **Save progress** at the top.
   It should no longer say "Device only."

---

## Part 2: Turn on reminders (about 15 minutes, one time)

Reminders arrive even when the app is closed, so they need a small server job. Supabase runs it for free.

### 2a. Make your reminder keys

In a terminal, in your project folder:

```
npx web-push generate-vapid-keys
```

It prints a **Public Key** and a **Private Key**. Keep this window open.
The private key is a secret: never paste it into the app, GitHub, or a chat.

### 2b. Add the public key to Vercel

1. Vercel, then your project, **Settings**, **Environment Variables**.
2. Add `VITE_VAPID_PUBLIC_KEY` and paste the **Public Key**.
3. Save, then redeploy (Deployments, three dots on the latest, **Redeploy**).

### 2c. Deploy the reminder sender to Supabase

1. Install the Supabase tool: `npm install -g supabase` (or use `npx supabase` before each command below).
2. Log in: `supabase login`
3. Link your project: `supabase link --project-ref YOUR_PROJECT_REF`
   (your project ref is the code in your Supabase dashboard URL).
4. Save the keys as secrets (swap in your own values):

```
supabase secrets set VAPID_PUBLIC_KEY="PASTE_PUBLIC_KEY" VAPID_PRIVATE_KEY="PASTE_PRIVATE_KEY" VAPID_SUBJECT="mailto:finnyalif@gmail.com"
```

5. Deploy the function:

```
supabase functions deploy send-reminders --no-verify-jwt
```

### 2d. Make it run every hour

In the Supabase **SQL Editor**, run this (replace the two placeholders):

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'sidequest-hourly-reminders',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

`YOUR_SERVICE_ROLE_KEY` is under Supabase, **Project Settings**, **API Keys** (the `service_role` secret).
Never put that key in the app or in GitHub. It only goes in this SQL.

### 2e. Try it

1. Open the deployed site, tap the top button, find **Daily reminder**.
2. Pick a time, tap **Turn on**, and allow notifications when asked.
3. Tap **Send a test notification**. You should see it right away.

Real reminders go out at the hour you picked, only on days you haven't finished a quest yet.

### iPhone notes

- Notifications on iPhone only work after you add Sidequest to the Home Screen
  (Safari, Share, Add to Home Screen) and open it from that icon. Needs iOS 16.4 or newer.
- If you installed the app before this update, close it fully and reopen it once so it picks up the new version.

---

## Update: reminders for individual quests

If you already did the setup above, do these 3 things once to get per-quest reminders:

1. **Database change.** In the Supabase **SQL Editor**, run the contents of
   `supabase/migrations/002_optional_nudge.sql` (one line).
2. **Redeploy the sender** (it was updated), from your project folder:
   ```
   npx supabase functions deploy send-reminders --no-verify-jwt
   ```
3. **Deploy the app** (git push, see "Deploy" below).

How to use it in the app:
- The bell at the top opens **Reminders**: turn notifications on, optionally keep the "daily nudge" (a general reminder if you haven't finished any quest), and send a test.
- Each quest has its own bell. Tap it, pick a time, tap **Set**. That quest reminds you every day at that time until you complete or abandon it.
- Per-quest reminders need cloud saving to be working, because the server reads your quests from your cloud save.

---

## Deploy

```
git add -A
git commit -m "Reliable saving + daily reminders"
git push
```

Vercel redeploys on its own after the push.
