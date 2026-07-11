import type {
  CreatorAsset,
  CreatorAssetSearchResult,
  CreatorCatalogFilters,
  CreatorCatalogPayload,
  CreatorCatalogResult,
  CreatorCategory,
  CreatorCollection,
  CreatorProfile,
} from "./creatorCatalogTypes";
import type { CreatorLicenseDefinition } from "./creatorLicenseTypes";

const DEFAULT_TIMEOUT_MS = 8000;

function apiBaseUrl() {
  return (process.env["NEXT_PUBLIC_TPL_API_BASE_URL"] || "").replace(/\/$/, "");
}

function buildUrl(path: string, params?: Record<string, string | undefined>) {
  const base = apiBaseUrl();
  if (!base) return null;

  const url = new URL(`${base}${path}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.toString();
}

function unwrapBackendPayload<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "ok" in payload && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Creator backend catalog returned ${response.status}`);
    }

    return unwrapBackendPayload<T>(await response.json());
  } finally {
    clearTimeout(timeout);
  }
}

export async function getBackendCreatorCatalog(): Promise<CreatorCatalogResult<CreatorCatalogPayload> | null> {
  const url = buildUrl("/api/v1/creators/catalog");
  if (!url) return null;
  return fetchJson<CreatorCatalogResult<CreatorCatalogPayload>>(url);
}

export async function searchBackendCreatorAssets(filters: CreatorCatalogFilters): Promise<CreatorAssetSearchResult | null> {
  const url = buildUrl("/api/v1/creators/assets/search", {
    q: filters.query,
    category: filters.category,
    subcategory: filters.subcategory,
    license: filters.license,
    format: filters.format,
    creator: filters.creator,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minRating: filters.minRating,
    software: filters.software,
    resolution: filters.resolution,
    orientation: filters.orientation,
    duration: filters.duration,
    sort: filters.sort,
    cursor: filters.cursor,
    page: filters.page,
    pageSize: filters.pageSize,
  });
  if (!url) return null;
  return fetchJson<CreatorAssetSearchResult>(url);
}

export async function getBackendCreatorAsset(slug: string): Promise<CreatorCatalogResult<CreatorAsset | null> | null> {
  const url = buildUrl(`/api/v1/creators/assets/${encodeURIComponent(slug)}`);
  if (!url) return null;
  return fetchJson<CreatorCatalogResult<CreatorAsset | null>>(url);
}

export async function getBackendCreatorRelatedAssets(slug: string): Promise<CreatorCatalogResult<CreatorAsset[]> | null> {
  const url = buildUrl("/api/v1/creators/assets/related", { assetSlug: slug });
  if (!url) return null;
  return fetchJson<CreatorCatalogResult<CreatorAsset[]>>(url);
}

export async function getBackendCreatorFeaturedAssets(filters: CreatorCatalogFilters): Promise<CreatorAssetSearchResult | null> {
  const url = buildUrl("/api/v1/creators/assets/featured", {
    category: filters.category,
    license: filters.license,
    format: filters.format,
    sort: filters.sort,
    cursor: filters.cursor,
    page: filters.page,
    pageSize: filters.pageSize,
  });
  if (!url) return null;
  return fetchJson<CreatorAssetSearchResult>(url);
}

export async function getBackendCreatorCategories(): Promise<CreatorCatalogResult<CreatorCategory[]> | null> {
  const url = buildUrl("/api/v1/creators/categories");
  if (!url) return null;
  return fetchJson<CreatorCatalogResult<CreatorCategory[]>>(url);
}

export async function getBackendCreatorCategory(slug: string): Promise<CreatorCatalogResult<CreatorCategory | null> | null> {
  const url = buildUrl(`/api/v1/creators/categories/${encodeURIComponent(slug)}`);
  if (!url) return null;
  return fetchJson<CreatorCatalogResult<CreatorCategory | null>>(url);
}

export async function getBackendCreatorCollections(): Promise<CreatorCatalogResult<CreatorCollection[]> | null> {
  const url = buildUrl("/api/v1/creators/collections");
  if (!url) return null;
  return fetchJson<CreatorCatalogResult<CreatorCollection[]>>(url);
}

export async function getBackendCreatorCollection(slug: string): Promise<CreatorCatalogResult<CreatorCollection | null> | null> {
  const url = buildUrl(`/api/v1/creators/collections/${encodeURIComponent(slug)}`);
  if (!url) return null;
  const result = await fetchJson<{ collection: CreatorCatalogResult<CreatorCollection | null> } | CreatorCatalogResult<CreatorCollection | null>>(url);
  if ("collection" in result) return result.collection;
  return result;
}

export async function getBackendCreatorProfile(slug: string): Promise<CreatorCatalogResult<CreatorProfile | null> | null> {
  const url = buildUrl(`/api/v1/creators/authors/${encodeURIComponent(slug)}`);
  if (!url) return null;
  const result = await fetchJson<{ profile: CreatorCatalogResult<CreatorProfile | null> } | CreatorCatalogResult<CreatorProfile | null>>(url);
  if ("profile" in result) return result.profile;
  return result;
}

export async function getBackendCreatorFilterOptions(): Promise<CreatorCatalogResult<{
  categories: CreatorCategory[];
  subcategories: string[];
  formats: string[];
  software: string[];
  resolutions: string[];
}> | null> {
  const url = buildUrl("/api/v1/creators/filters");
  if (!url) return null;
  return fetchJson<CreatorCatalogResult<{
    categories: CreatorCategory[];
    subcategories: string[];
    formats: string[];
    software: string[];
    resolutions: string[];
  }>>(url);
}

export async function getBackendCreatorLicenseDefinitions(): Promise<CreatorCatalogResult<{ definitions: CreatorLicenseDefinition[] }> | null> {
  const url = buildUrl("/api/v1/creators/licenses");
  if (!url) return null;
  return fetchJson<CreatorCatalogResult<{ definitions: CreatorLicenseDefinition[] }>>(url);
}
