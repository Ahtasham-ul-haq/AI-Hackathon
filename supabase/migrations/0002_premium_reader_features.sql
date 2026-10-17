-- Enhanced free reader controls, saved stories, and delivery preferences.
alter table public.profiles
  add column if not exists discovery_ratio integer not null default 20
    check (discovery_ratio between 0 and 40),
  add column if not exists muted_topics text[] not null default '{}',
  add column if not exists email_delivery boolean not null default false,
  add column if not exists delivery_hour integer not null default 7
    check (delivery_hour between 0 and 23);

create table if not exists public.saved_stories (
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, story_id)
);
alter table public.saved_stories enable row level security;
create policy "own saved stories" on public.saved_stories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id and exists (
    select 1 from public.stories s join public.papers p on p.id = s.paper_id
    where s.id = saved_stories.story_id and p.user_id = auth.uid()
  ));

create table if not exists public.muted_articles (
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);
alter table public.muted_articles enable row level security;
create policy "own muted articles" on public.muted_articles
  for all using (auth.uid() = user_id and exists (
    select 1 from public.story_articles sa
    join public.stories s on s.id = sa.story_id
    join public.papers p on p.id = s.paper_id
    where sa.article_id = muted_articles.article_id and p.user_id = auth.uid()
  )) with check (auth.uid() = user_id and exists (
    select 1 from public.story_articles sa
    join public.stories s on s.id = sa.story_id
    join public.papers p on p.id = s.paper_id
    where sa.article_id = muted_articles.article_id and p.user_id = auth.uid()
  ));

-- Idempotent record of each edition email attempt.
create table if not exists public.paper_deliveries (
  paper_id uuid primary key references public.papers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','sending','sent','failed')),
  error text,
  sent_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.paper_deliveries enable row level security;
create policy "own paper deliveries" on public.paper_deliveries
  for select using (auth.uid() = user_id);
