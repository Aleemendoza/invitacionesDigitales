import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { templates } from "../lib/templates.ts";

const categoryFor = type => type === "Boda" ? "Bodas" : type === "Infantil" ? "Infantiles" : type === "Corporativo" ? "Corporativos" : type;

test("every template has distinct optimized cover, countdown and section assets", () => {
  assert.equal(templates.length, 14);
  for (const template of templates) {
    assert.match(template.coverImage, new RegExp(`${template.slug}-cover\\.webp$`));
    assert.match(template.countdownImage, new RegExp(`${template.slug}-countdown\\.webp$`));
    assert.ok(existsSync(resolve(`public${template.coverImage}`)));
    assert.ok(existsSync(resolve(`public${template.countdownImage}`)));
    for (const visual of Object.values(template.sections)) {
      assert.match(visual.decorativeImage, /\.webp$/);
      assert.ok(existsSync(resolve(`public${visual.decorativeImage}`)));
    }
  }
});
test("every selectable event type has at least one template", () => {
  for (const eventType of ["Boda", "XV", "Cumpleaños", "Infantil", "Corporativo"]) assert.ok(templates.some(template => template.category === categoryFor(eventType)));
});
