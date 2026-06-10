import type {
  TiyaCreatorPick,
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaLocalMarketPick,
  TiyaRouteOption,
  TiyaTripIntent,
} from "./plannerTypes";

export type TiyaExperienceCategory =
  | "Food trails"
  | "Culture walks"
  | "Nature spots"
  | "Adventure activities"
  | "Spiritual stops"
  | "Shopping/local market"
  | "Nightlife"
  | "Creator photo/video spots"
  | "Family-friendly activities"
  | "Luxury experiences";

export type TiyaExperience = {
  id: string;
  category: TiyaExperienceCategory;
  title: string;
  destination: string;
  suggestedDay: number;
  bestTime: string;
  duration: string;
  intensity: "Low" | "Medium" | "High";
  costBand: "Low" | "Medium" | "Premium" | "Luxury";
  bookingReadiness: "Ready" | "Recommended" | "Optional";
  fitScore: number;
  crowdLevel: number;
  fatigueImpact: number;
  budgetImpact: number;
  creatorValue: number;
  localCommerceValue: number;
  reason: string;
  isHighlighted: boolean;
};

function clampScore(value: number) {
  return Math.max(28, Math.min(98, Math.round(value)));
}

function hasInterest(intent: TiyaTripIntent, value: string) {
  return intent.interests.includes(value);
}

function pickSuggestedDay(days: TiyaDayPlan[], category: TiyaExperienceCategory) {
  const safeDays = Array.isArray(days) ? days : [];
  if (!safeDays.length) return 1;

  if (category === "Nightlife" || category === "Shopping/local market") {
    return safeDays[Math.min(1, safeDays.length - 1)].day;
  }

  if (category === "Adventure activities") {
    return safeDays[Math.min(2, safeDays.length - 1)].day;
  }

  return safeDays[0].day;
}

function categoryFit({
  category,
  intent,
  selectedRoute,
}: {
  category: TiyaExperienceCategory;
  intent: TiyaTripIntent;
  selectedRoute?: TiyaRouteOption;
}) {
  const familyMode = intent.travelStyle === "Family" || intent.children > 0;
  const seniorMode = intent.seniors > 0;
  const luxuryMode = intent.travelStyle === "Luxury" || intent.budgetTier === "Luxury";
  const adventureMode =
    intent.travelStyle === "Adventure" ||
    intent.transportMode === "Bike" ||
    selectedRoute?.id === "adventure" ||
    hasInterest(intent, "Trekking");

  if (category === "Spiritual stops") {
    return hasInterest(intent, "Temples") || intent.travelStyle === "Spiritual" ? 94 : 58;
  }

  if (category === "Adventure activities") {
    return adventureMode ? 94 : seniorMode || familyMode ? 52 : 66;
  }

  if (category === "Shopping/local market") {
    return intent.smartPreferences.includeLocalMarket || hasInterest(intent, "Local Market")
      ? 92
      : 62;
  }

  if (category === "Creator photo/video spots") {
    return intent.smartPreferences.includeCreatorSpots || hasInterest(intent, "Creator Spots")
      ? 94
      : 68;
  }

  if (category === "Luxury experiences") return luxuryMode ? 96 : 56;
  if (category === "Family-friendly activities") return familyMode || seniorMode ? 92 : 64;
  if (category === "Food trails") return hasInterest(intent, "Food") ? 92 : 72;
  if (category === "Culture walks") return hasInterest(intent, "Culture") ? 90 : 70;
  if (category === "Nature spots") return hasInterest(intent, "Nature") ? 92 : 72;
  if (category === "Nightlife") return hasInterest(intent, "Nightlife") && !familyMode ? 88 : 46;

  return 64;
}

