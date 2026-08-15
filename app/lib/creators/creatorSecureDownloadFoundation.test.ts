import assert from "node:assert/strict";
import test from "node:test";
import type { CreatorEntitlement } from "./creatorEntitlementTypes";
import { buildEntitlementActivationPreview, canActivateCreatorEntitlement } from "./creatorEntitlementActivation";
import { calculateDownloadDecision, calculateRemainingDownloadsAfterAttempt } from "./creatorDownloadAuthorization";
import { canTransitionCreatorDownloadSession, canTransitionCreatorDownloadToken } from "./creatorDownloadSession";
import { createCreatorDownloadPreview, buildCreatorMalwareScanPreview } from "./creatorDownloadPreviewService";
import { buildRefundAccessDecision, isRefundRestrictedAfterDownload, shouldRevokeAccessAfterRefund, shouldSuspendAccessForRefundRequest } from "./creatorRefundAccessPolicy";
import { listCreatorStorageDeliveryContracts } from "./creatorStorageDelivery";

function entitlement(overrides: Partial<CreatorEntitlement> = {}): CreatorEntitlement {
  return {
    entitlementId: "ent-1",
    buyerUserId: "buyer-1",
    orderId: "order-1",
    orderItemId: "item-1",
    assetId: "asset-001",
    assetVersionId: "1.2",
    creatorId: "aira-studio",
    licenseId: "license-1",
    licenseType: "commercial",
    entitlementStatus: "active",
    accessStartsAt: "2026-01-01T00:00:00.000Z",
    accessExpiresAt: null,
    downloadLimit: 3,
    downloadCount: 0,
    remainingDownloads: 3,
    versionAccessPolicy: "minor_updates",
    supportExpiresAt: "2030-01-01T00:00:00.000Z",
    licenseCertificateId: "cert-1",
    revokedAt: null,
    revocationReason: null,
    refundRestricted: false,
    refundRestrictionReason: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    metadata: {},
    ...overrides,
  };
}

function withDownloadPolicyFlags(run: () => void) {
  const previousSecure = process.env.NEXT_PUBLIC_TPL_CREATOR_SECURE_DOWNLOADS;
  const previousVersion = process.env.NEXT_PUBLIC_TPL_CREATOR_VERSION_DELIVERY;
  process.env.NEXT_PUBLIC_TPL_CREATOR_SECURE_DOWNLOADS = "true";
  process.env.NEXT_PUBLIC_TPL_CREATOR_VERSION_DELIVERY = "true";
  try {
    run();
  } finally {
    if (previousSecure === undefined) delete process.env.NEXT_PUBLIC_TPL_CREATOR_SECURE_DOWNLOADS;
    else process.env.NEXT_PUBLIC_TPL_CREATOR_SECURE_DOWNLOADS = previousSecure;
    if (previousVersion === undefined) delete process.env.NEXT_PUBLIC_TPL_CREATOR_VERSION_DELIVERY;
    else process.env.NEXT_PUBLIC_TPL_CREATOR_VERSION_DELIVERY = previousVersion;
  }
}

test("Creator entitlement activation validation remains preview-only", () => {
  const active = entitlement();
  const input = {
    entitlement: active,
    paymentStatus: "payment_captured" as const,
    buyerUserId: "buyer-1",
    orderId: "order-1",
    orderItemId: "item-1",
    assetId: "asset-001",
    assetVersionId: "1.2",
    licenseId: "license-1",
  };
  const preview = buildEntitlementActivationPreview(input);

  assert.equal(canActivateCreatorEntitlement(input).allowed, false);
  assert.equal(preview.entitlementActivationAllowed, false);
  assert.ok(preview.failureReason?.includes("entitlement_activation_disabled"));
});

test("Creator download authorization denies ownership, inactive, expired, revoked, suspended and limit cases", () => {
  const scan = buildCreatorMalwareScanPreview({ fileId: "file-1", assetId: "asset-001", provider: "mock" });

  assert.equal(calculateDownloadDecision({ entitlement: entitlement(), buyerUserId: "buyer-1", requestedVersionId: "1.2", latestVersionId: "1.3", fileAvailable: true, assetAvailable: true, malwareScan: scan }).decision, "denied_entitlement_inactive");
  withDownloadPolicyFlags(() => {
    assert.equal(calculateDownloadDecision({ entitlement: entitlement(), buyerUserId: "other", requestedVersionId: "1.2", latestVersionId: "1.3", fileAvailable: true, assetAvailable: true, malwareScan: scan }).decision, "denied_not_owner");
    assert.equal(calculateDownloadDecision({ entitlement: entitlement({ entitlementStatus: "draft" }), buyerUserId: "buyer-1", requestedVersionId: "1.2", latestVersionId: "1.3", fileAvailable: true, assetAvailable: true, malwareScan: scan }).decision, "denied_entitlement_inactive");
    assert.equal(calculateDownloadDecision({ entitlement: entitlement({ accessExpiresAt: "2020-01-01T00:00:00.000Z" }), buyerUserId: "buyer-1", requestedVersionId: "1.2", latestVersionId: "1.3", fileAvailable: true, assetAvailable: true, malwareScan: scan }).decision, "denied_entitlement_expired");
    assert.equal(calculateDownloadDecision({ entitlement: entitlement({ entitlementStatus: "revoked" }), buyerUserId: "buyer-1", requestedVersionId: "1.2", latestVersionId: "1.3", fileAvailable: true, assetAvailable: true, malwareScan: scan }).decision, "denied_entitlement_revoked");
    assert.equal(calculateDownloadDecision({ entitlement: entitlement({ entitlementStatus: "suspended" }), buyerUserId: "buyer-1", requestedVersionId: "1.2", latestVersionId: "1.3", fileAvailable: true, assetAvailable: true, malwareScan: scan }).decision, "denied_entitlement_suspended");
    assert.equal(calculateDownloadDecision({ entitlement: entitlement({ downloadCount: 3 }), buyerUserId: "buyer-1", requestedVersionId: "1.2", latestVersionId: "1.3", fileAvailable: true, assetAvailable: true, malwareScan: scan }).decision, "denied_download_limit");
  });
});

