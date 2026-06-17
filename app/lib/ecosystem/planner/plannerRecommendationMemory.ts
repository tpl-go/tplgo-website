import type { TiyaTravelMemoryProfile } from "./plannerMemoryEngine";
import type { TiyaTripIntent } from "./plannerTypes";

export type TiyaMemoryRecommendation = {
  id: string;
  title: string;
  detail: string;
  category: "Destination" | "Season" | "Route" | "Stay" | "Activity" | "Creator" | "Market";
  fitScore: number;
};

export function generateMemoryRecommendations({
  intent,
  profile,
}: {
  intent: TiyaTripIntent;
  profile: TiyaTravelMemoryProfile;
}): TiyaMemoryRecommendation[] {
  const activities = Array.isArray(profile.activityPreferencePattern)
    ? profile.activityPreferencePattern
    : [];
  const destinations = Array.isArray(profile.favouriteDestinations)
    ? profile.favouriteDestinations
    : [];
  const recommendations: TiyaMemoryRecommendation[] = [
    {
      id: "repeat-cluster",
      title: `Explore nearby ${intent.toCity} cluster`,
      detail: "Continue this trip style with a nearby regional route instead of starting from scratch.",
      category: "Destination",
      fitScore: 86,
    },
    {
      id: "seasonal-revisit",
      title: `${profile.seasonalPreference} revisit suggestion`,
      detail: `Your memory profile leans toward ${profile.seasonalPreference.toLowerCase()} planning windows.`,
      category: "Season",
      fitScore: 78,
    },
    {
      id: "preferred-route",
      title: `${profile.routePreference} recommended`,
      detail: "Tiya can keep future routes aligned with your saved route tendency.",
      category: "Route",
      fitScore: profile.routePreference === "Scenic routes" ? 91 : 74,
    },
    {
      id: "stay-mix",
      title: `${profile.preferredStayStyle} stay mix`,
      detail: `Future plans can default to ${profile.preferredStayStyle.toLowerCase()} stays with budget-aware alternates.`,
      category: "Stay",
      fitScore: 82,
    },
  ];

  if (activities.includes("Food") || activities.includes("Culture")) {
    recommendations.push({
      id: "food-creator",
      title: "Food + creator route recommended",
      detail: "Your activity pattern supports creator-led food and culture stops.",
      category: "Creator",
      fitScore: 88,
    });
  }

  if (activities.includes("Temples") || profile.favouriteTravelStyles.includes("Spiritual")) {
    recommendations.push({
      id: "spiritual-mountain",
      title: "Try a spiritual mountain circuit",
      detail: "Spiritual interests and scenic route memory fit a slower mountain circuit.",
      category: "Activity",
      fitScore: 84,
    });
  }

  if (profile.preferredBudgetTier === "Luxury" || profile.favouriteTravelStyles.includes("Luxury")) {
    recommendations.push({
      id: "luxury-kerala",
      title: "Luxury Kerala route matches your style",
      detail: "Premium stay mix, relaxed pacing and coastal experiences fit your memory profile.",
      category: "Destination",
      fitScore: 89,
    });
  }

  if (profile.creatorLocalMarketInterest >= 55 || activities.includes("Local Market")) {
    recommendations.push({
      id: "market-discovery",
      title: "Local market continuity route",
      detail: "Add destination-linked products and creator-recommended market stops to future plans.",
      category: "Market",
      fitScore: profile.creatorLocalMarketInterest,
    });
  }

  if (
    profile.comfortAdventureTendency === "Adventure" ||
    intent.transportMode === "Bike" ||
    activities.includes("Trekking")
  ) {
    recommendations.push({
      id: "himachal-road",
      title: "Scenic Himachal road expedition suggested",
      detail: "Adventure and scenic memory fit a staged Manali to Sissu style route.",
      category: "Route",
      fitScore: 87,
    });
  }

  if (destinations[0]) {
    recommendations.push({
      id: "saved-destination",
      title: `Revisit ${destinations[0]} with a smarter season`,
      detail: "Use saved destination memory to plan a better weather and comfort window.",
      category: "Season",
      fitScore: 80,
    });
  }

  return recommendations.slice(0, 8);
}

export function generateTripContinuitySuggestions({
  intent,
  profile,
}: {
  intent: TiyaTripIntent;
  profile: TiyaTravelMemoryProfile;
}) {
  return [
    `Continue a similar ${profile.averageTripIntensity.toLowerCase()} ${intent.travelStyle.toLowerCase()} trip.`,
    `Explore a nearby destination cluster around ${intent.toCity}.`,
    `Use ${profile.preferredStayStyle.toLowerCase()} stays as the default mix.`,
    profile.creatorLocalMarketInterest >= 55
      ? "Add creator-driven discovery and Local Life stops."
      : "Add one signature activity based on your saved interests.",
  ];
}
