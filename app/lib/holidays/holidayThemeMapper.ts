export type HolidayHeroThemeKey =
  | "search"
  | "honeymoon-and-celebrations"
  | "group-tour-package"
  | "weekend-tour"
  | "adventure-and-wildlife"
  | "spiritual-packages"
  | "pre-wedding-and-production"
  | "";

export type HolidayThemeMappingResult = {
  heroTheme: HolidayHeroThemeKey;
  themePageSlug: string;
  packageThemes: string[];
  packageSubThemes: string[];
  experienceTags: string[];
};

const HOLIDAY_THEME_MAP: Record<string, HolidayThemeMappingResult> = {
  "honeymoon-and-celebrations": {
    heroTheme: "honeymoon-and-celebrations",
    themePageSlug: "romance-celebration",
    packageThemes: ["HONEYMOON TOURISM", "LEISURE TOURISM", "PREMIUM TOUR"],
    packageSubThemes: [
      "Honeymoon Packages",
      "Romantic Getaways",
      "Island Honeymoon",
      "Destination Weddings",
      "Anniversary & Celebration Tours",
    ],
    experienceTags: ["honeymoon", "romantic", "celebration", "couple"],
  },

  "group-tour-package": {
    heroTheme: "group-tour-package",
    themePageSlug: "cultural",
    packageThemes: [
      "CULTURAL TOURISM",
      "SPIRITUAL TOURISM",
      "INDIA STATE TOUR",
      "CITY TOURISM",
      "LEISURE TOURISM",
    ],
    packageSubThemes: [
      "Pilgrimage Tours",
      "Temple Circuits",
      "Heritage & Historical Monuments",
      "Architecture & Old Cities",
      "City Break Tours",
    ],
    experienceTags: ["group", "family", "fixed-departure", "cultural"],
  },

  "weekend-tour": {
    heroTheme: "weekend-tour",
    themePageSlug: "short-weekend",
    packageThemes: [
      "LEISURE TOURISM",
      "CITY TOURISM",
      "INDIA STATE TOUR",
      "NATURE TOURISM",
    ],
    packageSubThemes: [
      "Weekend Getaways",
      "Short Break Holidays",
      "City Break Tours",
    ],
    experienceTags: ["weekend", "short-trip", "quick-getaway"],
  },

  "adventure-and-wildlife": {
    heroTheme: "adventure-and-wildlife",
    themePageSlug: "adventure-nature",
    packageThemes: [
      "ADVENTURE TOURISM",
      "WILDLIFE TOURISM",
      "NATURE TOURISM",
    ],
    packageSubThemes: [
      "Himalayan Adventure",
      "Trekking & Hiking",
      "Forest & Nature Trails",
      "National Parks & Sanctuaries",
      "Jungle Safari",
      "Bird Watching",
    ],
    experienceTags: ["adventure", "wildlife", "nature", "trekking", "safari"],
  },

  "spiritual-packages": {
    heroTheme: "spiritual-packages",
    themePageSlug: "spiritual",
    packageThemes: ["SPIRITUAL TOURISM"],
    packageSubThemes: [
      "Pilgrimage Tours",
      "Temple Circuits",
      "Jyotirlinga Circuits",
      "Char Dham & Sacred Routes",
      "Buddhist & Jain Circuits",
      "Sufi & Spiritual Shrines",
      "Religious Festivals",
    ],
    experienceTags: ["spiritual", "pilgrimage", "temple", "religious"],
  },

  "pre-wedding-and-production": {
    heroTheme: "pre-wedding-and-production",
    themePageSlug: "media-production",
    packageThemes: ["PREMIUM TOUR", "LEISURE TOURISM"],
    packageSubThemes: [
      "Film Shooting Locations",
      "OTT & Web Series Shoots",
      "Ad & Commercial Shoots",
      "Music Video Shoots",
      "Pre-Wedding & Fashion Shoots",
    ],
    experienceTags: ["pre-wedding", "production", "shoot", "fashion"],
  },

  search: {
    heroTheme: "search",
    themePageSlug: "",
    packageThemes: [],
    packageSubThemes: [],
    experienceTags: [],
  },

  "": {
    heroTheme: "",
    themePageSlug: "",
    packageThemes: [],
    packageSubThemes: [],
    experienceTags: [],
  },
};

function normalize(value?: string) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-");
}

export function resolveHolidayThemeMapping(
  heroTheme: string
): HolidayThemeMappingResult {
  const normalized = normalize(heroTheme);

  return (
    HOLIDAY_THEME_MAP[normalized] || {
      heroTheme: "",
      themePageSlug: "",
      packageThemes: [],
      packageSubThemes: [],
      experienceTags: [],
    }
  );
}