import { creatorBackendReadDisabled, creatorBackendReadNotFound, creatorBackendReadOk, requireCreatorBackendCatalog } from "@/app/lib/creators/creatorBackendReadApi";
import { getCreatorBackendAsset } from "@/app/lib/creators/creatorBackendReadService";

export async function GET(_request: Request, { params }: { params: Promise<{ assetSlug: string }> }) {
  if (!requireCreatorBackendCatalog()) return creatorBackendReadDisabled();
  const { assetSlug } = await params;
  const result = getCreatorBackendAsset(assetSlug);
  if (!result.data) return creatorBackendReadNotFound("CREATOR_ASSET_NOT_FOUND", "Creator asset was not found.");
  return creatorBackendReadOk(result);
}
