import { getCreator } from "@/app/lib/creators/creatorCatalogRepository";
import { isCreatorBackendPreviewApisEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import { creatorPreviewDisabled, creatorPreviewError, creatorPreviewOk } from "@/app/lib/creators/creatorPreviewApi";

export async function GET(_request: Request, { params }: { params: Promise<{ creatorId: string }> }) {
  if (!isCreatorBackendPreviewApisEnabled()) return creatorPreviewDisabled();
  const { creatorId } = await params;
  const creator = await getCreator(creatorId);
  if (!creator.data) return creatorPreviewError("CREATOR_PROFILE_NOT_FOUND", "Creator profile was not found.", 404);
  return creatorPreviewOk(creator.data, { source: creator.source === "backend" ? "preview_service" : "static_fallback" });
}
