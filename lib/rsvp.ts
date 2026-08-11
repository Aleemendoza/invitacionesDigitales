import type { GuestStatus } from "./guest-access";

export type AttendanceValidationInput = {
  seats: number;
  attendees: number;
  deadline?: string | Date | null;
  now?: Date;
};

export type GroupAttendance = {
  seats: number;
  status: GuestStatus;
  attendees?: number;
};

export function rsvpStatus(attending: number, seats: number): GuestStatus {
  if (!Number.isInteger(seats) || seats < 1 || !Number.isInteger(attending) || attending < 0 || attending > seats) {
    throw new RangeError("Attendance must be an integer between zero and the group capacity.");
  }
  if (attending === 0) return "declined";
  if (attending === seats) return "confirmed";
  return "partial";
}

/** Server-side validation; frontend selection limits are a UX aid only. */
export function validateAttendance({ seats, attendees, deadline, now = new Date() }: AttendanceValidationInput): string | null {
  const parsedDeadline = deadline ? new Date(deadline) : null;
  if (parsedDeadline && !Number.isNaN(parsedDeadline.getTime()) && parsedDeadline <= now) {
    return "Las confirmaciones ya cerraron.";
  }
  if (!Number.isInteger(seats) || seats < 1 || !Number.isInteger(attendees) || attendees < 0 || attendees > seats) {
    return `Podés confirmar entre 0 y ${Number.isInteger(seats) && seats > 0 ? seats : 0} lugares.`;
  }
  return null;
}

export function selectedNamedGuests(
  namedGuestIds: readonly string[],
  selectedGuestIds: readonly string[],
  additionalGuests: number,
  seats: number,
): string | null {
  const uniqueSelected = new Set(selectedGuestIds);
  const validSelection = [...uniqueSelected].every((id) => namedGuestIds.includes(id));
  if (!validSelection || uniqueSelected.size !== selectedGuestIds.length || !Number.isInteger(additionalGuests) || additionalGuests < 0) {
    return "La selección de invitados no es válida.";
  }
  return validateAttendance({ seats, attendees: uniqueSelected.size + additionalGuests });
}

/** Person counts are intentionally separate from group-status counts. */
export function eventStats(groups: readonly GroupAttendance[]) {
  let invited = 0;
  let confirmed = 0;
  let declined = 0;
  let pending = 0;
  let partial = 0;
  let confirmedGroups = 0;
  let declinedGroups = 0;
  let pendingGroups = 0;

  for (const group of groups) {
    invited += group.seats;
    const attendees = group.attendees ?? (group.status === "confirmed" ? group.seats : 0);
    if (group.status === "pending") {
      pending += group.seats;
      pendingGroups += 1;
    } else if (group.status === "declined") {
      declined += group.seats;
      declinedGroups += 1;
    } else if (group.status === "confirmed") {
      confirmed += attendees;
      confirmedGroups += 1;
    } else {
      confirmed += attendees;
      declined += Math.max(group.seats - attendees, 0);
      partial += 1;
    }
  }

  return {
    invited,
    confirmed,
    declined,
    pending,
    partial,
    groups: { total: groups.length, confirmed: confirmedGroups, declined: declinedGroups, pending: pendingGroups, partial },
  };
}
