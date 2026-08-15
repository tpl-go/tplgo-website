import { buildCreatorCheckoutPreview } from "@/app/lib/creators/creatorCartPricing";
import { isCreatorBackendPreviewApisEnabled, isCreatorPaymentPreviewApiEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import { createCreatorOrderPreview } from "@/app/lib/creators/creatorOrderOrchestration";
import { createCreatorPaymentPreview } from "@/app/lib/creators/creatorPaymentPreviewService";
import type { CreatorPaymentMethodType, CreatorPaymentProvider } from "@/app/lib/creators/creatorPaymentTypes";
import { buildCreatorPreviewCart, creatorPreviewDisabled, creatorPreviewError, creatorPreviewOk, readCreatorPreviewJson, sanitizeCreatorPreviewData } from "@/app/lib/creators/creatorPreviewApi";

export async function POST(request: Request) {
  if (!isCreatorBackendPreviewApisEnabled() || !isCreatorPaymentPreviewApiEnabled()) return creatorPreviewDisabled();
  try {
    const body = await readCreatorPreviewJson(request);
    const draftOrder = body.draftOrder && typeof body.draftOrder === "object"
      ? body.draftOrder
      : createCreatorOrderPreview({ checkoutPreview: buildCreatorCheckoutPreview(buildCreatorPreviewCart(body)), buyerUserId: String(body.buyerUserId || "creator_preview_buyer") }).draftOrder;
    const payment = createCreatorPaymentPreview({
      draftOrder: draftOrder as Parameters<typeof createCreatorPaymentPreview>[0]["draftOrder"],
      provider: (body.provider || "mock") as CreatorPaymentProvider,
      paymentMethod: (body.paymentMethod || "mock") as CreatorPaymentMethodType,
    });
    return creatorPreviewOk(sanitizeCreatorPreviewData(payment));
  } catch {
    return creatorPreviewError("CREATOR_INVALID_REQUEST", "Creator payment preview request is invalid.");
  }
}
