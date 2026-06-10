import type { TiyaInsight, TiyaTripIntent } from "./plannerTypes";

function clamp(score: number) {
  return Math.max(42, Math.min(98, Math.round(score)));
}

function valueFromScore(score: number) {
  if (score >= 84) return "High";
  if (score >= 68) return "Good";
  if (score >= 52) return "Moderate";
  return "Focused";
}

export function generatePlannerInsights(intent: TiyaTripIntent): TiyaInsight[] {
  const roadTrip = ["Self-drive Car", "Bike", "EV", "Cab"].includes(
    intent.transportMode
  );
  const adventure =
    intent.travelStyle === "Adventure" ||
    intent.interests.some((item) => ["Trekking", "Nature"].includes(item));
  const spiritual =
    intent.travelStyle === "Spiritual" || intent.interests.includes("Temples");
  const luxury =
    intent.travelStyle === "Luxury" ||
    intent.budgetTier === "Luxury" ||
    intent.stayPreference === "Resort" ||
    intent.stayPreference === "Villa";
  const packed = intent.pace === "Packed";

  const difficulty = clamp(
    58 + (roadTrip ? 16 : 0) + (adventure ? 12 : 0) + (packed ? 8 : 0)
  );
  const comfort = clamp(
    72 + (luxury ? 14 : 0) + (intent.transportMode === "Flight" ? 8 : 0) - (packed ? 10 : 0)
  );
  const scenic = clamp(
    64 +
      (intent.smartPreferences.preferScenicRoute ? 18 : 0) +
      (roadTrip ? 10 : 0) +
      (intent.interests.includes("Nature") ? 8 : 0)
  );
  const budgetFit = clamp(
    78 +
      (intent.budgetTier === "Premium" ? 8 : 0) +
      (intent.budgetTier === "Economy" ? -6 : 0) +
      (luxury ? -4 : 0)
  );
  const intensity = clamp(
    54 + (packed ? 24 : 0) + (intent.pace === "Relaxed" ? -8 : 0) + (adventure ? 8 : 0)
  );
  const weather = clamp(
    76 +
      (intent.interests.includes("Nature") ? -4 : 0) +
      (spiritual ? 6 : 0) +
      (intent.smartPreferences.avoidNightTravel ? 5 : 0)
  );

  return [
    { label: "Route difficulty", value: valueFromScore(difficulty), score: difficulty, tone: "orange" },
    { label: "Comfort score", value: valueFromScore(comfort), score: comfort, tone: "blue" },
    { label: "Scenic score", value: valueFromScore(scenic), score: scenic, tone: "green" },
    { label: "Budget fit", value: valueFromScore(budgetFit), score: budgetFit, tone: "blue" },
    { label: "Travel intensity", value: valueFromScore(intensity), score: intensity, tone: "slate" },
    { label: "Weather confidence", value: valueFromScore(weather), score: weather, tone: "green" },
  ];
}
