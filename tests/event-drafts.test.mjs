import test from "node:test";
import assert from "node:assert/strict";
import { defaultAgenda, defaultFeatures, hasPlanFeature, nextAvailableSlug, planDetails, slugify, validateDraft, validatePlanFeatures } from "../lib/event-drafts.ts";

test("creates URL-safe slugs from event titles",()=>{assert.equal(slugify("Sofía & Mateo — Boda 2027"),"sofia-mateo-boda-2027")});
test("keeps the clean event URL until its name is already in use",()=>{assert.equal(nextAvailableSlug("sofia",[]),"sofia");assert.equal(nextAvailableSlug("sofia",["sofia"]),"sofia-2")});
test("has one canonical public plan catalog",()=>{assert.equal(planDetails.standard.price,18000);assert.equal(planDetails.premium.price,23000);assert.equal(planDetails.premium_plus.price,28000)});
test("keeps the confirmed total photo limits",()=>{assert.equal(planDetails.standard.mediaLimit,1);assert.equal(planDetails.premium.mediaLimit,5);assert.equal(planDetails.premium_plus.mediaLimit,10)});
test("does not allow features outside the selected plan",()=>{assert.equal(validatePlanFeatures("standard",planDetails.standard.features),true);assert.equal(validatePlanFeatures("standard",["gallery"]),false)});
test("standard is valid without an organizer WhatsApp number",()=>{assert.equal(validateDraft({title:"Sofía y Mateo",eventType:"Boda",templateSlug:"dinner-club",plan:"standard",agenda:defaultAgenda(),features:defaultFeatures("standard")}),null)});
test("only Premium plans offer internal RSVP",()=>{assert.equal(hasPlanFeature("standard","general-rsvp"),false);assert.equal(hasPlanFeature("premium","general-rsvp"),true);assert.equal(hasPlanFeature("premium_plus","general-rsvp"),true)});
test("reserves individual invitations and QR album for Premium Plus",()=>{assert.equal(hasPlanFeature("premium","individual-links"),false);assert.equal(hasPlanFeature("premium_plus","individual-links"),true);assert.equal(hasPlanFeature("premium_plus","qr-album"),true)});
test("keeps the default agenda usable",()=>{assert.equal(defaultAgenda().every(item=>item.time&&item.title),true)});
