-- Roles are server-managed. Owners can read their profile but cannot elevate themselves.
drop policy if exists "profile owner" on public.profiles;
create policy "profile owner read" on public.profiles for select using(id=auth.uid());

create table if not exists public.role_audit_log(
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id),
  target_id uuid not null references public.profiles(id),
  previous_role text not null check(previous_role in ('organizer','admin')),
  next_role text not null check(next_role in ('organizer','admin')),
  created_at timestamptz not null default now()
);
alter table public.role_audit_log enable row level security;
create index if not exists events_owner_created_idx on public.events(owner_id,created_at desc);
create index if not exists events_created_idx on public.events(created_at desc);
create index if not exists event_payments_status_created_idx on public.event_payments(status,created_at desc);
create index if not exists event_plan_upgrades_status_created_idx on public.event_plan_upgrades(status,created_at desc);
