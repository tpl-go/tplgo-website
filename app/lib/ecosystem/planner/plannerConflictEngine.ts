import type { TiyaRouteScenario } from "./plannerScenarioEngine";
import type { TiyaTripVariant } from "./plannerVariantEngine";
import type { TiyaTripIntent } from "./plannerTypes";
import type { TiyaGroupMember } from "./plannerGroupEngine";

export type TiyaGroupConflict = {
  id: string;
  title: string;
  detail: string;
  compromiseSuggestion: string;
  bestFitScenario: string;
  severity: "Low" | "Medium" | "High";
};

function hasBudgetSpread(members: TiyaGroupMember[]) {
  const budgetRank = {
    Economy: 1,
    Standard: 2,
    Premium: 3,
    Luxury: 4,
  };
  const ranks = members.map((member) => budgetRank[member.budgetPreference]);

  return Math.max(...ranks) - Math.min(...ranks) >= 2;
}

export function generatePlannerGroupConflicts({
  intent,
  members,
  scenarios,
  variants,
}: {
  intent: TiyaTripIntent;
  members: TiyaGroupMember[];
  scenarios: TiyaRouteScenario[];
  variants: TiyaTripVariant[];
}): TiyaGroupConflict[] {
  const safeMembers = Array.isArray(members) ? members : [];
  const safeScenarios = Array.isArray(scenarios) ? scenarios : [];
  const safeVariants = Array.isArray(variants) ? variants : [];
  const conflicts: TiyaGroupConflict[] = [];
  const recommendedScenario =
    safeScenarios.find((scenario) => scenario.isRecommended)?.name ||
    "Scenic Route";
  const recommendedVariant =
    safeVariants.find((variant) => variant.isRecommended)?.name ||
    "Premium Variant";
  const comfortMembers = safeMembers.filter(
    (member) => member.comfortPreference === "Comfort"
  );
  const adventureMembers = safeMembers.filter(
    (member) => member.adventurePreference >= 80
  );
  const familySignals =
    intent.travelStyle === "Family" ||
    safeMembers.some((member) => member.travellerType === "Senior");

  if (safeMembers.length && hasBudgetSpread(safeMembers)) {
    conflicts.push({
      id: "budget-mismatch",
      title: "Budget mismatch",
      detail: "The group has economy and premium/luxury spend expectations.",
      compromiseSuggestion:
        "Use premium stays for key nights and economy activity windows on lighter days.",
      bestFitScenario:
        intent.budgetTier === "Economy" ? "Budget Route" : recommendedVariant,
      severity: "High",
    });
  }

  if (intent.pace === "Packed" && comfortMembers.length) {
    conflicts.push({
      id: "pace-mismatch",
      title: "Pace mismatch",
      detail: "Packed pacing may stress comfort-first travellers.",
      compromiseSuggestion:
        "Add a late morning start or rest block after the longest transfer.",
      bestFitScenario: "Family Safe Route",
      severity: "Medium",
    });
  }

  if (
    (intent.travelStyle === "Luxury" || intent.budgetTier === "Luxury") &&
    safeMembers.some((member) => member.budgetPreference === "Economy")
  ) {
    conflicts.push({
      id: "luxury-budget",
      title: "Luxury vs budget conflict",
      detail: "Luxury planning may overrun the group's value-sensitive members.",
      compromiseSuggestion:
        "Keep premium transport and choose standard stays for non-core nights.",
      bestFitScenario: "Premium Variant",
      severity: "High",
    });
  }

  if (adventureMembers.length && comfortMembers.length) {
    conflicts.push({
      id: "adventure-comfort",
      title: "Adventure vs comfort conflict",
      detail: "Adventure-heavy travellers and comfort-first travellers have different intensity targets.",
      compromiseSuggestion:
        "Split the adventure block into optional activity and relaxed local exploration tracks.",
      bestFitScenario: recommendedScenario,
      severity: "Medium",
    });
  }

  if (intent.interests.includes("Nightlife") && familySignals) {
    conflicts.push({
      id: "nightlife-family",
      title: "Nightlife vs family mismatch",
      detail: "Nightlife windows may not fit seniors, children or family-safe timing.",
      compromiseSuggestion:
        "Keep evening food/culture stops and make late-night plans optional.",
      bestFitScenario: "Family Safe Route",
      severity: "Medium",
    });
  }

  if (!conflicts.length) {
    conflicts.push({
      id: "balanced-group",
      title: "Group alignment looks workable",
      detail: "Current preferences are compatible enough for one shared plan.",
      compromiseSuggestion:
        "Keep one optional activity block for different energy levels.",
      bestFitScenario: recommendedScenario,
      severity: "Low",
    });
  }

  return conflicts;
}
