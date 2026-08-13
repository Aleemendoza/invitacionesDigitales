-- Preserve administrative history when an account is removed from Auth.
alter table public.role_audit_log alter column actor_id drop not null;
alter table public.role_audit_log alter column target_id drop not null;
alter table public.role_audit_log drop constraint if exists role_audit_log_actor_id_fkey;
alter table public.role_audit_log drop constraint if exists role_audit_log_target_id_fkey;
alter table public.role_audit_log add constraint role_audit_log_actor_id_fkey foreign key(actor_id) references public.profiles(id) on delete set null;
alter table public.role_audit_log add constraint role_audit_log_target_id_fkey foreign key(target_id) references public.profiles(id) on delete set null;

create table if not exists public.account_deletion_audit_log(
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  target_id uuid references public.profiles(id) on delete set null,
  target_email text not null,
  created_at timestamptz not null default now()
);
alter table public.account_deletion_audit_log enable row level security;
