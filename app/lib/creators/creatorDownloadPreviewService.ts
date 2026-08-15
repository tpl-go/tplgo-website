import { buildEntitlementActivationPreview } from "./creatorEntitlementActivation";
import { calculateDownloadDecision, calculateRemainingDownloadsAfterAttempt } from "./creatorDownloadAuthorization";
import { buildCreatorSignedUrlPreview, getCreatorStorageDeliveryContract } from "./creatorStorageDelivery";
import type { CreatorEntitlement } from "./creatorEntitlementTypes";
import type { CreatorDownloadAuditEvent, CreatorDownloadHistoryItem, CreatorDownloadPreview, CreatorMalwareScanPreview, CreatorStorageProviderName } from "./creatorDownloadTypes";
import type { CreatorPaymentStatus } from "./creatorPaymentTypes";

function auditEvent(eventType: CreatorDownloadAuditEvent["eventType"], entitlement: CreatorEntitlement, buyerUserId: string, metadata: Record<string, unknown> = {}): CreatorDownloadAuditEvent {
  return {
    eventId: `${entitlement.entitlementId}:${eventType}`,
    eventType,
    entitlementId: entitlement.entitlementId,
    buyerUserId,
    publishAllowed: false,
    occurredAt: new Date().toISOString(),
    metadata,
  };
}

export function buildCreatorMalwareScanPreview({
  fileId,
  assetId,
  provider,
  scanStatus = "not_requested",
}: {
  fileId: string;
  assetId: string;
  provider: CreatorStorageProviderName;
  scanStatus?: CreatorMalwareScanPreview["scanStatus"];
}): CreatorMalwareScanPreview {
  return {
    scanId: `creator-scan-${fileId}`,
    fileId,
    assetId,
    provider,
    scanStatus,
    malwareDetected: scanStatus === "infected",
    quarantineRequired: scanStatus === "infected" || scanStatus === "suspicious",
    scannedAt: scanStatus === "not_requested" ? null : new Date().toISOString(),
    metadata: {
      scannerIntegrated: false,
    },
  };
}

export function createCreatorDownloadPreview({
  entitlement,
  buyerUserId,
  fileId,
  requestedVersionId,
  latestVersionId,
  provider = "mock",
  paymentStatus = "payment_captured",
  fileAvailable = true,
  assetAvailable = true,
  malwareStatus = "not_requested",
}: {
  entitlement: CreatorEntitlement;
  buyerUserId: string;
  fileId: string;
  requestedVersionId: string;
  latestVersionId: string;
  provider?: CreatorStorageProviderName;
  paymentStatus?: CreatorPaymentStatus;
  fileAvailable?: boolean;
  assetAvailable?: boolean;
  malwareStatus?: CreatorMalwareScanPreview["scanStatus"];
}): CreatorDownloadPreview {
  const now = new Date().toISOString();
  const malwareScan = buildCreatorMalwareScanPreview({ fileId, assetId: entitlement.assetId, provider, scanStatus: malwareStatus });
  const decision = calculateDownloadDecision({
    entitlement,
    buyerUserId,
    requestedVersionId,
    latestVersionId,
    fileAvailable,
    assetAvailable,
    malwareScan,
  });
  const downloadTokenId = `creator-token-${entitlement.entitlementId}-${fileId}`;
  const sessionId = `creator-download-session-${downloadTokenId}`;
  const remainingBefore = Math.max(entitlement.downloadLimit - entitlement.downloadCount, 0);
  const remainingAfter = decision.allowed ? calculateRemainingDownloadsAfterAttempt(entitlement) : remainingBefore;
  const activationPreview = buildEntitlementActivationPreview({
    entitlement,
    paymentStatus,
    buyerUserId,
    orderId: entitlement.orderId,
    orderItemId: entitlement.orderItemId,
    assetId: entitlement.assetId,
    assetVersionId: entitlement.assetVersionId,
    licenseId: entitlement.licenseId,
  });
  const signedUrlPreview = buildCreatorSignedUrlPreview({
    providerName: provider,
    objectKeyReference: `private-object-ref:${entitlement.assetId}:${fileId}`,
    entitlementId: entitlement.entitlementId,
    downloadTokenId,
    fileName: `${entitlement.assetId}-${requestedVersionId}.zip`,
    contentType: "application/zip",
  });
  const history: CreatorDownloadHistoryItem = {
    historyId: `creator-download-history-${downloadTokenId}`,
    entitlementId: entitlement.entitlementId,
    buyerUserId,
    assetId: entitlement.assetId,
    assetVersionId: requestedVersionId,
    fileId,
    decision,
    tokenStatus: decision.allowed ? "authorized" : "failed",
    sessionStatus: decision.allowed ? "authorized" : "failed",
    attemptedAt: now,
    downloadCounterSnapshot: {
      before: remainingBefore,
      after: remainingAfter,
    },
    metadata: {
      sourceUrlExposed: false,
      tokenIssued: false,
    },
  };

  return {
    activationPreview,
    downloadRequest: {
      downloadRequestId: `creator-download-request-${downloadTokenId}`,
      entitlementId: entitlement.entitlementId,
      buyerUserId,
      assetId: entitlement.assetId,
      assetVersionId: requestedVersionId,
      fileId,
      requestedAt: now,
      downloadSessionId: sessionId,
      downloadTokenId,
      tokenStatus: decision.allowed ? "authorized" : "failed",
      tokenExpiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      remainingDownloadsBefore: remainingBefore,
      remainingDownloadsAfter: remainingAfter,
      accessDecision: decision,
      rejectionReason: decision.allowed ? null : decision.reason,
      ipMetadata: { captured: false },
      deviceMetadata: { captured: false },
      userAgentMetadata: { captured: false },
      metadata: {
        previewOnly: true,
      },
      tokenIssuanceAllowed: false,
    },
    downloadSession: {
      sessionId,
      entitlementId: entitlement.entitlementId,
      tokenId: downloadTokenId,
      fileId,
      assetVersionId: requestedVersionId,
      sessionStatus: decision.allowed ? "authorized" : "failed",
      createdAt: now,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      usedAt: null,
      cancelledAt: null,
      failureReason: decision.allowed ? null : decision.reason,
      metadata: {
        byteRangeReady: false,
        streamingAllowed: false,
      },
      fileDeliveryAllowed: false,
    },
    signedUrlPreview,
    malwareScan,
    history: [history],
    auditEvents: [
      auditEvent("creator.entitlement.activation.pending", entitlement, buyerUserId),
      auditEvent("creator.download.authorization.requested", entitlement, buyerUserId),
      auditEvent(decision.allowed ? "creator.download.token.ready" : "creator.download.authorization.denied", entitlement, buyerUserId, { decision: decision.decision }),
    ],
    storageProvider: getCreatorStorageDeliveryContract(provider),
    entitlementActivationAllowed: false,
    downloadAuthorizationAllowed: false,
    tokenIssuanceAllowed: false,
    signedUrlGenerationAllowed: false,
    fileDeliveryAllowed: false,
  };
}
