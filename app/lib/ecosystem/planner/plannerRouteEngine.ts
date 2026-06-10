import type { TiyaRouteOption, TiyaTripIntent } from "./plannerTypes";
import { getCustomCityRouteProfile } from "./plannerCityData";

const roadModes = ["Bike", "Self-drive Car", "EV", "Cab"];

function clamp(score: number) {
  return Math.max(38, Math.min(98, Math.round(score)));
}

function getBaseDistance(intent: TiyaTripIntent) {
  const text = `${intent.fromCity} ${intent.toCity}`.toLowerCase();
  const originProfile = getCustomCityRouteProfile(intent.fromCity);
  const destinationProfile = getCustomCityRouteProfile(intent.toCity);
  const profileDistance =
    180 +
    Math.abs(destinationProfile.routeWeight - originProfile.routeWeight) * 92 +
    Math.round((originProfile.routeWeight + destinationProfile.routeWeight) * 13);

  if (text.includes("ladakh")) return 980;
  if (text.includes("kerala")) return 420;
  if (text.includes("uttarakhand")) return 310;
  if (text.includes("himachal")) return 540;
  if (text.includes("goa")) return 590;
  if (text.includes("jaipur")) return 285;

  return roadModes.includes(intent.transportMode)
    ? Math.max(260, profileDistance)
    : Math.max(180, Math.round(profileDistance * 0.72));
}

function routeStyleFor(intent: TiyaTripIntent, routeName: string) {
  if (roadModes.includes(intent.transportMode)) {
    return `${intent.transportMode} road intelligence`;
  }

  if (intent.transportMode === "Flight") {
    return "Airport + local transfer route";
  }

  if (intent.transportMode === "Train") {
    return "Rail + cab connection route";
  }

  if (intent.transportMode === "Mixed Mode") {
    return "Multi-modal route stack";
  }

  return `${intent.transportMode} route stack for ${routeName}`;
}

function getRecommendedRouteId(intent: TiyaTripIntent): TiyaRouteOption["id"] {
  if (intent.smartPreferences.preferScenicRoute) return "scenic";
  if (intent.travelStyle === "Adventure" || intent.interests.includes("Trekking")) return "adventure";
  if (intent.budgetTier === "Economy") return "budget";
  if (intent.pace === "Packed" || intent.transportMode === "Flight") return "fastest";

  return "scenic";
}

function getSafetyNote(intent: TiyaTripIntent, baseNote: string) {
  if (intent.smartPreferences.avoidNightTravel) {
    return `${baseNote} Daylight movement prioritised; night travel avoided.`;
  }

  return baseNote;
}

