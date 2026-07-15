import { creatorBackendReadDisabled, creatorBackendReadNotFound, creatorBackendReadOk, requireCreatorBackendCatalog } from "@/app/lib/creators/creatorBackendReadApi";
import { getCreatorBackendCategory } from "@/app/lib/creators/creatorBackendReadService";

export async function GET(_request: Request, { params }: { params: Promise<{ categorySlug: string }> }) {
  if (!requireCreatorBackendCatalog()) return creatorBackendReadDisabled();
  const { categorySlug } = await params;
  const result = getCreatorBackendCategory(categorySlug);
  if (!result.data) return creatorBackendReadNotFound("CREATOR_CATEGORY_NOT_FOUND", "Creator category was not found.");
  return creatorBackendReadOk(result);
}
