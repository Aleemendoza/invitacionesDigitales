import assert from "node:assert/strict";
import test from "node:test";
import { canPublishEvent, canTransitionPayment, eventStatusAfterPayment } from "../lib/payment-state.ts";

test("only approved payments publish an event",()=>{assert.equal(canPublishEvent("approved"),true);assert.equal(canPublishEvent("pending"),false);assert.equal(eventStatusAfterPayment("draft","approved"),"published")});
test("approved payments are monotonic",()=>{assert.equal(canTransitionPayment("approved","rejected"),false);assert.equal(canTransitionPayment("pending","approved"),true);assert.equal(eventStatusAfterPayment("finished","approved"),"finished")});
