import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { CreatorWorkspaceError, createCreatorWorkspacePersistenceService } from "./creatorWorkspacePersistenceService";
import {
  isCreatorAssetDraftMutationsEnabled,
  isCreatorCollectionMutationsEnabled,
  isCreatorOnboardingMutationsEnabled,
  isCreatorProfileMutationsEnabled,
  isCreatorUploadSessionMetadataEnabled,
  isCreatorVersionDraftMutationsEnabled,
  isCreatorWorkspaceBackendEnabled,
} from "./creatorWorkspaceFeatureFlags";
import type { CreatorWorkspaceUser } from "./creatorWorkspacePersistenceTypes";

function requestId() {
  return `creator_workspace_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function creatorWorkspaceOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data, meta: { requestId: requestId(), persistent: true, transactionAllowed: false } }, { status });
}

export function creatorWorkspaceError(code: string, message: string, status = 400) {
  return NextResponse.json({ ok: false, error: { code, message }, meta: { requestId: requestId() } }, { status });
}

export function requireCreatorWorkspaceBackend() {
  return isCreatorWorkspaceBackendEnabled();
}

export function getCreatorWorkspaceUser(request: Request): CreatorWorkspaceUser | null {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();
  if (!token) return null;
  if (token.startsWith("user:")) return { userId: token.slice(5) || "creator-user", authMode: "bearer" };
  const digest = createHash("sha256").update(token).digest("hex").slice(0, 16);
  return { userId: `auth_${digest}`, authMode: "bearer" };
}

export async function readCreatorWorkspaceBody(request: Request) {
  const text = await request.text();
  if (text.length > 96_000) throw new CreatorWorkspaceError("CREATOR_PAYLOAD_TOO_LARGE", "Creator workspace payload is too large.", 413);
  if (!text.trim()) return {};
  const parsed = JSON.parse(text) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new CreatorWorkspaceError("CREATOR_INVALID_JSON", "Creator workspace payload must be a JSON object.", 400);
  return parsed as Record<string, unknown>;
}

export async function handleCreatorWorkspaceRequest(request: Request, path: string[] = []) {
  if (!requireCreatorWorkspaceBackend()) return creatorWorkspaceError("CREATOR_WORKSPACE_BACKEND_DISABLED", "Creator workspace backend is unavailable.", 404);
  const user = getCreatorWorkspaceUser(request);
  if (!user) return creatorWorkspaceError("CREATOR_AUTH_REQUIRED", "Creator workspace requires an authenticated TPL user.", 401);

  const service = createCreatorWorkspacePersistenceService();
  const method = request.method.toUpperCase();
  const body = method === "GET" ? {} : await readCreatorWorkspaceBody(request);
  const idempotencyKey = request.headers.get("idempotency-key");

  try {
    const result = await dispatch(service, user, method, path, body, idempotencyKey);
    return creatorWorkspaceOk(result, method === "POST" ? 201 : 200);
  } catch (error) {
    if (error instanceof CreatorWorkspaceError) return creatorWorkspaceError(error.code, error.message, error.status);
    const code = error instanceof Error ? error.message : "CREATOR_WORKSPACE_ERROR";
    return creatorWorkspaceError(code.startsWith("CREATOR_") ? code : "CREATOR_WORKSPACE_ERROR", "Creator workspace request failed.", code.endsWith("CONFLICT") ? 409 : 400);
  }
}

async function dispatch(service: ReturnType<typeof createCreatorWorkspacePersistenceService>, user: CreatorWorkspaceUser, method: string, path: string[], body: Record<string, unknown>, key: string | null) {
  const [first, second, third, fourth, fifth] = path;

  if (first === "profile") {
    if (method === "GET") return service.getProfile(user);
    if ((method === "POST" || method === "PUT") && isCreatorProfileMutationsEnabled()) return service.idempotent(user.userId, `profile:${method}`, key, body, () => service.upsertProfile(user, body));
  }

  if (first === "onboarding") {
    if (method === "GET") return service.getOnboarding(user);
    if (method === "PUT" && isCreatorOnboardingMutationsEnabled()) return service.idempotent(user.userId, "onboarding:save", key, body, () => service.saveOnboarding(user, body));
    if (method === "POST" && second === "submit" && isCreatorOnboardingMutationsEnabled()) return service.idempotent(user.userId, "onboarding:submit", key, body, () => service.saveOnboarding(user, body, true));
  }

  if (first === "assets") {
    if (method === "GET" && !second) return service.listAssets(user);
    if (method === "POST" && !second && isCreatorAssetDraftMutationsEnabled()) return service.idempotent(user.userId, "asset:create", key, body, () => service.saveAsset(user, body));
    if (method === "GET" && second && !third) return service.getAsset(user, second);
    if (method === "PUT" && second && !third && isCreatorAssetDraftMutationsEnabled()) return service.idempotent(user.userId, `asset:update:${second}`, key, body, () => service.saveAsset(user, body, second));
    if (method === "POST" && second && third === "submit" && isCreatorAssetDraftMutationsEnabled()) return service.idempotent(user.userId, `asset:submit:${second}`, key, body, () => service.saveAsset(user, body, second, true));
    if (third === "versions") {
      if (method === "GET" && !fourth) return service.listVersions(user, second);
      if (method === "POST" && !fourth && isCreatorVersionDraftMutationsEnabled()) return service.idempotent(user.userId, `version:create:${second}`, key, body, () => service.saveVersion(user, second, body));
      if (method === "PUT" && fourth && !fifth && isCreatorVersionDraftMutationsEnabled()) return service.idempotent(user.userId, `version:update:${fourth}`, key, body, () => service.saveVersion(user, second, body, fourth));
      if (method === "POST" && fourth && fifth === "submit" && isCreatorVersionDraftMutationsEnabled()) return service.idempotent(user.userId, `version:submit:${fourth}`, key, body, () => service.saveVersion(user, second, body, fourth, true));
    }
  }

  if (first === "collections") {
    if (method === "GET" && !second) return service.listCollections(user);
    if (method === "POST" && !second && isCreatorCollectionMutationsEnabled()) return service.idempotent(user.userId, "collection:create", key, body, () => service.saveCollection(user, body));
    if (method === "GET" && second) {
      const collections = await service.listCollections(user);
      const collection = collections.find((item) => item.id === second);
      if (!collection) throw new CreatorWorkspaceError("CREATOR_COLLECTION_NOT_FOUND", "Creator collection was not found.", 404);
      return collection;
    }
    if (method === "PUT" && second && isCreatorCollectionMutationsEnabled()) return service.idempotent(user.userId, `collection:update:${second}`, key, body, () => service.saveCollection(user, body, second));
    if (method === "DELETE" && second && isCreatorCollectionMutationsEnabled()) return service.idempotent(user.userId, `collection:delete:${second}`, key, body, () => service.deleteCollection(user, second));
  }

  if (first === "upload-sessions") {
    if (method === "POST" && !second && isCreatorUploadSessionMetadataEnabled()) return service.idempotent(user.userId, "upload:create", key, body, () => service.createUpload(user, body));
    if (method === "GET" && second) return service.getUpload(user, second);
    if (method === "POST" && second && third === "cancel" && isCreatorUploadSessionMetadataEnabled()) return service.idempotent(user.userId, `upload:cancel:${second}`, key, body, () => service.cancelUpload(user, second));
  }

  if (first === "dashboard" && method === "GET") return service.dashboard(user);
  if (first === "activity" && method === "GET") return service.activityFor(user);

  throw new CreatorWorkspaceError("CREATOR_WORKSPACE_ROUTE_DISABLED", "Creator workspace route or mutation is disabled.", 404);
}
