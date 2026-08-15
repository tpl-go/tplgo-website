import { buildCreatorCheckoutPreview } from "@/app/lib/creators/creatorCartPricing";
import { isCreatorBackendPreviewApisEnabled, isCreatorCheckoutPreviewApiEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import { buildCreatorPreviewCart, creatorPreviewDisabled, creatorPreviewError, creatorPreviewOk, readCreatorPreviewJson, sanitizeCreatorPreviewData } from "@/app/lib/creators/creatorPreviewApi";

export async function POST(request: Request) {
  if (!isCreatorBackendPreviewApisEnabled() || !isCreatorCheckoutPreviewApiEnabled()) return creatorPreviewDisabled();
  try {
    const body = await readCreatorPreviewJson(request);
    const cart = buildCreatorPreviewCart(body);
    const preview = buildCreatorCheckoutPreview(cart, typeof body.couponCode === "string" ? body.couponCode : undefined);
    return creatorPreviewOk(sanitizeCreatorPreviewData(preview));
  } catch {
    return creatorPreviewError("CREATOR_INVALID_REQUEST", "Creator checkout preview request is invalid.");
  }
}
