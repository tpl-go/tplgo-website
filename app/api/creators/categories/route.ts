import { getCategories } from "@/app/lib/creators/creatorCatalogRepository";
import { isCreatorBackendPreviewApisEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import { creatorPreviewDisabled, creatorPreviewOk } from "@/app/lib/creators/creatorPreviewApi";

export async function GET() {
  if (!isCreatorBackendPreviewApisEnabled()) return creatorPreviewDisabled();
  const categories = await getCategories();
  return creatorPreviewOk(categories.data, { source: categories.source === "backend" ? "preview_service" : "static_fallback" });
}
