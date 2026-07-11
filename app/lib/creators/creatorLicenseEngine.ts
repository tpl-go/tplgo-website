import { isCreatorLicenseEngineEnabled } from "./creatorFeatureFlags";
import { creatorLicenseDefinitions } from "./creatorLicenseDefinitions";
import type { CreatorAsset, CreatorLicenseOption, CreatorLicenseType } from "./creatorCatalogTypes";
import type { CreatorLicenseValidationInput, CreatorLicenseValidationIssue, CreatorResolvedLicense } from "./creatorLicenseTypes";

const LICENSE_ENGINE_VERSION = "creator-license-policy-v1";

export function normalizeCreatorLicenseType(licenseType: CreatorLicenseType): CreatorLicenseType {
  return licenseType === "extended" ? "extended_commercial" : licenseType;
}

export function getLicenseDefinitions() {
  return creatorLicenseDefinitions;
}

export function getLicenseDefinition(licenseType: CreatorLicenseType) {
  const normalized = normalizeCreatorLicenseType(licenseType);
  return creatorLicenseDefinitions.find((definition) => definition.licenseType === normalized);
}

function findAssetLicenseOption(asset: CreatorAsset, requestedLicense: CreatorLicenseType): CreatorLicenseOption | undefined {
  if (requestedLicense === "extended_commercial") {
    return asset.licenseOptions.find((option) => option.type === "extended_commercial" || option.type === "extended");
  }
  return asset.licenseOptions.find((option) => option.type === requestedLicense);
}

function assetSupportsLicense(asset: CreatorAsset, requestedLicense: CreatorLicenseType) {
  if (requestedLicense === "extended_commercial") return asset.licenses.includes("extended_commercial") || asset.licenses.includes("extended");
  return asset.licenses.includes(requestedLicense);
}

function validateDefinitionShape(input: CreatorLicenseValidationInput): CreatorLicenseValidationIssue[] {
  const definition = getLicenseDefinition(input.requestedLicense);
  if (!definition) return [{ code: "asset_license_unsupported", message: "Requested Creator license is not defined." }];

  const issues: CreatorLicenseValidationIssue[] = [];
  if (typeof definition.seatLimit === "number" && definition.seatLimit <= 0) issues.push({ code: "invalid_seat_limit", message: "Creator license seat limit must be positive." });
  if (typeof definition.projectLimit === "number" && definition.projectLimit <= 0) issues.push({ code: "invalid_project_limit", message: "Creator license project limit must be positive." });
  if (typeof definition.downloadLimit === "number" && definition.downloadLimit < 0) issues.push({ code: "invalid_download_limit", message: "Creator license download limit cannot be negative." });
  if (definition.validityMode === "time_limited" && !definition.validityDuration) issues.push({ code: "invalid_validity_window", message: "Time-limited Creator license requires a validity duration." });
  return issues;
}

export function validateLicenseSelection(input: CreatorLicenseValidationInput): CreatorResolvedLicense {
  const definition = getLicenseDefinition(input.requestedLicense);
  const issues: CreatorLicenseValidationIssue[] = [];
  const normalized = normalizeCreatorLicenseType(input.requestedLicense);

  if (!isCreatorLicenseEngineEnabled()) {
    issues.push({ code: "license_engine_disabled", message: "Creator license engine is disabled by feature flag." });
  }

  if (!definition || !assetSupportsLicense(input.asset, normalized)) {
    issues.push({ code: "asset_license_unsupported", message: "Asset does not support the requested Creator license." });
  }

  if (normalized === "editorial" && !input.asset.isEditorial) {
    issues.push({ code: "editorial_asset_required", message: "Editorial license is available only for editorial-eligible assets." });
  }

  if (normalized === "subscription" && !input.subscriptionEnabled) {
    issues.push({ code: "subscription_disabled", message: "Creator subscription license is disabled." });
  }

  if (normalized === "custom_enterprise_request") {
    issues.push({ code: "enterprise_request_only", message: "Enterprise license requires review and cannot become a paid order automatically." });
  }

  if (input.cartLicense && normalizeCreatorLicenseType(input.cartLicense) !== normalized) {
    issues.push({ code: "cart_license_mismatch", message: "Cart license selection does not match requested license." });
  }

  issues.push(...validateDefinitionShape(input));

  const option = findAssetLicenseOption(input.asset, normalized);
  if (!option && normalized !== "subscription" && normalized !== "custom_enterprise_request") {
    issues.push({ code: "price_resolution_unavailable", message: "Creator asset license price could not be resolved." });
  }

  return {
    licenseId: `${input.asset.id}:${normalized}:${LICENSE_ENGINE_VERSION}`,
    licenseType: normalized,
    licenseVersion: LICENSE_ENGINE_VERSION,
    definition: definition || creatorLicenseDefinitions[0],
    resolvedPrice: option?.price ?? null,
    currency: input.asset.currency,
    assetSupportsLicense: Boolean(definition && assetSupportsLicense(input.asset, normalized)),
    issues,
  };
}
