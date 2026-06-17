import { TIYA_SAVED_TRIPS_KEY } from "./plannerStorage";
import {
  MY_TRIPS_STORAGE_KEY,
  type MyTripSavedItem,
  type MyTripSnapshot,
} from "./myTripsStorage";
import type { TiyaPlannerSnapshot, TiyaTripIntent } from "./plannerTypes";

export const TIYA_MEMORY_PROFILE_KEY = "tpl_tiya_memory_profile";
export const TIYA_MEMORY_OBJECT_KEY = "tpl_tiya_memory_object_v1";

export type TiyaMemorySource = {
  id: string;
  label: string;
  count: number;
  detail: string;
};

export type TiyaMemoryTimelineItem = {
  id: string;
  title: string;
  type: string;
  detail: string;
  at: string;
};

export type TiyaTravelMemoryProfile = {
  preferredTransport: string;
  preferredStayStyle: string;
  preferredBudgetTier: string;
  preferredActivityStyle: string;
  preferredDestinationStyle: string;
  favouriteTravelStyles: string[];
  favouriteDestinations: string[];
  activityPreferencePattern: string[];
  creatorLocalMarketInterest: number;
  creatorInfluenceScore: number;
  localLifeInfluenceScore: number;
  savedSpotCounters: Record<string, number>;
  memorySources: TiyaMemorySource[];
  memoryTimeline: TiyaMemoryTimelineItem[];
  memoryImpact: {
    itineraryBias: string;
    budgetBias: string;
    stayBias: string;
    activityBias: string;
    recommendationBias: string;
  };
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
    preferredActivityStyle: intent.interests[0] || intent.travelStyle,
    preferredDestinationStyle: intent.travelStyle,
    favouriteTravelStyles: [intent.travelStyle],
    favouriteDestinations: [intent.toCity],
    activityPreferencePattern: intent.interests,
    creatorLocalMarketInterest:
      (intent.smartPreferences.includeCreatorSpots ? 45 : 0) +
      (intent.smartPreferences.includeLocalMarket ? 45 : 0),
    creatorInfluenceScore: intent.smartPreferences.includeCreatorSpots ? 58 : 24,
    localLifeInfluenceScore: intent.smartPreferences.includeLocalMarket ? 58 : 24,
    savedSpotCounters: {
      total: 0,
      creators: 0,
      localLife: 0,
      activities: 0,
      stays: 0,
      routes: 0,
    },
    memorySources: [
      {
        id: "current-intent",
        label: "Current Smart Planner intent",
        count: 1,
        detail: `${intent.fromCity} to ${intent.toCity}`,
      },
    ],
    memoryTimeline: [
      {
        id: "current-intent",
        title: "Current planning intent captured",
        type: "Intent",
        detail: `${intent.travelStyle} · ${intent.pace}`,
        at: new Date().toISOString(),
      },
    ],
    memoryImpact: {
      itineraryBias: "Use current trip intent as baseline.",
      budgetBias: intent.budgetTier,
      stayBias: intent.stayPreference,
      activityBias: intent.interests[0] || intent.travelStyle,
      recommendationBias: "No long-term saved behaviour yet.",
    },
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
  const myTrips = readJson<MyTripSnapshot[]>(MY_TRIPS_STORAGE_KEY, []);
  const safeMyTrips = Array.isArray(myTrips) ? myTrips : [];
  const workspaceBookmarks = safeMyTrips.flatMap((trip) =>
    Array.isArray(trip.savedItems) ? trip.savedItems : []
  );
  const creatorSaves = workspaceBookmarks.filter((item) => item.type === "Creators");
  const localLifeSaves = workspaceBookmarks.filter((item) => item.type === "Local Life");
  const activitySaves = workspaceBookmarks.filter((item) => item.type === "Activities");
  const staySaves = workspaceBookmarks.filter((item) => item.type === "Stays");
  const routeSaves = workspaceBookmarks.filter(
    (item) => item.type === "Routes" || item.type === "Expedition Strategies"
  );
  const savedIntents = safeTrips
    .map((trip) => trip.intent)
    .filter(Boolean) as TiyaTripIntent[];
  const myTripIntents = safeMyTrips
    .map((trip) => trip.workspacePayload?.tripIntent)
    .filter(Boolean) as TiyaTripIntent[];
  const intentHistory = [intent, ...savedIntents, ...myTripIntents].slice(0, 24);
  const styles = intentHistory.map((tripIntent) => tripIntent.travelStyle);
  const destinations = intentHistory.map((tripIntent) => tripIntent.toCity);
  const interests = intentHistory.flatMap((tripIntent) =>
    Array.isArray(tripIntent.interests) ? tripIntent.interests : []
  );
  const savedCategories = workspaceBookmarks.flatMap((item) =>
    [item.category, item.type, item.sourceModule].filter(Boolean) as string[]
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

  const savedSpotCounters = {
    total: workspaceBookmarks.length,
    creators: creatorSaves.length,
    localLife: localLifeSaves.length,
    activities: activitySaves.length,
    stays: staySaves.length,
    routes: routeSaves.length,
  };
  const creatorInfluenceScore = Math.min(
    98,
    Math.round(
      (creatorSaves.length * 18 + creatorMarketHits * 10 + (intent.smartPreferences.includeCreatorSpots ? 16 : 0)) /
        Math.max(1, safeMyTrips.length + 1)
    )
  );
  const localLifeInfluenceScore = Math.min(
    98,
    Math.round(
      (localLifeSaves.length * 16 + creatorMarketHits * 8 + (intent.smartPreferences.includeLocalMarket ? 18 : 0)) /
        Math.max(1, safeMyTrips.length + 1)
    )
  );
  const memorySources: TiyaMemorySource[] = [
    {
      id: "my-trips",
      label: "My Trips",
      count: safeMyTrips.length,
      detail: `${safeMyTrips.length} account trip draft${safeMyTrips.length === 1 ? "" : "s"} analysed`,
    },
    {
      id: "saved-itineraries",
      label: "Saved Itineraries",
      count: safeTrips.length,
      detail: `${safeTrips.length} Smart Planner saved itinerary snapshot${safeTrips.length === 1 ? "" : "s"}`,
    },
    {
      id: "workspace-bookmarks",
      label: "Workspace Bookmarks",
      count: workspaceBookmarks.length,
      detail: `${workspaceBookmarks.length} saved item${workspaceBookmarks.length === 1 ? "" : "s"} from modules`,
    },
    {
      id: "creator-saves",
      label: "Creator Saves",
      count: creatorSaves.length,
      detail: `${creatorSaves.length} creator bookmark${creatorSaves.length === 1 ? "" : "s"}`,
    },
    {
      id: "local-life-saves",
      label: "Local Life Saves",
      count: localLifeSaves.length,
      detail: `${localLifeSaves.length} Local Life bookmark${localLifeSaves.length === 1 ? "" : "s"}`,
    },
  ];
  const memoryTimeline: TiyaMemoryTimelineItem[] = [
    ...safeMyTrips.map((trip) => ({
      id: `trip-${trip.id}`,
      title: trip.tripName,
      type: "My Trip",
      detail: `${trip.origin} to ${trip.destination} · ${trip.status}`,
      at: trip.updatedAt,
    })),
    ...workspaceBookmarks.map((item: MyTripSavedItem) => ({
      id: `bookmark-${item.id}`,
      title: item.title,
      type: item.type,
      detail: `${item.sourceModule} · ${item.city || item.destination || "Trip"}`,
      at: item.savedAt,
    })),
    ...safeTrips.map((trip) => ({
      id: `saved-itinerary-${trip.tripId || trip.savedAt}`,
      title: trip.tripName,
      type: "Saved Itinerary",
      detail: `${trip.intent.fromCity} to ${trip.intent.toCity}`,
      at: trip.savedAt || trip.intent.startDate || new Date().toISOString(),
    })),
  ]
    .filter((item) => item.at)
    .sort((a, b) => String(b.at).localeCompare(String(a.at)))
    .slice(0, 10);
  const preferredActivityStyle = topValue(
    [...interests, ...savedCategories],
    intent.interests[0] || intent.travelStyle
  );
  const preferredDestinationStyle = topValue(styles, intent.travelStyle);
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
    preferredActivityStyle,
    preferredDestinationStyle,
    favouriteTravelStyles: topValues(styles, [intent.travelStyle]),
    favouriteDestinations: topValues(destinations, [intent.toCity]),
    activityPreferencePattern: topValues(interests, intent.interests),
    creatorLocalMarketInterest: Math.min(
      96,
      Math.round(
        ((creatorMarketHits + creatorSaves.length + localLifeSaves.length) /
          Math.max(1, intentHistory.length + workspaceBookmarks.length)) *
          100
      )
    ),
    creatorInfluenceScore,
    localLifeInfluenceScore,
    savedSpotCounters,
    memorySources,
    memoryTimeline,
    memoryImpact: {
      itineraryBias:
        comfortHits > adventureHits
          ? "Bias future itineraries toward recovery windows and comfort pacing."
          : adventureHits > comfortHits
            ? "Bias future itineraries toward terrain, scenic movement and active days."
            : "Keep future itineraries balanced between movement and recovery.",
      budgetBias: topValue(
        intentHistory.map((tripIntent) => tripIntent.budgetTier),
        intent.budgetTier
      ),
      stayBias: topValue(
        intentHistory.map((tripIntent) => tripIntent.stayPreference),
        intent.stayPreference
      ),
      activityBias: preferredActivityStyle,
      recommendationBias:
        creatorInfluenceScore >= localLifeInfluenceScore
          ? "Prioritize creator-fit route opportunities in recommendations."
          : "Prioritize Local Life and local commerce recommendations.",
    },
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
  writeJson(TIYA_MEMORY_OBJECT_KEY, profile);
  return profile;
}
