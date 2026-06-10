import type { TiyaDayPlan, TiyaRouteOption, TiyaTripIntent } from "./plannerTypes";
import type { TiyaGroupMember } from "./plannerGroupEngine";
import type { TiyaDayDensity } from "./plannerDensityEngine";

export type TiyaDayFatigue = {
  score: number;
  level: "Low" | "Medium" | "High";
  indicators: string[];
  recoveryHint: string;
};

export type TiyaFatigueSummary = {
  longTravelStretch: number;
  overnightFatigue: number;
  altitudeFatigue: number;
  multiTransferOverload: number;
  overallFatigue: number;
};

function clampScore(value: number) {
  return Math.max(20, Math.min(98, Math.round(value)));
}

function isAltitudeTrip(intent: TiyaTripIntent) {
  const text = `${intent.toCity} ${intent.interests.join(" ")} ${intent.travelStyle}`.toLowerCase();

  return (
    text.includes("ladakh") ||
    text.includes("himachal") ||
    text.includes("sikkim") ||
    text.includes("uttarakhand") ||
    text.includes("trek")
  );
}

export function calculatePlannerDayFatigue({
  day,
  intent,
  selectedRoute,
  density,
  groupMembers = [],
}: {
  day: TiyaDayPlan;
  intent: TiyaTripIntent;
  selectedRoute?: TiyaRouteOption;
  density: TiyaDayDensity;
  groupMembers?: TiyaGroupMember[];
}): TiyaDayFatigue {
  const safeItems = Array.isArray(day.items) ? day.items : [];
  const safeGroupMembers = Array.isArray(groupMembers) ? groupMembers : [];
  const seniors = safeGroupMembers.filter(
    (member) => member.travellerType === "Senior"
  ).length;
  const transferCount = safeItems.filter((item) => item.type === "transport").length;
  const lateItems = safeItems.filter((item) => {
    const hour = Number(item.time.split(":")[0]);
    return Number.isFinite(hour) && hour >= 20;
  }).length;
  const altitudeRisk = isAltitudeTrip(intent) ? 16 : 0;
  const roadRisk =
    ["Bike", "Self-drive Car", "EV"].includes(intent.transportMode) ||
    selectedRoute?.id === "adventure"
      ? 14
      : 4;
  const densityRisk = density === "Packed" ? 22 : density === "Balanced" ? 10 : 0;
  const score = clampScore(
    28 + transferCount * 16 + lateItems * 14 + seniors * 10 + altitudeRisk + roadRisk + densityRisk
  );
  const indicators = [
    transferCount > 0 ? "travel stretch" : "",
    lateItems > 0 ? "late movement" : "",
    altitudeRisk ? "altitude sensitivity" : "",
    transferCount > 1 ? "multi-transfer load" : "",
    seniors ? "senior comfort buffer" : "",
  ].filter(Boolean);
  const level: TiyaDayFatigue["level"] =
    score >= 76 ? "High" : score >= 52 ? "Medium" : "Low";

  return {
    score,
    level,
    indicators,
    recoveryHint:
      level === "High"
        ? "Add recovery stay or reduce back-to-back movement."
        : level === "Medium"
          ? "Keep a buffer window and avoid late activity pressure."
          : "Current day load is manageable.",
  };
}

export function calculatePlannerFatigueSummary({
  days,
  intent,
  selectedRoute,
}: {
  days: TiyaDayPlan[];
  intent: TiyaTripIntent;
  selectedRoute?: TiyaRouteOption;
}): TiyaFatigueSummary {
  const safeDays = Array.isArray(days) ? days : [];
  const transferDays = safeDays.filter((day) =>
    (Array.isArray(day.items) ? day.items : []).some((item) => item.type === "transport")
  ).length;
  const overnightFatigue = intent.smartPreferences.avoidNightTravel ? 28 : 58;
  const altitudeFatigue = isAltitudeTrip(intent) ? 72 : 34;
  const multiTransferOverload =
    transferDays > 2 || selectedRoute?.riskLevel === "High" ? 68 : 38;
  const longTravelStretch =
    ["Bike", "Self-drive Car", "EV"].includes(intent.transportMode) ||
    selectedRoute?.id === "adventure"
      ? 74
      : 46;

  return {
    longTravelStretch,
    overnightFatigue,
    altitudeFatigue,
    multiTransferOverload,
    overallFatigue: clampScore(
      (longTravelStretch + overnightFatigue + altitudeFatigue + multiTransferOverload) / 4
    ),
  };
}
