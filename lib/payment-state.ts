import type { PaymentStatus } from "./event-drafts";

export type EventStatus = "draft" | "published" | "finished";

const paymentTransitions: Record<PaymentStatus, readonly PaymentStatus[]> = {
  unpaid: ["pending"],
  pending: ["approved", "rejected"],
  approved: [],
  rejected: ["pending"],
};

export function canTransitionPayment(from: PaymentStatus, to: PaymentStatus) {
  return from === to || paymentTransitions[from].includes(to);
}

export function canPublishEvent(paymentStatus: PaymentStatus) {
  return paymentStatus === "approved";
}

export function eventStatusAfterPayment(current: EventStatus, paymentStatus: PaymentStatus): EventStatus {
  if (current === "finished") return "finished";
  return canPublishEvent(paymentStatus) ? "published" : "draft";
}
