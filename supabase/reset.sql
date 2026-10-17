-- DANGER: deletes all Personal Morning Paper data (readers' papers, weights, events).
-- Use only to start over on a fresh project; then run migrations/0001_init.sql and seed.sql.
-- Auth users are kept; delete them in Authentication -> Users if needed.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.bump_weight(text, text, text, real) cascade;

drop table if exists public.reading_events cascade;
drop table if exists public.story_articles cascade;
drop table if exists public.stories cascade;
drop table if exists public.sections cascade;
drop table if exists public.papers cascade;
drop table if exists public.generation_runs cascade;
drop table if exists public.fetch_cache cascade;
drop table if exists public.articles cascade;
drop table if exists public.interest_weights cascade;
drop table if exists public.topics cascade;
drop table if exists public.profiles cascade;

-- Cached PDFs: Supabase blocks deleting storage rows from SQL, so empty and
-- delete the "papers" bucket in Storage first if you want it gone. The
-- migration reuses an existing bucket, so leaving it is fine.
