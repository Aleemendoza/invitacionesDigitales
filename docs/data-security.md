# Datos, autorización y seguridad

## Modelo de datos por dominio

### Identidad y catálogo

- `profiles`: perfil y rol `organizer | admin` asociado a `auth.users`.
- `templates`, `template_versions`: catálogo publicable futuro.

### Evento y contenido

- `events`: owner, slug, plan, pago, publicación, contenido y configuración.
- `event_sections`, `event_venues`, `event_schedule_items`, `event_media`.

### Invitados y RSVP

- `guest_groups`, `guest_members`, `guest_group_subevents`.
- `guest_sessions`, `guest_invitation_tokens`.
- `rsvp_questions`, `rsvp_answers`, `rsvp_submissions`.
- `guest_member_food_preferences`, `public_rsvp_responses`.

### Interacción

- `event_album_photos`.
- `event_trivia_questions`, `event_trivia_submissions`.
- `event_activity`.

### Billing y administración

- `event_payments`, `event_plan_upgrades`.
- `role_audit_log`, `account_deletion_audit_log`.
- `api_rate_limits`.

## Storage

| Bucket | Uso | Política esperada |
| --- | --- | --- |
| `event-media` | Portadas y galería del organizador | Privado, imágenes validadas, 3,5 MB por objeto. |
| `event-album` | Fotos colaborativas | Privado, JPEG/PNG/WebP, 3,5 MB. |
| `payment-receipts` | Comprobantes manuales heredados/B2B | Privado; JPEG, PNG o PDF. |

La eliminación de filas PostgreSQL no elimina objetos de Storage. Todo flujo de
borrado debe limpiar ambos sistemas y conservar sólo auditoría mínima obligatoria.

## Autenticación y autorización

### Organizador

El navegador obtiene una sesión Supabase. Las APIs verifican el token con
`auth.getUser` y filtran por `events.owner_id`. `ownerContext` centraliza este
patrón para rutas por evento.

### Administrador

`adminContext` verifica el JWT y exige `profiles.role = 'admin'`. Las rutas
administrativas vuelven a validar el rol; el enlace visible en la UI no concede
permisos.

### Invitado

La búsqueda pública aplica normalización conservadora, máximo cinco resultados
y tokens firmados temporales. La sesión se vincula a evento y grupo. El código
posee lockout transaccional y los intentos se limitan en base compartida.

## RLS y grants

La migración `017` establece privacidad por defecto sobre tablas públicas. La
lectura anónima directa se limita al catálogo publicado. El resto se expone por
APIs auditadas. La `018` concede explícitamente a `service_role` las RPC privadas
y corrige operabilidad de instalaciones nuevas.

RPC críticas:

- `submit_guest_rsvp_answers`;
- `approve_payment_and_publish`;
- `consume_rate_limit`;
- `record_guest_code_attempt`;
- `register_event_media`;
- `register_album_photo`.

## Rate limiting

Los scopes se hashean con HMAC usando `RATE_LIMIT_SECRET`, IP confiable, evento y
acción. Reglas actuales:

| Acción | Límite | Ventana |
| --- | ---: | ---: |
| lookup | 10 | 60 s |
| code | 5 | 10 min |
| RSVP | 12 | 60 s |
| RSVP general | 8 | 10 min |
| trivia | 8 | 10 min |
| álbum | 12 | 10 min |
| checkout | 8 | 5 min |

Al exceder se responde `429` con `Retry-After`. Si el limitador no está
disponible, falla cerrado con `503`.

## Uploads

El servidor acepta JPEG, PNG y WebP por magic bytes, valida dimensiones máximas
de 12.000 px y 40 megapíxeles, aplica tamaño por ruta y elimina APP1/EXIF de
JPEG. Las RPC serializan cuotas concurrentes. Si falla el registro en DB, la API
debe eliminar el objeto subido.

## Pagos

El webhook exige firma HMAC, timestamp dentro de cinco minutos y request ID.
Luego consulta la API de Mercado Pago y valida referencia local, moneda ARS,
importe, preferencia, collector y metadata. Sólo la RPC de aprobación publica o
cambia el plan. Una notificación posterior nunca degrada un pago aprobado.

## Headers y navegador

`next.config.ts` configura HSTS, `nosniff`, `DENY`, Referrer-Policy,
Permissions-Policy y CSP en modo Report-Only. El enforcement de CSP es un gate
posterior a analizar reportes reales.

## Privacidad y logging

La analítica requiere consentimiento. Sus tipos no admiten nombres, emails,
teléfonos, códigos ni respuestas. El logger redacta claves sensibles, tokens
Bearer y emails, y admite correlation ID validado.

## Riesgos y acciones abiertas

- Ejecutar pruebas DB de RLS/grants y matriz anon/owner/owner ajeno/admin.
- Implementar purge completo de Storage en eliminación de cuentas/eventos.
- Configurar proveedor de errores, métricas y alertas; el logger solo no basta.
- Probar restore DB y Storage en entorno aislado.
- La validación frontend acepta cualquier dirección con formato válido; Supabase
  mantiene verificación de email y controles antiabuso.
- Revisar legalmente retención, exportación, eliminación e identificación del
  responsable del tratamiento.
