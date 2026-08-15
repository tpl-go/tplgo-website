import type { CreatorAsset } from "./creatorCatalogTypes";
import type { CreatorEntitlement } from "./creatorEntitlementTypes";
import type { CreatorLicenseCertificatePreview, CreatorResolvedLicense } from "./creatorLicenseTypes";

export function previewLicenseCertificate(asset: CreatorAsset, entitlement: CreatorEntitlement, resolvedLicense: CreatorResolvedLicense): CreatorLicenseCertificatePreview {
  const issuedAt = new Date().toISOString();

  return {
    certificateId: entitlement.licenseCertificateId,
    orderId: entitlement.orderId,
    orderItemId: entitlement.orderItemId,
    entitlementId: entitlement.entitlementId,
    buyerUserId: entitlement.buyerUserId,
    assetId: asset.id,
    assetTitleSnapshot: asset.title,
    creatorId: asset.creatorSlug,
    creatorNameSnapshot: asset.creatorName,
    licenseType: resolvedLicense.licenseType,
    licenseVersion: resolvedLicense.licenseVersion,
    issuedAt,
    validFrom: entitlement.accessStartsAt,
    validUntil: entitlement.accessExpiresAt,
    permittedUseSummary: resolvedLicense.definition.allowedUses,
    restrictionsSummary: resolvedLicense.definition.prohibitedUses,
    certificateStatus: "preview_only",
    verificationCode: `TPL-CREATOR-PREVIEW-${asset.id}-${resolvedLicense.licenseType}`.toUpperCase(),
    metadata: {
      hiddenMode: true,
      legalReviewRequired: resolvedLicense.definition.policyReviewRequired,
      pdfGenerated: false,
    },
  };
}
