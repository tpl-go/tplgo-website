import { generatePlannerComfortBalance, type TiyaComfortBalance } from "./plannerComfortBalancer";
import { generatePlannerSavingsMeter, type TiyaSavingsMeterData } from "./plannerSavingsEngine";
import type {
  TiyaBudgetLine,
  TiyaDayPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "./plannerTypes";

export type TiyaOptimizationSuggestion = {
  id: string;
  title: string;
  detail: string;
  estimatedSavings: number;
  comfortDelta: number;
  category: "Transport" | "Stay" | "Route" | "Budget" | "Activity";
  actionLabel: "Optimize" | "Compare" | "Cluster" | "Upgrade";
};

export type TiyaOptimizationCompareOption = {
  id: string;
  title: string;
  currentLabel: string;
  optimizedLabel: string;
  savingsPercent: number;
  comfortImpact: number;
  tradeOff: string;
};

export type TiyaBudgetBalanceZone = {
  label: string;
  status: "Overspend" | "Flexible" | "Efficient";
  amount: number;
  note: string;
};

export type TiyaOptimizationPlan = {
  suggestions: TiyaOptimizationSuggestion[];
  compareOptions: TiyaOptimizationCompareOption[];
  budgetZones: TiyaBudgetBalanceZone[];
  recommendations: string[];
  savings: TiyaSavingsMeterData;
  comfort: TiyaComfortBalance;
};

function amountFor(lines: TiyaBudgetLine[], label: string) {
  const safeLines = Array.isArray(lines) ? lines : [];
  return safeLines.find((line) => line.label === label)?.amount ?? 0;
}

function formatAmount(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function getStayMixSuggestion(intent: TiyaTripIntent) {
  if (intent.budgetTier === "Luxury" || intent.stayPreference === "Villa") {
    return "Shift one luxury stay to premium and keep the destination-core night upgraded.";
  }

  if (intent.stayPreference === "Hotel") {
    return "Mix one homestay night near the route cluster without reducing comfort heavily.";
  }

  return "Use a split-stay strategy with one recovery hotel night.";
}

export function generatePlannerOptimizationPlan({
  intent,
  days,
  budgetLines,
  totalBudget,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  days: TiyaDayPlan[];
  budgetLines: TiyaBudgetLine[];
  totalBudget: number;
  selectedRoute?: TiyaRouteOption;
}): TiyaOptimizationPlan {
  const safeDays = Array.isArray(days) ? days : [];
  const transport = amountFor(budgetLines, "Transport");
  const stays = amountFor(budgetLines, "Stays");
  const activities = amountFor(budgetLines, "Activities");
  const localTravel = amountFor(budgetLines, "Local travel");
  const transferDays = safeDays.filter((day) =>
    (Array.isArray(day.items) ? day.items : []).some(
      (item) => item.type === "transport"
    )
  ).length;
  const savings = generatePlannerSavingsMeter({
    intent,
    budgetLines,
    totalBudget,
    selectedRoute,
  });
  const comfort = generatePlannerComfortBalance({
    intent,
    days: safeDays,
    selectedRoute,
  });
  const trainCabSavings = Math.round(transport * 0.22);
  const staySavings = Math.round(
    stays *
      (intent.budgetTier === "Luxury" || intent.stayPreference === "Resort"
        ? 0.18
        : 0.11)
  );
  const clusterSavings = Math.round((localTravel + activities * 0.2) * 0.16);
  const transferSavings = Math.round(localTravel * (transferDays > 1 ? 0.2 : 0.1));

  const suggestions: TiyaOptimizationSuggestion[] = [
    {
      id: "stay-mix",
      title:
        intent.budgetTier === "Luxury"
          ? `Switch one luxury stay to premium and save ${formatAmount(staySavings)}.`
          : `Use one homestay mix and save ${formatAmount(staySavings)}.`,
      detail: getStayMixSuggestion(intent),
      estimatedSavings: staySavings,
      comfortDelta: intent.budgetTier === "Luxury" ? -4 : 3,
      category: "Stay",
      actionLabel: intent.budgetTier === "Luxury" ? "Optimize" : "Compare",
    },
    {
      id: "transport-combo",
      title:
        intent.transportMode === "Flight"
          ? "Train + cab combo reduces cost by 22%."
          : "Mixed mode recommendation reduces transfer spend.",
      detail:
        intent.transportMode === "Flight"
          ? "Use rail for the longest intercity leg and cab for local transfer precision."
          : "Blend the primary transport with cab only for last-mile comfort.",
      estimatedSavings: trainCabSavings,
      comfortDelta: intent.transportMode === "Flight" ? -6 : 4,
      category: "Transport",
      actionLabel: "Compare",
    },
    {
      id: "buffer-stay",
      title: "One extra buffer stay improves comfort score.",
      detail: "Add a recovery stay after the longest transfer and reduce same-day activity pressure.",
      estimatedSavings: -Math.round(stays * 0.08),
      comfortDelta: 12,
      category: "Stay",
      actionLabel: "Upgrade",
    },
    {
      id: "market-cluster",
      title: `Move market visit to same route cluster and save ${formatAmount(clusterSavings)}.`,
      detail: "Cluster market, food and local shopping near the same evening route window.",
      estimatedSavings: clusterSavings,
      comfortDelta: 5,
      category: "Activity",
      actionLabel: "Cluster",
    },
    {
      id: "transfer-reduction",
      title: "Reduce one transfer to improve comfort.",
      detail: "Keep stays closer to activity cores and remove unnecessary local travel loops.",
      estimatedSavings: transferSavings,
      comfortDelta: 8,
      category: "Route",
      actionLabel: "Optimize",
    },
  ];

  const compareOptions: TiyaOptimizationCompareOption[] = [
    {
      id: "flight-train",
      title: "Flight vs train",
      currentLabel: intent.transportMode,
      optimizedLabel: intent.transportMode === "Flight" ? "Train + cab" : "Flight when time-sensitive",
      savingsPercent: intent.transportMode === "Flight" ? 22 : 8,
      comfortImpact: intent.transportMode === "Flight" ? -6 : 6,
      tradeOff:
        intent.transportMode === "Flight"
          ? "Saves cost but adds travel time."
          : "Improves speed but raises transport cost.",
    },
    {
      id: "cab-self-drive",
      title: "Cab vs self-drive",
      currentLabel: intent.transportMode,
      optimizedLabel:
        intent.transportMode === "Cab" ? "Self-drive for scenic segments" : "Cab for last-mile comfort",
      savingsPercent: intent.transportMode === "Cab" ? 14 : 7,
      comfortImpact: intent.transportMode === "Cab" ? -3 : 8,
      tradeOff: "Self-drive saves cost, cab reduces fatigue and parking friction.",
    },
    {
      id: "scenic-fast",
      title: "Scenic vs fast",
      currentLabel: selectedRoute?.name || "Current route",
      optimizedLabel: selectedRoute?.id === "scenic" ? "Fastest Route" : "Scenic Route",
      savingsPercent: selectedRoute?.id === "scenic" ? 9 : 3,
      comfortImpact: selectedRoute?.id === "scenic" ? 4 : -2,
      tradeOff: "Fast route improves efficiency, scenic route improves experience value.",
    },
  ];

  const budgetZones: TiyaBudgetBalanceZone[] = [
    {
      label: "Transport",
      status: transport > totalBudget * 0.26 ? "Overspend" : "Flexible",
      amount: transport,
      note: "Transport can optimize through train/cab mixes or route clustering.",
    },
    {
      label: "Stays",
      status:
        stays > totalBudget * 0.42
          ? "Overspend"
          : intent.stayPreference === "Homestay"
            ? "Efficient"
            : "Flexible",
      amount: stays,
      note: "Split-stay strategy can preserve comfort while lowering peak-night cost.",
    },
    {
      label: "Activities",
      status: activities > totalBudget * 0.24 ? "Overspend" : "Efficient",
      amount: activities,
      note: "Activity spend is best optimized by clustering creator, food and market stops.",
    },
    {
      label: "Local travel",
      status: localTravel > totalBudget * 0.18 ? "Overspend" : "Flexible",
      amount: localTravel,
      note: "Local loops can reduce with neighborhood-based sightseeing blocks.",
    },
  ];

  return {
    suggestions,
    compareOptions,
    budgetZones,
    recommendations: [
      "Cluster sightseeing to reduce local travel.",
      intent.transportMode === "Flight"
        ? "Use overnight train for savings where comfort tolerance allows."
        : "Keep cab segments only where they reduce fatigue.",
      "Shift luxury stay to destination core instead of every stop.",
      selectedRoute?.id === "adventure"
        ? "Protect one recovery block before adventure-heavy movement."
        : "Reduce one transfer to improve comfort.",
    ],
    savings,
    comfort,
  };
}
