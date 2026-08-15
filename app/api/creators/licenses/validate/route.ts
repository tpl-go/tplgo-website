import { getCreatorAsset } from "@/app/lib/creators/creatorCatalogService";
import type { CreatorLicenseType } from "@/app/lib/creators/creatorCatalogTypes";
import { isCreatorBackendPreviewApisEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import { validateLicenseSelection } from "@/app/lib/creators/creatorLicenseEngine";
import { creatorPreviewDisabled, creatorPreviewError, creatorPreviewOk, readCreatorPreviewJson } from "@/app/lib/creators/creatorPreviewApi";

export async function POST(request: Request) {
  if (!isCreatorBackendPreviewApisEnabled()) return creatorPreviewDisabled();
  try {
    const body = await readCreatorPreviewJson(request);
    const asset = getCreatorAsset(String(body.assetSlug || ""));
    if (!asset) return creatorPreviewError("CREATOR_ASSET_NOT_FOUND", "Creator asset was not found.", 404);
    const validation = validateLicenseSelection({
      asset,
      requestedLicense: (body.licenseType || body.selectedLicense || "personal") as CreatorLicenseType,
      cartLicense: body.cartLicense as CreatorLicenseType | undefined,
      subscriptionEnabled: Boolean(body.subscriptionEnabled),
    });
    return creatorPreviewOk(validation);
  } catch {
    return creatorPreviewError("CREATOR_INVALID_REQUEST", "Creator license validation request is invalid.");
  }
}
