import test from "node:test"; import assert from "node:assert/strict";
import { normalizeAlias, isSafeExternalUrl, isValidArgentineAccount, normalizeInstagramHandle } from "../lib/event-sections.ts";
test("normalizes aliases and handles",()=>{assert.equal(normalizeAlias(" sofia.mateo.boda "),"SOFIA.MATEO.BODA");assert.equal(normalizeInstagramHandle("@@Sofia Mateo"),"sofiamateo")});
test("validates bank accounts and safe links",()=>{assert.equal(isValidArgentineAccount("1234567890123456789012"),true);assert.equal(isValidArgentineAccount("123"),false);assert.equal(isSafeExternalUrl("https://example.com"),true);assert.equal(isSafeExternalUrl("javascript:alert(1)"),false)});
