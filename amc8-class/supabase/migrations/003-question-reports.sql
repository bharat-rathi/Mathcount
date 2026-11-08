-- "Report this question": players flag a question that looks wrong or unclear.
-- Paste into Supabase → SQL Editor → Run (safe to run again).

create table if not exists public.question_reports (
  id bigint generated always as identity primary key,
  parent_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kid_id uuid references public.kids (id) on delete set null,
  topic text check (char_length(topic) <= 40),
  tpl text check (char_length(tpl) <= 60),      -- question type, e.g. 'percents#4'
  game text check (char_length(game) <= 30),    -- amc8, practice, contest…
  reason text not null check (char_length(reason) <= 40),
  question text not null check (char_length(question) <= 1000),
  answer text check (char_length(answer) <= 200),
  choices text check (char_length(choices) <= 600),
  created_at timestamptz not null default now()
);
create index if not exists question_reports_tpl on public.question_reports (tpl);
alter table public.question_reports enable row level security;

-- A parent sees and adds only their own family's reports.
drop policy if exists "own reports" on public.question_reports;
create policy "own reports" on public.question_reports for all to authenticated
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid() and (kid_id is null or exists (select 1 from public.kids k where k.id = kid_id and k.parent_id = auth.uid())));

-- At most 500 reports per family, so nobody can fill the table.
create or replace function public.reports_cap() returns trigger language plpgsql as $$
begin
  if (select count(*) from public.question_reports where parent_id = new.parent_id) >= 500 then
    raise exception 'Too many reports';
  end if;
  return new;
end $$;
drop trigger if exists reports_cap on public.question_reports;
create trigger reports_cap before insert on public.question_reports for each row execute function public.reports_cap();

-- Owner only: every report, newest first, with the parent's email.
create or replace function public.admin_reports() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', r.id, 'when', r.created_at, 'email', u.email, 'kid', k.name, 'topic', r.topic, 'tpl', r.tpl,
      'game', r.game, 'reason', r.reason, 'question', r.question, 'answer', r.answer, 'choices', r.choices
    ) order by r.created_at desc), '[]'::jsonb)
    from (select * from public.question_reports order by created_at desc limit 1000) r
    left join auth.users u on u.id = r.parent_id
    left join public.kids k on k.id = r.kid_id
  );
end $$;
revoke all on function public.admin_reports() from public, anon;
grant execute on function public.admin_reports() to authenticated;
