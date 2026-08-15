import { getCatalog } from "@/app/lib/creators/creatorCatalogRepository";
import { isCreatorBackendPreviewApisEnabled, isCreatorCatalogEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import { creatorPreviewDisabled, creatorPreviewOk } from "@/app/lib/creators/creatorPreviewApi";

export async function GET() {
  if (!isCreatorCatalogEnabled() && !isCreatorBackendPreviewApisEnabled()) return creatorPreviewDisabled();

  const catalog = await getCatalog();

  return creatorPreviewOk(
    {
      ...catalog.data,
      source: catalog.source,
      fallbackError: catalog.error,
      phase: "creator_catalog_phase_9_preview_api",
    },
    { source: catalog.source === "backend" ? "preview_service" : "static_fallback" }
  );
}
