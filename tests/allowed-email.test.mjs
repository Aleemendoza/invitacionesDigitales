import assert from "node:assert/strict";
import test from "node:test";
import { isAllowedEmail } from "../lib/allowed-email.ts";
test("accepts only Gmail, Outlook and Hotmail email addresses",()=>{assert.equal(isAllowedEmail("nombre@gmail.com"),true);assert.equal(isAllowedEmail("NOMBRE@OUTLOOK.COM"),true);assert.equal(isAllowedEmail("nombre@hotmail.com"),true);assert.equal(isAllowedEmail("nombre@yahoo.com"),false);assert.equal(isAllowedEmail("nombre@outlook.com.ar"),false)});
