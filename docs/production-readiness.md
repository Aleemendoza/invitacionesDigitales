# Preparación para producción

Fecha de evaluación: 1 de septiembre de 2026.

Esta matriz evita interpretar “existe código” como “está operando en
producción”. Un gate sólo se cierra con evidencia en el entorno correspondiente.

## Resumen ejecutivo

Papeleta tiene implementado el recorrido funcional principal y controles
relevantes de seguridad/pagos. El repositorio está preparado para evolucionar el
CI, pero **todavía no debe considerarse listo para producción pública** hasta
cerrar los gates de base efímera, E2E, infraestructura, observabilidad, backups,
legal y reconciliación de pagos.

## Evidencia local más reciente

Validación ejecutada el 1 de septiembre de 2026 sobre el árbol de trabajo:

- `pnpm typecheck`: aprobado;
- `pnpm lint`: 0 errores, 20 warnings heredados;
- `pnpm test`: 58/58 pruebas aprobadas;
- `pnpm build`: compilación productiva aprobada, 46 páginas generadas.

Esta evidencia no sustituye las pruebas de DB, integración, E2E ni entorno real
marcadas como gates.

## Matriz

| Área | Estado | Evidencia o siguiente acción |
| --- | --- | --- |
| Catálogo y planes | Implementado | `lib/event-drafts.ts` y unitarias. |
| Funnel y editor | Implementado | Wizard, borrador, editor y paneles. |
| Auth Supabase | Implementado | Email/password, Google y sync de profiles. |
| Roles owner/admin | Implementado | Contextos server-side y UI alineada. |
| Base nueva | Implementado sin ejecución CI | Migraciones `001–018`; falta reset efímero automatizado. |
| RLS/grants | Implementado, pendiente evidencia | `017/018`; faltan tests SQL en CI. |
| Checkout inicial | Implementado | Reserva idempotente y precio server-side. |
| Upgrade | Implementado | Diferencia de plan y pago separado. |
| Webhook | Implementado | Firma, frescura y validaciones canónicas. |
| Reconciliación de pagos | Pendiente — Gate | Crear job para pendientes con webhook perdido. |
| RSVP seguro | Implementado | Sesión, versión, idempotencia, lockout y rate limit. |
| Upload seguro | Implementado | Magic bytes, dimensiones, metadata y cuotas. |
| Storage purge | Pendiente — Gate privacidad | Limpiar buckets al eliminar evento/cuenta. |
| Analítica tipada | Implementado en cliente | Falta IDs, dashboard y verificación por consentimiento. |
| Observabilidad | Configuración externa — Gate | Conectar proveedor, métricas y alertas de prueba. |
| Healthcheck | Implementado | `/api/health`, superficial y sin secretos. |
| Headers seguridad | Parcial | CSP Report-Only; analizar y pasar a enforcement. |
| SEO/noindex | Implementado | robots, sitemap y privadas excluidas. |
| Legal | Parcial — Gate | Páginas existen; falta identidad legal/revisión profesional. |
| Backups/PITR | Configuración externa — Gate | Activar plan, documentar retención y restore drill. |
| Backup Storage | Pendiente — Gate | Estrategia independiente y restore probado. |
| CI básico | Implementado | Lint, tests, build y Gitleaks. |
| Typecheck explícito en CI | Pendiente | Agregar `pnpm typecheck`. |
| DB/API integration CI | Pendiente — Gate | Supabase local/efímero y matriz de auth. |
| E2E | Pendiente — Gate | Funnel, checkout sandbox, webhook y publicación. |
| Preview/staging/production | Configuración externa — Gate | Proyectos y variables estrictamente separados. |
| Branch protection | Configuración externa — Gate | Checks y aprobación requeridos en GitHub. |
| Email sin allowlist de proveedor | Implementado | Validación genérica de formato en `lib/allowed-email.ts`. |

## Pruebas mínimas pendientes

### Base y autorización

- instalación limpia `001–018`;
- upgrade desde snapshot anonimizado;
- ninguna tabla pública sin RLS;
- grants esperados y RPC sólo `service_role`;
- matriz anon, owner, owner ajeno y admin por API;
- concurrencia en RSVP, pagos y cuotas de medios.

### Pagos

- doble clic y retry;
- firma inválida, replay y timestamp vencido;
- moneda, importe, collector, preferencia o metadata incorrectos;
- webhook duplicado y desordenado;
- upgrade aprobado;
- reconciliación de webhook perdido.

### E2E

Campaña → plantilla → wizard → registro → borrador → checkout sandbox → webhook
→ publicación → invitación pública. Agregar sesión expirada, upload inválido,
RSVP Premium, invitados Premium Plus+ y panel administrativo.

### Frontend

Axe, teclado, foco, lector básico, reduced motion, zoom 200% y anchos 320, 360,
390, 768, 1024 y desktop.

## Datos/decisiones requeridos del negocio

- razón social o identificación legal del operador;
- domicilio/jurisdicción y contacto de privacidad;
- política de cancelación/reembolso validada;
- retenciones por tipo de dato y auditoría;
- IDs productivos GA4/Ads/Meta;
- cuenta y credenciales Mercado Pago productivas;
- dominio final y remitentes de soporte;
- precio base y SLA de concierge;
- condiciones comerciales Partner;
- responsables de release, incidentes, legal y datos.

## Secuencia recomendada

1. Implementar purge completo de Storage.
2. Agregar reconciliación de pagos.
3. Versionar configuración Supabase local y pruebas SQL.
4. Expandir CI con typecheck, DB/integración y E2E.
5. Crear staging real y completar checkout sandbox.
6. Conectar observabilidad, alertas y dashboard de funnel.
7. Activar backups y ejecutar restore/rollback drills.
8. Cerrar revisión legal y configuración productiva.
9. Ejecutar canary controlado 24–48 horas.
10. Escalar sólo con métricas y gates estables.

## Criterio go/no-go

El go exige todos los gates cerrados y cero P0. Cualquier publicación sin pago,
acceso cruzado, pérdida de datos, webhook no confiable, falta de rollback o falta
de telemetría determina no-go independientemente de la fecha comercial.
