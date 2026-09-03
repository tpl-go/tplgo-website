"use client";

import { resolveCurrentTplApiTarget } from "@/app/lib/api/apiTargetResolver";

export const ADMIN_SESSION_STORAGE_KEY = "tpl_admin_session_v1";
export const ADMIN_MFA_CHALLENGE_STORAGE_KEY = "tpl_admin_mfa_challenge_v1";

export type AdminApiMeta = {
  requestId: string;
  apiVersion: "v1";
};

export type AdminApiError = {
  code: string;
  message: string;
  details?: unknown;
  fieldErrors?: unknown[];
};

export type AdminApiResult<TData> =
  | {
      ok: true;
      data: TData;
      meta: AdminApiMeta;
      status: number;
      requestId: string;
    }
  | {
      ok: false;
      error: AdminApiError;
      status: number;
      requestId: string;
    };

export type AdminSession = {
  admin: AdminUser;
  session: {
    id: string;
    token: string;
    createdAt: string;
    expiresAt?: string;
  };
};

export type AdminLoginMfaChallenge = {
  mfaRequired: true;
  mfaChallengeId: string;
  expiresAt: string;
  availableMethods: Array<"totp" | "backup_code">;
};

export type AdminLoginResponse = AdminSession | AdminLoginMfaChallenge;

export type AdminSsoProvider = "google" | "microsoft";

export type AdminSsoStartResponse = {
  provider: AdminSsoProvider;
  authorizationUrl: string;
  expiresAt: string;
  debug?: {
    state?: string;
    nonce?: string;
    codeVerifier?: string;
  };
};

export type AdminSsoCallbackParams = {
  provider?: AdminSsoProvider;
  state: string;
  code?: string;
};

export type AdminSsoDevCallbackParams = {
  provider: AdminSsoProvider;
  state: string;
  email: string;
  providerSubject: string;
  displayName?: string;
  emailVerified?: boolean;
};

export type AdminUser = {
  id: string;
  adminUserId?: string;
  identityUserId?: string;
  email: string;
  fullName: string;
  status: string;
  roles: string[];
  permissions: string[];
  createdAt?: string;
};

export type AdminSessionView = {
  sessionId: string;
  authMode?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  expiresAt?: string;
  currentSession: boolean;
  revokedAt?: string;
};

export type AdminMfaStatus = {
  enabled: boolean;
  enrolledAt?: string;
  backupCodesCount: number;
  secret?: string;
  otpauthUri?: string;
  backupCodes?: string[];
};

export type AdminMfaQr = {
  otpauthUri: string;
  expiresAt: string;
};

export type AdminDashboardSummary = {
  counts?: Record<string, number>;
};

export type AdminListQuery = {
  limit?: number;
  offset?: number;
  search?: string;
  service?: string;
  status?: string;
  mobile?: string;
  dateFrom?: string;
  dateTo?: string;
  gateway?: string;
  booking?: string;
  customer?: string;
  amount?: string;
  reference?: string;
  module?: string;
  severity?: string;
  actor?: string;
  channel?: string;
  template?: string;
  priority?: string;
};

export type AdminBookingRow = {
  id: string;
  bookingRef?: string;
  userId?: string | null;
  mobile?: string;
  compatBookingItem?: Record<string, unknown>;
  status?: string;
  bookingStatus?: string | null;
  paymentStatus?: string | null;
  paymentRef?: string | null;
  [key: string]: unknown;
};

export type AdminBookingOperationsQuery = AdminListQuery & {
  search?: string;
  customer?: string;
  ecosystemType?: string;
  paymentState?: string;
  refundState?: string;
  highPriority?: string;
  slaRisk?: string;
  supplierPending?: string;
  paymentFailed?: string;
  refundPending?: string;
  assignedAgent?: string;
  createdFrom?: string;
  createdTo?: string;
  amountMin?: string;
  amountMax?: string;
  sourceChannel?: string;
  walletUsed?: string;
  offerApplied?: string;
};

export type AdminBookingTimelineEvent = {
  key: string;
  label: string;
  status: "observed" | "unavailable" | "future";
  occurredAt?: string;
  detail: string;
  source: "booking" | "payment" | "refund" | "document" | "supplier" | "admin" | "planner" | "future";
};

export type AdminBookingPaymentSummary = {
  amount?: string;
  status?: string;
  gatewayReference?: string;
  attempts?: string;
  walletUsed?: string;
  couponUsed?: string;
};

export type AdminBookingRefundSummary = {
  status?: string;
  amount?: string;
  method?: string;
  reference?: string;
  timeline?: AdminBookingTimelineEvent[];
};

export type AdminBookingOperationalSummary = {
  riskScore: "needs_api";
  automationStatus: string;
  syncStatus: string;
  providerStatus: string;
  documentsStatus: string;
  notificationStatus: string;
  walletStatus: string;
};

export type AdminBookingNote = {
  id: string;
  bookingId: string;
  bookingRef?: string;
  note: string;
  category: string;
  visibility: "admin_only";
  createdByAdminId?: string;
  createdByAdminEmail?: string;
  createdAt: string;
};

export type AdminBookingAssignment = {
  bookingId: string;
  bookingRef?: string;
  assignedAgent: string;
  assignedByAdminId: string;
  assignedByAdminEmail: string;
  assignedAt: string;
};

export type AdminBookingPriorityValue = "normal" | "high" | "urgent";

export type AdminBookingPriority = {
  bookingId: string;
  bookingRef?: string;
  priority: AdminBookingPriorityValue;
  slaStatus: "ok" | "warning" | "breach";
  reason?: string;
  updatedByAdminId: string;
  updatedByAdminEmail: string;
  updatedAt: string;
};

export type AdminBookingExportResult = {
  filename: string;
  contentType: "text/csv";
  csv: string;
  rowCount: number;
};

export type AdminCustomerListRow = {
  id: string;
  customerId: string;
  publicId: string;
  mobile: string;
  email?: string;
  fullName?: string;
  accountType: string;
  status: string;
  lastLoginAt?: string;
  createdAt: string;
  lastBookingRef?: string;
  lastBookingAt?: string;
  totalBookings: number;
  wallet?: {
    status: string;
    currency: string;
    promoCredit: number;
    earnedCredit: number;
    refundableBalance: number;
  };
};

export type AdminCustomerDetail = {
  customer: AdminCustomerListRow;
  profile?: Record<string, unknown>;
  travellers: Array<Record<string, unknown>>;
  bookings: AdminBookingRow[];
  wallet?: Record<string, unknown>;
};

export type AdminBookingDetail = {
  booking: AdminBookingRow;
  detail: {
    serviceType: string;
    rawPayload?: Record<string, unknown>;
    rawPayloadHash?: string;
    rawPayloadSizeBytes?: number;
    rawPayloadSchema?: string | null;
    mapperVersion?: string;
    normalizedSummary?: Record<string, unknown>;
  };
};

export type AdminPaymentRow = {
  id: string;
  paymentRef?: string;
  bookingId?: string | null;
  userId?: string | null;
  mobile?: string | null;
  status?: string;
  amount?: number;
  currency?: string;
  gateway?: string | null;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  paymentMethod?: string | null;
  walletLedgerGroupId?: string | null;
  offerRedemptionId?: string | null;
  paidAt?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export type AdminRefundRow = {
  id: string;
  refundRef?: string;
  bookingId?: string;
  paymentId?: string | null;
  walletLedgerId?: string | null;
  status?: string;
  refundMethod?: string;
  amount?: number;
  currency?: string;
  gatewayRefundId?: string | null;
  reason?: string | null;
  processedAt?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export type AdminWalletRow = {
  id: string;
  userId?: string | null;
  mobile?: string;
  status?: string;
  currency?: string;
  promoCredit?: number;
  earnedCredit?: number;
  refundableBalance?: number;
  createdAt?: string;
  [key: string]: unknown;
};

export type AdminLedgerRow = {
  id: string;
  walletAccountId?: string;
  bookingId?: string | null;
  paymentId?: string | null;
  refundId?: string | null;
  ledgerType?: string;
  title?: string;
  description?: string | null;
  promoDelta?: number;
  earnedDelta?: number;
  refundableDelta?: number;
  amount?: number;
  currency?: string;
  balanceAfter?: Record<string, unknown>;
  createdAt?: string;
  [key: string]: unknown;
};

export type AdminPaymentDetail = {
  payment: AdminPaymentRow;
  attempts: Array<Record<string, unknown>>;
  booking?: AdminBookingRow | null;
  refunds: AdminRefundRow[];
  ledger: AdminLedgerRow[];
  gateway?: Record<string, unknown>;
  audit?: Record<string, unknown>;
};

export type AdminRefundDetail = {
  refund: AdminRefundRow;
  payment?: AdminPaymentRow | null;
  booking?: AdminBookingRow | null;
  ledger: AdminLedgerRow[];
  gateway?: Record<string, unknown>;
  audit?: Record<string, unknown>;
};

export type AdminWalletDetail = {
  wallet: AdminWalletRow;
  ledger: AdminLedgerRow[];
  audit?: Record<string, unknown>;
};

export type AdminOperationsEvent = {
  id: string;
  eventType: string;
  sourceModule: string;
  severity: "info" | "warning" | "critical" | "needs_api";
  actor: string;
  entityType?: string;
  entityId?: string;
  customerRef?: string;
  bookingRef?: string;
  paymentRef?: string;
  refundRef?: string;
  walletRef?: string;
  timestamp?: string;
  status: string;
  message: string;
  links?: Record<string, string>;
  metadata?: Record<string, unknown>;
};

export type AdminCommunicationEvent = {
  id: string;
  eventType: string;
  channel: "email" | "sms" | "whatsapp" | "push" | "in-app" | "admin-alert" | "needs_api";
  module: string;
  status: "successful" | "failed" | "pending" | "suppressed" | "needs_api";
  priority: "low" | "normal" | "high" | "critical";
  recipient?: string;
  actor?: string;
  customerRef?: string;
  bookingRef?: string;
  paymentRef?: string;
  refundRef?: string;
  walletRef?: string;
  template?: string;
  reference?: string;
  timestamp?: string;
  message: string;
  links?: Record<string, string>;
  metadata?: Record<string, unknown>;
};

export type AdminCommunicationDetail = {
  communication: AdminCommunicationEvent;
  deliveryTimeline: Array<Record<string, unknown>>;
  operations: Record<string, unknown>;
};

export type AdminCommunicationTemplate = {
  id: string;
  name: string;
  type: string;
  status: "active" | "needs_provider" | "disabled";
  version: string;
  usageCount: number;
  channels: string[];
  locale: string;
};

export type AdminSupplierRow = {
  id: string;
  supplier: string;
  provider: string;
  services: string[];
  country: string;
  status: "active" | "offline" | "pending_verification" | "needs_api";
  health: "healthy" | "degraded" | "offline" | "needs_api";
  supplierType: "api" | "manual" | "partner" | "marketplace" | "creator" | "local_life";
  verification: "verified" | "pending" | "needs_api";
  lastSync?: string;
  sla: "ok" | "watch" | "breach" | "needs_api";
  priority: "normal" | "high";
};

export type AdminSupplierEvent = {
  id: string;
  supplierId?: string;
  supplier: string;
  eventType: string;
  source: "supplier" | "inventory" | "sync" | "api" | "booking" | "documents" | "communication" | "contracts";
  status: "observed" | "needs_api" | "future";
  severity: "info" | "warning" | "critical" | "needs_api";
  timestamp?: string;
  message: string;
};

export type AdminSupplierDetail = {
  supplier: AdminSupplierRow;
  profile: Record<string, unknown>;
  services: string[];
  apiStatus: Record<string, unknown>;
  syncTimeline: AdminSupplierEvent[];
  bookingActivity: Record<string, unknown>;
  inventoryStatus: Record<string, unknown>;
  health: Record<string, unknown>;
  documents: Array<Record<string, unknown>>;
  contacts: Array<Record<string, unknown>>;
  audit: Record<string, unknown>;
  operations: Record<string, unknown>;
};

export type AdminProviderHealth = {
  provider: string;
  health: "healthy" | "degraded" | "offline" | "needs_api";
  latency: string;
  apiAvailability: string;
  errorRate: string;
  lastSync: string;
  queue: string;
  services: string[];
};

export type AdminInventoryHealth = {
  service: string;
  availability: string;
  syncStatus: "synced" | "delayed" | "failed" | "needs_api";
  inventoryDelay: string;
  failedSync: number;
  provider: string;
};

export type AdminContentStatus = "published" | "draft" | "pending" | "approved" | "rejected" | "queued" | "failed" | "needs_api";

export type AdminContentHomepageSection = {
  id: string;
  name: string;
  module: string;
  status: AdminContentStatus;
  source: "public_static" | "admin_foundation" | "needs_api";
  itemCount: number;
  visibility: "visible" | "hidden" | "needs_api";
  lastUpdated?: string;
  notes: string;
};

export type AdminContentItem = {
  id: string;
  title: string;
  type: string;
  status: AdminContentStatus;
  destination?: string;
  theme?: string;
  price?: string;
  visibility?: "visible" | "hidden" | "needs_api";
  featured?: boolean;
  country?: string;
  state?: string;
  city?: string;
  region?: string;
  author?: string;
  version?: string;
  usageCount?: number;
  seoStatus?: "ready" | "missing" | "needs_api";
  updatedAt?: string;
  notes?: string;
};

export type AdminContentSeoItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  canonical: string;
  robots: string;
  openGraph: "ready" | "needs_api";
  status: AdminContentStatus;
};

export type AdminContentMediaItem = {
  id: string;
  name: string;
  type: "image" | "video" | "document";
  status: AdminContentStatus;
  storage: "public_asset" | "needs_storage_api";
  usage: string;
  updatedAt?: string;
};

export type AdminContentWorkflowItem = {
  id: string;
  title: string;
  module: string;
  status: AdminContentStatus;
  actor: string;
  timestamp?: string;
  action: "draft" | "pending" | "approved" | "rejected" | "scheduled" | "queued" | "published" | "failed" | "revision";
  operations: "disabled";
};

export type AdminContentVersionItem = {
  id: string;
  title: string;
  module: string;
  version: string;
  status: AdminContentStatus;
  timestamp?: string;
  rollback: "disabled";
};

export type AdminContentDashboard = {
  homepage: AdminContentHomepageSection[];
  destinations: AdminContentItem[];
  packages: AdminContentItem[];
  themes: AdminContentItem[];
  offers: AdminContentItem[];
  blogs: AdminContentItem[];
  smartPlanner: AdminContentItem[];
  creators: AdminContentItem[];
  tplMarketplace: AdminContentItem[];
  localLife: AdminContentItem[];
  seo: AdminContentSeoItem[];
  landingPages: AdminContentItem[];
  media: AdminContentMediaItem[];
  approvalQueue: AdminContentWorkflowItem[];
  publishQueue: AdminContentWorkflowItem[];
  versionHistory: AdminContentVersionItem[];
};

export type AdminAuthActivitySummary = {
  mobileOtp: number;
  emailOtp: number;
  googleLogin: number;
  partnerContext: number;
  successful: number;
  failed: number;
  accountLinkingRequired: number;
};

export type AdminAuthActivityEvent = {
  id: string;
  eventType: string;
  context: string;
  method: string;
  channel?: string | null;
  result: string;
  reasonCode?: string | null;
  maskedIdentifier?: string | null;
  userId?: string | null;
  partnerOrganizationId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
};

export type AdminIdentityAccessOverview = {
  summary: AdminAuthActivitySummary;
  events: AdminAuthActivityEvent[];
};

export type WebsiteExperienceContext = "user_login" | "partner_login" | "partner_registration" | "partner_application";
export type WebsiteExperienceTone = "sky" | "emerald" | "amber" | "violet";

export type WebsiteExperienceBenefit = {
  icon?: string;
  title: string;
  description: string;
  tone: WebsiteExperienceTone;
};

export type PartnerApplicationContentNode = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  helperText: string;
  rightHelpCopy: string;
  sectionDescription: string;
  domainIntroductionCopy: string;
  emptyStateCopy: string;
  otherServiceGuidance: string;
  ctaLabels: Record<string, string>;
  editableFields: string[];
  lockedFields: string[];
};

