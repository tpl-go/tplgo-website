import assert from "node:assert/strict";
import test from "node:test";
import {
  isCreatorAnalyticsEnabled,
  isCreatorAssetManagerEnabled,
  isCreatorAssetWizardEnabled,
  isCreatorDashboardEnabled,
  isCreatorEarningsEnabled,
  isCreatorOnboardingEnabled,
  isCreatorUploadsEnabled,
  isCreatorWorkspaceEnabled,
} from "./creatorFeatureFlags";
import { getCreatorWorkspacePreview, isCreatorWorkspaceSectionEnabled } from "./creatorWorkspaceService";

test("Creator workspace flags default false and subordinate flags require master", () => {
  assert.equal(isCreatorWorkspaceEnabled(), false);
  assert.equal(isCreatorDashboardEnabled(), false);
  assert.equal(isCreatorOnboardingEnabled(), false);
  assert.equal(isCreatorAssetManagerEnabled(), false);
  assert.equal(isCreatorAssetWizardEnabled(), false);
  assert.equal(isCreatorUploadsEnabled(), false);
  assert.equal(isCreatorAnalyticsEnabled(), false);
  assert.equal(isCreatorEarningsEnabled(), false);
  assert.equal(isCreatorWorkspaceSectionEnabled("dashboard"), false);
  assert.equal(isCreatorWorkspaceSectionEnabled("assets"), false);
});

test("Creator workspace preview uses shared TPL identity and no account duplication", () => {
  const preview = getCreatorWorkspacePreview("dashboard");

  assert.equal(preview.identity.usesSharedTplIdentity, true);
  assert.equal(preview.identity.separateCreatorLogin, false);
  assert.equal(preview.identity.separateCreatorAccount, false);
  assert.equal(preview.identity.accountShellModified, false);
});

test("Creator workspace permissions keep upload, publish, order, payment and wallet mutations disabled", () => {
  const preview = getCreatorWorkspacePreview("uploads");

  assert.equal(preview.permissions.uploadAllowed, false);
  assert.equal(preview.permissions.storageWriteAllowed, false);
  assert.equal(preview.permissions.publishAllowed, false);
  assert.equal(preview.permissions.orderPersistenceAllowed, false);
  assert.equal(preview.permissions.paymentAllowed, false);
  assert.equal(preview.permissions.walletMutationAllowed, false);
  assert.equal(preview.permissions.payoutAllowed, false);
});

test("Creator dashboard and earnings preview calculations are non-authoritative", () => {
  const preview = getCreatorWorkspacePreview("dashboard");

  assert.equal(preview.dashboard.statusSummary.published, 1);
  assert.equal(preview.dashboard.statusSummary.under_review, 1);
  assert.equal(preview.earnings.nonAuthoritative, true);
  assert.equal(preview.earnings.payoutProviderPending, true);
  assert.equal(preview.earnings.creatorShare, 121800);
});

test("Creator asset, upload, version and collection models remain preview-only", () => {
  const preview = getCreatorWorkspacePreview("assets");

  assert.ok(preview.assets.every((asset) => asset.mutationPermissions.publishAllowed === false));
  assert.ok(preview.assets.every((asset) => asset.mutationPermissions.storageWriteAllowed === false));
  assert.ok(preview.uploads.every((upload) => upload.uploadAllowed === false));
  assert.ok(preview.uploads.every((upload) => upload.malwareScanExecutionAllowed === false));
  assert.ok(preview.versions.every((version) => version.rollbackReady === true));
  assert.ok(preview.collections.every((collection) => collection.visibilityPreview === "private" || collection.visibilityPreview === "public_preview"));
});

test("Creator workspace preview includes mobile navigation readiness without public mounting", () => {
  const preview = getCreatorWorkspacePreview("dashboard");

  assert.equal(preview.section, "dashboard");
  assert.ok(preview.dashboard.trendingCategories.length > 0);
  assert.ok(preview.reviews.every((review) => typeof review.creatorResponseReady === "boolean"));
});
