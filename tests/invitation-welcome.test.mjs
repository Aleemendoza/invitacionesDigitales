import test from "node:test";
import assert from "node:assert/strict";
import { welcomeMessageForEventType, welcomeStyleForEventType } from "../lib/invitation-welcome.ts";

test("provides a safe welcome fallback for every event type", () => {
  assert.match(welcomeMessageForEventType("Boda", "Sofía y Mateo"), /Sofía y Mateo/);
  assert.match(welcomeMessageForEventType("XV"), /mis XV/);
  assert.match(welcomeMessageForEventType("Infantil"), /aventura/);
  assert.match(welcomeMessageForEventType("Baby Shower"), /celebrada/);
  assert.match(welcomeMessageForEventType("Corporativo"), /encuentro/);
  assert.match(welcomeMessageForEventType("Otro"), /bienvenida/);
});

test("selects a visual welcome style from the event type", () => {
  assert.equal(welcomeStyleForEventType("Boda"), "romantic");
  assert.equal(welcomeStyleForEventType("XV"), "celebration");
  assert.equal(welcomeStyleForEventType("Infantil"), "playful");
  assert.equal(welcomeStyleForEventType("Cumpleaños"), "celebration");
});
