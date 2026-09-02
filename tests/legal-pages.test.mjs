import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("publishes the current Argentine consumer channels without login", async () => {
  const [shell, withdrawal, cancellation] = await Promise.all([
    read("components/site-shell.tsx"), read("app/arrepentimiento/page.tsx"), read("app/baja/page.tsx"),
  ]);
  assert.match(shell, /BOTÓN DE ARREPENTIMIENTO/);
  assert.match(shell, /BAJA DEL SERVICIO/);
  assert.match(withdrawal, /Dentro de 24 horas/);
  assert.match(cancellation, /Dentro de 24 horas/);
});

test("refund policy reflects current law without a blanket no-refund clause", async () => {
  const refunds = await read("app/reembolsos/page.tsx");
  assert.match(refunds, /Disposición 954\/2025/);
  assert.match(refunds, /Disposición 3\/2026/);
  assert.match(refunds, /diez \(10\) días corridos/);
  assert.doesNotMatch(refunds, /no se (realizan|hacen|admiten) reembolsos/i);
});

test("keeps legal identity configurable and commercial policies linked", async () => {
  const [environment, terms, signup] = await Promise.all([
    read(".env.example"), read("app/terminos/page.tsx"), read("components/login-form.tsx"),
  ]);
  for (const variable of ["LEGAL_OPERATOR_NAME", "LEGAL_CUIT", "LEGAL_ADDRESS", "LEGAL_CONTACT_EMAIL"]) assert.match(environment, new RegExp(variable));
  assert.match(terms, /Política de uso/);
  assert.match(terms, /Política de cancelación y reembolsos/);
  assert.match(signup, /Términos y condiciones/);
});
