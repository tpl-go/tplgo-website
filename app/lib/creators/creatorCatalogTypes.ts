export type CreatorAssetCategory =
  | "photos"
  | "videos"
  | "templates"
  | "presets-luts"
  | "guides"
  | "maps-routes"
  | "audio"
  | "ai-assets"
  | "bundles";

export type CreatorLicenseType =
  | "personal"
  | "commercial"
  | "extended"
  | "extended_commercial"
  | "editorial"
  | "subscription"
  | "custom_enterprise_request";

export type CreatorAssetMediaType = "image" | "video" | "audio" | "document" | "template";

export type CreatorAssetOrientation = "landscape" | "portrait" | "square" | "mixed";

export type CreatorLicenseOption = {
  type: CreatorLicenseType;
  price: number;
  allowedUse: string[];
  prohibitedUse: string[];
  seats: string;
  projects: string;
  distribution: string;
};

export type CreatorPreviewMedia = {
  id: string;
  type: CreatorAssetMediaType;
  title: string;
  previewQuery: string;
};

export type CreatorAsset = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: CreatorAssetCategory;
  subcategory: string;
  mediaType: CreatorAssetMediaType;
  creatorSlug: string;
  creatorName: string;
  creatorRole: string;
  previewQuery: string;
  previewMedia: CreatorPreviewMedia[];
  tags: string[];
  formats: string[];
  orientation: CreatorAssetOrientation;
  resolution?: string;
  dimensions?: string;
  duration?: string;
  frameRate?: string;
  fileSize: string;
  software?: string[];
  version: string;
  rating: number;
  reviewCount: number;
  salesLabel: string;
  price: number;
  currency: "INR";
  licenses: CreatorLicenseType[];
  licenseOptions: CreatorLicenseOption[];
  includedFiles: string[];
  updatedAt: string;
  isAiAssisted?: boolean;
  isEditorial?: boolean;
  copyrightDeclaration: string;
  releaseMetadata: string;
  supportSummary: string;
  changelog: string[];
  collectionSlugs: string[];
};

export type CreatorProfile = {
  slug: string;
  name: string;
  handle: string;
  role: string;
  location: string;
  bio: string;
  avatarQuery: string;
  verified: boolean;
  rating: number;
  assetCount: number;
  followersLabel: string;
  specialties: string[];
};

export type CreatorCollection = {
  slug: string;
  title: string;
  description: string;
  coverQuery: string;
  curator: string;
  assetSlugs: string[];
};

export type CreatorCategory = {
  slug: CreatorAssetCategory;
  title: string;
  description: string;
  imageQuery: string;
};

export type CreatorCatalogFilters = {
  query?: string;
  category?: string;
  subcategory?: string;
  creator?: string;
  collection?: string;
  license?: string;
  mediaType?: string;
  format?: string;
  software?: string;
  orientation?: string;
  resolution?: string;
  duration?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  aiDisclosure?: string;
  sort?: string;
  cursor?: string;
  page?: string;
  pageSize?: string;
};

export type CreatorCatalogPagination = {
  cursor?: string | null;
  page?: number;
  pageSize?: number;
  hasNext: boolean;
  hasPrevious: boolean;
  total: number;
  nextCursor?: string | null;
  previousCursor?: string | null;
};

export type CreatorCatalogSource = "static" | "backend" | "fallback";

export type CreatorCatalogResult<T> = {
  data: T;
  source: CreatorCatalogSource;
  error?: string;
};

export type CreatorAssetSearchResult = CreatorCatalogResult<{
  assets: CreatorAsset[];
  pagination: CreatorCatalogPagination;
}>;

export type CreatorCatalogPayload = {
  assets: CreatorAsset[];
  categories: CreatorCategory[];
  collections: CreatorCollection[];
  creators: CreatorProfile[];
  pagination: CreatorCatalogPagination;
};

export type CreatorUnifiedAccountSectionKey =
  | "creator-purchases"
  | "creator-downloads"
  | "creator-licenses"
  | "creator-refunds";
