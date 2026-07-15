import type {
  MarketplaceDiscoveryFilter,
  MarketplaceHomeAsset,
  MarketplaceHomeCategory,
  MarketplaceHomeCollection,
  MarketplaceHomeCreator,
} from "./creatorMarketplaceHomeTypes";

const localPreviewImages = [
  "/themes/banners/culture-1.jpg", "/themes/banners/culture-2.jpg", "/themes/banners/culture-3.jpg",
  "/experiences/adventure.jpg", "/experiences/luxury.jpg", "/experiences/roadtrip.jpg",
  "/experiences/spiritual.jpg", "/experiences/weekend.jpg", "/experiences/wildlife.jpg",
  "/continents/banners/asia-1.jpg", "/continents/banners/asia-2.jpg", "/continents/banners/asia-3.jpg",
  "/holidays/manali.jpeg", "/holidays/goa.jpeg", "/demo/kerala-cover.jpg",
];

const image = (id: string) => {
  const index = [...id].reduce((total, character) => total + character.charCodeAt(0), 0) % localPreviewImages.length;
  return localPreviewImages[index]!;
};

const avatars = {
  aira: image("photo-1494790108377-be9c29b29330"),
  noor: image("photo-1534528741775-53994a69daeb"),
  routecraft: image("photo-1500648767791-00dcc994a43e"),
  northlight: image("photo-1507003211169-0a1dd7228f2d"),
};

