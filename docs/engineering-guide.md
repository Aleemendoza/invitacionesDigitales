# Guía de ingeniería

## Requisitos y setup

- Node.js `>=24 <25`.
- pnpm `11.19.0`.
- Proyecto Supabase para desarrollo/staging.
- Credenciales sandbox de Mercado Pago para probar checkout.

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev
```

La aplicación queda en `http://localhost:3000`. No usar credenciales de
producción durante desarrollo local.

## Variables de entorno

| Variable | Superficie | Obligatoria en runtime completo | Uso |
| --- | --- | --- | --- |
| `APP_URL` | Servidor | Sí | Origen canónico, callbacks, webhook y metadata. |
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | Sí | URL del proyecto Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública | Sí | Cliente Auth/browser, sujeto a RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Secreta | Sí | APIs de servidor; nunca browser. |
| `GUEST_ACCESS_TOKEN_SECRET` | Secreta | Sí | Firma de referencias/sesiones de invitados; mínimo 32. |
| `RATE_LIMIT_SECRET` | Secreta | Sí | HMAC de scopes antiabuso; mínimo 32. |
| `MERCADOPAGO_ACCESS_TOKEN` | Secreta | Sí | API de Mercado Pago. |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secreta | Sí | Firma webhook; mínimo 32. |
| `MERCADOPAGO_USER_ID` | Secreta servidor | Sí | Collector esperado. |
| `MERCADOPAGO_USE_SANDBOX` | Servidor | Sí | `true` fuera de prod, `false` en prod. |
| `NEXT_PUBLIC_GA4_ID` | Pública | No | Google Analytics 4. |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Pública | No | Google Ads. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Pública | No | Meta Pixel. |
| `NEXT_PUBLIC_CONCIERGE_FROM_PRICE` | Pública | No | Precio inicial de concierge. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Pública restringida | Para mapas | Places/Maps, restringida por dominio/API. |
| `VALIDATE_ENV_ON_START` | Servidor | Recomendado | Fuerza validación temprana. |
| `PAPELETA_ENV` | Servidor | Recomendado | Usar `production` fuera de Vercel si corresponde. |

En producción la validación exige HTTPS y rechaza Mercado Pago sandbox. Copiar
valores a logs, tickets, capturas o documentación está prohibido.

## Scripts

| Comando | Función |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo con Turbopack. |
| `pnpm typecheck` | TypeScript sin emisión. |
| `pnpm lint` | ESLint. |
| `pnpm test` | Unitarias Node sobre `tests/*.test.mjs`. |
| `pnpm build` | Build productivo Next.js. |
| `pnpm check` | Lint, tests y build. |
| `pnpm account:create-admin` | Bootstrap seguro de un administrador. |

El lint actual puede informar warnings heredados; CI debe fallar ante errores.
Los warnings nuevos deben justificarse o resolverse en el PR.

## Base de datos

Seguir [supabase/README.md](../supabase/README.md). La secuencia vigente es
`001` → `018`. No renombrar ni reescribir migraciones aplicadas; agregar una
nueva versión forward-only.

Reglas:

- migraciones idempotentes donde sea razonable;
- expandir antes de cambiar consumidores;
- no borrar columnas/tablas en el mismo release que deja de usarlas;
- probar instalación limpia y upgrade anonimizado;
- validar RLS, grants, constraints e idempotencia concurrente;
- no usar `db reset --linked` contra staging o producción.

## Estructura del repositorio

| Directorio | Responsabilidad |
| --- | --- |
| `app/` | Páginas, layouts, metadata y APIs Next.js. |
| `components/` | UI y estilos por dominio. |
| `lib/` | Contratos y lógica compartida. |
| `supabase/migrations/` | Historia SQL canónica. |
| `tests/` | Pruebas unitarias/estáticas. |
| `docs/` | Fuente de verdad y runbooks. |
| `.github/workflows/` | Pipeline CI versionado. |

## Convenciones de implementación

- TypeScript fuerte y tipos de dominio explícitos.
- Validar input en servidor aunque la UI ya lo valide.
- Toda ruta de owner filtra por usuario y evento.
- Toda ruta admin verifica `profiles.role` en servidor.
- No consultar tablas privadas directamente desde el browser.
- Precio y prestaciones se resuelven desde el catálogo canónico.
- Operaciones repetibles reciben idempotency key.
- Logs estructurados, sin PII y con correlation ID cuando exista.
- Enlaces externos aceptados por contenido deben usar HTTPS.
- Cambios funcionales incluyen pruebas y documentación afectada.

## Creación de administrador

Con `.env.local` apuntando al proyecto correcto:

```powershell
$env:ACCOUNT_EMAIL="admin@dominio.com"
$env:ACCOUNT_PASSWORD="UNA_CONTRASEÑA_LARGA_Y_UNICA"
$env:ACCOUNT_FULL_NAME="Nombre Apellido"
pnpm account:create-admin
Remove-Item Env:ACCOUNT_EMAIL, Env:ACCOUNT_PASSWORD, Env:ACCOUNT_FULL_NAME
```

El script usa `service_role`, confirma el email, asigna el rol y revierte la
cuenta si falla el perfil. Debe ejecutarse sólo desde un equipo confiable.

## Definition of Done

Un cambio está terminado cuando:

1. cumple la regla de negocio y autorización;
2. no duplica contratos canónicos;
3. incluye migración forward-only cuando corresponde;
4. pasa typecheck, lint, tests y build;
5. agrega pruebas del caso feliz y bordes relevantes;
6. revisa accesibilidad, responsive, privacidad y logging;
7. actualiza docs/runbook si cambia operación o contrato;
8. tiene estrategia de despliegue y rollback proporcional al riesgo.
