import { isEntitlementExpired } from "./creatorEntitlementPolicy";
import type { CreatorEntitlement } from "./creatorEntitlementTypes";
import type { CreatorDownloadAccessDecision } from "./creatorDownloadTypes";

function parseMajorMinor(version: string) {
  const [major = "0", minor = "0"] = version.split(".");
  return { major, minor };
}

export function resolveCreatorAssetVersionAccess({
  entitlement,
  requestedVersionId,
  latestVersionId,
}: {
  entitlement: CreatorEntitlement;
  requestedVersionId: string;
  latestVersionId: string;
}): CreatorDownloadAccessDecision {
  const purchased = entitlement.assetVersionId;
  const purchasedParts = parseMajorMinor(purchased);
  const requestedParts = parseMajorMinor(requestedVersionId);

  if (entitlement.versionAccessPolicy === "purchased_version_only") {
    return requestedVersionId === purchased
      ? { allowed: true, decision: "allowed", reason: "Purchased version is allowed." }
      : { allowed: false, decision: "denied_version_access", reason: "Only purchased version is allowed." };
  }

  if (entitlement.versionAccessPolicy === "minor_updates") {
    return purchasedParts.major === requestedParts.major
      ? { allowed: true, decision: "allowed", reason: "Minor version access is allowed." }
      : { allowed: false, decision: "denied_version_access", reason: "Requested version is outside minor update policy." };
  }

  if (entitlement.versionAccessPolicy === "all_updates_during_support") {
    return entitlement.supportExpiresAt && new Date(entitlement.supportExpiresAt).getTime() >= Date.now()
      ? { allowed: true, decision: "allowed", reason: "Support window allows update access." }
      : { allowed: false, decision: "denied_version_access", reason: "Support window expired." };
  }

  if (entitlement.versionAccessPolicy === "latest_version_during_subscription") {
    return requestedVersionId === latestVersionId && !isEntitlementExpired(entitlement)
      ? { allowed: true, decision: "allowed", reason: "Active subscription allows latest version." }
      : { allowed: false, decision: "denied_version_access", reason: "Subscription latest version access denied." };
  }

  if (entitlement.versionAccessPolicy === "perpetual_latest_at_purchase") {
    return requestedVersionId === latestVersionId || requestedVersionId === purchased
      ? { allowed: true, decision: "allowed", reason: "Purchased or latest-at-purchase version is allowed." }
      : { allowed: false, decision: "denied_version_access", reason: "Requested version is outside latest-at-purchase policy." };
  }

  return { allowed: false, decision: "denied_version_access", reason: "Custom version policy requires backend review." };
}
