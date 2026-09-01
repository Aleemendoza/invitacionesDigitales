import assert from "node:assert/strict";
import test from "node:test";
import {
  EnvironmentValidationError,
  shouldValidateEnvironmentAtStartup,
  validateRuntimeEnvironment,
} from "../lib/env.ts";

const validEnvironment = {
  APP_URL: "https://papeleta.example",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  GUEST_ACCESS_TOKEN_SECRET: "g".repeat(32),
  RATE_LIMIT_SECRET: "r".repeat(32),
  MERCADOPAGO_ACCESS_TOKEN: "access-token",
  MERCADOPAGO_WEBHOOK_SECRET: "w".repeat(32),
  MERCADOPAGO_USER_ID: "123456789",
  MERCADOPAGO_USE_SANDBOX: "false",
};

test("validates and normalizes the production runtime environment", () => {
  const result = validateRuntimeEnvironment({ ...validEnvironment, VERCEL_ENV: "production" });
  assert.equal(result.appUrl, "https://papeleta.example");
  assert.equal(result.mercadoPagoSandbox, false);
});

test("rejects sandbox payments and insecure app URLs in production", () => {
  assert.throws(
    () => validateRuntimeEnvironment({
      ...validEnvironment,
      APP_URL: "http://papeleta.example",
      MERCADOPAGO_USE_SANDBOX: "true",
      VERCEL_ENV: "production",
    }),
    (error) => error instanceof EnvironmentValidationError
      && error.issues.some((issue) => issue.includes("HTTPS"))
      && error.issues.some((issue) => issue.includes("debe ser false")),
  );
});

test("only forces startup validation in explicit or production environments", () => {
  assert.equal(shouldValidateEnvironmentAtStartup({ NODE_ENV: "test" }), false);
  assert.equal(shouldValidateEnvironmentAtStartup({ VALIDATE_ENV_ON_START: "true" }), true);
  assert.equal(shouldValidateEnvironmentAtStartup({ VERCEL_ENV: "production" }), true);
});
