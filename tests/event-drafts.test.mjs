import test from "node:test";
import assert from "node:assert/strict";
import { defaultAgenda, planDetails, slugify, validateDraft, validatePlanFeatures } from "../lib/event-drafts.ts";

test("creates URL-safe slugs from event titles",()=>{assert.equal(slugify("Sofía & Mateo — Boda 2027"),"sofia-mateo-boda-2027")});
test("requires each agenda item to be complete",()=>{assert.equal(validateDraft({agenda:[{time:"19:30",title:"Ceremonia"}]}),null);assert.match(validateDraft({agenda:[{time:"",title:""}]}),/agenda/)});
test("does not allow features outside the selected plan",()=>{assert.equal(validatePlanFeatures("Essential",planDetails.Essential.features),true);assert.equal(validatePlanFeatures("Essential",["gallery"]),false)});
test("validates the optional dress code",()=>{assert.equal(validateDraft({dressCode:"Formal elegante"}),null);assert.match(validateDraft({dressCode:"x".repeat(181)}),/dress code/)});
