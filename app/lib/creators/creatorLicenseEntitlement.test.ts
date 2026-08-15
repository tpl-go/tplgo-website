import assert from "node:assert/strict";
import test from "node:test";
import { getCreatorAsset } from "./creatorCatalogService";
import {
  calculateRemainingDownloads,
  canAccessAsset,
  canAccessVersion,
  canRequestDownload,
  canRequestRefund,
  canUpgradeLicense,
  isEntitlementExpired,
  shouldRestrictRefundAfterAccess,
} from "./creatorEntitlementPolicy";
import { previewEntitlement } from "./creatorEntitlementService";
import { previewLicenseCertificate } from "./creatorLicenseCertificate";
import { getLicenseDefinition, validateLicenseSelection } from "./creatorLicenseEngine";
import type { CreatorEntitlement } from "./creatorEntitlementTypes";

function requireAsset(slug: string) {
  const asset = getCreatorAsset(slug);
  assert.ok(asset, `Expected Creator asset ${slug}`);
  return asset;
}

test("Creator license validation supports catalog licenses and preserves hidden transaction safety", () => {
  const asset = requireAsset("cinematic-ladakh-drone-pack");
  const result = validateLicenseSelection({ asset, requestedLicense: "commercial", cartLicense: "commercial" });

  assert.equal(result.assetSupportsLicense, true);
  assert.equal(result.resolvedPrice, 5999);
  assert.equal(result.licenseVersion, "creator-license-policy-v1");
  assert.ok(result.issues.some((issue) => issue.code === "license_engine_disabled"));
});

test("Creator license validation rejects unsupported, editorial, subscription and enterprise combinations safely", () => {
  const commercialAsset = requireAsset("cinematic-ladakh-drone-pack");
  const editorialAsset = requireAsset("jaipur-editorial-photo-set");

  assert.ok(validateLicenseSelection({ asset: commercialAsset, requestedLicense: "editorial" }).issues.some((issue) => issue.code === "asset_license_unsupported" || issue.code === "editorial_asset_required"));
  assert.ok(validateLicenseSelection({ asset: editorialAsset, requestedLicense: "subscription" }).issues.some((issue) => issue.code === "subscription_disabled"));
  assert.ok(validateLicenseSelection({ asset: commercialAsset, requestedLicense: "custom_enterprise_request" }).issues.some((issue) => issue.code === "enterprise_request_only"));
});

test("Creator license definitions enforce positive limits and explicit policy foundations", () => {
  const personal = getLicenseDefinition("personal");
  const extended = getLicenseDefinition("extended_commercial");

  assert.equal(personal?.downloadLimit, 5);
  assert.equal(personal?.seatLimit, 1);
  assert.equal(extended?.projectLimit, "unlimited");
  assert.equal(extended?.policyReviewRequired, true);
});

test("Creator entitlement policy blocks inactive, expired, revoked and download-token access", () => {
  const asset = requireAsset("cinematic-ladakh-drone-pack");
  const license = validateLicenseSelection({ asset, requestedLicense: "commercial" });
  const entitlement = previewEntitlement(asset, license, "buyer-1");

  assert.equal(entitlement.entitlementStatus, "draft");
  assert.equal(canAccessAsset(entitlement, "buyer-1").allowed, false);

  const active: CreatorEntitlement = { ...entitlement, entitlementStatus: "active" };
  assert.equal(canAccessAsset(active, "buyer-1").allowed, true);
  assert.equal(canRequestDownload(active, "buyer-1").allowed, false);

  const expired: CreatorEntitlement = { ...active, accessExpiresAt: "2020-01-01T00:00:00.000Z" };
  assert.equal(isEntitlementExpired(expired), true);
  assert.equal(canAccessAsset(expired, "buyer-1").code, "expired");

  const revoked: CreatorEntitlement = { ...active, entitlementStatus: "revoked" };
  assert.equal(canAccessAsset(revoked, "buyer-1").allowed, false);
});

test("Creator entitlement download, version, refund and upgrade rules are policy-ready", () => {
  const asset = requireAsset("cinematic-ladakh-drone-pack");
  const license = validateLicenseSelection({ asset, requestedLicense: "commercial" });
  const entitlement = previewEntitlement(asset, license, "buyer-1");
  const active: CreatorEntitlement = { ...entitlement, entitlementStatus: "active", downloadCount: 1 };

  assert.equal(calculateRemainingDownloads(active), active.downloadLimit - 1);
  assert.equal(canAccessVersion(active, asset.version, asset.version).allowed, true);
  assert.equal(shouldRestrictRefundAfterAccess(active), true);
  assert.equal(canRequestRefund(active).allowed, false);
  assert.equal(canUpgradeLicense(active).allowed, true);
});

test("Creator license certificate preview is metadata-only", () => {
  const asset = requireAsset("jaipur-editorial-photo-set");
  const license = validateLicenseSelection({ asset, requestedLicense: "editorial" });
  const entitlement = previewEntitlement(asset, license, "buyer-1");
  const certificate = previewLicenseCertificate(asset, entitlement, license);

  assert.equal(certificate.certificateStatus, "preview_only");
  assert.equal(certificate.assetTitleSnapshot, asset.title);
  assert.equal(certificate.metadata.pdfGenerated, false);
});
