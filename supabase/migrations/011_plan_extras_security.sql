alter table public.event_trivia_submissions add column if not exists participant_token_hash text;
create unique index if not exists event_trivia_one_submission_per_browser on public.event_trivia_submissions(event_id, participant_token_hash) where participant_token_hash is not null;
create index if not exists event_album_photos_event_idx on public.event_album_photos(event_id, created_at desc);