export function generatePlannerRouteOptions(intent: TiyaTripIntent): TiyaRouteOption[] {
  const recommendedId = getRecommendedRouteId(intent);
  const baseDistance = getBaseDistance(intent);
  const roadTrip = roadModes.includes(intent.transportMode);
  const scenicBoost = intent.smartPreferences.preferScenicRoute ? 9 : 0;
  const adventureBoost =
    intent.travelStyle === "Adventure" || intent.interests.includes("Trekking")
      ? 10
      : 0;
  const daylightSafety = intent.smartPreferences.avoidNightTravel ? 8 : 0;
  const origin = intent.fromCity || "Origin";
  const destination = intent.toCity || "Destination";
  const originProfile = getCustomCityRouteProfile(origin);
  const destinationProfile = getCustomCityRouteProfile(destination);
  const scenicAffinity = Math.round(
    (originProfile.scenicBias + destinationProfile.scenicBias) / 2
  );
  const comfortAffinity = Math.round(
    (originProfile.comfortBias + destinationProfile.comfortBias) / 2
  );
  const distancePressure = baseDistance > 760 ? -8 : baseDistance > 520 ? -4 : 3;

  const routeOptions: Array<Omit<TiyaRouteOption, "isRecommended">> = [
    {
      id: "fastest",
      name: "Fastest Route",
      distance: roadTrip ? `${baseDistance} km` : `${Math.max(80, Math.round(baseDistance * 0.42))} km local`,
      duration:
        intent.transportMode === "Flight"
          ? "4h 20m total"
          : roadTrip
            ? `${Math.max(5, Math.round(baseDistance / 72))}h drive`
            : "6h 10m total",
      difficulty: roadTrip ? "Moderate" : "Low",
      scenicScore: clamp(48 + Math.round(scenicAffinity * 0.26) + scenicBoost + (roadTrip ? 6 : 0)),
      comfortScore: clamp(58 + Math.round(comfortAffinity * 0.34) + (intent.budgetTier === "Luxury" ? 8 : 0) + distancePressure),
      budgetFit: clamp(70 + (baseDistance < 420 ? 8 : -4) + (intent.budgetTier === "Premium" ? 8 : 0)),
      riskLevel: daylightSafety ? "Low" : "Medium",
      note: getSafetyNote(intent, `${origin} to ${destination} using the shortest reliable transfer chain.`),
      bestFor: "Time-sensitive travellers",
      routeStyle: routeStyleFor(intent, "fastest"),
    },
    {
      id: "scenic",
      name: "Scenic Route",
      distance: `${Math.round(baseDistance * 1.16)} km`,
      duration: roadTrip ? `${Math.max(7, Math.round(baseDistance / 58))}h with stops` : "5h 40m with local loop",
      difficulty: roadTrip ? "Moderate" : "Low",
      scenicScore: clamp(60 + Math.round(scenicAffinity * 0.36) + scenicBoost + (intent.interests.includes("Nature") ? 6 : 0)),
      comfortScore: clamp(50 + Math.round(comfortAffinity * 0.32) + (intent.pace === "Relaxed" ? 10 : 0) + distancePressure),
      budgetFit: clamp(72 + (baseDistance < 520 ? 5 : -6) - (intent.budgetTier === "Economy" ? 4 : 0)),
      riskLevel: "Low",
      note: getSafetyNote(intent, "Viewpoints, softer halts and weather-aware buffers included."),
      bestFor: "Views and creator-friendly stops",
      routeStyle: routeStyleFor(intent, "scenic"),
    },
    {
      id: "budget",
      name: "Budget Route",
      distance: roadTrip ? `${Math.round(baseDistance * 0.98)} km` : `${Math.round(baseDistance * 0.5)} km local`,
      duration:
        intent.transportMode === "Train"
          ? "7h rail + cab"
          : roadTrip
            ? `${Math.max(6, Math.round(baseDistance / 62))}h planned`
            : "6h 45m total",
      difficulty: "Easy",
      scenicScore: clamp(48 + Math.round(scenicAffinity * 0.24) + scenicBoost),
      comfortScore: clamp(44 + Math.round(comfortAffinity * 0.32) + (intent.stayPreference === "Hostel" ? -4 : 4) + distancePressure),
      budgetFit: clamp(82 + (baseDistance < 520 ? 8 : 0) + (intent.budgetTier === "Economy" ? 8 : 0)),
      riskLevel: daylightSafety ? "Low" : "Medium",
      note: getSafetyNote(intent, "Keeps transfers efficient and avoids premium route add-ons."),
      bestFor: "Value-focused planning",
      routeStyle: routeStyleFor(intent, "budget"),
    },
    {
      id: "adventure",
      name: "Adventure Route",
      distance: `${Math.round(baseDistance * 1.28)} km`,
      duration: roadTrip ? `${Math.max(8, Math.round(baseDistance / 52))}h staged` : "Full-day mixed route",
      difficulty: adventureBoost ? "High" : "Medium",
      scenicScore: clamp(58 + Math.round(scenicAffinity * 0.32) + adventureBoost + scenicBoost),
      comfortScore: clamp(42 + Math.round(comfortAffinity * 0.22) + (intent.pace === "Relaxed" ? 5 : 0) + distancePressure),
      budgetFit: clamp(58 + (baseDistance < 520 ? 6 : -3) + (intent.budgetTier === "Premium" ? 8 : 0)),
      riskLevel: roadTrip || adventureBoost ? "High" : "Medium",
      note: getSafetyNote(intent, "Adds high-energy detours, terrain-aware timing and permit/weather checks."),
      bestFor: "Explorers and road-trip groups",
      routeStyle: routeStyleFor(intent, "adventure"),
    },
  ];

  return routeOptions.map((option) => ({
    ...option,
    isRecommended: option.id === recommendedId,
  }));
}
