import { findDestinationInRegistry } from "./holidayDestinationRegistry";

function toQueryString(params: Record<string, string>) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "") {
      search.set(key, value);
    }
  });

  return search.toString();
}

export function buildPopularDestinationUrl(input: {
  destinationLabel: string;
  origin?: string;
  date?: string;
  adults?: number;
  children?: number;
  rooms?: number;
}) {
  const hit = findDestinationInRegistry(input.destinationLabel);

  const baseParams = {
    origin: input.origin || "Delhi",
    toCity: input.destinationLabel || "",
    date: input.date || "",
    adults: String(Math.max(input.adults || 2, 1)),
    children: String(Math.max(input.children || 0, 0)),
    rooms: String(Math.max(input.rooms || 1, 1)),
    searchMode: "destination",
  };

  if (!hit) {
    return `/continent/asia?${toQueryString({
      ...baseParams,
      destinationKind: "generic",
    })}`;
  }

  if (hit.country === "India" || hit.indiaGroup) {
    return `/popular/india?${toQueryString({
      ...baseParams,
      destinationKind: "india",
      matchedCountry: hit.label,
      matchedContinent: hit.continent || "asia",
    })}`;
  }

  return `/continent/${hit.continent || "asia"}?${toQueryString({
    ...baseParams,
    destinationKind: "international",
    matchedCountry: hit.label,
    matchedContinent: hit.continent || "asia",
  })}`;
}