export type PartnerApplicationContentTree = {
  root: string;
  children: PartnerApplicationContentNode[];
};

export type WebsiteExperienceContent = {
  context: WebsiteExperienceContext;
  brandMediaSlot: "auth_promo_brand_image";
  brandLogoImage?: string;
  brandLogoAlt?: string;
  brandLabel: string;
  desktopImage: string;
  desktopImageAlt?: string;
  mobileImage?: string;
  mobileImageAlt?: string;
  eyebrow: string;
  headline: string;
  highlightedText: string;
  subtitle: string;
  benefits: WebsiteExperienceBenefit[];
  footerTrustLine: string;
  active: boolean;
  applicationTree?: PartnerApplicationContentTree;
};

export type WebsiteExperienceAdminContext = {
  context: WebsiteExperienceContext;
  label: string;
  draftContent: WebsiteExperienceContent;
  publishedContent: WebsiteExperienceContent;
  defaultContent: WebsiteExperienceContent;
  draftVersion: number;
  publishedVersion: number;
  scheduledContent?: WebsiteExperienceContent;
  scheduledVersion?: number;
  scheduledFor?: string;
  scheduledEndAt?: string;
  scheduledTimezone?: string;
  status: string;
  workflowState?: "working_changes" | "draft" | "in_review" | "changes_requested" | "approved" | "scheduled" | "published" | "archived";
  review?: {
    submittedByAdminId?: string;
    submittedAt?: string;
    reviewedByAdminId?: string;
    reviewedAt?: string;
    decision?: "approved" | "changes_requested";
    note?: string;
    bypassedBySuperAdmin?: boolean;
    bypassReason?: string;
  };
  hasUnpublishedChanges?: boolean;
  active: boolean;
  updatedAt?: string;
  publishedAt?: string;
};

export type WebsiteExperienceMediaView = {
  id: string;
  context: WebsiteExperienceContext;
  slot: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  source?: "uploaded" | "external_url";
  originalFilename?: string;
  storageKey?: string;
  width?: number;
  height?: number;
  altText?: string;
  createdAt: string;
};

export type WebsiteExperienceAuditView = {
  id: string;
  action: string;
  context?: string;
  actorAdminId?: string;
  entityId?: string;
  changeSummary?: string;
  createdAt: string;
};

export type PartnerRegistrationIntakeView = {
  id: string;
  legalName: string;
  serviceMobileCountryCode: string;
  serviceMobile: string;
  businessEmail: string;
  primaryCategory: string;
  requestedServiceName?: string;
  status: string;
  createdAt: string;
};

export type PartnerAdminRegistrationIntakesResponse = {
  rows: PartnerRegistrationIntakeView[];
};

export type AdminPartnerServiceCatalogueItem = {
  id: string;
  stableCode: string;
  name: string;
  shortDescription: string;
  domain: string;
  parentCode?: string;
  icon: string;
  displayOrder: number;
  status: "active" | "inactive" | "archived";
  published: boolean;
  countries: string[];
  individualAllowed: boolean;
  organizationAllowed: boolean;
  applicationSelectable: boolean;
  serviceApprovalRequired: boolean;
  verificationProfileKey: string;
  capabilities: string[];
  aliases: string[];
};

export type AdminPartnerApplicationContentTree = {
  root: string;
  children: Array<{ id: string; label: string; editableFields: string[]; lockedFields: string[] }>;
};

export type AdminPartnerServiceCatalogueResponse = {
  draft: { items: AdminPartnerServiceCatalogueItem[]; contentTree: AdminPartnerApplicationContentTree };
  published: { items: AdminPartnerServiceCatalogueItem[]; contentTree: AdminPartnerApplicationContentTree };
  preview: { items: AdminPartnerServiceCatalogueItem[]; contentTree: AdminPartnerApplicationContentTree };
  draftVersion: number;
  publishedVersion: number;
  status: string;
  workflowState?: "draft" | "in_review" | "changes_requested" | "approved" | "published" | "archived";
  review?: {
    state?: "draft" | "in_review" | "changes_requested" | "approved" | "published" | "archived";
    submittedByAdminId?: string;
    submittedAt?: string;
    reviewedByAdminId?: string;
    reviewedAt?: string;
    decision?: "approved" | "changes_requested";
    note?: string;
    bypassedBySuperAdmin?: boolean;
    bypassReason?: string;
  };
  hasUnpublishedChanges?: boolean;
  workflowRecord?: {
    workflowRecordId: string;
    sourceType: "service_catalogue";
    sourceRecordId: string;
    contentArea: string;
    pageContext: string;
    sectionDomain: string;
    itemService: string;
    exactScope: string;
    workflowState: "draft" | "in_review" | "changes_requested" | "approved" | "published" | "archived";
    draftVersion: number;
    publishedVersion: number;
    changedByAdminId?: string;
    changedAt?: string;
    submittedByAdminId?: string;
    submittedAt?: string;
    reviewedByAdminId?: string;
    reviewedAt?: string;
    availableActions: string[];
  };
  permissions: { canRead: boolean; canManage: boolean; canPublish: boolean };
  scheduling: { supported: boolean; reason: string };
  versions: Array<{ id: string; version: number; status: string; createdByAdminId?: string; publishedByAdminId?: string; createdAt: string; publishedAt?: string }>;
  audit: Array<{ id: string; action: string; entityId?: string; actorAdminId?: string; changeSummary?: string; createdAt: string }>;
  requestedServices: Array<{
    requestKey: string;
    requestedName: string;
    description?: string;
    closestDomain?: string;
    status: string;
    source: "partner_registration_intake" | "application_draft";
    createdAt: string;
    resolution?: { id: string; status: string; resolutionType: string; mappedServiceCode?: string; draftServiceCode?: string; resolutionNote?: string };
  }>;
  schema: {
    statuses: string[];
    capabilities: string[];
    editableFields: string[];
    lockedFields: string[];
    lifecycleActions: string[];
    resolutionActions: string[];
  };
};

export type WebsiteExperienceAdminResponse = {
  contexts: WebsiteExperienceAdminContext[];
  permissions: {
    canRead: boolean;
    canWrite: boolean;
    canPublish: boolean;
  };
  schema: {
    contexts: WebsiteExperienceContext[];
    mediaSlots: string[];
    editableFields: string[];
    lockedSecurityFields: string[];
    allowedMediaTypes: string[];
    maxBenefits: number;
    maxMediaBytes: number;
  };
  workflow?: {
    unpublishedChanges: number;
    byArea: Array<{ area: string; count: number }>;
    drafts: Array<{
      context: WebsiteExperienceContext;
      label: string;
      status: NonNullable<WebsiteExperienceAdminContext["workflowState"]>;
      draftVersion: number;
      publishedVersion: number;
      changedAt?: string;
      changedByAdminId?: string;
      scheduledFor?: string;
      publishScope: string;
    }>;
  };
  recentMedia: WebsiteExperienceMediaView[];
  recentAudit: WebsiteExperienceAuditView[];
  partnerRegistrationIntakes: PartnerRegistrationIntakeView[];
};

export type AdminExecutiveKpi = {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  status: "ok" | "watch" | "critical" | "needs_api";
  detail: string;
  source: "admin_read_model" | "derived" | "placeholder";
};

export type AdminExecutiveAnalyticsItem = {
  id: string;
  title: string;
  module: string;
  metric: string | number;
  status: "available" | "partial" | "needs_api";
  detail: string;
};

export type AdminExecutiveTrend = {
  period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  bookings: number;
  revenue: number;
  status: "available" | "needs_api";
  forecast: "disabled" | "needs_ai_forecasting_api";
};

export type AdminExecutiveReport = {
  id: string;
  name: string;
  category: "operational" | "finance" | "customer" | "supplier" | "content" | "communication" | "ecosystem";
  status: "available" | "placeholder" | "needs_api";
  export: "disabled";
  scheduled: "disabled";
  detail: string;
};

export type AdminExecutiveAlert = {
  id: string;
  title: string;
  severity: "info" | "warning" | "critical" | "needs_api";
  module: string;
  status: "observed" | "watch" | "needs_api";
  detail: string;
};

export type AdminExecutiveInsight = {
  id: string;
  title: string;
  relationship: string;
  status: "available" | "partial" | "needs_api";
  detail: string;
};

export type AdminExecutiveDashboard = {
  kpis: AdminExecutiveKpi[];
  analytics: AdminExecutiveAnalyticsItem[];
  trends: AdminExecutiveTrend[];
  reports: AdminExecutiveReport[];
  alerts: AdminExecutiveAlert[];
  insights: AdminExecutiveInsight[];
};

export type AdminSecurityMetric = {
  id: string;
  label: string;
  value: string | number;
  status: "ok" | "watch" | "critical" | "needs_api";
  detail: string;
};

export type AdminSecurityRbacRole = {
  role: string;
  permissions: string[];
  moduleAccess: string[];
  sensitivePermissions: string[];
  edit: "disabled";
};

export type AdminSecurityAuditEvent = {
  id: string;
  action: string;
  severity: "info" | "warning" | "critical";
  actor: string;
  entityType?: string;
  entityId?: string;
  module: string;
  ipAddress: "needs_api";
  device: "needs_api";
  timestamp: string;
  detail: string;
};

export type AdminSecurityPosture = {
  activeSessions: number;
  revokedSessions: number;
  mfaEnabled: boolean;
  mfaBackupCodesCount: number;
  ssoEnabled: boolean;
  ssoProviders: Array<"google" | "microsoft">;
  recommendations: string[];
};

export type AdminComplianceChecklistItem = {
  id: string;
  title: string;
  status: "ready" | "partial" | "needs_api";
  detail: string;
};

export type AdminSecurityOverview = {
  metrics: AdminSecurityMetric[];
  posture: AdminSecurityPosture;
  riskAlerts: AdminSecurityMetric[];
  compliance: AdminComplianceChecklistItem[];
};

export type AdminSecurityRbac = {
  roles: AdminSecurityRbacRole[];
  permissions: Array<{ permission: string; module: string; sensitive: boolean }>;
};

export type AdminSecurityAuditIntelligence = {
  events: AdminSecurityAuditEvent[];
  categories: AdminSecurityMetric[];
};

export type AdminPlatformStatus = "healthy" | "degraded" | "offline" | "not_configured" | "needs_api";

export type AdminPlatformMetric = {
  id: string;
  label: string;
  value: string | number;
  status: AdminPlatformStatus;
  detail: string;
};

