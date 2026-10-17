# Personal Morning Paper

**NaSCon '26 AI Hackathon** · Name: Muhammad Ahtasham Ul Haq · Email: ahtasham1802@gmail.com

Every morning, a newspaper written for one reader. It covers the topics they care about, with AI-written briefings drawn from real outlets, arranged in sections the AI names around their biggest stories, and available as a newspaper-style PDF. Every open, skip and scroll changes what tomorrow's paper covers.

## What it does

- **Two-minute onboarding.** Pick topics, optionally narrow them with subtopics, and optionally write one sentence ("I follow Pakistani cricket and AI startups") that the AI turns into interests. Nothing else is asked.
- **A paper every local morning.** An hourly GitHub Action generates each reader's edition in their own morning, using the time zone captured from the browser at sign-up. The first paper is ready within a minute of onboarding. If the morning run missed someone, visiting the site generates it.
- **An AI editor.** One AI call picks 15-20 stories from 40-60 recent candidates, groups articles from different outlets that cover the same event, and names and orders the sections. About 1 in 5 stories come from weaker or related interests so the reader keeps discovering new things. Topics with too little news are filled with clearly labelled **Related** stories.
- **Briefings you can trust.** Briefings state only what the source snippets say. Each story lists its outlets and publish dates, carries a visible **AI-written summary** label, says when sources disagree, and links to the original article.
- **Learning you can see.** Each reader has a weight for every topic and subtopic, starting at 3.0. Opening a story adds 1.0, the Skip button subtracts 1.0, and scrolling past without opening subtracts 0.2 (once per story). Weights update immediately. The **What we've learned** page shows interests strengthening and weakening live, and readers can remove or correct any of them or reset to their onboarding choices.
- **Reader controls.** Every reader can see why a story matched their interests, choose how much of the edition is discovery, mute stories or topics, restore muted coverage, save stories across devices, and listen using their browser's speech engine.
- **Daily email delivery.** Readers can opt in to an edition email and choose a local delivery hour. The hourly cron sends through Resend when configured; delivery can be disabled in Settings.
- **One free product.** All current features are available to every reader; there are no paid plans, feature gates, or payment flows.
- **Web and PDF.** The web edition shows sections and outlet-credited photos; a broken photo is simply left out. The PDF uses a traditional newspaper layout (masthead, rules, two columns) with the same stories and photos, and is cached after the first download. Skip hides a story on the web only, so the PDF is always the complete edition.
- **History.** Every paper is kept. Recent editions are listed, older ones are reachable through a date picker, and each can be read on the web or downloaded as a PDF.
- **Settings.** Topics, region, language, preferred and avoided sources, and paper length. Changes apply from the next morning; saved papers never change.
- **Resilience.** If the main Gemini model fails, a second Gemini model takes over, then Groq if a key is configured. If all fail, the reader gets a plain edition with the outlets' own headlines and summaries, grouped by topic, plus a note explaining why. If the PDF fails to render, the web edition is unaffected, the button reads "PDF is being prepared", and the hourly run retries.

## Architecture

```
Browser ──> Next.js 16 (App Router) on Vercel
              ├─ proxy.ts            session refresh + sign-in guard
              ├─ /onboarding         topics + one sentence -> interests (AI)
              ├─ /paper, /paper/[d]  web edition, open/skip/scroll tracking
              ├─ /learned, /settings learning page, preferences
              ├─ /api/events         reading events -> bump_weight() (atomic, RLS)
              ├─ /api/papers/[id]/pdf  @react-pdf/renderer, cached in Storage
              ├─ /api/cron/morning   hourly run (Bearer CRON_SECRET)
              └─ /api/builder/generate  demo trigger (BUILDER_EMAIL only)
                     │
                     ▼
            lib/generate.ts  (one routine for onboarding, hourly, on-visit, builder)
              claim user+local_date -> refresh news (RSS + GNews, 1h cache)
              -> dedupe -> balance candidates by weight (~1 in 5 discovery)
              -> editor AI call (stories, groups, sections) -> briefing AI calls x5 in parallel
              -> save paper atomically   (Gemini -> Gemini fallback -> Groq if set -> plain edition)
                     │
GitHub Actions ──hourly──> /api/cron/morning
Supabase: Postgres (RLS owner-only) · Auth (email/password + Google) · Storage (PDFs) · saved stories and delivery status
```

