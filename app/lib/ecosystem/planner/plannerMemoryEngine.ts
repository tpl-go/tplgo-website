import { TIYA_SAVED_TRIPS_KEY } from "./plannerStorage";
import type { TiyaPlannerSnapshot, TiyaTripIntent } from "./plannerTypes";

export const TIYA_MEMORY_PROFILE_KEY = "tpl_tiya_memory_profile";

export type TiyaTravelMemoryProfile = {
  preferredTransport: string;
  preferredStayStyle: string;
  preferredBudgetTier: string;
  favouriteTravelStyles: string[];
  favouriteDestinations: string[];
  activityPreferencePattern: string[];
  creatorLocalMarketInterest: number;
  comfortAdventureTendency: "Comfort" | "Balanced" | "Adventure";
  routePreference: string;
  seasonalPreference: string;
  averageTripIntensity: string;
  tripCount: number;
  updatedAt: string;
};

function canUseStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can fail in private mode, quota limits, or locked-down browsers.
  }
}

function topValue(values: string[], fallback: string) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    if (!value) return acc;
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
  const [winner] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] ?? [];
  return winner || fallback;
}

function topValues(values: string[], fallback: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    if (!value) return acc;
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});

  const winners = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([value]) => value);

  return winners.length ? winners : fallback;
}

function getSeason(intent: TiyaTripIntent) {
  const month = Number(intent.startDate?.slice(5, 7));
  if ([12, 1, 2].includes(month)) return "Winter";
  if ([3, 4, 5].includes(month)) return "Spring/Summer";
  if ([6, 7, 8, 9].includes(month)) return "Monsoon";
  return "Autumn";
}

function emptyProfile(intent: TiyaTripIntent): TiyaTravelMemoryProfile {
  return {
    preferredTransport: intent.transportMode,
    preferredStayStyle: intent.stayPreference,
    preferredBudgetTier: intent.budgetTier,
    favouriteTravelStyles: [intent.travelStyle],
    favouriteDestinations: [intent.toCity],
    activityPreferencePattern: intent.interests,
    creatorLocalMarketInterest:
      (intent.smartPreferences.includeCreatorSpots ? 45 : 0) +
      (intent.smartPreferences.includeLocalMarket ? 45 : 0),
    comfortAdventureTendency:
      intent.travelStyle === "Adventure" || intent.interests.includes("Trekking")
        ? "Adventure"
        : intent.travelStyle === "Luxury" ||
            intent.travelStyle === "Family" ||
            intent.seniors > 0
          ? "Comfort"
          : "Balanced",
    routePreference: intent.smartPreferences.preferScenicRoute
      ? "Scenic routes"
      : intent.transportMode,
    seasonalPreference: getSeason(intent),
    averageTripIntensity: intent.pace,
    tripCount: 1,
    updatedAt: new Date().toISOString(),
  };
}

export function loadPlannerMemoryProfile(intent: TiyaTripIntent) {
  return readJson<TiyaTravelMemoryProfile>(
    TIYA_MEMORY_PROFILE_KEY,
    emptyProfile(intent)
  );
}

export function buildPlannerMemoryProfile(intent: TiyaTripIntent) {
  const savedTrips = readJson<TiyaPlannerSnapshot[]>(TIYA_SAVED_TRIPS_KEY, []);
  const safeTrips = Array.isArray(savedTrips) ? savedTrips : [];
  const savedIntents = safeTrips
    .map((trip) => trip.intent)
    .filter(Boolean) as TiyaTripIntent[];
  const intentHistory = [intent, ...savedIntents].slice(0, 16);
  const styles = intentHistory.map((tripIntent) => tripIntent.travelStyle);
  const destinations = intentHistory.map((tripIntent) => tripIntent.toCity);
  const interests = intentHistory.flatMap((tripIntent) =>
    Array.isArray(tripIntent.interests) ? tripIntent.interests : []
  );
  const creatorMarketHits = intentHistory.filter(
    (tripIntent) =>
      tripIntent.smartPreferences.includeCreatorSpots ||
      tripIntent.smartPreferences.includeLocalMarket ||
      tripIntent.interests.includes("Local Market") ||
      tripIntent.interests.includes("Creator Spots")
  ).length;
  const adventureHits = intentHistory.filter(
    (tripIntent) =>
      tripIntent.travelStyle === "Adventure" ||
      tripIntent.transportMode === "Bike" ||
      tripIntent.interests.includes("Trekking")
  ).length;
  const comfortHits = intentHistory.filter(
    (tripIntent) =>
      tripIntent.travelStyle === "Luxury" ||
      tripIntent.travelStyle === "Family" ||
      tripIntent.seniors > 0 ||
      tripIntent.pace === "Relaxed"
  ).length;

  const profile: TiyaTravelMemoryProfile = {
    preferredTransport: topValue(
      intentHistory.map((tripIntent) => tripIntent.transportMode),
      intent.transportMode
    ),
    preferredStayStyle: topValue(
      intentHistory.map((tripIntent) => tripIntent.stayPreference),
      intent.stayPreference
    ),
    preferredBudgetTier: topValue(
      intentHistory.map((tripIntent) => tripIntent.budgetTier),
      intent.budgetTier
    ),
    favouriteTravelStyles: topValues(styles, [intent.travelStyle]),
    favouriteDestinations: topValues(destinations, [intent.toCity]),
    activityPreferencePattern: topValues(interests, intent.interests),
    creatorLocalMarketInterest: Math.min(
      96,
      Math.round((creatorMarketHits / Math.max(1, intentHistory.length)) * 100)
    ),
    comfortAdventureTendency:
      adventureHits > comfortHits
        ? "Adventure"
        : comfortHits > adventureHits
          ? "Comfort"
          : "Balanced",
    routePreference: intentHistory.filter(
      (tripIntent) => tripIntent.smartPreferences.preferScenicRoute
    ).length >=
      Math.max(1, Math.round(intentHistory.length / 2))
      ? "Scenic routes"
      : topValue(
          intentHistory.map((tripIntent) => tripIntent.transportMode),
          intent.transportMode
        ),
    seasonalPreference: topValue(
      intentHistory.map((tripIntent) => getSeason(tripIntent)),
      getSeason(intent)
    ),
    averageTripIntensity: topValue(
      intentHistory.map((tripIntent) => tripIntent.pace),
      intent.pace
    ),
    tripCount: intentHistory.length,
    updatedAt: new Date().toISOString(),
  };

  writeJson(TIYA_MEMORY_PROFILE_KEY, profile);
  return profile;
}
