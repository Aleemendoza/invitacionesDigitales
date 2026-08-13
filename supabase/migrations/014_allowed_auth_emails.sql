create or replace function public.enforce_allowed_auth_email()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.email is null or lower(split_part(new.email, '@', 2)) not in ('gmail.com','outlook.com','hotmail.com') then
    raise exception 'Solo se permiten correos Gmail, Outlook o Hotmail.' using errcode='22023';
  end if;
  return new;
end;
$$;
drop trigger if exists enforce_allowed_auth_email on auth.users;
create trigger enforce_allowed_auth_email before insert or update of email on auth.users for each row execute function public.enforce_allowed_auth_email();
