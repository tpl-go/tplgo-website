import { isCreatorBundlesEnabled, isCreatorCollectionPurchaseEnabled, isCreatorOrderEngineEnabled, isCreatorTransactionEngineEnabled } from "./creatorFeatureFlags";
import type { CreatorCheckoutPreview } from "./creatorCartTypes";
import type { CreatorOrderValidationIssue } from "./creatorOrderTypes";

export function validateCreatorCheckoutForOrder(checkoutPreview: CreatorCheckoutPreview): CreatorOrderValidationIssue[] {
  const issues: CreatorOrderValidationIssue[] = [];

  if (!isCreatorOrderEngineEnabled()) {
    issues.push({ code: "order_engine_disabled", message: "Creator order engine is disabled by feature flag." });
  }

  if (!isCreatorTransactionEngineEnabled()) {
    issues.push({ code: "transaction_engine_disabled", message: "Creator transaction engine is disabled by feature flag." });
  }

  if (!checkoutPreview.items.length) {
    issues.push({ code: "empty_cart", message: "Creator checkout preview contains no items." });
  }

  const assetKeys = new Set<string>();
  for (const item of checkoutPreview.items) {
    if (item.itemType === "asset" && !item.assetSlug) {
      issues.push({ code: "asset_missing", message: "Creator cart item is missing an asset reference.", itemId: item.id });
    }
    if (item.itemType === "bundle" && !isCreatorBundlesEnabled()) {
      issues.push({ code: "bundle_not_enabled", message: "Creator bundle orders are disabled.", itemId: item.id });
    }
    if (item.itemType === "collection" && !isCreatorCollectionPurchaseEnabled()) {
      issues.push({ code: "collection_not_enabled", message: "Creator collection purchase is disabled.", itemId: item.id });
    }
    const key = `${item.assetSlug || item.bundleSlug || item.collectionSlug}:${item.selectedLicense}`;
    if (assetKeys.has(key)) {
      issues.push({ code: "duplicate_asset", message: "Duplicate Creator asset/license combination found.", itemId: item.id });
    }
    assetKeys.add(key);
  }

  if (checkoutPreview.licenseValidationIssues.length) {
    issues.push({ code: "unsupported_license", message: "Creator checkout has unresolved license validation issues." });
  }

  if (checkoutPreview.checkoutAllowed || checkoutPreview.paymentAllowed || checkoutPreview.orderCreationAllowed || checkoutPreview.entitlementCreationAllowed || checkoutPreview.downloadAllowed) {
    issues.push({ code: "checkout_preview_invalid", message: "Creator hidden checkout preview must keep all transaction permissions disabled." });
  }

  return issues;
}
