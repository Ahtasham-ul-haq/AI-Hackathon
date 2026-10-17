-- Personal Morning Paper: schema + row level security.
-- Run in the Supabase SQL editor (or `supabase db push`), then run seed.sql.

create extension if not exists pgcrypto;

-- Profiles -------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  timezone text not null default 'UTC',
  onboarded boolean not null default false,
  interests_note text,                       -- the one optional free-text sentence
  baseline_interests jsonb,                  -- onboarding choices, for "reset" ({picked, note})
  region text,                               -- null = worldwide
  language text not null default 'en',
  preferred_sources text[] not null default '{}',
  avoided_sources text[] not null default '{}',
  length text not null default 'standard' check (length in ('short','standard','long')),
  created_at timestamptz not null default now()
);

-- Seeded topic list (readable by everyone signed in) ----------------------
create table public.topics (
  slug text primary key,
  name text not null,
  subtopics text[] not null default '{}',
  related text[] not null default '{}',      -- slugs used for "Related" fillers
  sort int not null default 0
);

-- Per-reader interest weights (topic, or topic + subtopic) ---------------
create table public.interest_weights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,                       -- topic slug
  subtopic text not null default '',         -- '' = whole topic
  label text not null,                       -- display name
  weight real not null default 3.0,
  initial_weight real,                       -- onboarding value; null = learned later
  source text not null default 'onboarding' check (source in ('onboarding','note','learned')),
  updated_at timestamptz not null default now(),
  unique (user_id, topic, subtopic)
);

-- Shared article cache ---------------------------------------------------
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  title text not null,
  snippet text,
  source_name text not null,
  published_at timestamptz,
  image_url text,
  topic text,                                -- topic slug it was fetched for (hint)
  fetched_via text not null check (fetched_via in ('gnews','rss')),
  fetched_at timestamptz not null default now()
);
create index articles_published_idx on public.articles (published_at desc);
create index articles_topic_idx on public.articles (topic, published_at desc);

create table public.fetch_cache (
  key text primary key,                      -- e.g. 'gnews:technology:en:any' / 'rss:bbc'
  fetched_at timestamptz not null default now()
);

-- Papers (immutable once saved) -----------------------------------------
create table public.papers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  status text not null check (status in ('ready','plain')),
  note text,                                 -- explanatory note for plain edition
  pdf_path text,
  created_at timestamptz not null default now(),
  unique (user_id, local_date)
);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid not null references public.papers(id) on delete cascade,
  name text not null,
  position int not null
);

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid not null references public.papers(id) on delete cascade,
  section_id uuid not null references public.sections(id) on delete cascade,
  position int not null,
  headline text not null,
  briefing text not null,
  ai_written boolean not null default true,
  topics text[] not null default '{}',       -- topic slugs
  subtopics text[] not null default '{}',
  is_related boolean not null default false,
  sources_disagree boolean not null default false,
  image_url text,
  image_credit text
);

create table public.story_articles (
  story_id uuid not null references public.stories(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  primary key (story_id, article_id)
);

-- Learning ---------------------------------------------------------------
create table public.reading_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  kind text not null check (kind in ('open','skip','scroll_past')),
  created_at timestamptz not null default now()
);
-- Each kind counts once per story (no farming weight by re-opening).
create unique index reading_events_once
  on public.reading_events (user_id, story_id, kind);

-- Generation bookkeeping (claim = unique user + local date) -------------
create table public.generation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  trigger text not null,                     -- onboarding | hourly | visit | builder
  status text not null default 'running' check (status in ('running','done','failed')),
  provider text,                             -- gemini | groq | plain
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  unique (user_id, local_date)
);

-- New auth user -> profile ----------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, timezone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(nullif(new.raw_user_meta_data->>'timezone', ''), 'UTC')
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Atomic weight change for the signed-in reader (learning) ----------------
-- Creates a 'learned' interest when a reader opens a story in a topic they
-- never chose; negative signals never create new interests.
create or replace function public.bump_weight(p_topic text, p_subtopic text, p_label text, p_delta real)
returns void language plpgsql security invoker set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  update public.interest_weights
     set weight = greatest(-10, least(20, weight + p_delta)), updated_at = now()
   where user_id = auth.uid() and topic = p_topic and lower(subtopic) = lower(p_subtopic);
  if not found and p_delta > 0 then
    insert into public.interest_weights (user_id, topic, subtopic, label, weight, initial_weight, source)
    values (auth.uid(), p_topic, p_subtopic, p_label, p_delta, null, 'learned')
    on conflict (user_id, topic, subtopic) do update
      set weight = greatest(-10, least(20, interest_weights.weight + p_delta)), updated_at = now();
  end if;
end $$;

-- Row level security: owner-only -----------------------------------------
alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.interest_weights enable row level security;
alter table public.articles enable row level security;
alter table public.fetch_cache enable row level security;
alter table public.papers enable row level security;
alter table public.sections enable row level security;
alter table public.stories enable row level security;
alter table public.story_articles enable row level security;
alter table public.reading_events enable row level security;
alter table public.generation_runs enable row level security;

create policy "own profile select" on public.profiles
  for select using (auth.uid() = id);
create policy "own profile update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "topics readable" on public.topics
  for select to authenticated using (true);

create policy "own weights" on public.interest_weights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Articles are news metadata, but readers only see ones in their own papers.
create policy "articles in own papers" on public.articles
  for select using (exists (
    select 1 from public.story_articles sa
    join public.stories s on s.id = sa.story_id
    join public.papers p on p.id = s.paper_id
    where sa.article_id = articles.id and p.user_id = auth.uid()
  ));

create policy "own papers" on public.papers
  for select using (auth.uid() = user_id);

create policy "own sections" on public.sections
  for select using (exists (
    select 1 from public.papers p where p.id = sections.paper_id and p.user_id = auth.uid()));

create policy "own stories" on public.stories
  for select using (exists (
    select 1 from public.papers p where p.id = stories.paper_id and p.user_id = auth.uid()));

create policy "own story_articles" on public.story_articles
  for select using (exists (
    select 1 from public.stories s join public.papers p on p.id = s.paper_id
    where s.id = story_articles.story_id and p.user_id = auth.uid()));

create policy "own reading events" on public.reading_events
  for select using (auth.uid() = user_id);
create policy "insert own reading events" on public.reading_events
  for insert with check (auth.uid() = user_id and exists (
    select 1 from public.stories s join public.papers p on p.id = s.paper_id
    where s.id = reading_events.story_id and p.user_id = auth.uid()));

create policy "own runs" on public.generation_runs
  for select using (auth.uid() = user_id);

-- fetch_cache has no policies (service role only). Papers, sections and
-- stories are written only by the service role, so readers can't edit them.

-- PDF cache bucket (private; served through the app) ---------------------
insert into storage.buckets (id, name, public) values ('papers', 'papers', false)
on conflict (id) do nothing;
