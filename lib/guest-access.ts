/** Public RSVP access rules. These helpers intentionally contain no database or UI code. */
export type GuestAccessMode = "open" | "name_lookup" | "name_and_code";
export type GuestStatus = "pending" | "confirmed" | "declined" | "partial";

export const LOOKUP_MIN_LENGTH = 3;
export const LOOKUP_MAX_LENGTH = 80;
export const LOOKUP_MAX_RESULTS = 5;

/**
 * Produces the same safe comparison key on imports and server-side lookups.
 * Punctuation is treated as a word separator so "Pérez-Gómez" can be found as
 * "perez gomez", while no fuzzy matching is introduced.
 */
export function normalizeLookup(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-AR")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Returns a normalized query only when it is safe to send to the lookup API. */
export function validateLookup(query: string): string | null {
  const normalized = normalizeLookup(query);
  return normalized.length >= LOOKUP_MIN_LENGTH && normalized.length <= LOOKUP_MAX_LENGTH
    ? normalized
    : null;
}

/**
 * Conservative lookup predicate: full-name prefixes and word prefixes only.
 * A short substring such as "rez" must not enumerate every Pérez in an event.
 */
export function lookupMatches(query: string, candidate: string): boolean {
  const normalizedQuery = validateLookup(query);
  if (!normalizedQuery) return false;

  const normalizedCandidate = normalizeLookup(candidate);
  return normalizedCandidate.startsWith(normalizedQuery)
    || normalizedCandidate.split(" ").some((word) => word.startsWith(normalizedQuery));
}

export type PrivateLookupGroup = {
  id: string;
  displayName: string;
  lookupHint?: string | null;
  seats?: number;
  members?: string[];
  phone?: string;
  email?: string;
  notes?: string;
  accessCodeHash?: string;
  status?: GuestStatus;
};

/** The only shape permitted before a guest proves ownership of the group. */
export type PublicLookupResult = {
  displayName: string;
  lookupHint?: string;
  lookupToken: string;
};

/**
 * Deliberately omits IDs, seats, members, contact data, prior RSVP and codes.
 * `lookupToken` must be a short-lived, signed server-generated reference.
 */
export function toPublicLookupResult(
  group: PrivateLookupGroup,
  lookupToken: string,
): PublicLookupResult {
  const result: PublicLookupResult = { displayName: group.displayName, lookupToken };
  if (group.lookupHint?.trim()) result.lookupHint = group.lookupHint.trim();
  return result;
}

export function requiresGuestIdentification(mode: GuestAccessMode): boolean {
  return mode !== "open";
}

export function requiresAccessCode(mode: GuestAccessMode): boolean {
  return mode === "name_and_code";
}

/** Session authorization must always bind both the event and guest group. */
export function sessionAuthorizesGroup(
  session: { eventId: string; guestGroupId: string; expiresAt: Date; revokedAt?: Date | null } | null,
  eventId: string,
  guestGroupId: string,
  now = new Date(),
): boolean {
  return Boolean(
    session
      && session.eventId === eventId
      && session.guestGroupId === guestGroupId
      && session.expiresAt > now
      && !session.revokedAt,
  );
}
