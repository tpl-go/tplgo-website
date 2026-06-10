import type { TiyaGeneratedPlan, TiyaTripIntent } from "./plannerTypes";

export type TiyaTripVariantId =
  | "budget"
  | "premium"
  | "short"
  | "long"
  | "family"
  | "adventure"
  | "luxury";

export type TiyaTripVariant = {
  id: TiyaTripVariantId;
  name: string;
  duration: string;
  estimatedCost: number;
  routeStyle: string;
  stayStyle: string;
  transportStyle: string;
  activityIntensity: number;
  comfortLevel: number;
  bestFor: string;
  changesFromBase: string;
  aiNote: string;
  isRecommended: boolean;
};

function clampScore(value: number) {
  return Math.max(35, Math.min(98, Math.round(value)));
}

function addDays(dateValue: string, days: number) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return dateValue;

  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function shortenEndDate(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const proposed = new Date(addDays(endDate, -2));

  if (Number.isNaN(start.getTime()) || Number.isNaN(proposed.getTime())) {
    return endDate;
  }

  start.setDate(start.getDate() + 1);

  return (proposed.getTime() < start.getTime() ? start : proposed)
    .toISOString()
    .slice(0, 10);
}

function getRecommendedVariantId(intent: TiyaTripIntent): TiyaTripVariantId {
  if (intent.travelStyle === "Luxury" || intent.budgetTier === "Luxury") {
    return "luxury";
  }

  if (intent.budgetTier === "Economy") return "budget";
  if (intent.pace === "Packed") return "short";
  if (intent.pace === "Relaxed") return "long";
  if (intent.travelStyle === "Family") return "family";

  if (
    intent.travelStyle === "Adventure" ||
    intent.transportMode === "Bike" ||
    intent.interests.includes("Trekking")
  ) {
    return "adventure";
  }

  if (intent.budgetTier === "Premium") return "premium";

  return "premium";
}

function formatDuration(nights: number) {
  return `${nights} Nights · ${nights + 1} Days`;
}

function estimateCost(plan: TiyaGeneratedPlan, multiplier: number) {
  return Math.round(((plan.totalBudget || 48000) * multiplier) / 500) * 500;
}

export function generatePlannerTripVariants(
  intent: TiyaTripIntent,
  plan: TiyaGeneratedPlan
): TiyaTripVariant[] {
  const recommendedVariantId = getRecommendedVariantId(intent);
  const baseNights = plan.nights || 4;
  const scenicRoute = intent.smartPreferences.preferScenicRoute;
  const localMarket = intent.smartPreferences.includeLocalMarket;

  const variants: Array<Omit<TiyaTripVariant, "isRecommended">> = [
    {
      id: "budget",
      name: "Budget Variant",
      duration: formatDuration(Math.max(2, baseNights - 1)),
      estimatedCost: estimateCost(plan, 0.72),
      routeStyle: localMarket ? "value route with market stops" : "lean route",
      stayStyle: "hostel, homestay or economy hotel",
      transportStyle:
        intent.transportMode === "Flight" ? "train or low-fare flight mix" : intent.transportMode,
      activityIntensity: clampScore(intent.pace === "Packed" ? 78 : 62),
      comfortLevel: 64,
      bestFor: "travellers prioritising value",
      changesFromBase: "Reduces stay spend, trims premium activities and keeps essential transfers.",
      aiNote: "Best when budget fit matters more than premium comfort.",
    },
    {
      id: "premium",
      name: "Premium Variant",
      duration: formatDuration(baseNights),
      estimatedCost: estimateCost(plan, 1.12),
      routeStyle: scenicRoute ? "scenic premium route" : "balanced premium route",
      stayStyle: `${intent.stayPreference} with stronger location fit`,
      transportStyle: `${intent.transportMode} with transfer buffers`,
      activityIntensity: clampScore(intent.pace === "Relaxed" ? 58 : 70),
      comfortLevel: 84,
      bestFor: "balanced comfort and coverage",
      changesFromBase: "Adds better stays, stronger timing buffers and curated activity slots.",
      aiNote: "A stable upgrade path without pushing into luxury spend.",
    },
    {
      id: "short",
      name: "Short Trip Variant",
      duration: formatDuration(Math.max(2, baseNights - 2)),
      estimatedCost: estimateCost(plan, 0.82),
      routeStyle: "compressed core route",
      stayStyle: "central stay with quick access",
      transportStyle:
        intent.transportMode === "Flight" ? "fastest flight-led movement" : "fastest available transfers",
      activityIntensity: 88,
      comfortLevel: 70,
      bestFor: "packed schedules and weekend windows",
      changesFromBase: "Removes slower detours and focuses on high-priority highlights.",
      aiNote: "Use when time is constrained and intensity is acceptable.",
    },
    {
      id: "long",
      name: "Long Trip Variant",
      duration: formatDuration(baseNights + 2),
      estimatedCost: estimateCost(plan, 1.22),
      routeStyle: scenicRoute ? "slow scenic circuit" : "expanded relaxed circuit",
      stayStyle: "longer stay blocks with recovery time",
      transportStyle: `${intent.transportMode} with softer day pacing`,
      activityIntensity: 52,
      comfortLevel: 86,
      bestFor: "relaxed pacing and deeper discovery",
      changesFromBase: "Adds rest time, extra local windows and less rushed transitions.",
      aiNote: "Strong fit when comfort and destination depth matter.",
    },
    {
      id: "family",
      name: "Family Variant",
      duration: formatDuration(baseNights),
      estimatedCost: estimateCost(plan, 1.08),
      routeStyle: "daylight-safe family route",
      stayStyle: "family-friendly hotel or homestay",
      transportStyle: "safer transfers with shorter travel stretches",
      activityIntensity: 54,
      comfortLevel: 88,
      bestFor: "families, children and seniors",
      changesFromBase: "Prioritises daylight movement, safer stops and easier activity blocks.",
      aiNote: "Keeps logistics predictable and reduces route fatigue.",
    },
    {
      id: "adventure",
      name: "Adventure Variant",
      duration: formatDuration(baseNights),
      estimatedCost: estimateCost(plan, 0.98),
      routeStyle: scenicRoute ? "scenic adventure route" : "high-energy route",
      stayStyle: "camp, hostel, homestay or rugged resort",
      transportStyle:
        intent.transportMode === "Bike" ? "bike-first route" : `${intent.transportMode} plus active transfers`,
      activityIntensity: 92,
      comfortLevel: 58,
      bestFor: "treks, road stretches and active days",
      changesFromBase: "Adds tougher outdoor blocks and reduces passive downtime.",
      aiNote: "Best for high-energy travellers comfortable with variable conditions.",
    },
    {
      id: "luxury",
      name: "Luxury Variant",
      duration: formatDuration(baseNights + 1),
      estimatedCost: estimateCost(plan, 1.55),
      routeStyle: "premium low-friction route",
      stayStyle: "luxury hotel, resort or villa",
      transportStyle: "premium transfers and private routing",
      activityIntensity: 58,
      comfortLevel: 96,
      bestFor: "premium stays and high-touch planning",
      changesFromBase: "Upgrades stays, transfers, insurance fit and curated experiences.",
      aiNote: "Highest comfort profile with the least planning friction.",
    },
  ];

  return variants.map((variant) => ({
    ...variant,
    isRecommended: variant.id === recommendedVariantId,
  }));
}

