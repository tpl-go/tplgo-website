import {
  getCreatorBackendAsset,
  getCreatorBackendCatalog,
  getCreatorBackendCategories,
  getCreatorBackendCategory,
  getCreatorBackendCollection,
  getCreatorBackendCollections,
  getCreatorBackendFeaturedAssets as getLocalCreatorBackendFeaturedAssets,
  getCreatorBackendFilterOptions as getLocalCreatorBackendFilterOptions,
  getCreatorBackendProfile,
  getCreatorBackendRelatedAssets as getLocalCreatorBackendRelatedAssets,
  searchCreatorBackendAssets,
} from "./creatorBackendReadService";
import {
  getBackendCreatorAsset,
  getBackendCreatorCatalog,
  getBackendCreatorCategories,
  getBackendCreatorCategory,
  getBackendCreatorCollection,
  getBackendCreatorCollections,
  getBackendCreatorFeaturedAssets,
  getBackendCreatorFilterOptions,
  getBackendCreatorProfile,
  getBackendCreatorRelatedAssets,
  searchBackendCreatorAssets,
} from "./creatorCatalogBackendClient";
import {
  getCreatorAsset,
  getCreatorCategory,
  getCreatorCollection,
  getCreatorProfile,
  getRelatedCreatorAssets,
  listAssetsForCollection,
  listAssetsForCreator,
  listCreatorAssets,
  listCreatorCategories,
  listCreatorCollections,
  listCreatorFormats,
  listCreatorProfiles,
  listCreatorResolutions,
  listCreatorSoftware,
  listCreatorSubcategories,
} from "./creatorCatalogService";
import { isCreatorBackendCatalogEnabled } from "./creatorFeatureFlags";
import type {
  CreatorAsset,
  CreatorAssetSearchResult,
  CreatorCatalogFilters,
  CreatorCatalogPagination,
  CreatorCatalogPayload,
  CreatorCatalogResult,
  CreatorCategory,
  CreatorCollection,
  CreatorProfile,
} from "./creatorCatalogTypes";

function isLocalBackendReadMode() {
  const base = (process.env["NEXT_PUBLIC_TPL_API_BASE_URL"] || "").toLowerCase();
  return !base || base === "http://127.0.0.1:3000" || base === "http://localhost:3000";
}

function pagination(total: number, filters: CreatorCatalogFilters = {}): CreatorCatalogPagination {
  const pageSize = Math.max(Number(filters.pageSize || 24), 1);
  const page = Math.max(Number(filters.page || 1), 1);
  const hasPrevious = page > 1;
  const hasNext = total > page * pageSize;

  return {
    cursor: filters.cursor || null,
    page,
    pageSize,
    hasNext,
    hasPrevious,
    total,
    nextCursor: hasNext ? `page:${page + 1}` : null,
    previousCursor: hasPrevious ? `page:${page - 1}` : null,
  };
}

function fallbackResult<T>(data: T, error?: unknown): CreatorCatalogResult<T> {
  return {
    data,
    source: isCreatorBackendCatalogEnabled() ? "fallback" : "static",
    error: error instanceof Error ? error.message : undefined,
  };
}

async function backendOrFallback<T>(backend: () => Promise<CreatorCatalogResult<T> | null>, fallback: () => T): Promise<CreatorCatalogResult<T>> {
  if (!isCreatorBackendCatalogEnabled()) return fallbackResult(fallback());

  try {
    const result = await backend();
    if (result) return { ...result, source: "backend" };
    return fallbackResult(fallback(), new Error("Creator backend catalog base URL is not configured"));
  } catch (error) {
    return fallbackResult(fallback(), error);
  }
}

export async function getCatalog(): Promise<CreatorCatalogResult<CreatorCatalogPayload>> {
  if (isCreatorBackendCatalogEnabled() && isLocalBackendReadMode()) return getCreatorBackendCatalog();
  return backendOrFallback(getBackendCreatorCatalog, () => ({
    assets: listCreatorAssets(),
    categories: listCreatorCategories(),
    collections: listCreatorCollections(),
    creators: listCreatorProfiles(),
    pagination: pagination(listCreatorAssets().length),
  }));
}

export async function searchAssets(filters: CreatorCatalogFilters = {}): Promise<CreatorAssetSearchResult> {
  if (isCreatorBackendCatalogEnabled() && isLocalBackendReadMode()) return searchCreatorBackendAssets(filters);
  if (isCreatorBackendCatalogEnabled()) {
    try {
      const result = await searchBackendCreatorAssets(filters);
      if (result) return { ...result, source: "backend" };
    } catch (error) {
      const assets = listCreatorAssets(filters);
      return { data: { assets, pagination: pagination(assets.length, filters) }, source: "fallback", error: error instanceof Error ? error.message : undefined };
    }
  }

  const assets = listCreatorAssets(filters);
  return { data: { assets, pagination: pagination(assets.length, filters) }, source: isCreatorBackendCatalogEnabled() ? "fallback" : "static" };
}