export type AdminPlatformRuntimeItem = {
  key: string;
  label: string;
  value: string;
  status: AdminPlatformStatus;
  editable: "disabled";
};

export type AdminPlatformFeatureFlag = {
  id: string;
  feature: string;
  status: "enabled" | "disabled" | "dry_run" | "needs_api";
  module: string;
  description: string;
  environment: string;
  action: "disabled";
};

export type AdminPlatformIntegration = {
  id: string;
  name: string;
  category: "payment" | "notification" | "storage" | "ai" | "search" | "maps" | "otp" | "email" | "sms" | "whatsapp" | "future";
  provider: string;
  status: AdminPlatformStatus;
  health: string;
  version: string;
  configuration: "masked" | "missing" | "placeholder";
};

export type AdminPlatformInfrastructure = {
  id: string;
  name: string;
  health: AdminPlatformStatus;
  latency: string;
  connections: string;
  futureMetrics: "needs_api";
};

export type AdminPlatformApiRegistryItem = {
  id: string;
  name: string;
  category: "internal" | "public" | "admin" | "provider" | "deprecated";
  count: number;
  status: AdminPlatformStatus;
  documentation: "placeholder";
};

export type AdminPlatformSecretStatus = {
  id: string;
  provider: string;
  configured: boolean;
  value: "masked" | "missing";
  lastUpdated: "placeholder";
  health: AdminPlatformStatus;
};

export type AdminPlatformReadinessItem = {
  id: string;
  label: string;
  ready: boolean;
  status: AdminPlatformStatus;
  detail: string;
};

export type AdminPlatformDiagnostics = {
  warnings: string[];
  knownIssues: string[];
  recommendations: string[];
  maintenanceMode: "disabled";
};

export type AdminPlatformDashboard = {
  overview: AdminPlatformMetric[];
  runtime: AdminPlatformRuntimeItem[];
  featureFlags: AdminPlatformFeatureFlag[];
  integrations: AdminPlatformIntegration[];
  infrastructure: AdminPlatformInfrastructure[];
  apis: AdminPlatformApiRegistryItem[];
  secrets: AdminPlatformSecretStatus[];
  readiness: AdminPlatformReadinessItem[];
  diagnostics: AdminPlatformDiagnostics;
};

export type AdminAiOpsStatus = "healthy" | "watch" | "critical" | "disabled" | "needs_api";

export type AdminAiOpsMetric = {
  id: string;
  label: string;
  value: string | number;
  status: AdminAiOpsStatus;
  detail: string;
};

export type AdminAiOpsIntelligenceItem = {
  id: string;
  module: string;
  title: string;
  status: AdminAiOpsStatus;
  insight: string;
  source: "existing_api" | "foundation" | "needs_api";
};

export type AdminIncidentEvent = {
  id: string;
  module: string;
  service: string;
  severity: "critical" | "major" | "minor";
  status: "open" | "resolved" | "monitoring" | "needs_api";
  environment: string;
  title: string;
  detail: string;
  timestamp: string | null;
  acknowledgeAction: "disabled";
};

export type AdminSlaItem = {
  id: string;
  module: string;
  name: string;
  status: AdminAiOpsStatus;
  target: string;
  current: string;
  potentialBreaches: number;
  escalationAction: "disabled";
};

export type AdminAiRecommendation = {
  id: string;
  title: string;
  module: string;
  priority: "high" | "medium" | "low";
  status: AdminAiOpsStatus;
  recommendation: string;
  executeAction: "disabled";
};

export type AdminAutomationWorkflow = {
  id: string;
  workflow: string;
  module: string;
  status: "disabled" | "draft" | "needs_api";
  trigger: string;
  action: string;
  editAction: "disabled";
};

export type AdminAiProviderStatus = {
  id: string;
  provider: "openai" | "gemini" | "anthropic" | "local-ai" | "future";
  label: string;
  health: AdminAiOpsStatus;
  version: string;
  configuration: "masked" | "missing" | "placeholder";
};

export type AdminAiOpsDashboard = {
  metrics: AdminAiOpsMetric[];
  intelligence: AdminAiOpsIntelligenceItem[];
  reliability: AdminAiOpsMetric[];
  incidents: AdminIncidentEvent[];
  sla: AdminSlaItem[];
  recommendations: AdminAiRecommendation[];
  automation: AdminAutomationWorkflow[];
  providers: AdminAiProviderStatus[];
};

export type AdminObservabilityStatus = "healthy" | "watch" | "critical" | "needs_api" | "disabled";

export type AdminObservabilityMetric = {
  id: string;
  label: string;
  value: string | number;
  status: AdminObservabilityStatus;
  detail: string;
};

export type AdminEventCorrelation = {
  id: string;
  sourceModule: string;
  targetModule: string;
  relationship: string;
  status: AdminObservabilityStatus;
  evidence: string;
};

export type AdminServiceDependency = {
  id: string;
  service: string;
  dependsOn: string[];
  health: AdminObservabilityStatus;
  detail: string;
};

export type AdminMetricsInventoryItem = {
  id: string;
  metric: string;
  category: "requests" | "errors" | "latency" | "traffic" | "queue" | "cache" | "future";
  status: AdminObservabilityStatus;
  source: string;
  readiness: "available" | "placeholder" | "needs_api";
};

export type AdminTraceReadinessItem = {
  id: string;
  service: string;
  status: AdminObservabilityStatus;
  propagation: string;
  exporter: string;
  detail: string;
};

export type AdminRootCauseReadModel = {
  id: string;
  incidentId: string | null;
  relatedEvents: string[];
  potentialCause: "placeholder";
  evidence: "placeholder";
  aiRca: "disabled";
};

export type AdminAlertCategory = {
  id: string;
  category: "payments" | "bookings" | "platform" | "supplier" | "security" | "communication" | "ai";
  status: AdminObservabilityStatus;
  count: number;
  routing: "disabled";
  detail: string;
};

export type AdminObservabilityDashboard = {
  incidentCards: AdminObservabilityMetric[];
  incidents: AdminIncidentEvent[];
  correlations: AdminEventCorrelation[];
  reliability: AdminObservabilityMetric[];
  dependencies: AdminServiceDependency[];
  metrics: AdminMetricsInventoryItem[];
  traces: AdminTraceReadinessItem[];
  rootCause: AdminRootCauseReadModel[];
  alerts: AdminAlertCategory[];
};

export type AdminNotificationStatus = "healthy" | "watch" | "critical" | "disabled" | "needs_api";

export type AdminNotificationMetric = {
  id: string;
  label: string;
  value: string | number;
  status: AdminNotificationStatus;
  detail: string;
};

export type AdminAlertRoutingRule = {
  id: string;
  module: string;
  priority: "critical" | "high" | "normal" | "low";
  channels: string[];
  targetTeam: string;
  status: AdminNotificationStatus;
  editAction: "disabled";
};

export type AdminEscalationPolicy = {
  id: string;
  policy: string;
  priority: "critical" | "high" | "normal" | "low";
  targetTeam: string;
  escalationLevel: string;
  sla: string;
  editAction: "disabled";
};

export type AdminNotificationChannelHealth = {
  id: string;
  channel: "email" | "sms" | "whatsapp" | "push" | "in-app" | "webhook";
  provider: string;
  health: AdminNotificationStatus;
  status: string;
  detail: string;
};

export type AdminNotificationTemplateView = AdminCommunicationTemplate & {
  editAction: "disabled";
};

export type AdminNotificationCenterDashboard = {
  metrics: AdminNotificationMetric[];
  routingRules: AdminAlertRoutingRule[];
  escalationPolicies: AdminEscalationPolicy[];
  timeline: AdminCommunicationEvent[];
  channelHealth: AdminNotificationChannelHealth[];
  alertIntelligence: AdminNotificationMetric[];
  templates: AdminNotificationTemplateView[];
};

export type AdminWorkflowStatus = "healthy" | "watch" | "blocked" | "completed" | "disabled" | "needs_api";

export type AdminWorkflowMetric = {
  id: string;
  label: string;
  value: string | number;
  status: AdminWorkflowStatus;
  detail: string;
};

export type AdminOperationsQueue = {
  id: string;
  queue: string;
  module: string;
  status: AdminWorkflowStatus;
  openTasks: number;
  slaWatch: number;
  ownerTeam: string;
  action: "disabled";
};

export type AdminTaskReadModel = {
  id: string;
  taskId: string;
  module: string;
  priority: "critical" | "high" | "normal" | "low";
  owner: string;
  status: "open" | "pending_review" | "assigned" | "unassigned" | "blocked" | "completed" | "escalated" | "needs_api";
  queue: string;
  sla: string;
  createdAt: string | null;
  updatedAt: string | null;
  editAction: "disabled";
};

export type AdminWorkflowStateItem = {
  id: string;
  workflow: string;
  state: string;
  trigger: string;
  dependencies: string[];
  module: string;
  editAction: "disabled";
};

export type AdminOwnershipItem = {
  id: string;
  owner: string;
  team: string;
  role: string;
  queue: string;
  capacity: "placeholder";
  load: "placeholder";
  assignmentAction: "disabled";
};

export type AdminEscalationQueueItem = {
  id: string;
  category: "pending" | "escalated" | "overdue" | "sla_risk";
  count: number;
  status: AdminWorkflowStatus;
  escalationAction: "disabled";
};

export type AdminWorkflowCenterDashboard = {
  metrics: AdminWorkflowMetric[];
  queues: AdminOperationsQueue[];
  tasks: AdminTaskReadModel[];
  workflowStates: AdminWorkflowStateItem[];
  ownership: AdminOwnershipItem[];
  escalationQueue: AdminEscalationQueueItem[];
  analytics: AdminWorkflowMetric[];
};

export type AdminKnowledgeStatus = "active" | "draft" | "archived" | "needs_api";

export type AdminKnowledgeSeverity = "critical" | "high" | "normal" | "low";

export type AdminKnowledgeMetric = {
  id: string;
  label: string;
  value: string | number;
  detail: string;
};

export type AdminKnowledgeItem = {
  id: string;
  title: string;
  module: string;
  category: string;
  severity: AdminKnowledgeSeverity;
  version: string;
  owner: string;
  status: AdminKnowledgeStatus;
  lastUpdated: string;
  editAction: "disabled";
  approveAction: "disabled";
};

export type AdminRunbookItem = AdminKnowledgeItem & {
  runbookType: "incident" | "escalation" | "recovery" | "finance" | "supplier" | "security";
};

export type AdminKnowledgeDetail = {
  item: AdminKnowledgeItem;
  overview: string;
  steps: string[];
  relatedWorkflow: string;
  relatedIncident: string;
  relatedNotification: string;
  relatedTeam: string;
  versionHistory: Array<{
    version: string;
    updatedAt: string;
    summary: string;
  }>;
  approvalStatus: "approved" | "pending" | "not_configured";
  futureEditAction: "disabled";
  futureApproveAction: "disabled";
};

export type AdminKnowledgeDashboard = {
  metrics: AdminKnowledgeMetric[];
  sopLibrary: AdminKnowledgeItem[];
  runbooks: AdminRunbookItem[];
  featuredDetail: AdminKnowledgeDetail | null;
  filters: {
    modules: string[];
    categories: string[];
    severities: AdminKnowledgeSeverity[];
    owners: string[];
    statuses: AdminKnowledgeStatus[];
  };
};

export type AdminTeamStatus = "active" | "planned" | "needs_api";

export type AdminTeamMetric = {
  id: string;
  label: string;
  value: string | number;
  detail: string;
};

export type AdminTeamSummary = {
  id: string;
  team: string;
  department: string;
  status: AdminTeamStatus;
  lead: string;
  manager: string;
  module: string;
};

export type AdminOrganizationNode = {
  id: string;
  department: string;
  division: string;
  team: string;
  lead: string;
  manager: string;
  reportingStructure: string;
  editAction: "disabled";
};

export type AdminRaciItem = {
  id: string;
  module: string;
  responsible: string;
  accountable: string;
  consulted: string[];
  informed: string[];
  editAction: "disabled";
};

export type AdminOwnershipMapItem = {
  id: string;
  domain: string;
  queueOwner: string;
  incidentOwner: string;
  workflowOwner: string;
  knowledgeOwner: string;
  platformOwner: string;
  serviceOwner: string;
  assignmentAction: "disabled";
};

export type AdminSkillMatrixItem = {
  id: string;
  role: string;
  primarySkills: string[];
  secondarySkills: string[];
  certification: "placeholder";
  editAction: "disabled";
};

export type AdminCapacityMetric = {
  id: string;
  label: string;
  value: string | number;
  status: AdminTeamStatus;
  detail: string;
};

export type AdminCrossModuleTeamMapping = {
  id: string;
  relationship: string;
  source: string;
  targetTeam: string;
  status: AdminTeamStatus;
};

export type AdminTeamCenterDashboard = {
  metrics: AdminTeamMetric[];
  teams: AdminTeamSummary[];
  organization: AdminOrganizationNode[];
  raci: AdminRaciItem[];
  ownershipMap: AdminOwnershipMapItem[];
  skills: AdminSkillMatrixItem[];
  capacity: AdminCapacityMetric[];
  crossModuleMapping: AdminCrossModuleTeamMapping[];
};

export type AdminApprovalStatus = "pending" | "active" | "watch" | "blocked" | "planned" | "needs_api";

