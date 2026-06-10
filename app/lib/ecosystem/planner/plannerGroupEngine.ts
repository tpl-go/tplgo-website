import type { TiyaGeneratedPlan, TiyaTripIntent } from "./plannerTypes";

export type TiyaGroupMember = {
  id: string;
  name: string;
  travellerType: "Adult" | "Child" | "Senior" | "Creator";
  comfortPreference: "Comfort" | "Balanced" | "Rugged";
  budgetPreference: "Economy" | "Standard" | "Premium" | "Luxury";
  travelMood: "Relaxed" | "Social" | "Explorer" | "Spiritual" | "Foodie";
  activityIntensity: number;
  foodPreference: number;
  spiritualPreference: number;
  adventurePreference: number;
};

function clampScore(value: number) {
  return Math.max(35, Math.min(98, Math.round(value)));
}

export function generatePlannerGroupMembers(
  intent: TiyaTripIntent,
  plan: TiyaGeneratedPlan
): TiyaGroupMember[] {
  const destination = intent.toCity || "Destination";
  const familyTrip = intent.travelStyle === "Family";
  const adventureTrip =
    intent.travelStyle === "Adventure" ||
    intent.transportMode === "Bike" ||
    intent.interests.includes("Trekking");
  const spiritualTrip =
    intent.travelStyle === "Spiritual" || intent.interests.includes("Temples");
  const foodieTrip = intent.interests.includes("Food");

  const members: TiyaGroupMember[] = [
    {
      id: "member-primary",
      name: "Trip lead",
      travellerType: "Adult",
      comfortPreference:
        intent.budgetTier === "Luxury" ? "Comfort" : "Balanced",
      budgetPreference: intent.budgetTier as TiyaGroupMember["budgetPreference"],
      travelMood: adventureTrip ? "Explorer" : foodieTrip ? "Foodie" : "Social",
      activityIntensity: intent.pace === "Packed" ? 82 : 64,
      foodPreference: foodieTrip ? 92 : 68,
      spiritualPreference: spiritualTrip ? 86 : 52,
      adventurePreference: adventureTrip ? 94 : 58,
    },
    {
      id: "member-comfort",
      name: familyTrip ? "Parent comfort" : "Comfort seeker",
      travellerType: familyTrip ? "Senior" : "Adult",
      comfortPreference: "Comfort",
      budgetPreference: intent.budgetTier === "Economy" ? "Standard" : "Premium",
      travelMood: spiritualTrip ? "Spiritual" : "Relaxed",
      activityIntensity: familyTrip ? 42 : 54,
      foodPreference: 72,
      spiritualPreference: spiritualTrip ? 90 : 58,
      adventurePreference: 38,
    },
    {
      id: "member-adventure",
      name: adventureTrip ? "Trail partner" : "Explorer friend",
      travellerType: "Adult",
      comfortPreference: adventureTrip ? "Rugged" : "Balanced",
      budgetPreference: "Standard",
      travelMood: "Explorer",
      activityIntensity: adventureTrip ? 94 : 78,
      foodPreference: 64,
      spiritualPreference: 42,
      adventurePreference: 92,
    },
    {
      id: "member-creator",
      name: `${destination} creator`,
      travellerType: "Creator",
      comfortPreference: "Balanced",
      budgetPreference: "Premium",
      travelMood: foodieTrip ? "Foodie" : "Social",
      activityIntensity: 76,
      foodPreference: foodieTrip ? 94 : 74,
      spiritualPreference: spiritualTrip ? 78 : 46,
      adventurePreference: adventureTrip ? 86 : 62,
    },
  ];

  return members.slice(0, Math.max(3, Math.min(4, plan.travellerCount || 4)));
}

export function getGroupAverages(members: TiyaGroupMember[]) {
  const safeMembers = Array.isArray(members) ? members : [];
  const divisor = Math.max(1, safeMembers.length);
  const sum = safeMembers.reduce(
    (totals, member) => ({
      activityIntensity: totals.activityIntensity + member.activityIntensity,
      foodPreference: totals.foodPreference + member.foodPreference,
      spiritualPreference:
        totals.spiritualPreference + member.spiritualPreference,
      adventurePreference:
        totals.adventurePreference + member.adventurePreference,
    }),
    {
      activityIntensity: 0,
      foodPreference: 0,
      spiritualPreference: 0,
      adventurePreference: 0,
    }
  );

  return {
    activityIntensity: clampScore(sum.activityIntensity / divisor),
    foodPreference: clampScore(sum.foodPreference / divisor),
    spiritualPreference: clampScore(sum.spiritualPreference / divisor),
    adventurePreference: clampScore(sum.adventurePreference / divisor),
  };
}
