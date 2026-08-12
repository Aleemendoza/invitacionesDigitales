-- Canonical plan codes avoid coupling database values to marketing copy.
alter table public.events drop constraint if exists events_plan_check;
alter table public.event_payments drop constraint if exists event_payments_plan_check;
update public.events set plan=case plan when 'Essential' then 'standard' when 'Plus' then 'premium' when 'Premium' then 'premium_plus' else plan end;
update public.event_payments set plan=case plan when 'Essential' then 'standard' when 'Plus' then 'premium' when 'Premium' then 'premium_plus' else plan end;
alter table public.events add constraint events_plan_check check(plan in ('standard','premium','premium_plus'));
alter table public.event_payments add constraint event_payments_plan_check check(plan in ('standard','premium','premium_plus'));

create table if not exists public.event_plan_upgrades(id uuid primary key default gen_random_uuid(),event_id uuid not null references public.events on delete cascade,source_plan text not null check(source_plan in ('standard','premium','premium_plus')),target_plan text not null check(target_plan in ('standard','premium','premium_plus')),amount integer not null check(amount>=0),status text not null default 'pending' check(status in ('pending','approved','rejected')),reviewed_by uuid references public.profiles,reviewed_at timestamptz,admin_note text,created_at timestamptz not null default now());
create unique index if not exists event_plan_upgrades_pending_idx on public.event_plan_upgrades(event_id) where status='pending';
alter table public.event_plan_upgrades enable row level security;
create policy "upgrade owner read" on public.event_plan_upgrades for select using(exists(select 1 from public.events e where e.id=event_id and e.owner_id=auth.uid()));
create policy "upgrade owner create" on public.event_plan_upgrades for insert with check(exists(select 1 from public.events e where e.id=event_id and e.owner_id=auth.uid()));

create table if not exists public.public_rsvp_responses(id uuid primary key default gen_random_uuid(),event_id uuid not null references public.events on delete cascade,first_name text not null,last_name text not null,companions integer not null default 0 check(companions>=0),food_preference text,song_request text,answers jsonb not null default '[]',created_at timestamptz not null default now());
create index if not exists public_rsvp_responses_event_idx on public.public_rsvp_responses(event_id,created_at desc);
create table if not exists public.event_album_photos(id uuid primary key default gen_random_uuid(),event_id uuid not null references public.events on delete cascade,storage_path text not null unique,created_at timestamptz not null default now());
create table if not exists public.event_trivia_questions(id uuid primary key default gen_random_uuid(),event_id uuid not null references public.events on delete cascade,question text not null,options jsonb not null,correct_option integer not null check(correct_option>=0),position integer not null default 0);
create table if not exists public.event_trivia_submissions(id uuid primary key default gen_random_uuid(),event_id uuid not null references public.events on delete cascade,answers jsonb not null,score integer not null default 0,created_at timestamptz not null default now());
