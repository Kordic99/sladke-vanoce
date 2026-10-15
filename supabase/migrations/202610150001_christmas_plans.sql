-- Dedicated to Sladké Vánoce. No changes to other apps or auth providers.
create table public.christmas_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan jsonb not null,
  revision bigint not null check (revision > 0),
  updated_at timestamptz not null default now(),
  constraint christmas_plan_shape check (
    jsonb_typeof(plan) = 'object'
    and jsonb_typeof(plan->'recipes') = 'array'
    and jsonb_typeof(plan->'bought') = 'object'
    and plan ? 'recipes' and plan ? 'bought'
    and jsonb_array_length(plan->'recipes') <= 100
    and octet_length(plan::text) <= 4000000
  )
);
alter table public.christmas_plans enable row level security;
revoke all on public.christmas_plans from anon, authenticated;
grant select on public.christmas_plans to authenticated;
create policy "Read own Christmas plan" on public.christmas_plans
  for select to authenticated using ((select auth.uid()) = user_id);

-- No direct writes: all updates must check the previous revision atomically.
create function public.save_christmas_plan(new_plan jsonb, expected_revision bigint)
returns bigint language plpgsql security definer set search_path = '' as $$
declare
  caller uuid := auth.uid();
  saved_revision bigint;
begin
  if caller is null then raise exception 'Sign-in required' using errcode = '42501'; end if;
  if expected_revision is null or expected_revision < 0 or expected_revision >= 9007199254740990 then
    raise exception 'Invalid revision' using errcode = '22023';
  end if;
  if expected_revision = 0 then
    insert into public.christmas_plans(user_id, plan, revision)
      values (caller, new_plan, 1) on conflict (user_id) do nothing
      returning revision into saved_revision;
  else
    update public.christmas_plans set plan = new_plan, revision = revision + 1, updated_at = now()
      where user_id = caller and revision = expected_revision
      returning revision into saved_revision;
  end if;
  if saved_revision is null then raise exception 'Plan changed on another device' using errcode = '40001'; end if;
  return saved_revision;
end;
$$;
revoke all on function public.save_christmas_plan(jsonb, bigint) from public, anon;
grant execute on function public.save_christmas_plan(jsonb, bigint) to authenticated;

-- Realtime uses the same SELECT policy. Polling also covers reconnects.
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'christmas_plans') then
    alter publication supabase_realtime add table public.christmas_plans;
  end if;
end $$;
