import type { CreatorSignedUrlPreview, CreatorStorageDeliveryContract, CreatorStorageProviderName } from "./creatorDownloadTypes";

export function getCreatorStorageDeliveryContract(providerName: CreatorStorageProviderName): CreatorStorageDeliveryContract {
  return {
    providerName,
    enabled: false,
    signedUrlSupported: providerName !== "mock",
    downloadTokenSupported: true,
    expirySupported: true,
    rangeRequestSupported: providerName !== "mock",
    malwareScanRequired: true,
    privateObjectRequired: true,
    publicUrlAllowed: false,
  };
}

export function listCreatorStorageDeliveryContracts() {
  return (["mock", "s3", "cloudflare_r2", "google_cloud_storage", "azure_blob", "local_private"] as CreatorStorageProviderName[]).map((provider) => getCreatorStorageDeliveryContract(provider));
}

export function buildCreatorSignedUrlPreview({
  providerName,
  objectKeyReference,
  entitlementId,
  downloadTokenId,
  fileName,
  contentType,
}: {
  providerName: CreatorStorageProviderName;
  objectKeyReference: string;
  entitlementId: string;
  downloadTokenId: string;
  fileName: string;
  contentType: string;
}): CreatorSignedUrlPreview {
  return {
    signedUrlRequestId: `creator-signed-url-${downloadTokenId}`,
    providerName,
    objectKeyReference,
    expiresInSeconds: 300,
    contentDisposition: "attachment",
    fileName,
    contentType,
    checksumReady: true,
    entitlementId,
    downloadTokenId,
    generationAllowed: false,
    generatedUrl: null,
  };
}
