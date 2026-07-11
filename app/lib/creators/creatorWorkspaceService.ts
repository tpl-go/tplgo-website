import {
  creatorCollectionsPreview,
  creatorDashboardPreview,
  creatorEarningsPreview,
  creatorOrdersPreview,
  creatorReviewsPreview,
  creatorUploadsPreview,
  creatorVersionsPreview,
  creatorWorkspaceAssets,
  creatorWorkspaceProfile,
} from "./creatorWorkspaceData";
import type { CreatorWorkspaceSection } from "./creatorWorkspaceTypes";
import {
  isCreatorAnalyticsEnabled,
  isCreatorAssetManagerEnabled,
  isCreatorAssetWizardEnabled,
  isCreatorDashboardEnabled,
  isCreatorEarningsEnabled,
  isCreatorOnboardingEnabled,
  isCreatorUploadsEnabled,
  isCreatorWorkspaceEnabled,
} from "./creatorFeatureFlags";

export function isCreatorWorkspaceSectionEnabled(section: CreatorWorkspaceSection) {
  if (!isCreatorWorkspaceEnabled()) return false;
  if (section === "dashboard") return isCreatorDashboardEnabled();
  if (section === "onboarding" || section === "profile" || section === "settings" || section === "support" || section === "notifications") return isCreatorOnboardingEnabled();
  if (section === "assets" || section === "media-library" || section === "collections" || section === "versions" || section === "orders" || section === "reviews" || section === "licenses") return isCreatorAssetManagerEnabled();
  if (section === "asset-wizard") return isCreatorAssetWizardEnabled();
  if (section === "uploads") return isCreatorUploadsEnabled();
  if (section === "analytics") return isCreatorAnalyticsEnabled();
  if (section === "earnings") return isCreatorEarningsEnabled();
  return false;
}

export function getCreatorWorkspacePreview(section: CreatorWorkspaceSection) {
  return {
    section,
    profile: creatorWorkspaceProfile,
    dashboard: creatorDashboardPreview,
    assets: creatorWorkspaceAssets,
    uploads: creatorUploadsPreview,
    collections: creatorCollectionsPreview,
    versions: creatorVersionsPreview,
    orders: creatorOrdersPreview,
    earnings: creatorEarningsPreview,
    reviews: creatorReviewsPreview,
    permissions: {
      uploadAllowed: false,
      storageWriteAllowed: false,
      publishAllowed: false,
      moderationMutationAllowed: false,
      salesMutationAllowed: false,
      earningsMutationAllowed: false,
      payoutAllowed: false,
      orderPersistenceAllowed: false,
      paymentAllowed: false,
      walletMutationAllowed: false,
      entitlementMutationAllowed: false,
    },
    identity: {
      usesSharedTplIdentity: true,
      separateCreatorLogin: false,
      separateCreatorAccount: false,
      accountShellModified: false,
    },
  };
}
