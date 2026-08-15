import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  isCreatorAdminAnalyticsEnabled,
  isCreatorAdminDashboardEnabled,
  isCreatorAdminEnabled,
  isCreatorAdminModerationEnabled,
  isCreatorAdvancedAssetDetailEnabled,
  isCreatorAdvancedSearchEnabled,
  isCreatorBackendPreviewApisEnabled,
  isCreatorCatalogEnabled,
  isCreatorCheckoutPreviewApiEnabled,
  isCreatorDownloadPreviewApiEnabled,
  isCreatorEntitlementActivationEnabled,
  isCreatorEntitlementPreviewApiEnabled,
  isCreatorOrderPreviewApiEnabled,
  isCreatorPaymentEngineEnabled,
  isCreatorPaymentPreviewApiEnabled,
  isCreatorSecureDownloadsEnabled,
  isCreatorSignedUrlsEnabled,
  isCreatorTransactionEngineEnabled,
  isCreatorWorkspaceEnabled,
} from "./creatorFeatureFlags";
import { getCreatorAdminPreview } from "./creatorAdminService";
import { getCreatorWorkspacePreview, isCreatorWorkspaceSectionEnabled } from "./creatorWorkspaceService";

const reviewFlags = [
  "NEXT_PUBLIC_TPL_CREATOR_PUBLIC_CATALOG",
  "NEXT_PUBLIC_TPL_CREATOR_ADVANCED_ASSET_DETAIL",
  "NEXT_PUBLIC_TPL_CREATOR_ADVANCED_SEARCH",
  "NEXT_PUBLIC_TPL_CREATOR_MEDIA_PREVIEWS",
  "NEXT_PUBLIC_TPL_CREATOR_LICENSE_COMPARE",
  "NEXT_PUBLIC_TPL_CREATOR_BACKEND_PREVIEW_APIS",
  "NEXT_PUBLIC_TPL_CREATOR_CHECKOUT_PREVIEW_API",
  "NEXT_PUBLIC_TPL_CREATOR_ORDER_PREVIEW_API",
  "NEXT_PUBLIC_TPL_CREATOR_PAYMENT_PREVIEW_API",
  "NEXT_PUBLIC_TPL_CREATOR_ENTITLEMENT_PREVIEW_API",
  "NEXT_PUBLIC_TPL_CREATOR_DOWNLOAD_PREVIEW_API",
  "NEXT_PUBLIC_TPL_CREATOR_WORKSPACE",
  "NEXT_PUBLIC_TPL_CREATOR_DASHBOARD",
  "NEXT_PUBLIC_TPL_CREATOR_ONBOARDING",
  "NEXT_PUBLIC_TPL_CREATOR_ASSET_MANAGER",
  "NEXT_PUBLIC_TPL_CREATOR_ASSET_WIZARD",
  "NEXT_PUBLIC_TPL_CREATOR_UPLOADS",
  "NEXT_PUBLIC_TPL_CREATOR_ANALYTICS",
  "NEXT_PUBLIC_TPL_CREATOR_EARNINGS",
  "NEXT_PUBLIC_TPL_CREATOR_ADMIN",
  "NEXT_PUBLIC_TPL_CREATOR_ADMIN_DASHBOARD",
  "NEXT_PUBLIC_TPL_CREATOR_ADMIN_ONBOARDING",
  "NEXT_PUBLIC_TPL_CREATOR_ADMIN_MODERATION",
  "NEXT_PUBLIC_TPL_CREATOR_ADMIN_COPYRIGHT",
  "NEXT_PUBLIC_TPL_CREATOR_ADMIN_ORDERS",
  "NEXT_PUBLIC_TPL_CREATOR_ADMIN_ENTITLEMENTS",
  "NEXT_PUBLIC_TPL_CREATOR_ADMIN_EARNINGS",
  "NEXT_PUBLIC_TPL_CREATOR_ADMIN_RISK",
  "NEXT_PUBLIC_TPL_CREATOR_ADMIN_ANALYTICS",
];

const transactionFlags = [
  "NEXT_PUBLIC_TPL_CREATOR_TRANSACTION_ENGINE",
  "NEXT_PUBLIC_TPL_CREATOR_PAYMENT_ENGINE",
  "NEXT_PUBLIC_TPL_CREATOR_PAYMENT_PROVIDER",
  "NEXT_PUBLIC_TPL_CREATOR_ENTITLEMENT_ACTIVATION",
  "NEXT_PUBLIC_TPL_CREATOR_SECURE_DOWNLOADS",
  "NEXT_PUBLIC_TPL_CREATOR_DOWNLOAD_TOKENS",
  "NEXT_PUBLIC_TPL_CREATOR_SIGNED_URLS",
  "NEXT_PUBLIC_TPL_CREATOR_VERSION_DELIVERY",
];

