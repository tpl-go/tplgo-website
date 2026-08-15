import { getAssetsForCollection, getCollection } from "@/app/lib/creators/creatorCatalogRepository";
import { isCreatorBackendPreviewApisEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import { creatorPreviewDisabled, creatorPreviewError, creatorPreviewOk } from "@/app/lib/creators/creatorPreviewApi";

export async function GET(_request: Request, { params }: { params: Promise<{ collectionId: string }> }) {
  if (!isCreatorBackendPreviewApisEnabled()) return creatorPreviewDisabled();
  const { collectionId } = await params;
  const collection = await getCollection(collectionId);
  if (!collection.data) return creatorPreviewError("CREATOR_COLLECTION_NOT_FOUND", "Creator collection was not found.", 404);
  const assets = await getAssetsForCollection(collectionId);
  return creatorPreviewOk({ collection: collection.data, assets: assets.data.assets }, { source: collection.source === "backend" ? "preview_service" : "static_fallback" });
}
