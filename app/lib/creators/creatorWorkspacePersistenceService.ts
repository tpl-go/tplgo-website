import { createHash } from "node:crypto";
import { createCreatorWorkspaceRepository, type CreatorWorkspaceRepository } from "./creatorWorkspaceRepository";
import type {
  CreatorActivityEventRecord,
  CreatorAssetDraftRecord,
  CreatorAssetVersionRecord,
  CreatorCollectionRecord,
  CreatorJson,
  CreatorOnboardingRecord,
  CreatorUploadSessionRecord,
  CreatorWorkspaceDashboardReadModel,
  CreatorWorkspaceProfileRecord,
  CreatorWorkspaceUser,
} from "./creatorWorkspacePersistenceTypes";

const allowedAssetTypes = new Set(["photo", "video", "drone footage", "graphic", "template", "ui kit", "website template", "presentation template", "font", "icon", "illustration", "audio", "music", "sound effect", "preset", "lut", "e-book", "guide", "map", "itinerary", "route pack", "ai asset", "bundle"]);

function now() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || `creator-${Date.now()}`;
}

function text(body: Record<string, unknown>, key: string, fallback = "") {
  const value = body[key];
  return typeof value === "string" ? value.trim().slice(0, 2000) : fallback;
}

function json(body: Record<string, unknown>, key: string, fallback: CreatorJson): CreatorJson {
  const value = body[key];
  if (value === undefined) return fallback;
  return JSON.parse(JSON.stringify(value)) as CreatorJson;
}

function hash(body: unknown) {
  return createHash("sha256").update(JSON.stringify(body)).digest("hex");
}

export class CreatorWorkspaceError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
  }
}

export class CreatorWorkspacePersistenceService {
  constructor(private readonly repository: CreatorWorkspaceRepository = createCreatorWorkspaceRepository()) {}

  async idempotent<T>(userId: string, operation: string, key: string | null, body: unknown, run: () => Promise<T>) {
    if (!key) return run();
    const requestHash = hash(body);
    const existing = await this.repository.getIdempotency(key);
    if (existing) {
      if (existing.userId !== userId || existing.operation !== operation) throw new CreatorWorkspaceError("CREATOR_IDEMPOTENCY_CONFLICT", "Creator idempotency key conflicts with a different operation.", 409);
      if (existing.requestHash !== requestHash) throw new CreatorWorkspaceError("CREATOR_IDEMPOTENCY_CONFLICT", "Creator idempotency key conflicts with a different request body.", 409);
      return existing.response as T;
    }
    const response = await run();
    const timestamp = now();
    await this.repository.saveIdempotency({ key, userId, operation, requestHash, response: response as CreatorJson, status: "completed", createdAt: timestamp, updatedAt: timestamp });
    return response;
  }

  async getProfile(user: CreatorWorkspaceUser) {
    return this.repository.getProfileByUser(user.userId);
  }

  async upsertProfile(user: CreatorWorkspaceUser, body: Record<string, unknown>) {
    const timestamp = now();
    const existing = await this.repository.getProfileByUser(user.userId);
    const displayName = text(body, "displayName", existing?.displayName || "Creator");
    const profile: CreatorWorkspaceProfileRecord = {
      id: existing?.id || id("creator_profile"),
      userId: user.userId,
      slug: text(body, "slug", existing?.slug || slugify(displayName)),
      displayName,
      bio: text(body, "bio", existing?.bio || ""),
      avatarReference: text(body, "avatarReference", existing?.avatarReference || "") || null,
      coverReference: text(body, "coverReference", existing?.coverReference || "") || null,
      creatorType: text(body, "creatorType", existing?.creatorType || "individual"),
      categories: json(body, "categories", existing?.categories || []),
      skills: json(body, "skills", existing?.skills || []),
      location: json(body, "location", existing?.location || {}),
      languages: json(body, "languages", existing?.languages || []),
      portfolioLinks: json(body, "portfolioLinks", existing?.portfolioLinks || []),
      verificationStatus: existing?.verificationStatus || "not_verified",
      supportPolicy: text(body, "supportPolicy", existing?.supportPolicy || "") || null,
      copyrightDeclaration: text(body, "copyrightDeclaration", existing?.copyrightDeclaration || "") || null,
      aiPolicyAcknowledged: Boolean(body.aiPolicyAcknowledged ?? existing?.aiPolicyAcknowledged ?? false),
      profileStatus: existing?.profileStatus || "draft",
      createdAt: existing?.createdAt || timestamp,
      updatedAt: timestamp,
    };
    const saved = await this.repository.saveProfile(profile);
    await this.activity(saved, existing ? "creator.profile.updated" : "creator.profile.created", "profile", saved.id);
    return saved;
  }

