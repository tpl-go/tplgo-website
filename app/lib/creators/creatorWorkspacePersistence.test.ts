import assert from "node:assert/strict";
import test from "node:test";
import { GET, POST, PUT, DELETE } from "../../api/v1/creator/me/[[...path]]/route";

const flags = [
  "TPL_CREATOR_WORKSPACE_BACKEND_ENABLED",
  "TPL_CREATOR_PROFILE_MUTATIONS_ENABLED",
  "TPL_CREATOR_ONBOARDING_MUTATIONS_ENABLED",
  "TPL_CREATOR_ASSET_DRAFT_MUTATIONS_ENABLED",
  "TPL_CREATOR_COLLECTION_MUTATIONS_ENABLED",
  "TPL_CREATOR_VERSION_DRAFT_MUTATIONS_ENABLED",
  "TPL_CREATOR_UPLOAD_SESSION_METADATA_ENABLED",
] as const;

async function withFlags(run: () => Promise<void> | void) {
  const previous = new Map<string, string | undefined>();
  for (const flag of flags) {
    previous.set(flag, process.env[flag]);
    process.env[flag] = "true";
  }
  try {
    await run();
  } finally {
    for (const flag of flags) {
      const value = previous.get(flag);
      if (value === undefined) delete process.env[flag];
      else process.env[flag] = value;
    }
  }
}

