import type { CreatorAsset } from "./creatorCatalogTypes";
import type { CreatorEntitlement } from "./creatorEntitlementTypes";
import type { CreatorResolvedLicense } from "./creatorLicenseTypes";

export function previewEntitlement(asset: CreatorAsset, resolvedLicense: CreatorResolvedLicense, buyerUserId = "future-tpl-user"): CreatorEntitlement {
  const now = new Date().toISOString();
  const downloadLimit = typeof resolvedLicense.definition.downloadLimit === "number" ? resolvedLicense.definition.downloadLimit : 0;

  return {
    entitlementId: `preview-entitlement-${asset.id}-${resolvedLicense.licenseType}`,
    buyerUserId,
    orderId: "preview-order",
    orderItemId: `preview-order-item-${asset.id}`,
    assetId: asset.id,
    assetVersionId: asset.version,
    creatorId: asset.creatorSlug,
    licenseId: resolvedLicense.licenseId,
    licenseType: resolvedLicense.licenseType,
    entitlementStatus: "draft",
    accessStartsAt: now,
    accessExpiresAt: resolvedLicense.definition.validityMode === "subscription" ? now : null,
    downloadLimit,
    downloadCount: 0,
    remainingDownloads: downloadLimit,
    versionAccessPolicy: resolvedLicense.definition.versionAccessPolicy,
    supportExpiresAt: null,
    licenseCertificateId: `preview-certificate-${asset.id}-${resolvedLicense.licenseType}`,
    revokedAt: null,
    revocationReason: null,
    refundRestricted: false,
    refundRestrictionReason: null,
    createdAt: now,
    updatedAt: now,
    metadata: {
      hiddenMode: true,
      activationAllowed: false,
      sourceFileAccessAllowed: false,
    },
  };
}

export async function getEntitlement(): Promise<CreatorEntitlement | null> {
  return null;
}

export async function listEntitlements(): Promise<CreatorEntitlement[]> {
  return [];
}

export async function validateAssetAccess(): Promise<{ allowed: false; reason: "backend_required" }> {
  return { allowed: false, reason: "backend_required" };
}
