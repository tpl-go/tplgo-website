import { getCollections } from "@/app/lib/creators/creatorCatalogRepository";
import { isCreatorBackendPreviewApisEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import { creatorPreviewDisabled, creatorPreviewOk } from "@/app/lib/creators/creatorPreviewApi";

export async function GET() {
  if (!isCreatorBackendPreviewApisEnabled()) return creatorPreviewDisabled();
  const collections = await getCollections();
  return creatorPreviewOk(collections.data, { source: collections.source === "backend" ? "preview_service" : "static_fallback" });
}
