import type {
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "./plannerTypes";

export type TiyaScenarioId =
  | "fastest"
  | "scenic"
  | "budget"
  | "luxury"
  | "family-safe"
  | "adventure";

export type TiyaRouteScenario = {
  id: TiyaScenarioId;
  name: string;
  routeSummary: string;
  estimatedDuration: string;
  estimatedCost: number;
  comfortScore: number;
  scenicScore: number;
  difficultyScore: number;
  safetyScore: number;
  bestFor: string;
  tradeOffNote: string;
  isRecommended: boolean;
  appliesRouteId?: TiyaRouteOption["id"];
};

const scenarioRouteMap: Record<TiyaScenarioId, TiyaRouteOption["id"]> = {
  fastest: "fastest",
  scenic: "scenic",
  budget: "budget",
  luxury: "fastest",
  "family-safe": "scenic",
  adventure: "adventure",
};

function clampScore(value: number) {
  return Math.max(35, Math.min(98, Math.round(value)));
}

function getBudgetMultiplier(intent: TiyaTripIntent) {
  if (intent.budgetTier === "Luxury" || intent.travelStyle === "Luxury") {
    return 1.45;
  }

  if (intent.budgetTier === "Premium") return 1.18;
  if (intent.budgetTier === "Economy") return 0.72;

  return 1;
}

function getTransportMultiplier(transportMode: string) {
  if (transportMode === "Flight") return 1.24;
  if (transportMode === "EV") return 0.82;
  if (transportMode.includes("Bike")) return 0.74;
  if (transportMode.includes("Self-drive")) return 0.92;
  if (transportMode === "Train" || transportMode === "Bus") return 0.68;

  return 1;
}

function getRecommendationId(intent: TiyaTripIntent): TiyaScenarioId {
  const interests = Array.isArray(intent.interests) ? intent.interests : [];

  if (intent.smartPreferences.preferScenicRoute) return "scenic";
  if (intent.travelStyle === "Family") return "family-safe";
  if (intent.budgetTier === "Economy") return "budget";
  if (
    intent.travelStyle === "Adventure" ||
    intent.transportMode === "Bike" ||
    intent.transportMode === "Self-drive Car" ||
    interests.includes("Trekking")
  ) {
    return "adventure";
  }
  if (intent.budgetTier === "Luxury" || intent.travelStyle === "Luxury") {
    return "luxury";
  }
  if (intent.transportMode === "Flight") return "fastest";

  return "scenic";
}

function findRoute(plan: TiyaGeneratedPlan, routeId: TiyaRouteOption["id"]) {
  return plan.routeOptions.find((route) => route.id === routeId);
}

export function generatePlannerScenarios(
  intent: TiyaTripIntent,
  plan: TiyaGeneratedPlan
): TiyaRouteScenario[] {
  const recommendationId = getRecommendationId(intent);
  const baseCost =
    plan.totalBudget ||
    (plan.nights || 4) *
      Math.max(1, plan.travellerCount || 1) *
      7200 *
      getBudgetMultiplier(intent);
  const transportMultiplier = getTransportMultiplier(intent.transportMode);
  const routeLine = `${intent.fromCity} → ${intent.toCity}`;
  const avoidNightTravel = intent.smartPreferences.avoidNightTravel;
  const localMarket = intent.smartPreferences.includeLocalMarket;

  const definitions: Array<{
    id: TiyaScenarioId;
    name: string;
    cost: number;
    comfort: number;
    scenic: number;
    difficulty: number;
    safety: number;
    bestFor: string;
    tradeOff: string;
  }> = [
    {
      id: "fastest",
      name: "Fastest Route",
      cost: baseCost * 1.08 * transportMultiplier,
      comfort: intent.transportMode === "Flight" ? 88 : 78,
      scenic: 62,
      difficulty: 38,
      safety: avoidNightTravel ? 84 : 76,
      bestFor: "short travel windows",
      tradeOff: "Less time for scenic breaks and local discovery.",
    },
    {
      id: "scenic",
      name: "Scenic Route",
      cost: baseCost * 1.05,
      comfort: 78,
      scenic: intent.smartPreferences.preferScenicRoute ? 96 : 90,
      difficulty: intent.pace === "Packed" ? 66 : 52,
      safety: avoidNightTravel ? 86 : 78,
      bestFor: "creator stops and memorable views",
      tradeOff: "Adds buffer time for viewpoints and slower segments.",
    },
    {
      id: "budget",
      name: "Budget Route",
      cost: baseCost * 0.72 * transportMultiplier,
      comfort: intent.budgetTier === "Economy" ? 74 : 66,
      scenic: localMarket ? 78 : 68,
      difficulty: 56,
      safety: 74,
      bestFor: "value-first planning",
      tradeOff: "Fewer premium stays and tighter local transfer choices.",
    },
    {
      id: "luxury",
      name: "Luxury Route",
      cost: baseCost * 1.48,
      comfort: 94,
      scenic: 84,
      difficulty: 34,
      safety: 88,
      bestFor: "premium stays and private transfers",
      tradeOff: "Higher spend, stronger comfort and booking readiness.",
    },
    {
      id: "family-safe",
      name: "Family Safe Route",
      cost: baseCost * 1.12,
      comfort: 88,
      scenic: 80,
      difficulty: 36,
      safety: avoidNightTravel ? 96 : 90,
      bestFor: "families, seniors and daylight travel",
      tradeOff: "Prioritizes safer segments over aggressive coverage.",
    },
    {
      id: "adventure",
      name: "Adventure Route",
      cost: baseCost * 0.96,
      comfort: 62,
      scenic: 92,
      difficulty:
        intent.transportMode === "Bike" || intent.transportMode === "Self-drive Car"
          ? 88
          : 76,
      safety: avoidNightTravel ? 76 : 66,
      bestFor: "treks, road stretches and high-energy stops",
      tradeOff: "Higher physical load and more weather-sensitive routing.",
    },
  ];

  return definitions.map((definition) => {
    const appliesRouteId = scenarioRouteMap[definition.id];
    const route = findRoute(plan, appliesRouteId);

    return {
      id: definition.id,
      name: definition.name,
      routeSummary:
        route?.routeStyle ||
        `${routeLine} using ${intent.transportMode} with ${intent.pace.toLowerCase()} pacing`,
      estimatedDuration: route?.duration || `${plan.nights + 1} days`,
      estimatedCost: Math.round(definition.cost / 500) * 500,
      comfortScore: clampScore(definition.comfort),
      scenicScore: clampScore(definition.scenic),
      difficultyScore: clampScore(definition.difficulty),
      safetyScore: clampScore(definition.safety),
      bestFor: definition.bestFor,
      tradeOffNote: definition.tradeOff,
      isRecommended: definition.id === recommendationId,
      appliesRouteId,
    };
  });
}
