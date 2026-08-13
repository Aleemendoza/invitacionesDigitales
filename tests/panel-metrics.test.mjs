import assert from "node:assert/strict";
import test from "node:test";
import { canChangeRole, eventProgress, rsvpTotals } from "../lib/panel-metrics.ts";

test("derives organizer setup progress from the required milestones", () => {
  assert.equal(eventProgress({ title: "Fiesta", starts_at: "2026-12-10", content: { venue: "Salón", agenda: [{}] }, payment_status: "approved" }), 100);
  assert.equal(eventProgress({ title: "Fiesta", starts_at: null, content: {}, payment_status: "unpaid" }), 20);
});
test("keeps RSVP people totals independent from groups", () => {
  assert.deepEqual(rsvpTotals([{ seats: 3, confirmed_seats: 2, status: "partial" }, { seats: 2, confirmed_seats: 0, status: "declined" }]), { invited: 5, confirmed: 2, pending: 1, declined: 2 });
});
test("protects role changes that could remove administrative access", () => {
  assert.match(canChangeRole("a", "a", "organizer", "admin", 2), /propio/);
  assert.match(canChangeRole("a", "b", "organizer", "admin", 1), /al menos un administrador/);
  assert.equal(canChangeRole("a", "b", "admin", "organizer", 1), null);
});
