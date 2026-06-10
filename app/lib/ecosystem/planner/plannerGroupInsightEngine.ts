import { getGroupAverages, type TiyaGroupMember } from "./plannerGroupEngine";
import type { TiyaGroupConflict } from "./plannerConflictEngine";
import type { TiyaTripIntent } from "./plannerTypes";

export type TiyaGroupMoodInsight = {
  groupCompatibilityScore: number;
  tripHarmonyScore: number;
  comfortBalance: number;
  adventureBalance: number;
  spendingBalance: number;
};

export type TiyaGroupSuggestion = {
  id: string;
  title: string;
  detail: string;
};

function clampScore(value: number) {
  return Math.max(35, Math.min(98, Math.round(value)));
}

export function generatePlannerGroupMoodInsights({
  members,
  conflicts,
}: {
  members: TiyaGroupMember[];
  conflicts: TiyaGroupConflict[];
}): TiyaGroupMoodInsight {
  const safeMembers = Array.isArray(members) ? members : [];
  const safeConflicts = Array.isArray(conflicts) ? conflicts : [];
  const averages = getGroupAverages(safeMembers);
  const highConflictPenalty =
    safeConflicts.filter((conflict) => conflict.severity === "High").length * 14;
  const mediumConflictPenalty =
    safeConflicts.filter((conflict) => conflict.severity === "Medium").length *
    8;
  const comfortMembers = safeMembers.filter(
    (member) => member.comfortPreference === "Comfort"
  ).length;
  const ruggedMembers = safeMembers.filter(
    (member) => member.comfortPreference === "Rugged"
  ).length;
  const spendingTypes = new Set(
    safeMembers.map((member) => member.budgetPreference)
  ).size;

  return {
    groupCompatibilityScore: clampScore(
      88 - highConflictPenalty - mediumConflictPenalty
    ),
    tripHarmonyScore: clampScore(82 - safeConflicts.length * 6),
    comfortBalance: clampScore(82 - Math.abs(comfortMembers - ruggedMembers) * 8),
    adventureBalance: clampScore(100 - Math.abs(averages.adventurePreference - 68)),
    spendingBalance: clampScore(96 - (spendingTypes - 1) * 12),
  };
}

export function generatePlannerGroupSuggestions({
  intent,
  members,
  conflicts,
}: {
  intent: TiyaTripIntent;
  members: TiyaGroupMember[];
  conflicts: TiyaGroupConflict[];
}): TiyaGroupSuggestion[] {
  const safeMembers = Array.isArray(members) ? members : [];
  const safeConflicts = Array.isArray(conflicts) ? conflicts : [];
  const hasSenior = safeMembers.some((member) => member.travellerType === "Senior");
  const hasAdventure = safeMembers.some(
    (member) => member.adventurePreference >= 80
  );
  const hasCreator = safeMembers.some((member) => member.travellerType === "Creator");
  const budgetConflict = safeConflicts.some(
    (conflict) => conflict.id === "budget-mismatch"
  );
  const suggestions: TiyaGroupSuggestion[] = [];

  if (hasSenior || intent.travelStyle === "Family") {
    suggestions.push({
      id: "rest-day",
      title: "Add rest day for seniors",
      detail: "Keep one low-movement day after the longest transfer segment.",
    });
  }

  if (hasAdventure) {
    suggestions.push({
      id: "split-adventure",
      title: "Split adventure activity",
      detail: "Offer an optional trek or ride while comfort travellers take a local culture block.",
    });
  }

  if (intent.travelStyle === "Family") {
    suggestions.push({
      id: "family-premium-stay",
      title: "Premium stay for family comfort",
      detail: "Use a stronger stay base for safety, meals and easier transfers.",
    });
  }

  if (hasCreator || intent.smartPreferences.includeCreatorSpots) {
    suggestions.push({
      id: "creator-scenic-stop",
      title: "Scenic stop for creators",
      detail: "Add one route-fit creator stop without changing the core itinerary.",
    });
  }

  if (budgetConflict || intent.budgetTier === "Economy") {
    suggestions.push({
      id: "budget-optimization",
      title: "Budget optimization for group",
      detail: "Use shared cabs, grouped meals and mixed stay tiers to reduce pressure.",
    });
  }

  return suggestions.slice(0, 5);
}
