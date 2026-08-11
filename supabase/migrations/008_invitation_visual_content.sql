-- `content` is intentionally a JSON document; preserving existing rows only needs a default key.
update public.events
set content = content || jsonb_build_object('dressCode', '')
where not (content ? 'dressCode');

comment on column public.events.content is 'Invitation configuration including optional dressCode.';
