import { packageSeeds } from "@/app/data/packages/packageSeeds";

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
  mode: "theme" | "destination";
  route: string;
  query: Record<string, string>;
  matchedBy:
    | "theme"
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
    .replace(/\s+/g, " ");
}

function slugify(value?: string) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
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

function findMatches(toCity: string) {
  const needle = normalize(toCity);

  if (!needle) {
    return {
      cityMatches: [],
      countryMatches: [],
      continentMatches: [],
      indiaMatches: [],
    };
  }

  const cityMatches = packageSeeds.filter((pkg) =>
    pkg.cities.some((city) => normalize(city).includes(needle) || needle.includes(normalize(city)))
  );

  const countryMatches = packageSeeds.filter(
    (pkg) =>
      normalize(pkg.country).includes(needle) ||
      needle.includes(normalize(pkg.country))
  );

  const continentMatches = packageSeeds.filter(
    (pkg) =>
      normalize(pkg.continent).includes(needle) ||
      needle.includes(normalize(pkg.continent))
  );

  const indiaMatches = packageSeeds.filter(
    (pkg) =>
      normalize(pkg.country) === "india" &&
      pkg.cities.some((city) => normalize(city).includes(needle) || needle.includes(normalize(city)))
  );

  return {
    cityMatches,
    countryMatches,
    continentMatches,
    indiaMatches,
  };
}

function pickContinentFromMatches(matches: typeof packageSeeds) {
  if (!matches.length) return "";
  return matches[0].continent || "";
}

function pickCountryFromMatches(matches: typeof packageSeeds) {
  if (!matches.length) return "";
  return matches[0].country || "";
}

function pickCityFromMatches(matches: typeof packageSeeds, toCity: string) {
  if (!matches.length) return toCity || "";
  const needle = normalize(toCity);

  for (const pkg of matches) {
    const found = pkg.cities.find(
      (city) =>
        normalize(city).includes(needle) || needle.includes(normalize(city))
    );
    if (found) return found;
  }

  return toCity || "";
}

export function resolveHolidaySearchFromSeeds(
  input: HolidaySearchInput
): HolidayResolvedTarget {
  const baseQuery = buildBaseQuery(input);
  const selectedTheme = input.selectedTheme || "";
  const selectedSubTheme = input.selectedSubTheme || "";
  const needle = normalize(input.toCity);

  if (selectedTheme) {
    return {
      mode: "theme",
      route: `/themes/${slugify(selectedTheme)}`,
      query: {
        ...baseQuery,
        searchMode: "theme",
        destinationHint: input.toCity || "",
      },
      matchedBy: "theme",
    };
  }

  const { cityMatches, countryMatches, continentMatches, indiaMatches } =
    findMatches(input.toCity);

  if (cityMatches.length > 0) {
    const matchedCountry = pickCountryFromMatches(cityMatches);
    const matchedContinent = pickContinentFromMatches(cityMatches);
    const matchedCity = pickCityFromMatches(cityMatches, input.toCity);

    if (normalize(matchedCountry) === "india") {
      return {
        mode: "destination",
        route: `/holidays/results`,
        query: {
          ...baseQuery,
          searchMode: "destination",
          destinationKind: "india",
          matchedCity,
          matchedCountry,
          matchedContinent,
        },
        matchedBy: "city",
        matchedContinent,
        matchedCountry,
        matchedCity,
      };
    }

    return {
      mode: "destination",
      route: `/holidays/results`,
      query: {
        ...baseQuery,
        searchMode: "destination",
        destinationKind: "international",
        matchedCity,
        matchedCountry,
        matchedContinent,
      },
      matchedBy: "city",
      matchedContinent,
      matchedCountry,
      matchedCity,
    };
  }

  if (countryMatches.length > 0) {
    const matchedCountry = pickCountryFromMatches(countryMatches);
    const matchedContinent = pickContinentFromMatches(countryMatches);

    if (normalize(matchedCountry) === "india") {
      return {
        mode: "destination",
        route: `/holidays/results`,
        query: {
          ...baseQuery,
          searchMode: "destination",
          destinationKind: "india",
          matchedCountry,
          matchedContinent,
        },
        matchedBy: "india",
        matchedContinent,
        matchedCountry,
      };
    }

    return {
      mode: "destination",
      route: `/holidays/results`,
      query: {
        ...baseQuery,
        searchMode: "destination",
        destinationKind: "international",
        matchedCountry,
        matchedContinent,
      },
      matchedBy: "country",
      matchedContinent,
      matchedCountry,
    };
  }

  if (continentMatches.length > 0) {
    const matchedContinent = pickContinentFromMatches(continentMatches);

    return {
      mode: "destination",
      route: `/holidays/results`,
      query: {
        ...baseQuery,
        searchMode: "destination",
        destinationKind: "international",
        matchedContinent,
      },
      matchedBy: "continent",
      matchedContinent,
    };
  }

  if (needle) {
    return {
      mode: "destination",
      route: `/holidays/results`,
      query: {
        ...baseQuery,
        searchMode: "destination",
        destinationKind: "generic",
      },
      matchedBy: "generic",
    };
  }

  return {
    mode: "destination",
    route: `/holidays/results`,
    query: {
      ...baseQuery,
      searchMode: "destination",
      destinationKind: "generic",
    },
    matchedBy: "generic",
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