export const marketplaceHomeAssets: MarketplaceHomeAsset[] = [
  { id: "asset-001", slug: "cinematic-ladakh-drone-pack", title: "Cinematic Ladakh Drone Pack", description: "High-altitude roads, blue lakes and mountain passes in polished 4K.", assetType: "video", category: "Stock Videos", previewImage: image("photo-1500530855697-b586d89ba3ee"), creator: "Aira Studio", creatorSlug: "aira-studio", creatorAvatar: avatars.aira, price: 2499, originalPrice: 3199, rating: 4.9, reviewCount: 128, downloads: 2140, resolution: "4K", duration: "03:42", fileFormat: "MOV, MP4", licenseTypes: ["personal", "commercial", "extended"], featured: true, trending: true, newRelease: false, tags: ["ladakh", "mountains", "aerial", "4k"], collectionSlugs: ["cinematic-india", "himalayan-aerials"] },
  { id: "asset-002", slug: "jaipur-editorial-photo-set", title: "Jaipur Editorial Photo Set", description: "Royal architecture, market color and refined street textures.", assetType: "photo", category: "Travel Photos", previewImage: image("photo-1477587458883-47145ed94245"), creator: "Noor Visuals", creatorSlug: "noor-visuals", creatorAvatar: avatars.noor, price: 1499, rating: 4.7, reviewCount: 94, downloads: 1680, resolution: "36 MP", fileFormat: "JPG, RAW", licenseTypes: ["editorial", "commercial"], featured: true, trending: true, newRelease: false, tags: ["jaipur", "architecture", "editorial"], collectionSlugs: ["rajasthan-heritage", "urban-india"] },
  { id: "asset-003", slug: "creator-reel-template-kit", title: "Creator Reel Template Kit", description: "Fast, elegant vertical edits for destinations and hospitality.", assetType: "template", category: "Video Templates", previewImage: image("photo-1492724441997-5dc865305da7"), creator: "Aira Studio", creatorSlug: "aira-studio", creatorAvatar: avatars.aira, price: 1999, rating: 4.8, reviewCount: 211, downloads: 3820, resolution: "1080×1920", duration: "00:30", fileFormat: "AE, PRPRO", licenseTypes: ["personal", "commercial", "extended"], featured: true, trending: true, newRelease: false, tags: ["reels", "vertical", "social", "motion"], collectionSlugs: ["creator-launch-kits", "social-travel-templates"] },
  { id: "asset-004", slug: "monsoon-route-map-pack", title: "Monsoon Route Map Pack", description: "Editable route sheets and day plans for rain-season journeys.", assetType: "guide", category: "Destination Guides", previewImage: image("photo-1526778548025-fa2f459cd5c1"), creator: "RouteCraft Labs", creatorSlug: "routecraft-labs", creatorAvatar: avatars.routecraft, price: 599, rating: 4.6, reviewCount: 67, downloads: 920, resolution: "Print + digital", fileFormat: "PDF, SVG", licenseTypes: ["personal", "commercial"], featured: false, trending: false, newRelease: true, tags: ["monsoon", "map", "route", "guide"], collectionSlugs: ["route-packs", "adventure-pack"] },
  { id: "asset-005", slug: "cinematic-travel-lut-pack", title: "Cinematic Travel LUT Pack", description: "Twelve balanced grades for mountain, desert, beach and city footage.", assetType: "preset", category: "Lightroom Presets", previewImage: image("photo-1464822759023-fed622ff2c3b"), creator: "Aira Studio", creatorSlug: "aira-studio", creatorAvatar: avatars.aira, price: 799, originalPrice: 1099, rating: 4.9, reviewCount: 174, downloads: 4470, resolution: "32-bit", fileFormat: "CUBE, XMP", licenseTypes: ["personal", "commercial", "extended"], featured: true, trending: true, newRelease: false, tags: ["lut", "color", "cinematic", "preset"], collectionSlugs: ["creator-launch-kits", "luxury-travel-reels"] },
  { id: "asset-006", slug: "old-city-food-guide", title: "Old City Food Guide", description: "A designed walking guide with timing, etiquette and route notes.", assetType: "guide", category: "Destination Guides", previewImage: image("photo-1504674900247-0877df9cc836"), creator: "RouteCraft Labs", creatorSlug: "routecraft-labs", creatorAvatar: avatars.routecraft, price: 349, rating: 4.7, reviewCount: 83, downloads: 1320, resolution: "A4 + mobile", fileFormat: "PDF", licenseTypes: ["personal", "commercial"], featured: false, trending: true, newRelease: false, tags: ["food", "city", "guide", "walking"], collectionSlugs: ["editorial-city-stories", "route-packs"] },
  { id: "asset-007", slug: "himalayan-sunrise-aerials", title: "Himalayan Sunrise Aerials", description: "Golden-hour 4K sequences across dramatic ridgelines.", assetType: "drone", category: "Drone Footage", previewImage: image("photo-1464278533981-50106e6176b1"), creator: "Northlight Motion", creatorSlug: "northlight-motion", creatorAvatar: avatars.northlight, price: 2899, originalPrice: 3499, rating: 4.9, reviewCount: 196, downloads: 3410, resolution: "4K", duration: "04:18", fileFormat: "MOV", licenseTypes: ["personal", "commercial", "extended"], featured: true, trending: true, newRelease: true, tags: ["himalaya", "sunrise", "drone", "4k"], collectionSlugs: ["himalayan-aerials", "adventure-pack"] },
  { id: "asset-008", slug: "rajasthan-heritage-portraits", title: "Rajasthan Heritage Portraits", description: "Editorial portraits, textiles and architectural details.", assetType: "photo", category: "Travel Photos", previewImage: image("photo-1524492412937-b28074a5d7da"), creator: "Noor Visuals", creatorSlug: "noor-visuals", creatorAvatar: avatars.noor, price: 1799, rating: 4.8, reviewCount: 143, downloads: 1840, resolution: "45 MP", fileFormat: "JPG, RAW", licenseTypes: ["editorial", "commercial"], featured: true, trending: false, newRelease: true, tags: ["rajasthan", "portrait", "heritage"], collectionSlugs: ["rajasthan-heritage", "incredible-india"] },
  { id: "asset-009", slug: "luxury-resort-reel-templates", title: "Luxury Resort Reel Templates", description: "Elegant vertical motion templates for premium hospitality.", assetType: "template", category: "Social Media Templates", previewImage: image("photo-1542314831-068cd1dbfeeb"), creator: "Aira Studio", creatorSlug: "aira-studio", creatorAvatar: avatars.aira, price: 2299, rating: 4.9, reviewCount: 267, downloads: 4610, resolution: "4K + vertical", duration: "00:45", fileFormat: "AE, PRPRO", licenseTypes: ["commercial", "extended"], featured: true, trending: true, newRelease: true, tags: ["luxury", "resort", "reels", "social"], collectionSlugs: ["luxury-travel-reels", "social-travel-templates"] },
  { id: "asset-010", slug: "tropical-island-route-pack", title: "Tropical Island Route Pack", description: "Editable island maps, day plans and visual route sheets.", assetType: "graphic", category: "Graphics & Illustrations", previewImage: image("photo-1507525428034-b723cf961d3e"), creator: "RouteCraft Labs", creatorSlug: "routecraft-labs", creatorAvatar: avatars.routecraft, price: 699, rating: 4.7, reviewCount: 88, downloads: 940, resolution: "Vector", fileFormat: "SVG, PDF", licenseTypes: ["personal", "commercial"], featured: false, trending: false, newRelease: true, tags: ["tropical", "island", "map", "vector"], collectionSlugs: ["tropical-destinations", "adventure-pack"] },
  { id: "asset-011", slug: "urban-night-mobile-presets", title: "Urban Night Mobile Presets", description: "Moody one-tap grades for neon, streets and low light.", assetType: "preset", category: "Lightroom Presets", previewImage: image("photo-1519608487953-e999c86e7455"), creator: "Noor Visuals", creatorSlug: "noor-visuals", creatorAvatar: avatars.noor, price: 399, originalPrice: 599, rating: 4.8, reviewCount: 319, downloads: 5120, resolution: "Mobile + desktop", fileFormat: "DNG, XMP", licenseTypes: ["personal", "commercial"], featured: true, trending: true, newRelease: true, tags: ["urban", "night", "mobile", "presets"], collectionSlugs: ["urban-india", "social-travel-templates"] },
  { id: "asset-012", slug: "india-adventure-content-kit", title: "India Adventure Content Kit", description: "Graphic overlays, story prompts and production checklists.", assetType: "graphic", category: "Graphics & Illustrations", previewImage: image("photo-1551632811-561732d1e306"), creator: "Northlight Motion", creatorSlug: "northlight-motion", creatorAvatar: avatars.northlight, price: 899, rating: 4.7, reviewCount: 74, downloads: 780, resolution: "Vector + 4K", fileFormat: "AI, SVG, PDF", licenseTypes: ["personal", "commercial", "extended"], featured: false, trending: false, newRelease: true, tags: ["adventure", "graphics", "content", "india"], collectionSlugs: ["adventure-pack", "incredible-india"] },
  { id: "asset-013", slug: "wildlife-of-central-india", title: "Wildlife of Central India", description: "High-resolution tiger, deer and forest photography for editorial stories.", assetType: "photo", category: "Travel Photos", previewImage: image("wildlife-central-india"), creator: "Noor Visuals", creatorSlug: "noor-visuals", creatorAvatar: avatars.noor, price: 399, rating: 4.9, reviewCount: 186, downloads: 3970, resolution: "45 MP", fileFormat: "JPG, RAW", licenseTypes: ["editorial", "commercial"], featured: true, trending: true, newRelease: true, tags: ["wildlife", "tiger", "nature", "india"], collectionSlugs: ["incredible-india", "adventure-pack"] },
];

