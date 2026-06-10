import { generateTripReviewSnapshot } from "./plannerReviewEngine";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "./plannerTypes";

export type TiyaPostTripSummary = {
  completedTripSnapshot: string;
  routeCovered: string;
  daysTravelled: number;
  creatorLocalMarketEngagement: string;
  estimatedSpend: number;
  experienceScore: number;
};

export type TiyaTripMemoryCapture = {
  favouriteStop: string;
  favouriteStay: string;
  favouriteActivity: string;
  routeFeedback: string;
  budgetFeedback: string;
  safetyFeedback: string;
};

export type TiyaPostTripProduct = {
  id: string;
  title: string;
  region: string;
  detail: string;
  tag: string;
};

export type TiyaNextTripSuggestion = {
  id: string;
  title: string;
  detail: string;
  fit: number;
};

export function generatePostTripSummary({
  intent,
  plan,
  days,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  days: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
}): TiyaPostTripSummary {
  const safeDays = Array.isArray(days) ? days : [];
  const review = generateTripReviewSnapshot({
    intent,
    plan,
    days: safeDays,
    selectedRoute,
  });
  const creatorCount = Array.isArray(plan.creatorPicks)
    ? plan.creatorPicks.length
    : 0;
  const marketCount = Array.isArray(plan.localMarketPicks)
    ? plan.localMarketPicks.length
    : 0;

  return {
    completedTripSnapshot: `${intent.travelStyle} ${intent.toCity} plan completed in Tiya simulation.`,
    routeCovered: selectedRoute?.name || plan.routeTitle,
    daysTravelled: safeDays.length || plan.days.length,
    creatorLocalMarketEngagement: `${creatorCount} creator pick${creatorCount === 1 ? "" : "s"} · ${marketCount} market product${marketCount === 1 ? "" : "s"}`,
    estimatedSpend: review.quoteEstimate || plan.totalBudget,
    experienceScore: review.scores.experienceMatch,
  };
}

export function generateDefaultTripMemory({
  intent,
  plan,
  days,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  days: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
}): TiyaTripMemoryCapture {
  const safeDays = Array.isArray(days) ? days : [];
  const favouriteDay = safeDays.find((day) => day.city === intent.toCity) ?? safeDays[0];
  const staySuggestion = (Array.isArray(plan.suggestions) ? plan.suggestions : []).find(
    (suggestion) => suggestion.category === "Stay"
  );
  const activitySuggestion = (Array.isArray(plan.suggestions) ? plan.suggestions : []).find(
    (suggestion) => suggestion.category === "Activity"
  );

  return {
    favouriteStop: favouriteDay?.city || intent.toCity,
    favouriteStay: staySuggestion?.title || intent.stayPreference,
    favouriteActivity:
      activitySuggestion?.title || intent.interests[0] || "Local exploration",
    routeFeedback: `${selectedRoute?.name || intent.transportMode} worked well for this plan.`,
    budgetFeedback: `${intent.budgetTier} budget felt aligned with estimated spend.`,
    safetyFeedback: intent.smartPreferences.avoidNightTravel
      ? "Daylight movement preference improved comfort."
      : "Add stronger safety buffers for future routes.",
  };
}

export function generatePostTripProducts({
  intent,
  plan,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
}): TiyaPostTripProduct[] {
  const marketProducts = Array.isArray(plan.localMarketPicks)
    ? plan.localMarketPicks
    : [];
  const products = marketProducts.slice(0, 4).map((product) => ({
    id: product.id,
    title: product.productName,
    region: product.localRegion,
    detail: product.description,
    tag: product.isCreatorRecommended
      ? "Creator recommended"
      : product.specialtyLabel,
  }));

  if (products.length) return products;

  return [
    {
      id: "regional-handicraft",
      title: `${intent.toCity} local craft edit`,
      region: intent.toCity,
      detail: "Destination-linked local products based on your route.",
      tag: "Local discovery",
    },
    {
      id: "travel-essentials",
      title: "Travel essentials refill",
      region: "TPL Local Market",
      detail: "Reorder practical items for your next trip.",
      tag: "Reorder",
    },
  ];
}

export function generateNextTripSuggestions({
  intent,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  selectedRoute?: TiyaRouteOption;
}): TiyaNextTripSuggestion[] {
  return [
    {
      id: "similar",
      title: `Similar ${intent.travelStyle.toLowerCase()} destination`,
      detail: `Plan another ${intent.budgetTier.toLowerCase()} route with the same travel style.`,
      fit: 86,
    },
    {
      id: "seasonal-revisit",
      title: `Seasonal revisit to ${intent.toCity}`,
      detail: "Try the same destination in a better weather or festival window.",
      fit: 82,
    },
    {
      id: "nearby-circuit",
      title: "Nearby circuit expansion",
      detail: "Extend this trip into a regional circuit with fewer backtracks.",
      fit: 79,
    },
    {
      id: "creator-led",
      title: "Creator-led route",
      detail:
        selectedRoute?.scenicScore && selectedRoute.scenicScore > 80
          ? "Convert scenic stops into a creator-friendly discovery route."
          : "Add creator-led food, culture and photo stops to the next plan.",
      fit: 84,
    },
  ];
}
