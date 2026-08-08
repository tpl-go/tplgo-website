import type { Airport } from "@/app/components/flight/utils";
import { tplApiRequest } from "./tplApiClient";

type BackendLocationResult = {
  iataCode?: string;
  code?: string;
  name?: string;
  city?: string;
  country?: string;
  aliases?: string[];
  popularRank?: number;
};

type BackendLocationSearchResponse = {
  results: BackendLocationResult[];
};

export async function searchBackendAirports(query: string, limit = 10): Promise<Airport[]> {
  const params = new URLSearchParams({
    type: "airport",
    limit: String(limit),
  });
  const normalizedQuery = query.trim();
  if (normalizedQuery.length >= 2) {
    params.set("q", normalizedQuery);
  } else {
    params.set("popular", "true");
  }

  const result = await tplApiRequest<BackendLocationSearchResponse>(`/api/v1/locations/airports?${params.toString()}`, {
    method: "GET",
    fallbackOnError: false,
  });

  if (!result.ok || !Array.isArray(result.data.results)) return [];

  return result.data.results
    .map((item) => ({
      code: String(item.iataCode || item.code || "").trim().toUpperCase(),
      city: String(item.city || item.name || "").trim(),
      name: String(item.name || item.city || "").trim(),
      country: String(item.country || "").trim(),
      aliases: Array.isArray(item.aliases) ? item.aliases.filter((alias): alias is string => typeof alias === "string") : [],
      ...(typeof item.popularRank === "number" ? { popularRank: item.popularRank } : {}),
    }))
    .filter((item) => item.code && item.city && item.name);
}