function getCategoryMeta(category: TiyaExperienceCategory, intent: TiyaTripIntent) {
  const lowFatigue = intent.travelStyle === "Family" || intent.seniors > 0;

  if (category === "Food trails") {
    return {
      bestTime: "18:00",
      duration: "2.5 hrs",
      intensity: "Medium" as const,
      costBand: "Medium" as const,
      title: `${intent.toCity} food trail`,
    };
  }

  if (category === "Culture walks") {
    return {
      bestTime: "10:00",
      duration: "2 hrs",
      intensity: "Low" as const,
      costBand: "Medium" as const,
      title: `${intent.toCity} culture walk`,
    };
  }

  if (category === "Nature spots") {
    return {
      bestTime: "06:30",
      duration: "3 hrs",
      intensity: lowFatigue ? ("Low" as const) : ("Medium" as const),
      costBand: "Low" as const,
      title: `${intent.toCity} nature viewpoint`,
    };
  }

  if (category === "Adventure activities") {
    return {
      bestTime: "07:30",
      duration: "4 hrs",
      intensity: "High" as const,
      costBand: "Premium" as const,
      title: `${intent.toCity} guided adventure block`,
    };
  }

  if (category === "Spiritual stops") {
    return {
      bestTime: "06:00",
      duration: "2 hrs",
      intensity: "Low" as const,
      costBand: "Low" as const,
      title: `${intent.toCity} spiritual morning route`,
    };
  }

  if (category === "Shopping/local market") {
    return {
      bestTime: "17:30",
      duration: "2 hrs",
      intensity: "Low" as const,
      costBand: "Medium" as const,
      title: `${intent.toCity} local market cluster`,
    };
  }

  if (category === "Nightlife") {
    return {
      bestTime: "20:30",
      duration: "2 hrs",
      intensity: "Medium" as const,
      costBand: "Premium" as const,
      title: `${intent.toCity} nightlife window`,
    };
  }

  if (category === "Creator photo/video spots") {
    return {
      bestTime: "Sunset",
      duration: "1.5 hrs",
      intensity: "Low" as const,
      costBand: "Medium" as const,
      title: `${intent.toCity} creator content spot`,
    };
  }

  if (category === "Family-friendly activities") {
    return {
      bestTime: "11:00",
      duration: "2 hrs",
      intensity: "Low" as const,
      costBand: "Medium" as const,
      title: `${intent.toCity} family comfort activity`,
    };
  }

  return {
    bestTime: "19:00",
    duration: "3 hrs",
    intensity: "Low" as const,
    costBand: "Luxury" as const,
    title: `${intent.toCity} luxury experience`,
  };
}

function categoryReason(
  category: TiyaExperienceCategory,
  intent: TiyaTripIntent,
  creators: TiyaCreatorPick[],
  market: TiyaLocalMarketPick[]
) {
  if (category === "Creator photo/video spots" && creators.length) {
    return `Matched with ${creators[0].creatorName} creator routing.`;
  }

  if (category === "Shopping/local market" && market.length) {
    return `Connects to ${market[0].productName} and local commerce relevance.`;
  }

  if (category === "Family-friendly activities") {
    return "Low-fatigue option for children, seniors or family pacing.";
  }

  if (category === "Luxury experiences") {
    return "Premium add-on aligned with comfort and high-touch travel.";
  }

  return `Matched to ${intent.travelStyle} style and ${intent.pace.toLowerCase()} pace.`;
}

export function generatePlannerExperiences({
  intent,
  plan,
  days,
  selectedRoute,
  selectedScenarioId,
  selectedVariantId,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  days: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
  selectedScenarioId?: string;
  selectedVariantId?: string;
}): TiyaExperience[] {
  const safeCreators = Array.isArray(plan.creatorPicks) ? plan.creatorPicks : [];
  const safeMarket = Array.isArray(plan.localMarketPicks) ? plan.localMarketPicks : [];
  const categories: TiyaExperienceCategory[] = [
    "Food trails",
    "Culture walks",
    "Nature spots",
    "Adventure activities",
    "Spiritual stops",
    "Shopping/local market",
    "Nightlife",
    "Creator photo/video spots",
    "Family-friendly activities",
    "Luxury experiences",
  ];

  return categories.map((category) => {
    const meta = getCategoryMeta(category, intent);
    const fitScore = clampScore(
      categoryFit({ category, intent, selectedRoute }) +
        (selectedScenarioId === "adventure" && category === "Adventure activities" ? 8 : 0) +
        (selectedVariantId === "luxury" && category === "Luxury experiences" ? 8 : 0)
    );
    const highIntensity = meta.intensity === "High";

    return {
      id: category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category,
      title: meta.title,
      destination: intent.toCity || "Destination",
      suggestedDay: pickSuggestedDay(days, category),
      bestTime: meta.bestTime,
      duration: meta.duration,
      intensity: meta.intensity,
      costBand: meta.costBand,
      bookingReadiness: fitScore >= 86 ? "Ready" : fitScore >= 68 ? "Recommended" : "Optional",
      fitScore,
      crowdLevel: clampScore(category === "Nightlife" ? 78 : category === "Spiritual stops" ? 62 : 54),
      fatigueImpact: clampScore(highIntensity ? 78 : intent.seniors > 0 ? 34 : 48),
      budgetImpact: clampScore(meta.costBand === "Luxury" ? 88 : meta.costBand === "Premium" ? 72 : 42),
      creatorValue: clampScore(
        category === "Creator photo/video spots" || intent.smartPreferences.includeCreatorSpots
          ? 92
          : 52
      ),
      localCommerceValue: clampScore(
        category === "Shopping/local market" || intent.smartPreferences.includeLocalMarket
          ? 92
          : 48
      ),
      reason: categoryReason(category, intent, safeCreators, safeMarket),
      isHighlighted: fitScore >= 86,
    };
  });
}
