import { createCreatorDownloadPreview } from "@/app/lib/creators/creatorDownloadPreviewService";
import type { CreatorMalwareScanStatus, CreatorStorageProviderName } from "@/app/lib/creators/creatorDownloadTypes";
import { isCreatorBackendPreviewApisEnabled, isCreatorDownloadPreviewApiEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import { buildCreatorPreviewEntitlement, creatorPreviewDisabled, creatorPreviewError, creatorPreviewOk, readCreatorPreviewJson, sanitizeCreatorPreviewData } from "@/app/lib/creators/creatorPreviewApi";

export async function POST(request: Request) {
  if (!isCreatorBackendPreviewApisEnabled() || !isCreatorDownloadPreviewApiEnabled()) return creatorPreviewDisabled();
  try {
    const body = await readCreatorPreviewJson(request);
    const entitlement = buildCreatorPreviewEntitlement(body);
    const preview = createCreatorDownloadPreview({
      entitlement,
      buyerUserId: String(body.buyerUserId || entitlement.buyerUserId),
      fileId: String(body.fileId || "creator_preview_file_1"),
      requestedVersionId: String(body.requestedVersionId || entitlement.assetVersionId),
      latestVersionId: String(body.latestVersionId || entitlement.assetVersionId),
      provider: (body.provider || "mock") as CreatorStorageProviderName,
      malwareStatus: (body.malwareStatus || "not_requested") as CreatorMalwareScanStatus,
      fileAvailable: body.fileAvailable !== false,
      assetAvailable: body.assetAvailable !== false,
    });
    return creatorPreviewOk(sanitizeCreatorPreviewData(preview));
  } catch {
    return creatorPreviewError("CREATOR_INVALID_REQUEST", "Creator download authorization preview request is invalid.");
  }
}
