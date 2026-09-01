import assert from "node:assert/strict";
import test from "node:test";
import { correlationId, createLogEntry, redact } from "../lib/logger.ts";

test("redacts sensitive fields and PII embedded in strings", () => {
  assert.deepEqual(
    redact({
      accessToken: "secret-value",
      nested: { email: "persona@example.com", note: "Escribió persona@example.com" },
      authorization: "Bearer abc.def.ghi",
      safe: "published",
    }),
    {
      accessToken: "[REDACTED]",
      nested: { email: "[REDACTED]", note: "Escribió [REDACTED_EMAIL]" },
      authorization: "[REDACTED]",
      safe: "published",
    },
  );
});

test("creates structured entries without moving user fields over the log envelope", () => {
  const entry = createLogEntry("warn", "checkout_retry", { eventId: "event-1", level: "forged" });
  assert.equal(entry.level, "warn");
  assert.equal(entry.event, "checkout_retry");
  assert.equal(entry.eventId, "event-1");
  assert.match(entry.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});

test("accepts safe correlation ids and replaces untrusted values", () => {
  assert.equal(correlationId(new Headers({ "x-correlation-id": "request_1234" })), "request_1234");
  assert.match(correlationId(new Headers({ "x-correlation-id": "bad value" })), /^[0-9a-f-]{36}$/);
});
