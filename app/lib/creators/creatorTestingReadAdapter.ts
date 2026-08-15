import type { AuthUser } from "@/app/lib/auth/auth.types";
import { CREATOR_ACCESS_CONTRACT_VERSION, resolveCreatorAccess, type CreatorAccessDTO, type CreatorAccessStatus } from "./creatorAccessContract";
import type { CreatorDataSource } from "./creatorDataSource";
import { creatorFallbackAllowed, creatorIntegrationFlags } from "./creatorIntegrationFlags";
import { getCreatorActivity, getCreatorDashboard, getCreatorOnboarding, getCreatorProfile, listCreatorAssets } from "./creatorWorkspaceBackendClient";
import type { CreatorActivityEventRecord, CreatorAssetDraftRecord, CreatorOnboardingRecord, CreatorWorkspaceDashboardReadModel } from "./creatorWorkspacePersistenceTypes";

export type CreatorReadEnvelope<T> = { data: T | null; source: CreatorDataSource; requestId?: string; errorCode?: string };
const statusMap: Record<string, CreatorAccessStatus> = { draft: "onboarding_draft", not_verified: "onboarding_draft", in_progress: "onboarding_draft", submitted: "submitted", under_review: "under_review", changes_requested: "changes_requested", approved: "approved", rejected: "rejected", suspended: "suspended", deactivated: "deactivated" };
function record(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
export async function readCreatorAccess(user: AuthUser): Promise<CreatorReadEnvelope<CreatorAccessDTO>> {
  if (!creatorIntegrationFlags.testApiEnabled() || !creatorIntegrationFlags.workspaceReadsEnabled()) return { data: resolveCreatorAccess(user), source: "fixture" };
  const result = await getCreatorProfile();
  if (result.ok) { const profile = record(result.data); const status = statusMap[String(profile.profileStatus ?? profile.verificationStatus ?? "not_creator")] ?? "not_creator"; const approved = status === "approved"; return { source: "testing_api", requestId: result.requestId, data: { version: CREATOR_ACCESS_CONTRACT_VERSION, userId: user.id, creatorId: typeof profile.id === "string" ? profile.id : null, status, onboardingCompleted: !["not_creator", "onboarding_draft"].includes(status), studioAccessAllowed: approved, publicProfileAllowed: approved, uploadAllowed: approved, payoutAllowed: false, moderationState: status, reason: typeof profile.reason === "string" ? profile.reason : null, updatedAt: typeof profile.updatedAt === "string" ? profile.updatedAt : null, source: "testing_api", requestId: result.requestId } }; }
  if (creatorFallbackAllowed()) return { data: resolveCreatorAccess(user), source: "fallback_fixture", requestId: result.requestId, errorCode: result.error.code };
  return { data: null, source: "unavailable", requestId: result.requestId, errorCode: result.error.code };
}
export const creatorTestingReads = { profile: getCreatorProfile, onboarding: getCreatorOnboarding, dashboard: getCreatorDashboard, assets: listCreatorAssets, activity: getCreatorActivity };

function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function fail<T>(requestId: string | undefined, code: string): CreatorReadEnvelope<T> {
  return creatorFallbackAllowed()
    ? { data: null, source: "fallback_fixture", requestId, errorCode: code }
    : { data: null, source: "unavailable", requestId, errorCode: code };
}
function compatible(value: unknown) {
  if (!isRecord(value)) return false;
  const version = value.dtoVersion ?? value.version;
  return version === undefined || version === "creator-workspace.v1" || version === 1;
}

export async function readCreatorDashboard(): Promise<CreatorReadEnvelope<CreatorWorkspaceDashboardReadModel>> {
  if (!creatorIntegrationFlags.testApiEnabled() || !creatorIntegrationFlags.workspaceReadsEnabled()) return { data: null, source: "fixture" };
  const result = await getCreatorDashboard();
  if (!result.ok) return fail(result.requestId, result.error.code);
  const data = record(result.data);
  if (!compatible(data) || typeof data.totalDrafts !== "number" || !Array.isArray(data.recentActivity)) return fail(result.requestId, "CREATOR_DTO_INCOMPATIBLE");
  return { data: result.data as CreatorWorkspaceDashboardReadModel, source: "testing_api", requestId: result.requestId };
}

export async function readCreatorAssets(): Promise<CreatorReadEnvelope<CreatorAssetDraftRecord[]>> {
  if (!creatorIntegrationFlags.testApiEnabled() || !creatorIntegrationFlags.workspaceReadsEnabled()) return { data: null, source: "fixture" };
  const result = await listCreatorAssets();
  if (!result.ok) return fail(result.requestId, result.error.code);
  const data = Array.isArray(result.data) ? result.data : isRecord(result.data) && Array.isArray(result.data.items) ? result.data.items : null;
  if (!data || data.some((item) => !compatible(item) || typeof item.id !== "string" || typeof item.slug !== "string")) return fail(result.requestId, "CREATOR_DTO_INCOMPATIBLE");
  return { data: data as CreatorAssetDraftRecord[], source: "testing_api", requestId: result.requestId };
}

export async function readCreatorOnboarding(): Promise<CreatorReadEnvelope<CreatorOnboardingRecord>> {
  if (!creatorIntegrationFlags.testApiEnabled() || !creatorIntegrationFlags.workspaceReadsEnabled()) return { data: null, source: "fixture" };
  const result = await getCreatorOnboarding();
  if (!result.ok) return fail(result.requestId, result.error.code);
  const data = record(result.data);
  if (!compatible(data) || typeof data.currentStep !== "number" || typeof data.status !== "string") return fail(result.requestId, "CREATOR_DTO_INCOMPATIBLE");
  return { data: result.data as CreatorOnboardingRecord, source: "testing_api", requestId: result.requestId };
}

export async function readCreatorActivity(): Promise<CreatorReadEnvelope<CreatorActivityEventRecord[]>> {
  if (!creatorIntegrationFlags.testApiEnabled() || !creatorIntegrationFlags.workspaceReadsEnabled()) return { data: null, source: "fixture" };
  const result = await getCreatorActivity();
  if (!result.ok) return fail(result.requestId, result.error.code);
  const data = Array.isArray(result.data) ? result.data : null;
  if (!data || data.some((item) => !compatible(item) || typeof item.eventType !== "string" || typeof item.createdAt !== "string")) return fail(result.requestId, "CREATOR_DTO_INCOMPATIBLE");
  return { data: data as CreatorActivityEventRecord[], source: "testing_api", requestId: result.requestId };
}
