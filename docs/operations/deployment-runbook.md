# Runbook de despliegue

## Responsables y entornos

- `preview`: Vercel por pull request, conectado sólo a recursos de desarrollo o staging.
- `staging`: rama protegida de integración, Supabase staging y Mercado Pago sandbox.
- `production`: rama `main`, Supabase producción y Mercado Pago producción.
- Una misma clave de Supabase o Mercado Pago nunca se comparte entre staging y producción.

El responsable de lanzamiento conduce el despliegue. Otra persona verifica pagos, privacidad y rollback. Configurar en GitHub la protección de `main` para exigir los jobs `Typecheck, tests and build` y `Secret scan`, una aprobación y conversaciones resueltas. Configurar en Vercel producción únicamente desde `main`.

## Precondiciones

1. Confirmar CI verde sobre el commit exacto.
2. Confirmar cero P0 abiertos y aprobación legal vigente.
3. Verificar que las migraciones son expand/contract, compatibles con la versión anterior y probadas desde una base limpia y una copia anonimizada.
4. Confirmar backup/PITR saludable y último restore drill dentro del período acordado.
5. Validar variables con `PAPELETA_ENV=production` y `VALIDATE_ENV_ON_START=true`; nunca imprimir sus valores.
6. Confirmar `APP_URL` HTTPS, Mercado Pago fuera de sandbox, webhook apuntando al dominio productivo y proyectos Supabase separados.
7. Anunciar ventana, responsable, observador y criterio de rollback.

## Secuencia

1. Desplegar primero en staging.
2. Aplicar migraciones aditivas antes que la aplicación; no eliminar ni renombrar columnas consumidas por la versión activa.
3. Ejecutar el recorrido: plantilla → borrador → checkout sandbox → webhook → publicación → invitación pública.
4. Verificar `/api/health`, headers de seguridad y logs sin PII.
5. Promover el mismo commit a producción mediante `main`.
6. Ejecutar smoke productivo sin generar cobros ficticios. Para un pago real controlado, usar una compra autorizada y documentar su reembolso.
7. Observar durante 30 minutos: 5xx, latencia, checkout, webhook, publicación, Storage y rate limiting.

## Smoke mínimo

- `/api/health` responde 200 y `Cache-Control: no-store`.
- Landing, plantillas, login y una invitación publicada cargan correctamente.
- CSP está en `Report-Only`; revisar violaciones antes de pasarla a enforcement.
- La escritura de un borrador y su restauración funcionan.
- Un pago ya aprobado nunca vuelve a estado pendiente o rechazado.
- No aparecen emails, teléfonos, tokens, cookies ni códigos en logs o eventos analíticos.

## Gate y cierre

Abortar o revertir ante publicación sin pago, autorización cruzada, pérdida/corrupción de datos, fallo sostenido de checkout/webhook, 5xx superior al 2% por 5 minutos o ausencia de telemetría. Registrar commit, despliegue Vercel, migraciones, resultado del smoke e incidentes. El canary comienza sólo con todos los gates aprobados.
