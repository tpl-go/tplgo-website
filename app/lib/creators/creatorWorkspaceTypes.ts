export type CreatorWorkspaceSection =
  | "dashboard"
  | "onboarding"
  | "profile"
  | "assets"
  | "asset-wizard"
  | "uploads"
  | "media-library"
  | "collections"
  | "versions"
  | "orders"
  | "earnings"
  | "analytics"
  | "reviews"
  | "licenses"
  | "notifications"
  | "settings"
  | "support";

export type CreatorOnboardingStatus = "not_started" | "in_progress" | "submitted" | "under_review" | "changes_requested" | "approved" | "rejected" | "suspended";

export type CreatorWorkspaceAssetStatus = "draft" | "submitted" | "under_review" | "changes_requested" | "approved" | "published" | "rejected" | "suspended" | "archived";

export type CreatorUploadPreviewStatus = "queued" | "validating" | "uploading_preview" | "processing_preview" | "scan_pending" | "scan_clean" | "scan_failed" | "ready" | "failed" | "cancelled";

export type CreatorWorkspaceProfile = {
  creatorId: string;
  displayName: string;
  slug: string;
  bio: string;
  avatar: string;
  coverImage: string;
  categories: string[];
  skills: string[];
  location: string;
  languages: string[];
  links: string[];
  verifiedStatusPreview: "not_verified" | "pending" | "verified";
  followerCountPreview: number;
  assetCount: number;
  rating: number;
  responseTime: string;
  supportPolicy: string;
  copyrightDeclaration: string;
  aiContentPolicyAcknowledgement: boolean;
  status: CreatorOnboardingStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreatorWorkspaceAsset = {
  assetId: string;
  title: string;
  assetType: string;
  category: string;
  status: CreatorWorkspaceAssetStatus;
  licenseAvailability: string[];
  version: string;
  salesPreview: number;
  downloadsPreview: number;
  lastUpdated: string;
  moderationState: string;
  mutationPermissions: {
    editAllowed: false;
    submitAllowed: false;
    publishAllowed: false;
    archiveAllowed: false;
    storageWriteAllowed: false;
  };
};

export type CreatorUploadPreview = {
  uploadId: string;
  fileKind: "source_file" | "preview_media" | "thumbnail" | "documentation" | "release" | "version_file";
  fileName: string;
  status: CreatorUploadPreviewStatus;
  uploadAllowed: false;
  storageWriteAllowed: false;
  malwareScanExecutionAllowed: false;
  publishAllowed: false;
};

export type CreatorWorkspaceDashboard = {
  statusSummary: Record<CreatorWorkspaceAssetStatus, number>;
  totalDownloadsPreview: number;
  totalSalesPreview: number;
  earningsPreview: CreatorEarningsPreview;
  topAssets: CreatorWorkspaceAsset[];
  recentOrders: CreatorOrderPreviewRow[];
  recentReviews: CreatorReviewPreview[];
  licenseMix: Record<string, number>;
  geographicDemandPreview: Array<{ country: string; demand: number }>;
  trendingCategories: string[];
  qualityAlerts: string[];
  copyrightAlerts: string[];
  aiSuggestions: string[];
};

export type CreatorOrderPreviewRow = {
  orderId: string;
  assetTitle: string;
  buyerSnapshot: string;
  license: string;
  amount: number;
  tax: number;
  platformFee: number;
  creatorShare: number;
  paymentState: string;
  entitlementState: string;
  refundState: string;
  orderDate: string;
  country: string;
  sourceChannel: string;
};

export type CreatorEarningsPreview = {
  grossSales: number;
  refunds: number;
  platformCommission: number;
  taxesAndFees: number;
  creatorShare: number;
  holdAmount: number;
  reserve: number;
  eligibleAmount: number;
  payoutPending: number;
  payoutProviderPending: true;
  nonAuthoritative: true;
};

export type CreatorReviewPreview = {
  reviewId: string;
  rating: number;
  verifiedPurchasePreview: boolean;
  text: string;
  mediaReady: boolean;
  creatorResponseReady: boolean;
  helpfulVotesPreview: number;
  reportStatus: "none" | "reported";
  moderationStatus: "visible" | "pending_review";
};

export type CreatorVersionPreview = {
  versionId: string;
  assetId: string;
  semanticVersion: string;
  changelog: string[];
  releaseNotes: string;
  sourceFileSet: string;
  compatibility: string[];
  buyerAccessPolicy: string;
  supportWindow: string;
  rollbackReady: true;
  status: "draft" | "current" | "archived";
};

export type CreatorCollectionPreview = {
  collectionId: string;
  title: string;
  description: string;
  cover: string;
  assetIds: string[];
  visibilityPreview: "private" | "public_preview";
  featuredStatusPreview: boolean;
  bundleReadiness: boolean;
  publishStatus: CreatorWorkspaceAssetStatus;
};
