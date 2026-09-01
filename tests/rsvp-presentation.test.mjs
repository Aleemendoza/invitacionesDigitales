import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCalendarIcs,
  calendarTitle,
  hasCalendarDate,
  initialAttendance,
  selectedMemberIds,
} from "../lib/rsvp-presentation.ts";

test("keeps pending guests unselected until they explicitly confirm", () => {
  assert.deepEqual(selectedMemberIds([
    { id: "confirmed", attending: true },
    { id: "pending", attending: null },
    { id: "declined", attending: false },
  ]), ["confirmed"]);
  assert.equal(initialAttendance("pending"), null);
  assert.equal(initialAttendance("declined"), false);
  assert.equal(initialAttendance("partial"), true);
});

test("does not build a calendar file without a valid event date", () => {
  assert.equal(hasCalendarDate(null), false);
  assert.equal(hasCalendarDate("not-a-date"), false);
  assert.equal(buildCalendarIcs({ startsAt: null, slug: "boda", origin: "https://example.com" }), null);
});

test("builds an escaped, complete calendar file from partial event data", () => {
  const ics = buildCalendarIcs({
    startsAt: "2026-10-10T18:30:00.000Z",
    eventType: "Boda",
    title: "Ana, Juan; celebración",
    venue: "Salón Norte",
    slug: "ana-juan",
    origin: "https://example.com",
    now: new Date("2026-01-02T03:04:05.000Z"),
  });

  assert.match(ics, /UID:ana-juan@papeleta\.app/);
  assert.match(ics, /DTSTAMP:20260102T030405Z/);
  assert.match(ics, /DTSTART:20261010T183000Z/);
  assert.match(ics, /DTEND:20261010T223000Z/);
  assert.match(ics, /SUMMARY:Boda · Ana\\, Juan\\; celebración/);
  assert.match(ics, /LOCATION:Salón Norte/);
  assert.match(ics, /DESCRIPTION:Confirmación para Boda · Ana\\, Juan\\; celebración\\nInvitación digital: https:\/\/example\.com\/e\/ana-juan/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
  assert.equal(calendarTitle(undefined, undefined), "Celebración");
});