  async requireProfile(user: CreatorWorkspaceUser) {
    const profile = await this.getProfile(user);
    if (!profile) throw new CreatorWorkspaceError("CREATOR_PROFILE_REQUIRED", "Create a Creator profile before using this workspace resource.", 404);
    return profile;
  }

  async getOnboarding(user: CreatorWorkspaceUser) {
    const profile = await this.requireProfile(user);
    return (await this.repository.getOnboarding(profile.id)) || this.buildOnboarding(profile, {});
  }

  async saveOnboarding(user: CreatorWorkspaceUser, body: Record<string, unknown>, submit = false) {
    const profile = await this.requireProfile(user);
    const existing = await this.repository.getOnboarding(profile.id);
    if (existing && ["approved", "rejected", "suspended"].includes(existing.status)) throw new CreatorWorkspaceError("CREATOR_ONBOARDING_TRANSITION_REJECTED", "Creator cannot change reviewed onboarding state.", 409);
    const record = this.buildOnboarding(profile, body, existing || undefined);
    record.status = submit ? "submitted" : text(body, "status", existing?.status || "in_progress") as CreatorOnboardingRecord["status"];
    if (!["not_started", "in_progress", "submitted", "changes_requested"].includes(record.status)) throw new CreatorWorkspaceError("CREATOR_ONBOARDING_STATUS_REJECTED", "Creator cannot set this onboarding status.", 409);
    record.submittedAt = submit ? now() : existing?.submittedAt || null;
    const saved = await this.repository.saveOnboarding(record);
    await this.activity(profile, submit ? "creator.onboarding.submitted" : "creator.onboarding.saved", "onboarding", saved.id);
    return saved;
  }

  async listAssets(user: CreatorWorkspaceUser) {
    const profile = await this.requireProfile(user);
    return this.repository.listAssets(profile.id);
  }

  async getAsset(user: CreatorWorkspaceUser, assetId: string) {
    const profile = await this.requireProfile(user);
    const asset = await this.repository.getAsset(profile.id, assetId);
    if (!asset) throw new CreatorWorkspaceError("CREATOR_ASSET_NOT_FOUND", "Creator asset draft was not found.", 404);
    return asset;
  }

  async saveAsset(user: CreatorWorkspaceUser, body: Record<string, unknown>, assetId?: string, submit = false) {
    const profile = await this.requireProfile(user);
    const existing = assetId ? await this.repository.getAsset(profile.id, assetId) : null;
    const title = text(body, "title", existing?.title || "Untitled asset draft");
    const assetType = text(body, "assetType", existing?.assetType || "photo").toLowerCase();
    if (!allowedAssetTypes.has(assetType)) throw new CreatorWorkspaceError("CREATOR_INVALID_ASSET_TYPE", "Unsupported Creator asset type.", 400);
    if (existing?.publishStatus === "published") throw new CreatorWorkspaceError("CREATOR_PUBLISHED_MUTATION_REJECTED", "Creator cannot directly mutate a published asset.", 409);
    const timestamp = now();
    const record: CreatorAssetDraftRecord = {
      id: existing?.id || id("creator_asset"),
      creatorProfileId: profile.id,
      userId: user.userId,
      slug: text(body, "slug", existing?.slug || slugify(title)),
      assetType,
      title,
      subtitle: text(body, "subtitle", existing?.subtitle || ""),
      description: text(body, "description", existing?.description || ""),
      category: text(body, "category", existing?.category || "photos"),
      subcategory: text(body, "subcategory", existing?.subcategory || ""),
      tags: json(body, "tags", existing?.tags || []),
      previewMediaMetadata: json(body, "previewMediaMetadata", existing?.previewMediaMetadata || []),
      sourceFileMetadata: json(body, "sourceFileMetadata", existing?.sourceFileMetadata || []),
      technicalSpecifications: json(body, "technicalSpecifications", existing?.technicalSpecifications || {}),
      supportedLicenses: json(body, "supportedLicenses", existing?.supportedLicenses || []),
      pricingMetadata: json(body, "pricingMetadata", existing?.pricingMetadata || {}),
      copyrightMetadata: json(body, "copyrightMetadata", existing?.copyrightMetadata || {}),
      releaseMetadata: json(body, "releaseMetadata", existing?.releaseMetadata || {}),
      aiGeneratedDisclosure: json(body, "aiGeneratedDisclosure", existing?.aiGeneratedDisclosure || {}),
      supportPolicy: json(body, "supportPolicy", existing?.supportPolicy || {}),
      versionPolicy: json(body, "versionPolicy", existing?.versionPolicy || {}),
      moderationStatus: submit ? "submitted" : existing?.moderationStatus || "not_submitted",
      publishStatus: existing?.publishStatus || "unpublished",
      draftStatus: submit ? "submitted" : text(body, "draftStatus", existing?.draftStatus || "draft") as CreatorAssetDraftRecord["draftStatus"],
      createdAt: existing?.createdAt || timestamp,
      updatedAt: timestamp,
      submittedAt: submit ? timestamp : existing?.submittedAt || null,
    };
    if (record.publishStatus === "published" || record.moderationStatus === "approved") throw new CreatorWorkspaceError("CREATOR_STATUS_ESCALATION_REJECTED", "Creator cannot self-approve or self-publish.", 409);
    const saved = await this.repository.saveAsset(record);
    await this.activity(profile, submit ? "creator.asset.submitted" : existing ? "creator.asset.draft.updated" : "creator.asset.draft.created", "asset", saved.id);
    return saved;
  }

