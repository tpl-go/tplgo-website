import { getCreatorAsset } from "@/app/lib/creators/creatorCatalogService";
import type { CreatorLicenseType } from "@/app/lib/creators/creatorCatalogTypes";
import { previewEntitlement } from "@/app/lib/creators/creatorEntitlementService";
import { isCreatorBackendPreviewApisEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import { previewLicenseCertificate } from "@/app/lib/creators/creatorLicenseCertificate";
import { validateLicenseSelection } from "@/app/lib/creators/creatorLicenseEngine";
import { creatorPreviewDisabled, creatorPreviewError, creatorPreviewOk, readCreatorPreviewJson } from "@/app/lib/creators/creatorPreviewApi";

export async function POST(request: Request) {
  if (!isCreatorBackendPreviewApisEnabled()) return creatorPreviewDisabled();
  try {
    const body = await readCreatorPreviewJson(request);
    const asset = getCreatorAsset(String(body.assetSlug || ""));
    if (!asset) return creatorPreviewError("CREATOR_ASSET_NOT_FOUND", "Creator asset was not found.", 404);
    const license = validateLicenseSelection({ asset, requestedLicense: (body.licenseType || "personal") as CreatorLicenseType });
    const entitlement = previewEntitlement(asset, license, String(body.buyerUserId || "creator_preview_buyer"));
    return creatorPreviewOk(previewLicenseCertificate(asset, entitlement, license));
  } catch {
    return creatorPreviewError("CREATOR_INVALID_REQUEST", "Creator certificate preview request is invalid.");
  }
}
