import type { CreatorEntitlement, CreatorEntitlementPolicyDecision } from "./creatorEntitlementTypes";
import type { CreatorVersionAccessPolicy } from "./creatorLicenseTypes";

function decision(allowed: boolean, code: string, reason: string): CreatorEntitlementPolicyDecision {
  return { allowed, code, reason };
}

function isActiveStatus(entitlement: CreatorEntitlement) {
  return entitlement.entitlementStatus === "active";
}

export function calculateRemainingDownloads(entitlement: CreatorEntitlement) {
  return Math.max(entitlement.downloadLimit - entitlement.downloadCount, 0);
}

export function isEntitlementExpired(entitlement: CreatorEntitlement, now = new Date()) {
  return Boolean(entitlement.accessExpiresAt && new Date(entitlement.accessExpiresAt).getTime() < now.getTime());
}

export function canActivateEntitlement(entitlement: CreatorEntitlement) {
  if (entitlement.entitlementStatus !== "payment_confirmed" && entitlement.entitlementStatus !== "activation_pending") {
    return decision(false, "invalid_status", "Creator entitlement cannot activate from its current status.");
  }
  return decision(false, "activation_disabled", "Real Creator entitlement activation is disabled in hidden mode.");
}

export function canAccessAsset(entitlement: CreatorEntitlement, buyerUserId: string, now = new Date()) {
  if (entitlement.buyerUserId !== buyerUserId) return decision(false, "owner_mismatch", "Creator entitlement does not belong to this user.");
  if (entitlement.entitlementStatus === "suspended") return decision(false, "suspended", "Creator entitlement is suspended.");
  if (entitlement.entitlementStatus === "revoked") return decision(false, "revoked", "Creator entitlement is revoked.");
  if (!isActiveStatus(entitlement)) return decision(false, "not_active", "Creator entitlement is not active.");
  if (isEntitlementExpired(entitlement, now)) return decision(false, "expired", "Creator entitlement access window has expired.");
  return decision(true, "allowed", "Creator asset access is allowed by entitlement policy.");
}

export function canRequestDownload(entitlement: CreatorEntitlement, buyerUserId: string, now = new Date()) {
  const access = canAccessAsset(entitlement, buyerUserId, now);
  if (!access.allowed) return access;
  if (calculateRemainingDownloads(entitlement) <= 0) return decision(false, "download_limit_reached", "Creator entitlement download limit has been reached.");
  return decision(false, "download_tokens_disabled", "Secure Creator download token issuance is disabled in hidden mode.");
}

export function canAccessVersion(entitlement: CreatorEntitlement, requestedVersionId: string, latestVersionId: string, policy: CreatorVersionAccessPolicy = entitlement.versionAccessPolicy) {
  if (policy === "purchased_version_only") return decision(requestedVersionId === entitlement.assetVersionId, "version_policy", "Only purchased asset version is allowed.");
  if (policy === "minor_updates") return decision(requestedVersionId === entitlement.assetVersionId || requestedVersionId.startsWith(`${entitlement.assetVersionId}.`), "version_policy", "Purchased version and minor updates are allowed.");
  if (policy === "all_updates_during_support") return decision(Boolean(entitlement.supportExpiresAt && new Date(entitlement.supportExpiresAt).getTime() >= Date.now()), "support_window", "Updates are allowed during support window.");
  if (policy === "latest_version_during_subscription") return decision(requestedVersionId === latestVersionId && !isEntitlementExpired(entitlement), "subscription_version", "Latest version is allowed during active subscription.");
  if (policy === "perpetual_latest_at_purchase") return decision(requestedVersionId === latestVersionId || requestedVersionId === entitlement.assetVersionId, "purchase_latest", "Latest at purchase and purchased version are allowed.");
  return decision(false, "custom_version_review", "Custom version access requires backend review.");
}

export function shouldRestrictRefundAfterAccess(entitlement: CreatorEntitlement) {
  return entitlement.downloadCount > 0 || entitlement.refundRestricted;
}

export function canRequestRefund(entitlement: CreatorEntitlement) {
  if (shouldRestrictRefundAfterAccess(entitlement)) {
    return decision(false, "refund_restricted_after_access", entitlement.refundRestrictionReason || "Creator refund is restricted after access or download.");
  }
  if (entitlement.entitlementStatus === "revoked" || entitlement.entitlementStatus === "refunded") {
    return decision(false, "invalid_status", "Creator entitlement status does not allow refund request.");
  }
  return decision(true, "refund_review_allowed", "Creator refund request may be reviewed by backend policy.");
}

export function canUpgradeLicense(entitlement: CreatorEntitlement) {
  if (!isActiveStatus(entitlement)) return decision(false, "not_active", "Only active Creator entitlements can be upgraded.");
  if (entitlement.licenseType === "custom_enterprise_request") return decision(false, "enterprise_review", "Enterprise licenses require custom review.");
  return decision(true, "upgrade_ready", "Creator license upgrade readiness is available for future phase.");
}

export function canExtendLicense(entitlement: CreatorEntitlement) {
  if (entitlement.entitlementStatus === "revoked" || entitlement.entitlementStatus === "refunded") return decision(false, "invalid_status", "Creator license cannot be extended from this status.");
  return decision(true, "extend_ready", "Creator license extension readiness is available for future phase.");
}

export function canRevokeEntitlement(entitlement: CreatorEntitlement) {
  if (entitlement.entitlementStatus === "revoked") return decision(false, "already_revoked", "Creator entitlement is already revoked.");
  return decision(true, "revoke_ready", "Creator entitlement revocation is policy-ready for backend/admin phase.");
}
