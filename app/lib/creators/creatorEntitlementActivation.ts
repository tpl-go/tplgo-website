import { isCreatorEntitlementActivationEnabled } from "./creatorFeatureFlags";
import type { CreatorEntitlement } from "./creatorEntitlementTypes";
import type { CreatorActivationInput, CreatorEntitlementActivationPreview } from "./creatorDownloadTypes";

export function validateActivationInput(input: CreatorActivationInput): string[] {
  const issues: string[] = [];
  if (!isCreatorEntitlementActivationEnabled()) issues.push("entitlement_activation_disabled");
  if (input.paymentStatus !== "payment_captured") issues.push("payment_not_confirmed");
  if (input.entitlement.buyerUserId !== input.buyerUserId) issues.push("buyer_owner_mismatch");
  if (input.entitlement.orderId !== input.orderId) issues.push("order_mismatch");
  if (input.entitlement.orderItemId !== input.orderItemId) issues.push("order_item_mismatch");
  if (input.entitlement.assetId !== input.assetId) issues.push("asset_mismatch");
  if (input.entitlement.assetVersionId !== input.assetVersionId) issues.push("asset_version_mismatch");
  if (input.entitlement.licenseId !== input.licenseId) issues.push("license_mismatch");
  if (input.entitlement.entitlementStatus === "refunded" || input.entitlement.entitlementStatus === "revoked" || input.entitlement.entitlementStatus === "failed") {
    issues.push("invalid_entitlement_status");
  }
  return issues;
}

export function canActivateCreatorEntitlement(input: CreatorActivationInput) {
  const issues = validateActivationInput(input);
  return {
    allowed: false,
    issues,
    reason: issues.length ? issues.join(",") : "activation_preview_only",
  };
}

export function canSuspendCreatorEntitlement(entitlement: CreatorEntitlement) {
  return { allowed: entitlement.entitlementStatus === "active", executionAllowed: false };
}

export function canRevokeCreatorEntitlement(entitlement: CreatorEntitlement) {
  return { allowed: entitlement.entitlementStatus !== "revoked", executionAllowed: false };
}

export function canExpireCreatorEntitlement(entitlement: CreatorEntitlement) {
  return { allowed: entitlement.entitlementStatus === "active", executionAllowed: false };
}

export function buildEntitlementActivationPreview(input: CreatorActivationInput): CreatorEntitlementActivationPreview {
  const now = new Date().toISOString();
  const issues = validateActivationInput(input);
  return {
    activationId: `creator-activation-${input.entitlement.entitlementId}`,
    entitlementId: input.entitlement.entitlementId,
    orderId: input.orderId,
    orderItemId: input.orderItemId,
    buyerUserId: input.buyerUserId,
    assetId: input.assetId,
    assetVersionId: input.assetVersionId,
    licenseId: input.licenseId,
    activationStatus: issues.length ? "failed" : "activation_pending",
    paymentStatus: input.paymentStatus,
    accessStartsAt: input.entitlement.accessStartsAt,
    accessExpiresAt: input.entitlement.accessExpiresAt,
    downloadLimit: input.entitlement.downloadLimit,
    versionAccessPolicy: input.entitlement.versionAccessPolicy,
    activationReason: "hidden_preview",
    failureReason: issues.length ? issues.join(",") : null,
    createdAt: now,
    updatedAt: now,
    metadata: {
      idempotencyReady: true,
      activationPreviewOnly: true,
    },
    entitlementActivationAllowed: false,
  };
}
