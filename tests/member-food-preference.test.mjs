import test from "node:test";
import assert from "node:assert/strict";
import { memberFoodPreference } from "../lib/member-food-preference.ts";

test("reads a one-to-one Supabase food preference relationship", () => {
  assert.equal(memberFoodPreference({ food_preference: "Tradicional" }), "Tradicional");
});

test("keeps compatibility with an array-shaped relationship", () => {
  assert.equal(memberFoodPreference([{ food_preference: "Vegana" }]), "Vegana");
  assert.equal(memberFoodPreference([]), null);
});
