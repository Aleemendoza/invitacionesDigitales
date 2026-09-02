import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps the Google Maps host empty and status overlays owned by React", async () => {
  const source = await readFile(new URL("../components/google-place-picker.tsx", import.meta.url), "utf8");
  const shellStart = source.indexOf('<div className="placeMap"');
  const shellEnd = source.indexOf("</div>", shellStart);

  assert.notEqual(shellStart, -1, "the React-owned placeMap wrapper must remain present");
  assert.notEqual(shellEnd, -1, "the React-owned placeMap wrapper must remain closed");
  const shell = source.slice(shellStart, shellEnd);
  assert.match(
    shell,
    /<div\b[^>]*\bref=\{mapRef\}[^>]*\/>/,
    "mapRef must point to a self-closing, childless host that only Google Maps mutates",
  );
  assert.match(shell, /Preparando el mapa/, "loading feedback must be a sibling overlay");
  assert.match(shell, /No pudimos cargar el mapa/, "error feedback must be a sibling overlay");
  assert.doesNotMatch(
    source,
    /<div\b(?=[^>]*\bref=\{mapRef\})[^>]*[^/\s]>[\s\S]*?status\s*===/,
    "React must never render status children inside the imperative Google Maps host",
  );
});

test("recovers from Maps load failures and keeps manual location edits coherent", async () => {
  const source = await readFile(new URL("../components/google-place-picker.tsx", import.meta.url), "utf8");

  assert.match(source, /mapsApiPromise\s*=\s*undefined/, "a rejected loader must allow a later retry");
  assert.doesNotMatch(source, /mapUrl:\s*mapUrl\s*\|\|/, "manual edits must not retain a stale Maps URL");
  assert.match(
    source,
    /valuesRef\.current\.venue\.trim\(\)\s*\|\|\s*selectedAddress/,
    "reverse geocoding must preserve an existing venue name",
  );
});

test("uses the current Places and Advanced Marker APIs without legacy widgets", async () => {
  const source = await readFile(new URL("../components/google-place-picker.tsx", import.meta.url), "utf8");

  assert.match(source, /PlaceAutocompleteElement/, "new Google Cloud projects require the current autocomplete widget");
  assert.match(source, /AdvancedMarkerElement/, "the map must use the supported advanced marker");
  assert.match(source, /gmp-select/, "the current autocomplete selection event must be handled");
  assert.doesNotMatch(source, /new google\.maps\.places\.Autocomplete\b/, "legacy Places Autocomplete must not return");
  assert.doesNotMatch(source, /new google\.maps\.Marker\b/, "deprecated markers must not return");
  assert.match(
    source,
    /<div\b[^>]*\bref=\{autocompleteHostRef\}[^>]*\/>/,
    "React must leave the autocomplete host empty for the Google web component",
  );
});
