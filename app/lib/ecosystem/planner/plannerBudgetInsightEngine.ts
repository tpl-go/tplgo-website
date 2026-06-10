import type {
  TiyaBudgetIntelligence,
  TiyaBudgetLine,
  TiyaTripIntent,
} from "./plannerTypes";

function amountFor(lines: TiyaBudgetLine[], label: string) {
  return (
    lines.find((line) => line.label.toLowerCase().includes(label))?.amount ?? 0
  );
}

export function generatePlannerBudgetIntelligence(args: {
  intent: TiyaTripIntent;
  budgetLines: TiyaBudgetLine[];
  totalBudget: number;
}): TiyaBudgetIntelligence {
  const transportSplit = amountFor(args.budgetLines, "transport");
  const staySplit = amountFor(args.budgetLines, "stay");
  const activitySplit = amountFor(args.budgetLines, "activit");
  const localTravel = amountFor(args.budgetLines, "local");
  const foodLocalSplit = Math.round(args.totalBudget * 0.1 + localTravel * 0.5);
  const flexibilityBuffer = Math.max(
    5000,
    Math.round(args.totalBudget * (args.intent.budgetTier === "Luxury" ? 0.16 : 0.11))
  );
  const economyComparison = Math.round(args.totalBudget * 0.72);
  const premiumComparison = Math.round(args.totalBudget * 1.28);
  const risk =
    args.intent.budgetTier === "Luxury" || args.totalBudget > 180000
      ? "high spend"
      : args.intent.budgetTier === "Economy"
        ? "safe"
        : "balanced";

  return {
    estimatedSpend: args.totalBudget,
    transportSplit,
    staySplit,
    activitySplit,
    foodLocalSplit,
    flexibilityBuffer,
    economyComparison,
    premiumComparison,
    risk,
  };
}
