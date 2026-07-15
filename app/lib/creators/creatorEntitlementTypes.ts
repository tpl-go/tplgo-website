import type { CreatorLicenseType } from "./creatorCatalogTypes";
import type { CreatorVersionAccessPolicy } from "./creatorLicenseTypes";

export type CreatorEntitlementStatus =
  | "draft"
  | "pending_payment"
  | "payment_confirmed"
  | "activation_pending"
  | "active"
  | "suspended"
  | "revoked"
  | "expired"
  | "refunded"
  | "failed";

export type CreatorEntitlement = {
  entitlementId: string;
  buyerUserId: string;
  orderId: string;
  orderItemId: string;
  assetId: string;
  assetVersionId: string;
  creatorId: string;
  licenseId: string;
  licenseType: CreatorLicenseType;
  entitlementStatus: CreatorEntitlementStatus;
  accessStartsAt: string;
  accessExpiresAt: string | null;
  downloadLimit: number;
  downloadCount: number;
  remainingDownloads: number;
  versionAccessPolicy: CreatorVersionAccessPolicy;
  supportExpiresAt: string | null;
  licenseCertificateId: string;
  revokedAt: string | null;
  revocationReason: string | null;
  refundRestricted: boolean;
  refundRestrictionReason: string | null;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
};

export type CreatorEntitlementPolicyDecision = {
  allowed: boolean;
  code: string;
  reason: string;
};
