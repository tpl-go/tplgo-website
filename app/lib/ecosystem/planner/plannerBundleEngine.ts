import { getPlannerBudgetTotal } from "./plannerBudgetEngine";
import type { TiyaGeneratedPlan, TiyaTripIntent } from "./plannerTypes";

export type TiyaBundleId =
  | "essential"
  | "comfort"
  | "premium"
  | "family-safe"
  | "adventure"
  | "creator"
  | "local-market";

export type TiyaSmartBundle = {
  id: TiyaBundleId;
  name: string;
  includedItems: string[];
  estimatedSavings: number;
  comfortScore: number;
  safetyScore: number;
  valueScore: number;
  bestFor: string;
  upgradeNote: string;
  isRecommended: boolean;
};

function clampScore(value: number) {
  return Math.max(38, Math.min(98, Math.round(value)));
}

function hasInterest(intent: TiyaTripIntent, interest: string) {
  return Array.isArray(intent.interests) && intent.interests.includes(interest);
}

function includesCreator(intent: TiyaTripIntent) {
  return (
    intent.smartPreferences.includeCreatorSpots ||
    hasInterest(intent, "Creator Spots")
  );
}

function includesMarket(intent: TiyaTripIntent) {
  return (
    intent.smartPreferences.includeLocalMarket ||
    hasInterest(intent, "Local Market") ||
    hasInterest(intent, "Shopping")
  );
}

function transportItem(intent: TiyaTripIntent) {
  return `${intent.transportMode} transport`;
}

function stayItem(intent: TiyaTripIntent) {
  return intent.smartPreferences.includeStays
    ? `${intent.stayPreference} stay`
    : "Stay optional";
}

export function generateSmartBundles({
  intent,
  plan,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
}): TiyaSmartBundle[] {
  const total = getPlannerBudgetTotal(intent);
  const creatorCount = Array.isArray(plan.creatorPicks) ? plan.creatorPicks.length : 0;
  const marketCount = Array.isArray(plan.localMarketPicks)
    ? plan.localMarketPicks.length
    : 0;
  const activityCount = Array.isArray(plan.suggestions)
    ? plan.suggestions.filter((suggestion) => suggestion.category === "Activity")
        .length
    : 0;
  const isFamily =
    intent.travelStyle === "Family" || intent.children > 0 || intent.seniors > 0;
  const isAdventure =
    intent.travelStyle === "Adventure" ||
    intent.transportMode === "Bike" ||
    hasInterest(intent, "Trekking");
  const isLuxury = intent.travelStyle === "Luxury" || intent.budgetTier === "Luxury";
  const isBudget = intent.budgetTier === "Economy";
  const recommendedId: TiyaBundleId = isFamily
    ? "family-safe"
    : isAdventure
      ? "adventure"
      : isLuxury
        ? "premium"
        : includesCreator(intent)
          ? "creator"
          : includesMarket(intent)
            ? "local-market"
            : isBudget
              ? "essential"
              : "comfort";

  const bundles: TiyaSmartBundle[] = [
    {
      id: "essential",
      name: "Essential Bundle",
      includedItems: [
        transportItem(intent),
        stayItem(intent),
        "Core activities",
        "Basic local transfer",
      ],
      estimatedSavings: Math.round(total * 0.08),
      comfortScore: clampScore(62 + (intent.pace === "Relaxed" ? 8 : 0)),
      safetyScore: clampScore(64 + (intent.smartPreferences.avoidNightTravel ? 8 : 0)),
      valueScore: clampScore(88 + (isBudget ? 6 : 0)),
      bestFor: "Travellers who want a lean, controlled package.",
      upgradeNote: "Add insurance or comfort stays for safer long routes.",
      isRecommended: recommendedId === "essential",
    },
    {
      id: "comfort",
      name: "Comfort Bundle",
      includedItems: [
        transportItem(intent),
        stayItem(intent),
        "Local transfers",
        "Insurance suggestion",
        "Expert review",
      ],
      estimatedSavings: Math.round(total * 0.1),
      comfortScore: clampScore(82 + (intent.stayPreference === "Resort" ? 5 : 0)),
      safetyScore: clampScore(78 + (intent.smartPreferences.includeInsurance ? 8 : 0)),
      valueScore: clampScore(76),
      bestFor: "Balanced travellers who want smoother movement.",
      upgradeNote: "Upgrade one stay cluster for a premium comfort lift.",
      isRecommended: recommendedId === "comfort",
    },
    {
      id: "premium",
      name: "Premium Bundle",
      includedItems: [
        "Premium transport window",
        `${intent.stayPreference} upgrade`,
        "Curated activities",
        "Insurance",
        "Expert review",
      ],
      estimatedSavings: Math.round(total * 0.12),
      comfortScore: clampScore(90 + (isLuxury ? 4 : 0)),
      safetyScore: clampScore(84),
      valueScore: clampScore(72),
      bestFor: "Premium and luxury travellers.",
      upgradeNote: "Add scenic room or creator experience for stronger differentiation.",
      isRecommended: recommendedId === "premium",
    },
    {
      id: "family-safe",
      name: "Family Safe Bundle",
      includedItems: [
        "Daylight transport",
        "Family-safe stay",
        "Insurance",
        "Local transfer",
        "Medical comfort kit",
        "Expert review",
      ],
      estimatedSavings: Math.round(total * 0.09),
      comfortScore: clampScore(86 + (intent.seniors > 0 ? 5 : 0)),
      safetyScore: clampScore(92 + (intent.children > 0 ? 3 : 0)),
      valueScore: clampScore(78),
      bestFor: "Families, seniors and comfort-first groups.",
      upgradeNote: "Add rest-day buffer for seniors or younger children.",
      isRecommended: recommendedId === "family-safe",
    },
    {
      id: "adventure",
      name: "Adventure Bundle",
      includedItems: [
        transportItem(intent),
        "Adventure activities",
        "Route safety review",
        "Insurance",
        "Local transfer backup",
      ],
      estimatedSavings: Math.round(total * 0.07),
      comfortScore: clampScore(66),
      safetyScore: clampScore(82 + (intent.smartPreferences.avoidNightTravel ? 6 : 0)),
      valueScore: clampScore(84 + activityCount * 2),
      bestFor: "Adventure, bike and trekking-led trips.",
      upgradeNote: "Add recovery stay after the hardest activity day.",
      isRecommended: recommendedId === "adventure",
    },
    {
      id: "creator",
      name: "Creator Curated Bundle",
      includedItems: [
        transportItem(intent),
        stayItem(intent),
        "Creator experiences",
        "Photo/video spots",
        "Local activity bundle",
      ],
      estimatedSavings: Math.round(total * 0.06),
      comfortScore: clampScore(76),
      safetyScore: clampScore(74),
      valueScore: clampScore(82 + creatorCount * 3),
      bestFor: "Creator-led discovery and social-first trips.",
      upgradeNote: "Add local market products to complete creator commerce flow.",
      isRecommended: recommendedId === "creator",
    },
    {
      id: "local-market",
      name: "Local Market Bundle",
      includedItems: [
        "Local market add-ons",
        "Shopping/culture stop",
        "Local transfer",
        "Creator recommended products",
      ],
      estimatedSavings: Math.round(total * 0.05),
      comfortScore: clampScore(74),
      safetyScore: clampScore(72),
      valueScore: clampScore(86 + marketCount * 3),
      bestFor: "Local commerce, shopping and cultural discovery.",
      upgradeNote: "Bundle market stop with a food or culture activity window.",
      isRecommended: recommendedId === "local-market",
    },
  ];

  return bundles;
}
