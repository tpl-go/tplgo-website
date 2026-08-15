import { buildCreatorCheckoutPreview } from "@/app/lib/creators/creatorCartPricing";
import { isCreatorBackendPreviewApisEnabled, isCreatorOrderPreviewApiEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import { createCreatorOrderPreview } from "@/app/lib/creators/creatorOrderOrchestration";
import { buildCreatorPreviewCart, creatorPreviewDisabled, creatorPreviewError, creatorPreviewOk, readCreatorPreviewJson, sanitizeCreatorPreviewData } from "@/app/lib/creators/creatorPreviewApi";

export async function POST(request: Request) {
  if (!isCreatorBackendPreviewApisEnabled() || !isCreatorOrderPreviewApiEnabled()) return creatorPreviewDisabled();
  try {
    const body = await readCreatorPreviewJson(request);
    const checkoutPreview = body.checkoutPreview && typeof body.checkoutPreview === "object"
      ? body.checkoutPreview
      : buildCreatorCheckoutPreview(buildCreatorPreviewCart(body));
    const order = createCreatorOrderPreview({
      checkoutPreview: checkoutPreview as Parameters<typeof createCreatorOrderPreview>[0]["checkoutPreview"],
      buyerUserId: typeof body.buyerUserId === "string" ? body.buyerUserId : undefined,
      idempotencySeed: typeof body.idempotencySeed === "string" ? body.idempotencySeed : undefined,
    });
    return creatorPreviewOk(sanitizeCreatorPreviewData(order));
  } catch {
    return creatorPreviewError("CREATOR_INVALID_REQUEST", "Creator order preview request is invalid.");
  }
}
