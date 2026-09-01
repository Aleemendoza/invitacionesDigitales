-- Consolidates the former duplicate 011_plan_extras_security migration and
-- hardens production authorization, payments, throttling and upload quotas.

-- Remove the auth provider allow-list. Supabase email verification and API
-- anti-abuse controls remain responsible for account safety.
drop trigger if exists enforce_allowed_auth_email on auth.users;
drop function if exists public.enforce_allowed_auth_email();

-- Repair objects that could have been skipped when the duplicate 011 version
-- was rejected by a remote migration runner.
alter table public.event_trivia_submissions add column if not exists participant_token_hash text;
create unique index if not exists event_trivia_one_submission_per_browser
  on public.event_trivia_submissions(event_id, participant_token_hash)
  where participant_token_hash is not null;
create index if not exists event_album_photos_event_idx
  on public.event_album_photos(event_id, created_at desc);

-- Every public-schema table is private by default. The application exposes the
-- intentionally public projection through audited server routes.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','templates','template_versions','events','event_sections',
    'event_venues','event_schedule_items','event_media','guest_groups',
    'guest_members','guest_invitation_tokens','rsvp_questions','rsvp_answers',
    'event_activity','guest_sessions','guest_group_subevents','rsvp_submissions',
    'event_payments','event_plan_upgrades','public_rsvp_responses',
    'event_album_photos','event_trivia_questions','event_trivia_submissions',
    'guest_member_food_preferences','role_audit_log','account_deletion_audit_log'
  ] loop
    if to_regclass('public.' || table_name) is not null then
      execute format('alter table public.%I enable row level security', table_name);
      execute format('revoke all on table public.%I from anon, authenticated', table_name);
    end if;
  end loop;
end $$;

-- Published template catalogue is the only direct anonymous read surface.
drop policy if exists "published template catalogue" on public.templates;
create policy "published template catalogue" on public.templates
  for select to anon, authenticated using (is_published = true);
drop policy if exists "published template versions" on public.template_versions;
create policy "published template versions" on public.template_versions
  for select to anon, authenticated using (
    exists(select 1 from public.templates t where t.id=template_id and t.is_published=true)
  );
grant select on public.templates, public.template_versions to anon, authenticated;

alter table public.event_payments
  add column if not exists payment_kind text not null default 'initial',
  add column if not exists idempotency_key text,
  add column if not exists event_plan_upgrade_id uuid references public.event_plan_upgrades(id) on delete set null,
  add column if not exists provider_payload jsonb not null default '{}'::jsonb;
alter table public.event_payments drop constraint if exists event_payments_payment_kind_check;
alter table public.event_payments add constraint event_payments_payment_kind_check
  check(payment_kind in ('initial','upgrade'));
create unique index if not exists event_payments_idempotency_idx
  on public.event_payments(event_id,payment_kind,idempotency_key)
  where idempotency_key is not null;
create unique index if not exists event_payments_one_pending_checkout_idx
  on public.event_payments(event_id,payment_kind,plan)
  where status='pending' and provider='mercadopago';

-- Atomic, monotonic payment approval. Only the service role may call it.
create or replace function public.approve_payment_and_publish(
  p_local_payment_id uuid,
  p_event_id uuid,
  p_provider_payment_id text,
  p_provider_status text,
  p_provider_payload jsonb default '{}'::jsonb
) returns public.events
language plpgsql security definer set search_path=public as $$
declare v_payment public.event_payments; v_event public.events;
begin
  select * into v_payment from public.event_payments
    where id=p_local_payment_id and event_id=p_event_id for update;
  if not found then raise exception 'payment_not_found'; end if;
  select * into v_event from public.events where id=p_event_id for update;
  if v_payment.provider <> 'mercadopago' then raise exception 'provider_mismatch'; end if;

  update public.event_payments set
    status='approved', provider_payment_id=p_provider_payment_id,
    provider_status=p_provider_status, provider_payload=coalesce(p_provider_payload,'{}'::jsonb),
    reviewed_at=coalesce(reviewed_at,now()), updated_at=now()
  where id=v_payment.id;

  if v_payment.payment_kind='upgrade' then
    update public.events set plan=v_payment.plan,payment_status='approved',status='published',updated_at=now()
      where id=p_event_id;
    update public.event_plan_upgrades set status='approved',reviewed_at=now()
      where id=v_payment.event_plan_upgrade_id and status='pending';
  else
    update public.events set plan=v_payment.plan,payment_status='approved',status='published',updated_at=now()
      where id=p_event_id;
  end if;
  select * into v_event from public.events where id=p_event_id;
  return v_event;
end $$;
revoke all on function public.approve_payment_and_publish(uuid,uuid,text,text,jsonb) from public, anon, authenticated;

