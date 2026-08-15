export interface CreatorAnalyticsKPI { key: string; label: string; value: string; growth: number; comparison: string; points: number[]; }
export interface AnalyticsSeries { key: "downloads" | "views" | "revenue"; label: string; color: string; values: number[]; }

export const analyticsKPIs: CreatorAnalyticsKPI[] = [
  { key: "downloads", label: "Downloads", value: "24.8K", growth: 12.4, comparison: "vs previous period", points: [18, 24, 22, 31, 35, 42, 39, 48] },
  { key: "views", label: "Views", value: "312.6K", growth: 18.2, comparison: "vs previous period", points: [22, 25, 31, 29, 41, 45, 54, 61] },
  { key: "revenue", label: "Revenue", value: "₹1.84L", growth: 21.4, comparison: "preview growth", points: [12, 18, 17, 24, 28, 33, 41, 47] },
  { key: "conversion", label: "Conversion Rate", value: "7.9%", growth: 1.6, comparison: "absolute improvement", points: [28, 31, 30, 34, 35, 38, 37, 42] },
  { key: "profile", label: "Profile Views", value: "86.2K", growth: 9.8, comparison: "vs previous period", points: [16, 21, 20, 28, 26, 34, 39, 44] },
  { key: "average", label: "Avg. Earnings / Download", value: "₹7.42", growth: 4.3, comparison: "preview average", points: [25, 24, 29, 31, 30, 35, 37, 39] },
];

export const performanceSeries: AnalyticsSeries[] = [
  { key: "downloads", label: "Downloads", color: "#2563eb", values: [32, 45, 38, 58, 67, 71, 64, 82, 91, 88, 106, 118] },
  { key: "views", label: "Views", color: "#7c3aed", values: [48, 58, 64, 79, 86, 94, 103, 112, 126, 132, 148, 162] },
  { key: "revenue", label: "Revenue", color: "#059669", values: [22, 31, 29, 42, 48, 55, 61, 68, 74, 86, 93, 104] },
];

export const analyticsTopAssets = [
  { title: "Luxury Resort Reel Templates", image: "/experiences/luxury.jpg", downloads: "5.6K", revenue: "₹54,100", conversion: "8.4%", trend: "+18%" },
  { title: "Cinematic Ladakh Drone Pack", image: "/experiences/adventure.jpg", downloads: "4.8K", revenue: "₹42,800", conversion: "7.9%", trend: "+12%" },
  { title: "Rajasthan Heritage Portraits", image: "/themes/banners/culture-2.jpg", downloads: "3.2K", revenue: "₹31,400", conversion: "6.8%", trend: "+9%" },
  { title: "Urban Night Mobile Presets", image: "/themes/banners/culture-3.jpg", downloads: "2.9K", revenue: "₹18,700", conversion: "6.1%", trend: "+7%" },
];

export const assetTypeBreakdown = [{ label: "Photos", value: 38 }, { label: "Videos", value: 27 }, { label: "Templates", value: 18 }, { label: "Drone", value: 11 }, { label: "Guides", value: 6 }];
export const destinationRevenue = [{ label: "India", value: 46 }, { label: "UAE", value: 18 }, { label: "Singapore", value: 14 }, { label: "United Kingdom", value: 12 }, { label: "Other", value: 10 }];
export const trafficSources = [{ label: "Marketplace Search", value: 42 }, { label: "Collections", value: 24 }, { label: "Creator Profile", value: 18 }, { label: "External", value: 10 }, { label: "Direct", value: 6 }];
export const audienceGeography = [{ label: "India", value: "41%" }, { label: "United States", value: "16%" }, { label: "United Kingdom", value: "11%" }, { label: "UAE", value: "9%" }, { label: "Other", value: "23%" }];
export const topCollections = [{ label: "Luxury Escapes", value: "8.4K views" }, { label: "Cinematic India", value: "7.9K views" }, { label: "Himalayan Aerials", value: "6.2K views" }, { label: "Heritage Cities", value: "5.8K views" }];
export const engagementFunnel = [{ label: "Impressions", value: 312600, display: "312.6K" }, { label: "Asset Views", value: 86200, display: "86.2K" }, { label: "License Intent", value: 31900, display: "31.9K" }, { label: "Downloads", value: 24800, display: "24.8K" }];

export const analyticsInsights = [
  { title: "Revenue grew 21.4%", copy: "Extended licenses and premium templates contributed most to preview growth.", tone: "emerald" },
  { title: "Photos lead discovery", copy: "Photos are your highest-performing category by total marketplace reach.", tone: "blue" },
  { title: "India generates the most revenue", copy: "India represents 46% of destination-attributed preview revenue.", tone: "violet" },
  { title: "Desktop Chrome converts best", copy: "Desktop Chrome audiences show the strongest fixture conversion rate.", tone: "amber" },
];

export const analyticsFilterOptions = {
  type: ["Photos", "Videos", "Reels", "Drone", "Templates", "Graphics", "Guides", "Audio"],
  collection: ["Cinematic India", "Luxury Escapes", "Himalayan Aerials", "Heritage Cities"],
  license: ["Standard", "Extended", "Editorial", "Commercial", "Enterprise Ready"],
  status: ["Published", "Under Review", "Draft", "Archived"],
  destination: ["India", "UAE", "Singapore", "United Kingdom", "Global"],
  date: ["Last 7 days", "Last 30 days", "Last 90 days", "This year", "All time"],
  compare: ["Previous period", "Previous year", "No comparison"],
};

export const analyticsQuickSummary = ["24.8K downloads across 128 assets", "7.9% overall preview conversion", "Templates produce the highest earnings per download", "Marketplace Search is the top traffic source"];
