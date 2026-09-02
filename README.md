# Papeleta

Papeleta es una plataforma argentina de invitaciones digitales autogestionables.
Una persona elige una plantilla, configura su evento, crea una cuenta, paga con
Mercado Pago y publica una URL canónica `https://dominio/e/{slug}`.

## Estado del proyecto

El producto cuenta con funnel de creación, editor, invitaciones públicas,
pagos B2C, planes, RSVP según plan, panel del organizador, administración,
controles de seguridad, migraciones Supabase y CI inicial. Antes de producción
deben cerrarse los gates externos y de pipeline indicados en
[Preparación para producción](docs/production-readiness.md).

## Inicio rápido

Requisitos: Node.js 24 y pnpm 11.19.0.

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev
```

Validación local:

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Para crear la base de datos, seguir [supabase/README.md](supabase/README.md) y
aplicar las migraciones `001` a `018` en orden.

## Documentación

La fuente de verdad del proyecto comienza en [docs/README.md](docs/README.md).
Allí se documentan negocio, producto, arquitectura, datos, seguridad, APIs,
variables, pipeline, despliegue y preparación para producción.

Las claves `SUPABASE_SERVICE_ROLE_KEY`, `GUEST_ACCESS_TOKEN_SECRET`,
`RATE_LIMIT_SECRET` y credenciales de Mercado Pago son exclusivamente de
servidor. Nunca deben llegar al navegador, al repositorio ni a los logs.