export type AdminApprovalPriority = "critical" | "high" | "normal" | "low";

export type AdminApprovalMetric = {
  id: string;
  label: string;
  value: string | number;
  detail: string;
};

export type AdminApprovalChain = {
  id: string;
  module: string;
  trigger: string;
  reviewLevel: string;
  requiredRole: string;
  sla: string;
  status: AdminApprovalStatus;
  editAction: "disabled";
};

export type AdminGovernanceReview = {
  id: string;
  gate: string;
  module: string;
  ownerTeam: string;
  risk: AdminApprovalPriority;
  status: AdminApprovalStatus;
  detail: string;
};

export type AdminReviewQueueItem = {
  id: string;
  item: string;
  module: string;
  priority: AdminApprovalPriority;
  ownerTeam: string;
  stage: string;
  risk: string;
  createdAt: string;
  sla: string;
  approveAction: "disabled";
  rejectAction: "disabled";
};

export type AdminComplianceWorkflow = {
  id: string;
  policy: string;
  control: string;
  evidence: "placeholder";
  auditLink: "placeholder";
  status: AdminApprovalStatus;
};

export type AdminApprovalCenterDashboard = {
  metrics: AdminApprovalMetric[];
  approvalChains: AdminApprovalChain[];
  governanceReviews: AdminGovernanceReview[];
  reviewQueue: AdminReviewQueueItem[];
  complianceWorkflows: AdminComplianceWorkflow[];
};

export type AdminSearchStatus = "ready" | "needs_api" | "planned" | "disabled";

export type AdminSearchMetric = {
  id: string;
  label: string;
  value: string | number;
  detail: string;
};

export type AdminSearchResult = {
  id: string;
  title: string;
  module: string;
  category: string;
  entityType: string;
  href: string;
  status: AdminSearchStatus;
  detail: string;
};

export type AdminCommandPaletteItem = {
  id: string;
  label: string;
  commandType: "navigate" | "open_module" | "recent_entity" | "favorite" | "recent_search" | "pinned_destination";
  href: string;
  shortcut: string;
  executeAction: "disabled";
};

export type AdminNavigationGraphItem = {
  id: string;
  group: "Operations" | "Finance" | "CRM" | "Content" | "Platform" | "Security" | "AI" | "Knowledge" | "Workflow" | "Approvals" | "Future Ecosystem";
  label: string;
  href: string;
  module: string;
  status: AdminSearchStatus;
};

export type AdminRecentItem = {
  id: string;
  kind: "page" | "search" | "module" | "entity";
  label: string;
  href: string;
  lastSeen: string;
  persistence: "placeholder";
};

export type AdminFavoriteItem = {
  id: string;
  kind: "page" | "module" | "dashboard";
  label: string;
  href: string;
  editAction: "disabled";
};

export type AdminSearchIndexStatus = {
  id: string;
  category: string;
  indexStatus: AdminSearchStatus;
  entityCount: number | "needs_api";
  moduleCoverage: string;
  aiSuggestions: "placeholder";
};

export type AdminKeyboardShortcut = {
  id: string;
  shortcut: string;
  description: string;
  customizationAction: "disabled";
};

export type AdminSearchCenterDashboard = {
  metrics: AdminSearchMetric[];
  results: AdminSearchResult[];
  commandPalette: AdminCommandPaletteItem[];
  navigationGraph: AdminNavigationGraphItem[];
  recent: AdminRecentItem[];
  favorites: AdminFavoriteItem[];
  searchStatus: AdminSearchIndexStatus[];
  shortcuts: AdminKeyboardShortcut[];
};

export type AdminDataGovernanceStatus = "ready" | "watch" | "needs_api" | "planned";

export type AdminDataSensitivity = "public" | "internal" | "confidential" | "restricted";

export type AdminDataGovernanceMetric = {
  id: string;
  label: string;
  value: string | number;
  detail: string;
};

export type AdminDataClassificationItem = {
  id: string;
  domain: string;
  dataType: string;
  classification: string;
  sensitivity: AdminDataSensitivity;
  owner: string;
  retention: string;
  consentRequired: boolean;
  maskingRequired: boolean;
  status: AdminDataGovernanceStatus;
};

export type AdminPiiGovernanceItem = {
  id: string;
  field: string;
  domain: string;
  maskingStatus: AdminDataGovernanceStatus;
  accessAuditStatus: AdminDataGovernanceStatus;
  consentFlag: string;
};

export type AdminRetentionPolicyItem = {
  id: string;
  policy: string;
  domain: string;
  retentionDuration: string;
  legalBasis: "placeholder";
  disposalMethod: "placeholder";
  status: AdminDataGovernanceStatus;
  editAction: "disabled";
};

export type AdminConsentPrivacyItem = {
  id: string;
  consentCategory: string;
  source: string;
  status: AdminDataGovernanceStatus;
  coverage: string;
  lastUpdated: "placeholder";
  action: "disabled";
};

export type AdminDataLineageItem = {
  id: string;
  source: string;
  target: string;
  relationship: string;
  status: AdminDataGovernanceStatus;
};

export type AdminComplianceReadinessItem = {
  id: string;
  area: string;
  status: AdminDataGovernanceStatus;
  detail: string;
};

export type AdminPrivacyRequestItem = {
  id: string;
  requestType: "access" | "correction" | "deletion" | "export" | "consent_withdrawal";
  queue: string;
  status: AdminDataGovernanceStatus;
  workflowAction: "disabled";
};

export type AdminPersonalizationGovernanceItem = {
  id: string;
  dataSet: "preference_data" | "saved_views_data" | "recent_activity_data" | "favorites_data";
  status: AdminDataGovernanceStatus;
  governanceNote: string;
};

export type AdminDataGovernanceDashboard = {
  metrics: AdminDataGovernanceMetric[];
  classifications: AdminDataClassificationItem[];
  piiGovernance: AdminPiiGovernanceItem[];
  retentionPolicies: AdminRetentionPolicyItem[];
  consentPrivacy: AdminConsentPrivacyItem[];
  lineage: AdminDataLineageItem[];
  complianceReadiness: AdminComplianceReadinessItem[];
  privacyRequests: AdminPrivacyRequestItem[];
  personalizationGovernance: AdminPersonalizationGovernanceItem[];
};

export type AdminIntegrationStatus = "connected" | "ready" | "watch" | "needs_api" | "planned";

export type AdminIntegrationMetric = {
  id: string;
  label: string;
  value: string | number;
  detail: string;
};

export type AdminIntegrationRegistryItem = {
  id: string;
  module: string;
  integrationStatus: AdminIntegrationStatus;
  health: AdminIntegrationStatus;
  dependency: string;
  version: string;
  editAction: "disabled";
};

export type AdminDependencyGraphItem = {
  id: string;
  source: string;
  target: string;
  relationship: string;
  status: AdminIntegrationStatus;
};

export type AdminEventFlowItem = {
  id: string;
  event: string;
  sourceModule: string;
  targetModule: string;
  status: AdminIntegrationStatus;
  executionAction: "disabled";
};

export type AdminWorkspaceFoundationItem = {
  id: string;
  area: "saved_views" | "workspace_preferences" | "dashboard_layout" | "favorites" | "recent_activity" | "role_aware_workspace";
  status: AdminIntegrationStatus;
  detail: string;
  saveAction: "disabled";
};

export type AdminCrossModuleIntelligenceItem = {
  id: string;
  relationship: string;
  source: string;
  target: string;
  status: AdminIntegrationStatus;
};

export type AdminEcosystemReadinessItem = {
  id: string;
  ecosystem: "TPL Creators" | "TPL Marketplace" | "TPL Local Life";
  readiness: AdminIntegrationStatus;
  detail: string;
};

export type AdminIntegrationHubDashboard = {
  metrics: AdminIntegrationMetric[];
  registry: AdminIntegrationRegistryItem[];
  dependencyGraph: AdminDependencyGraphItem[];
  eventFlow: AdminEventFlowItem[];
  workspaceFoundation: AdminWorkspaceFoundationItem[];
  crossModuleIntelligence: AdminCrossModuleIntelligenceItem[];
  ecosystemReadiness: AdminEcosystemReadinessItem[];
};

export type AdminCreatorStatus = "active" | "pending" | "suspended" | "ready" | "planned" | "needs_api";

export type AdminCreatorMetric = {
  id: string;
  label: string;
  value: string | number;
  detail: string;
};

export type AdminCreatorListRow = {
  creatorId: string;
  name: string;
  category: string;
  status: AdminCreatorStatus;
  verificationStatus: AdminCreatorStatus;
  contentCount: number;
  earnings: "placeholder";
  riskFlag: "placeholder";
};

export type AdminCreatorMediaItem = {
  id: string;
  creatorId: string;
  mediaType: "image" | "video" | "drone" | "360" | "reel" | "short" | "raw" | "travel_asset";
  title: string;
  status: AdminCreatorStatus;
  licenseStatus: AdminCreatorStatus;
  approveAction: "disabled";
  rejectAction: "disabled";
};

export type AdminCreatorCampaignItem = {
  id: string;
  campaign: string;
  campaignType: "brand" | "tourism_board" | "destination" | "hotel" | "package" | "smart_planner";
  creatorId: string;
  status: AdminCreatorStatus;
  action: "disabled";
};

export type AdminCreatorAnalyticsItem = {
  id: string;
  metric: string;
  value: string | number;
  status: AdminCreatorStatus;
  detail: string;
};

export type AdminCreatorFoundationItem = {
  id: string;
  area: string;
  item: string;
  value: string | number;
  status: AdminCreatorStatus;
  detail: string;
  action: "disabled";
};

export type AdminCreatorDetail = {
  creator: AdminCreatorListRow;
  profile: Record<string, string>;
  workspace: AdminCreatorFoundationItem[];
  studio: AdminCreatorFoundationItem[];
  marketplace: AdminCreatorFoundationItem[];
  verification: AdminCreatorAnalyticsItem[];
  media: AdminCreatorMediaItem[];
  licensing: AdminCreatorAnalyticsItem[];
  campaigns: AdminCreatorCampaignItem[];
  moderation: AdminCreatorAnalyticsItem[];
  earnings: AdminCreatorAnalyticsItem[];
  analytics: AdminCreatorAnalyticsItem[];
  ecosystem: AdminCreatorFoundationItem[];
  communications: AdminCreatorAnalyticsItem[];
  approvals: AdminCreatorAnalyticsItem[];
  audit: AdminCreatorAnalyticsItem[];
};

export type AdminCreatorDashboard = {
  metrics: AdminCreatorMetric[];
  creators: AdminCreatorListRow[];
  media: AdminCreatorMediaItem[];
  campaigns: AdminCreatorCampaignItem[];
  analytics: AdminCreatorAnalyticsItem[];
  workspace: AdminCreatorFoundationItem[];
  studio: AdminCreatorFoundationItem[];
  marketplace: AdminCreatorFoundationItem[];
  moderation: AdminCreatorAnalyticsItem[];
  ecosystem: AdminCreatorFoundationItem[];
  executive: AdminCreatorFoundationItem[];
  identity: AdminCreatorFoundationItem[];
  studioOperations: AdminCreatorFoundationItem[];
  marketplaceOperations: AdminCreatorFoundationItem[];
  executiveAnalytics: AdminCreatorFoundationItem[];
  campaignOperations: AdminCreatorFoundationItem[];
  communicationCenter: AdminCreatorFoundationItem[];
  financialCenter: AdminCreatorFoundationItem[];
  creatorCrm: AdminCreatorFoundationItem[];
  reports: AdminCreatorFoundationItem[];
  search: AdminCreatorFoundationItem[];
  businessCenter: AdminCreatorFoundationItem[];
  assetLifecycle: AdminCreatorFoundationItem[];
  marketplaceIntelligence: AdminCreatorFoundationItem[];
  aiCreatorStudio: AdminCreatorFoundationItem[];
  businessIntelligence: AdminCreatorFoundationItem[];
  travelCreatorNetwork: AdminCreatorFoundationItem[];
  creatorReputation: AdminCreatorFoundationItem[];
  mobileReadiness: AdminCreatorFoundationItem[];
  enterpriseReports: AdminCreatorFoundationItem[];
  deepEcosystemIntelligence: AdminCreatorFoundationItem[];
};

export type AdminTplMarketplaceStatus = "healthy" | "active" | "pending" | "watch" | "critical" | "planned" | "needs_api";

export type AdminTplMarketplaceMetric = {
  id: string;
  label: string;
  value: string | number;
  detail: string;
  status: AdminTplMarketplaceStatus;
};

export type AdminTplMarketplaceItem = {
  id: string;
  area: string;
  item: string;
  value: string | number;
  status: AdminTplMarketplaceStatus;
  detail: string;
  action: "disabled";
};

export type AdminTplMarketplaceDashboard = {
  metrics: AdminTplMarketplaceMetric[];
  executive: AdminTplMarketplaceItem[];
  vendorCenter: AdminTplMarketplaceItem[];
  commerceCenter: AdminTplMarketplaceItem[];
  productStudio: AdminTplMarketplaceItem[];
  marketplaceIntelligence: AdminTplMarketplaceItem[];
  vendorAnalytics: AdminTplMarketplaceItem[];
  financialCenter: AdminTplMarketplaceItem[];
  moderationCenter: AdminTplMarketplaceItem[];
  commerceCrm: AdminTplMarketplaceItem[];
  reports: AdminTplMarketplaceItem[];
  search: AdminTplMarketplaceItem[];
  ecosystem: AdminTplMarketplaceItem[];
  aiCommerce: AdminTplMarketplaceItem[];
  mobileReadiness: AdminTplMarketplaceItem[];
};

