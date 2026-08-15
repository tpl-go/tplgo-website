import type { CreatorEntitlement } from "./creatorEntitlementTypes";
import type { CreatorDownloadAccessDecision, CreatorRefundAccessContext } from "./creatorDownloadTypes";

export function shouldSuspendAccessForRefundRequest(context: CreatorRefundAccessContext) {
  return context.refundRequested && context.disputeOpen;
}

export function shouldRevokeAccessAfterRefund(context: CreatorRefundAccessContext) {
  return context.refundCompleted;
}

export function isRefundRestrictedAfterDownload(context: CreatorRefundAccessContext) {
  return context.downloadCount > 0;
}

export function buildRefundAccessDecision(entitlement: CreatorEntitlement, context: CreatorRefundAccessContext): CreatorDownloadAccessDecision {
  if (shouldRevokeAccessAfterRefund(context)) return { allowed: false, decision: "denied_refund_restriction", reason: "Refund completed; entitlement access should be revoked." };
  if (shouldSuspendAccessForRefundRequest(context)) return { allowed: false, decision: "denied_refund_restriction", reason: "Refund dispute open; entitlement access should be suspended." };
  if (entitlement.refundRestricted || isRefundRestrictedAfterDownload(context)) return { allowed: false, decision: "denied_refund_restriction", reason: "Refund/access policy restricts this entitlement after download." };
  return { allowed: true, decision: "allowed", reason: "Refund policy does not restrict access." };
}
