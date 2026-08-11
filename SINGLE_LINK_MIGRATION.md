# Single event link migration

## Current state

The original product represented a guest through `/e/{slug}/i/{token}`. The event, RSVP data and guest groups already exist in the core schema.

## Decision

`/e/{slug}` is now the canonical, shareable URL. It renders only public sections until a guest identifies their group. Legacy token URLs remain a secondary capability: validate the token server-side, create a `guest_session`, then redirect to the canonical URL.

## Data changes

Migration `002_single_event_link.sql` adds the event access mode, normalized group lookup values, hashed access-code fields and revocable guest sessions. Access codes must be generated with CSPRNG, stored only with a slow hash, and verified behind rate limits.

## Rollout

1. Apply the migration and backfill normalized display names.
2. Release the public event renderer behind `single_event_link`.
3. Add server-side lookup/access/RSVP endpoints with per-event and per-session throttles.
4. Redirect valid legacy links to `/e/{slug}` after creating a guest session.
5. Enable new events first, then migrate published events after verification.

## Security invariants

- Lookup returns at most five names plus an optional host-defined hint; never PII.
- A lookup reference is short-lived and opaque; it is not a guest session.
- RSVP mutations authorize the guest group from the server-side session, never from a browser ID.
- Seat limits and optimistic concurrency are database-enforced.
- Private sections and venues are evaluated on the server with guest context.
