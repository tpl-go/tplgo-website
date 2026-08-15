import { isCreatorDownloadTokensEnabled, isCreatorSecureDownloadsEnabled, isCreatorSignedUrlsEnabled, isCreatorVersionDeliveryEnabled } from "./creatorFeatureFlags";
import { calculateRemainingDownloads, isEntitlementExpired } from "./creatorEntitlementPolicy";
import type { CreatorEntitlement } from "./creatorEntitlementTypes";
import type { CreatorDownloadAccessDecision, CreatorMalwareScanPreview } from "./creatorDownloadTypes";
import { buildRefundAccessDecision } from "./creatorRefundAccessPolicy";
import { resolveCreatorAssetVersionAccess } from "./creatorVersionAccessResolver";

export function validateDownloadOwnership(entitlement: CreatorEntitlement, buyerUserId: string): CreatorDownloadAccessDecision {
  return entitlement.buyerUserId === buyerUserId
    ? { allowed: true, decision: "allowed", reason: "Buyer owns entitlement." }
    : { allowed: false, decision: "denied_not_owner", reason: "Buyer does not own entitlement." };
}

export function validateEntitlementStatus(entitlement: CreatorEntitlement): CreatorDownloadAccessDecision {
  return entitlement.entitlementStatus === "active"
    ? { allowed: true, decision: "allowed", reason: "Entitlement is active." }
    : { allowed: false, decision: "denied_entitlement_inactive", reason: "Entitlement is not active." };
}

export function validateAccessWindow(entitlement: CreatorEntitlement): CreatorDownloadAccessDecision {
  return isEntitlementExpired(entitlement)
    ? { allowed: false, decision: "denied_entitlement_expired", reason: "Entitlement access window expired." }
    : { allowed: true, decision: "allowed", reason: "Entitlement access window is valid." };
}

export function validateDownloadLimit(entitlement: CreatorEntitlement): CreatorDownloadAccessDecision {
  return calculateRemainingDownloads(entitlement) > 0
    ? { allowed: true, decision: "allowed", reason: "Download limit has remaining capacity." }
    : { allowed: false, decision: "denied_download_limit", reason: "Download limit reached." };
}

export function validateAssetVersionAccess(entitlement: CreatorEntitlement, requestedVersionId: string, latestVersionId: string): CreatorDownloadAccessDecision {
  if (!isCreatorVersionDeliveryEnabled()) {
    return { allowed: false, decision: "denied_version_access", reason: "Creator version delivery is disabled by feature flag." };
  }
  return resolveCreatorAssetVersionAccess({ entitlement, requestedVersionId, latestVersionId });
}

export function validateRefundRestriction(entitlement: CreatorEntitlement): CreatorDownloadAccessDecision {
  return buildRefundAccessDecision(entitlement, {
    refundRequested: entitlement.refundRestricted,
    refundCompleted: entitlement.entitlementStatus === "refunded",
    disputeOpen: entitlement.refundRestricted,
    downloadCount: entitlement.downloadCount,
  });
}

export function validateRevocationStatus(entitlement: CreatorEntitlement): CreatorDownloadAccessDecision {
  return entitlement.entitlementStatus === "revoked"
    ? { allowed: false, decision: "denied_entitlement_revoked", reason: "Entitlement is revoked." }
    : { allowed: true, decision: "allowed", reason: "Entitlement is not revoked." };
}

export function validateSuspensionStatus(entitlement: CreatorEntitlement): CreatorDownloadAccessDecision {
  return entitlement.entitlementStatus === "suspended"
    ? { allowed: false, decision: "denied_entitlement_suspended", reason: "Entitlement is suspended." }
    : { allowed: true, decision: "allowed", reason: "Entitlement is not suspended." };
}

export function calculateRemainingDownloadsAfterAttempt(entitlement: CreatorEntitlement) {
  return Math.max(calculateRemainingDownloads(entitlement) - 1, 0);
}

export function calculateDownloadDecision({
  entitlement,
  buyerUserId,
  requestedVersionId,
  latestVersionId,
  fileAvailable,
  assetAvailable,
  malwareScan,
}: {
  entitlement: CreatorEntitlement;
  buyerUserId: string;
  requestedVersionId: string;
  latestVersionId: string;
  fileAvailable: boolean;
  assetAvailable: boolean;
  malwareScan: CreatorMalwareScanPreview;
}): CreatorDownloadAccessDecision {
  if (!isCreatorSecureDownloadsEnabled()) return { allowed: false, decision: "denied_entitlement_inactive", reason: "Creator secure downloads are disabled by feature flag." };
  if (!assetAvailable) return { allowed: false, decision: "denied_asset_unavailable", reason: "Asset is unavailable." };
  if (!fileAvailable) return { allowed: false, decision: "denied_file_unavailable", reason: "File is unavailable." };
  if (malwareScan.scanStatus === "infected") return { allowed: false, decision: "denied_malware_infected", reason: "Malware scan marked file as infected." };

  const checks = [
    validateDownloadOwnership(entitlement, buyerUserId),
    validateRevocationStatus(entitlement),
    validateSuspensionStatus(entitlement),
    validateEntitlementStatus(entitlement),
    validateAccessWindow(entitlement),
    validateDownloadLimit(entitlement),
    validateAssetVersionAccess(entitlement, requestedVersionId, latestVersionId),
    validateRefundRestriction(entitlement),
  ];

  return checks.find((check) => !check.allowed) || { allowed: true, decision: "allowed", reason: "Creator download authorization preview allows access." };
}

export function canIssueDownloadToken(decision: CreatorDownloadAccessDecision): CreatorDownloadAccessDecision {
  if (!decision.allowed) return decision;
  if (!isCreatorDownloadTokensEnabled()) return { allowed: false, decision: "denied_entitlement_inactive", reason: "Creator download tokens are disabled by feature flag." };
  if (!isCreatorSignedUrlsEnabled()) return { allowed: false, decision: "denied_entitlement_inactive", reason: "Creator signed URLs are disabled by feature flag." };
  return { allowed: false, decision: "allowed", reason: "Token issue remains disabled in hidden mode." };
}
