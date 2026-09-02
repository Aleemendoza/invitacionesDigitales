import test from "node:test";
import assert from "node:assert/strict";
import { resolveClosingMessage } from "../lib/event-closing.ts";
import { previewDataToStoredEvent, sanitizePublicEventSection } from "../lib/invitation-render.ts";

const content = {
  venue: "Salón Norte",
  venueAddress: "Av. Principal 123",
  mapUrl: "",
  closingMessage: "Gracias por acompañarnos.",
  wizard_step: 8,
  features: ["cover", "map", "gifts"],
  agenda: [{ time: "21:00", title: "Recepción" }],
};

test("prefers the editable closing message and falls back by event type", () => {
  assert.equal(resolveClosingMessage("  Hasta muy pronto.  ", "Boda"), "Hasta muy pronto.");
  assert.match(resolveClosingMessage("  ", "Boda"), /amor|celebrar|historia/i);
});

test("normalizes enabled draft sections and their visual media for preview", () => {
  const event = previewDataToStoredEvent({
    title: "Ana y Juan",
    event_type: "Boda",
    starts_at: null,
    template_slug: "dinner-club",
    content,
    media: [{ storage_path: "events/cover.webp", kind: "cover", position: 0, url: "https://example.com/cover.webp" }],
    sections: {
      gifts: { enabled: true, title: "Regalos", message: "Gracias", type: "cash_message", protectedDetails: true, accounts: [], visual: { backgroundColor: "#112233", photoPath: "events/cover.webp" } },
      socialPhotos: { enabled: false, title: "Fotos", description: "Compartí", socialType: "instagram_handle", socialValue: "", showCopyButton: true },
    },
  }, "premium");

  assert.equal(event.plan, "premium");
  assert.equal(event.event_sections?.length, 1);
  assert.equal(event.event_sections?.[0].kind, "gifts");
  assert.deepEqual(event.event_media?.[0], { storage_path: "events/cover.webp", kind: "cover", position: 0, url: "https://example.com/cover.webp" });
  assert.deepEqual(event.event_sections?.[0].content.visual, { backgroundColor: "#112233", photoPath: "events/cover.webp" });
});

test("keeps public gift presentation fields but removes protected accounts", () => {
  const sanitized = sanitizePublicEventSection({ kind: "gifts", content: {
    enabled: true,
    title: "Regalos",
    message: "Gracias",
    type: "bank_transfer",
    accounts: [{ accountAlias: "PRIVADO" }],
    visual: { backgroundColor: "#112233", photoPath: "events/gift.webp" },
  } });

  assert.equal(sanitized.content.enabled, true);
  assert.deepEqual(sanitized.content.visual, { backgroundColor: "#112233", photoPath: "events/gift.webp" });
  assert.equal("accounts" in sanitized.content, false);
});
