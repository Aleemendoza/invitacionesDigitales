import test from "node:test";
import assert from "node:assert/strict";
import { getCountdown } from "../lib/countdown.ts";

const now = Date.parse("2026-08-11T12:00:00.000Z");
test("calculates a future event countdown", () => {
  assert.deepEqual(getCountdown("2026-08-12T13:02:03.000Z", false, now), { kind: "pending", days: 1, hours: 1, minutes: 2, seconds: 3 });
});
test("is celebratory when the event has begun or ended", () => {
  assert.deepEqual(getCountdown("2026-08-11T12:00:00.000Z", false, now), { kind: "live" });
  assert.deepEqual(getCountdown("2026-08-10T12:00:00.000Z", false, now), { kind: "live" });
});
test("only the private preview prompts for a missing date", () => {
  assert.deepEqual(getCountdown(null, true, now), { kind: "missing" });
  assert.deepEqual(getCountdown(null, false, now), { kind: "live" });
});
