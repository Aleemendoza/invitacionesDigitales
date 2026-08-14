-- Keep public.profiles in sync with Supabase Auth without changing existing profiles or roles.
-- This runs in the same transaction as the auth.users insert, so an account can never be
-- successfully created without its organizer profile.
create or replace function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      new.email,
      'Organizador'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists create_profile_for_auth_user on auth.users;
create trigger create_profile_for_auth_user
  after insert on auth.users
  for each row execute function public.create_profile_for_auth_user();

-- Repair accounts created before this trigger existed. Existing profiles, including
-- administrator roles, are left exactly as they are.
insert into public.profiles (id, full_name)
select
  user_record.id,
  coalesce(
    nullif(trim(user_record.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(user_record.raw_user_meta_data ->> 'name'), ''),
    user_record.email,
    'Organizador'
  )
from auth.users as user_record
on conflict (id) do nothing;
