import { tplApiRequest } from "../api/tplApiClient";
import { clearPartnerProfilePreference, readPartnerProfilePreference, rememberPartnerProfile } from "./partnerProfilePreference";

const outcomes = ["APPLICATION", "APPLICATION_STATUS", "CORRECTIONS", "SETUP_PENDING", "ACTIVE", "RESTRICTED", "SELECTION_REQUIRED", "NO_LINKED_PROFILE"] as const;
export type PartnerProfile = { organizationId: string; displayName: string; reference: string | null; status: string; destinationType: typeof outcomes[number]; updatedAt: string; selectable: boolean; restrictedReason: "ACCESS_RESTRICTED" | null };
export type PartnerAccess = { outcome: typeof outcomes[number]; organizationId: string | null; step: string | null; profiles?: PartnerProfile[] };
const steps = ["account_contact", "business_identity", "business_location", "services", "verification_compliance", "payout_tax", "partner_agreement", "review_submit"];

export class PartnerAccessRequestError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "PartnerAccessRequestError";
  }
}

export function parsePartnerAccess(value: unknown): PartnerAccess {
  if (!value || typeof value !== "object") throw new Error("Partner access could not be confirmed. Please retry.");
  const data = value as PartnerAccess;
  if (!outcomes.includes(data.outcome) || !(data.organizationId === null || typeof data.organizationId === "string") || !(data.step === null || steps.includes(data.step))) throw new Error("Partner access could not be confirmed. Please retry.");
  if (["APPLICATION", "APPLICATION_STATUS", "CORRECTIONS", "SETUP_PENDING", "ACTIVE"].includes(data.outcome) && !data.organizationId) throw new Error("Partner access could not be confirmed. Please retry.");
  if (data.outcome === "APPLICATION" && !data.step) throw new Error("Partner access could not be confirmed. Please retry.");
  const profiles = data.outcome === "SELECTION_REQUIRED" ? parseProfiles(data.profiles) : undefined;
  return { outcome: data.outcome, organizationId: data.organizationId, step: data.step, ...(profiles ? { profiles } : {}) };
}

function parseProfiles(value: unknown): PartnerProfile[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error("Partner profiles could not be confirmed. Please retry.");
  const seen = new Set<string>();
  return value.map((raw) => {
    const item = raw as PartnerProfile;
    const keys = raw && typeof raw === "object" && !Array.isArray(raw) ? Object.keys(raw) : [];
    const expectedKeys = ["organizationId", "displayName", "reference", "status", "destinationType", "updatedAt", "selectable", "restrictedReason"];
    if (!item || keys.length !== expectedKeys.length || expectedKeys.some((key) => !keys.includes(key)) || typeof item.organizationId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.organizationId) || seen.has(item.organizationId) || typeof item.displayName !== "string" || !item.displayName.trim() || item.displayName.length > 160 || !(item.reference === null || typeof item.reference === "string") || !["DRAFT_INCOMPLETE", "READY_TO_SUBMIT", "SUBMITTED", "UNDER_REVIEW", "RESUBMITTED", "CHANGES_REQUESTED", "NOT_APPROVED", "APPROVED", "ACTIVE", "RESTRICTED"].includes(item.status) || !outcomes.includes(item.destinationType) || ["SELECTION_REQUIRED", "NO_LINKED_PROFILE"].includes(item.destinationType) || typeof item.updatedAt !== "string" || !Number.isFinite(Date.parse(item.updatedAt)) || typeof item.selectable !== "boolean" || ![null, "ACCESS_RESTRICTED"].includes(item.restrictedReason) || item.selectable !== (item.destinationType !== "RESTRICTED" && item.restrictedReason === null)) throw new Error("Partner profiles could not be confirmed. Please retry.");
    seen.add(item.organizationId);
    return { organizationId: item.organizationId, displayName: item.displayName, reference: item.reference, status: item.status, destinationType: item.destinationType, updatedAt: item.updatedAt, selectable: item.selectable, restrictedReason: item.restrictedReason };
  });
}

export function partnerAccessDestination(access: PartnerAccess): string | null {
  if (access.outcome === "APPLICATION") {
    const step = access.step === "verification_compliance" ? "documents_compliance" : access.step;
    return `/partner-preview?step=${encodeURIComponent(step!)}&organizationId=${encodeURIComponent(access.organizationId!)}`;
  }
  if (access.outcome === "CORRECTIONS") return `/partner-preview?step=review_submit&organizationId=${encodeURIComponent(access.organizationId!)}`;
  return null;
}

export async function readPartnerAccess(options: { revalidateRememberedSelection?: boolean } = {}): Promise<PartnerAccess> {
  const result = await tplApiRequest<unknown>("/api/v1/partner/access", { fallbackOnError: false });
  if (!result.ok) throw new PartnerAccessRequestError(result.status, result.status === 401 ? "Sign in again to continue." : "Partner access is unavailable. Please retry.");
  const access = parsePartnerAccess(result.data);
  const preference = readPartnerProfilePreference();
  if (access.outcome === "SELECTION_REQUIRED" && preference && options.revalidateRememberedSelection !== false) {
    if (access.profiles?.some((profile) => profile.organizationId === preference && profile.selectable)) {
      try { return await selectPartnerProfile(preference); } catch { clearPartnerProfilePreference(); }
    } else clearPartnerProfilePreference();
  }
  return access;
}

export async function selectPartnerProfile(organizationId: string): Promise<PartnerAccess> {
  const result = await tplApiRequest<unknown>("/api/v1/partner/access/select", { method: "POST", body: { organizationId }, fallbackOnError: false });
  if (!result.ok) throw new Error(result.status === 403 ? "This profile is no longer available. Choose another profile." : "Your profile could not be opened. Please retry.");
  const access = parsePartnerAccess(result.data);
  if (access.organizationId !== organizationId || ["RESTRICTED", "SELECTION_REQUIRED", "NO_LINKED_PROFILE"].includes(access.outcome)) throw new Error("This profile is no longer available. Choose another profile.");
  rememberPartnerProfile(organizationId);
  return access;
}

export async function startPartnerApplication(key: string): Promise<PartnerAccess> {
  const result = await tplApiRequest<{ access: unknown }>("/api/v1/partner/application/start", { method: "POST", body: {}, idempotencyKey: key, fallbackOnError: false });
  if (!result.ok) {
    if (result.error.code === "PARTNER_ACCESS_SUPPORT_REQUIRED") throw new Error("We couldn’t start a new application safely. Use another Partner login, choose Recover existing application, or contact Partner Support.");
    const support = ["PARTNER_ACCESS_SELECTION_REQUIRED", "PARTNER_ACCESS_RESTRICTED"].includes(result.error.code);
    throw new Error(support ? "Contact Support before starting another Partner application." : "The application could not be opened. Please retry.");
  }
  return parsePartnerAccess(result.data?.access);
}
