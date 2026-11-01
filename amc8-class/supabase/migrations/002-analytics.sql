-- Analytics for the site owner. Paste into Supabase → SQL Editor → Run (safe to run again).
-- Then make yourself an admin (use the email you sign in with):
--   insert into public.admins (email) values ('you@example.com') on conflict do nothing;

-- Seconds spent on each finished game.
alter table public.games add column if not exists seconds int not null default 0;

-- Who may see the analytics. No policies: the table can't be read or changed from the app.
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a join auth.users u on lower(u.email) = lower(a.email) where u.id = auth.uid())
$$;

-- Every family: parent email, sign-up and last sign-in, and per kid their games, time and results.
create or replace function public.admin_overview() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  return (
    select coalesce(jsonb_agg(f order by f->>'last_active' desc nulls last), '[]'::jsonb) from (
      select jsonb_build_object(
        'email', u.email, 'joined', u.created_at, 'last_sign_in', u.last_sign_in_at,
        'last_active', (select max(g.created_at) from public.games g where g.parent_id = u.id),
        'kids', coalesce((
          select jsonb_agg(jsonb_build_object(
            'name', k.name, 'created', k.created_at, 'report', k.report,
            'games', (select count(*) from public.games g where g.kid_id = k.id),
            'days_active', (select count(distinct g.day) from public.games g where g.kid_id = k.id),
            'game_seconds', (select coalesce(sum(g.seconds), 0) from public.games g where g.kid_id = k.id),
            'right', (select coalesce(sum(g."right"), 0) from public.games g where g.kid_id = k.id),
            'total', (select coalesce(sum(g.total), 0) from public.games g where g.kid_id = k.id),
            'last_played', (select max(g.created_at) from public.games g where g.kid_id = k.id)
          ) order by k.created_at) from public.kids k where k.parent_id = u.id), '[]'::jsonb)
      ) f
      from auth.users u
    ) x
  );
end $$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.admin_overview() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_overview() to authenticated;
