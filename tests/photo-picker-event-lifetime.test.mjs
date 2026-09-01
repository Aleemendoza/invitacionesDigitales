import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("does not dereference the React change event after awaiting photo preparation", async () => {
  const source = await readFile(new URL("../components/create-event-wizard.tsx", import.meta.url), "utf8");
  const picker = source.slice(source.indexOf("function PhotoPicker"));
  const awaitIndex = picker.indexOf("await Promise.all");

  assert.notEqual(awaitIndex, -1);
  assert.match(picker.slice(0, awaitIndex), /const input = event\.currentTarget/);
  assert.doesNotMatch(picker.slice(awaitIndex), /event\.currentTarget/);
  assert.match(picker, /if \(input\.isConnected\) input\.value = ""/);
});