export type AdminLocalLifeStatus = "healthy" | "active" | "pending" | "watch" | "critical" | "planned" | "needs_api";

export type AdminLocalLifeMetric = {
  id: string;
  label: string;
  value: string | number;
  detail: string;
  status: AdminLocalLifeStatus;
};

export type AdminLocalLifeItem = {
  id: string;
  area: string;
  item: string;
  value: string | number;
  status: AdminLocalLifeStatus;
  detail: string;
  action: "disabled";
};

export type AdminLocalLifeDashboard = {
  metrics: AdminLocalLifeMetric[];
  executive: AdminLocalLifeItem[];
  experienceCenter: AdminLocalLifeItem[];
  foodCulinaryCenter: AdminLocalLifeItem[];
  cultureCenter: AdminLocalLifeItem[];
  adventureCenter: AdminLocalLifeItem[];
  localGuidesCenter: AdminLocalLifeItem[];
  eventsCenter: AdminLocalLifeItem[];
  marketplace: AdminLocalLifeItem[];
  intelligence: AdminLocalLifeItem[];
  crm: AdminLocalLifeItem[];
  reports: AdminLocalLifeItem[];
  search: AdminLocalLifeItem[];
  ecosystem: AdminLocalLifeItem[];
  aiLocalLife: AdminLocalLifeItem[];
  mobileReadiness: AdminLocalLifeItem[];
};

export type AdminEnterpriseEcosystemStatus = "operational" | "connected" | "source_ready" | "external_pending" | "attention";

export type AdminEnterpriseEcosystemMetric = {
  id: string;
  label: string;
  value: string | number;
  detail: string;
  status: AdminEnterpriseEcosystemStatus;
};

export type AdminEnterpriseEcosystemItem = {
  id: string;
  domain: string;
  capability: string;
  signal: string | number;
  status: AdminEnterpriseEcosystemStatus;
  detail: string;
  action: "disabled";
};

export type AdminEnterpriseEcosystemEdge = {
  id: string;
  source: string;
  target: string;
  relationship: string;
  status: AdminEnterpriseEcosystemStatus;
  detail: string;
};

export type AdminEnterpriseEcosystemDashboard = {
  metrics: AdminEnterpriseEcosystemMetric[];
  missionControl: AdminEnterpriseEcosystemItem[];
  customer360: AdminEnterpriseEcosystemItem[];
  businessIntelligence: AdminEnterpriseEcosystemItem[];
  trustEngine: AdminEnterpriseEcosystemItem[];
  aiMemory: AdminEnterpriseEcosystemItem[];
  aiCommandCenter: AdminEnterpriseEcosystemItem[];
  foodTrustCenter: AdminEnterpriseEcosystemItem[];
  localStoriesCenter: AdminEnterpriseEcosystemItem[];
  communityIntelligence: AdminEnterpriseEcosystemItem[];
  aiLocalConcierge: AdminEnterpriseEcosystemItem[];
  reputationEngine: AdminEnterpriseEcosystemItem[];
  enterpriseGraph: AdminEnterpriseEcosystemEdge[];
  enterpriseSearch: AdminEnterpriseEcosystemItem[];
  executiveAnalytics: AdminEnterpriseEcosystemItem[];
};

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
  requestId?: string;
};

type StoredAdminSession = {
  token: string;
  expiresAt?: string;
  admin: {
    id: string;
    email: string;
    fullName: string;
    status: string;
    roles: string[];
    permissions: string[];
  };
};

const API_TARGET = resolveCurrentTplApiTarget({ preferAdminApiBase: true });
const API_BASE_URL = API_TARGET.baseUrl;

export function getAdminApiBaseUrl(): string {
  return API_BASE_URL;
}

export function isAdminApiConfigured(): boolean {
  return Boolean(API_BASE_URL);
}

export function createAdminRequestId(prefix = "tpl_admin_web"): string {
  const randomValue =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${randomValue}`;
}

export function readAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const session = normalizeAdminSession(parsed);
    if (!session) return null;
    if (session.session.expiresAt && new Date(session.session.expiresAt).getTime() <= Date.now()) {
      clearAdminSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function writeAdminSession(session: AdminSession): void {
  if (typeof window === "undefined") return;
  const minimalSession = toStoredAdminSession(session);
  const serialized = JSON.stringify(minimalSession);

  clearAdminSession();
  try {
    window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, serialized);
  } catch (error) {
    if (!isStorageQuotaError(error)) {
      throw error;
    }
    clearAdminSession();
    try {
      window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, serialized);
    } catch {
      clearAdminSession();
      throw new Error("Admin session could not be stored. Browser storage quota is full.");
    }
  }
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
}

export async function refreshAdminSession(): Promise<AdminSession | null> {
  const current = readAdminSession();
  if (!current) return null;
  const result = await adminApiRequest<AdminUser>("/api/v1/admin/me", {
    token: current.session.token,
  });
  if (!result.ok) return current;
  const refreshed: AdminSession = {
    ...current,
    admin: result.data,
  };
  writeAdminSession(refreshed);
  return refreshed;
}

export function readAdminMfaChallenge(): AdminLoginMfaChallenge | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(ADMIN_MFA_CHALLENGE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isAdminMfaChallenge(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeAdminMfaChallenge(challenge: AdminLoginMfaChallenge): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ADMIN_MFA_CHALLENGE_STORAGE_KEY, JSON.stringify(challenge));
}

export function clearAdminMfaChallenge(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ADMIN_MFA_CHALLENGE_STORAGE_KEY);
}

export async function adminApiRequest<TData>(
  path: string,
  options: RequestOptions = {}
): Promise<AdminApiResult<TData>> {
  const requestId = options.requestId || createAdminRequestId();
  if (!API_BASE_URL) {
    return failure(requestId, 0, {
      code: "ADMIN_API_NOT_CONFIGURED",
      message: "TPL API base URL is not configured.",
    });
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Request-Id": requestId,
  };
  if (typeof options.body !== "undefined") headers["Content-Type"] = "application/json";

  const token = options.token ?? readAdminSession()?.session.token;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE_URL}${normalizePath(path)}`, {
      method: options.method || "GET",
      headers,
      body: typeof options.body === "undefined" ? undefined : JSON.stringify(options.body),
    });
    const payload = await readJson(response);
    const responseRequestId = readRequestId(payload) || response.headers.get("x-request-id") || requestId;

    if (response.ok && payload?.ok === true) {
      return {
        ok: true,
        data: payload.data as TData,
        meta: payload.meta as AdminApiMeta,
        status: response.status,
        requestId: responseRequestId,
      };
    }

    if (response.status === 401 && options.token !== null) {
      clearAdminSession();
    }

    return failure(responseRequestId, response.status, readError(payload, response.status));
  } catch (error) {
    return failure(requestId, 0, {
      code: "ADMIN_API_NETWORK_ERROR",
      message: error instanceof Error ? error.message : "Admin API request failed.",
    });
  }
}

export async function adminLogin(input: { email: string; role?: string; password?: string }): Promise<AdminApiResult<AdminLoginResponse>> {
  const email = input.email.trim().toLowerCase();
  const password = input.password?.trim();
  const body = password
    ? { email, password }
    : { email, role: input.role || "super_admin" };
  return adminApiRequest<AdminLoginResponse>("/api/v1/admin/auth/login", {
    method: "POST",
    body,
    token: null,
  });
}

export async function verifyAdminLoginMfa(mfaChallengeId: string, code: string): Promise<AdminApiResult<AdminSession>> {
  return adminApiRequest<AdminSession>("/api/v1/admin/auth/mfa/verify", {
    method: "POST",
    body: { mfaChallengeId, code },
    token: null,
  });
}

export async function startAdminSso(provider: AdminSsoProvider): Promise<AdminApiResult<AdminSsoStartResponse>> {
  const params = new URLSearchParams({ provider });
  return adminApiRequest<AdminSsoStartResponse>(`/api/v1/admin/auth/sso/start?${params.toString()}`, {
    token: null,
  });
}

export async function completeAdminSsoCallback(
  input: AdminSsoCallbackParams
): Promise<AdminApiResult<AdminLoginResponse>> {
  const params = new URLSearchParams();
  if (input.provider) params.set("provider", input.provider);
  params.set("state", input.state);
  if (input.code) params.set("code", input.code);
  return adminApiRequest<AdminLoginResponse>(`/api/v1/admin/auth/sso/callback?${params.toString()}`, {
    token: null,
  });
}

export async function devCompleteAdminSsoCallback(
  input: AdminSsoDevCallbackParams
): Promise<AdminApiResult<AdminLoginResponse>> {
  return adminApiRequest<AdminLoginResponse>("/api/v1/admin/auth/sso/dev-callback", {
    method: "POST",
    body: input,
    token: null,
  });
}

export type AdminPasswordTokenResponse = {
  requested?: boolean;
  token?: {
    id: string;
    purpose: "setup" | "reset";
    expiresAt: string;
    developmentToken?: string;
  };
};

export async function requestAdminPasswordReset(email: string): Promise<AdminApiResult<AdminPasswordTokenResponse>> {
  return adminApiRequest<AdminPasswordTokenResponse>("/api/v1/admin/auth/password/reset/request", {
    method: "POST",
    body: { email },
    token: null,
  });
}

export async function confirmAdminPasswordReset(token: string, password: string): Promise<AdminApiResult<{ completed: boolean }>> {
  return adminApiRequest<{ completed: boolean }>("/api/v1/admin/auth/password/reset/confirm", {
    method: "POST",
    body: { token, password },
    token: null,
  });
}

export async function setupAdminPassword(token: string, password: string): Promise<AdminApiResult<{ completed: boolean }>> {
  return adminApiRequest<{ completed: boolean }>("/api/v1/admin/auth/password/setup", {
    method: "POST",
    body: { token, password },
    token: null,
  });
}

export async function createAdminSetupToken(adminUserId: string): Promise<AdminApiResult<AdminPasswordTokenResponse>> {
  return adminApiRequest<AdminPasswordTokenResponse>(`/api/v1/admin/users/${encodeURIComponent(adminUserId)}/password/setup-token`, {
    method: "POST",
  });
}

export async function listAdminBookings(query: AdminListQuery = {}): Promise<AdminApiResult<AdminBookingRow[]>> {
  return adminApiRequest<AdminBookingRow[]>(`/api/v1/admin/bookings${buildAdminQuery(query)}`);
}

export async function getAdminBookingDetail(bookingId: string): Promise<AdminApiResult<AdminBookingDetail>> {
  return adminApiRequest<AdminBookingDetail>(`/api/v1/admin/bookings/${encodeURIComponent(bookingId)}`);
}

export async function getAdminBookingTimeline(bookingId: string): Promise<AdminApiResult<AdminBookingTimelineEvent[]>> {
  return adminApiRequest<AdminBookingTimelineEvent[]>(`/api/v1/admin/bookings/${encodeURIComponent(bookingId)}/timeline`);
}

export async function listAdminBookingNotes(bookingId: string): Promise<AdminApiResult<AdminBookingNote[]>> {
  return adminApiRequest<AdminBookingNote[]>(`/api/v1/admin/bookings/${encodeURIComponent(bookingId)}/notes`);
}

export async function addAdminBookingNote(bookingId: string, input: { note: string; category?: string }): Promise<AdminApiResult<AdminBookingNote>> {
  return adminApiRequest<AdminBookingNote>(`/api/v1/admin/bookings/${encodeURIComponent(bookingId)}/notes`, {
    method: "POST",
    body: input,
  });
}

export async function assignAdminBooking(bookingId: string, assignedAgent: string): Promise<AdminApiResult<AdminBookingAssignment>> {
  return adminApiRequest<AdminBookingAssignment>(`/api/v1/admin/bookings/${encodeURIComponent(bookingId)}/assign`, {
    method: "POST",
    body: { assignedAgent },
  });
}

export async function updateAdminBookingPriority(
  bookingId: string,
  input: { priority: AdminBookingPriorityValue; reason?: string }
): Promise<AdminApiResult<AdminBookingPriority>> {
  return adminApiRequest<AdminBookingPriority>(`/api/v1/admin/bookings/${encodeURIComponent(bookingId)}/priority`, {
    method: "POST",
    body: input,
  });
}

export async function exportAdminBookings(query: AdminListQuery = {}): Promise<AdminApiResult<AdminBookingExportResult>> {
  return adminApiRequest<AdminBookingExportResult>(`/api/v1/admin/bookings/export${buildAdminQuery(query)}`);
}

export async function listAdminCustomers(query: AdminListQuery = {}): Promise<AdminApiResult<AdminCustomerListRow[]>> {
  return adminApiRequest<AdminCustomerListRow[]>(`/api/v1/admin/customers${buildAdminQuery(query)}`);
}

export async function getAdminCustomerDetail(customerId: string): Promise<AdminApiResult<AdminCustomerDetail>> {
  return adminApiRequest<AdminCustomerDetail>(`/api/v1/admin/customers/${encodeURIComponent(customerId)}`);
}

