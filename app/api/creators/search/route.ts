import { searchAssets } from "@/app/lib/creators/creatorCatalogRepository";
import { isCreatorBackendPreviewApisEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import { creatorPreviewDisabled, creatorPreviewOk } from "@/app/lib/creators/creatorPreviewApi";
import type { CreatorCatalogFilters } from "@/app/lib/creators/creatorCatalogTypes";

export async function GET(request: Request) {
  if (!isCreatorBackendPreviewApisEnabled()) return creatorPreviewDisabled();
  const url = new URL(request.url);
  const filters: CreatorCatalogFilters = Object.fromEntries(url.searchParams.entries());
  const result = await searchAssets(filters);
  return creatorPreviewOk(result.data, { source: result.source === "backend" ? "preview_service" : "static_fallback" });
}
