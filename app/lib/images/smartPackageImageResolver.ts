import {
  continentImageQueryMap,
  destinationImageQueryMap,
  genericTravelImageQuery,
  themeImageQueryMap,
} from "@/app/lib/images/imageQueryMaps";

type SmartImageInput = {
  id?: string | number | null;
  slug?: string | null;
  routeId?: string | null;
  title?: string | null;
  imageUrl?: string | null;
  coverImage?: string | null;
  images?: Array<string | null | undefined> | null;
  imageQuery?: string | null;
  route?: string | null;
  country?: string | null;
  continent?: string | null;
  cities?: string[] | null;
  themes?: string[] | null;
  subThemes?: string[] | null;
  tags?: string[] | null;
  category?: string | null;
};

export type SmartResolvedImage = {
  src?: string;
  imageQuery?: string;
  fallbackSrc: string;
  fallbackQuery?: string;
  preferDynamic: boolean;
  isSensitive: boolean;
  alt: string;
};

const spiritualFallback = "/themes/icons/spiritual.jpg";
const indiaFallback = "/destinations/icons/india.svg";
const continentFallback = "/bg/continentbg.jpg";
const packageFallback = "/bg/destinationbg.jpg";

const sensitiveKeywords = [
  "spiritual",
  "pilgrimage",
  "char dham",
  "chardham",
  "sacred",
  "temple",
  "jyotirlinga",
  "buddhist",
  "jain",
  "sikh",
  "sufi",
  "yatra",
  "kedarnath",
  "badrinath",
  "yamunotri",
  "gangotri",
  "varanasi",
  "banaras",
  "kashi",
  "ayodhya",
  "mathura",
  "vrindavan",
  "haridwar",
  "rishikesh",
];

const exactPackageImageMap: Record<string, string> = {
  "char-dham-yatra-tour": "/themes/icons/spiritual.jpg",
  "char-dham-yatra": "/themes/icons/spiritual.jpg",
  "char-dham-sacred-routes": "/themes/icons/spiritual.jpg",
  "india-pilgrimage-spiritual-tour": "/themes/icons/spiritual.jpg",
  "uttarpradesh-spiritual-tour": "/themes/icons/spiritual.jpg",
  "sufi-shrines-spiritual-tour": "/experiences/spiritual.jpg",
  "andhra-tirupati-tour": "/themes/icons/spiritual.jpg",
  "varanasi-cultural-walk-tour": "/themes/icons/cultural.jpg",
  "delhi-museums-cultural-centers-tour": "/themes/icons/educational.jpg",
  "northeast-tribal-culture-tour": "/themes/icons/cultural.jpg",
  "northeast-tribal-rural-tour": "/themes/icons/rural.jpg",
  "heritage-india-historical-monuments": "/themes/icons/cultural.jpg",
};

const keywordImageMap: Array<{ keys: string[]; src: string; query: string }> = [
  {
    keys: ["char-dham", "chardham", "kedarnath", "badrinath", "yamunotri", "gangotri"],
    src: "/themes/icons/spiritual.jpg",
    query: "char dham yatra himalaya temple",
  },
  {
    keys: ["varanasi", "banaras", "kashi", "ganga", "ghat", "ghats"],
    src: "/themes/icons/spiritual.jpg",
    query: "varanasi ghats ganga river spiritual india travel",
  },
  {
    keys: ["ayodhya", "mathura", "vrindavan", "haridwar", "rishikesh"],
    src: "/themes/icons/spiritual.jpg",
    query: "varanasi ganga ghats temple pilgrimage india",
  },
  {
    keys: ["buddhist", "jain", "sikh", "sufi"],
    src: "/experiences/spiritual.jpg",
    query: "varanasi ganga ghats temple pilgrimage india",
  },
  {
    keys: ["museum", "museums", "science-centre", "science-center", "educational", "student"],
    src: "/themes/icons/educational.jpg",
    query: "students educational tour museum science centre india",
  },
  {
    keys: ["north-east", "northeast", "tribal", "nagaland", "meghalaya", "shillong", "kohima", "itanagar"],
    src: "/themes/icons/cultural.jpg",
    query: "northeast india tribal culture nagaland meghalaya",
  },
  {
    keys: ["rajasthan", "jaipur", "jodhpur", "udaipur"],
    src: "/themes/icons/cultural.jpg",
    query: "rajasthan palace folk culture india",
  },
  {
    keys: ["kerala", "kochi", "alleppey", "munnar"],
    src: "/demo/kerala-cover.jpg",
    query: "kerala backwaters houseboat",
  },
  {
    keys: ["goa"],
    src: "/holidays/goa.jpeg",
    query: "goa beach resort india",
  },
  {
    keys: ["ladakh", "leh"],
    src: "/experiences/roadtrip.jpg",
    query: "ladakh mountain road trip india",
  },
  {
    keys: ["sikkim", "gangtok", "kashmir", "srinagar", "gulmarg", "himachal", "manali", "shimla", "uttarakhand"],
    src: "/holidays/manali.jpeg",
    query: "himalayan mountains india travel",
  },
  {
    keys: ["delhi"],
    src: "/themes/icons/cultural.jpg",
    query: "delhi museum cultural heritage india",
  },
  {
    keys: ["agra", "taj-mahal", "golden-triangle", "delhi-agra-jaipur"],
    src: "/themes/icons/cultural.jpg",
    query: "agra taj mahal india travel",
  },
  {
    keys: ["australia", "new-zealand", "sydney", "auckland"],
    src: "/continents/icons/oceania.jpg",
    query: "australia new zealand travel sydney opera house mountains beach",
  },
];

