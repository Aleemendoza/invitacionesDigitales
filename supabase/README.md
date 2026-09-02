# Crear una base Supabase desde cero

La fuente de verdad es `supabase/migrations`. Para una base nueva se deben
ejecutar **todas las migraciones, de `001` a `018`, en orden ascendente**. No se
debe omitir `014` o `015`: aunque su efecto final sea reemplazado por migraciones
posteriores, forman parte del historial reproducible.

## Opción recomendada: Supabase CLI

Desde la raíz del repositorio:

```powershell
supabase login
supabase init # sólo si todavía no existe supabase/config.toml
supabase link --project-ref <PROJECT_REF>
supabase db push --include-all
```

Confirmar el proyecto enlazado antes de aceptar cambios. No usar
`supabase db reset --linked` contra staging o producción porque elimina datos.

## Alternativa: SQL Editor

Si no se dispone de CLI, abrir los archivos de `supabase/migrations` y ejecutar
su contenido individualmente en orden `001` → `018`. Este método no registra el
historial en `supabase_migrations.schema_migrations`: esa base deberá seguir
gestionándose manualmente hasta establecer un baseline explícito. No ejecutar
luego `db push` sin baselinar, porque intentaría reaplicar las migraciones. La CLI
es la opción preferida.

## Primer administrador

La opción recomendada es usar el script administrativo del proyecto. En
PowerShell, sin incluir la contraseña como argumento del proceso:

```powershell
$env:ACCOUNT_EMAIL="tu-email@dominio.com"
$env:ACCOUNT_PASSWORD="UNA_CONTRASEÑA_LARGA_Y_UNICA"
$env:ACCOUNT_FULL_NAME="Tu nombre"
pnpm account:create-admin
Remove-Item Env:ACCOUNT_EMAIL, Env:ACCOUNT_PASSWORD, Env:ACCOUNT_FULL_NAME
```

El script usa `SUPABASE_SERVICE_ROLE_KEY` desde `.env.local`/`.env`, confirma el
email y asigna el rol `admin`. Nunca debe ejecutarse desde el navegador ni en un
equipo que no sea de confianza.

Como alternativa manual, crear primero la cuenta desde el flujo normal de
registro. Luego reemplazar el email del bloque siguiente y ejecutarlo una sola
vez en el SQL Editor:

```sql
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id
  from auth.users
  where lower(email) = lower('ADMIN_EMAIL_AQUI')
    and email_confirmed_at is not null;

  if v_user_id is null then
    raise exception 'No existe un usuario confirmado con ese email';
  end if;

  update public.profiles
  set role = 'admin'
  where id = v_user_id;

  if not found then
    raise exception 'El perfil todavía no fue sincronizado';
  end if;
end $$;
```

Verificación:

```sql
select u.email, p.role
from auth.users u
join public.profiles p on p.id = u.id
where p.role = 'admin';
```

## Controles posteriores

1. Configurar URLs de sitio y redirects en Supabase Auth.
2. Confirmar que la verificación de email esté habilitada.
3. Cargar en la aplicación las claves del proyecto correcto; la `service_role`
   sólo puede existir en el servidor.
4. Crear un usuario, iniciar sesión, crear un borrador y ejecutar un checkout de
   prueba antes de habilitar tráfico real.
5. Al eliminar cuentas o eventos, borrar también sus objetos de `event-media`,
   `event-album` y `payment-receipts`; una cascada SQL no elimina Storage.
