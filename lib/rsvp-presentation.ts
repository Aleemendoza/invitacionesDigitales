export type RsvpMemberSelection = {
  id: string;
  attending: boolean | null;
};

type CalendarEventInput = {
  startsAt: unknown;
  eventType?: unknown;
  title?: unknown;
  venue?: unknown;
  venueAddress?: unknown;
  slug: string;
  origin: string;
  now?: Date;
};

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";

const icsText = (value: unknown) => text(value)
  .replace(/\\/g, "\\\\")
  .replace(/\r?\n/g, "\\n")
  .replace(/,/g, "\\,")
  .replace(/;/g, "\\;");

const icsDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function selectedMemberIds(members: readonly RsvpMemberSelection[]) {
  return members.filter((member) => member.attending === true).map((member) => member.id);
}

export function initialAttendance(status: unknown): boolean | null {
  if (status === "confirmed" || status === "partial") return true;
  if (status === "declined") return false;
  return null;
}

export function calendarTitle(eventType: unknown, title: unknown) {
  return [text(eventType), text(title)].filter(Boolean).join(" · ") || "Celebración";
}

export function hasCalendarDate(startsAt: unknown): startsAt is string {
  return typeof startsAt === "string" && !Number.isNaN(new Date(startsAt).getTime());
}

export function buildCalendarIcs(input: CalendarEventInput) {
  if (!hasCalendarDate(input.startsAt)) return null;

  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(startsAt.getTime() + 4 * 60 * 60 * 1_000);
  const title = calendarTitle(input.eventType, input.title);
  const location = text(input.venueAddress) || text(input.venue);
  const description = `Confirmación para ${title}\nInvitación digital: ${input.origin}/e/${input.slug}`;
  const uid = `${input.slug.replace(/[^a-z0-9.-]/gi, "-")}@papeleta.app`;
  const now = input.now ?? new Date();

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Papeleta//Invitación digital//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${icsText(uid)}`,
    `DTSTAMP:${icsDate(now)}`,
    `DTSTART:${icsDate(startsAt)}`,
    `DTEND:${icsDate(endsAt)}`,
    `SUMMARY:${icsText(title)}`,
    `DESCRIPTION:${icsText(description)}`,
    `LOCATION:${icsText(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
