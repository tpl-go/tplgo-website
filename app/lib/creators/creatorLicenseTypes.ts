import type { CreatorAsset, CreatorLicenseType } from "./creatorCatalogTypes";

export type CreatorLicenseValidityMode = "perpetual" | "time_limited" | "subscription" | "enterprise_review";

export type CreatorVersionAccessPolicy =
  | "purchased_version_only"
  | "minor_updates"
  | "all_updates_during_support"
  | "latest_version_during_subscription"
  | "perpetual_latest_at_purchase"
  | "custom";

export type CreatorLicenseDefinition = {
  licenseType: CreatorLicenseType;
  displayName: string;
  description: string;
  allowedUses: string[];
  prohibitedUses: string[];
  seatLimit: number | "custom";
  projectLimit: number | "unlimited" | "custom";
  endProductLimit: number | "unlimited" | "custom";
  distributionLimit: string;
  resaleAllowed: boolean;
  modificationAllowed: boolean;
  attributionRequired: boolean;
  geographicRestrictions: string[];
  validityMode: CreatorLicenseValidityMode;
  validityDuration: string | null;
  accessWindow: string;
  downloadLimit: number | "custom";
  versionAccessPolicy: CreatorVersionAccessPolicy;
  supportPeriod: string;
  commercialUseAllowed: boolean;
  editorialUseOnly: boolean;
  customTermsRequired: boolean;
  priceMultiplier: number | null;
  policyReviewRequired: boolean;
  legalDisclaimer: string;
};

export type CreatorLicenseValidationIssue = {
  code:
    | "license_engine_disabled"
    | "asset_license_unsupported"
    | "editorial_asset_required"
    | "subscription_disabled"
    | "enterprise_request_only"
    | "invalid_seat_limit"
    | "invalid_project_limit"
    | "invalid_download_limit"
    | "invalid_validity_window"
    | "price_resolution_unavailable"
    | "cart_license_mismatch";
  message: string;
};

export type CreatorLicenseValidationInput = {
  asset: CreatorAsset;
  requestedLicense: CreatorLicenseType;
  cartLicense?: CreatorLicenseType;
  subscriptionEnabled?: boolean;
};

export type CreatorResolvedLicense = {
  licenseId: string;
  licenseType: CreatorLicenseType;
  licenseVersion: string;
  definition: CreatorLicenseDefinition;
  resolvedPrice: number | null;
  currency: "INR";
  assetSupportsLicense: boolean;
  issues: CreatorLicenseValidationIssue[];
};

export type CreatorLicenseCertificatePreview = {
  certificateId: string;
  orderId: string;
  orderItemId: string;
  entitlementId: string;
  buyerUserId: string;
  assetId: string;
  assetTitleSnapshot: string;
  creatorId: string;
  creatorNameSnapshot: string;
  licenseType: CreatorLicenseType;
  licenseVersion: string;
  issuedAt: string;
  validFrom: string;
  validUntil: string | null;
  permittedUseSummary: string[];
  restrictionsSummary: string[];
  certificateStatus: "preview_only" | "issued" | "revoked";
  verificationCode: string;
  metadata: Record<string, unknown>;
};
