# Glosario compartido

| Término | Definición |
| --- | --- |
| Evento | Entidad propiedad de un organizador que reúne contenido, plan, pago y publicación. |
| Invitación | Representación pública de un evento en `/e/{slug}`. |
| Slug | Identificador legible y único usado en la URL pública. |
| Borrador | Evento editable que todavía no está publicado. |
| Plan efectivo | Plan actualmente aplicado al evento; sólo cambia con pago/upgrade aprobado. |
| Intento de pago | Registro inmutable de una operación inicial o upgrade. |
| Preferencia | Sesión de checkout creada en Mercado Pago para un intento local. |
| RSVP | Confirmación de asistencia. No existe en Estándar. |
| Grupo de invitados | Unidad de cupos y respuesta para personas relacionadas. |
| Sesión de invitado | Autorización efímera, separada de Auth, vinculada a evento y grupo. |
| Link canónico | URL única `/e/{slug}` compartida para el evento. |
| Link individual | Capacidad secundaria `/e/{slug}/i/{token}` para automatización o check-in. |
| Owner | Usuario cuyo ID coincide con `events.owner_id`. |
| Service role | Credencial exclusiva del servidor que omite RLS; exige autorización explícita en API. |
| Concierge | Servicio “La armamos por vos”, separado del autoservicio. |
| Partner | Canal B2B para profesionales/empresas de eventos. |
| Canary | Lanzamiento pequeño y controlado previo al tráfico público. |
| Gate | Condición obligatoria para avanzar de entorno o lanzar. |
| P0 | Bloqueador crítico: seguridad, pago, privacidad, integridad o disponibilidad esencial. |
| RPO | Máxima pérdida temporal de datos aceptada; objetivo inicial 24 h. |
| RTO | Tiempo máximo objetivo de recuperación; objetivo inicial 4 h. |
| Expand/contract | Estrategia de migración compatible que agrega antes de retirar. |
| PII | Información que identifica o contacta a una persona. |
