import test from "node:test";
import assert from "node:assert/strict";
import { lookupMatches, normalizeLookup, requiresAccessCode, sessionAuthorizesGroup, toPublicLookupResult, validateLookup } from "../lib/guest-access.ts";

test("normalizes accents, punctuation and repeated whitespace", () => {
  assert.equal(normalizeLookup("  Lucía  Pérez-Gómez "), "lucia perez gomez");
});

test("requires three normalized characters before a public lookup", () => {
  assert.equal(validateLookup("Pé"), null);
  assert.equal(validateLookup(" Pérez "), "perez");
});

test("matches full-name and word prefixes without arbitrary substring enumeration", () => {
  assert.equal(lookupMatches("Pérez", "Familia Pérez"), true);
  assert.equal(lookupMatches("Lucía", "Lucía Gómez"), true);
  assert.equal(lookupMatches("rez", "Familia Pérez"), false);
});

test("public lookup responses omit private group fields", () => {
  const result = toPublicLookupResult({ id: "private-id", displayName: "Familia Pérez", lookupHint: "Familia", seats: 4, phone: "+54 388 1", email: "perez@example.com", status: "confirmed", accessCodeHash: "secret" }, "signed-short-lived-token");
  assert.deepEqual(result, { displayName: "Familia Pérez", lookupHint: "Familia", lookupToken: "signed-short-lived-token" });
  assert.equal("seats" in result, false);
  assert.equal("accessCodeHash" in result, false);
});

test("guest session is scoped to its event and group and rejects expiration or revocation", () => {
  const now = new Date("2026-08-11T12:00:00.000Z");
  const active = { eventId: "event-a", guestGroupId: "group-a", expiresAt: new Date("2026-08-12T12:00:00.000Z") };
  assert.equal(sessionAuthorizesGroup(active, "event-a", "group-a", now), true);
  assert.equal(sessionAuthorizesGroup(active, "event-a", "group-b", now), false);
  assert.equal(sessionAuthorizesGroup({ ...active, revokedAt: now }, "event-a", "group-a", now), false);
  assert.equal(sessionAuthorizesGroup({ ...active, expiresAt: now }, "event-a", "group-a", now), false);
});

test("requires an access code only for the configured name-and-code mode", () => {
  assert.equal(requiresAccessCode("name_lookup"), false);
  assert.equal(requiresAccessCode("name_and_code"), true);
  assert.equal(requiresAccessCode("open"), false);
});
