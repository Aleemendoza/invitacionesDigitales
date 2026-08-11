alter table public.profiles add column if not exists role text not null default 'organizer' check(role in ('organizer','admin'));
alter table public.events add column if not exists template_slug text not null default 'eclat', add column if not exists plan text not null default 'Essential' check(plan in ('Essential','Plus','Premium')), add column if not exists payment_status text not null default 'unpaid' check(payment_status in ('unpaid','pending','approved','rejected'));

create table if not exists public.event_payments(
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events on delete cascade,
  plan text not null check(plan in ('Essential','Plus','Premium')),
  amount integer not null check(amount > 0),
  status text not null default 'pending' check(status in ('pending','approved','rejected')),
  receipt_path text,
  organizer_note text,
  admin_note text,
  reviewed_by uuid references public.profiles,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists event_payments_event_created_idx on public.event_payments(event_id, created_at desc);
alter table public.event_payments enable row level security;
create policy "payment owner read" on public.event_payments for select using(exists(select 1 from public.events e where e.id=event_id and e.owner_id=auth.uid()));
create policy "payment owner create" on public.event_payments for insert with check(exists(select 1 from public.events e where e.id=event_id and e.owner_id=auth.uid()));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('payment-receipts','payment-receipts',false,8388608,array['image/jpeg','image/png','application/pdf']) on conflict(id) do update set public=false,file_size_limit=8388608;
create policy "payment receipt owners manage" on storage.objects for all using(bucket_id='payment-receipts' and exists(select 1 from public.events e where e.id::text=split_part(name,'/',1) and e.owner_id=auth.uid())) with check(bucket_id='payment-receipts' and exists(select 1 from public.events e where e.id::text=split_part(name,'/',1) and e.owner_id=auth.uid()));
