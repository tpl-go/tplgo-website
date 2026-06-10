import type { TiyaDayPlan, TiyaRouteOption, TiyaTripIntent } from "./plannerTypes";
import type { TiyaGroupMember } from "./plannerGroupEngine";

export type TiyaDayDensity = "Light" | "Balanced" | "Packed";

function clampScore(value: number) {
  return Math.max(25, Math.min(98, Math.round(value)));
}

export function calculatePlannerDayDensity({
  day,
  intent,
  selectedRoute,
  groupMembers = [],
}: {
  day: TiyaDayPlan;
  intent: TiyaTripIntent;
  selectedRoute?: TiyaRouteOption;
  groupMembers?: TiyaGroupMember[];
}) {
  const safeItems = Array.isArray(day.items) ? day.items : [];
  const safeGroupMembers = Array.isArray(groupMembers) ? groupMembers : [];
  const seniors = safeGroupMembers.filter(
    (member) => member.travellerType === "Senior"
  ).length;
  const transportItems = safeItems.filter((item) => item.type === "transport");
  const activityItems = safeItems.filter((item) => item.type === "activity");
  const adventureTrip =
    intent.travelStyle === "Adventure" ||
    intent.transportMode === "Bike" ||
    intent.interests.includes("Trekking") ||
    selectedRoute?.id === "adventure";
  const base =
    activityItems.length * 20 +
    transportItems.length * 16 +
    (intent.pace === "Packed" ? 24 : intent.pace === "Relaxed" ? -10 : 8) +
    (adventureTrip ? 16 : 0) -
    seniors * 12;
  const score = clampScore(base + 34);
  const density: TiyaDayDensity =
    score >= 78 ? "Packed" : score <= 48 ? "Light" : "Balanced";

  return {
    score,
    density,
    activityCount: activityItems.length,
    transferCount: transportItems.length,
  };
}
