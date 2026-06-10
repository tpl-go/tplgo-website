import type {
  TiyaAIRecommendation,
  TiyaRouteOption,
  TiyaTripIntent,
} from "./plannerTypes";

export function generatePlannerRecommendations(args: {
  intent: TiyaTripIntent;
  selectedRoute?: TiyaRouteOption;
}): TiyaAIRecommendation[] {
  const recommendations: TiyaAIRecommendation[] = [];

  if (args.intent.pace === "Packed") {
    recommendations.push({
      id: "rest-day",
      title: "Add one extra rest window",
      detail: "Packed pacing benefits from one softer evening or late-start morning.",
      impact: "Lower intensity",
    });
  }

  if (!args.intent.smartPreferences.preferScenicRoute) {
    recommendations.push({
      id: "scenic-stop",
      title: "Add a scenic stop",
      detail: "A short viewpoint stop will improve route quality without changing the full plan.",
      impact: "Higher scenic score",
    });
  }

  if (args.selectedRoute?.id !== "scenic" && args.intent.interests.includes("Nature")) {
    recommendations.push({
      id: "better-route",
      title: "Compare Scenic Route",
      detail: "Nature-led interests have stronger fit with the scenic route option.",
      impact: "Better route fit",
    });
  }

  if (!args.intent.smartPreferences.includeInsurance) {
    recommendations.push({
      id: "insurance",
      title: "Add insurance",
      detail: "Insurance improves readiness for weather, delays and route changes.",
      impact: "Higher readiness",
    });
  }

  if (args.intent.budgetTier !== "Luxury" && args.intent.travelStyle === "Luxury") {
    recommendations.push({
      id: "upgrade-stay",
      title: "Upgrade stay band",
      detail: "Luxury style is currently stronger than the selected budget tier.",
      impact: "Better comfort",
    });
  }

  if (args.intent.smartPreferences.includeCreatorSpots) {
    recommendations.push({
      id: "creator-route",
      title: "Explore creator route",
      detail: "Creator spots can be grouped into one low-friction reel-friendly stretch.",
      impact: "Better creator fit",
    });
  }

  if (args.intent.smartPreferences.includeLocalMarket) {
    recommendations.push({
      id: "market-stop",
      title: "Add local market stop",
      detail: "Market picks are already matched; add one dedicated stop to the timeline.",
      impact: "Higher ecosystem value",
    });
  }

  return recommendations.slice(0, 6);
}
