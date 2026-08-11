-- Single-event-link guest access. This migration is additive and keeps legacy token links intact.
alter table public.events
  add column if not exists private_content_mode text not null default 'public'
    check (private_content_mode in ('public', 'identified_guest')),
  add column if not exists single_event_link_enabled boolean not null default true;

alter table public.guest_groups
  add column if not exists response_version integer not null default 0,
  add column if not exists code_failed_attempts integer not null default 0 check (code_failed_attempts >= 0),
  add column if not exists code_locked_until timestamptz,
  add constraint guest_groups_confirmed_seats_valid check (confirmed_seats is null or confirmed_seats <= seats);

alter table public.event_sections
  add column if not exists visibility text not null default 'public'
    check (visibility in ('public', 'identified_guest', 'specific_subevents', 'specific_segments')),
  add column if not exists visibility_config jsonb not null default '{}';
alter table public.event_venues
  add column if not exists visibility text not null default 'public'
    check (visibility in ('public', 'after_identification', 'after_rsvp_confirmation'));

create table if not exists public.guest_group_subevents (
  guest_group_id uuid not null references public.guest_groups on delete cascade,
  subevent_id uuid not null references public.event_schedule_items on delete cascade,
  access_level text not null default 'included',
  primary key (guest_group_id, subevent_id)
);

create table if not exists public.rsvp_submissions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events on delete cascade,
  guest_group_id uuid not null unique references public.guest_groups on delete cascade,
  idempotency_key text not null,
  expected_version integer not null,
  attendee_ids uuid[] not null default '{}',
  unnamed_attendees integer not null default 0 check (unnamed_attendees >= 0),
  status public.rsvp_status not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (guest_group_id, idempotency_key)
);

create or replace function public.submit_guest_rsvp(
  p_event_id uuid, p_group_id uuid, p_attendee_ids uuid[], p_unnamed_attendees integer,
  p_expected_version integer, p_idempotency_key text
) returns public.guest_groups
language plpgsql security definer set search_path = public as $$
declare
  v_group public.guest_groups;
  v_attendee_count integer;
  v_status public.rsvp_status;
begin
  select * into v_group from public.guest_groups where id = p_group_id and event_id = p_event_id for update;
  if not found then raise exception 'guest group not found'; end if;
  if exists(select 1 from public.rsvp_submissions where guest_group_id = p_group_id and idempotency_key = p_idempotency_key) then
    return v_group;
  end if;
  if v_group.response_version <> p_expected_version then raise exception 'rsvp_conflict'; end if;
  select count(*) into v_attendee_count from public.guest_members where guest_group_id = p_group_id and id = any(p_attendee_ids);
  if v_attendee_count <> coalesce(array_length(p_attendee_ids, 1), 0) then raise exception 'invalid guest member'; end if;
  v_attendee_count := v_attendee_count + p_unnamed_attendees;
  if v_attendee_count > v_group.seats then raise exception 'seat limit exceeded'; end if;
  v_status := case when v_attendee_count = 0 then 'declined' when v_attendee_count = v_group.seats then 'confirmed' else 'partial' end;
  update public.guest_members set attending = id = any(p_attendee_ids) where guest_group_id = p_group_id;
  update public.guest_groups set status=v_status, confirmed_seats=v_attendee_count, response_version=response_version+1, last_activity_at=now(), updated_at=now()
    where id=p_group_id returning * into v_group;
  insert into public.rsvp_submissions(event_id,guest_group_id,idempotency_key,expected_version,attendee_ids,unnamed_attendees,status)
    values(p_event_id,p_group_id,p_idempotency_key,p_expected_version,p_attendee_ids,p_unnamed_attendees,v_status)
    on conflict (guest_group_id,idempotency_key) do update set updated_at=now();
  insert into public.event_activity(event_id,actor_group_id,kind,metadata) values(p_event_id,p_group_id,'rsvp_submitted',jsonb_build_object('attendees',v_attendee_count,'status',v_status));
  return v_group;
end $$;

revoke all on function public.submit_guest_rsvp(uuid,uuid,uuid[],integer,integer,text) from public;
-- Only backend service credentials call the function after validating the HttpOnly guest session.

alter table public.guest_group_subevents enable row level security;
alter table public.rsvp_submissions enable row level security;
alter table public.event_sections enable row level security;
alter table public.event_venues enable row level security;
alter table public.event_schedule_items enable row level security;
alter table public.event_media enable row level security;
alter table public.guest_members enable row level security;
alter table public.guest_invitation_tokens enable row level security;
alter table public.rsvp_questions enable row level security;
alter table public.rsvp_answers enable row level security;
alter table public.event_activity enable row level security;
create policy "host reads own guest sessions" on public.guest_sessions for select using (exists(select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid()));
create policy "host reads own RSVP submissions" on public.rsvp_submissions for select using (exists(select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid()));
create policy "host manages group subevents" on public.guest_group_subevents for all using (exists(select 1 from public.guest_groups g join public.events e on e.id = g.event_id where g.id = guest_group_id and e.owner_id = auth.uid())) with check (exists(select 1 from public.guest_groups g join public.events e on e.id = g.event_id where g.id = guest_group_id and e.owner_id = auth.uid()));
create policy "host manages event sections" on public.event_sections for all using (exists(select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid())) with check (exists(select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid()));
create policy "host manages event venues" on public.event_venues for all using (exists(select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid())) with check (exists(select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid()));
create policy "host manages event schedule" on public.event_schedule_items for all using (exists(select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid())) with check (exists(select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid()));
create policy "host manages event media" on public.event_media for all using (exists(select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid())) with check (exists(select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid()));
create policy "host manages guest members" on public.guest_members for all using (exists(select 1 from public.guest_groups g join public.events e on e.id = g.event_id where g.id = guest_group_id and e.owner_id = auth.uid())) with check (exists(select 1 from public.guest_groups g join public.events e on e.id = g.event_id where g.id = guest_group_id and e.owner_id = auth.uid()));
create policy "host manages legacy invitation tokens" on public.guest_invitation_tokens for all using (exists(select 1 from public.guest_groups g join public.events e on e.id = g.event_id where g.id = guest_group_id and e.owner_id = auth.uid())) with check (exists(select 1 from public.guest_groups g join public.events e on e.id = g.event_id where g.id = guest_group_id and e.owner_id = auth.uid()));
create policy "host manages RSVP questions" on public.rsvp_questions for all using (exists(select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid())) with check (exists(select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid()));
create policy "host reads own RSVP answers" on public.rsvp_answers for select using (exists(select 1 from public.guest_groups g join public.events e on e.id = g.event_id where g.id = guest_group_id and e.owner_id = auth.uid()));
create policy "host reads own activity" on public.event_activity for select using (exists(select 1 from public.events e where e.id = event_id and e.owner_id = auth.uid()));

comment on column public.guest_groups.access_code_hash is 'HMAC-SHA-256 of an event-scoped low-entropy PIN, with a server-only pepper. API rate limits and lockouts are mandatory.';
