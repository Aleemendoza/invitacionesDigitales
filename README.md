# Papeleta

Plataforma de invitaciones digitales con una URL pública canónica por evento: `https://dominio/e/{slug}`. Las personas ven la invitación sin registrarse e identifican su grupo sólo al confirmar RSVP.

## Desarrollo

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Ejecutá `supabase db push` tras configurar el proyecto Supabase para aplicar las migraciones. `pnpm typecheck`, `pnpm test` y `pnpm build` validan la app.

## Arquitectura de acceso

- `open`: RSVP directo, para eventos abiertos.
- `name_lookup`: búsqueda segura de grupo y sesión temporal.
- `name_and_code`: búsqueda + código por grupo, recomendado para bodas y XV.

Los links personalizados `/e/{slug}/i/{token}` se mantienen como capacidad secundaria para automatizaciones y check-in. Nunca reemplazan la URL pública del evento.

Las variables de entorno requeridas están en `.env.example`. Ninguna clave de servicio debe exponerse al navegador.
