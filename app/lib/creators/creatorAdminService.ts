import {
  isCreatorAdminAnalyticsEnabled,
  isCreatorAdminCopyrightEnabled,
  isCreatorAdminDashboardEnabled,
  isCreatorAdminEarningsEnabled,
  isCreatorAdminEnabled,
  isCreatorAdminEntitlementsEnabled,
  isCreatorAdminModerationEnabled,
  isCreatorAdminOnboardingEnabled,
  isCreatorAdminOrdersEnabled,
  isCreatorAdminRiskEnabled,
} from "./creatorFeatureFlags";
import {
  creatorAdminAssetModerationQueue,
  creatorAdminCopyrightCases,
  creatorAdminDashboardPreview,
  creatorAdminDisputes,
  creatorAdminFinancePreview,
  creatorAdminOnboardingQueue,
  creatorAdminOperationalRows,
  creatorAdminReviews,
  creatorAdminRiskAlerts,
} from "./creatorAdminData";
import type { CreatorAdminPermissions, CreatorAdminPreview, CreatorAdminSection } from "./creatorAdminTypes";

export const creatorAdminReadOnlyPermissions: CreatorAdminPermissions = {
  permissions: [
    "creator.view",
    "creator.onboarding.review",
    "creator.assets.review",
    "creator.copyright.review",
    "creator.orders.view",
    "creator.refunds.view",
    "creator.entitlements.view",
    "creator.downloads.view",
    "creator.earnings.view",
    "creator.payouts.view",
    "creator.reviews.moderate",
    "creator.disputes.view",
    "creator.risk.view",
    "creator.catalog.manage",
    "creator.analytics.view",
  ],
  approveAllowed: false,
  rejectAllowed: false,
  suspendAllowed: false,
  documentMutationAllowed: false,
  moderationMutationAllowed: false,
  publishMutationAllowed: false,
  storageMutationAllowed: false,
  paymentMutationAllowed: false,
  refundMutationAllowed: false,
  walletMutationAllowed: false,
  entitlementMutationAllowed: false,
  downloadMutationAllowed: false,
  payoutAllowed: false,
  notificationSendAllowed: false,
  publicMountAllowed: false,
};

const sectionTitles: Record<CreatorAdminSection, string> = {
  dashboard: "Creator Admin Dashboard",
  onboarding: "Creator Onboarding Review",
  profiles: "Creator Profiles",
  "profile-detail": "Creator Profile Detail",
  assets: "Creator Assets",
  "asset-detail": "Creator Asset Detail",
  moderation: "Asset Moderation",
  copyright: "Copyright and Licensing",
  licenses: "License Operations",
  orders: "Creator Orders",
  refunds: "Creator Refunds",
  entitlements: "Entitlement Monitoring",
  downloads: "Download Monitoring",
  earnings: "Creator Earnings",
  payouts: "Payout Readiness",
  reviews: "Creator Reviews",
  disputes: "Creator Disputes",
  risk: "Risk and Fraud",
  categories: "Catalog Categories",
  collections: "Collections",
  featured: "Featured Merchandising",
  analytics: "Creator Analytics",
  reports: "Creator Reports",
  settings: "Creator Admin Settings",
};

export function isCreatorAdminSectionEnabled(section: CreatorAdminSection) {
  if (!isCreatorAdminEnabled()) return false;

  if (section === "dashboard") return isCreatorAdminDashboardEnabled();
  if (section === "onboarding" || section === "profiles" || section === "profile-detail") return isCreatorAdminOnboardingEnabled();
  if (section === "assets" || section === "asset-detail" || section === "moderation") return isCreatorAdminModerationEnabled();
  if (section === "copyright" || section === "licenses") return isCreatorAdminCopyrightEnabled();
  if (section === "orders" || section === "refunds") return isCreatorAdminOrdersEnabled();
  if (section === "entitlements" || section === "downloads") return isCreatorAdminEntitlementsEnabled();
  if (section === "earnings" || section === "payouts") return isCreatorAdminEarningsEnabled();
  if (section === "reviews" || section === "disputes" || section === "risk") return isCreatorAdminRiskEnabled();
  if (section === "analytics" || section === "reports") return isCreatorAdminAnalyticsEnabled();

  return isCreatorAdminDashboardEnabled();
}

export function getCreatorAdminPreview(section: CreatorAdminSection): CreatorAdminPreview {
  return {
    section,
    title: sectionTitles[section],
    enabled: isCreatorAdminSectionEnabled(section),
    mode: "hidden_preview",
    persistent: false,
    permissions: creatorAdminReadOnlyPermissions,
    dashboard: creatorAdminDashboardPreview,
    onboarding: creatorAdminOnboardingQueue,
    assetModeration: creatorAdminAssetModerationQueue,
    copyrightCases: creatorAdminCopyrightCases,
    orders: creatorAdminOperationalRows.filter((row) => row.area === "Orders"),
    entitlements: creatorAdminOperationalRows.filter((row) => row.area === "Entitlements"),
    downloads: creatorAdminOperationalRows.filter((row) => row.area === "Entitlements"),
    earnings: creatorAdminFinancePreview,
    reviews: creatorAdminReviews,
    disputes: creatorAdminDisputes,
    risk: creatorAdminRiskAlerts,
    catalog: creatorAdminOperationalRows.filter((row) => row.area === "Catalog"),
    analytics: creatorAdminOperationalRows.filter((row) => row.area === "Reports"),
  };
}
