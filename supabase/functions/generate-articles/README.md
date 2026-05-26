# generate-articles — daily DYK content cron

This Edge Function generates ~10 fresh "Did You Know?" articles per day
(2 per reading level × 5 levels) using Claude Haiku. It tolerates a missing
`ANTHROPIC_API_KEY` — when the key isn't set it logs and exits, so the app
keeps working off the seed content.

## One-time setup

### 1. Install the Supabase CLI (if you don't have it)

```powershell
npm install -g supabase
supabase login
```

### 2. Link this project to your Supabase project (once)

```powershell
cd C:\Projects\Learn
supabase link --project-ref jaekcntixcocqqluzybh
```

### 3. Set the secret

Grab an Anthropic API key from https://console.anthropic.com/, then:

```powershell
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

(You don't need to set `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — those
are auto-injected by the platform.)

### 4. Deploy the function

```powershell
supabase functions deploy generate-articles --no-verify-jwt
```

`--no-verify-jwt` because the cron can't pass a user JWT.

### 5. Test it once manually

```powershell
curl -X POST https://jaekcntixcocqqluzybh.supabase.co/functions/v1/generate-articles
```

You should see a JSON response with `generated: 10` (or fewer if a couple
failed validation — that's normal). Check the `articles` table in the
Supabase dashboard — there should be 10 new rows from `source = 'claude-api'`.

### 6. Schedule the cron

In the Supabase dashboard → **Database → Cron** → **Create a new cron job**:

- Name: `generate-articles-daily`
- Schedule: `0 5 * * *` (5am UTC = midnight Central)
- Type: Supabase Edge Function
- Function: `generate-articles`

Or via SQL editor:

```sql
select cron.schedule(
  'generate-articles-daily',
  '0 5 * * *',
  $$
    select net.http_post(
      url := 'https://jaekcntixcocqqluzybh.supabase.co/functions/v1/generate-articles',
      headers := '{"Authorization": "Bearer YOUR-ANON-KEY"}'::jsonb
    );
  $$
);
```

## Costs

Claude Haiku is ~$0.25 per 1M input tokens and ~$1.25 per 1M output tokens.
Each article is ~1500 input + ~800 output tokens. 10 articles/day:

- ~15k input tokens/day × $0.25/1M ≈ $0.004
- ~8k output tokens/day × $1.25/1M ≈ $0.01
- **~$0.014 per day, ~$0.42 per month**

## Manual ops

- See logs: Supabase dashboard → Edge Functions → generate-articles → Logs
- Trigger manually: dashboard → Invoke, or `curl` from step 5 above
- Disable cron temporarily: `select cron.unschedule('generate-articles-daily');`

## Backfill modes

The function has three modes, selected by query string:

| URL                                  | What it does                                          |
| ------------------------------------ | ----------------------------------------------------- |
| `/generate-articles`                 | Generates ~10 fresh articles (default cron call).     |
| `/generate-articles?backfill=true`   | Fills missing `vocab` arrays on existing articles.    |
| `/generate-articles?backfill_tags=true` | Fills missing `tags` arrays on existing articles.  |

Run backfills manually from the dashboard or via `curl`; they're idempotent
and only touch rows where the column is empty/null.