export async function listAdminPayments(query: AdminListQuery = {}): Promise<AdminApiResult<AdminPaymentRow[]>> {
  return adminApiRequest<AdminPaymentRow[]>(`/api/v1/admin/payments${buildAdminQuery(query)}`);
}

export async function getAdminPaymentDetail(paymentId: string): Promise<AdminApiResult<AdminPaymentDetail>> {
  return adminApiRequest<AdminPaymentDetail>(`/api/v1/admin/payments/${encodeURIComponent(paymentId)}`);
}

export async function listAdminRefunds(query: AdminListQuery = {}): Promise<AdminApiResult<AdminRefundRow[]>> {
  return adminApiRequest<AdminRefundRow[]>(`/api/v1/admin/refunds${buildAdminQuery(query)}`);
}

export async function getAdminRefundDetail(refundId: string): Promise<AdminApiResult<AdminRefundDetail>> {
  return adminApiRequest<AdminRefundDetail>(`/api/v1/admin/refunds/${encodeURIComponent(refundId)}`);
}

export async function listAdminWallets(query: AdminListQuery = {}): Promise<AdminApiResult<AdminWalletRow[]>> {
  return adminApiRequest<AdminWalletRow[]>(`/api/v1/admin/wallets${buildAdminQuery(query)}`);
}

export async function getAdminWalletDetail(walletId: string): Promise<AdminApiResult<AdminWalletDetail>> {
  return adminApiRequest<AdminWalletDetail>(`/api/v1/admin/wallets/${encodeURIComponent(walletId)}`);
}

export async function listAdminLedger(query: AdminListQuery = {}): Promise<AdminApiResult<AdminLedgerRow[]>> {
  return adminApiRequest<AdminLedgerRow[]>(`/api/v1/admin/ledger${buildAdminQuery(query)}`);
}

export async function listAdminOperationsEvents(query: AdminListQuery = {}): Promise<AdminApiResult<AdminOperationsEvent[]>> {
  return adminApiRequest<AdminOperationsEvent[]>(`/api/v1/admin/operations/events${buildAdminQuery(query)}`);
}

export async function listAdminCommunications(query: AdminListQuery = {}): Promise<AdminApiResult<AdminCommunicationEvent[]>> {
  return adminApiRequest<AdminCommunicationEvent[]>(`/api/v1/admin/communications${buildAdminQuery(query)}`);
}

export async function getAdminCommunicationDetail(communicationId: string): Promise<AdminApiResult<AdminCommunicationDetail>> {
  return adminApiRequest<AdminCommunicationDetail>(`/api/v1/admin/communications/${encodeURIComponent(communicationId)}`);
}

export async function listAdminCommunicationTemplates(): Promise<AdminApiResult<AdminCommunicationTemplate[]>> {
  return adminApiRequest<AdminCommunicationTemplate[]>("/api/v1/admin/templates");
}

export async function listAdminSuppliers(query: AdminListQuery = {}): Promise<AdminApiResult<AdminSupplierRow[]>> {
  return adminApiRequest<AdminSupplierRow[]>(`/api/v1/admin/suppliers${buildAdminQuery(query)}`);
}

export async function getAdminSupplierDetail(supplierId: string): Promise<AdminApiResult<AdminSupplierDetail>> {
  return adminApiRequest<AdminSupplierDetail>(`/api/v1/admin/suppliers/${encodeURIComponent(supplierId)}`);
}

export async function listAdminProviderHealth(): Promise<AdminApiResult<AdminProviderHealth[]>> {
  return adminApiRequest<AdminProviderHealth[]>("/api/v1/admin/provider-health");
}

export async function listAdminInventoryHealth(): Promise<AdminApiResult<AdminInventoryHealth[]>> {
  return adminApiRequest<AdminInventoryHealth[]>("/api/v1/admin/inventory-health");
}

export async function listAdminSupplierEvents(query: AdminListQuery = {}): Promise<AdminApiResult<AdminSupplierEvent[]>> {
  return adminApiRequest<AdminSupplierEvent[]>(`/api/v1/admin/supplier-events${buildAdminQuery(query)}`);
}

export async function getAdminContentDashboard(): Promise<AdminApiResult<AdminContentDashboard>> {
  return adminApiRequest<AdminContentDashboard>("/api/v1/admin/content");
}

export async function getAdminContentHomepage(): Promise<AdminApiResult<AdminContentHomepageSection[]>> {
  return adminApiRequest<AdminContentHomepageSection[]>("/api/v1/admin/content/homepage");
}

export async function listAdminContentDestinations(query: AdminListQuery = {}): Promise<AdminApiResult<AdminContentItem[]>> {
  return adminApiRequest<AdminContentItem[]>(`/api/v1/admin/content/destinations${buildAdminQuery(query)}`);
}

export async function listAdminContentPackages(query: AdminListQuery = {}): Promise<AdminApiResult<AdminContentItem[]>> {
  return adminApiRequest<AdminContentItem[]>(`/api/v1/admin/content/packages${buildAdminQuery(query)}`);
}

export async function listAdminContentThemes(query: AdminListQuery = {}): Promise<AdminApiResult<AdminContentItem[]>> {
  return adminApiRequest<AdminContentItem[]>(`/api/v1/admin/content/themes${buildAdminQuery(query)}`);
}

export async function listAdminContentOffers(query: AdminListQuery = {}): Promise<AdminApiResult<AdminContentItem[]>> {
  return adminApiRequest<AdminContentItem[]>(`/api/v1/admin/content/offers${buildAdminQuery(query)}`);
}

export async function listAdminContentBlogs(query: AdminListQuery = {}): Promise<AdminApiResult<AdminContentItem[]>> {
  return adminApiRequest<AdminContentItem[]>(`/api/v1/admin/content/blogs${buildAdminQuery(query)}`);
}

export async function listAdminContentMedia(query: AdminListQuery = {}): Promise<AdminApiResult<AdminContentMediaItem[]>> {
  return adminApiRequest<AdminContentMediaItem[]>(`/api/v1/admin/content/media${buildAdminQuery(query)}`);
}

export async function listAdminContentSeo(query: AdminListQuery = {}): Promise<AdminApiResult<AdminContentSeoItem[]>> {
  return adminApiRequest<AdminContentSeoItem[]>(`/api/v1/admin/content/seo${buildAdminQuery(query)}`);
}

export async function getAdminWebsiteExperienceLoginSignup(): Promise<AdminApiResult<WebsiteExperienceAdminResponse>> {
  return adminApiRequest<WebsiteExperienceAdminResponse>("/api/v1/admin/content/website-experience/login-signup");
}

export async function saveAdminWebsiteExperienceDraft(
  context: WebsiteExperienceContext,
  content: WebsiteExperienceContent
): Promise<AdminApiResult<WebsiteExperienceAdminContext>> {
  return adminApiRequest<WebsiteExperienceAdminContext>(
    `/api/v1/admin/content/website-experience/login-signup/${encodeURIComponent(context)}/draft`,
    {
      method: "PUT",
      body: content,
    }
  );
}

export async function publishAdminWebsiteExperienceContext(
  context: WebsiteExperienceContext,
  input?: { reason?: string }
): Promise<AdminApiResult<WebsiteExperienceAdminContext>> {
  return adminApiRequest<WebsiteExperienceAdminContext>(
    `/api/v1/admin/content/website-experience/login-signup/${encodeURIComponent(context)}/publish`,
    {
      method: "POST",
      ...(input ? { body: JSON.stringify(input) } : {}),
    }
  );
}

export async function submitAdminWebsiteExperienceApproval(
  context: WebsiteExperienceContext,
  note?: string
): Promise<AdminApiResult<WebsiteExperienceAdminContext>> {
  return adminApiRequest<WebsiteExperienceAdminContext>(
    `/api/v1/admin/content/website-experience/login-signup/${encodeURIComponent(context)}/approval/submit`,
    { method: "POST", body: JSON.stringify({ note }) }
  );
}

export async function approveAdminWebsiteExperienceDraft(
  context: WebsiteExperienceContext,
  note?: string
): Promise<AdminApiResult<WebsiteExperienceAdminContext>> {
  return adminApiRequest<WebsiteExperienceAdminContext>(
    `/api/v1/admin/content/website-experience/login-signup/${encodeURIComponent(context)}/approval/approve`,
    { method: "POST", body: JSON.stringify({ note }) }
  );
}

export async function requestAdminWebsiteExperienceChanges(
  context: WebsiteExperienceContext,
  note?: string
): Promise<AdminApiResult<WebsiteExperienceAdminContext>> {
  return adminApiRequest<WebsiteExperienceAdminContext>(
    `/api/v1/admin/content/website-experience/login-signup/${encodeURIComponent(context)}/approval/request-changes`,
    { method: "POST", body: JSON.stringify({ note }) }
  );
}

export async function deleteAdminWebsiteExperienceDraft(
  context: WebsiteExperienceContext
): Promise<AdminApiResult<WebsiteExperienceAdminContext>> {
  return adminApiRequest<WebsiteExperienceAdminContext>(
    `/api/v1/admin/content/website-experience/login-signup/${encodeURIComponent(context)}/draft/delete`,
    { method: "POST" }
  );
}

export async function archiveAdminWebsiteExperienceContext(
  context: WebsiteExperienceContext,
  note?: string
): Promise<AdminApiResult<WebsiteExperienceAdminContext>> {
  return adminApiRequest<WebsiteExperienceAdminContext>(
    `/api/v1/admin/content/website-experience/login-signup/${encodeURIComponent(context)}/archive`,
    { method: "POST", body: JSON.stringify({ note }) }
  );
}

export async function restoreAdminWebsiteExperienceContext(
  context: WebsiteExperienceContext,
  note?: string
): Promise<AdminApiResult<WebsiteExperienceAdminContext>> {
  return adminApiRequest<WebsiteExperienceAdminContext>(
    `/api/v1/admin/content/website-experience/login-signup/${encodeURIComponent(context)}/restore`,
    { method: "POST", body: JSON.stringify({ note }) }
  );
}

export async function scheduleAdminWebsiteExperienceContext(
  context: WebsiteExperienceContext,
  input: { publishAt: string; endAt?: string; timezone: string; reason?: string }
): Promise<AdminApiResult<WebsiteExperienceAdminContext>> {
  return adminApiRequest<WebsiteExperienceAdminContext>(
    `/api/v1/admin/content/website-experience/login-signup/${encodeURIComponent(context)}/schedule`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function cancelAdminWebsiteExperienceSchedule(
  context: WebsiteExperienceContext
): Promise<AdminApiResult<WebsiteExperienceAdminContext>> {
  return adminApiRequest<WebsiteExperienceAdminContext>(
    `/api/v1/admin/content/website-experience/login-signup/${encodeURIComponent(context)}/schedule/cancel`,
    {
      method: "POST",
    }
  );
}

export async function registerAdminWebsiteExperienceMedia(input: {
  context: WebsiteExperienceContext;
  slot: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  altText?: string;
}): Promise<AdminApiResult<WebsiteExperienceMediaView>> {
  return adminApiRequest<WebsiteExperienceMediaView>("/api/v1/admin/content/website-experience/media", {
    method: "POST",
    body: input,
  });
}

export async function uploadAdminWebsiteExperienceMedia(input: {
  context: WebsiteExperienceContext;
  slot: string;
  file: File;
  altText?: string;
}): Promise<AdminApiResult<WebsiteExperienceMediaView>> {
  const requestId = createAdminRequestId();
  if (!API_BASE_URL) {
    return failure(requestId, 0, {
      code: "ADMIN_API_NOT_CONFIGURED",
      message: "TPL API base URL is not configured.",
    });
  }
  const token = readAdminSession()?.session.token;
  if (!token) {
    return failure(requestId, 401, {
      code: "ADMIN_UNAUTHORIZED",
      message: "Admin session expired or is not authorized. Sign in again.",
    });
  }

  const params = new URLSearchParams({
    context: input.context,
    slot: input.slot,
    filename: input.file.name,
  });
  if (input.altText?.trim()) params.set("altText", input.altText.trim());

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/content/website-experience/media/upload?${params.toString()}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": input.file.type || "application/octet-stream",
        "X-Request-Id": requestId,
      },
      body: input.file,
    });
    const payload = await readJson(response);
    const responseRequestId = readRequestId(payload) || response.headers.get("x-request-id") || requestId;
    if (response.ok && payload?.ok === true) {
      return {
        ok: true,
        data: payload.data as WebsiteExperienceMediaView,
        meta: payload.meta as AdminApiMeta,
        status: response.status,
        requestId: responseRequestId,
      };
    }
    if (response.status === 401) clearAdminSession();
    return failure(responseRequestId, response.status, readError(payload, response.status));
  } catch (error) {
    return failure(requestId, 0, {
      code: "ADMIN_API_NETWORK_ERROR",
      message: error instanceof Error ? error.message : "Admin media upload failed.",
    });
  }
}

export async function listAdminPartnerRegistrationIntakes(): Promise<AdminApiResult<PartnerAdminRegistrationIntakesResponse>> {
  return adminApiRequest<PartnerAdminRegistrationIntakesResponse>("/api/v1/admin/partners/registration-intakes");
}

export async function getAdminPartnerServiceCatalogue(): Promise<AdminApiResult<AdminPartnerServiceCatalogueResponse>> {
  return adminApiRequest<AdminPartnerServiceCatalogueResponse>("/api/v1/admin/partners/service-catalogue");
}

