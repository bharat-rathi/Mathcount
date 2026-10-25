-- Math Hoops database. Paste into Supabase → SQL Editor → New query → Run.
-- Safe to run again (it only creates what is missing).
--
-- Accounts belong to PARENTS (Supabase Auth, email sign-in). Kids never have accounts or
-- emails: a parent adds kid profiles (nickname + jersey number). Row-level security makes
-- every row visible only to the parent who owns it.

-- One row per kid: the app's whole saved state plus a small summary for emails/dashboards.
create table if not exists public.kids (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 20),
  state jsonb not null default '{}'::jsonb,
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists kids_parent on public.kids (parent_id);

-- One row per finished game, for history and the daily email.
create table if not exists public.games (
  id bigint generated always as identity primary key,
  kid_id uuid not null references public.kids (id) on delete cascade,
  parent_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  title text not null,
  kind text not null,
  "right" int not null,
  total int not null,
  points int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists games_kid_day on public.games (kid_id, day);

-- Each parent's email preferences.
create table if not exists public.parent_settings (
  parent_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  email_to text[] not null default '{}',
  email_enabled boolean not null default true,
  send_hour int not null default 20 check (send_hour between 0 and 23),
  timezone text not null default 'America/New_York'
);

alter table public.kids enable row level security;
alter table public.games enable row level security;
alter table public.parent_settings enable row level security;

-- A parent can see and change only their own rows. A game row must point at one of
-- their own kids, so nobody can attach games to another family's kid.
drop policy if exists "own kids" on public.kids;
create policy "own kids" on public.kids for all to authenticated
  using (parent_id = auth.uid()) with check (parent_id = auth.uid());

drop policy if exists "own games" on public.games;
create policy "own games" on public.games for all to authenticated
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid() and exists (select 1 from public.kids k where k.id = kid_id and k.parent_id = auth.uid()));

drop policy if exists "own settings" on public.parent_settings;
create policy "own settings" on public.parent_settings for all to authenticated
  using (parent_id = auth.uid()) with check (parent_id = auth.uid());

-- Keep updated_at fresh and cap families at 6 kid profiles.
create or replace function public.kids_touch() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if tg_op = 'INSERT' and (select count(*) from public.kids where parent_id = new.parent_id) >= 6 then
    raise exception 'A family can have at most 6 players';
  end if;
  return new;
end $$;
drop trigger if exists kids_touch on public.kids;
create trigger kids_touch before insert or update on public.kids for each row execute function public.kids_touch();

-- "Delete my family's data": removes the parent's kids, games and settings, then the account.
create or replace function public.delete_my_family() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from public.games where parent_id = auth.uid();
  delete from public.kids where parent_id = auth.uid();
  delete from public.parent_settings where parent_id = auth.uid();
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_family() from public, anon;
grant execute on function public.delete_my_family() to authenticated;
