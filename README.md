# Sidequest

Turn your to-dos into a game board. This is a standalone Vite + React app —
same stack as LearnTheGame, so the workflow should feel familiar.

## Run it locally

```
npm install
npm run dev
```

Opens at http://localhost:5173. Progress saves to the browser's
localStorage, so it'll be there next time you open it on the same device
(but won't sync across devices — see "Next steps" below).

## Deploy it for real

The fastest path is Vercel, since it auto-detects Vite projects with zero config:

1. Push this folder to a new GitHub repo.
2. Go to vercel.com → New Project → import that repo.
3. Leave the defaults (Framework Preset: Vite, Build Command: `npm run build`,
   Output Directory: `dist`) and click Deploy.
4. You'll get a `*.vercel.app` URL immediately; add a custom domain later
   under Project Settings → Domains if you want one.

Netlify and GitHub Pages work too, with the same `npm run build` → `dist`
output — Vercel is just the path of least resistance if you're already
using it for LearnTheGame.

## Next steps worth considering

- **Cross-device sync**: right now progress lives in localStorage on one
  browser. If you want it to follow you across devices, you'd swap the
  localStorage calls in `src/App.jsx` for calls to a backend — Supabase
  (which you already use for LearnTheGame) would be the natural fit, with
  a `quests` table keyed by user id.
- **PWA conversion**: same advice as LearnTheGame — wrapping this as a PWA
  (installable, works offline) is a small lift on a Vite app and would make
  it feel more like a real app on mobile.
- **Auth**: only needed once you add sync — Supabase Auth or a simple
  magic-link flow would cover it.
