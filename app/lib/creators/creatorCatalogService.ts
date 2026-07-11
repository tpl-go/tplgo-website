import { creatorAssets, creatorCategories, creatorCollections, creatorProfiles } from "./creatorCatalogData";
import type { CreatorAsset, CreatorCatalogFilters } from "./creatorCatalogTypes";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function assetSearchText(asset: CreatorAsset) {
  return [
    asset.title,
    asset.subtitle,
    asset.description,
    asset.category,
    asset.mediaType,
    asset.creatorName,
    asset.creatorRole,
    ...asset.tags,
    ...asset.formats,
  ]
    .join(" ")
    .toLowerCase();
}

export function listCreatorCategories() {
  return creatorCategories;
}

export function listCreatorProfiles() {
  return creatorProfiles;
}

export function listCreatorCollections() {
  return creatorCollections;
}

export function getCreatorCategory(slug: string) {
  return creatorCategories.find((category) => category.slug === slug);
}

export function getCreatorAsset(slug: string) {
  return creatorAssets.find((asset) => asset.slug === slug);
}

export function getCreatorProfile(slug: string) {
  return creatorProfiles.find((profile) => profile.slug === slug);
}

export function getCreatorCollection(slug: string) {
  return creatorCollections.find((collection) => collection.slug === slug);
}

export function listCreatorAssets(filters: CreatorCatalogFilters = {}) {
  const query = normalize(filters.query || "");
  const category = normalize(filters.category || "");
  const subcategory = normalize(filters.subcategory || "");
  const creator = normalize(filters.creator || "");
  const collection = normalize(filters.collection || "");
  const license = normalize(filters.license || "");
  const mediaType = normalize(filters.mediaType || "");
  const format = normalize(filters.format || "");
  const software = normalize(filters.software || "");
  const orientation = normalize(filters.orientation || "");
  const resolution = normalize(filters.resolution || "");
  const duration = normalize(filters.duration || "");
  const minPrice = Number(filters.minPrice || 0);
  const maxPrice = Number(filters.maxPrice || 0);
  const minRating = Number(filters.minRating || 0);
  const aiDisclosure = normalize(filters.aiDisclosure || "");

  const assets = creatorAssets.filter((asset) => {
    if (query && !assetSearchText(asset).includes(query)) return false;
    if (category && asset.category !== category) return false;
    if (subcategory && normalize(asset.subcategory) !== subcategory) return false;
    if (creator && asset.creatorSlug !== creator) return false;
    if (collection && !asset.collectionSlugs.includes(collection)) return false;
    if (license && !asset.licenses.includes(license as never)) return false;
    if (mediaType && asset.mediaType !== mediaType) return false;
    if (format && !asset.formats.some((item) => normalize(item) === format)) return false;
    if (software && !(asset.software || []).some((item) => normalize(item) === software)) return false;
    if (orientation && asset.orientation !== orientation) return false;
    if (resolution && normalize(asset.resolution || "") !== resolution) return false;
    if (duration && normalize(asset.duration || "").includes(duration) === false) return false;
    if (minPrice && asset.price < minPrice) return false;
    if (maxPrice && asset.price > maxPrice) return false;
    if (minRating && asset.rating < minRating) return false;
    if (aiDisclosure === "ai" && !asset.isAiAssisted) return false;
    if (aiDisclosure === "non-ai" && asset.isAiAssisted) return false;
    return true;
  });

  if (filters.sort === "price-low") return [...assets].sort((a, b) => a.price - b.price);
  if (filters.sort === "price-high") return [...assets].sort((a, b) => b.price - a.price);
  if (filters.sort === "rating") return [...assets].sort((a, b) => b.rating - a.rating);
  if (filters.sort === "newest") return [...assets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return [...assets].sort((a, b) => b.reviewCount - a.reviewCount);
}

export function listCreatorSubcategories() {
  return Array.from(new Set(creatorAssets.map((asset) => asset.subcategory))).sort();
}

export function listCreatorFormats() {
  return Array.from(new Set(creatorAssets.flatMap((asset) => asset.formats))).sort();
}

export function listCreatorSoftware() {
  return Array.from(new Set(creatorAssets.flatMap((asset) => asset.software || []))).sort();
}

export function listCreatorResolutions() {
  return Array.from(new Set(creatorAssets.map((asset) => asset.resolution).filter((value): value is string => Boolean(value)))).sort();
}

export function listAssetsForCollection(collectionSlug: string) {
  const collection = getCreatorCollection(collectionSlug);
  if (!collection) return [];
  return collection.assetSlugs
    .map((slug) => getCreatorAsset(slug))
    .filter((asset): asset is CreatorAsset => Boolean(asset));
}

export function listAssetsForCreator(creatorSlug: string) {
  return listCreatorAssets({ creator: creatorSlug });
}

export function getRelatedCreatorAssets(asset: CreatorAsset) {
  return creatorAssets
    .filter((candidate) => candidate.slug !== asset.slug)
    .filter((candidate) => candidate.category === asset.category || candidate.creatorSlug === asset.creatorSlug)
    .slice(0, 3);
}
