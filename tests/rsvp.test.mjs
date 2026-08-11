import test from "node:test";
import assert from "node:assert/strict";
import { eventStats, rsvpStatus, selectedNamedGuests, validateAttendance } from "../lib/rsvp.ts";

test("rejects confirmation beyond group capacity", () => {
  assert.equal(validateAttendance({ seats: 4, attendees: 5 }), "Podés confirmar entre 0 y 4 lugares.");
});

test("allows a partial RSVP and derives the correct status", () => {
  assert.equal(validateAttendance({ seats: 4, attendees: 3 }), null);
  assert.equal(rsvpStatus(3, 4), "partial");
});

test("records an explicit no as declined", () => {
  assert.equal(rsvpStatus(0, 4), "declined");
});

test("closes RSVP exactly at the deadline", () => {
  const now = new Date("2026-12-02T00:00:00.000Z");
  assert.equal(validateAttendance({ seats: 4, attendees: 2, deadline: "2026-12-02T00:00:00.000Z", now }), "Las confirmaciones ya cerraron.");
});

test("rejects duplicate, unknown, or over-capacity named guest selection", () => {
  assert.equal(selectedNamedGuests(["juan", "maria"], ["juan", "juan"], 0, 4), "La selección de invitados no es válida.");
  assert.equal(selectedNamedGuests(["juan", "maria"], ["juan", "extra"], 0, 4), "La selección de invitados no es válida.");
  assert.equal(selectedNamedGuests(["juan", "maria"], ["juan", "maria"], 3, 4), "Podés confirmar entre 0 y 4 lugares.");
});

test("keeps people and group metrics distinct", () => {
  assert.deepEqual(eventStats([
    { seats: 4, attendees: 3, status: "partial" },
    { seats: 2, status: "pending" },
    { seats: 1, status: "declined" },
  ]), {
    invited: 7, confirmed: 3, declined: 2, pending: 2, partial: 1,
    groups: { total: 3, confirmed: 0, declined: 1, pending: 1, partial: 1 },
  });
});
