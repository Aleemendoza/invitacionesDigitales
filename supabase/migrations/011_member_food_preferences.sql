create table if not exists public.guest_member_food_preferences(
  guest_member_id uuid primary key references public.guest_members on delete cascade,
  food_preference text not null check(food_preference in ('Tradicional','Vegetariana','Vegana')),
  updated_at timestamptz not null default now()
);

drop function if exists public.submit_guest_rsvp_answers(uuid,uuid,uuid[],integer,integer,text,jsonb);
create function public.submit_guest_rsvp_answers(
  p_event_id uuid, p_group_id uuid, p_attendee_ids uuid[], p_unnamed_attendees integer,
  p_expected_version integer, p_idempotency_key text, p_answers jsonb, p_member_food_preferences jsonb
) returns public.guest_groups language plpgsql security definer set search_path=public as $$
declare v_group public.guest_groups; v_count integer; v_status public.rsvp_status; v_answer jsonb; v_question public.rsvp_questions;
begin
  select * into v_group from public.guest_groups where id=p_group_id and event_id=p_event_id for update;
  if not found then raise exception 'guest group not found'; end if;
  if exists(select 1 from public.rsvp_submissions where guest_group_id=p_group_id and idempotency_key=p_idempotency_key) then return v_group; end if;
  if v_group.response_version<>p_expected_version then raise exception 'rsvp_conflict'; end if;
  select count(*) into v_count from public.guest_members where guest_group_id=p_group_id and id=any(p_attendee_ids);
  if v_count<>coalesce(array_length(p_attendee_ids,1),0) then raise exception 'invalid guest member'; end if;
  v_count:=v_count+p_unnamed_attendees; if v_count>v_group.seats then raise exception 'seat limit exceeded'; end if;

  if v_count>0 and (
    jsonb_typeof(coalesce(p_member_food_preferences,'[]'::jsonb))<>'array'
    or (select count(*) from jsonb_array_elements(p_member_food_preferences))<>v_count
    or exists(select 1 from jsonb_array_elements(p_member_food_preferences) preference where preference->>'memberId' is null or preference->>'foodPreference' not in ('Tradicional','Vegetariana','Vegana'))
    or exists(select 1 from jsonb_array_elements(p_member_food_preferences) preference where not exists(select 1 from public.guest_members member where member.guest_group_id=p_group_id and member.id=(preference->>'memberId')::uuid and member.id=any(p_attendee_ids)))
  ) then raise exception 'member food preference required'; end if;

  for v_answer in select value from jsonb_array_elements(coalesce(p_answers,'[]'::jsonb)) loop
    select * into v_question from public.rsvp_questions where id=(v_answer->>'questionId')::uuid and event_id=p_event_id;
    if not found then raise exception 'invalid question'; end if;
    if v_question.key='food_preference' then continue; end if;
    if v_question.required and (v_answer->'value' is null or v_answer->'value'='null'::jsonb or v_answer->'value'='""'::jsonb or v_answer->'value'='[]'::jsonb) then raise exception 'required answer'; end if;
    insert into public.rsvp_answers(guest_group_id,question_id,value) values(p_group_id,v_question.id,v_answer->'value') on conflict(guest_group_id,question_id) do update set value=excluded.value,updated_at=now();
  end loop;
  if exists(select 1 from public.rsvp_questions q where q.event_id=p_event_id and q.required and q.key<>'food_preference' and not exists(select 1 from public.rsvp_answers a where a.guest_group_id=p_group_id and a.question_id=q.id)) then raise exception 'required answer'; end if;

  delete from public.guest_member_food_preferences where guest_member_id in (select id from public.guest_members where guest_group_id=p_group_id);
  insert into public.guest_member_food_preferences(guest_member_id,food_preference)
    select (preference->>'memberId')::uuid, preference->>'foodPreference' from jsonb_array_elements(coalesce(p_member_food_preferences,'[]'::jsonb)) preference;
  v_status:=case when v_count=0 then 'declined' when v_count=v_group.seats then 'confirmed' else 'partial' end;
  update public.guest_members set attending=id=any(p_attendee_ids) where guest_group_id=p_group_id;
  update public.guest_groups set status=v_status,confirmed_seats=v_count,response_version=response_version+1,last_activity_at=now(),updated_at=now() where id=p_group_id returning * into v_group;
  insert into public.rsvp_submissions(event_id,guest_group_id,idempotency_key,expected_version,attendee_ids,unnamed_attendees,status) values(p_event_id,p_group_id,p_idempotency_key,p_expected_version,p_attendee_ids,p_unnamed_attendees,v_status);
  return v_group;
end $$;
revoke all on table public.guest_member_food_preferences from anon, authenticated;
revoke all on function public.submit_guest_rsvp_answers(uuid,uuid,uuid[],integer,integer,text,jsonb,jsonb) from public;