export async function saveAdminPartnerServiceCatalogueDraft(input: {
  item: Partial<AdminPartnerServiceCatalogueItem>;
  expectedDraftVersion?: number;
  changeSummary?: string;
}): Promise<AdminApiResult<AdminPartnerServiceCatalogueResponse>> {
  return adminApiRequest<AdminPartnerServiceCatalogueResponse>("/api/v1/admin/partners/service-catalogue/draft", {
    method: "POST",
    body: input,
  });
}

export async function publishAdminPartnerServiceCatalogue(input: {
  expectedDraftVersion?: number;
  changeSummary?: string;
  reason?: string;
}): Promise<AdminApiResult<AdminPartnerServiceCatalogueResponse>> {
  return adminApiRequest<AdminPartnerServiceCatalogueResponse>("/api/v1/admin/partners/service-catalogue/publish", {
    method: "POST",
    body: input,
  });
}

export async function submitAdminPartnerServiceCatalogueApproval(input: {
  expectedDraftVersion?: number;
  changeSummary?: string;
  note?: string;
}): Promise<AdminApiResult<AdminPartnerServiceCatalogueResponse>> {
  return adminApiRequest<AdminPartnerServiceCatalogueResponse>("/api/v1/admin/partners/service-catalogue/approval/submit", {
    method: "POST",
    body: input,
  });
}

export async function approveAdminPartnerServiceCatalogueDraft(input: {
  expectedDraftVersion?: number;
  changeSummary?: string;
  note?: string;
}): Promise<AdminApiResult<AdminPartnerServiceCatalogueResponse>> {
  return adminApiRequest<AdminPartnerServiceCatalogueResponse>("/api/v1/admin/partners/service-catalogue/approval/approve", {
    method: "POST",
    body: input,
  });
}

export async function requestAdminPartnerServiceCatalogueChanges(input: {
  expectedDraftVersion?: number;
  changeSummary?: string;
  note?: string;
}): Promise<AdminApiResult<AdminPartnerServiceCatalogueResponse>> {
  return adminApiRequest<AdminPartnerServiceCatalogueResponse>("/api/v1/admin/partners/service-catalogue/approval/request-changes", {
    method: "POST",
    body: input,
  });
}

export async function changeAdminPartnerServiceCatalogueLifecycle(
  stableCode: string,
  action: "activate" | "inactivate" | "archive" | "reactivate",
  input: { expectedDraftVersion?: number; changeSummary?: string } = {}
): Promise<AdminApiResult<AdminPartnerServiceCatalogueResponse>> {
  return adminApiRequest<AdminPartnerServiceCatalogueResponse>(
    `/api/v1/admin/partners/service-catalogue/items/${encodeURIComponent(stableCode)}/${encodeURIComponent(action)}`,
    {
      method: "POST",
      body: input,
    }
  );
}

export async function deleteAdminPartnerServiceCatalogueDraftItem(
  stableCode: string,
  input: { expectedDraftVersion?: number; changeSummary?: string } = {}
): Promise<AdminApiResult<AdminPartnerServiceCatalogueResponse>> {
  return adminApiRequest<AdminPartnerServiceCatalogueResponse>(
    `/api/v1/admin/partners/service-catalogue/items/${encodeURIComponent(stableCode)}`,
    {
      method: "DELETE",
      body: input,
    }
  );
}

export async function resolveAdminPartnerRequestedService(input: {
  requestKey: string;
  resolutionType: "mapped_to_existing" | "draft_service_created" | "closed";
  mappedServiceCode?: string;
  draftServiceCode?: string;
  resolutionNote?: string;
  expectedStatus?: string;
}): Promise<AdminApiResult<AdminPartnerServiceCatalogueResponse>> {
  return adminApiRequest<AdminPartnerServiceCatalogueResponse>("/api/v1/admin/partners/service-catalogue/requested-services/resolve", {
    method: "POST",
    body: input,
  });
}

export async function getAdminExecutiveDashboard(): Promise<AdminApiResult<AdminExecutiveDashboard>> {
  return adminApiRequest<AdminExecutiveDashboard>("/api/v1/admin/executive");
}

export async function listAdminExecutiveReports(): Promise<AdminApiResult<AdminExecutiveReport[]>> {
  return adminApiRequest<AdminExecutiveReport[]>("/api/v1/admin/reports");
}

export async function listAdminExecutiveAnalytics(): Promise<AdminApiResult<AdminExecutiveAnalyticsItem[]>> {
  return adminApiRequest<AdminExecutiveAnalyticsItem[]>("/api/v1/admin/analytics");
}

export async function getAdminSecurityOverview(): Promise<AdminApiResult<AdminSecurityOverview>> {
  return adminApiRequest<AdminSecurityOverview>("/api/v1/admin/security/overview");
}

export async function getAdminSecurityRbac(): Promise<AdminApiResult<AdminSecurityRbac>> {
  return adminApiRequest<AdminSecurityRbac>("/api/v1/admin/security/rbac");
}

export async function getAdminSecurityAuditIntelligence(query: AdminListQuery = {}): Promise<AdminApiResult<AdminSecurityAuditIntelligence>> {
  return adminApiRequest<AdminSecurityAuditIntelligence>(`/api/v1/admin/security/audit-intelligence${buildAdminQuery(query)}`);
}

export async function getAdminPlatformDashboard(): Promise<AdminApiResult<AdminPlatformDashboard>> {
  return adminApiRequest<AdminPlatformDashboard>("/api/v1/admin/platform");
}

export async function listAdminPlatformIntegrations(): Promise<AdminApiResult<AdminPlatformIntegration[]>> {
  return adminApiRequest<AdminPlatformIntegration[]>("/api/v1/admin/platform/integrations");
}

export async function listAdminPlatformFeatureFlags(): Promise<AdminApiResult<AdminPlatformFeatureFlag[]>> {
  return adminApiRequest<AdminPlatformFeatureFlag[]>("/api/v1/admin/platform/feature-flags");
}

export async function listAdminPlatformRuntime(): Promise<AdminApiResult<AdminPlatformRuntimeItem[]>> {
  return adminApiRequest<AdminPlatformRuntimeItem[]>("/api/v1/admin/platform/runtime");
}

export async function listAdminPlatformApis(): Promise<AdminApiResult<AdminPlatformApiRegistryItem[]>> {
  return adminApiRequest<AdminPlatformApiRegistryItem[]>("/api/v1/admin/platform/apis");
}

export async function getAdminAiOpsDashboard(): Promise<AdminApiResult<AdminAiOpsDashboard>> {
  return adminApiRequest<AdminAiOpsDashboard>("/api/v1/admin/ai");
}

export async function listAdminIncidents(): Promise<AdminApiResult<AdminIncidentEvent[]>> {
  return adminApiRequest<AdminIncidentEvent[]>("/api/v1/admin/incidents");
}

export async function listAdminSla(): Promise<AdminApiResult<AdminSlaItem[]>> {
  return adminApiRequest<AdminSlaItem[]>("/api/v1/admin/sla");
}

export async function listAdminAutomation(): Promise<AdminApiResult<AdminAutomationWorkflow[]>> {
  return adminApiRequest<AdminAutomationWorkflow[]>("/api/v1/admin/automation");
}

export async function listAdminRecommendations(): Promise<AdminApiResult<AdminAiRecommendation[]>> {
  return adminApiRequest<AdminAiRecommendation[]>("/api/v1/admin/recommendations");
}

export async function getAdminObservabilityDashboard(): Promise<AdminApiResult<AdminObservabilityDashboard>> {
  return adminApiRequest<AdminObservabilityDashboard>("/api/v1/admin/observability");
}

export async function listAdminCorrelations(): Promise<AdminApiResult<AdminEventCorrelation[]>> {
  return adminApiRequest<AdminEventCorrelation[]>("/api/v1/admin/correlations");
}

export async function listAdminMetrics(): Promise<AdminApiResult<AdminMetricsInventoryItem[]>> {
  return adminApiRequest<AdminMetricsInventoryItem[]>("/api/v1/admin/metrics");
}

export async function listAdminTraces(): Promise<AdminApiResult<AdminTraceReadinessItem[]>> {
  return adminApiRequest<AdminTraceReadinessItem[]>("/api/v1/admin/traces");
}

export async function listAdminAlerts(): Promise<AdminApiResult<AdminAlertCategory[]>> {
  return adminApiRequest<AdminAlertCategory[]>("/api/v1/admin/alerts");
}

export async function getAdminNotificationCenter(query: AdminListQuery = {}): Promise<AdminApiResult<AdminNotificationCenterDashboard>> {
  return adminApiRequest<AdminNotificationCenterDashboard>(`/api/v1/admin/notifications${buildAdminQuery(query)}`);
}

export async function listAdminAlertRouting(): Promise<AdminApiResult<AdminAlertRoutingRule[]>> {
  return adminApiRequest<AdminAlertRoutingRule[]>("/api/v1/admin/alert-routing");
}

export async function listAdminEscalations(): Promise<AdminApiResult<AdminEscalationPolicy[]>> {
  return adminApiRequest<AdminEscalationPolicy[]>("/api/v1/admin/escalations");
}

export async function listAdminNotificationTemplates(): Promise<AdminApiResult<AdminNotificationTemplateView[]>> {
  return adminApiRequest<AdminNotificationTemplateView[]>("/api/v1/admin/notification-templates");
}

export async function getAdminWorkflowCenter(): Promise<AdminApiResult<AdminWorkflowCenterDashboard>> {
  return adminApiRequest<AdminWorkflowCenterDashboard>("/api/v1/admin/workflows");
}

export async function listAdminTasks(): Promise<AdminApiResult<AdminTaskReadModel[]>> {
  return adminApiRequest<AdminTaskReadModel[]>("/api/v1/admin/tasks");
}

export async function listAdminQueues(): Promise<AdminApiResult<AdminOperationsQueue[]>> {
  return adminApiRequest<AdminOperationsQueue[]>("/api/v1/admin/queues");
}

export async function listAdminWorkflowStates(): Promise<AdminApiResult<AdminWorkflowStateItem[]>> {
  return adminApiRequest<AdminWorkflowStateItem[]>("/api/v1/admin/workflow-states");
}

export async function listAdminOwnership(): Promise<AdminApiResult<AdminOwnershipItem[]>> {
  return adminApiRequest<AdminOwnershipItem[]>("/api/v1/admin/ownership");
}

export async function getAdminKnowledgeCenter(): Promise<AdminApiResult<AdminKnowledgeDashboard>> {
  return adminApiRequest<AdminKnowledgeDashboard>("/api/v1/admin/knowledge");
}

export async function getAdminKnowledgeDetail(itemId: string): Promise<AdminApiResult<AdminKnowledgeDetail>> {
  return adminApiRequest<AdminKnowledgeDetail>(`/api/v1/admin/knowledge/${encodeURIComponent(itemId)}`);
}

export async function listAdminRunbooks(): Promise<AdminApiResult<AdminRunbookItem[]>> {
  return adminApiRequest<AdminRunbookItem[]>("/api/v1/admin/runbooks");
}

export async function listAdminSops(): Promise<AdminApiResult<AdminKnowledgeItem[]>> {
  return adminApiRequest<AdminKnowledgeItem[]>("/api/v1/admin/sops");
}

export async function getAdminTeamCenter(): Promise<AdminApiResult<AdminTeamCenterDashboard>> {
  return adminApiRequest<AdminTeamCenterDashboard>("/api/v1/admin/teams");
}

export async function listAdminOrganization(): Promise<AdminApiResult<AdminOrganizationNode[]>> {
  return adminApiRequest<AdminOrganizationNode[]>("/api/v1/admin/organization");
}

export async function listAdminRaci(): Promise<AdminApiResult<AdminRaciItem[]>> {
  return adminApiRequest<AdminRaciItem[]>("/api/v1/admin/raci");
}

export async function listAdminOwnershipMap(): Promise<AdminApiResult<AdminOwnershipMapItem[]>> {
  return adminApiRequest<AdminOwnershipMapItem[]>("/api/v1/admin/ownership-map");
}

export async function listAdminSkills(): Promise<AdminApiResult<AdminSkillMatrixItem[]>> {
  return adminApiRequest<AdminSkillMatrixItem[]>("/api/v1/admin/skills");
}

export async function listAdminCapacity(): Promise<AdminApiResult<AdminCapacityMetric[]>> {
  return adminApiRequest<AdminCapacityMetric[]>("/api/v1/admin/capacity");
}

export async function getAdminApprovalCenter(): Promise<AdminApiResult<AdminApprovalCenterDashboard>> {
  return adminApiRequest<AdminApprovalCenterDashboard>("/api/v1/admin/approvals");
}

export async function listAdminApprovalChains(): Promise<AdminApiResult<AdminApprovalChain[]>> {
  return adminApiRequest<AdminApprovalChain[]>("/api/v1/admin/approval-chains");
}

export async function listAdminGovernanceReviews(): Promise<AdminApiResult<AdminGovernanceReview[]>> {
  return adminApiRequest<AdminGovernanceReview[]>("/api/v1/admin/governance-reviews");
}

export async function listAdminComplianceWorkflows(): Promise<AdminApiResult<AdminComplianceWorkflow[]>> {
  return adminApiRequest<AdminComplianceWorkflow[]>("/api/v1/admin/compliance-workflows");
}