  async listCollections(user: CreatorWorkspaceUser) {
    const profile = await this.requireProfile(user);
    return this.repository.listCollections(profile.id);
  }

  async saveCollection(user: CreatorWorkspaceUser, body: Record<string, unknown>, collectionId?: string) {
    const profile = await this.requireProfile(user);
    const existing = collectionId ? await this.repository.getCollection(profile.id, collectionId) : null;
    const title = text(body, "title", existing?.title || "Untitled collection");
    const assetDraftIds = Array.isArray(body.assetDraftIds) ? body.assetDraftIds.filter((item): item is string => typeof item === "string") : existing?.assetDraftIds || [];
    for (const assetId of assetDraftIds) {
      if (!(await this.repository.getAsset(profile.id, assetId))) throw new CreatorWorkspaceError("CREATOR_COLLECTION_ASSET_OWNERSHIP_REJECTED", "Collection can include only the Creator's own asset drafts.", 403);
    }
    const timestamp = now();
    const record: CreatorCollectionRecord = {
      id: existing?.id || id("creator_collection"),
      creatorProfileId: profile.id,
      userId: user.userId,
      slug: text(body, "slug", existing?.slug || slugify(title)),
      title,
      description: text(body, "description", existing?.description || ""),
      coverReference: text(body, "coverReference", existing?.coverReference || "") || null,
      visibility: "private",
      featuredPreview: Boolean(body.featuredPreview ?? existing?.featuredPreview ?? false),
      bundleReadiness: Boolean(body.bundleReadiness ?? existing?.bundleReadiness ?? false),
      status: text(body, "status", existing?.status || "draft") as CreatorCollectionRecord["status"],
      assetDraftIds,
      createdAt: existing?.createdAt || timestamp,
      updatedAt: timestamp,
    };
    const saved = await this.repository.saveCollection(record);
    await this.activity(profile, existing ? "creator.collection.updated" : "creator.collection.created", "collection", saved.id);
    return saved;
  }

  async deleteCollection(user: CreatorWorkspaceUser, collectionId: string) {
    const profile = await this.requireProfile(user);
    const deleted = await this.repository.deleteCollection(profile.id, collectionId);
    if (!deleted) throw new CreatorWorkspaceError("CREATOR_COLLECTION_NOT_FOUND", "Creator collection was not found.", 404);
    await this.activity(profile, "creator.collection.updated", "collection", collectionId, { deleted: true });
    return { deleted: true };
  }

  async listVersions(user: CreatorWorkspaceUser, assetId: string) {
    const profile = await this.requireProfile(user);
    if (!(await this.repository.getAsset(profile.id, assetId))) throw new CreatorWorkspaceError("CREATOR_ASSET_NOT_FOUND", "Creator asset draft was not found.", 404);
    return this.repository.listVersions(profile.id, assetId);
  }

