import {
  calculatePackagePrice,
  generatePackageComponents,
  generatePackageVariants,
  getPackageSummary,
  type TiyaPackageVariantId,
} from "./plannerPackageBuilder";
import type { TiyaGeneratedPlan, TiyaTripIntent } from "./plannerTypes";

export type TiyaQuoteVersionId =
  | "budget"
  | "standard"
  | "premium"
  | "luxury"
  | "creator";

export type TiyaQuoteVersion = {
  id: TiyaQuoteVersionId;
  name: string;
  note: string;
  multiplierLabel: string;
  isRecommended: boolean;
};

export type TiyaQuoteSummary = {
  quoteTitle: string;
  route: string;
  duration: string;
  travellerCount: number;
  selectedPackageVariant: string;
  travelStyle: string;
  budgetTier: string;
  validityNote: string;
};

export type TiyaQuoteBreakup = {
  baseTripCost: number;
  transportEstimate: number;
  stayEstimate: number;
  activityEstimate: number;
  localTransferEstimate: number;
  insuranceEstimate: number;
  creatorExperienceEstimate: number;
  localMarketAddOns: number;
  taxesFeesEstimate: number;
  totalQuoteEstimate: number;
};

export type TiyaQuoteNote = {
  id: string;
  text: string;
  tone: "info" | "warning" | "success";
};

export function generateQuoteVersions(intent: TiyaTripIntent): TiyaQuoteVersion[] {
  return [
    {
      id: "budget",
      name: "Budget Quote",
      note: "Lean routing, value stays and core inclusions.",
      multiplierLabel: "Value",
      isRecommended: intent.budgetTier === "Economy",
    },
    {
      id: "standard",
      name: "Standard Quote",
      note: "Balanced package structure for most travellers.",
      multiplierLabel: "Balanced",
      isRecommended: intent.budgetTier === "Standard",
    },
    {
      id: "premium",
      name: "Premium Quote",
      note: "Higher comfort, better stay mix and smoother transfers.",
      multiplierLabel: "Premium",
      isRecommended: intent.budgetTier === "Premium",
    },
    {
      id: "luxury",
      name: "Luxury Quote",
      note: "Luxury stays, premium routing and upgraded inclusions.",
      multiplierLabel: "Luxury",
      isRecommended: intent.budgetTier === "Luxury" || intent.travelStyle === "Luxury",
    },
    {
      id: "creator",
      name: "Creator Curated Quote",
      note: "Creator experiences and local market add-ons included.",
      multiplierLabel: "Creator",
      isRecommended: intent.smartPreferences.includeCreatorSpots,
    },
  ];
}

export function generateQuoteSummary({
  intent,
  version,
}: {
  intent: TiyaTripIntent;
  version: TiyaQuoteVersion;
}): TiyaQuoteSummary {
  const packageSummary = getPackageSummary(intent);

  return {
    quoteTitle: `${version.name}: ${packageSummary.name}`,
    route: packageSummary.route,
    duration: packageSummary.duration,
    travellerCount: packageSummary.travellerCount,
    selectedPackageVariant: version.name,
    travelStyle: intent.travelStyle,
    budgetTier: intent.budgetTier,
    validityNote: "Indicative TPL quote valid for preview only until live inventory is checked.",
  };
}

export function generateQuoteBreakup({
  intent,
  plan,
  versionId,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  versionId: TiyaQuoteVersionId;
}): TiyaQuoteBreakup {
  const components = generatePackageComponents({ intent, plan });
  const packageVariants = generatePackageVariants(intent);
  const selectedVariant =
    packageVariants.find((variant) => variant.id === (versionId as TiyaPackageVariantId)) ??
    packageVariants[1];
  const price = calculatePackagePrice({
    components,
    variant: selectedVariant,
  });
  const componentAmount = (type: string) =>
    components
      .filter((component) => component.type === type && component.included)
      .reduce((sum, component) => sum + component.estimate, 0);
  const multiplier = selectedVariant.multiplier;
  const transportEstimate = Math.round(componentAmount("transport") * multiplier);
  const localTransferEstimate = Math.round(componentAmount("transfer") * multiplier);
  const stayEstimate = Math.round(componentAmount("stay") * multiplier);
  const activityEstimate = Math.round(componentAmount("activity") * multiplier);
  const insuranceEstimate = Math.round(componentAmount("insurance") * multiplier);
  const creatorExperienceEstimate = Math.round(componentAmount("creator") * multiplier);
  const localMarketAddOns = Math.round(componentAmount("market") * multiplier);

  return {
    baseTripCost: price.basePackageEstimate,
    transportEstimate,
    stayEstimate,
    activityEstimate,
    localTransferEstimate,
    insuranceEstimate,
    creatorExperienceEstimate,
    localMarketAddOns,
    taxesFeesEstimate: price.taxFeesEstimate,
    totalQuoteEstimate: price.totalEstimate,
  };
}

export function generateSmartQuoteNotes({
  intent,
  version,
}: {
  intent: TiyaTripIntent;
  version: TiyaQuoteVersion;
}): TiyaQuoteNote[] {
  const notes: TiyaQuoteNote[] = [
    {
      id: "inventory",
      text: "Price may vary based on live inventory, supplier availability and final booking date.",
      tone: "info",
    },
  ];

  if (intent.travelStyle === "Family" || intent.children > 0 || intent.seniors > 0) {
    notes.push({
      id: "family",
      text: "Best for family comfort when stays and transfers are confirmed together.",
      tone: "success",
    });
  }

  if (!intent.smartPreferences.includeInsurance) {
    notes.push({
      id: "insurance",
      text: "Insurance recommended before converting this quote into booking.",
      tone: "warning",
    });
  }

  if (
    intent.smartPreferences.includeCreatorSpots ||
    intent.smartPreferences.includeLocalMarket ||
    version.id === "creator"
  ) {
    notes.push({
      id: "creator-market",
      text: "Route includes creator/local market experiences in the quote simulation.",
      tone: "success",
    });
  }

  if (intent.transportMode === "Bike" || intent.travelStyle === "Adventure") {
    notes.push({
      id: "adventure",
      text: "Adventure quotes should be reviewed for route safety, fatigue and weather risk.",
      tone: "warning",
    });
  }

  return notes;
}
