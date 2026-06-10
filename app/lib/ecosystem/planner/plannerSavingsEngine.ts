import type { TiyaBudgetLine, TiyaRouteOption, TiyaTripIntent } from "./plannerTypes";

export type TiyaSavingsMeterData = {
  estimatedSavings: number;
  savingsPercent: number;
  comfortImpact: number;
  scenicImpact: number;
  travelIntensityImpact: number;
};

function amountFor(lines: TiyaBudgetLine[], label: string) {
  const safeLines = Array.isArray(lines) ? lines : [];
  return safeLines.find((line) => line.label === label)?.amount ?? 0;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(98, Math.round(value)));
}

export function generatePlannerSavingsMeter({
  intent,
  budgetLines,
  totalBudget,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  budgetLines: TiyaBudgetLine[];
  totalBudget: number;
  selectedRoute?: TiyaRouteOption;
}): TiyaSavingsMeterData {
  const transport = amountFor(budgetLines, "Transport");
  const stays = amountFor(budgetLines, "Stays");
  const localTravel = amountFor(budgetLines, "Local travel");
  const transportSavings =
    intent.transportMode === "Flight"
      ? Math.round(transport * 0.22)
      : intent.transportMode === "Cab"
        ? Math.round(transport * 0.14)
        : Math.round(transport * 0.08);
  const staySavings =
    intent.budgetTier === "Luxury" || intent.stayPreference === "Resort"
      ? Math.round(stays * 0.18)
      : Math.round(stays * 0.1);
  const routeSavings =
    selectedRoute?.id === "scenic" || selectedRoute?.id === "adventure"
      ? Math.round(localTravel * 0.12)
      : Math.round(localTravel * 0.06);
  const estimatedSavings = transportSavings + staySavings + routeSavings;

  return {
    estimatedSavings,
    savingsPercent: clampScore((estimatedSavings / Math.max(1, totalBudget)) * 100),
    comfortImpact: clampScore(
      72 +
        (intent.stayPreference === "Homestay" ? 8 : 0) -
        (intent.pace === "Packed" ? 10 : 0)
    ),
    scenicImpact: clampScore(
      selectedRoute?.scenicScore ??
        (intent.smartPreferences.preferScenicRoute ? 86 : 64)
    ),
    travelIntensityImpact: clampScore(
      100 - (intent.pace === "Packed" ? 72 : intent.pace === "Relaxed" ? 42 : 56)
    ),
  };
}
