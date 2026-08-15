import { isCreatorBundlesEnabled, isCreatorCartEnabled, isCreatorCheckoutEnabled, isCreatorCollectionPurchaseEnabled } from "./creatorFeatureFlags";
import { buildCreatorCheckoutPreview, buildCreatorPurchaseSummary } from "./creatorCartPricing";
import { clearCreatorCart, getEmptyCreatorCart, readCreatorCart, writeCreatorCart } from "./creatorCartRepository";
import type { CreatorAsset, CreatorLicenseType } from "./creatorCatalogTypes";
import type {
  CreatorAddAssetToCartInput,
  CreatorAddCollectionToCartInput,
  CreatorCartLineItem,
  CreatorCartServiceResult,
  CreatorCartState,
  CreatorCartValidationIssue,
  CreatorCheckoutPreview,
  CreatorPurchaseSummary,
} from "./creatorCartTypes";

function chooseLicense(asset: CreatorAsset, selectedLicense?: CreatorLicenseType) {
  const licenseType = selectedLicense || asset.licenseOptions[0]?.type || asset.licenses[0];
  return asset.licenseOptions.find((option) => option.type === licenseType) || asset.licenseOptions[0];
}

function assetToLineItem(input: CreatorAddAssetToCartInput): CreatorCartLineItem | null {
  const licenseOption = chooseLicense(input.asset, input.selectedLicense);
  if (!licenseOption) return null;

  return {
    id: `asset:${input.asset.slug}:${licenseOption.type}`,
    itemType: "asset",
    assetSlug: input.asset.slug,
    title: input.asset.title,
    creatorSlug: input.asset.creatorSlug,
    creatorName: input.asset.creatorName,
    selectedLicense: licenseOption.type,
    licenseOption,
    quantity: 1,
    unitPrice: licenseOption.price,
    currency: input.asset.currency,
    source: input.source || "manual",
    previewQuery: input.asset.previewQuery,
  };
}

function withCartDisabledIssue<T>(data: T): CreatorCartServiceResult<T> {
  return {
    data,
    issues: [{ code: "cart_disabled", message: "Creator cart is disabled by feature flag." }],
  };
}

export function getCreatorCart(): CreatorCartServiceResult<CreatorCartState> {
  const cart = readCreatorCart();
  if (!isCreatorCartEnabled()) return withCartDisabledIssue(cart);
  return { data: cart, issues: [] };
}

export function addCreatorAssetToCart(input: CreatorAddAssetToCartInput): CreatorCartServiceResult<CreatorCartState> {
  const cart = readCreatorCart();
  if (!isCreatorCartEnabled()) return withCartDisabledIssue(cart);

  const item = assetToLineItem(input);
  if (!item) {
    return { data: cart, issues: [{ code: "invalid_license", message: "Selected Creator license is unavailable." }] };
  }

  if (cart.items.some((existing) => existing.id === item.id)) {
    return { data: cart, issues: [{ code: "duplicate_item", message: "Creator asset is already in the hidden cart.", itemId: item.id }] };
  }

  return { data: writeCreatorCart({ ...cart, items: [...cart.items, item] }), issues: [] };
}

export function addCreatorCollectionToCart(input: CreatorAddCollectionToCartInput): CreatorCartServiceResult<CreatorCartState> {
  const cart = readCreatorCart();
  if (!isCreatorCartEnabled()) return withCartDisabledIssue(cart);
  if (!isCreatorCollectionPurchaseEnabled()) {
    return { data: cart, issues: [{ code: "unsupported_collection", message: "Creator collection purchase is disabled by feature flag." }] };
  }

  const items = input.assets
    .map((asset) => assetToLineItem({ asset, selectedLicense: input.selectedLicense, source: "collection" }))
    .filter((item): item is CreatorCartLineItem => Boolean(item));

  const merged = [...cart.items];
  for (const item of items) {
    if (!merged.some((existing) => existing.id === item.id)) merged.push(item);
  }

  return { data: writeCreatorCart({ ...cart, items: merged }), issues: [] };
}

export function removeCreatorCartItem(itemId: string): CreatorCartServiceResult<CreatorCartState> {
  const cart = readCreatorCart();
  if (!isCreatorCartEnabled()) return withCartDisabledIssue(cart);
  return { data: writeCreatorCart({ ...cart, items: cart.items.filter((item) => item.id !== itemId) }), issues: [] };
}

export function resetCreatorCart(): CreatorCartServiceResult<CreatorCartState> {
  const cart = clearCreatorCart();
  if (!isCreatorCartEnabled()) return withCartDisabledIssue(cart);
  return { data: cart, issues: [] };
}

export function buildCreatorHiddenCheckoutPreview(couponCode?: string): CreatorCartServiceResult<CreatorCheckoutPreview> {
  const cart = isCreatorCartEnabled() ? readCreatorCart() : getEmptyCreatorCart();
  const preview = buildCreatorCheckoutPreview(cart, couponCode);
  const issues: CreatorCartValidationIssue[] = [...preview.validationIssues];

  if (!isCreatorCartEnabled()) issues.unshift({ code: "cart_disabled", message: "Creator cart is disabled by feature flag." });
  if (!isCreatorCheckoutEnabled()) issues.unshift({ code: "checkout_disabled", message: "Creator checkout is disabled by feature flag." });

  return {
    data: { ...preview, validationIssues: issues, checkoutAllowed: false, paymentAllowed: false, orderCreationAllowed: false },
    issues,
  };
}

export function getCreatorPurchaseSummary(cart: CreatorCartState = readCreatorCart()): CreatorPurchaseSummary {
  return buildCreatorPurchaseSummary(cart);
}

export function getCreatorBundleReadiness() {
  return {
    enabled: isCreatorBundlesEnabled(),
    mutationAllowed: false,
    message: "Creator bundle checkout is hidden foundation only.",
  };
}
