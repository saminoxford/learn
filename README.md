# Learn — Marshall & Waylon

A learning quiz app for two kids. Math (1st–5th grade), Science (3rd grade), and Geography (3rd grade) with XP, streaks, and progress tracking.

Built with Vite + React + Supabase. Hosted on Vercel.

## Stack

- **Frontend:** Vite + React 19, vanilla CSS, ~120 KB gzipped
- **Backend:** Supabase (Postgres + Auth, RLS-locked per user)
- **Hosting:** Vercel (auto-deploys from `main`)
- **No runtime dependencies** beyond `@supabase/supabase-js`

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173. In dev mode, click **"Preview without account"** on the login screen to skip auth and play with localStorage-backed data.

## Environment

Create `.env` at the repo root (or add via `vercel env add`):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Project layout

```
src/
  App.jsx                 root + routing
  AppContext.js           shared profile/session context
  supabase.js             client init
  previewStore.js         localStorage-backed store for dev-only preview mode
  components/
    XPBar.jsx
    Confetti.jsx
  content/
    math.js               15 questions × grades 1–5
    science.js            3rd-grade starter set
    geography.js          3rd-grade starter set
  screens/
    Login.jsx
    ProfileSelect.jsx     Marshall & Waylon profile picker
    Home.jsx              subject grid
    GradeSelect.jsx       grade 1–5 picker
    Quiz.jsx              10-question quiz with audio feedback
    Results.jsx           score + confetti on perfect
    Progress.jsx          history + per-subject stats
```

## Database

Two tables, both with RLS scoped per auth user:

- `profiles(id, owner_id → auth.users, name, avatar, xp, created_at)` — each auth user owns one or more profiles (Marshall + Waylon auto-created on first login).
- `sessions(id, user_id → profiles, subject, grade, score, total, created_at)` — one row per finished quiz.

Schema lives on Supabase; changes are applied via the Supabase MCP tools and reflected in the dashboard.

## Adding content

Edit `src/content/<subject>.js`. Each question is `{ question, options, answer, emoji }`. `answer` must exactly match one entry in `options`. Quizzes pick 10 questions at random from the pool for that grade.

## Deploying

`git push origin main` — Vercel auto-builds and deploys.
