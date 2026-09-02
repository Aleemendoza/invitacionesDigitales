import assert from "node:assert/strict";
import test from "node:test";
import { defaultAgenda, defaultFeatures } from "../lib/event-drafts.ts";
import { firstInvalidCreateEventStep, validateCreateEventStep } from "../lib/create-event-validation.ts";

const completeDraft = {
  title: "Santino & Griselda",
  eventType: "Boda",
  date: "2027-09-21",
  time: "20:30",
  venue: "Casa de campo",
  venueAddress: "Av. Libertador 1234, Buenos Aires",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Casa",
  templateSlug: "eclat",
  plan: "standard",
  step: 8,
  agenda: defaultAgenda(),
  features: defaultFeatures("standard"),
};

test("returns field-level errors for every required creation step", () => {
  assert.deepEqual(validateCreateEventStep({ ...completeDraft }, 0, false), { plan: "Elegí un plan para continuar." });
  assert.ok(validateCreateEventStep({ ...completeDraft, title: "" }, 2, true).title);
  assert.deepEqual(Object.keys(validateCreateEventStep({ ...completeDraft, date: "", time: "" }, 3, true)), ["date", "time"]);
  assert.deepEqual(Object.keys(validateCreateEventStep({ ...completeDraft, venue: "", venueAddress: "", mapUrl: "" }, 4, true)), ["venue", "venueAddress", "mapUrl"]);
});

test("reports the exact invalid agenda row and field", () => {
  const errors = validateCreateEventStep({ ...completeDraft, agenda: [{ time: "", title: "" }] }, 5, true);
  assert.ok(errors["agenda.0.time"]);
  assert.ok(errors["agenda.0.title"]);
});

test("accepts a complete draft and finds the first invalid step", () => {
  assert.equal(firstInvalidCreateEventStep(completeDraft, true), null);
  assert.equal(firstInvalidCreateEventStep({ ...completeDraft, venueAddress: "" }, true), 4);
});
