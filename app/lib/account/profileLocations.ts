import { getStoredAuthToken, tplApiRequest } from "@/app/lib/api/tplApiClient";

export type ProfileLocationOption = { value: string; label: string; detail?: string };
export const PROFILE_LOCATION_FALLBACK_VERSION = "manual-fallback";

export async function loadProfileLocations(level: "countries" | "regions" | "cities", country = "", region = "") {
  const query = new URLSearchParams({ level });
  if (country) query.set("country", country);
  if (region) query.set("region", region);
  const result = await tplApiRequest<{ version: string; options: ProfileLocationOption[] }>(`/api/v1/reference/profile-locations?${query}`, { authToken: getStoredAuthToken(), fallbackOnError: false });
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}