**Data model** (`supabase/migrations/0001_init.sql`): `profiles`, `topics` (seeded), `interest_weights`, `articles` (shared, unique URL; only headline, snippet, source, date, image URL and link are stored), `fetch_cache`, `papers` (unique per user + local date), `sections`, `stories`, `story_articles`, `reading_events` (open | skip | scroll_past, once per story per kind), `generation_runs` (provider used, error).

**Security.** API keys stay on the server. Passwords are handled by Supabase Auth. Row-level security lets each reader read only their own rows, and papers can be written only by the service role. `npm run rls-check` creates two readers and shows that neither can read or write the other's data.

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

1. Create a free Supabase project. In the SQL editor, run all files in `supabase/migrations/` in order (`0001_init.sql`, then later migrations), then run `supabase/seed.sql`. For a smooth demo, turn off **Auth → Providers → Email → Confirm email**. To enable Google sign-in, turn on the Google provider and configure the callback URLs as described below.

### Google sign-in callback URLs

- In **Supabase → Authentication → URL Configuration**, set the Site URL to `https://daybreak-mu-five.vercel.app` and add `https://daybreak-mu-five.vercel.app/auth/callback` to the redirect URLs. Add `http://localhost:3000/auth/callback` only if you use Google sign-in locally.
- In the Google OAuth client, set the authorized redirect URI to `https://<project-ref>.supabase.co/auth/v1/callback` (the Supabase Auth callback, not the Margins app callback).
- Set Vercel's Production `NEXT_PUBLIC_SITE_URL` to `https://daybreak-mu-five.vercel.app` for email-confirmation redirects.
- If the Vercel deployment hostname changes, update the Supabase Site URL and redirect allow-list to match the hostname where sign-in starts.
2. Fill in `.env.local`:

| Variable | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` (Project Settings → API), not the dashboard link |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API (server only) |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Google AI Studio; default model `gemini-3.8-flash` |
| `GEMINI_FALLBACK_MODEL` | second Gemini model tried on failure; default `gemini-3.5-flash` |
| `GROQ_API_KEY`, `GROQ_MODEL` | optional, console.groq.com; default `llama-3.3-70b-versatile` |
| `GNEWS_API_KEY` | gnews.io |
| `CRON_SECRET` | any long random string; also stored as a GitHub Actions secret |
| `BUILDER_EMAIL` | the account allowed to use "Generate next edition now" |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally, or the Vercel URL |
| `RESEND_API_KEY`, `EMAIL_FROM` | Optional Resend API key and verified sender for daily email delivery; use `Margins <paper@your-verified-domain.com>` for `EMAIL_FROM` |

3. Optionally run `npm run rls-check` to verify reader isolation.

## Deploying

1. Import the GitHub repo into Vercel (Hobby plan) and add the environment variables above.
2. In GitHub, go to **Settings → Secrets and variables → Actions** and add `APP_URL` (the Vercel URL, without a trailing slash) and `CRON_SECRET`. The workflow `.github/workflows/morning-run.yml` runs at 5 minutes past every hour and can also be started by hand.

## Free-tier notes (checked October 2026)

| Service | Limit | How the design handles it |
| --- | --- | --- |
| GNews free | 100 requests/day, 10 articles each, 12-hour delay, burst requests return 429 | GNews is called only while generating a paper, at most 6 searches per reader, cached per topic for an hour and spaced about 1 s apart. 22 publisher RSS feeds supply most of the volume. |
| Gemini Flash free | per-minute and per-day caps; returns 503 under high demand | About 5 calls per paper (1 editor + ~4 briefing batches). Transient errors are retried with backoff before switching to Groq. |
| Groq free | about 1,000 requests and about 100k tokens per day for Llama 3.3 70B | Used only as the fallback. |
| Vercel Hobby | functions run up to 300 s | One paper takes about 25-40 s. The hourly run processes two readers at a time within its time budget. |

Measured locally: a paper takes about 25 s (news 2.8 s, editor 13.5 s, briefings 7.0 s); the first PDF render takes about 8 s and later downloads come from the cache.

## Accuracy rules for briefings

1. State only what the source snippets say: no added facts, numbers, names or quotes.
2. List the outlets and publish dates with every story.
3. Show a visible "AI-written summary" label. When the briefing fell back to the outlet's own text, the label reads "Outlet's own summary".
4. When sources disagree, say so.
5. Always link to the original source.
