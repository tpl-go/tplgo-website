export type CreatorJson = Record<string, unknown> | unknown[] | string | number | boolean | null;

export type CreatorProfileStatus = "draft" | "active" | "suspended";
export type CreatorVerificationStatus = "not_verified" | "pending" | "verified";
export type CreatorOnboardingPersistedStatus = "not_started" | "in_progress" | "submitted" | "under_review" | "changes_requested" | "approved" | "rejected" | "suspended";
export type CreatorAssetDraftStatus = "draft" | "incomplete" | "ready_for_submission" | "submitted";
export type CreatorAssetModerationStatus = "not_submitted" | "submitted" | "under_review" | "changes_requested" | "approved" | "rejected" | "suspended";
export type CreatorAssetPublishStatus = "unpublished" | "publication_pending" | "published" | "unlisted" | "archived";
export type CreatorVersionDraftStatus = "draft" | "ready_for_submission" | "submitted" | "under_review" | "approved" | "rejected" | "archived";
export type CreatorUploadSessionStatus = "created" | "validation_pending" | "ready_for_provider" | "expired" | "cancelled" | "failed";

export type CreatorWorkspaceUser = {
  userId: string;
  authMode: "bearer";
};

export type CreatorWorkspaceProfileRecord = {
  id: string;
  userId: string;
  slug: string;
  displayName: string;
  bio: string;
  avatarReference: string | null;
  coverReference: string | null;
  creatorType: string;
  categories: CreatorJson;
  skills: CreatorJson;
  location: CreatorJson;
  languages: CreatorJson;
  portfolioLinks: CreatorJson;
  verificationStatus: CreatorVerificationStatus;
  supportPolicy: string | null;
  copyrightDeclaration: string | null;
  aiPolicyAcknowledged: boolean;
  profileStatus: CreatorProfileStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreatorOnboardingRecord = {
  id: string;
  creatorProfileId: string;
  userId: string;
  status: CreatorOnboardingPersistedStatus;
  currentStep: number;
  identitySnapshot: CreatorJson;
  profileSnapshot: CreatorJson;
  expertiseSnapshot: CreatorJson;
  portfolioSnapshot: CreatorJson;
  taxReadiness: CreatorJson;
  payoutReadiness: CreatorJson;
  agreements: CreatorJson;
  copyrightDeclaration: CreatorJson;
  aiPolicyAcknowledgement: CreatorJson;
  submittedAt: string | null;
  reviewedAt: string | null;
  changesRequestedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatorAssetDraftRecord = {
  id: string;
  creatorProfileId: string;
  userId: string;
  slug: string;
  assetType: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  subcategory: string;
  tags: CreatorJson;
  previewMediaMetadata: CreatorJson;
  sourceFileMetadata: CreatorJson;
  technicalSpecifications: CreatorJson;
  supportedLicenses: CreatorJson;
  pricingMetadata: CreatorJson;
  copyrightMetadata: CreatorJson;
  releaseMetadata: CreatorJson;
  aiGeneratedDisclosure: CreatorJson;
  supportPolicy: CreatorJson;
  versionPolicy: CreatorJson;
  moderationStatus: CreatorAssetModerationStatus;
  publishStatus: CreatorAssetPublishStatus;
  draftStatus: CreatorAssetDraftStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
};

export type CreatorCollectionRecord = {
  id: string;
  creatorProfileId: string;
  userId: string;
  slug: string;
  title: string;
  description: string;
  coverReference: string | null;
  visibility: "private" | "public_preview";
  featuredPreview: boolean;
  bundleReadiness: boolean;
  status: "draft" | "active" | "archived";
  assetDraftIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreatorAssetVersionRecord = {
  id: string;
  assetDraftId: string;
  creatorProfileId: string;
  semanticVersion: string;
  changelog: CreatorJson;
  releaseNotes: string;
  fileSetMetadata: CreatorJson;
  compatibility: CreatorJson;
  buyerAccessPolicy: string;
  supportWindow: string;
  status: CreatorVersionDraftStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
};

export type CreatorUploadSessionRecord = {
  id: string;
  creatorProfileId: string;
  userId: string;
  assetDraftId: string | null;
  uploadType: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  checksumMetadata: CreatorJson;
  providerName: "metadata_only";
  sessionStatus: CreatorUploadSessionStatus;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  metadata: CreatorJson;
  permissions: {
    providerSessionCreated: false;
    signedUploadUrlGenerated: false;
    storageWriteAllowed: false;
    malwareScanStarted: false;
    mediaProcessingStarted: false;
  };
};

export type CreatorActivityEventRecord = {
  id: string;
  creatorProfileId: string;
  userId: string;
  eventType: string;
  resourceType: string;
  resourceId: string;
  metadata: CreatorJson;
  createdAt: string;
};

export type CreatorIdempotencyRecord = {
  key: string;
  userId: string;
  operation: string;
  requestHash: string;
  response: CreatorJson;
  status: "completed";
  createdAt: string;
  updatedAt: string;
};

export type CreatorWorkspaceDashboardReadModel = {
  profileStatus: CreatorProfileStatus | "missing";
  onboardingStatus: CreatorOnboardingPersistedStatus | "not_started";
  totalDrafts: number;
  submittedAssets: number;
  changesRequested: number;
  approvedAssets: number;
  publishedCountPreview: number;
  collectionCount: number;
  versionDrafts: number;
  uploadSessionMetadataCount: number;
  commercialMetrics: {
    sales: 0;
    earnings: 0;
    downloads: 0;
    payouts: 0;
    unavailableUntilCommercePhase: true;
  };
  recentActivity: CreatorActivityEventRecord[];
};
