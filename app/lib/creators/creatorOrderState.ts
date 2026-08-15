import type { CreatorOrderState } from "./creatorOrderTypes";

export const creatorOrderStateTransitions: Array<{ from: CreatorOrderState; to: CreatorOrderState }> = [
  { from: "draft", to: "checkout_preview" },
  { from: "checkout_preview", to: "validation_pending" },
  { from: "validation_pending", to: "validated" },
  { from: "validated", to: "payment_pending" },
  { from: "payment_pending", to: "payment_processing" },
  { from: "payment_processing", to: "payment_confirmed" },
  { from: "payment_confirmed", to: "entitlement_pending" },
  { from: "entitlement_pending", to: "completed" },
  { from: "draft", to: "cancelled" },
  { from: "checkout_preview", to: "cancelled" },
  { from: "validation_pending", to: "failed" },
  { from: "validated", to: "failed" },
  { from: "payment_pending", to: "failed" },
  { from: "payment_processing", to: "failed" },
  { from: "failed", to: "rolled_back" },
];

export function canTransitionCreatorOrder(from: CreatorOrderState, to: CreatorOrderState) {
  return creatorOrderStateTransitions.some((transition) => transition.from === from && transition.to === to);
}
