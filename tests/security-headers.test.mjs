import assert from "node:assert/strict";
import test from "node:test";
import nextConfig from "../next.config.ts";

test("applies report-only CSP and baseline security headers to every route", async () => {
  const rules = await nextConfig.headers();
  assert.equal(rules.length, 1);
  assert.equal(rules[0].source, "/:path*");
  const headers = Object.fromEntries(rules[0].headers.map(({ key, value }) => [key, value]));
  assert.match(headers["Content-Security-Policy-Report-Only"], /frame-ancestors 'none'/);
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.match(headers["Strict-Transport-Security"], /max-age=31536000/);
  assert.equal(headers["Content-Security-Policy"], undefined);
});
