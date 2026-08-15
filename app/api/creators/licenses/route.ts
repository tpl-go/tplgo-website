import { getBackendCreatorLicenseDefinitions } from "@/app/lib/creators/creatorCatalogBackendClient";
import { isCreatorBackendPreviewApisEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import { getLicenseDefinitions } from "@/app/lib/creators/creatorLicenseEngine";
import { creatorPreviewDisabled, creatorPreviewOk } from "@/app/lib/creators/creatorPreviewApi";

export async function GET() {
  if (!isCreatorBackendPreviewApisEnabled()) return creatorPreviewDisabled();
  try {
    const backend = await getBackendCreatorLicenseDefinitions();
    if (backend) return creatorPreviewOk(backend.data, { source: backend.source === "backend" ? "preview_service" : "static_fallback" });
  } catch {
    // Preview API contract must remain available when the backend read service is unavailable.
  }
  return creatorPreviewOk({ definitions: getLicenseDefinitions() }, { source: "static_fallback" });
}
