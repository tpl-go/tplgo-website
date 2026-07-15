function envFlag(name: string) {
  return process.env[name] === "true";
}

export function isCreatorCatalogEnabled() {
  return process.env["NEXT_PUBLIC_TPL_CREATOR_PUBLIC_CATALOG"] !== "false";
}

export function isCreatorDebugEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_DEBUG_PAYLOADS");
}

export function isCreatorAdvancedAssetDetailEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_ADVANCED_ASSET_DETAIL");
}

export function isCreatorAdvancedSearchEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_ADVANCED_SEARCH");
}

export function isCreatorMediaPreviewsEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_MEDIA_PREVIEWS");
}

export function isCreatorLicenseCompareEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_LICENSE_COMPARE");
}

export function isCreatorBackendCatalogEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_BACKEND_CATALOG") || (envFlag("NEXT_PUBLIC_TPL_CREATOR_INTEGRATION_ENABLED") && envFlag("NEXT_PUBLIC_TPL_CREATOR_TEST_API_ENABLED") && envFlag("NEXT_PUBLIC_TPL_CREATOR_PUBLIC_CATALOG_API_ENABLED"));
}

export function isCreatorCartEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_CART");
}

export function isCreatorCheckoutEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_CHECKOUT");
}

export function isCreatorLicenseSelectionEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_LICENSE_SELECTION");
}

export function isCreatorBundlesEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_BUNDLES");
}

export function isCreatorCollectionPurchaseEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_COLLECTION_PURCHASE");
}

export function isCreatorLicenseEngineEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_LICENSE_ENGINE");
}

export function isCreatorEntitlementsEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_ENTITLEMENTS");
}

export function isCreatorLicenseCertificatesEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_LICENSE_CERTIFICATES");
}

export function isCreatorVersionAccessEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_VERSION_ACCESS");
}

export function isCreatorOrderEngineEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_ORDER_ENGINE");
}

export function isCreatorTransactionEngineEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_TRANSACTION_ENGINE");
}

export function isCreatorPaymentEngineEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_PAYMENT_ENGINE");
}

export function isCreatorPaymentProviderEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_PAYMENT_PROVIDER");
}

export function isCreatorEntitlementActivationEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_ENTITLEMENT_ACTIVATION");
}

export function isCreatorSecureDownloadsEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_SECURE_DOWNLOADS");
}

export function isCreatorDownloadTokensEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_DOWNLOAD_TOKENS");
}

export function isCreatorSignedUrlsEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_SIGNED_URLS");
}

export function isCreatorVersionDeliveryEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_VERSION_DELIVERY");
}

export function isCreatorBackendPreviewApisEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_BACKEND_PREVIEW_APIS");
}

export function isCreatorCheckoutPreviewApiEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_CHECKOUT_PREVIEW_API");
}

export function isCreatorOrderPreviewApiEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_ORDER_PREVIEW_API");
}

export function isCreatorPaymentPreviewApiEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_PAYMENT_PREVIEW_API");
}

export function isCreatorEntitlementPreviewApiEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_ENTITLEMENT_PREVIEW_API");
}

export function isCreatorDownloadPreviewApiEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_DOWNLOAD_PREVIEW_API");
}

export function isCreatorWorkspaceEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_WORKSPACE");
}

export function isCreatorDashboardEnabled() {
  return isCreatorWorkspaceEnabled() && envFlag("NEXT_PUBLIC_TPL_CREATOR_DASHBOARD");
}

export function isCreatorOnboardingEnabled() {
  return isCreatorWorkspaceEnabled() && envFlag("NEXT_PUBLIC_TPL_CREATOR_ONBOARDING");
}

export function isCreatorAssetManagerEnabled() {
  return isCreatorWorkspaceEnabled() && envFlag("NEXT_PUBLIC_TPL_CREATOR_ASSET_MANAGER");
}

export function isCreatorAssetWizardEnabled() {
  return isCreatorWorkspaceEnabled() && envFlag("NEXT_PUBLIC_TPL_CREATOR_ASSET_WIZARD");
}

export function isCreatorUploadsEnabled() {
  return isCreatorWorkspaceEnabled() && envFlag("NEXT_PUBLIC_TPL_CREATOR_UPLOADS");
}

export function isCreatorAnalyticsEnabled() {
  return isCreatorWorkspaceEnabled() && envFlag("NEXT_PUBLIC_TPL_CREATOR_ANALYTICS");
}

export function isCreatorEarningsEnabled() {
  return isCreatorWorkspaceEnabled() && envFlag("NEXT_PUBLIC_TPL_CREATOR_EARNINGS");
}

export function isCreatorAdminEnabled() {
  return envFlag("NEXT_PUBLIC_TPL_CREATOR_ADMIN");
}

export function isCreatorAdminDashboardEnabled() {
  return isCreatorAdminEnabled() && envFlag("NEXT_PUBLIC_TPL_CREATOR_ADMIN_DASHBOARD");
}

export function isCreatorAdminOnboardingEnabled() {
  return isCreatorAdminEnabled() && envFlag("NEXT_PUBLIC_TPL_CREATOR_ADMIN_ONBOARDING");
}

export function isCreatorAdminModerationEnabled() {
  return isCreatorAdminEnabled() && envFlag("NEXT_PUBLIC_TPL_CREATOR_ADMIN_MODERATION");
}

export function isCreatorAdminCopyrightEnabled() {
  return isCreatorAdminEnabled() && envFlag("NEXT_PUBLIC_TPL_CREATOR_ADMIN_COPYRIGHT");
}

export function isCreatorAdminOrdersEnabled() {
  return isCreatorAdminEnabled() && envFlag("NEXT_PUBLIC_TPL_CREATOR_ADMIN_ORDERS");
}

export function isCreatorAdminEntitlementsEnabled() {
  return isCreatorAdminEnabled() && envFlag("NEXT_PUBLIC_TPL_CREATOR_ADMIN_ENTITLEMENTS");
}

export function isCreatorAdminEarningsEnabled() {
  return isCreatorAdminEnabled() && envFlag("NEXT_PUBLIC_TPL_CREATOR_ADMIN_EARNINGS");
}

export function isCreatorAdminRiskEnabled() {
  return isCreatorAdminEnabled() && envFlag("NEXT_PUBLIC_TPL_CREATOR_ADMIN_RISK");
}

export function isCreatorAdminAnalyticsEnabled() {
  return isCreatorAdminEnabled() && envFlag("NEXT_PUBLIC_TPL_CREATOR_ADMIN_ANALYTICS");
}
