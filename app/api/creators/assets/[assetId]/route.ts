import { getAsset } from "@/app/lib/creators/creatorCatalogRepository";
import { isCreatorBackendPreviewApisEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import { creatorPreviewDisabled, creatorPreviewError, creatorPreviewOk } from "@/app/lib/creators/creatorPreviewApi";

export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  if (!isCreatorBackendPreviewApisEnabled()) return creatorPreviewDisabled();
  const { assetId } = await params;
  const asset = await getAsset(assetId);
  if (!asset.data) return creatorPreviewError("CREATOR_ASSET_NOT_FOUND", "Creator asset was not found.", 404);
  return creatorPreviewOk(asset.data, { source: asset.source === "backend" ? "preview_service" : "static_fallback" });
}