  async saveVersion(user: CreatorWorkspaceUser, assetId: string, body: Record<string, unknown>, versionId?: string, submit = false) {
    const profile = await this.requireProfile(user);
    if (!(await this.repository.getAsset(profile.id, assetId))) throw new CreatorWorkspaceError("CREATOR_ASSET_NOT_FOUND", "Creator asset draft was not found.", 404);
    const existing = versionId ? await this.repository.getVersion(profile.id, assetId, versionId) : null;
    if (existing && ["approved", "rejected", "archived"].includes(existing.status)) throw new CreatorWorkspaceError("CREATOR_VERSION_TRANSITION_REJECTED", "Creator cannot mutate reviewed or archived versions.", 409);
    const timestamp = now();
    const record: CreatorAssetVersionRecord = {
      id: existing?.id || id("creator_version"),
      assetDraftId: assetId,
      creatorProfileId: profile.id,
      semanticVersion: text(body, "semanticVersion", existing?.semanticVersion || "0.1.0"),
      changelog: json(body, "changelog", existing?.changelog || []),
      releaseNotes: text(body, "releaseNotes", existing?.releaseNotes || ""),
      fileSetMetadata: json(body, "fileSetMetadata", existing?.fileSetMetadata || []),
      compatibility: json(body, "compatibility", existing?.compatibility || []),
      buyerAccessPolicy: text(body, "buyerAccessPolicy", existing?.buyerAccessPolicy || "purchased_version_only"),
      supportWindow: text(body, "supportWindow", existing?.supportWindow || ""),
      status: submit ? "submitted" : text(body, "status", existing?.status || "draft") as CreatorAssetVersionRecord["status"],
      createdAt: existing?.createdAt || timestamp,
      updatedAt: timestamp,
      submittedAt: submit ? timestamp : existing?.submittedAt || null,
    };
    if (record.status === "approved") throw new CreatorWorkspaceError("CREATOR_VERSION_SELF_APPROVAL_REJECTED", "Creator cannot self-approve versions.", 409);
    const saved = await this.repository.saveVersion(record);
    await this.activity(profile, submit ? "creator.version.submitted" : "creator.version.draft.created", "version", saved.id);
    return saved;
  }

  async createUpload(user: CreatorWorkspaceUser, body: Record<string, unknown>) {
    const profile = await this.requireProfile(user);
    const assetDraftId = text(body, "assetDraftId", "");
    if (assetDraftId && !(await this.repository.getAsset(profile.id, assetDraftId))) throw new CreatorWorkspaceError("CREATOR_ASSET_NOT_FOUND", "Creator asset draft was not found.", 404);
    const timestamp = now();
    const record: CreatorUploadSessionRecord = {
      id: id("creator_upload"),
      creatorProfileId: profile.id,
      userId: user.userId,
      assetDraftId: assetDraftId || null,
      uploadType: text(body, "uploadType", "preview_media"),
      fileName: text(body, "fileName", "metadata-only.file"),
      contentType: text(body, "contentType", "application/octet-stream"),
      sizeBytes: Math.max(Number(body.sizeBytes || 0), 0),
      checksumMetadata: json(body, "checksumMetadata", {}),
      providerName: "metadata_only",
      sessionStatus: "created",
      expiresAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      metadata: json(body, "metadata", {}),
      permissions: { providerSessionCreated: false, signedUploadUrlGenerated: false, storageWriteAllowed: false, malwareScanStarted: false, mediaProcessingStarted: false },
    };
    const saved = await this.repository.saveUpload(record);
    await this.activity(profile, "creator.upload.session.metadata.created", "upload", saved.id);
    return saved;
  }

  async cancelUpload(user: CreatorWorkspaceUser, uploadId: string) {
    const profile = await this.requireProfile(user);
    const existing = await this.repository.getUpload(profile.id, uploadId);
    if (!existing) throw new CreatorWorkspaceError("CREATOR_UPLOAD_SESSION_NOT_FOUND", "Creator upload-session metadata was not found.", 404);
    const saved = await this.repository.saveUpload({ ...existing, sessionStatus: "cancelled", updatedAt: now() });
    await this.activity(profile, "creator.upload.session.cancelled", "upload", saved.id);
    return saved;
  }

