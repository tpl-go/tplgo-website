import type { CreatorAsset, CreatorCollection, CreatorLicenseOption, CreatorLicenseType } from "./creatorCatalogTypes";
import type { CreatorEntitlement, CreatorEntitlementPolicyDecision } from "./creatorEntitlementTypes";
import type { CreatorLicenseCertificatePreview, CreatorLicenseValidationIssue, CreatorResolvedLicense } from "./creatorLicenseTypes";

export type CreatorCartItemType = "asset" | "bundle" | "collection";

export type CreatorCartItemSource = "manual" | "bundle" | "collection" | "restore";

export type CreatorCartPersistenceMode = "session";

export type CreatorCartLineItem = {
  id: string;
  itemType: CreatorCartItemType;
  assetSlug?: string;
  bundleSlug?: string;
  collectionSlug?: string;
  title: string;
  creatorSlug?: string;
  creatorName?: string;
  selectedLicense: CreatorLicenseType;
  licenseOption: CreatorLicenseOption;
  quantity: 1;
  unitPrice: number;
  currency: "INR";
  source: CreatorCartItemSource;
  previewQuery?: string;
  metadata?: Record<string, unknown>;
};

export type CreatorCartState = {
  id: string;
  items: CreatorCartLineItem[];
  persistence: CreatorCartPersistenceMode;
  updatedAt: string;
  schemaVersion: 1;
};

export type CreatorCartValidationIssue = {
  code:
    | "cart_disabled"
    | "checkout_disabled"
    | "empty_cart"
    | "invalid_license"
    | "duplicate_item"
    | "unsupported_bundle"
    | "unsupported_collection"
    | "asset_unavailable";
  message: string;
  itemId?: string;
};

export type CreatorPriceBreakup = {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  walletEligibleAmount: number;
  grandTotal: number;
  currency: "INR";
};

export type CreatorCouponPlaceholder = {
  code?: string;
  eligible: false;
  discountAmount: 0;
  reason: "future_scope";
};

export type CreatorTaxPlaceholder = {
  taxAmount: 0;
  taxRate: 0;
  label: "Tax calculation pending backend policy";
};

export type CreatorWalletEligibilityPlaceholder = {
  eligible: false;
  walletTypes: [];
  reason: "future_policy";
};

export type CreatorCheckoutPreviewInput = {
  cart: CreatorCartState;
  couponCode?: string;
};

export type CreatorCheckoutPreview = {
  previewId: string;
  cartId: string;
  items: CreatorCartLineItem[];
  price: CreatorPriceBreakup;
  tax: CreatorTaxPlaceholder;
  coupon: CreatorCouponPlaceholder;
  wallet: CreatorWalletEligibilityPlaceholder;
  validationIssues: CreatorCartValidationIssue[];
  licenseValidationIssues: CreatorLicenseValidationIssue[];
  resolvedLicenses: CreatorResolvedLicense[];
  entitlementPreviews: CreatorEntitlement[];
  versionAccessPreviews: CreatorEntitlementPolicyDecision[];
  refundRestrictionPreviews: CreatorEntitlementPolicyDecision[];
  certificatePreviews: CreatorLicenseCertificatePreview[];
  checkoutAllowed: false;
  paymentAllowed: false;
  orderCreationAllowed: false;
  entitlementCreationAllowed: false;
  downloadAllowed: false;
  backendReady: true;
  generatedAt: string;
};

export type CreatorPurchaseSummary = {
  itemCount: number;
  assetCount: number;
  bundleCount: number;
  collectionCount: number;
  selectedLicenses: CreatorLicenseType[];
  total: number;
  currency: "INR";
};

export type CreatorAddAssetToCartInput = {
  asset: CreatorAsset;
  selectedLicense?: CreatorLicenseType;
  source?: CreatorCartItemSource;
};

export type CreatorAddCollectionToCartInput = {
  collection: CreatorCollection;
  assets: CreatorAsset[];
  selectedLicense?: CreatorLicenseType;
};

export type CreatorCartServiceResult<T> = {
  data: T;
  issues: CreatorCartValidationIssue[];
};
