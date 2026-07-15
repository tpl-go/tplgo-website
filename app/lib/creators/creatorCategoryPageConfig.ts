export type CreatorCategoryPageStat = { value: string; label: string };
export type CreatorCategoryPageConfig = {
  slug: string;
  title: string;
  description: string;
  heroImage: string;
  searchPlaceholder: string;
  popularTags: string[];
  stats: CreatorCategoryPageStat[];
  catalogCategory?: string;
  mediaType?: string;
  semanticTerms: string[];
  accent: string;
};

const stats = (assetLabel: string, assetCount: string, creators: string): CreatorCategoryPageStat[] => [
  { value: assetCount, label: assetLabel }, { value: creators, label: "Creators" },
  { value: "50+", label: "Categories" }, { value: "Daily", label: "Updated" },
];

export const creatorCategoryPageConfigs: CreatorCategoryPageConfig[] = [
  { slug: "photos", title: "Travel Photos", description: "Premium destination, culture, wildlife and lifestyle photography from verified creators around the world.", heroImage: "/themes/banners/culture-2.jpg", searchPlaceholder: "Search photos...", popularTags: ["Mountains", "India", "Sunset", "Beach", "City", "Wildlife"], stats: stats("Photos", "2.8M+", "195K+"), catalogCategory: "photos", mediaType: "image", semanticTerms: ["photo", "portrait", "editorial", "photography"], accent: "from-sky-950" },
  { slug: "videos", title: "Stock Videos", description: "Cinematic footage, destination films and production-ready travel clips for every screen.", heroImage: "/experiences/roadtrip.jpg", searchPlaceholder: "Search videos...", popularTags: ["4K", "Cinematic", "India", "Hotels", "Adventure", "Nature"], stats: stats("Videos", "980K+", "84K+"), catalogCategory: "videos", mediaType: "video", semanticTerms: ["video", "footage", "cinematic"], accent: "from-indigo-950" },
  { slug: "reels", title: "Reels", description: "Vertical travel stories, social-ready edits and engaging short-form creative assets.", heroImage: "/experiences/weekend.jpg", searchPlaceholder: "Search reels...", popularTags: ["Vertical", "Luxury", "Hotels", "Transitions", "Social", "Travel"], stats: stats("Reels", "420K+", "62K+"), catalogCategory: "templates", mediaType: "template", semanticTerms: ["reel", "vertical", "social"], accent: "from-violet-950" },
  { slug: "drone", title: "Drone Footage", description: "Sweeping aerial perspectives, dramatic landscapes and destination establishing shots in HD, 4K and beyond.", heroImage: "/experiences/adventure.jpg", searchPlaceholder: "Search drone footage...", popularTags: ["Aerial", "Himalayas", "4K", "Coast", "City", "Sunrise"], stats: stats("Drone Assets", "315K+", "28K+"), catalogCategory: "videos", mediaType: "video", semanticTerms: ["drone", "aerial", "himalaya"], accent: "from-slate-950" },
  { slug: "templates", title: "Creative Templates", description: "Polished video, presentation and social templates built for fast professional storytelling.", heroImage: "/themes/banners/culture-3.jpg", searchPlaceholder: "Search templates...", popularTags: ["Reels", "Social", "Premiere Pro", "After Effects", "Travel", "Luxury"], stats: stats("Templates", "640K+", "71K+"), catalogCategory: "templates", mediaType: "template", semanticTerms: ["template", "motion", "social"], accent: "from-blue-950" },
  { slug: "presets", title: "Presets & LUTs", description: "Distinctive color grades and editing presets for consistent photo and video workflows.", heroImage: "/experiences/luxury.jpg", searchPlaceholder: "Search presets...", popularTags: ["Lightroom", "Mobile", "Cinematic", "Night", "Film", "Warm"], stats: stats("Presets", "185K+", "32K+"), catalogCategory: "presets-luts", mediaType: "template", semanticTerms: ["preset", "lut", "color"], accent: "from-fuchsia-950" },
  { slug: "graphics", title: "Graphics & Illustrations", description: "Editable maps, overlays, vectors and visual systems for destination-led creative work.", heroImage: "/continents/banners/asia-2.jpg", searchPlaceholder: "Search graphics...", popularTags: ["Vector", "Maps", "Illustration", "Overlays", "India", "Social"], stats: stats("Graphics", "760K+", "95K+"), mediaType: "document", semanticTerms: ["graphic", "vector", "overlay", "map"], accent: "from-cyan-950" },
  { slug: "destination-guides", title: "Destination Guides", description: "Expert digital guidebooks, route notes and destination resources for inspired journeys.", heroImage: "/demo/kerala-cover.jpg", searchPlaceholder: "Search destination guides...", popularTags: ["India", "Food", "Routes", "Kerala", "City", "Adventure"], stats: stats("Guides", "92K+", "18K+"), catalogCategory: "guides", mediaType: "document", semanticTerms: ["guide", "route", "destination", "food"], accent: "from-emerald-950" },
];

export function getCreatorCategoryPageConfig(slug: string) {
  return creatorCategoryPageConfigs.find((item) => item.slug === slug);
}
