import { isCreatorPaymentEngineEnabled, isCreatorPaymentProviderEnabled } from "./creatorFeatureFlags";
import type { CreatorDraftOrder } from "./creatorOrderTypes";
import type { CreatorCurrencyCode, CreatorPaymentProvider, CreatorPaymentValidationIssue } from "./creatorPaymentTypes";

export function validateCreatorPaymentPreviewInput({
  draftOrder,
  amount,
  currency,
  provider,
}: {
  draftOrder: CreatorDraftOrder;
  amount: number;
  currency: CreatorCurrencyCode;
  provider: CreatorPaymentProvider;
}): CreatorPaymentValidationIssue[] {
  const issues: CreatorPaymentValidationIssue[] = [];

  if (!isCreatorPaymentEngineEnabled()) {
    issues.push({ code: "payment_engine_disabled", message: "Creator payment engine is disabled by feature flag." });
  }

  if (!isCreatorPaymentProviderEnabled()) {
    issues.push({ code: "provider_disabled", message: `Creator payment provider ${provider} is disabled by feature flag.` });
  }

  if (currency !== "INR") {
    issues.push({ code: "invalid_currency", message: "Creator payment foundation currently supports INR only." });
  }

  if (!Number.isFinite(amount) || amount < 0) {
    issues.push({ code: "invalid_amount", message: "Creator payment amount must be a non-negative finite number." });
  }

  if (amount !== draftOrder.pricingSnapshot.grandTotal) {
    issues.push({ code: "pricing_snapshot_mismatch", message: "Creator payment amount must match the order preview pricing snapshot." });
  }

  if (draftOrder.selectedLicenses.some((license) => license.issues.length > 0)) {
    issues.push({ code: "license_validation_failed", message: "Creator payment preview cannot proceed with unresolved license validation issues." });
  }

  if (draftOrder.paymentPreview.paymentIntentPreviewId) {
    issues.push({ code: "duplicate_payment_metadata", message: "Creator draft order already contains payment preview metadata." });
  }

  if (
    draftOrder.transactionPermissions.paymentAllowed ||
    draftOrder.transactionPermissions.orderPersistenceAllowed ||
    draftOrder.transactionPermissions.entitlementActivationAllowed ||
    draftOrder.transactionPermissions.downloadAllowed
  ) {
    issues.push({ code: "order_preview_invalid", message: "Creator hidden order preview must keep all transaction permissions disabled." });
  }

  return issues;
}