  async getUpload(user: CreatorWorkspaceUser, uploadId: string) {
    const profile = await this.requireProfile(user);
    const upload = await this.repository.getUpload(profile.id, uploadId);
    if (!upload) throw new CreatorWorkspaceError("CREATOR_UPLOAD_SESSION_NOT_FOUND", "Creator upload-session metadata was not found.", 404);
    return upload;
  }

  async dashboard(user: CreatorWorkspaceUser): Promise<CreatorWorkspaceDashboardReadModel> {
    const profile = await this.getProfile(user);
    if (!profile) {
      return { profileStatus: "missing", onboardingStatus: "not_started", totalDrafts: 0, submittedAssets: 0, changesRequested: 0, approvedAssets: 0, publishedCountPreview: 0, collectionCount: 0, versionDrafts: 0, uploadSessionMetadataCount: 0, commercialMetrics: { sales: 0, earnings: 0, downloads: 0, payouts: 0, unavailableUntilCommercePhase: true }, recentActivity: [] };
    }
    const [onboarding, assets, collections, activity] = await Promise.all([this.repository.getOnboarding(profile.id), this.repository.listAssets(profile.id), this.repository.listCollections(profile.id), this.repository.listActivity(profile.id)]);
    const versions = (await Promise.all(assets.map((asset) => this.repository.listVersions(profile.id, asset.id)))).flat();
    return {
      profileStatus: profile.profileStatus,
      onboardingStatus: onboarding?.status || "not_started",
      totalDrafts: assets.length,
      submittedAssets: assets.filter((asset) => asset.draftStatus === "submitted").length,
      changesRequested: assets.filter((asset) => asset.moderationStatus === "changes_requested").length,
      approvedAssets: assets.filter((asset) => asset.moderationStatus === "approved").length,
      publishedCountPreview: 0,
      collectionCount: collections.length,
      versionDrafts: versions.filter((version) => version.status === "draft").length,
      uploadSessionMetadataCount: 0,
      commercialMetrics: { sales: 0, earnings: 0, downloads: 0, payouts: 0, unavailableUntilCommercePhase: true },
      recentActivity: activity,
    };
  }

  async activityFor(user: CreatorWorkspaceUser) {
    const profile = await this.requireProfile(user);
    return this.repository.listActivity(profile.id);
  }

  private buildOnboarding(profile: CreatorWorkspaceProfileRecord, body: Record<string, unknown>, existing?: CreatorOnboardingRecord): CreatorOnboardingRecord {
    const timestamp = now();
    return {
      id: existing?.id || id("creator_onboarding"),
      creatorProfileId: profile.id,
      userId: profile.userId,
      status: existing?.status || "not_started",
      currentStep: Math.max(Number(body.currentStep ?? existing?.currentStep ?? 1), 1),
      identitySnapshot: json(body, "identitySnapshot", existing?.identitySnapshot || {}),
      profileSnapshot: json(body, "profileSnapshot", existing?.profileSnapshot || {}),
      expertiseSnapshot: json(body, "expertiseSnapshot", existing?.expertiseSnapshot || {}),
      portfolioSnapshot: json(body, "portfolioSnapshot", existing?.portfolioSnapshot || {}),
      taxReadiness: json(body, "taxReadiness", existing?.taxReadiness || {}),
      payoutReadiness: json(body, "payoutReadiness", existing?.payoutReadiness || {}),
      agreements: json(body, "agreements", existing?.agreements || {}),
      copyrightDeclaration: json(body, "copyrightDeclaration", existing?.copyrightDeclaration || {}),
      aiPolicyAcknowledgement: json(body, "aiPolicyAcknowledgement", existing?.aiPolicyAcknowledgement || {}),
      submittedAt: existing?.submittedAt || null,
      reviewedAt: existing?.reviewedAt || null,
      changesRequestedAt: existing?.changesRequestedAt || null,
      createdAt: existing?.createdAt || timestamp,
      updatedAt: timestamp,
    };
  }

  private async activity(profile: CreatorWorkspaceProfileRecord, eventType: string, resourceType: string, resourceId: string, metadata: CreatorJson = {}) {
    const event: CreatorActivityEventRecord = { id: id("creator_activity"), creatorProfileId: profile.id, userId: profile.userId, eventType, resourceType, resourceId, metadata, createdAt: now() };
    return this.repository.appendActivity(event);
  }
}

export function createCreatorWorkspacePersistenceService() {
  return new CreatorWorkspacePersistenceService();
}