function withFlags(flags: Record<string, string | undefined>, run: () => void) {
  const previous = new Map<string, string | undefined>();
  for (const key of [...reviewFlags, ...transactionFlags]) previous.set(key, process.env[key]);
  for (const [key, value] of Object.entries(flags)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    run();
  } finally {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("Creator certification hidden mode keeps all Creator surfaces disabled by default", () => {
  withFlags(Object.fromEntries([...reviewFlags, ...transactionFlags].map((flag) => [flag, undefined])), () => {
    assert.equal(isCreatorCatalogEnabled(), false);
    assert.equal(isCreatorBackendPreviewApisEnabled(), false);
    assert.equal(isCreatorWorkspaceEnabled(), false);
    assert.equal(isCreatorAdminEnabled(), false);
    assert.equal(isCreatorWorkspaceSectionEnabled("dashboard"), false);
    assert.equal(getCreatorAdminPreview("dashboard").enabled, false);
  });
});

test("Creator certification internal review mode enables review surfaces but keeps transaction execution false", () => {
  withFlags(
    {
      ...Object.fromEntries(reviewFlags.map((flag) => [flag, "true"])),
      ...Object.fromEntries(transactionFlags.map((flag) => [flag, "false"])),
    },
    () => {
      assert.equal(isCreatorCatalogEnabled(), true);
      assert.equal(isCreatorAdvancedAssetDetailEnabled(), true);
      assert.equal(isCreatorAdvancedSearchEnabled(), true);
      assert.equal(isCreatorBackendPreviewApisEnabled(), true);
      assert.equal(isCreatorCheckoutPreviewApiEnabled(), true);
      assert.equal(isCreatorOrderPreviewApiEnabled(), true);
      assert.equal(isCreatorPaymentPreviewApiEnabled(), true);
      assert.equal(isCreatorEntitlementPreviewApiEnabled(), true);
      assert.equal(isCreatorDownloadPreviewApiEnabled(), true);
      assert.equal(isCreatorWorkspaceEnabled(), true);
      assert.equal(isCreatorAdminEnabled(), true);
      assert.equal(isCreatorAdminDashboardEnabled(), true);
      assert.equal(isCreatorAdminModerationEnabled(), true);
      assert.equal(isCreatorAdminAnalyticsEnabled(), true);
      assert.equal(isCreatorTransactionEngineEnabled(), false);
      assert.equal(isCreatorPaymentEngineEnabled(), false);
      assert.equal(isCreatorEntitlementActivationEnabled(), false);
      assert.equal(isCreatorSecureDownloadsEnabled(), false);
      assert.equal(isCreatorSignedUrlsEnabled(), false);
    },
  );
});

test("Creator certification blocks real mutation permissions across workspace and admin contracts", () => {
  withFlags(
    {
      ...Object.fromEntries(reviewFlags.map((flag) => [flag, "true"])),
      ...Object.fromEntries(transactionFlags.map((flag) => [flag, "false"])),
    },
    () => {
      const workspace = getCreatorWorkspacePreview("dashboard");
      const admin = getCreatorAdminPreview("dashboard");
      assert.equal(workspace.permissions.paymentAllowed, false);
      assert.equal(workspace.permissions.entitlementMutationAllowed, false);
      assert.equal(workspace.permissions.entitlementMutationAllowed, false);
      assert.equal(workspace.permissions.payoutAllowed, false);
      assert.equal(admin.permissions.paymentMutationAllowed, false);
      assert.equal(admin.permissions.refundMutationAllowed, false);
      assert.equal(admin.permissions.walletMutationAllowed, false);
      assert.equal(admin.permissions.entitlementMutationAllowed, false);
      assert.equal(admin.permissions.downloadMutationAllowed, false);
      assert.equal(admin.permissions.payoutAllowed, false);
      assert.equal(admin.permissions.publicMountAllowed, false);
    },
  );
});

test("Creator certification terminology avoids travel booking language in Creator UI/admin/source files", () => {
  const files = [
    "app/creators/page.tsx",
    "app/components/creators/catalog/CreatorCatalogHome.tsx",
    "app/components/creators/catalog/CreatorAssetDetailView.tsx",
    "app/components/creators/workspace/CreatorWorkspacePage.tsx",
    "app/components/admin/creators/CreatorAdminOperationsPage.tsx",
    "app/lib/creators/creatorCatalogData.ts",
    "app/lib/creators/creatorWorkspaceData.ts",
    "app/lib/creators/creatorAdminData.ts",
  ];
  const blocked = /\b(Manage Booking|Traveller|traveller|Journey|journey|Fare|fare)\b/;
  for (const file of files) {
    const content = readFileSync(join(process.cwd(), file), "utf8");
    assert.equal(blocked.test(content), false, `${file} contains blocked travel-booking terminology`);
  }
});
