import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "./plannerTypes";

export type TiyaPlannerSearchData = {
  from: string;
  to: string;
  startDate: string;
  endDate: string;
  travellers: {
    adults: number;
    children: number;
    seniors: number;
    total: number;
  };
  budget: {
    tier: string;
    customAmount: string;
  };
  travelStyle: string;
  pace: TiyaTripIntent["pace"];
  interests: string[];
  transportMode: string;
  stayPreference: string;
};

export type TiyaSelectedRouteData = {
  routeId: TiyaRouteOption["id"];
  routeType: string;
  transportMode: string;
  duration: string;
  distance: string;
  risk: TiyaRouteOption["riskLevel"];
  estimatedCostText: string;
  metadata: TiyaRouteOption;
};

export type TiyaGeneratedItineraryData = {
  routeTitle: string;
  days: TiyaDayPlan[];
  bookingCandidateCount: number;
  totalBudget: number;
};

export type TiyaPlannerDataModel = {
  plannerSearchData: TiyaPlannerSearchData;
  selectedRouteData?: TiyaSelectedRouteData;
  generatedItineraryData?: TiyaGeneratedItineraryData;
};

export function getTravellerTotal(intent: TiyaTripIntent) {
  return Math.max(1, intent.adults + intent.children + intent.seniors);
}

export function buildPlannerSearchData(
  intent: TiyaTripIntent
): TiyaPlannerSearchData {
  return {
    from: intent.fromCity.trim(),
    to: intent.toCity.trim(),
    startDate: intent.startDate,
    endDate: intent.endDate,
    travellers: {
      adults: intent.adults,
      children: intent.children,
      seniors: intent.seniors,
      total: getTravellerTotal(intent),
    },
    budget: {
      tier: intent.budgetTier,
      customAmount: intent.customBudgetAmount,
    },
    travelStyle: intent.travelStyle,
    pace: intent.pace,
    interests: intent.interests,
    transportMode: intent.transportMode,
    stayPreference: intent.stayPreference,
  };
}

export function routeEstimatedCostText(route: TiyaRouteOption) {
  const distanceValue = Number(route.distance.match(/\d+/)?.[0] ?? 360);
  const multiplier =
    route.id === "budget"
      ? 62
      : route.id === "scenic"
        ? 92
        : route.id === "adventure"
          ? 105
          : 82;
  const estimate = Math.max(
    9000,
    Math.round((distanceValue * multiplier) / 1000) * 1000
  );

  return `₹${estimate.toLocaleString("en-IN")} estimate`;
}

export function buildSelectedRouteData(
  route: TiyaRouteOption,
  intent: TiyaTripIntent
): TiyaSelectedRouteData {
  return {
    routeId: route.id,
    routeType: route.name,
    transportMode: intent.transportMode,
    duration: route.duration,
    distance: route.distance,
    risk: route.riskLevel,
    estimatedCostText: routeEstimatedCostText(route),
    metadata: route,
  };
}

export function buildGeneratedItineraryData(
  plan: TiyaGeneratedPlan
): TiyaGeneratedItineraryData {
  return {
    routeTitle: plan.routeTitle,
    days: plan.days,
    bookingCandidateCount: plan.days.reduce(
      (sum, day) =>
        sum +
        day.items.filter(
          (item) =>
            item.type === "transport" ||
            item.type === "stay" ||
            item.type === "activity"
        ).length,
      0
    ),
    totalBudget: plan.totalBudget,
  };
}

export function buildPlannerDataModel({
  intent,
  selectedRoute,
  generatedPlan,
}: {
  intent: TiyaTripIntent;
  selectedRoute?: TiyaRouteOption;
  generatedPlan?: TiyaGeneratedPlan;
}): TiyaPlannerDataModel {
  return {
    plannerSearchData: buildPlannerSearchData(intent),
    selectedRouteData: selectedRoute
      ? buildSelectedRouteData(selectedRoute, intent)
      : undefined,
    generatedItineraryData: generatedPlan
      ? buildGeneratedItineraryData(generatedPlan)
      : undefined,
  };
}
