import type {
  CreatorActivityEventRecord,
  CreatorAssetDraftRecord,
  CreatorAssetVersionRecord,
  CreatorCollectionRecord,
  CreatorIdempotencyRecord,
  CreatorOnboardingRecord,
  CreatorUploadSessionRecord,
  CreatorWorkspaceProfileRecord,
} from "./creatorWorkspacePersistenceTypes";

type Store = {
  profiles: Map<string, CreatorWorkspaceProfileRecord>;
  onboarding: Map<string, CreatorOnboardingRecord>;
  assets: Map<string, CreatorAssetDraftRecord>;
  collections: Map<string, CreatorCollectionRecord>;
  versions: Map<string, CreatorAssetVersionRecord>;
  uploads: Map<string, CreatorUploadSessionRecord>;
  activity: CreatorActivityEventRecord[];
  idempotency: Map<string, CreatorIdempotencyRecord>;
};

const globalStore = globalThis as typeof globalThis & { __tplCreatorWorkspaceStore?: Store };

function store(): Store {
  if (!globalStore.__tplCreatorWorkspaceStore) {
    globalStore.__tplCreatorWorkspaceStore = {
      profiles: new Map(),
      onboarding: new Map(),
      assets: new Map(),
      collections: new Map(),
      versions: new Map(),
      uploads: new Map(),
      activity: [],
      idempotency: new Map(),
    };
  }
  return globalStore.__tplCreatorWorkspaceStore;
}

export type CreatorWorkspaceRepository = {
  getProfileByUser(userId: string): Promise<CreatorWorkspaceProfileRecord | null>;
  getProfileById(profileId: string): Promise<CreatorWorkspaceProfileRecord | null>;
  saveProfile(profile: CreatorWorkspaceProfileRecord): Promise<CreatorWorkspaceProfileRecord>;
  getOnboarding(profileId: string): Promise<CreatorOnboardingRecord | null>;
  saveOnboarding(record: CreatorOnboardingRecord): Promise<CreatorOnboardingRecord>;
  listAssets(profileId: string): Promise<CreatorAssetDraftRecord[]>;
  getAsset(profileId: string, assetId: string): Promise<CreatorAssetDraftRecord | null>;
  saveAsset(record: CreatorAssetDraftRecord): Promise<CreatorAssetDraftRecord>;
  listCollections(profileId: string): Promise<CreatorCollectionRecord[]>;
  getCollection(profileId: string, collectionId: string): Promise<CreatorCollectionRecord | null>;
  saveCollection(record: CreatorCollectionRecord): Promise<CreatorCollectionRecord>;
  deleteCollection(profileId: string, collectionId: string): Promise<boolean>;
  listVersions(profileId: string, assetId: string): Promise<CreatorAssetVersionRecord[]>;
  getVersion(profileId: string, assetId: string, versionId: string): Promise<CreatorAssetVersionRecord | null>;
  saveVersion(record: CreatorAssetVersionRecord): Promise<CreatorAssetVersionRecord>;
  getUpload(profileId: string, uploadId: string): Promise<CreatorUploadSessionRecord | null>;
  saveUpload(record: CreatorUploadSessionRecord): Promise<CreatorUploadSessionRecord>;
  appendActivity(event: CreatorActivityEventRecord): Promise<CreatorActivityEventRecord>;
  listActivity(profileId: string): Promise<CreatorActivityEventRecord[]>;
  getIdempotency(key: string): Promise<CreatorIdempotencyRecord | null>;
  saveIdempotency(record: CreatorIdempotencyRecord): Promise<CreatorIdempotencyRecord>;
};

export class InMemoryCreatorWorkspaceRepository implements CreatorWorkspaceRepository {
  async getProfileByUser(userId: string) {
    return Array.from(store().profiles.values()).find((profile) => profile.userId === userId) || null;
  }

  async getProfileById(profileId: string) {
    return store().profiles.get(profileId) || null;
  }

  async saveProfile(profile: CreatorWorkspaceProfileRecord) {
    const existingForUser = await this.getProfileByUser(profile.userId);
    if (existingForUser && existingForUser.id !== profile.id) throw new Error("CREATOR_PROFILE_USER_CONFLICT");
    const slugConflict = Array.from(store().profiles.values()).find((item) => item.slug === profile.slug && item.id !== profile.id);
    if (slugConflict) throw new Error("CREATOR_PROFILE_SLUG_CONFLICT");
    store().profiles.set(profile.id, profile);
    return profile;
  }

  async getOnboarding(profileId: string) {
    return Array.from(store().onboarding.values()).find((record) => record.creatorProfileId === profileId) || null;
  }

  async saveOnboarding(record: CreatorOnboardingRecord) {
    store().onboarding.set(record.id, record);
    return record;
  }

  async listAssets(profileId: string) {
    return Array.from(store().assets.values()).filter((asset) => asset.creatorProfileId === profileId);
  }

  async getAsset(profileId: string, assetId: string) {
    const asset = store().assets.get(assetId);
    return asset?.creatorProfileId === profileId ? asset : null;
  }

  async saveAsset(record: CreatorAssetDraftRecord) {
    const slugConflict = Array.from(store().assets.values()).find((item) => item.creatorProfileId === record.creatorProfileId && item.slug === record.slug && item.id !== record.id);
    if (slugConflict) throw new Error("CREATOR_ASSET_SLUG_CONFLICT");
    store().assets.set(record.id, record);
    return record;
  }

  async listCollections(profileId: string) {
    return Array.from(store().collections.values()).filter((collection) => collection.creatorProfileId === profileId);
  }

  async getCollection(profileId: string, collectionId: string) {
    const collection = store().collections.get(collectionId);
    return collection?.creatorProfileId === profileId ? collection : null;
  }

  async saveCollection(record: CreatorCollectionRecord) {
    store().collections.set(record.id, record);
    return record;
  }

  async deleteCollection(profileId: string, collectionId: string) {
    const collection = await this.getCollection(profileId, collectionId);
    if (!collection) return false;
    store().collections.delete(collectionId);
    return true;
  }

  async listVersions(profileId: string, assetId: string) {
    return Array.from(store().versions.values()).filter((version) => version.creatorProfileId === profileId && version.assetDraftId === assetId);
  }

  async getVersion(profileId: string, assetId: string, versionId: string) {
    const version = store().versions.get(versionId);
    return version?.creatorProfileId === profileId && version.assetDraftId === assetId ? version : null;
  }

  async saveVersion(record: CreatorAssetVersionRecord) {
    store().versions.set(record.id, record);
    return record;
  }

  async getUpload(profileId: string, uploadId: string) {
    const upload = store().uploads.get(uploadId);
    return upload?.creatorProfileId === profileId ? upload : null;
  }

  async saveUpload(record: CreatorUploadSessionRecord) {
    store().uploads.set(record.id, record);
    return record;
  }

  async appendActivity(event: CreatorActivityEventRecord) {
    store().activity.unshift(event);
    return event;
  }

  async listActivity(profileId: string) {
    return store().activity.filter((event) => event.creatorProfileId === profileId).slice(0, 50);
  }

  async getIdempotency(key: string) {
    return store().idempotency.get(key) || null;
  }

  async saveIdempotency(record: CreatorIdempotencyRecord) {
    store().idempotency.set(record.key, record);
    return record;
  }
}

export function createCreatorWorkspaceRepository(): CreatorWorkspaceRepository {
  return new InMemoryCreatorWorkspaceRepository();
}
