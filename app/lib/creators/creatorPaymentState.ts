import type { CreatorPaymentStatus } from "./creatorPaymentTypes";

export const creatorPaymentStateTransitions: Array<{ from: CreatorPaymentStatus; to: CreatorPaymentStatus }> = [
  { from: "draft", to: "intent_created" },
  { from: "intent_created", to: "awaiting_payment" },
  { from: "awaiting_payment", to: "payment_processing" },
  { from: "payment_processing", to: "payment_authorized" },
  { from: "payment_authorized", to: "payment_captured" },
  { from: "awaiting_payment", to: "payment_cancelled" },
  { from: "payment_processing", to: "payment_failed" },
  { from: "payment_processing", to: "payment_expired" },
  { from: "payment_captured", to: "refund_pending" },
  { from: "refund_pending", to: "refund_completed" },
];

export function canTransitionCreatorPayment(from: CreatorPaymentStatus, to: CreatorPaymentStatus) {
  return creatorPaymentStateTransitions.some((transition) => transition.from === from && transition.to === to);
}
