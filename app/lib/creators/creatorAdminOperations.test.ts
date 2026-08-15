import assert from "node:assert/strict";
import test from "node:test";
import {
  creatorAdminReadOnlyPermissions,
  getCreatorAdminPreview,
  isCreatorAdminSectionEnabled,
} from "./creatorAdminService";
import type { CreatorAdminSection } from "./creatorAdminTypes";

const adminSections: CreatorAdminSection[] = [
  "dashboard",
  "onboarding",
  "profiles",
  "profile-detail",
  "assets",
  "asset-detail",
  "moderation",
  "copyright",
  "licenses",
  "orders",
  "refunds",
  "entitlements",
  "downloads",
  "earnings",
  "payouts",
  "reviews",
  "disputes",
  "risk",
  "categories",
  "collections",
  "featured",
  "analytics",
  "reports",
  "settings",
];

test("Creator admin flags default false and routes stay hidden", () => {
  for (const section of adminSections) {
    assert.equal(isCreatorAdminSectionEnabled(section), false);
    assert.equal(getCreatorAdminPreview(section).enabled, false);
  }
});

test("Creator admin permissions are readiness-only and all mutations remain false", () => {
  assert.ok(creatorAdminReadOnlyPermissions.permissions.includes("creator.view"));
  assert.ok(creatorAdminReadOnlyPermissions.permissions.includes("creator.assets.review"));
  assert.equal(creatorAdminReadOnlyPermissions.approveAllowed, false);
  assert.equal(creatorAdminReadOnlyPermissions.rejectAllowed, false);
  assert.equal(creatorAdminReadOnlyPermissions.suspendAllowed, false);
  assert.equal(creatorAdminReadOnlyPermissions.documentMutationAllowed, false);
  assert.equal(creatorAdminReadOnlyPermissions.moderationMutationAllowed, false);
  assert.equal(creatorAdminReadOnlyPermissions.publishMutationAllowed, false);
  assert.equal(creatorAdminReadOnlyPermissions.storageMutationAllowed, false);
  assert.equal(creatorAdminReadOnlyPermissions.paymentMutationAllowed, false);
  assert.equal(creatorAdminReadOnlyPermissions.refundMutationAllowed, false);
  assert.equal(creatorAdminReadOnlyPermissions.walletMutationAllowed, false);
  assert.equal(creatorAdminReadOnlyPermissions.entitlementMutationAllowed, false);
  assert.equal(creatorAdminReadOnlyPermissions.downloadMutationAllowed, false);
  assert.equal(creatorAdminReadOnlyPermissions.payoutAllowed, false);
  assert.equal(creatorAdminReadOnlyPermissions.notificationSendAllowed, false);
  assert.equal(creatorAdminReadOnlyPermissions.publicMountAllowed, false);
});

test("Creator admin preview covers onboarding and asset moderation statuses", () => {
  const preview = getCreatorAdminPreview("dashboard");
  assert.ok(preview.onboarding.some((item) => item.status === "under_review"));
  assert.ok(preview.onboarding.some((item) => item.status === "changes_requested"));
  assert.ok(preview.assetModeration.some((item) => item.status === "manual_review"));
  assert.ok(preview.assetModeration.some((item) => item.status === "automated_checks"));
  assert.ok(preview.copyrightCases.length > 0);
});

test("Creator admin visibility contracts never allow payment, wallet, refund, entitlement, download or payout mutation", () => {
  const preview = getCreatorAdminPreview("orders");
  assert.equal(preview.persistent, false);
  assert.equal(preview.mode, "hidden_preview");
  assert.equal(preview.permissions.paymentMutationAllowed, false);
  assert.equal(preview.permissions.walletMutationAllowed, false);
  assert.equal(preview.permissions.refundMutationAllowed, false);
  assert.equal(preview.permissions.entitlementMutationAllowed, false);
  assert.equal(preview.permissions.downloadMutationAllowed, false);
  assert.equal(preview.permissions.payoutAllowed, false);
  assert.ok(preview.orders.every((row) => row.status === "preview"));
  assert.ok(preview.entitlements.every((row) => row.status === "preview"));
});

test("Creator admin earnings, payout readiness, risk and analytics are preview only", () => {
  const preview = getCreatorAdminPreview("earnings");
  assert.equal(preview.earnings.previewOnly, true);
  assert.equal(preview.earnings.providerPending, true);
  assert.equal(preview.earnings.creatorShare, 83970);
  assert.ok(getCreatorAdminPreview("risk").risk.some((item) => item.riskSignal));
  assert.ok(getCreatorAdminPreview("analytics").analytics.length > 0);
});

test("Creator admin audit and public mounting remain disabled", () => {
  const preview = getCreatorAdminPreview("dashboard");
  assert.equal(preview.dashboard.audit[0].persistAllowed, false);
  assert.equal(preview.permissions.publicMountAllowed, false);
  assert.equal(preview.permissions.notificationSendAllowed, false);
});
