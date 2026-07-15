export type MarketplaceAssetType = "photo" | "video" | "drone" | "template" | "preset" | "graphic" | "guide";

export type MarketplaceLicenseType = "personal" | "commercial" | "extended" | "editorial";

export type MarketplaceHomeAsset = {
  id: string;
  slug: string;
  title: string;
  description: string;
  assetType: MarketplaceAssetType;
  category: string;
  previewImage: string;
  previewVideo?: string;
  creator: string;
  creatorSlug: string;
  creatorAvatar: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  downloads: number;
  resolution: string;
  duration?: string;
  fileFormat: string;
  licenseTypes: MarketplaceLicenseType[];
  featured: boolean;
  trending: boolean;
  newRelease: boolean;
  tags: string[];
  collectionSlugs: string[];
};

export type MarketplaceHomeCategory = {
  title: string;
  assetType: MarketplaceAssetType;
  queryCategory: string;
  count: number;
  image: string;
};

export type MarketplaceHomeCollection = {
  slug: string;
  title: string;
  description: string;
  assetCount: number;
  images: string[];
};

export type MarketplaceHomeCreator = {
  slug: string;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  assetCount: number;
  salesLabel: string;
  avatar: string;
  portfolio: string[];
};

export type MarketplaceDiscoveryFilter =
  | "popular"
  | "new"
  | "rated"
  | "under-499"
  | "commercial"
  | "extended"
  | "4k"
  | "drone"
  | "mobile-presets";
