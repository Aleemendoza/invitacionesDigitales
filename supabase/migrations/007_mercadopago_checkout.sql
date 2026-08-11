alter table public.event_payments add column if not exists provider text not null default 'manual', add column if not exists provider_preference_id text, add column if not exists provider_payment_id text unique, add column if not exists provider_status text;
create index if not exists event_payments_provider_preference_idx on public.event_payments(provider, provider_preference_id);
