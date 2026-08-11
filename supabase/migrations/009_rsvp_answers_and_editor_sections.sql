create unique index if not exists event_sections_event_kind_unique on public.event_sections(event_id, kind);
create unique index if not exists rsvp_answers_group_question_unique on public.rsvp_answers(guest_group_id, question_id);

create or replace function public.submit_guest_rsvp_answers(
  p_event_id uuid, p_group_id uuid, p_attendee_ids uuid[], p_unnamed_attendees integer,
  p_expected_version integer, p_idempotency_key text, p_answers jsonb
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
  for v_answer in select value from jsonb_array_elements(coalesce(p_answers,'[]'::jsonb)) loop
    select * into v_question from public.rsvp_questions where id=(v_answer->>'questionId')::uuid and event_id=p_event_id;
    if not found then raise exception 'invalid question'; end if;
    if v_question.required and (v_answer->'value' is null or v_answer->'value'='null'::jsonb or v_answer->'value'='""'::jsonb or v_answer->'value'='[]'::jsonb) then raise exception 'required answer'; end if;
    insert into public.rsvp_answers(guest_group_id,question_id,value) values(p_group_id,v_question.id,v_answer->'value') on conflict(guest_group_id,question_id) do update set value=excluded.value,updated_at=now();
  end loop;
  if exists(select 1 from public.rsvp_questions q where q.event_id=p_event_id and q.required and not exists(select 1 from public.rsvp_answers a where a.guest_group_id=p_group_id and a.question_id=q.id)) then raise exception 'required answer'; end if;
  v_status:=case when v_count=0 then 'declined' when v_count=v_group.seats then 'confirmed' else 'partial' end;
  update public.guest_members set attending=id=any(p_attendee_ids) where guest_group_id=p_group_id;
  update public.guest_groups set status=v_status,confirmed_seats=v_count,response_version=response_version+1,last_activity_at=now(),updated_at=now() where id=p_group_id returning * into v_group;
  insert into public.rsvp_submissions(event_id,guest_group_id,idempotency_key,expected_version,attendee_ids,unnamed_attendees,status) values(p_event_id,p_group_id,p_idempotency_key,p_expected_version,p_attendee_ids,p_unnamed_attendees,v_status);
  return v_group;
end $$;
revoke all on function public.submit_guest_rsvp_answers(uuid,uuid,uuid[],integer,integer,text,jsonb) from public;
