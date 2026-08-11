-- Canonical public address: /e/{events.slug}. Legacy invitation tokens remain valid.
create extension if not exists unaccent;
create type public.guest_access_mode as enum ('open', 'name_lookup', 'name_and_code');
alter table public.events add column if not exists guest_access_mode public.guest_access_mode not null default 'name_lookup', add column if not exists rsvp_enabled boolean not null default true, add column if not exists guest_lookup_enabled boolean not null default true, add column if not exists updated_at timestamptz not null default now();
alter table public.guest_groups add column if not exists display_name text, add column if not exists lookup_name_normalized text, add column if not exists lookup_hint text, add column if not exists access_code_hash text, add column if not exists access_code_version int not null default 1, add column if not exists updated_at timestamptz not null default now();
update public.guest_groups set display_name=coalesce(display_name,name),lookup_name_normalized=lower(unaccent(coalesce(display_name,name))) where display_name is null or lookup_name_normalized is null;
alter table public.guest_groups alter column display_name set not null, alter column lookup_name_normalized set not null;
create index if not exists guest_groups_event_lookup_idx on public.guest_groups(event_id, lookup_name_normalized text_pattern_ops);
create table if not exists public.guest_sessions(id uuid primary key default gen_random_uuid(),event_id uuid not null references public.events on delete cascade,guest_group_id uuid not null references public.guest_groups on delete cascade,session_token_hash text unique not null,created_at timestamptz not null default now(),expires_at timestamptz not null,last_used_at timestamptz not null default now(),revoked_at timestamptz,check(expires_at>created_at));
create index if not exists guest_sessions_active_idx on public.guest_sessions(event_id,guest_group_id) where revoked_at is null;
alter table public.guest_sessions enable row level security;
-- Public lookup must only be exposed through a controlled server endpoint/RPC.
revoke all on public.guest_groups from anon;
comment on table public.guest_sessions is 'Guest authorization sessions; never expose the token or hash to clients.';
