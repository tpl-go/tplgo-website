import { getPlannerBudgetTotal } from "./plannerBudgetEngine";
import type {
  TiyaCreatorPick,
  TiyaGeneratedPlan,
  TiyaLocalMarketPick,
  TiyaSuggestion,
  TiyaTripIntent,
} from "./plannerTypes";

export type TiyaPackageComponentType =
  | "transport"
  | "stay"
  | "activity"
  | "transfer"
  | "insurance"
  | "creator"
  | "market";

export type TiyaPackageComponent = {
  id: string;
  type: TiyaPackageComponentType;
  title: string;
  detail: string;
  estimate: number;
  included: boolean;
};

export type TiyaPackageVariantId =
  | "budget"
  | "standard"
  | "premium"
  | "luxury"
  | "creator";

export type TiyaPackageVariant = {
  id: TiyaPackageVariantId;
  name: string;
  description: string;
  multiplier: number;
  highlight: boolean;
};

export type TiyaPackagePrice = {
  basePackageEstimate: number;
  transportEstimate: number;
  stayEstimate: number;
  activityEstimate: number;
  addOnsEstimate: number;
  taxFeesEstimate: number;
  totalEstimate: number;
};

function getDuration(intent: TiyaTripIntent) {
  const start = new Date(intent.startDate);
  const end = new Date(intent.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 5;
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
}

function getTravellerCount(intent: TiyaTripIntent) {
  return intent.adults + intent.children + intent.seniors;
}

export function buildPackageName(intent: TiyaTripIntent) {
  const style =
    intent.travelStyle === "Luxury"
      ? "Luxury"
      : intent.travelStyle === "Adventure"
        ? "Adventure"
        : intent.travelStyle === "Spiritual"
          ? "Spiritual"
          : intent.smartPreferences.includeCreatorSpots
            ? "Creator Curated"
            : intent.budgetTier;

  return `${style} ${intent.toCity} TPL Package`;
}

export function getPackageSummary(intent: TiyaTripIntent) {
  return {
    name: buildPackageName(intent),
    duration: `${getDuration(intent)} Days / ${Math.max(0, getDuration(intent) - 1)} Nights`,
    route: `${intent.fromCity} to ${intent.toCity}`,
    travellerCount: getTravellerCount(intent),
    budgetTier: intent.budgetTier,
    selectedTransport: intent.transportMode,
    selectedStay: intent.stayPreference,
  };
}

export function generatePackageVariants(intent: TiyaTripIntent): TiyaPackageVariant[] {
  return [
    {
      id: "budget",
      name: "Budget Package",
      description: "Value stays, efficient transfers and core activities.",
      multiplier: 0.78,
      highlight: intent.budgetTier === "Economy",
    },
    {
      id: "standard",
      name: "Standard Package",
      description: "Balanced stays, transport and activity coverage.",
      multiplier: 1,
      highlight: intent.budgetTier === "Standard",
    },
    {
      id: "premium",
      name: "Premium Package",
      description: "Better stays, smoother transfers and curated experiences.",
      multiplier: 1.24,
      highlight: intent.budgetTier === "Premium",
    },
    {
      id: "luxury",
      name: "Luxury Package",
      description: "High-comfort stays, premium routing and luxury add-ons.",
      multiplier: 1.65,
      highlight: intent.budgetTier === "Luxury" || intent.travelStyle === "Luxury",
    },
    {
      id: "creator",
      name: "Creator Curated Package",
      description: "Creator picks, local market stops and experience-led routing.",
      multiplier: 1.18,
      highlight: intent.smartPreferences.includeCreatorSpots,
    },
  ];
}

export function generatePackageComponents({
  intent,
  plan,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
}): TiyaPackageComponent[] {
  const baseTotal = getPlannerBudgetTotal(intent);
  const suggestions = Array.isArray(plan.suggestions) ? plan.suggestions : [];
  const creators = Array.isArray(plan.creatorPicks) ? plan.creatorPicks : [];
  const marketProducts = Array.isArray(plan.localMarketPicks)
    ? plan.localMarketPicks
    : [];
  const staySuggestion = suggestions.find(
    (suggestion: TiyaSuggestion) => suggestion.category === "Stay"
  );
  const activitySuggestion = suggestions.find(
    (suggestion: TiyaSuggestion) => suggestion.category === "Activity"
  );
  const creatorPick = creators[0] as TiyaCreatorPick | undefined;
  const marketPick = marketProducts[0] as TiyaLocalMarketPick | undefined;

  return [
    {
      id: "transport",
      type: "transport",
      title: `${intent.transportMode} transport`,
      detail: `${intent.fromCity} to ${intent.toCity} route movement.`,
      estimate: Math.round(baseTotal * 0.24),
      included: true,
    },
    {
      id: "stay",
      type: "stay",
      title: `${intent.stayPreference} stay cluster`,
      detail: staySuggestion?.detail || `${intent.stayPreference} options for ${intent.toCity}.`,
      estimate: Math.round(baseTotal * 0.34),
      included: intent.smartPreferences.includeStays,
    },
    {
      id: "activity",
      type: "activity",
      title: "Activity bundle",
      detail:
        activitySuggestion?.detail ||
        `${intent.interests.slice(0, 3).join(", ") || "Core"} experiences included.`,
      estimate: Math.round(baseTotal * 0.16),
      included: true,
    },
    {
      id: "transfer",
      type: "transfer",
      title: "Cab/local transfer",
      detail: "Airport, station or sightseeing movement support.",
      estimate: Math.round(baseTotal * 0.1),
      included: ["Cab", "Self-drive Car", "EV", "Mixed Mode"].includes(intent.transportMode),
    },
    {
      id: "insurance",
      type: "insurance",
      title: "Trip insurance",
      detail: "Trip protection and emergency readiness.",
      estimate: Math.round(baseTotal * 0.035),
      included: intent.smartPreferences.includeInsurance,
    },
    {
      id: "creator",
      type: "creator",
      title: creatorPick?.specialty || "Creator experience",
      detail: creatorPick
        ? `${creatorPick.creatorName} pick for ${creatorPick.destination}.`
        : "Creator-led photo, food or culture add-on.",
      estimate: Math.round(baseTotal * 0.075),
      included: intent.smartPreferences.includeCreatorSpots,
    },
    {
      id: "market",
      type: "market",
      title: marketPick?.productName || "Local market products",
      detail: marketPick
        ? `${marketPick.specialtyLabel} from ${marketPick.localRegion}.`
        : "Destination-linked local market add-ons.",
      estimate: Math.round(baseTotal * 0.045),
      included: intent.smartPreferences.includeLocalMarket,
    },
  ];
}

export function calculatePackagePrice({
  components,
  variant,
}: {
  components: TiyaPackageComponent[];
  variant: TiyaPackageVariant;
}): TiyaPackagePrice {
  const safeComponents = Array.isArray(components) ? components : [];
  const includedComponents = safeComponents.filter((component) => component.included);
  const componentAmount = (type: TiyaPackageComponentType) =>
    includedComponents
      .filter((component) => component.type === type)
      .reduce((sum, component) => sum + component.estimate, 0);
  const transportEstimate =
    componentAmount("transport") + componentAmount("transfer");
  const stayEstimate = componentAmount("stay");
  const activityEstimate = componentAmount("activity");
  const addOnsEstimate =
    componentAmount("insurance") + componentAmount("creator") + componentAmount("market");
  const basePackageEstimate = Math.round(
    (transportEstimate + stayEstimate + activityEstimate + addOnsEstimate) *
      variant.multiplier
  );
  const taxFeesEstimate = Math.round(basePackageEstimate * 0.09);

  return {
    basePackageEstimate,
    transportEstimate: Math.round(transportEstimate * variant.multiplier),
    stayEstimate: Math.round(stayEstimate * variant.multiplier),
    activityEstimate: Math.round(activityEstimate * variant.multiplier),
    addOnsEstimate: Math.round(addOnsEstimate * variant.multiplier),
    taxFeesEstimate,
    totalEstimate: basePackageEstimate + taxFeesEstimate,
  };
}