export async function getAdminSearchCenter(): Promise<AdminApiResult<AdminSearchCenterDashboard>> {
  return adminApiRequest<AdminSearchCenterDashboard>("/api/v1/admin/search");
}

export async function listAdminNavigationGraph(): Promise<AdminApiResult<AdminNavigationGraphItem[]>> {
  return adminApiRequest<AdminNavigationGraphItem[]>("/api/v1/admin/navigation");
}

export async function listAdminRecentDiscovery(): Promise<AdminApiResult<AdminRecentItem[]>> {
  return adminApiRequest<AdminRecentItem[]>("/api/v1/admin/recent");
}

export async function listAdminFavorites(): Promise<AdminApiResult<AdminFavoriteItem[]>> {
  return adminApiRequest<AdminFavoriteItem[]>("/api/v1/admin/favorites");
}

export async function listAdminSearchStatus(): Promise<AdminApiResult<AdminSearchIndexStatus[]>> {
  return adminApiRequest<AdminSearchIndexStatus[]>("/api/v1/admin/search-status");
}

export async function getAdminDataGovernance(): Promise<AdminApiResult<AdminDataGovernanceDashboard>> {
  return adminApiRequest<AdminDataGovernanceDashboard>("/api/v1/admin/data-governance");
}

export async function listAdminDataClassification(): Promise<AdminApiResult<AdminDataClassificationItem[]>> {
  return adminApiRequest<AdminDataClassificationItem[]>("/api/v1/admin/data-classification");
}

export async function getAdminPrivacyCenter(): Promise<AdminApiResult<{
  piiGovernance: AdminPiiGovernanceItem[];
  consentPrivacy: AdminConsentPrivacyItem[];
  privacyRequests: AdminPrivacyRequestItem[];
  personalizationGovernance: AdminPersonalizationGovernanceItem[];
}>> {
  return adminApiRequest<{
    piiGovernance: AdminPiiGovernanceItem[];
    consentPrivacy: AdminConsentPrivacyItem[];
    privacyRequests: AdminPrivacyRequestItem[];
    personalizationGovernance: AdminPersonalizationGovernanceItem[];
  }>("/api/v1/admin/privacy");
}

export async function listAdminRetentionPolicies(): Promise<AdminApiResult<AdminRetentionPolicyItem[]>> {
  return adminApiRequest<AdminRetentionPolicyItem[]>("/api/v1/admin/retention");
}

export async function listAdminDataLineage(): Promise<AdminApiResult<AdminDataLineageItem[]>> {
  return adminApiRequest<AdminDataLineageItem[]>("/api/v1/admin/data-lineage");
}

export async function listAdminComplianceReadiness(): Promise<AdminApiResult<AdminComplianceReadinessItem[]>> {
  return adminApiRequest<AdminComplianceReadinessItem[]>("/api/v1/admin/compliance-readiness");
}

export async function getAdminIntegrationHub(): Promise<AdminApiResult<AdminIntegrationHubDashboard>> {
  return adminApiRequest<AdminIntegrationHubDashboard>("/api/v1/admin/integration");
}

export async function listAdminIntegrationRegistry(): Promise<AdminApiResult<AdminIntegrationRegistryItem[]>> {
  return adminApiRequest<AdminIntegrationRegistryItem[]>("/api/v1/admin/integration-registry");
}

export async function listAdminDependencyGraph(): Promise<AdminApiResult<AdminDependencyGraphItem[]>> {
  return adminApiRequest<AdminDependencyGraphItem[]>("/api/v1/admin/dependency-graph");
}

export async function listAdminEventFlow(): Promise<AdminApiResult<AdminEventFlowItem[]>> {
  return adminApiRequest<AdminEventFlowItem[]>("/api/v1/admin/event-flow");
}

export async function listAdminWorkspaceFoundation(): Promise<AdminApiResult<AdminWorkspaceFoundationItem[]>> {
  return adminApiRequest<AdminWorkspaceFoundationItem[]>("/api/v1/admin/workspace-foundation");
}

export async function getAdminCreators(): Promise<AdminApiResult<AdminCreatorDashboard>> {
  return adminApiRequest<AdminCreatorDashboard>("/api/v1/admin/creator");
}

export async function getAdminCreatorDetail(creatorId: string): Promise<AdminApiResult<AdminCreatorDetail>> {
  return adminApiRequest<AdminCreatorDetail>(`/api/v1/admin/creator/${encodeURIComponent(creatorId)}`);
}

export async function listAdminCreatorMedia(): Promise<AdminApiResult<AdminCreatorMediaItem[]>> {
  return adminApiRequest<AdminCreatorMediaItem[]>("/api/v1/admin/creator-media");
}

export async function listAdminCreatorCampaigns(): Promise<AdminApiResult<AdminCreatorCampaignItem[]>> {
  return adminApiRequest<AdminCreatorCampaignItem[]>("/api/v1/admin/creator-campaigns");
}

export async function listAdminCreatorAnalytics(): Promise<AdminApiResult<AdminCreatorAnalyticsItem[]>> {
  return adminApiRequest<AdminCreatorAnalyticsItem[]>("/api/v1/admin/creator-analytics");
}

export async function getAdminTplMarketplace(): Promise<AdminApiResult<AdminTplMarketplaceDashboard>> {
  return adminApiRequest<AdminTplMarketplaceDashboard>("/api/v1/admin/marketplace");
}

export async function getAdminLocalLife(): Promise<AdminApiResult<AdminLocalLifeDashboard>> {
  return adminApiRequest<AdminLocalLifeDashboard>("/api/v1/admin/local-life");
}

export async function getAdminEnterpriseEcosystem(): Promise<AdminApiResult<AdminEnterpriseEcosystemDashboard>> {
  return adminApiRequest<AdminEnterpriseEcosystemDashboard>("/api/v1/admin/ecosystem");
}

export async function getAdminRoles(): Promise<AdminApiResult<Array<{ role: string; permissions: string[] }>>> {
  return adminApiRequest<Array<{ role: string; permissions: string[] }>>("/api/v1/admin/roles");
}

export async function getAdminPermissions(): Promise<AdminApiResult<Array<{ permission: string }>>> {
  return adminApiRequest<Array<{ permission: string }>>("/api/v1/admin/permissions");
}

export async function getAdminSessions(): Promise<AdminApiResult<AdminSessionView[]>> {
  return adminApiRequest<AdminSessionView[]>("/api/v1/admin/sessions");
}

export async function getAdminIdentityAccessOverview(query: {
  context?: string;
  method?: string;
  result?: string;
  eventType?: string;
  search?: string;
} = {}): Promise<AdminApiResult<AdminIdentityAccessOverview>> {
  return adminApiRequest<AdminIdentityAccessOverview>(`/api/v1/admin/identity-access/auth-activity${buildAdminQuery(query)}`);
}

export async function revokeAdminSession(sessionId: string): Promise<AdminApiResult<{ revoked: boolean }>> {
  return adminApiRequest<{ revoked: boolean }>(`/api/v1/admin/sessions/${encodeURIComponent(sessionId)}/revoke`, {
    method: "POST",
  });
}

export async function revokeAllAdminSessions(): Promise<AdminApiResult<{ revokedSessions: number }>> {
  return adminApiRequest<{ revokedSessions: number }>("/api/v1/admin/sessions/revoke-all", {
    method: "POST",
  });
}

export async function getAdminMfaStatus(): Promise<AdminApiResult<AdminMfaStatus>> {
  return adminApiRequest<AdminMfaStatus>("/api/v1/admin/mfa/status");
}

export async function enrollAdminMfa(): Promise<AdminApiResult<AdminMfaStatus>> {
  return adminApiRequest<AdminMfaStatus>("/api/v1/admin/mfa/enroll", {
    method: "POST",
  });
}

export async function getAdminMfaQr(): Promise<AdminApiResult<AdminMfaQr>> {
  return adminApiRequest<AdminMfaQr>("/api/v1/admin/mfa/qr");
}

export async function verifyAdminMfa(code: string): Promise<AdminApiResult<{ verified: boolean }>> {
  return adminApiRequest<{ verified: boolean }>("/api/v1/admin/mfa/verify", {
    method: "POST",
    body: { code },
  });
}

export async function disableAdminMfa(): Promise<AdminApiResult<AdminMfaStatus>> {
  return adminApiRequest<AdminMfaStatus>("/api/v1/admin/mfa/disable", {
    method: "POST",
  });
}

export async function regenerateAdminMfaBackupCodes(): Promise<AdminApiResult<AdminMfaStatus>> {
  return adminApiRequest<AdminMfaStatus>("/api/v1/admin/mfa/backup-codes/regenerate", {
    method: "POST",
  });
}

export async function adminLogout(): Promise<void> {
  const token = readAdminSession()?.session.token;
  if (token) {
    await adminApiRequest("/api/v1/admin/auth/logout", {
      method: "POST",
      token,
    });
  }
  clearAdminSession();
}

export function buildAdminQuery(query: AdminListQuery = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value !== "undefined" && String(value).trim()) params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

function toStoredAdminSession(session: AdminSession): StoredAdminSession {
  return {
    token: session.session.token,
    ...(session.session.expiresAt ? { expiresAt: session.session.expiresAt } : {}),
    admin: {
      id: session.admin.id,
      email: session.admin.email,
      fullName: session.admin.fullName,
      status: session.admin.status,
      roles: Array.isArray(session.admin.roles) ? session.admin.roles.filter((role) => typeof role === "string") : [],
      permissions: Array.isArray(session.admin.permissions)
        ? session.admin.permissions.filter((permission) => typeof permission === "string")
        : [],
    },
  };
}

function normalizeAdminSession(value: unknown): AdminSession | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const nestedSession = input.session && typeof input.session === "object" && !Array.isArray(input.session)
    ? input.session as Record<string, unknown>
    : null;
  const adminInput = input.admin && typeof input.admin === "object" && !Array.isArray(input.admin)
    ? input.admin as Record<string, unknown>
    : input.user && typeof input.user === "object" && !Array.isArray(input.user)
      ? input.user as Record<string, unknown>
      : {};

  const token = pickSessionString(nestedSession ?? input, "token");
  if (!token) return null;

  const expiresAt =
    pickSessionString(nestedSession ?? input, "expiresAt") ??
    pickSessionString(nestedSession ?? input, "expiry");
  const fullName =
    pickSessionString(adminInput, "fullName") ??
    pickSessionString(adminInput, "name") ??
    "";

  return {
    admin: {
      id: pickSessionString(adminInput, "id") ?? "",
      email: pickSessionString(adminInput, "email") ?? "",
      fullName,
      status: pickSessionString(adminInput, "status") ?? "active",
      roles: pickSessionStringArray(adminInput, "roles", "role"),
      permissions: pickSessionStringArray(adminInput, "permissions", "permission"),
      ...(pickSessionString(adminInput, "createdAt") ? { createdAt: pickSessionString(adminInput, "createdAt") } : {}),
    },
    session: {
      id: pickSessionString(nestedSession ?? input, "id") ?? "",
      token,
      createdAt: pickSessionString(nestedSession ?? input, "createdAt") ?? "",
      ...(expiresAt ? { expiresAt } : {}),
    },
  };
}

function pickSessionString(input: Record<string, unknown>, key: string): string | undefined {
  const value = input[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function pickSessionStringArray(input: Record<string, unknown>, arrayKey: string, scalarKey: string): string[] {
  const arrayValue = input[arrayKey];
  if (Array.isArray(arrayValue)) {
    return arrayValue.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
  }
  const scalarValue = pickSessionString(input, scalarKey);
  return scalarValue ? [scalarValue] : [];
}

function isStorageQuotaError(error: unknown): boolean {
  if (!(error instanceof DOMException)) return false;
  return error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error.code === 22 ||
    error.code === 1014;
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export function isAdminMfaChallenge(value: unknown): value is AdminLoginMfaChallenge {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const input = value as Record<string, unknown>;
  return input.mfaRequired === true &&
    typeof input.mfaChallengeId === "string" &&
    typeof input.expiresAt === "string" &&
    Array.isArray(input.availableMethods);
}

async function readJson(response: Response): Promise<Record<string, unknown> | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function readRequestId(payload: Record<string, unknown> | null): string | null {
  const meta = payload?.meta;
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const requestId = (meta as Record<string, unknown>).requestId;
  return typeof requestId === "string" ? requestId : null;
}

function readError(payload: Record<string, unknown> | null, status?: number): AdminApiError {
  if (payload?.error && typeof payload.error === "object" && !Array.isArray(payload.error)) {
    const error = payload.error as Record<string, unknown>;
    return {
      code: typeof error.code === "string" ? error.code : "ADMIN_API_ERROR",
      message: typeof error.message === "string" ? error.message : "Admin API request failed.",
      details: error.details,
      fieldErrors: Array.isArray(error.fieldErrors) ? error.fieldErrors : undefined,
    };
  }
  if (status === 401) {
    return {
      code: "ADMIN_UNAUTHORIZED",
      message: "Admin session expired or is not authorized. Sign in again.",
    };
  }
  return {
    code: "ADMIN_API_INVALID_RESPONSE",
    message: "Admin API returned an unexpected response.",
  };
}

function failure(requestId: string, status: number, error: AdminApiError): AdminApiResult<never> {
  return {
    ok: false,
    error,
    status,
    requestId,
  };
}
