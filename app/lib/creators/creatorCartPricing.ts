import type {
  CreatorCartLineItem,
  CreatorCartState,
  CreatorCheckoutPreview,
  CreatorCouponPlaceholder,
  CreatorPriceBreakup,
  CreatorPurchaseSummary,
  CreatorTaxPlaceholder,
  CreatorWalletEligibilityPlaceholder,
} from "./creatorCartTypes";
import { getCreatorAsset } from "./creatorCatalogService";
import { canAccessVersion, canRequestRefund } from "./creatorEntitlementPolicy";
import { previewEntitlement } from "./creatorEntitlementService";
import { previewLicenseCertificate } from "./creatorLicenseCertificate";
import { validateLicenseSelection } from "./creatorLicenseEngine";

export const creatorTaxPlaceholder: CreatorTaxPlaceholder = {
  taxAmount: 0,
  taxRate: 0,
  label: "Tax calculation pending backend policy",
};

export const creatorWalletEligibilityPlaceholder: CreatorWalletEligibilityPlaceholder = {
  eligible: false,
  walletTypes: [],
  reason: "future_policy",
};

export function buildCreatorCouponPlaceholder(code?: string): CreatorCouponPlaceholder {
  return {
    code,
    eligible: false,
    discountAmount: 0,
    reason: "future_scope",
  };
}

export function calculateCreatorCartPrice(items: CreatorCartLineItem[]): CreatorPriceBreakup {
  const subtotal = items.reduce((total, item) => total + item.unitPrice, 0);
  const discountAmount = 0;
  const taxableAmount = Math.max(subtotal - discountAmount, 0);
  const taxAmount = creatorTaxPlaceholder.taxAmount;

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    walletEligibleAmount: 0,
    grandTotal: taxableAmount + taxAmount,
    currency: "INR",
  };
}

export function buildCreatorPurchaseSummary(cart: CreatorCartState): CreatorPurchaseSummary {
  return {
    itemCount: cart.items.length,
    assetCount: cart.items.filter((item) => item.itemType === "asset").length,
    bundleCount: cart.items.filter((item) => item.itemType === "bundle").length,
    collectionCount: cart.items.filter((item) => item.itemType === "collection").length,
    selectedLicenses: Array.from(new Set(cart.items.map((item) => item.selectedLicense))),
    total: calculateCreatorCartPrice(cart.items).grandTotal,
    currency: "INR",
  };
}

export function buildCreatorCheckoutPreview(cart: CreatorCartState, couponCode?: string): CreatorCheckoutPreview {
  const resolvedLicenses = [];
  const entitlementPreviews = [];
  const versionAccessPreviews = [];
  const refundRestrictionPreviews = [];
  const certificatePreviews = [];

  for (const item of cart.items) {
    if (!item.assetSlug) continue;
    const asset = getCreatorAsset(item.assetSlug);
    if (!asset) continue;

    const resolvedLicense = validateLicenseSelection({
      asset,
      requestedLicense: item.selectedLicense,
      cartLicense: item.selectedLicense,
      subscriptionEnabled: false,
    });
    const entitlement = previewEntitlement(asset, resolvedLicense);

    resolvedLicenses.push(resolvedLicense);
    entitlementPreviews.push(entitlement);
    versionAccessPreviews.push(canAccessVersion(entitlement, asset.version, asset.version));
    refundRestrictionPreviews.push(canRequestRefund(entitlement));
    certificatePreviews.push(previewLicenseCertificate(asset, entitlement, resolvedLicense));
  }

  return {
    previewId: `creator-preview-${cart.id}`,
    cartId: cart.id,
    items: cart.items,
    price: calculateCreatorCartPrice(cart.items),
    tax: creatorTaxPlaceholder,
    coupon: buildCreatorCouponPlaceholder(couponCode),
    wallet: creatorWalletEligibilityPlaceholder,
    validationIssues: cart.items.length ? [] : [{ code: "empty_cart", message: "Cart has no Creator assets." }],
    licenseValidationIssues: resolvedLicenses.flatMap((license) => license.issues),
    resolvedLicenses,
    entitlementPreviews,
    versionAccessPreviews,
    refundRestrictionPreviews,
    certificatePreviews,
    checkoutAllowed: false,
    paymentAllowed: false,
    orderCreationAllowed: false,
    entitlementCreationAllowed: false,
    downloadAllowed: false,
    backendReady: true,
    generatedAt: new Date().toISOString(),
  };
}
