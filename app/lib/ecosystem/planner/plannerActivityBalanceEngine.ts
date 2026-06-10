import type { TiyaExperience } from "./plannerExperienceEngine";
import type { TiyaDayPlan, TiyaTripIntent } from "./plannerTypes";

export type TiyaActivityBalanceInsight = {
  id: string;
  title: string;
  detail: string;
  tone: "green" | "orange" | "blue";
};

export function generatePlannerActivityBalance({
  intent,
  days,
  experiences,
}: {
  intent: TiyaTripIntent;
  days: TiyaDayPlan[];
  experiences: TiyaExperience[];
}): TiyaActivityBalanceInsight[] {
  const safeDays = Array.isArray(days) ? days : [];
  const safeExperiences = Array.isArray(experiences) ? experiences : [];
  const highIntensityCount = safeExperiences.filter(
    (experience) => experience.intensity === "High" && experience.isHighlighted
  ).length;
  const eveningExperiences = safeExperiences.filter((experience) =>
    ["17:30", "18:00", "20:30", "Sunset"].includes(experience.bestTime)
  ).length;
  const lowFatigueAvailable = safeExperiences.some(
    (experience) => experience.fatigueImpact <= 40 && experience.isHighlighted
  );
  const insights: TiyaActivityBalanceInsight[] = [];

  if (highIntensityCount > 1 || intent.pace === "Packed") {
    insights.push({
      id: "too-many-activities",
      title: "Too many activities watch",
      detail: "Keep only one high-intensity activity on transfer-heavy or packed days.",
      tone: "orange",
    });
  }

  if (intent.seniors > 0 || intent.children > 0 || lowFatigueAvailable) {
    insights.push({
      id: "family-comfort",
      title: "Family comfort note",
      detail: "Low-fatigue experiences are available for seniors, children or slower group pacing.",
      tone: "green",
    });
  }

  if (intent.smartPreferences.includeLocalMarket) {
    insights.push({
      id: "evening-market",
      title: "Evening market suggestion",
      detail: "Market activity fits best after main sightseeing and before late fatigue begins.",
      tone: "blue",
    });
  }

  if (safeDays.length > 3 && intent.pace !== "Packed") {
    insights.push({
      id: "rest-day",
      title: "Rest-day suggestion",
      detail: "Reserve one lighter day for food, shopping or culture instead of stacked activities.",
      tone: "green",
    });
  }

  if (eveningExperiences) {
    insights.push({
      id: "sunrise-sunset",
      title: "Sunrise/sunset slot suggestion",
      detail: "Nature and creator stops get stronger fit in sunrise or sunset windows.",
      tone: "blue",
    });
  }

  return insights.slice(0, 5);
}
