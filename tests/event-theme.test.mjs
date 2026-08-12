import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTheme, templateTheme } from "../lib/event-theme.ts";

test("keeps legacy event colors and fills the template background", () => {
  const fallback = templateTheme("aura");
  assert.deepEqual(normalizeTheme({ primaryColor: "#111111", accentColor: "#ff00aa", fontStyle: "princesa" }, fallback), {
    primaryColor: "#111111", accentColor: "#ff00aa", backgroundColor: fallback.backgroundColor, fontStyle: "princesa",
  });
});

test("keeps an organizer-selected background color", () => {
  const theme = normalizeTheme({ primaryColor: "#19324a", accentColor: "#e4a12c", backgroundColor: "#dcecf5", fontStyle: "refinada" });
  assert.equal(theme.backgroundColor, "#dcecf5");
});