export function buildIntentForTripVariant(
  intent: TiyaTripIntent,
  variantId: TiyaTripVariantId
): TiyaTripIntent {
  if (variantId === "budget") {
    return {
      ...intent,
      budgetTier: "Economy",
      pace: intent.pace === "Relaxed" ? "Balanced" : intent.pace,
      stayPreference:
        intent.stayPreference === "Villa" || intent.stayPreference === "Resort"
          ? "Homestay"
          : intent.stayPreference,
    };
  }

  if (variantId === "premium") {
    return {
      ...intent,
      budgetTier: "Premium",
      pace: intent.pace === "Packed" ? "Balanced" : intent.pace,
      smartPreferences: {
        ...intent.smartPreferences,
        includeStays: true,
        includeInsurance: true,
      },
    };
  }

  if (variantId === "short") {
    return {
      ...intent,
      endDate: shortenEndDate(intent.startDate, intent.endDate),
      pace: "Packed",
    };
  }

  if (variantId === "long") {
    return {
      ...intent,
      endDate: addDays(intent.endDate, 2),
      pace: "Relaxed",
      smartPreferences: {
        ...intent.smartPreferences,
        preferScenicRoute: true,
      },
    };
  }

  if (variantId === "family") {
    return {
      ...intent,
      travelStyle: "Family",
      pace: "Relaxed",
      smartPreferences: {
        ...intent.smartPreferences,
        avoidNightTravel: true,
        includeStays: true,
        includeInsurance: true,
      },
    };
  }

  if (variantId === "adventure") {
    return {
      ...intent,
      travelStyle: "Adventure",
      pace: intent.pace === "Relaxed" ? "Balanced" : intent.pace,
      interests: Array.from(new Set([...intent.interests, "Trekking", "Nature"])),
      smartPreferences: {
        ...intent.smartPreferences,
        preferScenicRoute: true,
      },
    };
  }

  return {
    ...intent,
    budgetTier: "Luxury",
    travelStyle: "Luxury",
    stayPreference:
      intent.stayPreference === "No Stay Needed" ? "Resort" : intent.stayPreference,
    smartPreferences: {
      ...intent.smartPreferences,
      includeStays: true,
      includeInsurance: true,
      avoidNightTravel: true,
    },
  };
}