export const marketplaceHomeCategories: MarketplaceHomeCategory[] = [
  { title: "Photos", assetType: "photo", queryCategory: "photos", count: 12840, image: image("photo-1469854523086-cc02fe5d8800") },
  { title: "Videos", assetType: "video", queryCategory: "videos", count: 6420, image: image("photo-1530789253388-582c481c54b0") },
  { title: "Reels", assetType: "template", queryCategory: "templates", count: 7920, image: image("photo-1611162617474-5b21e879e113") },
  { title: "Drone Footage", assetType: "drone", queryCategory: "videos", count: 3180, image: image("photo-1500534314209-a25ddb2bd429") },
  { title: "Templates", assetType: "template", queryCategory: "templates", count: 4860, image: image("photo-1485846234645-a62644f84728") },
  { title: "Presets", assetType: "preset", queryCategory: "presets-luts", count: 2240, image: image("photo-1493246507139-91e8fad9978e") },
  { title: "Graphics", assetType: "graphic", queryCategory: "ai-assets", count: 5360, image: image("photo-1549490349-8643362247b5") },
  { title: "Destination Guides", assetType: "guide", queryCategory: "guides", count: 1640, image: image("photo-1488646953014-85cb44e25828") },
];

const bySlug = (slug: string) => marketplaceHomeAssets.find((asset) => asset.slug === slug)!.previewImage;

