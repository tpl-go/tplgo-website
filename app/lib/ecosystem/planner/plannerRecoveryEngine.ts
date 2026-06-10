import type { TiyaTripIntent } from "./plannerTypes";
import type {
  TiyaAdaptiveDay,
  TiyaDynamicItineraryPlan,
} from "./plannerDynamicItineraryEngine";

export type TiyaRecoverySuggestion = {
  id: string;
  title: string;
  detail: string;
  actionType: "buffer-day" | "slow-day" | "scenic-halt" | "route-reduce";
};

export function generatePlannerRecoverySuggestions({
  intent,
  adaptiveDays,
  plan,
}: {
  intent: TiyaTripIntent;
  adaptiveDays: TiyaAdaptiveDay[];
  plan: TiyaDynamicItineraryPlan;
}): TiyaRecoverySuggestion[] {
  const safeDays = Array.isArray(adaptiveDays) ? adaptiveDays : [];
  const suggestions: TiyaRecoverySuggestion[] = [];
  const highFatigueDays = safeDays.filter((day) => day.fatigue.level === "High");
  const packedDays = safeDays.filter((day) => day.density === "Packed");

  if (highFatigueDays.length) {
    suggestions.push({
      id: "reduce-transfer",
      title: "Reduce one long transfer",
      detail: `Day ${highFatigueDays[0].day.day} has high fatigue. Split the segment or shorten the evening block.`,
      actionType: "route-reduce",
    });
  }

  if (intent.pace === "Packed" || packedDays.length > 1) {
    suggestions.push({
      id: "buffer-day",
      title: "Add buffer day",
      detail: "Insert one recovery buffer after the densest activity window.",
      actionType: "buffer-day",
    });
  }

  if (intent.smartPreferences.preferScenicRoute) {
    suggestions.push({
      id: "scenic-halt",
      title: `Add recovery stay in ${plan.recommendedRecoveryCity}`,
      detail: "Use a scenic halt to break the route flow and protect daylight movement.",
      actionType: "scenic-halt",
    });
  }

  if (intent.smartPreferences.includeLocalMarket) {
    suggestions.push({
      id: "market-evening",
      title: "Shift market exploration to evening",
      detail: "Keep local market discovery after the main transfer and before late fatigue begins.",
      actionType: "slow-day",
    });
  }

  suggestions.push({
    id: "avoid-back-to-back",
    title: "Avoid aggressive back-to-back movement",
    detail: "Keep one light day between transfer-heavy or adventure-heavy days.",
    actionType: "route-reduce",
  });

  return suggestions.slice(0, 4);
}
