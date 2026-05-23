import { resolveHolidayThemeMapping } from "./holidayThemeMapper";
import { findDestinationInRegistry } from "./holidayDestinationRegistry";
import { advancedSmartPackageSearch } from "./advancedSmartPackageSearch";

export type HolidaySearchFilters = {
  durationBucket?: string;
  flightPreference?: "withFlight" | "withoutFlight" | "";
  budgetBucket?: string;
};

export type HolidaySearchInput = {
  originCity: string;
  toCity: string;
  departureDate: string;
  adults: number;
  children: number;
  rooms: number;
  selectedTheme?: string;
  selectedSubTheme?: string;
  filters?: HolidaySearchFilters;
};

export type HolidayResolvedTarget = {
  mode: "theme" | "continent" | "popular";
  route: string;
  query: Record<string, string>;
  matchedBy:
    | "theme"
    | "registry"
    | "smart"
    | "city"
    | "country"
    | "continent"
    | "india"
    | "generic";
  matchedContinent?: string;
  matchedCountry?: string;
  matchedCity?: string;
};

function normalize(value?: string) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value?: string) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeContinentSlug(value?: string) {
  return normalize(value).replace(/\s+/g, "");
}

function buildBaseQuery(input: HolidaySearchInput) {
  return {
    origin: input.originCity || "Delhi",
    toCity: input.toCity || "",
    date: input.departureDate || "",
    adults: String(Math.max(input.adults || 2, 1)),
    children: String(Math.max(input.children || 0, 0)),
    rooms: String(Math.max(input.rooms || 1, 1)),
    durationBucket: input.filters?.durationBucket || "",
    flightPreference: input.filters?.flightPreference || "",
    budgetBucket: input.filters?.budgetBucket || "",
    theme: input.selectedTheme || "",
    subTheme: input.selectedSubTheme || "",
  };
}

function buildContinentRoute(continent?: string) {
  return `/continent/${normalizeContinentSlug(continent || "asia") || "asia"}`;
}

function isIndiaLike(value?: string) {
  const n = normalize(value);
  return n === "india" || n.includes("india");
}

export function resolveHolidaySearchTarget(
  input: HolidaySearchInput
): HolidayResolvedTarget {
  const baseQuery = buildBaseQuery(input);
  const selectedTheme = input.selectedTheme || "";
  const selectedSubTheme = input.selectedSubTheme || "";
  const userDestination = input.toCity || "";

  // 1) Theme-first routing
  if (selectedTheme) {
    const mapped = resolveHolidayThemeMapping(selectedTheme);

    // ✅ Group Tour ke liye alag page
    if (selectedTheme === "group-tour-package") {
      return {
        mode: "theme",
        route: "/group-tours",
        query: {
          ...baseQuery,
          searchMode: "group",
          destinationHint: userDestination,
          selectedTheme,
          selectedSubTheme,
          mappedThemes: mapped?.packageThemes?.join("|") || "",
          mappedSubThemes: mapped?.packageSubThemes?.join("|") || "",
          experienceTags: mapped?.experienceTags?.join("|") || "",
        },
        matchedBy: "theme",
      };
    }

    const themeSlug =
      mapped?.themePageSlug || slugify(selectedTheme) || "culture";

    return {
      mode: "theme",
      route: `/themes/${themeSlug}`,
      query: {
        ...baseQuery,
        searchMode: "theme",
        destinationHint: userDestination,
        selectedTheme,
        selectedSubTheme,
        mappedThemes: mapped?.packageThemes?.join("|") || "",
        mappedSubThemes: mapped?.packageSubThemes?.join("|") || "",
        experienceTags: mapped?.experienceTags?.join("|") || "",
      },
      matchedBy: "theme",
    };
  }

  // 2) Navigation registry hit
  const registryHit = findDestinationInRegistry(userDestination);

  if (registryHit) {
    const isIndia = isIndiaLike(registryHit.country) || !!registryHit.indiaGroup;
    const matchedContinent = registryHit.continent || "asia";

    const matchedCountry =
      registryHit.country || registryHit.label || userDestination;

    const matchedCity =
      registryHit.type === "city" || registryHit.label !== registryHit.country
        ? registryHit.label || userDestination
        : userDestination;

    if (isIndia) {
      return {
        mode: "popular",
        route: "/popular/india",
        query: {
          ...baseQuery,
          searchMode: "destination",
          destinationKind: "india",
          matchedCountry,
          matchedContinent,
          matchedCity,
        },
        matchedBy: "registry",
        matchedContinent,
        matchedCountry,
        matchedCity,
      };
    }

    return {
      mode: "continent",
      route: buildContinentRoute(matchedContinent),
      query: {
        ...baseQuery,
        searchMode: "destination",
        destinationKind: "international",
        matchedCountry,
        matchedContinent,
        matchedCity,
      },
      matchedBy: "registry",
      matchedContinent,
      matchedCountry,
      matchedCity,
    };
  }

  // 3) Advanced smart package search
  const smartMatches = advancedSmartPackageSearch(userDestination, 10);

  if (smartMatches.length > 0) {
    const top = smartMatches[0];
    const matchedCountry = top.country || "";
    const matchedContinent = top.continent || "asia";
    const matchedCity =
      (top.cities && top.cities.length > 0 ? top.cities[0] : "") ||
      userDestination;

    if (isIndiaLike(matchedCountry)) {
      return {
        mode: "popular",
        route: "/popular/india",
        query: {
          ...baseQuery,
          searchMode: "destination",
          destinationKind: "india",
          matchedCountry: matchedCountry || "India",
          matchedContinent: matchedContinent || "asia",
          matchedCity,
          smartQuery: userDestination,
        },
        matchedBy: "smart",
        matchedContinent: matchedContinent || "asia",
        matchedCountry: matchedCountry || "India",
        matchedCity,
      };
    }

    return {
      mode: "continent",
      route: buildContinentRoute(matchedContinent),
      query: {
        ...baseQuery,
        searchMode: "destination",
        destinationKind: "international",
        matchedCountry,
        matchedContinent,
        matchedCity,
        smartQuery: userDestination,
      },
      matchedBy: "smart",
      matchedContinent,
      matchedCountry,
      matchedCity,
    };
  }

  // 4) Direct continent intent fallback
  const destinationNorm = normalize(userDestination);

  const knownContinents = [
    "asia",
    "europe",
    "north america",
    "south america",
    "africa",
    "australia and new zealand",
    "antarctica",
  ];

  const continentHit = knownContinents.find(
    (item) =>
      normalize(item) === destinationNorm ||
      normalize(item).includes(destinationNorm) ||
      destinationNorm.includes(normalize(item))
  );

  if (continentHit) {
    return {
      mode: "continent",
      route: buildContinentRoute(continentHit),
      query: {
        ...baseQuery,
        searchMode: "destination",
        destinationKind: "international",
        matchedContinent: continentHit,
      },
      matchedBy: "continent",
      matchedContinent: continentHit,
    };
  }

  // 5) Final generic fallback
  return {
    mode: "continent",
    route: "/continent/asia",
    query: {
      ...baseQuery,
      searchMode: "destination",
      destinationKind: "generic",
    },
    matchedBy: "generic",
    matchedContinent: "asia",
  };
}

export function buildHolidayResolvedUrl(resolved: HolidayResolvedTarget) {
  const params = new URLSearchParams();

  Object.entries(resolved.query).forEach(([key, value]) => {
    if (value !== "") {
      params.set(key, value);
    }
  });

  return `${resolved.route}?${params.toString()}`;
}