import type {
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";

import type {
  SmartBuildPreferences,
  WorkspacePreferences,
} from "./workspaceTypes";

function normalizePace(value: string): TiyaTripIntent["pace"] {
  if (value === "Relaxed" || value === "Packed") return value;
  return "Balanced";
}

export function buildWorkspaceTripIntent({
  fromCity,
  toCity,
  selectedRoute,
  preferences,
  smartBuildPreferences,
  sourceIntent,
}: {
  fromCity: string;
  toCity: string;
  selectedRoute: TiyaRouteOption;
  preferences: WorkspacePreferences;
  smartBuildPreferences: SmartBuildPreferences;
  sourceIntent?: TiyaTripIntent;
}): TiyaTripIntent {
  const budgetTier =
    preferences.comfortLevel === "Luxury"
      ? "Luxury"
      : preferences.comfortLevel === "Economy"
        ? "Economy"
        : preferences.comfortLevel === "Standard"
          ? "Standard"
          : "Premium";

  return {
    fromCity: sourceIntent?.fromCity || fromCity || "",
    toCity: sourceIntent?.toCity || toCity || "",
    startDate: sourceIntent?.startDate || "",
    endDate: sourceIntent?.endDate || "",
    tripType: sourceIntent?.tripType || "Round trip",
    transportMode: preferences.transportMode,
    stayPreference: preferences.stayPreference,
    budgetTier,
    customBudgetAmount: sourceIntent?.customBudgetAmount || "",
    adults: sourceIntent?.adults || 1,
    children: sourceIntent?.children || 0,
    seniors: sourceIntent?.seniors || 0,
    pets: Boolean(sourceIntent?.pets),
    travelStyle:
      selectedRoute.id === "adventure"
        ? "Adventure"
        : selectedRoute.id === "scenic"
          ? sourceIntent?.travelStyle || "Nature"
        : selectedRoute.id === "budget"
            ? sourceIntent?.travelStyle || "Budget"
            : sourceIntent?.travelStyle || "Couple",
    pace: normalizePace(preferences.pace),
    interests: preferences.interests,
    smartPreferences: {
      includeStays: true,
      includeLocalMarket: Boolean(smartBuildPreferences.localMarket),
      includeCreatorSpots: Boolean(smartBuildPreferences.creatorSpots),
      includeInsurance: true,
      avoidNightTravel: Boolean(smartBuildPreferences.weatherSafe),
      preferScenicRoute: selectedRoute.id === "scenic",
    },
  };
}
