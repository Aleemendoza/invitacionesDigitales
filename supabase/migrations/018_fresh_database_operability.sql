-- Final-state repairs for clean installs and upgrades from migrations 001-017.
-- This migration is intentionally forward-only: do not rewrite committed history.

-- Migration 006 introduced the legacy default "Essential". Migration 010
-- converted existing values and constraints, but did not replace that default.
alter table public.events alter column plan set default 'standard';

-- Keep every RSVP revision while retaining idempotency per request. The simple
-- UNIQUE constraint from migration 003 prevented a guest group from responding
-- more than once, making the compound idempotency constraint ineffective.
alter table public.rsvp_submissions
  drop constraint if exists rsvp_submissions_guest_group_id_key;

-- Account deletion must also remove relational event data owned by the deleted
-- profile. Storage objects require separate cleanup in the application because
-- PostgreSQL foreign-key cascades do not operate on Storage.
alter table public.events drop constraint if exists events_owner_id_fkey;
alter table public.events
  add constraint events_owner_id_fkey
  foreign key (owner_id) references public.profiles(id) on delete cascade;

-- Historical payment records must not prevent deletion of an administrator
-- who reviewed them.
alter table public.event_payments
  drop constraint if exists event_payments_reviewed_by_fkey;
alter table public.event_payments
  add constraint event_payments_reviewed_by_fkey
  foreign key (reviewed_by) references public.profiles(id) on delete set null;

alter table public.event_plan_upgrades
  drop constraint if exists event_plan_upgrades_reviewed_by_fkey;
alter table public.event_plan_upgrades
  add constraint event_plan_upgrades_reviewed_by_fkey
  foreign key (reviewed_by) references public.profiles(id) on delete set null;

-- Migration 004 added this constraint as NOT VALID for safe rollout. Validate
-- it on clean/compatible databases without blocking an existing installation
-- that contains an old custom kind; those rows remain visible for remediation.
do $$
begin
  if not exists (
    select 1 from public.event_sections
    where kind not in (
      'cover','countdown','message','agenda','venues','gallery','dress_code',
      'gifts','social_photos','rsvp','footer'
    )
  ) then
    alter table public.event_sections validate constraint event_sections_kind_check;
  else
    raise warning 'event_sections_kind_check remains NOT VALID: legacy section kinds require remediation';
  end if;
end $$;

-- Remove superseded RSVP function signatures. Only the current eight-argument
-- function is part of the server contract.
drop function if exists public.submit_guest_rsvp(uuid,uuid,uuid[],integer,integer,text);
drop function if exists public.submit_guest_rsvp_answers(uuid,uuid,uuid[],integer,integer,text,jsonb);

-- Server-only functions are denied to browser roles and explicitly enabled for
-- the service role. REVOKE from PUBLIC alone is not a positive service grant.
grant usage on schema public to service_role;

revoke all on function public.submit_guest_rsvp_answers(uuid,uuid,uuid[],integer,integer,text,jsonb,jsonb)
  from public, anon, authenticated;
grant execute on function public.submit_guest_rsvp_answers(uuid,uuid,uuid[],integer,integer,text,jsonb,jsonb)
  to service_role;

revoke all on function public.approve_payment_and_publish(uuid,uuid,text,text,jsonb)
  from public, anon, authenticated;
grant execute on function public.approve_payment_and_publish(uuid,uuid,text,text,jsonb)
  to service_role;

revoke all on function public.consume_rate_limit(text,text,integer,integer)
  from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text,text,integer,integer)
  to service_role;

revoke all on function public.record_guest_code_attempt(uuid,boolean)
  from public, anon, authenticated;
grant execute on function public.record_guest_code_attempt(uuid,boolean)
  to service_role;

revoke all on function public.register_event_media(uuid,text,text,integer,integer)
  from public, anon, authenticated;
grant execute on function public.register_event_media(uuid,text,text,integer,integer)
  to service_role;

revoke all on function public.register_album_photo(uuid,text,integer)
  from public, anon, authenticated;
grant execute on function public.register_album_photo(uuid,text,integer)
  to service_role;

-- Make server access deterministic across projects regardless of project-level
-- default privilege customizations. Browser access remains governed by 017.
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
alter default privileges in schema public
  grant all privileges on tables to service_role;
alter default privileges in schema public
  grant all privileges on sequences to service_role;
