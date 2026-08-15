import type {
  CreatorAdminDashboardPreview,
  CreatorAdminFinancePreview,
  CreatorAdminOperationRow,
  CreatorAdminQueueItem,
} from "./creatorAdminTypes";

export const creatorAdminOnboardingQueue: CreatorAdminQueueItem[] = [
  {
    id: "creator_onboarding_001",
    title: "Aarav Motion Library",
    owner: "Aarav Studio",
    status: "under_review",
    priority: "high",
    detail: "Portfolio links, copyright declaration, AI policy acknowledgement, tax readiness and payout readiness are present for review.",
    riskSignal: "Tax readiness pending provider validation",
  },
  {
    id: "creator_onboarding_002",
    title: "Nomad Maps Lab",
    owner: "Nomad Maps Lab",
    status: "changes_requested",
    priority: "medium",
    detail: "Creator profile needs updated release metadata for city route packs before approval can be considered.",
  },
];

export const creatorAdminAssetModerationQueue: CreatorAdminQueueItem[] = [
  {
    id: "asset_mod_001",
    title: "Cinematic Ladakh Drone Pack",
    owner: "Aarav Studio",
    status: "manual_review",
    priority: "high",
    detail: "Preview media, source metadata, release readiness, duplicate-match readiness, quality score and malware scan status are available as preview.",
    riskSignal: "Editorial restriction review required",
  },
  {
    id: "asset_mod_002",
    title: "Monsoon Social Template Kit",
    owner: "Studio Rainline",
    status: "automated_checks",
    priority: "medium",
    detail: "Metadata completeness and license compatibility checks are queued in preview mode.",
  },
];

export const creatorAdminCopyrightCases: CreatorAdminQueueItem[] = [
  {
    id: "copyright_001",
    title: "Trademark term in template metadata",
    owner: "Studio Rainline",
    status: "under_review",
    priority: "medium",
    detail: "Trademark concern, ownership claim and license compatibility are represented for legal review readiness only.",
  },
  {
    id: "copyright_002",
    title: "Model release missing for portrait pack",
    owner: "Northlight Stock",
    status: "submitted",
    priority: "high",
    detail: "Release metadata is incomplete. No takedown, suspension or entitlement revocation mutation is enabled.",
  },
];

export const creatorAdminRiskAlerts: CreatorAdminQueueItem[] = [
  {
    id: "risk_001",
    title: "Suspicious repeated download denials",
    owner: "Buyer-safe snapshot",
    status: "pending",
    priority: "high",
    detail: "Device/IP metadata readiness is available without exposing real PII or issuing tokens.",
    riskSignal: "Repeated entitlement access denials",
  },
  {
    id: "risk_002",
    title: "Duplicate asset similarity signal",
    owner: "Aarav Studio",
    status: "preview",
    priority: "medium",
    detail: "Duplicate detection readiness is modelled. No external fraud provider call is made.",
  },
];

export const creatorAdminOperationalRows: CreatorAdminOperationRow[] = [
  {
    id: "creator_admin_orders",
    area: "Orders",
    item: "Order/payment/refund visibility",
    value: "Read-only order item, license, payment, invoice and refund state previews",
    status: "preview",
    detail: "No payment, refund or wallet mutation APIs are called.",
  },
  {
    id: "creator_admin_entitlements",
    area: "Entitlements",
    item: "Access and download monitoring",
    value: "Entitlement state, activation state, download count, token status preview",
    status: "preview",
    detail: "No entitlement mutation, token issuance, signed URL generation or file delivery is enabled.",
  },
  {
    id: "creator_admin_catalog",
    area: "Catalog",
    item: "Merchandising readiness",
    value: "Categories, tags, collections, featured assets, boosts and creator spotlights",
    status: "preview",
    detail: "All catalog operation mutation permissions remain false.",
  },
  {
    id: "creator_admin_reports",
    area: "Reports",
    item: "Operational analytics",
    value: "Moderation SLA, approval rate, refunds, disputes, payout readiness and risk reports",
    status: "preview",
    detail: "No persisted export or external analytics provider call is performed.",
  },
];

export const creatorAdminFinancePreview: CreatorAdminFinancePreview = {
  grossSales: 128400,
  refunds: 8400,
  commission: 19260,
  taxes: 14320,
  gatewayFees: 2450,
  creatorShare: 83970,
  holdAmount: 12500,
  reserve: 4200,
  eligibleAmount: 67270,
  payoutPending: 0,
  payoutBlocked: 0,
  providerPending: true,
  previewOnly: true,
};

export const creatorAdminDashboardPreview: CreatorAdminDashboardPreview = {
  metrics: [
    { id: "total_creators", label: "Total creators", value: "1,248", detail: "Preview creator population", previewOnly: true },
    { id: "pending_onboarding", label: "Pending onboarding", value: "36", detail: "Submitted or under review", previewOnly: true },
    { id: "assets_pending", label: "Assets pending review", value: "184", detail: "Automated and manual review queues", previewOnly: true },
    { id: "copyright_alerts", label: "Copyright alerts", value: "12", detail: "Declarations, releases and claims readiness", previewOnly: true },
    { id: "entitlement_anomalies", label: "Entitlement anomalies", value: "7", detail: "Access/download monitoring preview", previewOnly: true },
    { id: "payout_pending", label: "Payout pending", value: "Provider pending", detail: "No real payout is enabled", previewOnly: true },
  ],
  moderationQueue: creatorAdminAssetModerationQueue,
  riskAlerts: creatorAdminRiskAlerts,
  operationalRows: creatorAdminOperationalRows,
  finance: creatorAdminFinancePreview,
  audit: [
    {
      actor: "creator-admin-preview",
      action: "creator.asset.review.previewed",
      resourceType: "creator_asset",
      resourceId: "asset_mod_001",
      reason: "Preview-only moderation inspection",
      requestId: "creator_admin_preview_request_001",
      moderationCaseId: "creator_moderation_case_preview_001",
      timestamp: "2026-07-10T00:00:00.000Z",
      persistAllowed: false,
    },
  ],
};

export const creatorAdminReviews: CreatorAdminQueueItem[] = [
  {
    id: "review_001",
    title: "Verified purchase review moderation",
    owner: "Buyer-safe snapshot",
    status: "under_review",
    priority: "medium",
    detail: "Review text, media readiness, helpful votes, abuse report and creator response readiness are previewed.",
  },
];

export const creatorAdminDisputes: CreatorAdminQueueItem[] = [
  {
    id: "dispute_001",
    title: "License use clarification dispute",
    owner: "Buyer-safe snapshot",
    status: "pending",
    priority: "medium",
    detail: "Evidence attachment readiness, escalation, internal notes and audit history are modelled without case mutation.",
  },
];
