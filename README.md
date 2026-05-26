# Stubbs — Learn

A learning quiz app for the Stubbs kids. Eight subjects, per-kid grade and
reading-level, AI-generated daily "Did You Know?" articles, and an admin
monitoring mode for parents.

Vite + React 19 frontend, Supabase (Postgres + Auth + Edge Functions)
backend, Vercel-hosted, auto-deploys from `main`.

## Subjects

| Subject       | Source                                                              |
| ------------- | ------------------------------------------------------------------- |
| Math          | Procedural generators, grades 1–5                                   |
| Science       | Curated Q-bank, grades 1–5                                          |
| Geography     | Templated capitals, regions, compass + practical hierarchy/address  |
| Spelling      | Static wordlists + article-mined vocab, topic-filterable            |
| Reading       | Static wordlists + article-mined vocab, topic-filterable            |
| Life Skills   | 4 categories: household, mechanical, financial, personal            |
| Random        | Mixed pull across all the above                                     |
| Did You Know? | Reads a daily-generated article, then answers comprehension Qs      |

Spelling and Reading pull vocab from the `articles` table (`vocab` JSONB
column) at the kid's reading level. Per-profile `topic_filter` scopes
those subjects to articles tagged with that topic (e.g. "dinosaurs week").

## Stack & layout

```
src/
  App.jsx                  root + routing
  AppContext.js            shared session / profile / admin context
  supabase.js              client init
  previewStore.js          localStorage-backed store for dev-only preview mode
  profiles.js              avatar list + admin defaults
  lib/leveling.js          XP → level curve
  components/
    XPBar.jsx              level + XP progress in the header
    EditProfile.jsx        name, avatar, grade, reading level, topic filter
    Confetti.jsx           celebration on perfect quiz
    TopicChipBar.jsx       per-quiz topic override for Spelling/Reading
    ChoiceAnswer.jsx       multiple-choice answer widget
    FillAnswer.jsx         fill-in answer widget
    OrderAnswer.jsx        drag-to-order answer widget
  content/
    index.js               subject → generator dispatch + recency window
    recent.js              anti-repeat memory (last-N seen questions)
    wordlists.js           static Dolch/Fry word data
    minedVocab.js          article-vocab fetch + cache + topic filter
    topics.js              canonical topic list (kept in sync with edge function)
    mathGenerators.js
    geographyTemplates.js  capitals, regions, hierarchy, addresses
    geographyFacts.js      US states, countries, landmarks, compass
    science.js
    scienceFacts.js
    spellingGenerators.js
    readingGenerators.js
    lifeSkills.js
    lifeSkillsContent.js
    randomMixed.js
    articles.js            "Did You Know?" article fetchers
  screens/
    Login.jsx
    ProfileSelect.jsx      profile picker (admin sees all kids)
    Home.jsx               subject grid + Fresh-reads peek
    GradeSelect.jsx
    Quiz.jsx               10-question quiz with audio feedback
    Results.jsx
    Progress.jsx           history + per-subject stats
    Article.jsx            article reader + comprehension flow
supabase/
  functions/
    generate-articles/     edge function: generate / vocab backfill / tags backfill
```

## Database

Three tables, all under per-user RLS:

- **`profiles`** `(id, owner_id → auth.users, name, avatar, xp, grade_level,
  reading_level, topic_filter, created_at)` — kids have one profile each,
  owned by the kid's auth user. Admins read across profiles via an RLS
  policy keyed on `auth.users.app_metadata.is_admin`.
- **`sessions`** `(id, user_id → profiles, subject, grade, score, total,
  article_id?, created_at)` — one row per finished quiz or article read.
- **`articles`** `(id, reading_level, title, body, questions, vocab, topic,
  tags, source, created_at)` — daily Claude-generated "Did You Know?"
  content. `vocab` and `tags` are JSONB / text[] respectively; `source`
  is `seed` (hand-curated) or `claude-api` (generator output).

Schema migrations go through the Supabase MCP `apply_migration` tool.

## Admin model

Admin status comes from `auth.users.app_metadata.is_admin = true`, set
via the Supabase admin API so kids can't promote themselves. Admins can:

- Read every profile and every session (RLS allows it on SELECT)
- Switch into a kid's profile in read-only "Monitoring" mode
- Edit any kid's profile (name, avatar, grade, reading level, topic
  filter) from the monitoring view — the Switch button stays visible

Admins cannot write XP, sessions, or quiz answers on a kid's behalf
(RLS blocks owner-mismatched writes).

## Edge function (`generate-articles`)

One function, three modes selected by query string:

| URL                                     | Mode                                              |
| --------------------------------------- | ------------------------------------------------- |
| `/generate-articles`                    | Generate ~10 fresh articles (default cron call).  |
| `/generate-articles?backfill=true`      | Fill missing `vocab` arrays on existing articles. |
| `/generate-articles?backfill_tags=true` | Fill missing `tags` arrays on existing articles.  |

Required secrets: `ANTHROPIC_API_KEY`. The Supabase platform injects
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` automatically. Tolerates
a missing key — logs and no-ops so the app still works off seed content.

See [`supabase/functions/generate-articles/README.md`](supabase/functions/generate-articles/README.md)
for deploy and cron setup.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173. Click **"Preview without account"** on Login
to skip auth and play with localStorage-backed data.

### Environment

Create `.env.local` at the repo root (or add via `vercel env add`):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Without these the app shows a configuration error instead of a blank page.

## Deploying

```bash
git push origin main       # Vercel auto-builds and deploys
```

Edge function:

```bash
supabase functions deploy generate-articles --no-verify-jwt
```
