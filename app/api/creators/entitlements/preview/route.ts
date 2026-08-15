import { buildEntitlementActivationPreview } from "@/app/lib/creators/creatorEntitlementActivation";
import { isCreatorBackendPreviewApisEnabled, isCreatorEntitlementPreviewApiEnabled } from "@/app/lib/creators/creatorFeatureFlags";
import type { CreatorPaymentStatus } from "@/app/lib/creators/creatorPaymentTypes";
import { buildCreatorPreviewEntitlement, creatorPreviewDisabled, creatorPreviewError, creatorPreviewOk, readCreatorPreviewJson, sanitizeCreatorPreviewData } from "@/app/lib/creators/creatorPreviewApi";

export async function POST(request: Request) {
  if (!isCreatorBackendPreviewApisEnabled() || !isCreatorEntitlementPreviewApiEnabled()) return creatorPreviewDisabled();
  try {
    const body = await readCreatorPreviewJson(request);
    const entitlement = buildCreatorPreviewEntitlement(body);
    const activation = buildEntitlementActivationPreview({
      entitlement,
      paymentStatus: (body.paymentStatus || "payment_captured") as CreatorPaymentStatus,
      buyerUserId: entitlement.buyerUserId,
      orderId: entitlement.orderId,
      orderItemId: entitlement.orderItemId,
      assetId: entitlement.assetId,
      assetVersionId: entitlement.assetVersionId,
      licenseId: entitlement.licenseId,
    });
    return creatorPreviewOk(sanitizeCreatorPreviewData({ entitlement, activation, accessGranted: false, persistenceAllowed: false }));
  } catch {
    return creatorPreviewError("CREATOR_INVALID_REQUEST", "Creator entitlement preview request is invalid.");
  }
}
