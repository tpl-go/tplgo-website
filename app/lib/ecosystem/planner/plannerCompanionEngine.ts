import type {
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "./plannerTypes";

export type TiyaCompanionMode =
  | "Planner Mode"
  | "Safety Mode"
  | "Budget Mode"
  | "Creator Mode"
  | "Local Market Mode"
  | "Booking Mode";

export type TiyaCompanionMessage = {
  id: string;
  role: "tiya" | "traveller";
  text: string;
  tag?: string;
};

export type TiyaCompanionPrompt = {
  id: string;
  label: string;
  mode: TiyaCompanionMode;
};

export type TiyaCompanionSuggestion = {
  id: string;
  title: string;
  detail: string;
  mode: TiyaCompanionMode;
  priority: "Info" | "Smart" | "Important";
};

export const companionModes: TiyaCompanionMode[] = [
  "Planner Mode",
  "Safety Mode",
  "Budget Mode",
  "Creator Mode",
  "Local Market Mode",
  "Booking Mode",
];

export const companionPrompts: TiyaCompanionPrompt[] = [
  { id: "cheaper", label: "Make this trip cheaper", mode: "Budget Mode" },
  { id: "rest-day", label: "Add rest day", mode: "Planner Mode" },
  { id: "family-safe", label: "Make it family-safe", mode: "Safety Mode" },
  { id: "creator", label: "Add creator spots", mode: "Creator Mode" },
  { id: "market", label: "Add local market stops", mode: "Local Market Mode" },
  { id: "fatigue", label: "Reduce travel fatigue", mode: "Safety Mode" },
  { id: "weather", label: "Improve weather safety", mode: "Safety Mode" },
];

function travellerCount(intent: TiyaTripIntent) {
  return intent.adults + intent.children + intent.seniors;
}

export function generateInitialCompanionMessages({
  intent,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  selectedRoute?: TiyaRouteOption;
}): TiyaCompanionMessage[] {
  const routeLabel = `${intent.fromCity} to ${intent.toCity}`;
  const routeRisk =
    selectedRoute?.riskLevel === "High"
      ? " I am watching the route risk and will prefer safer daylight movement."
      : "";

  return [
    {
      id: "welcome",
      role: "tiya",
      tag: "Planner Mode",
      text: `I am tracking your ${routeLabel} plan for ${travellerCount(intent)} travellers.${routeRisk}`,
    },
  ];
}

export function generateCompanionSuggestions({
  intent,
  plan,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  selectedRoute?: TiyaRouteOption;
}): TiyaCompanionSuggestion[] {
  const safeBudgetLines = Array.isArray(plan.budgetLines) ? plan.budgetLines : [];
  const safeCreatorPicks = Array.isArray(plan.creatorPicks)
    ? plan.creatorPicks
    : [];
  const safeMarketPicks = Array.isArray(plan.localMarketPicks)
    ? plan.localMarketPicks
    : [];
  const highTransportCost = safeBudgetLines.some(
    (line) => line.label.toLowerCase().includes("transport") && line.amount > 30000
  );
  const suggestions: TiyaCompanionSuggestion[] = [
    {
      id: "packing",
      title: "Packing reminder",
      detail: "Keep medicine, power bank, offline IDs and route notes ready before departure.",
      mode: "Safety Mode",
      priority: "Smart",
    },
    {
      id: "insurance",
      title: intent.smartPreferences.includeInsurance
        ? "Insurance is included"
        : "Add insurance cover",
      detail: intent.smartPreferences.includeInsurance
        ? "Carry the policy copy and emergency assistance number offline."
        : "Insurance improves readiness for long route, family or adventure travel.",
      mode: "Booking Mode",
      priority: intent.smartPreferences.includeInsurance ? "Info" : "Important",
    },
  ];

  if (highTransportCost || intent.budgetTier === "Economy") {
    suggestions.push({
      id: "budget",
      title: "Budget optimization available",
      detail: "Try mixed transport or one homestay cluster to reduce overall cost without changing the core route.",
      mode: "Budget Mode",
      priority: "Important",
    });
  }

  if (selectedRoute?.riskLevel === "High" || intent.smartPreferences.avoidNightTravel) {
    suggestions.push({
      id: "safety",
      title: "Safer movement window",
      detail: "Keep transfers daylight-led and add buffer time around the hardest route segment.",
      mode: "Safety Mode",
      priority: "Important",
    });
  }

  if (intent.pace === "Packed" || selectedRoute?.difficulty === "High") {
    suggestions.push({
      id: "fatigue",
      title: "Travel fatigue watch",
      detail: "Add one slow evening or recovery stay after a long transfer day.",
      mode: "Planner Mode",
      priority: "Smart",
    });
  }

  if (intent.smartPreferences.includeCreatorSpots || safeCreatorPicks.length > 0) {
    suggestions.push({
      id: "creator",
      title: "Creator stop can fit this plan",
      detail: "Add one high-fit creator spot near the main route instead of adding a separate detour.",
      mode: "Creator Mode",
      priority: "Smart",
    });
  }

  if (intent.smartPreferences.includeLocalMarket || safeMarketPicks.length > 0) {
    suggestions.push({
      id: "market",
      title: "Local market stop recommended",
      detail: "Cluster local market exploration near food or culture activity windows.",
      mode: "Local Market Mode",
      priority: "Smart",
    });
  }

  return suggestions;
}

export function generateCompanionResponse({
  input,
  intent,
  mode,
}: {
  input: string;
  intent: TiyaTripIntent;
  mode: TiyaCompanionMode;
}) {
  const text = input.toLowerCase();

  if (text.includes("cheap") || text.includes("budget") || mode === "Budget Mode") {
    return "I would reduce cost through mixed transport, one value stay cluster and tighter local transfer grouping.";
  }

  if (text.includes("safe") || text.includes("weather") || mode === "Safety Mode") {
    return "I would keep transfers in daylight, add rain or altitude prep where needed and keep an emergency kit ready.";
  }

  if (text.includes("creator") || mode === "Creator Mode") {
    return `I can fit creator stops around ${intent.toCity} without adding a major detour. Best fit is near food, culture or scenic windows.`;
  }

  if (text.includes("market") || mode === "Local Market Mode") {
    return "I would place local market exploration in the evening or near a culture day so it supports the route instead of increasing fatigue.";
  }

  if (text.includes("book") || mode === "Booking Mode") {
    return "I would prioritize transport, stay and insurance readiness first, then attach experiences and local market options.";
  }

  if (text.includes("rest") || text.includes("fatigue")) {
    return "I would add a lighter recovery block after the longest transfer and reduce back-to-back movement.";
  }

  return `For this ${intent.travelStyle.toLowerCase()} ${intent.toCity} plan, I would balance ${intent.pace.toLowerCase()} pacing with route safety, budget fit and booking readiness.`;
}
