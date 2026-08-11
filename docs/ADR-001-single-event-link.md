# ADR-001: Un solo link público por evento

La dirección canónica de una invitación es `/e/{eventSlug}`. El evento, no el invitado, posee la URL compartible y el QR universal.

La identidad del invitado se resuelve dentro de la experiencia RSVP mediante `guest_group`, con sesiones efímeras independientes de la sesión del anfitrión. Los modos `open`, `name_lookup` y `name_and_code` gobiernan el acceso. Los links con token individual continúan disponibles para envíos automatizados, staff y check-in, pero no se usan como propuesta principal.

La búsqueda sólo devuelve nombre público y pista opcional; código, contactos, RSVP previo y contenido privado se mantienen del lado del servidor. La autorización del RSVP se valida contra la sesión de grupo y la base de datos es la fuente de verdad para cupos y estados.
