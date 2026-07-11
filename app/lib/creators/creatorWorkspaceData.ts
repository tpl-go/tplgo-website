import type {
  CreatorCollectionPreview,
  CreatorEarningsPreview,
  CreatorOrderPreviewRow,
  CreatorReviewPreview,
  CreatorUploadPreview,
  CreatorVersionPreview,
  CreatorWorkspaceAsset,
  CreatorWorkspaceDashboard,
  CreatorWorkspaceProfile,
} from "./creatorWorkspaceTypes";

export const creatorWorkspaceProfile: CreatorWorkspaceProfile = {
  creatorId: "creator-preview-aira",
  displayName: "Aira Studio",
  slug: "aira-studio",
  bio: "Cinematic travel footage, LUTs and creator-ready campaign assets.",
  avatar: "creator portrait camera studio",
  coverImage: "cinematic creator studio workspace",
  categories: ["Videos", "Templates", "Presets"],
  skills: ["Drone footage", "Color grading", "Motion templates"],
  location: "Mumbai, India",
  languages: ["English", "Hindi"],
  links: ["https://example.com/aira-preview"],
  verifiedStatusPreview: "pending",
  followerCountPreview: 18400,
  assetCount: 42,
  rating: 4.9,
  responseTime: "Preview: 1 business day",
  supportPolicy: "Preview support policy. Not legally binding.",
  copyrightDeclaration: "Creator declares original ownership before public submission.",
  aiContentPolicyAcknowledgement: true,
  status: "in_progress",
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-10T00:00:00.000Z",
};

export const creatorWorkspaceAssets: CreatorWorkspaceAsset[] = [
  {
    assetId: "asset-001",
    title: "Cinematic Ladakh Drone Pack",
    assetType: "drone footage",
    category: "Videos",
    status: "published",
    licenseAvailability: ["personal", "commercial", "extended_commercial"],
    version: "1.2",
    salesPreview: 2100,
    downloadsPreview: 4680,
    lastUpdated: "2026-06-18",
    moderationState: "approved_preview",
    mutationPermissions: { editAllowed: false, submitAllowed: false, publishAllowed: false, archiveAllowed: false, storageWriteAllowed: false },
  },
  {
    assetId: "asset-003",
    title: "Creator Reel Template Kit",
    assetType: "template",
    category: "Templates",
    status: "under_review",
    licenseAvailability: ["personal", "commercial"],
    version: "2.0",
    salesPreview: 970,
    downloadsPreview: 1820,
    lastUpdated: "2026-06-02",
    moderationState: "review_preview",
    mutationPermissions: { editAllowed: false, submitAllowed: false, publishAllowed: false, archiveAllowed: false, storageWriteAllowed: false },
  },
  {
    assetId: "draft-001",
    title: "Himalayan Social Story Pack",
    assetType: "template",
    category: "Templates",
    status: "draft",
    licenseAvailability: ["commercial"],
    version: "0.1",
    salesPreview: 0,
    downloadsPreview: 0,
    lastUpdated: "2026-07-08",
    moderationState: "draft_preview",
    mutationPermissions: { editAllowed: false, submitAllowed: false, publishAllowed: false, archiveAllowed: false, storageWriteAllowed: false },
  },
];

export const creatorUploadsPreview: CreatorUploadPreview[] = [
  { uploadId: "upload-source-1", fileKind: "source_file", fileName: "ladakh-master-clips.zip", status: "queued", uploadAllowed: false, storageWriteAllowed: false, malwareScanExecutionAllowed: false, publishAllowed: false },
  { uploadId: "upload-preview-1", fileKind: "preview_media", fileName: "ladakh-preview.mp4", status: "scan_pending", uploadAllowed: false, storageWriteAllowed: false, malwareScanExecutionAllowed: false, publishAllowed: false },
  { uploadId: "upload-release-1", fileKind: "release", fileName: "location-release-notes.pdf", status: "ready", uploadAllowed: false, storageWriteAllowed: false, malwareScanExecutionAllowed: false, publishAllowed: false },
];

