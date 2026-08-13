export type EventStatus = "draft" | "published" | "finished";
export type PaymentStatus = "unpaid" | "pending" | "approved" | "rejected";

export function eventProgress(event: { title: string; starts_at: string | null; content?: { venue?: string; agenda?: unknown[] }; payment_status: PaymentStatus }) {
  const checks = [Boolean(event.title?.trim()), Boolean(event.starts_at), Boolean(event.content?.venue?.trim()), Boolean(event.content?.agenda?.length), event.payment_status === "approved"];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function rsvpTotals(groups: Array<{ seats: number; confirmed_seats: number | null; status: string }>) {
  return groups.reduce((totals, group) => ({
    invited: totals.invited + group.seats,
    confirmed: totals.confirmed + (group.confirmed_seats ?? 0),
    pending: totals.pending + (group.status === "pending" ? group.seats : group.status === "partial" ? Math.max(0, group.seats - (group.confirmed_seats ?? 0)) : 0),
    declined: totals.declined + (group.status === "declined" ? group.seats : 0),
  }), { invited: 0, confirmed: 0, pending: 0, declined: 0 });
}

export function canChangeRole(actorId: string, targetId: string, nextRole: string, currentRole: string, adminCount: number) {
  if (actorId === targetId) return "No podés modificar tu propio rol.";
  if (!["organizer", "admin"].includes(nextRole)) return "El rol seleccionado no es válido.";
  if (nextRole === currentRole) return "La cuenta ya tiene ese rol.";
  if (currentRole === "admin" && nextRole === "organizer" && adminCount <= 1) return "Debe permanecer al menos un administrador.";
  return null;
}