export async function getAsset(slug: string): Promise<CreatorCatalogResult<CreatorAsset | null>> {
  if (isCreatorBackendCatalogEnabled() && isLocalBackendReadMode()) return getCreatorBackendAsset(slug);
  return backendOrFallback(() => getBackendCreatorAsset(slug), () => getCreatorAsset(slug) || null);
}

export async function getCategories(): Promise<CreatorCatalogResult<CreatorCategory[]>> {
  if (isCreatorBackendCatalogEnabled() && isLocalBackendReadMode()) return getCreatorBackendCategories();
  return backendOrFallback(getBackendCreatorCategories, listCreatorCategories);
}

export async function getCategory(slug: string): Promise<CreatorCatalogResult<CreatorCategory | null>> {
  if (isCreatorBackendCatalogEnabled() && isLocalBackendReadMode()) return getCreatorBackendCategory(slug);
  return backendOrFallback(() => getBackendCreatorCategory(slug), () => getCreatorCategory(slug) || null);
}

export async function getCollections(): Promise<CreatorCatalogResult<CreatorCollection[]>> {
  if (isCreatorBackendCatalogEnabled() && isLocalBackendReadMode()) return getCreatorBackendCollections();
  return backendOrFallback(getBackendCreatorCollections, listCreatorCollections);
}

export async function getCollection(slug: string): Promise<CreatorCatalogResult<CreatorCollection | null>> {
  if (isCreatorBackendCatalogEnabled() && isLocalBackendReadMode()) return getCreatorBackendCollection(slug);
  return backendOrFallback(() => getBackendCreatorCollection(slug), () => getCreatorCollection(slug) || null);
}

export async function getCreator(slug: string): Promise<CreatorCatalogResult<CreatorProfile | null>> {
  if (isCreatorBackendCatalogEnabled() && isLocalBackendReadMode()) return getCreatorBackendProfile(slug);
  return backendOrFallback(() => getBackendCreatorProfile(slug), () => getCreatorProfile(slug) || null);
}

export async function getAssetsForCollection(collectionSlug: string): Promise<CreatorAssetSearchResult> {
  const result = await searchAssets({ collection: collectionSlug });
  if (result.data.assets.length) return result;
  const assets = listAssetsForCollection(collectionSlug);
  return { data: { assets, pagination: pagination(assets.length) }, source: result.source, error: result.error };
}

export async function getFeaturedAssets(filters: CreatorCatalogFilters = {}): Promise<CreatorAssetSearchResult> {
  if (isCreatorBackendCatalogEnabled() && isLocalBackendReadMode()) return getLocalCreatorBackendFeaturedAssets(filters);
  if (isCreatorBackendCatalogEnabled()) {
    try {
      const result = await getBackendCreatorFeaturedAssets(filters);
      if (result) return { ...result, source: "backend" };
    } catch (error) {
      const assets = listCreatorAssets({ ...filters, sort: filters.sort || "rating" }).filter((asset) => asset.rating >= 4.7 || asset.reviewCount >= 80);
      return { data: { assets, pagination: pagination(assets.length, filters) }, source: "fallback", error: error instanceof Error ? error.message : undefined };
    }
  }

  const assets = listCreatorAssets({ ...filters, sort: filters.sort || "rating" }).filter((asset) => asset.rating >= 4.7 || asset.reviewCount >= 80);
  return { data: { assets, pagination: pagination(assets.length, filters) }, source: isCreatorBackendCatalogEnabled() ? "fallback" : "static" };
}

export async function getAssetsForCreator(creatorSlug: string): Promise<CreatorAssetSearchResult> {
  const result = await searchAssets({ creator: creatorSlug });
  if (result.data.assets.length) return result;
  const assets = listAssetsForCreator(creatorSlug);
  return { data: { assets, pagination: pagination(assets.length) }, source: result.source, error: result.error };
}

export async function getRelatedAssets(asset: CreatorAsset): Promise<CreatorCatalogResult<CreatorAsset[]>> {
  if (isCreatorBackendCatalogEnabled() && isLocalBackendReadMode()) return getLocalCreatorBackendRelatedAssets(asset);
  return backendOrFallback(() => getBackendCreatorRelatedAssets(asset.slug), () => getRelatedCreatorAssets(asset));
}

export async function getFilterOptions() {
  if (isCreatorBackendCatalogEnabled() && isLocalBackendReadMode()) return getLocalCreatorBackendFilterOptions();
  if (isCreatorBackendCatalogEnabled()) {
    try {
      const result = await getBackendCreatorFilterOptions();
      if (result) return { ...result, source: "backend" };
    } catch (error) {
      return {
        data: {
          categories: listCreatorCategories(),
          subcategories: listCreatorSubcategories(),
          formats: listCreatorFormats(),
          software: listCreatorSoftware(),
          resolutions: listCreatorResolutions(),
        },
        source: "fallback" as const,
        error: error instanceof Error ? error.message : undefined,
      };
    }
  }

  return {
    data: {
      categories: listCreatorCategories(),
      subcategories: listCreatorSubcategories(),
      formats: listCreatorFormats(),
      software: listCreatorSoftware(),
      resolutions: listCreatorResolutions(),
    },
    source: isCreatorBackendCatalogEnabled() ? "fallback" : "static" as const,
  };
}