test("Creator download decision handles version, refund, malware, asset and file denials", () => {
  const scan = buildCreatorMalwareScanPreview({ fileId: "file-1", assetId: "asset-001", provider: "mock" });
  const infected = buildCreatorMalwareScanPreview({ fileId: "file-1", assetId: "asset-001", provider: "mock", scanStatus: "infected" });

  withDownloadPolicyFlags(() => {
    assert.equal(calculateDownloadDecision({ entitlement: entitlement(), buyerUserId: "buyer-1", requestedVersionId: "2.0", latestVersionId: "2.0", fileAvailable: true, assetAvailable: true, malwareScan: scan }).decision, "denied_version_access");
    assert.equal(calculateDownloadDecision({ entitlement: entitlement({ refundRestricted: true }), buyerUserId: "buyer-1", requestedVersionId: "1.2", latestVersionId: "1.3", fileAvailable: true, assetAvailable: true, malwareScan: scan }).decision, "denied_refund_restriction");
    assert.equal(calculateDownloadDecision({ entitlement: entitlement(), buyerUserId: "buyer-1", requestedVersionId: "1.2", latestVersionId: "1.3", fileAvailable: false, assetAvailable: true, malwareScan: scan }).decision, "denied_file_unavailable");
    assert.equal(calculateDownloadDecision({ entitlement: entitlement(), buyerUserId: "buyer-1", requestedVersionId: "1.2", latestVersionId: "1.3", fileAvailable: true, assetAvailable: false, malwareScan: scan }).decision, "denied_asset_unavailable");
    assert.equal(calculateDownloadDecision({ entitlement: entitlement(), buyerUserId: "buyer-1", requestedVersionId: "1.2", latestVersionId: "1.3", fileAvailable: true, assetAvailable: true, malwareScan: infected }).decision, "denied_malware_infected");
  });
});

test("Creator remaining downloads, token transitions and session transitions are ready", () => {
  assert.equal(calculateRemainingDownloadsAfterAttempt(entitlement({ downloadCount: 1 })), 1);
  assert.equal(canTransitionCreatorDownloadToken("draft", "pending_authorization"), true);
  assert.equal(canTransitionCreatorDownloadToken("issued", "used"), true);
  assert.equal(canTransitionCreatorDownloadSession("created", "authorized"), true);
  assert.equal(canTransitionCreatorDownloadSession("started", "completed"), true);
});

test("Creator storage contracts and signed URL preview never expose public URLs", () => {
  const providers = listCreatorStorageDeliveryContracts();
  assert.ok(providers.every((provider) => provider.publicUrlAllowed === false));
  assert.ok(providers.every((provider) => provider.privateObjectRequired === true));

  const preview = createCreatorDownloadPreview({ entitlement: entitlement(), buyerUserId: "buyer-1", fileId: "file-1", requestedVersionId: "1.2", latestVersionId: "1.3" });
  assert.equal(preview.signedUrlPreview.generationAllowed, false);
  assert.equal(preview.signedUrlPreview.generatedUrl, null);
  assert.equal(preview.tokenIssuanceAllowed, false);
  assert.equal(preview.fileDeliveryAllowed, false);
});

test("Creator refund access rules are policy-ready", () => {
  assert.equal(shouldSuspendAccessForRefundRequest({ refundRequested: true, disputeOpen: true, refundCompleted: false, downloadCount: 0 }), true);
  assert.equal(shouldRevokeAccessAfterRefund({ refundRequested: true, disputeOpen: false, refundCompleted: true, downloadCount: 0 }), true);
  assert.equal(isRefundRestrictedAfterDownload({ refundRequested: false, disputeOpen: false, refundCompleted: false, downloadCount: 1 }), true);
  assert.equal(buildRefundAccessDecision(entitlement(), { refundRequested: false, disputeOpen: false, refundCompleted: false, downloadCount: 0 }).allowed, true);
});