export const marketplaceHomeCollections: MarketplaceHomeCollection[] = [
  { slug: "incredible-india", title: "Incredible India", description: "Landscapes, culture and modern city stories.", assetCount: 184, images: [bySlug("rajasthan-heritage-portraits"), bySlug("cinematic-ladakh-drone-pack"), bySlug("india-adventure-content-kit")] },
  { slug: "himalayan-aerials", title: "Himalayan Aerials", description: "High-altitude footage for cinematic stories.", assetCount: 72, images: [bySlug("himalayan-sunrise-aerials"), bySlug("cinematic-ladakh-drone-pack"), bySlug("cinematic-travel-lut-pack")] },
  { slug: "luxury-travel-reels", title: "Luxury Travel Reels", description: "Polished motion assets for hospitality.", assetCount: 96, images: [bySlug("luxury-resort-reel-templates"), bySlug("creator-reel-template-kit"), bySlug("cinematic-travel-lut-pack")] },
  { slug: "rajasthan-heritage", title: "Rajasthan Heritage", description: "Architecture, portraits and cultural detail.", assetCount: 143, images: [bySlug("jaipur-editorial-photo-set"), bySlug("rajasthan-heritage-portraits"), bySlug("old-city-food-guide")] },
  { slug: "tropical-destinations", title: "Tropical Destinations", description: "Island visuals and sunlit campaign assets.", assetCount: 118, images: [bySlug("tropical-island-route-pack"), bySlug("luxury-resort-reel-templates"), bySlug("creator-reel-template-kit")] },
  { slug: "urban-india", title: "Urban India", description: "Contemporary streets, cities and night grades.", assetCount: 152, images: [bySlug("urban-night-mobile-presets"), bySlug("jaipur-editorial-photo-set"), bySlug("creator-reel-template-kit")] },
  { slug: "adventure-pack", title: "Adventure Pack", description: "Aerials, routes and field-ready resources.", assetCount: 88, images: [bySlug("himalayan-sunrise-aerials"), bySlug("india-adventure-content-kit"), bySlug("tropical-island-route-pack")] },
  { slug: "social-travel-templates", title: "Social Travel Templates", description: "Reels, presets and graphics for fast publishing.", assetCount: 214, images: [bySlug("creator-reel-template-kit"), bySlug("luxury-resort-reel-templates"), bySlug("urban-night-mobile-presets")] },
];

export const marketplaceHomeCreators: MarketplaceHomeCreator[] = [
  { slug: "aira-studio", name: "Aira Studio", specialty: "Motion templates & cinematic color", location: "Mumbai, India", rating: 4.9, assetCount: 42, salesLabel: "18.4k followers", avatar: avatars.aira, portfolio: [bySlug("creator-reel-template-kit"), bySlug("cinematic-travel-lut-pack"), bySlug("luxury-resort-reel-templates")] },
  { slug: "noor-visuals", name: "Noor Visuals", specialty: "Editorial photography & mobile presets", location: "Jaipur, India", rating: 4.8, assetCount: 58, salesLabel: "24.7k followers", avatar: avatars.noor, portfolio: [bySlug("jaipur-editorial-photo-set"), bySlug("rajasthan-heritage-portraits"), bySlug("urban-night-mobile-presets")] },
  { slug: "routecraft-labs", name: "RouteCraft Labs", specialty: "Maps, guides & destination graphics", location: "Bengaluru, India", rating: 4.8, assetCount: 31, salesLabel: "11.2k followers", avatar: avatars.routecraft, portfolio: [bySlug("monsoon-route-map-pack"), bySlug("old-city-food-guide"), bySlug("tropical-island-route-pack")] },
  { slug: "northlight-motion", name: "Northlight Motion", specialty: "Aerial film & adventure content", location: "Manali, India", rating: 4.9, assetCount: 67, salesLabel: "29.1k followers", avatar: avatars.northlight, portfolio: [bySlug("himalayan-sunrise-aerials"), bySlug("india-adventure-content-kit"), bySlug("cinematic-ladakh-drone-pack")] },
];

export const discoveryFilters: Array<{ id: MarketplaceDiscoveryFilter; label: string }> = [
  { id: "popular", label: "Most Popular" }, { id: "new", label: "New Releases" }, { id: "rated", label: "Best Rated" },
  { id: "under-499", label: "Under ₹499" }, { id: "commercial", label: "Commercial Use" }, { id: "extended", label: "Extended License" },
  { id: "4k", label: "4K Video" }, { id: "drone", label: "Drone" }, { id: "mobile-presets", label: "Mobile Presets" },
];
