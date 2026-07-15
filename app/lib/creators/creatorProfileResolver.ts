import { creatorAuthorProfiles } from "./creatorAuthorPageData";
import type { CreatorAuthorProfile } from "./creatorAuthorPageTypes";
import { getCatalog, getCreator } from "./creatorCatalogRepository";
import type { CreatorProfile } from "./creatorCatalogTypes";
import type { CreatorDataSource } from "./creatorDataSource";
import { isCreatorBackendCatalogEnabled } from "./creatorFeatureFlags";
import { canonicalCreatorSlug, normalizeCreatorSlug } from "./creatorSlugResolver";

export { canonicalCreatorSlug, creatorProfileAliases, normalizeCreatorSlug } from "./creatorSlugResolver";

export const CREATOR_PROFILE_DTO_VERSION = "creator-profile.v1" as const;
export type CanonicalCreatorProfile = CreatorAuthorProfile & {
  dtoVersion: typeof CREATOR_PROFILE_DTO_VERSION;
  source: CreatorDataSource;
  requestId?: string;
};
export type CreatorProfileResolution =
  | { kind: "found"; profile: CanonicalCreatorProfile; canonicalSlug: string; requestedSlug: string; redirectRequired: boolean }
  | { kind: "not_found"; requestedSlug: string }
  | { kind: "unavailable"; requestedSlug: string; requestId?: string; reason: string };

function local(slug: string) {
  return creatorAuthorProfiles.find((item) => item.slug === slug);
}

function sourceFor(value: "static" | "backend" | "fallback"): CreatorDataSource {
  return value === "backend" ? "testing_api" : value === "fallback" ? "fallback_fixture" : "fixture";
}

function mapCatalog(profile: CreatorProfile, source: CreatorDataSource): CanonicalCreatorProfile {
  const slug = canonicalCreatorSlug(profile.slug);
  const base = local(slug);
  if (base) return { ...base, dtoVersion: CREATOR_PROFILE_DTO_VERSION, source };
  return {
    id: `catalog-${slug}`, slug, displayName: profile.name, username: profile.handle,
    avatar: "/themes/banners/culture-1.jpg", coverImage: "/experiences/adventure.jpg",
    verified: profile.verified, creatorLevel: "Rising Creator", specialization: profile.role,
    secondarySpecializations: profile.specialties, location: profile.location,
    country: profile.location.split(",").at(-1)?.trim() || "", bio: profile.bio, shortBio: profile.bio,
    followers: 0, assetCount: profile.assetCount, downloadCount: 0, rating: profile.rating, reviewCount: 0,
    joinedAt: "Not provided", languages: [], equipment: [], software: [], tags: profile.specialties,
    assetCategories: profile.specialties, featuredAssetSlugs: [], collectionSlugs: [],
    locationsCovered: [profile.location], contentStyle: "Testing API profile", commercialAvailable: false,
    editorialAvailable: false, modelReleaseReady: false, propertyReleaseReady: false,
    dtoVersion: CREATOR_PROFILE_DTO_VERSION, source,
  };
}

export async function resolveCreatorProfile(input: string): Promise<CreatorProfileResolution> {
  const requestedSlug = normalizeCreatorSlug(input);
  const canonicalSlug = canonicalCreatorSlug(input);
  try {
    if (isCreatorBackendCatalogEnabled()) {
      const result = await getCreator(canonicalSlug);
      if (result.data) {
        const profile = mapCatalog(result.data, sourceFor(result.source));
        return { kind: "found", profile, canonicalSlug: profile.slug, requestedSlug, redirectRequired: requestedSlug !== profile.slug };
      }
      // In API mode a successful empty response is authoritative. A transport failure
      // is represented by repository fallback/throw and must never be called not-found.
      if (result.error) return { kind: "unavailable", requestedSlug, reason: "Creator testing profile could not be loaded." };
      return { kind: "not_found", requestedSlug };
    }
    const fixture = local(canonicalSlug);
    if (!fixture) return { kind: "not_found", requestedSlug };
    return { kind: "found", profile: { ...fixture, dtoVersion: CREATOR_PROFILE_DTO_VERSION, source: "fixture" }, canonicalSlug, requestedSlug, redirectRequired: requestedSlug !== canonicalSlug };
  } catch (error) {
    return { kind: "unavailable", requestedSlug, reason: error instanceof Error ? error.message : "Creator testing profile is unavailable." };
  }
}

export async function listCanonicalCreatorProfiles(): Promise<{ profiles: CanonicalCreatorProfile[]; source: CreatorDataSource; error?: string }> {
  try {
    if (isCreatorBackendCatalogEnabled()) {
      const result = await getCatalog();
      const source = sourceFor(result.source);
      if (result.error && result.data.creators.length === 0) return { profiles: [], source: "unavailable", error: result.error };
      return { profiles: result.data.creators.map((item) => mapCatalog(item, source)), source, error: result.error };
    }
    return { profiles: creatorAuthorProfiles.map((item) => ({ ...item, dtoVersion: CREATOR_PROFILE_DTO_VERSION, source: "fixture" })), source: "fixture" };
  } catch (error) {
    return { profiles: [], source: "unavailable", error: error instanceof Error ? error.message : "Creator directory unavailable" };
  }
}