export const creatorCollectionsPreview: CreatorCollectionPreview[] = [
  {
    collectionId: "collection-creator-launch",
    title: "Creator Launch Kit",
    description: "Preview collection for launch-ready Creator assets.",
    cover: "creator launch kit preview",
    assetIds: ["asset-001", "asset-003"],
    visibilityPreview: "private",
    featuredStatusPreview: false,
    bundleReadiness: true,
    publishStatus: "draft",
  },
];

export const creatorVersionsPreview: CreatorVersionPreview[] = [
  {
    versionId: "asset-001-v1-2",
    assetId: "asset-001",
    semanticVersion: "1.2.0",
    changelog: ["Added social-safe preview notes", "Refreshed grade references"],
    releaseNotes: "Preview release notes for buyer access policy.",
    sourceFileSet: "12 clips, grade notes, license guide",
    compatibility: ["Premiere Pro", "DaVinci Resolve"],
    buyerAccessPolicy: "all_updates_during_support",
    supportWindow: "180 days preview",
    rollbackReady: true,
    status: "current",
  },
];

export const creatorOrdersPreview: CreatorOrderPreviewRow[] = [
  {
    orderId: "creator-preview-order-001",
    assetTitle: "Cinematic Ladakh Drone Pack",
    buyerSnapshot: "Preview buyer, no PII",
    license: "Commercial",
    amount: 5999,
    tax: 0,
    platformFee: 1799,
    creatorShare: 4200,
    paymentState: "preview_only",
    entitlementState: "not_activated",
    refundState: "none",
    orderDate: "2026-07-08",
    country: "India",
    sourceChannel: "Creator catalog preview",
  },
];

export const creatorEarningsPreview: CreatorEarningsPreview = {
  grossSales: 182400,
  refunds: 8400,
  platformCommission: 52200,
  taxesAndFees: 0,
  creatorShare: 121800,
  holdAmount: 22000,
  reserve: 8500,
  eligibleAmount: 91300,
  payoutPending: 91300,
  payoutProviderPending: true,
  nonAuthoritative: true,
};

export const creatorReviewsPreview: CreatorReviewPreview[] = [
  { reviewId: "review-001", rating: 5, verifiedPurchasePreview: true, text: "Strong preview quality for destination edits.", mediaReady: true, creatorResponseReady: false, helpfulVotesPreview: 18, reportStatus: "none", moderationStatus: "visible" },
  { reviewId: "review-002", rating: 4, verifiedPurchasePreview: true, text: "Useful commercial pack; would like more vertical clips.", mediaReady: false, creatorResponseReady: true, helpfulVotesPreview: 9, reportStatus: "none", moderationStatus: "visible" },
];

export const creatorDashboardPreview: CreatorWorkspaceDashboard = {
  statusSummary: {
    draft: 1,
    submitted: 0,
    under_review: 1,
    changes_requested: 0,
    approved: 0,
    published: 1,
    rejected: 0,
    suspended: 0,
    archived: 0,
  },
  totalDownloadsPreview: 6500,
  totalSalesPreview: 3070,
  earningsPreview: creatorEarningsPreview,
  topAssets: creatorWorkspaceAssets.slice(0, 2),
  recentOrders: creatorOrdersPreview,
  recentReviews: creatorReviewsPreview,
  licenseMix: { personal: 40, commercial: 48, extended: 9, editorial: 3 },
  geographicDemandPreview: [
    { country: "India", demand: 64 },
    { country: "United States", demand: 18 },
    { country: "United Arab Emirates", demand: 9 },
  ],
  trendingCategories: ["Drone footage", "Reel templates", "LUTs"],
  qualityAlerts: ["One draft needs preview thumbnail readiness."],
  copyrightAlerts: ["Copyright declarations are preview-only until review."],
  aiSuggestions: ["Add vertical crop previews for mobile-first buyers."],
};
