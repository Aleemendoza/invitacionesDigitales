-- Gift and social-photo blocks reuse event_sections JSONB; no parallel section system.
alter table public.event_sections add column if not exists style_variant text;
alter table public.event_sections add constraint event_sections_kind_check check (kind in ('cover','countdown','message','agenda','venues','gallery','dress_code','gifts','social_photos','rsvp','footer')) not valid;
create index if not exists event_sections_public_kind_idx on public.event_sections(event_id,kind) where enabled and visibility='public';
comment on column public.event_sections.content is 'Gift configs contain account holder + alias and are returned only by the guarded gift-details route; never include financial details in OG metadata or analytics.';
