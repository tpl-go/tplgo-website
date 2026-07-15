export type CreatorLevel = "Rising Creator" | "Professional" | "Elite" | "Enterprise Studio";
export type CreatorAuthorProfile = {
  id: string; slug: string; displayName: string; username: string; avatar: string; coverImage: string;
  verified: boolean; creatorLevel: CreatorLevel; specialization: string; secondarySpecializations: string[];
  location: string; country: string; bio: string; shortBio: string; followers: number; assetCount: number;
  downloadCount: number; rating: number; reviewCount: number; joinedAt: string; languages: string[];
  equipment: string[]; software: string[]; tags: string[]; assetCategories: string[]; featuredAssetSlugs: string[];
  collectionSlugs: string[]; locationsCovered: string[]; contentStyle: string; commercialAvailable: boolean;
  editorialAvailable: boolean; modelReleaseReady: boolean; propertyReleaseReady: boolean;
};
export type CreatorDirectoryStat = { label: string; value: string };
