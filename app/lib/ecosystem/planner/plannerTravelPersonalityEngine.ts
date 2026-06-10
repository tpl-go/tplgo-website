import type { TiyaTravelMemoryProfile } from "./plannerMemoryEngine";

export type TiyaTravelPersonality = {
  label: string;
  score: number;
  note: string;
  traits: string[];
};

export type TiyaHabitMetric = {
  label: string;
  value: string;
  score: number;
};

export function generateTravelPersonality(
  profile: TiyaTravelMemoryProfile
): TiyaTravelPersonality {
  const styles = Array.isArray(profile.favouriteTravelStyles)
    ? profile.favouriteTravelStyles
    : [];
  const activities = Array.isArray(profile.activityPreferencePattern)
    ? profile.activityPreferencePattern
    : [];
  const label =
    profile.preferredBudgetTier === "Economy"
      ? "Budget optimizer"
      : styles.includes("Luxury") || profile.preferredBudgetTier === "Luxury"
        ? "Luxury traveller"
        : styles.includes("Family")
          ? "Family-first traveller"
          : profile.creatorLocalMarketInterest >= 65
            ? "Creator-focused traveller"
            : profile.comfortAdventureTendency === "Adventure"
              ? "Explorer traveller"
              : "Comfort traveller";

  return {
    label,
    score:
      label === "Creator-focused traveller"
        ? profile.creatorLocalMarketInterest
        : profile.comfortAdventureTendency === "Adventure"
          ? 82
          : 76,
    note: `${label} pattern based on ${profile.tripCount} local planner signal${profile.tripCount === 1 ? "" : "s"}.`,
    traits: [
      profile.routePreference,
      `${profile.preferredStayStyle} stay mix`,
      `${profile.averageTripIntensity} pace`,
      activities[0] ? `${activities[0]} leaning` : "Flexible activities",
    ],
  };
}

export function generateHabitMetrics(
  profile: TiyaTravelMemoryProfile
): TiyaHabitMetric[] {
  return [
    {
      label: "Travel pattern",
      value: profile.favouriteTravelStyles.join(" + "),
      score: 78,
    },
    {
      label: "Booking tendency",
      value: `${profile.preferredTransport} · ${profile.preferredStayStyle}`,
      score: 74,
    },
    {
      label: "Comfort trend",
      value: profile.comfortAdventureTendency,
      score: profile.comfortAdventureTendency === "Comfort" ? 86 : 70,
    },
    {
      label: "Average trip intensity",
      value: profile.averageTripIntensity,
      score: profile.averageTripIntensity === "Packed" ? 82 : 68,
    },
    {
      label: "Seasonal preference",
      value: profile.seasonalPreference,
      score: 72,
    },
    {
      label: "Route preference",
      value: profile.routePreference,
      score: profile.routePreference === "Scenic routes" ? 88 : 70,
    },
  ];
}

export function generateRepeatTravellerInsights(
  profile: TiyaTravelMemoryProfile
) {
  const insights = [
    `You usually prefer ${profile.routePreference.toLowerCase()}.`,
    `You often select ${profile.preferredStayStyle.toLowerCase()} stays.`,
    `Your trips trend toward ${profile.averageTripIntensity.toLowerCase()} pace.`,
  ];

  if (profile.creatorLocalMarketInterest >= 55) {
    insights.push("You frequently explore creator or local market layers.");
  }

  if (profile.favouriteDestinations[0]) {
    insights.push(`Your saved planning history points toward ${profile.favouriteDestinations[0]}.`);
  }

  return insights;
}
