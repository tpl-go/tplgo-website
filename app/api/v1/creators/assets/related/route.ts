import { creatorBackendReadDisabled, creatorBackendReadNotFound, creatorBackendReadOk, requireCreatorBackendCatalog } from "@/app/lib/creators/creatorBackendReadApi";
import { getCreatorBackendAsset, getCreatorBackendRelatedAssets } from "@/app/lib/creators/creatorBackendReadService";

export async function GET(request: Request) {
  if (!requireCreatorBackendCatalog()) return creatorBackendReadDisabled();
  const assetSlug = new URL(request.url).searchParams.get("assetSlug") || "";
  const asset = getCreatorBackendAsset(assetSlug);
  if (!asset.data) return creatorBackendReadNotFound("CREATOR_ASSET_NOT_FOUND", "Creator asset was not found.");
  return creatorBackendReadOk(getCreatorBackendRelatedAssets(asset.data));
}