const themeBannerImageMap: Record<string, string> = {
  spiritual: "/themes/icons/spiritual.jpg",
  culture: "/themes/icons/cultural.jpg",
  cultural: "/themes/icons/cultural.jpg",
  educational: "/themes/icons/educational.jpg",
  "adventure-nature": "/themes/icons/adventure-nature.jpg",
  adventure: "/themes/icons/adventure-nature.jpg",
  "wellness-medical": "/themes/icons/wellness-medical.jpg",
  wellness: "/themes/icons/wellness-medical.jpg",
  rural: "/themes/icons/rural.jpg",
  "eco-wildlife": "/themes/icons/eco-wildlife.jpg",
  wildlife: "/themes/icons/eco-wildlife.jpg",
  "honeymoon-celebration": "/themes/icons/honeymoon-celebration.jpg",
  honeymoon: "/themes/icons/honeymoon-celebration.jpg",
  romance: "/themes/icons/honeymoon-celebration.jpg",
  "short-weekend": "/themes/icons/short-weekend.jpg",
  weekend: "/themes/icons/short-weekend.jpg",
  "pre-wedding-production": "/themes/icons/prewedding-production.jpg",
  media: "/themes/icons/prewedding-production.jpg",
};

const continentBannerImageMap: Record<string, string> = {
  asia: "/continents/icons/asia.jpg",
  europe: "/continents/icons/europe.jpg",
  "north-america": "/continents/icons/north-america.jpg",
  northamerica: "/continents/icons/north-america.jpg",
  "south-america": "/continents/icons/south-america.jpg",
  southamerica: "/continents/icons/south-america.jpg",
  africa: "/continents/icons/africa.jpg",
  "australia-new-zealand": "/continents/icons/oceania.jpg",
  "australia-and-new-zealand": "/continents/icons/oceania.jpg",
  oceania: "/continents/icons/oceania.jpg",
  australia: "/continents/icons/oceania.jpg",
  newzealand: "/continents/icons/oceania.jpg",
  antarctica: "/continents/icons/antarctica.jpg",
};

export function normalizeImageKey(value?: string | number | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/char[\s-]?dham/g, "char dham")
    .replace(/australia\s*(and|&)?\s*new\s*zealand/g, "australia new zealand")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readable(value?: string | number | null) {
  return String(value || "").trim();
}

function joinedText(input: SmartImageInput) {
  return [
    input.slug,
    input.routeId,
    input.id,
    input.title,
    input.route,
    input.country,
    input.continent,
    input.category,
    ...(input.cities || []),
    ...(input.themes || []),
    ...(input.subThemes || []),
    ...(input.tags || []),
  ]
    .map((item) => normalizeImageKey(item))
    .filter(Boolean)
    .join(" ");
}

function firstExistingImage(input: SmartImageInput) {
  return (
    readable(input.imageUrl) ||
    readable(input.coverImage) ||
    readable(input.images?.find(Boolean)) ||
    ""
  );
}

function hasText(text: string, keys: string[]) {
  return keys.some((item) => text.includes(normalizeImageKey(item)));
}

function isSensitiveText(text: string) {
  return hasText(text, sensitiveKeywords);
}

function exactPackageImage(input: SmartImageInput) {
  const keys = [
    input.slug,
    input.routeId,
    input.id,
    input.title,
  ].map((item) => normalizeImageKey(item));

  for (const key of keys) {
    if (exactPackageImageMap[key]) return exactPackageImageMap[key];
  }

  return "";
}