-- Shared atomic rate limiter. Keys are already HMACed by the server.
create table if not exists public.api_rate_limits(
  action text not null,
  scope_hash text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 1 check(request_count > 0),
  primary key(action,scope_hash,window_started_at)
);
alter table public.api_rate_limits enable row level security;
revoke all on table public.api_rate_limits from public, anon, authenticated;
create or replace function public.consume_rate_limit(
  p_action text,p_scope_hash text,p_max_requests integer,p_window_seconds integer
) returns table(allowed boolean,retry_after integer)
language plpgsql security definer set search_path=public as $$
declare v_window timestamptz; v_count integer;
begin
  if p_max_requests<1 or p_window_seconds<1 then raise exception 'invalid_rate_limit'; end if;
  -- Opportunistic bounded cleanup keeps the table small even without pg_cron.
  delete from public.api_rate_limits where ctid in (
    select ctid from public.api_rate_limits where window_started_at<now()-interval '2 days' limit 100
  );
  v_window := to_timestamp(floor(extract(epoch from clock_timestamp())/p_window_seconds)*p_window_seconds);
  insert into public.api_rate_limits(action,scope_hash,window_started_at,request_count)
    values(p_action,p_scope_hash,v_window,1)
  on conflict(action,scope_hash,window_started_at) do update
    set request_count=public.api_rate_limits.request_count+1
  returning request_count into v_count;
  allowed := v_count<=p_max_requests;
  retry_after := greatest(1,ceil(extract(epoch from v_window + make_interval(secs=>p_window_seconds)-clock_timestamp()))::integer);
  return next;
end $$;
revoke all on function public.consume_rate_limit(text,text,integer,integer) from public, anon, authenticated;

-- Atomic PIN lockout avoids lost updates under concurrent guesses.
create or replace function public.record_guest_code_attempt(p_group_id uuid,p_success boolean)
returns public.guest_groups language plpgsql security definer set search_path=public as $$
declare v_group public.guest_groups; v_attempts integer;
begin
  select * into v_group from public.guest_groups where id=p_group_id for update;
  if not found then raise exception 'guest_group_not_found'; end if;
  if p_success then v_attempts:=0; else v_attempts:=v_group.code_failed_attempts+1; end if;
  update public.guest_groups set code_failed_attempts=v_attempts,
    code_locked_until=case when p_success then null when v_attempts>=5 then now()+interval '10 minutes' else code_locked_until end,
    updated_at=now() where id=p_group_id returning * into v_group;
  return v_group;
end $$;
revoke all on function public.record_guest_code_attempt(uuid,boolean) from public, anon, authenticated;

-- Serialize media quotas. The object is uploaded first and removed by the API
-- if this registration fails.
create or replace function public.register_event_media(
  p_event_id uuid,p_storage_path text,p_kind text,p_position integer,p_limit integer
) returns public.event_media language plpgsql security definer set search_path=public as $$
declare v_result public.event_media;
begin
  perform 1 from public.events where id=p_event_id for update;
  if (select count(*) from public.event_media where event_id=p_event_id)>=p_limit then raise exception 'media_quota_exceeded'; end if;
  insert into public.event_media(event_id,storage_path,kind,position)
    values(p_event_id,p_storage_path,p_kind,p_position) returning * into v_result;
  return v_result;
end $$;
revoke all on function public.register_event_media(uuid,text,text,integer,integer) from public, anon, authenticated;

create or replace function public.register_album_photo(p_event_id uuid,p_storage_path text,p_limit integer default 500)
returns public.event_album_photos language plpgsql security definer set search_path=public as $$
declare v_result public.event_album_photos;
begin
  perform 1 from public.events where id=p_event_id for update;
  if (select count(*) from public.event_album_photos where event_id=p_event_id)>=p_limit then raise exception 'album_quota_exceeded'; end if;
  insert into public.event_album_photos(event_id,storage_path) values(p_event_id,p_storage_path) returning * into v_result;
  return v_result;
end $$;
revoke all on function public.register_album_photo(uuid,text,integer) from public, anon, authenticated;

alter table public.public_rsvp_responses add column if not exists idempotency_key text;
create unique index if not exists public_rsvp_idempotency_idx
  on public.public_rsvp_responses(event_id,idempotency_key);

-- Storage remains private and accepts only image formats validated again by the API.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('event-album','event-album',false,3500000,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=3500000,allowed_mime_types=excluded.allowed_mime_types;
update storage.buckets set public=false,file_size_limit=3500000,
  allowed_mime_types=array['image/jpeg','image/png','image/webp'] where id='event-media';

-- Keep stale limiter rows bounded without requiring pg_cron.
delete from public.api_rate_limits where window_started_at < now()-interval '2 days';
