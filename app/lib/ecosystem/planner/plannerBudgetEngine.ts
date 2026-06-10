import type { TiyaBudgetLine, TiyaTripIntent } from "./plannerTypes";

const budgetTierTotals: Record<string, number> = {
  Economy: 52000,
  Standard: 86000,
  Premium: 132000,
  Luxury: 240000,
};

const transportMultipliers: Record<string, number> = {
  Flight: 1.18,
  Train: 0.72,
  Bus: 0.58,
  Cab: 0.92,
  "Self-drive Car": 0.86,
  Bike: 0.5,
  EV: 0.76,
  "Mixed Mode": 1,
};

const stayMultipliers: Record<string, number> = {
  Hotel: 1,
  Homestay: 0.82,
  Resort: 1.32,
  Hostel: 0.48,
  Camp: 0.62,
  Villa: 1.45,
  "No Stay Needed": 0,
};

export function getPlannerBudgetTotal(intent: TiyaTripIntent) {
  const customAmount = Number(intent.customBudgetAmount.replace(/[^0-9]/g, ""));

  if (customAmount > 0) {
    return customAmount;
  }

  return budgetTierTotals[intent.budgetTier] ?? budgetTierTotals.Standard;
}

export function generatePlannerBudget(intent: TiyaTripIntent): TiyaBudgetLine[] {
  const total = getPlannerBudgetTotal(intent);
  const transportShare =
    0.2 * (transportMultipliers[intent.transportMode] ?? 1);
  const stayShare =
    intent.smartPreferences.includeStays && intent.stayPreference !== "No Stay Needed"
      ? 0.36 * (stayMultipliers[intent.stayPreference] ?? 1)
      : 0.04;
  const activityShare = intent.interests.length > 4 ? 0.22 : 0.18;
  const localTravelShare =
    intent.smartPreferences.preferScenicRoute || intent.transportMode === "Cab"
      ? 0.16
      : 0.12;
  const rawShares = [
    ["Transport", transportShare, "orange"],
    ["Stays", stayShare, "blue"],
    ["Activities", activityShare, "green"],
    ["Local travel", localTravelShare, "slate"],
  ] as const;
  const shareTotal = rawShares.reduce((sum, [, share]) => sum + share, 0);

  return rawShares.map(([label, share, tone]) => ({
    label,
    amount: Math.round((total * share) / shareTotal),
    tone,
  }));
}