function req(method: string, body?: unknown, key?: string, token = "user:creator-test-user") {
  return new Request("http://localhost/api/v1/creator/me", {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(key ? { "Idempotency-Key": key } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function parse(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

const params = (path: string[]) => ({ params: Promise.resolve({ path }) });

test("Creator workspace backend is disabled and unauthenticated access is denied", async () => {
  const disabled = await parse(await GET(req("GET"), params(["profile"])));
  assert.equal(disabled.ok, false);
  assert.equal((disabled.error as Record<string, unknown>).code, "CREATOR_WORKSPACE_BACKEND_DISABLED");

  await withFlags(async () => {
    const response = await GET(new Request("http://localhost/api/v1/creator/me/profile"), params(["profile"]));
    const body = await parse(response);
    assert.equal(response.status, 401);
    assert.equal((body.error as Record<string, unknown>).code, "CREATOR_AUTH_REQUIRED");
  });
});

test("Creator profile, onboarding, asset, collection, version, upload metadata and dashboard persist behind auth", async () => {
  await withFlags(async () => {
    const profile = await parse(await POST(req("POST", { displayName: "Backend Creator", slug: "backend-creator", categories: ["photos"] }, "profile-create"), params(["profile"])));
    assert.equal(profile.ok, true);
    const profileData = profile.data as Record<string, unknown>;
    assert.equal(profileData.userId, "creator-test-user");

    const onboarding = await parse(await PUT(req("PUT", { currentStep: 5, profileSnapshot: { displayName: "Backend Creator" } }, "onboarding-save"), params(["onboarding"])));
    assert.equal((onboarding.data as Record<string, unknown>).status, "in_progress");

    const submittedOnboarding = await parse(await POST(req("POST", {}, "onboarding-submit"), params(["onboarding", "submit"])));
    assert.equal((submittedOnboarding.data as Record<string, unknown>).status, "submitted");

    const asset = await parse(await POST(req("POST", { title: "Backend Asset", assetType: "photo", category: "photos", slug: "backend-asset" }, "asset-create"), params(["assets"])));
    const assetData = asset.data as Record<string, unknown>;
    assert.equal(assetData.publishStatus, "unpublished");
    assert.equal(assetData.moderationStatus, "not_submitted");

    const submittedAsset = await parse(await POST(req("POST", {}, "asset-submit"), params(["assets", String(assetData.id), "submit"])));
    assert.equal((submittedAsset.data as Record<string, unknown>).moderationStatus, "submitted");

    const collection = await parse(await POST(req("POST", { title: "Backend Collection", assetDraftIds: [assetData.id] }, "collection-create"), params(["collections"])));
    assert.equal((collection.data as Record<string, unknown>).visibility, "private");

    const version = await parse(await POST(req("POST", { semanticVersion: "0.2.0" }, "version-create"), params(["assets", String(assetData.id), "versions"])));
    assert.equal((version.data as Record<string, unknown>).status, "draft");

    const upload = await parse(await POST(req("POST", { assetDraftId: assetData.id, uploadType: "source_file", fileName: "source.zip", sizeBytes: 10 }, "upload-create"), params(["upload-sessions"])));
    const uploadData = upload.data as Record<string, unknown>;
    assert.equal(uploadData.providerName, "metadata_only");
    assert.equal(((uploadData.permissions as Record<string, unknown>).storageWriteAllowed), false);
    assert.equal(((uploadData.permissions as Record<string, unknown>).signedUploadUrlGenerated), false);

    const dashboard = await parse(await GET(req("GET"), params(["dashboard"])));
    assert.equal((dashboard.data as Record<string, unknown>).totalDrafts, 1);
    assert.equal(((dashboard.data as Record<string, unknown>).commercialMetrics as Record<string, unknown>).sales, 0);

    const activity = await parse(await GET(req("GET"), params(["activity"])));
    assert.ok(Array.isArray(activity.data));
    assert.ok((activity.data as unknown[]).length >= 1);
  });
});

test("Creator workspace rejects protected status escalation and invalid asset types", async () => {
  await withFlags(async () => {
    await POST(req("POST", { displayName: "Guard Creator", slug: `guard-creator-${Date.now()}` }, "guard-profile"), params(["profile"]));

    const invalid = await parse(await POST(req("POST", { title: "Bad", assetType: "spaceship" }, "bad-asset"), params(["assets"])));
    assert.equal(invalid.ok, false);
    assert.equal((invalid.error as Record<string, unknown>).code, "CREATOR_INVALID_ASSET_TYPE");

    const escalation = await parse(await POST(req("POST", { title: "Escalation", assetType: "photo", moderationStatus: "approved", publishStatus: "published" }, "asset-escalation"), params(["assets"])));
    assert.equal(escalation.ok, true);
    assert.notEqual((escalation.data as Record<string, unknown>).moderationStatus, "approved");
    assert.notEqual((escalation.data as Record<string, unknown>).publishStatus, "published");
  });
});

test("Creator workspace idempotency replays same request and conflicts on different body", async () => {
  await withFlags(async () => {
    const first = await parse(await POST(req("POST", { displayName: "Idempotent Creator", slug: `idem-${Date.now()}` }, "same-profile-key"), params(["profile"])));
    const replay = await parse(await POST(req("POST", { displayName: "Idempotent Creator", slug: (first.data as Record<string, unknown>).slug }, "same-profile-key"), params(["profile"])));
    assert.equal((first.data as Record<string, unknown>).id, (replay.data as Record<string, unknown>).id);

    const conflictResponse = await POST(req("POST", { displayName: "Changed Creator", slug: `idem-conflict-${Date.now()}` }, "same-profile-key"), params(["profile"]));
    const conflict = await parse(conflictResponse);
    assert.equal(conflictResponse.status, 409);
    assert.equal((conflict.error as Record<string, unknown>).code, "CREATOR_IDEMPOTENCY_CONFLICT");
  });
});

test("Creator workspace enforces ownership across users", async () => {
  await withFlags(async () => {
    await POST(req("POST", { displayName: "Owner Creator", slug: `owner-${Date.now()}` }, "owner-profile", "user:owner-a"), params(["profile"]));
    const asset = await parse(await POST(req("POST", { title: "Private Asset", assetType: "photo" }, "owner-asset", "user:owner-a"), params(["assets"])));
    const response = await GET(req("GET", undefined, undefined, "user:owner-b"), params(["assets", String((asset.data as Record<string, unknown>).id)]));
    const body = await parse(response);
    assert.equal(response.status, 404);
    assert.equal((body.error as Record<string, unknown>).code, "CREATOR_PROFILE_REQUIRED");
  });
});

test("Creator collection delete is idempotency guarded and no provider/upload side effects are exposed", async () => {
  await withFlags(async () => {
    await POST(req("POST", { displayName: "Delete Creator", slug: `delete-${Date.now()}` }, "delete-profile"), params(["profile"]));
    const collection = await parse(await POST(req("POST", { title: "Temporary Collection" }, "delete-collection-create"), params(["collections"])));
    const collectionId = String((collection.data as Record<string, unknown>).id);
    const deleted = await parse(await DELETE(req("DELETE", {}, "delete-collection-key"), params(["collections", collectionId])));
    assert.equal((deleted.data as Record<string, unknown>).deleted, true);

    const upload = await parse(await POST(req("POST", { fileName: "safe.mov" }, "safe-upload"), params(["upload-sessions"])));
    const json = JSON.stringify(upload);
    assert.equal(json.includes("objectKey"), false);
    assert.equal(json.includes("https://"), false);
    assert.equal(json.includes("presigned"), false);
    assert.equal(json.includes("providerSessionCreated\":true"), false);
    assert.equal(json.includes("signedUploadUrlGenerated\":true"), false);
  });
});
