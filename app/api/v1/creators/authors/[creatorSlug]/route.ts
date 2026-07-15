import { creatorBackendReadDisabled, creatorBackendReadNotFound, creatorBackendReadOk, filtersFromRequest, requireCreatorBackendCatalog } from "@/app/lib/creators/creatorBackendReadApi";
import { getCreatorBackendProfile, getCreatorBackendProfileAssets } from "@/app/lib/creators/creatorBackendReadService";

export async function GET(request: Request, { params }: { params: Promise<{ creatorSlug: string }> }) {
  if (!requireCreatorBackendCatalog()) return creatorBackendReadDisabled();
  const { creatorSlug } = await params;
  const profile = getCreatorBackendProfile(creatorSlug);
  if (!profile.data) return creatorBackendReadNotFound("CREATOR_PROFILE_NOT_FOUND", "Creator profile was not found.");
  return creatorBackendReadOk({
    profile,
    assets: getCreatorBackendProfileAssets(creatorSlug, filtersFromRequest(request)),
  });
}
