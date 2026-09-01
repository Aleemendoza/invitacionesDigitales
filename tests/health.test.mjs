import assert from "node:assert/strict";
import test from "node:test";
import { healthPayload } from "../lib/health.ts";

test("health payload is superficial and stable", () => {
  const body = healthPayload({ VERCEL_GIT_COMMIT_SHA: "1234567890abcdef" });
  assert.deepEqual(Object.keys(body).sort(), ["service", "status", "version"]);
  assert.equal(body.status, "ok");
  assert.equal(body.service, "papeleta-web");
  assert.equal(body.version, "1234567890ab");
});
