import { tplApiRequest, type TplApiResult } from "../api/tplApiClient";

export type UnifiedIdentityProvider = "mobile" | "email" | "google";
export type UnifiedIdentityCapability = "traveller" | "creator" | "partner_candidate";

export type UnifiedIdentityMethod = {
  id: string;
  userId: string;
  provider: UnifiedIdentityProvider;
  identifier: string;
  normalizedIdentifier: string;
  isPrimary: boolean;
  isVerified: boolean;
  verifiedAt: string | null;
  status: "active" | "disabled" | "pending";
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type UnifiedIdentityCapabilityRecord = {
  id: string;
  userId: string;
  capability: UnifiedIdentityCapability;
  status: "active" | "revoked" | "pending";
  source: string;
  grantedAt: string;
  revokedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type UnifiedIdentitySummary = {
  userId: string;
  verifiedMobile: string | null;
  identities: UnifiedIdentityMethod[];
  capabilities: UnifiedIdentityCapabilityRecord[];
  creator: {
    linked: boolean;
    capability: "active" | "available";
  };
  partner: {
    candidate: boolean;
    membershipsEnabled: false;
  };
};

export function getMyUnifiedIdentity(): Promise<TplApiResult<{ identity: UnifiedIdentitySummary }>> {
  return tplApiRequest<{ identity: UnifiedIdentitySummary }>("/api/v1/me/identity");
}
