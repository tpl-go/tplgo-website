import type { TiyaGroupMember } from "./plannerGroupEngine";
import {
  calculatePlannerDayDensity,
  type TiyaDayDensity,
} from "./plannerDensityEngine";
import {
  calculatePlannerDayFatigue,
  calculatePlannerFatigueSummary,
  type TiyaDayFatigue,
  type TiyaFatigueSummary,
} from "./plannerFatigueEngine";
import type {
  TiyaDayPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "./plannerTypes";

export type TiyaWeatherSimulation = {
  rainyRisk: number;
  snowRisk: number;
  crowdedPeriod: number;
  daylightOptimization: number;
  scenicWindow: number;
  note: string;
};

export type TiyaAdaptiveDay = {
  day: TiyaDayPlan;
  density: TiyaDayDensity;
  densityScore: number;
  fatigue: TiyaDayFatigue;
  distributionRole: "Travel day" | "Stay day" | "Activity day" | "Recovery day";
  stayLogic: string;
  flowAdjustment: string;
  weatherSignal: string;
};

export type TiyaDynamicItineraryPlan = {
  adaptiveDays: TiyaAdaptiveDay[];
  fatigueSummary: TiyaFatigueSummary;
  weather: TiyaWeatherSimulation;
  travelDays: number;
  stayDays: number;
  activityDays: number;
  recoveryDays: number;
  recommendedRecoveryCity: string;
  adjustmentSuggestions: string[];
};

function clampScore(value: number) {
  return Math.max(20, Math.min(98, Math.round(value)));
}

function getWeatherSimulation(intent: TiyaTripIntent): TiyaWeatherSimulation {
  const text = `${intent.toCity} ${intent.interests.join(" ")} ${intent.travelStyle}`.toLowerCase();
  const mountainTrip =
    text.includes("ladakh") ||
    text.includes("himachal") ||
    text.includes("sikkim") ||
    text.includes("uttarakhand") ||
    text.includes("trek");
  const coastalTrip =
    text.includes("kerala") || text.includes("goa") || text.includes("beach");
  const rainyRisk = clampScore(coastalTrip ? 68 : mountainTrip ? 42 : 36);
  const snowRisk = clampScore(mountainTrip ? 64 : 22);
  const crowdedPeriod = clampScore(
    intent.travelStyle === "Family" || intent.budgetTier === "Economy" ? 62 : 44
  );
  const daylightOptimization = intent.smartPreferences.avoidNightTravel ? 88 : 64;
  const scenicWindow = intent.smartPreferences.preferScenicRoute ? 90 : 66;

  return {
    rainyRisk,
    snowRisk,
    crowdedPeriod,
    daylightOptimization,
    scenicWindow,
    note: mountainTrip
      ? "Mountain flow keeps altitude and daylight windows visible."
      : coastalTrip
        ? "Rain buffer simulation protects open-air activity blocks."
        : "Weather flow keeps crowd and daylight buffers balanced.",
  };
}

function getDistributionRole({
  day,
  density,
  fatigue,
}: {
  day: TiyaDayPlan;
  density: TiyaDayDensity;
  fatigue: TiyaDayFatigue;
}): TiyaAdaptiveDay["distributionRole"] {
  const safeItems = Array.isArray(day.items) ? day.items : [];
  const hasTransfer = safeItems.some((item) => item.type === "transport");

  if (fatigue.level === "High") return "Recovery day";
  if (hasTransfer) return "Travel day";
  if (density === "Light") return "Stay day";
  return "Activity day";
}

function getStayLogic({
  intent,
  fatigue,
}: {
  intent: TiyaTripIntent;
  fatigue: TiyaDayFatigue;
}) {
  if (fatigue.level === "High") {
    return `Upgrade to recovery-friendly ${intent.stayPreference.toLowerCase()} with shorter transfers.`;
  }

  if (intent.budgetTier === "Luxury" || intent.travelStyle === "Luxury") {
    return "Keep premium stay continuity and reduce check-in friction.";
  }

  if (intent.stayPreference === "Homestay") {
    return "Balance homestay immersion with route access.";
  }

  return `${intent.stayPreference} fit remains aligned with current pacing.`;
}

function getFlowAdjustment({
  density,
  fatigue,
  intent,
}: {
  density: TiyaDayDensity;
  fatigue: TiyaDayFatigue;
  intent: TiyaTripIntent;
}) {
  if (fatigue.level === "High") return "Reduce aggressive transfer or insert a slow block.";
  if (density === "Packed") return "Keep priority activities and move flexible stops later.";
  if (density === "Light" && intent.pace !== "Relaxed") return "Use open buffer for market, food or creator stops.";
  return "Current flow is balanced for the selected intent.";
}

function getWeatherSignal(weather: TiyaWeatherSimulation, density: TiyaDayDensity) {
  if (weather.rainyRisk > 60 && density === "Packed") {
    return "Keep indoor backup for the densest activity block.";
  }

  if (weather.snowRisk > 55) {
    return "Protect morning departure and keep daylight transfer margin.";
  }

  if (weather.crowdedPeriod > 60) {
    return "Shift signature stops to early or late windows.";
  }

  return "Weather simulation supports current day flow.";
}

export function generatePlannerDynamicItinerary({
  days,
  intent,
  selectedRoute,
  groupMembers = [],
}: {
  days: TiyaDayPlan[];
  intent: TiyaTripIntent;
  selectedRoute?: TiyaRouteOption;
  groupMembers?: TiyaGroupMember[];
}): TiyaDynamicItineraryPlan {
  const safeDays = Array.isArray(days) ? days : [];
  const weather = getWeatherSimulation(intent);
  const adaptiveDays = safeDays.map((day) => {
    const densityResult = calculatePlannerDayDensity({
      day,
      intent,
      selectedRoute,
      groupMembers,
    });
    const fatigue = calculatePlannerDayFatigue({
      day,
      intent,
      selectedRoute,
      density: densityResult.density,
      groupMembers,
    });
    const distributionRole = getDistributionRole({
      day,
      density: densityResult.density,
      fatigue,
    });

    return {
      day,
      density: densityResult.density,
      densityScore: densityResult.score,
      fatigue,
      distributionRole,
      stayLogic: getStayLogic({ intent, fatigue }),
      flowAdjustment: getFlowAdjustment({
        density: densityResult.density,
        fatigue,
        intent,
      }),
      weatherSignal: getWeatherSignal(weather, densityResult.density),
    };
  });
  const travelDays = adaptiveDays.filter(
    (day) => day.distributionRole === "Travel day"
  ).length;
  const recoveryDays = adaptiveDays.filter(
    (day) => day.distributionRole === "Recovery day"
  ).length;
  const stayDays = adaptiveDays.filter(
    (day) => day.distributionRole === "Stay day"
  ).length;
  const activityDays = adaptiveDays.filter(
    (day) => day.distributionRole === "Activity day"
  ).length;
  const recommendedRecoveryCity =
    adaptiveDays.find((day) => day.fatigue.level === "High")?.day.city ||
    adaptiveDays[Math.max(0, Math.floor(adaptiveDays.length / 2))]?.day.city ||
    intent.toCity;

  return {
    adaptiveDays,
    fatigueSummary: calculatePlannerFatigueSummary({
      days: safeDays,
      intent,
      selectedRoute,
    }),
    weather,
    travelDays,
    stayDays,
    activityDays,
    recoveryDays,
    recommendedRecoveryCity,
    adjustmentSuggestions: [
      intent.pace === "Packed" ? "Compress optional stops into one window." : "",
      intent.pace === "Relaxed" ? "Preserve slow mornings and longer stays." : "",
      groupMembers.some((member) => member.travellerType === "Senior")
        ? "Reduce senior-sensitive transfer pressure."
        : "",
      selectedRoute?.id === "adventure"
        ? "Avoid aggressive back-to-back adventure movement."
        : "",
    ].filter(Boolean),
  };
}