function keywordMatch(input: SmartImageInput) {
  const text = joinedText(input);

  for (const item of keywordImageMap) {
    if (hasText(text, item.keys)) return item;
  }

  return null;
}

function mapLookup(map: Record<string, string>, values: Array<string | number | null | undefined>) {
  for (const value of values) {
    const mapped = map[normalizeImageKey(value)];
    if (mapped) return mapped;
  }

  return "";
}

function themeQuery(input: SmartImageInput) {
  return mapLookup(themeImageQueryMap, [
    ...(input.themes || []),
    ...(input.subThemes || []),
    ...(input.tags || []),
    input.category,
  ]);
}

function destinationQuery(input: SmartImageInput) {
  const text = joinedText(input);

  if (
    hasText(text, ["agra", "taj mahal", "golden triangle", "delhi agra jaipur"])
  ) {
    return "agra taj mahal india travel";
  }

  return mapLookup(destinationImageQueryMap, [
    ...(input.cities || []),
    input.route,
    input.country,
    input.continent,
  ]);
}

function safeFallback(input: SmartImageInput, sensitive: boolean) {
  const text = joinedText(input);

  if (sensitive) return spiritualFallback;
  if (hasText(text, ["india", "rajasthan", "kerala", "goa", "ladakh", "kashmir"])) {
    return indiaFallback;
  }
  if (input.continent) return continentFallback;
  return packageFallback;
}

function goodDynamicQuery(input: SmartImageInput, query?: string) {
  const clean = readable(query);
  const wordCount = clean.split(/\s+/).filter(Boolean).length;

  if (wordCount < 3) return "";
  if (/^(travel|tour|package|india travel|spiritual travel|package tour)$/i.test(clean)) {
    return "";
  }

  const destination = [
    ...(input.cities || []),
    input.route,
    input.country,
    input.continent,
  ].some(Boolean);

  return destination ? clean : "";
}

export function getSmartDestinationImage(input: SmartImageInput): SmartResolvedImage {
  return getSmartPackageImage(input);
}

export function getSmartPackageImage(input: SmartImageInput): SmartResolvedImage {
  const text = joinedText(input);
  const sensitive = isSensitiveText(text);
  const sourceImage = firstExistingImage(input);
  const exactImage = exactPackageImage(input);
  const keyword = keywordMatch(input);
  const destinationMappedQuery = destinationQuery(input);
  const fallbackSrc = safeFallback(input, sensitive);
  const mappedThemeQuery = themeQuery(input);
  const generatedQuery = goodDynamicQuery(
    input,
    keyword?.query ||
      destinationMappedQuery ||
      mappedThemeQuery ||
      genericTravelImageQuery
  );

  const src = sourceImage || exactImage || keyword?.src || "";
  const imageQuery =
    !sensitive && !src
      ? generatedQuery || undefined
      : undefined;

  return {
    src: src || fallbackSrc,
    imageQuery,
    fallbackSrc,
    fallbackQuery: !sensitive ? destinationMappedQuery || mappedThemeQuery || undefined : undefined,
    preferDynamic: Boolean(imageQuery),
    isSensitive: sensitive,
    alt: readable(input.title) || "Travel package image",
  };
}

export function getSmartThemeBannerImage(themeSlug?: string | null): SmartResolvedImage {
  const slug = normalizeImageKey(themeSlug);
  const sensitive = isSensitiveText(slug);
  const src = themeBannerImageMap[slug] || themeBannerImageMap[slug.replace("and", "")] || "";
  const query = themeImageQueryMap[slug] || themeImageQueryMap[slug.replace("and", "")] || "";

  return {
    src: src || (sensitive ? spiritualFallback : packageFallback),
    imageQuery: !sensitive && !src ? query : undefined,
    fallbackSrc: sensitive ? spiritualFallback : packageFallback,
    fallbackQuery: !sensitive ? query : undefined,
    preferDynamic: !sensitive && !src && Boolean(query),
    isSensitive: sensitive,
    alt: `${themeSlug || "Theme"} image`,
  };
}

export function getSmartContinentBannerImage(continentSlug?: string | null): SmartResolvedImage {
  const slug = normalizeImageKey(continentSlug);
  const src = continentBannerImageMap[slug] || "";
  const query = continentImageQueryMap[slug] || "";

  return {
    src: src || continentFallback,
    imageQuery: !src ? query : undefined,
    fallbackSrc: continentFallback,
    fallbackQuery: query || undefined,
    preferDynamic: !src && Boolean(query),
    isSensitive: false,
    alt: `${continentSlug || "Continent"} image`,
  };
}
