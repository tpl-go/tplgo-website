import { getLicenseDefinitions } from "./creatorLicenseEngine";
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
import type { CreatorLicenseDefinition } from "./creatorLicenseTypes";

function pagination(total: number, filters: CreatorCatalogFilters = {}): CreatorCatalogPagination {
  const pageSize = Math.max(Number(filters.pageSize || 24), 1);
  const page = Math.max(Number(filters.page || 1), 1);
  const start = (page - 1) * pageSize;
  const hasPrevious = page > 1;
  const hasNext = total > start + pageSize;

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

function pageAssets(assets: CreatorAsset[], filters: CreatorCatalogFilters = {}) {
  const pageSize = Math.max(Number(filters.pageSize || 24), 1);
  const page = Math.max(Number(filters.page || 1), 1);
  const start = (page - 1) * pageSize;
  return assets.slice(start, start + pageSize);
}

function backendResult<T>(data: T): CreatorCatalogResult<T> {
  return { data, source: "backend" };
}

export function getCreatorBackendCatalog(filters: CreatorCatalogFilters = {}): CreatorCatalogResult<CreatorCatalogPayload> {
  const assets = listCreatorAssets(filters);
  return backendResult({
    assets: pageAssets(assets, filters),
    categories: listCreatorCategories(),
    collections: listCreatorCollections(),
    creators: listCreatorProfiles(),
    pagination: pagination(assets.length, filters),
  });
}

export function searchCreatorBackendAssets(filters: CreatorCatalogFilters = {}): CreatorAssetSearchResult {
  const assets = listCreatorAssets(filters);
  return backendResult({ assets: pageAssets(assets, filters), pagination: pagination(assets.length, filters) });
}

export function getCreatorBackendFeaturedAssets(filters: CreatorCatalogFilters = {}): CreatorAssetSearchResult {
  const assets = listCreatorAssets({ ...filters, sort: filters.sort || "rating" }).filter((asset) => asset.rating >= 4.7 || asset.reviewCount >= 80);
  return backendResult({ assets: pageAssets(assets, filters), pagination: pagination(assets.length, filters) });
}

export function getCreatorBackendAsset(slug: string): CreatorCatalogResult<CreatorAsset | null> {
  return backendResult(getCreatorAsset(slug) || null);
}

export function getCreatorBackendCategories(): CreatorCatalogResult<CreatorCategory[]> {
  return backendResult(listCreatorCategories());
}

export function getCreatorBackendCategory(slug: string): CreatorCatalogResult<CreatorCategory | null> {
  return backendResult(getCreatorCategory(slug) || null);
}

export function getCreatorBackendCollections(): CreatorCatalogResult<CreatorCollection[]> {
  return backendResult(listCreatorCollections());
}

export function getCreatorBackendCollection(slug: string): CreatorCatalogResult<CreatorCollection | null> {
  return backendResult(getCreatorCollection(slug) || null);
}

export function getCreatorBackendCollectionAssets(slug: string, filters: CreatorCatalogFilters = {}): CreatorAssetSearchResult {
  const assets = listAssetsForCollection(slug);
  return backendResult({ assets: pageAssets(assets, filters), pagination: pagination(assets.length, filters) });
}

export function getCreatorBackendProfile(slug: string): CreatorCatalogResult<CreatorProfile | null> {
  return backendResult(getCreatorProfile(slug) || null);
}

export function getCreatorBackendProfileAssets(slug: string, filters: CreatorCatalogFilters = {}): CreatorAssetSearchResult {
  const assets = listAssetsForCreator(slug);
  return backendResult({ assets: pageAssets(assets, filters), pagination: pagination(assets.length, filters) });
}

export function getCreatorBackendRelatedAssets(asset: CreatorAsset): CreatorCatalogResult<CreatorAsset[]> {
  return backendResult(getRelatedCreatorAssets(asset));
}

export function getCreatorBackendFilterOptions() {
  return backendResult({
    categories: listCreatorCategories(),
    subcategories: listCreatorSubcategories(),
    formats: listCreatorFormats(),
    software: listCreatorSoftware(),
    resolutions: listCreatorResolutions(),
  });
}

export function getCreatorBackendLicenseDefinitions(): CreatorCatalogResult<{ definitions: CreatorLicenseDefinition[] }> {
  return backendResult({ definitions: getLicenseDefinitions() });
}
