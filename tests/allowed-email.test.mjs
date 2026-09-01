import assert from "node:assert/strict";
import test from "node:test";
import { isAllowedEmail } from "../lib/allowed-email.ts";
test("accepts valid personal and business email addresses",()=>{assert.equal(isAllowedEmail("nombre@gmail.com"),true);assert.equal(isAllowedEmail("NOMBRE@OUTLOOK.COM"),true);assert.equal(isAllowedEmail("nombre@yahoo.com"),true);assert.equal(isAllowedEmail("equipo@empresa.com.ar"),true);assert.equal(isAllowedEmail("nombre@icloud.com"),true)});
test("rejects malformed email addresses",()=>{assert.equal(isAllowedEmail("nombre"),false);assert.equal(isAllowedEmail("@empresa.com"),false);assert.equal(isAllowedEmail("nombre@localhost"),false);assert.equal(isAllowedEmail("nombre @empresa.com"),false)});
