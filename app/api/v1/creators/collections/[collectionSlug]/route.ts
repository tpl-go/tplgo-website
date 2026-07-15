import { creatorBackendReadDisabled, creatorBackendReadNotFound, creatorBackendReadOk, filtersFromRequest, requireCreatorBackendCatalog } from "@/app/lib/creators/creatorBackendReadApi";
import { getCreatorBackendCollection, getCreatorBackendCollectionAssets } from "@/app/lib/creators/creatorBackendReadService";

export async function GET(request: Request, { params }: { params: Promise<{ collectionSlug: string }> }) {
  if (!requireCreatorBackendCatalog()) return creatorBackendReadDisabled();
  const { collectionSlug } = await params;
  const collection = getCreatorBackendCollection(collectionSlug);
  if (!collection.data) return creatorBackendReadNotFound("CREATOR_COLLECTION_NOT_FOUND", "Creator collection was not found.");
  return creatorBackendReadOk({
    collection,
    assets: getCreatorBackendCollectionAssets(collectionSlug, filtersFromRequest(request)),
  });
}
