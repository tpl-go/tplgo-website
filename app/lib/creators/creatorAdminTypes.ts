export type CreatorAdminSection =
  | "dashboard"
  | "onboarding"
  | "profiles"
  | "profile-detail"
  | "assets"
  | "asset-detail"
  | "moderation"
  | "copyright"
  | "licenses"
  | "orders"
  | "refunds"
  | "entitlements"
  | "downloads"
  | "earnings"
  | "payouts"
  | "reviews"
  | "disputes"
  | "risk"
  | "categories"
  | "collections"
  | "featured"
  | "analytics"
  | "reports"
  | "settings";

export type CreatorAdminStatus =
  | "submitted"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "rejected"
  | "suspended"
  | "submitted_checks"
  | "automated_checks"
  | "manual_review"
  | "published"
  | "archived"
  | "pending"
  | "provider_pending"
  | "active"
  | "blocked"
  | "preview";

export type CreatorAdminPermission =
  | "creator.view"
  | "creator.onboarding.review"
  | "creator.assets.review"
  | "creator.copyright.review"
  | "creator.orders.view"
  | "creator.refunds.view"
  | "creator.entitlements.view"
  | "creator.downloads.view"
  | "creator.earnings.view"
  | "creator.payouts.view"
  | "creator.reviews.moderate"
  | "creator.disputes.view"
  | "creator.risk.view"
  | "creator.catalog.manage"
  | "creator.analytics.view";

export interface CreatorAdminPermissions {
  permissions: CreatorAdminPermission[];
  approveAllowed: false;
  rejectAllowed: false;
  suspendAllowed: false;
  documentMutationAllowed: false;
  moderationMutationAllowed: false;
  publishMutationAllowed: false;
  storageMutationAllowed: false;
  paymentMutationAllowed: false;
  refundMutationAllowed: false;
  walletMutationAllowed: false;
  entitlementMutationAllowed: false;
  downloadMutationAllowed: false;
  payoutAllowed: false;
  notificationSendAllowed: false;
  publicMountAllowed: false;
}

export interface CreatorAdminMetric {
  id: string;
  label: string;
  value: string;
  detail: string;
  previewOnly: true;
}

export interface CreatorAdminQueueItem {
  id: string;
  title: string;
  owner: string;
  status: CreatorAdminStatus;
  priority: "low" | "medium" | "high";
  detail: string;
  riskSignal?: string;
}

export interface CreatorAdminOperationRow {
  id: string;
  area: string;
  item: string;
  value: string;
  status: CreatorAdminStatus;
  detail: string;
}

export interface CreatorAdminFinancePreview {
  grossSales: number;
  refunds: number;
  commission: number;
  taxes: number;
  gatewayFees: number;
  creatorShare: number;
  holdAmount: number;
  reserve: number;
  eligibleAmount: number;
  payoutPending: number;
  payoutBlocked: number;
  providerPending: true;
  previewOnly: true;
}

export interface CreatorAdminAuditPreview {
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  reason: string;
  requestId: string;
  moderationCaseId: string;
  timestamp: string;
  persistAllowed: false;
}

export interface CreatorAdminDashboardPreview {
  metrics: CreatorAdminMetric[];
  moderationQueue: CreatorAdminQueueItem[];
  riskAlerts: CreatorAdminQueueItem[];
  operationalRows: CreatorAdminOperationRow[];
  finance: CreatorAdminFinancePreview;
  audit: CreatorAdminAuditPreview[];
}

export interface CreatorAdminPreview {
  section: CreatorAdminSection;
  title: string;
  enabled: boolean;
  mode: "hidden_preview";
  persistent: false;
  permissions: CreatorAdminPermissions;
  dashboard: CreatorAdminDashboardPreview;
  onboarding: CreatorAdminQueueItem[];
  assetModeration: CreatorAdminQueueItem[];
  copyrightCases: CreatorAdminQueueItem[];
  orders: CreatorAdminOperationRow[];
  entitlements: CreatorAdminOperationRow[];
  downloads: CreatorAdminOperationRow[];
  earnings: CreatorAdminFinancePreview;
  reviews: CreatorAdminQueueItem[];
  disputes: CreatorAdminQueueItem[];
  risk: CreatorAdminQueueItem[];
  catalog: CreatorAdminOperationRow[];
  analytics: CreatorAdminOperationRow[];
}
