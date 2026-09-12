import { tplApiRequest } from "../api/tplApiClient";

const outcomes = ["APPLICATION", "APPLICATION_STATUS", "CORRECTIONS", "SETUP_PENDING", "ACTIVE", "RESTRICTED", "SELECTION_REQUIRED", "NO_LINKED_PROFILE"] as const;
export type PartnerAccess = { outcome: typeof outcomes[number]; organizationId: string | null; step: string | null };
const steps = ["account_contact", "business_identity", "business_location", "services", "verification_compliance", "payout_tax", "partner_agreement", "review_submit"];

export function parsePartnerAccess(value: unknown): PartnerAccess {
  if (!value || typeof value !== "object") throw new Error("Partner access could not be confirmed. Please retry.");
  const data = value as PartnerAccess;
  if (!outcomes.includes(data.outcome) || !(data.organizationId === null || typeof data.organizationId === "string") || !(data.step === null || steps.includes(data.step))) throw new Error("Partner access could not be confirmed. Please retry.");
  if (["APPLICATION", "APPLICATION_STATUS", "CORRECTIONS", "SETUP_PENDING", "ACTIVE"].includes(data.outcome) && !data.organizationId) throw new Error("Partner access could not be confirmed. Please retry.");
  if (data.outcome === "APPLICATION" && !data.step) throw new Error("Partner access could not be confirmed. Please retry.");
  return { outcome: data.outcome, organizationId: data.organizationId, step: data.step };
}

export function partnerAccessDestination(access: PartnerAccess): string | null {
  if (access.outcome === "APPLICATION") {
    const step = access.step === "verification_compliance" ? "documents_compliance" : access.step;
    return `/partner-preview?step=${encodeURIComponent(step!)}`;
  }
  if (access.outcome === "APPLICATION_STATUS" || access.outcome === "CORRECTIONS") return "/partner-preview?step=review_submit";
  return null;
}

export async function readPartnerAccess(): Promise<PartnerAccess> {
  const result = await tplApiRequest<unknown>("/api/v1/partner/access", { fallbackOnError: false });
  if (!result.ok) throw new Error(result.status === 401 ? "Sign in again to continue." : "Partner access is unavailable. Please retry.");
  return parsePartnerAccess(result.data);
}

export async function startPartnerApplication(key: string): Promise<PartnerAccess> {
  const result = await tplApiRequest<{ access: unknown }>("/api/v1/partner/application/start", { method: "POST", body: {}, idempotencyKey: key, fallbackOnError: false });
  if (!result.ok) {
    const support = ["PARTNER_ACCESS_SUPPORT_REQUIRED", "PARTNER_ACCESS_SELECTION_REQUIRED", "PARTNER_ACCESS_RESTRICTED"].includes(result.error.code);
    throw new Error(support ? "Contact Support before starting another Partner application." : "The application could not be opened. Please retry.");
  }
  return parsePartnerAccess(result.data?.access);
}
