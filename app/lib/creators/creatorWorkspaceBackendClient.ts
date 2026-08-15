import { tplApiRequest, type TplApiResult } from "@/app/lib/api/tplApiClient";

function workspaceBackendEnabled() {
  return process.env["NEXT_PUBLIC_TPL_CREATOR_WORKSPACE_BACKEND"] === "true";
}

function disabled<T>(): TplApiResult<T> {
  return {
    ok: false,
    error: { code: "CREATOR_WORKSPACE_BACKEND_DISABLED", message: "Creator Workspace backend is disabled." },
    status: 0,
    requestId: "creator_workspace_backend_disabled",
    fallback: true,
  };
}

function path(suffix: string) {
  return `/api/v1/creator/me${suffix}`;
}

async function request<T>(suffix: string, options: { method?: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown; idempotencyKey?: string } = {}) {
  if (!workspaceBackendEnabled()) return disabled<T>();
  return tplApiRequest<T>(path(suffix), {
    method: options.method || "GET",
    body: options.body,
    idempotencyKey: options.idempotencyKey,
    fallbackOnError: true,
  });
}

export function getCreatorProfile() {
  return request("/profile");
}

export function createCreatorProfile(body: unknown, idempotencyKey?: string) {
  return request("/profile", { method: "POST", body, idempotencyKey });
}

export function updateCreatorProfile(body: unknown, idempotencyKey?: string) {
  return request("/profile", { method: "PUT", body, idempotencyKey });
}

export function getCreatorOnboarding() {
  return request("/onboarding");
}

export function updateCreatorOnboarding(body: unknown, idempotencyKey?: string) {
  return request("/onboarding", { method: "PUT", body, idempotencyKey });
}

export function submitCreatorOnboarding(body: unknown, idempotencyKey?: string) {
  return request("/onboarding/submit", { method: "POST", body, idempotencyKey });
}

export function listCreatorAssets() {
  return request("/assets");
}

export function createCreatorAssetDraft(body: unknown, idempotencyKey?: string) {
  return request("/assets", { method: "POST", body, idempotencyKey });
}

export function getCreatorAssetDraft(assetId: string) {
  return request(`/assets/${encodeURIComponent(assetId)}`);
}

export function updateCreatorAssetDraft(assetId: string, body: unknown, idempotencyKey?: string) {
  return request(`/assets/${encodeURIComponent(assetId)}`, { method: "PUT", body, idempotencyKey });
}

export function submitCreatorAssetDraft(assetId: string, body: unknown, idempotencyKey?: string) {
  return request(`/assets/${encodeURIComponent(assetId)}/submit`, { method: "POST", body, idempotencyKey });
}

export function listCreatorCollections() {
  return request("/collections");
}

export function createCreatorCollection(body: unknown, idempotencyKey?: string) {
  return request("/collections", { method: "POST", body, idempotencyKey });
}

export function updateCreatorCollection(collectionId: string, body: unknown, idempotencyKey?: string) {
  return request(`/collections/${encodeURIComponent(collectionId)}`, { method: "PUT", body, idempotencyKey });
}

export function deleteCreatorCollection(collectionId: string, idempotencyKey?: string) {
  return request(`/collections/${encodeURIComponent(collectionId)}`, { method: "DELETE", idempotencyKey });
}

export function listCreatorVersions(assetId: string) {
  return request(`/assets/${encodeURIComponent(assetId)}/versions`);
}

export function createCreatorVersionDraft(assetId: string, body: unknown, idempotencyKey?: string) {
  return request(`/assets/${encodeURIComponent(assetId)}/versions`, { method: "POST", body, idempotencyKey });
}

export function updateCreatorVersionDraft(assetId: string, versionId: string, body: unknown, idempotencyKey?: string) {
  return request(`/assets/${encodeURIComponent(assetId)}/versions/${encodeURIComponent(versionId)}`, { method: "PUT", body, idempotencyKey });
}

export function submitCreatorVersionDraft(assetId: string, versionId: string, body: unknown, idempotencyKey?: string) {
  return request(`/assets/${encodeURIComponent(assetId)}/versions/${encodeURIComponent(versionId)}/submit`, { method: "POST", body, idempotencyKey });
}

export function createCreatorUploadSessionMetadata(body: unknown, idempotencyKey?: string) {
  return request("/upload-sessions", { method: "POST", body, idempotencyKey });
}

export function cancelCreatorUploadSessionMetadata(sessionId: string, idempotencyKey?: string) {
  return request(`/upload-sessions/${encodeURIComponent(sessionId)}/cancel`, { method: "POST", idempotencyKey });
}

export function getCreatorDashboard() {
  return request("/dashboard");
}

export function getCreatorActivity() {
  return request("/activity");
}
