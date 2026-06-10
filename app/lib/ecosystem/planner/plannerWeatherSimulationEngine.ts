import type { TiyaSeasonReadiness } from "./plannerSeasonEngine";
import type { TiyaRouteOption, TiyaTripIntent } from "./plannerTypes";

export type TiyaWeatherSimulationCard = {
  id: string;
  label: string;
  value: string;
  score: number;
  tone: "green" | "orange" | "red" | "blue";
  note: string;
};

function clampScore(value: number) {
  return Math.max(15, Math.min(98, Math.round(value)));
}

export function generatePlannerWeatherSimulation({
  intent,
  readiness,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  readiness: TiyaSeasonReadiness;
  selectedRoute?: TiyaRouteOption;
}): TiyaWeatherSimulationCard[] {
  const mountain = readiness.destinationType === "Mountain";
  const coastal = readiness.destinationType === "Coastal";
  const desert = readiness.destinationType === "Desert";
  const monsoon = readiness.seasonType === "Monsoon";
  const winter = readiness.seasonType === "Winter";
  const summer = readiness.seasonType === "Summer";
  const familyCaution = intent.children > 0 || intent.seniors > 0;
  const rainProbability = clampScore(coastal && monsoon ? 82 : monsoon ? 68 : 28);
  const snowProbability = clampScore(mountain && winter ? 76 : mountain ? 28 : 8);
  const fogCloudRisk = clampScore(winter || monsoon ? 58 : 26);
  const comfortLevel = clampScore(
    readiness.seasonScore - (familyCaution ? 8 : 0) - (selectedRoute?.riskLevel === "High" ? 8 : 0)
  );
  const daylightHours = winter ? "10.5 hrs" : summer ? "13 hrs" : "11.5 hrs";
  const visibility = clampScore(100 - Math.max(rainProbability, snowProbability, fogCloudRisk) * 0.65);
  const temperatureRange = mountain
    ? winter
      ? "-6°C to 8°C"
      : "8°C to 22°C"
    : desert
      ? summer
        ? "28°C to 43°C"
        : "12°C to 28°C"
      : coastal
        ? "23°C to 31°C"
        : "16°C to 30°C";

  return [
    {
      id: "temperature",
      label: "Temperature range",
      value: temperatureRange,
      score: comfortLevel,
      tone: comfortLevel >= 75 ? "green" : comfortLevel >= 52 ? "orange" : "red",
      note: "Seasonal comfort simulation based on destination profile.",
    },
    {
      id: "rain-snow",
      label: "Rain / snow probability",
      value: `${rainProbability}% rain · ${snowProbability}% snow`,
      score: clampScore(100 - Math.max(rainProbability, snowProbability)),
      tone: Math.max(rainProbability, snowProbability) > 70 ? "red" : "orange",
      note: "No live weather API; this is route-season mock intelligence.",
    },
    {
      id: "fog-cloud",
      label: "Fog / cloud risk",
      value: `${fogCloudRisk}%`,
      score: clampScore(100 - fogCloudRisk),
      tone: fogCloudRisk > 60 ? "red" : fogCloudRisk > 38 ? "orange" : "green",
      note: "Affects route visibility and sunrise/sunset planning.",
    },
    {
      id: "daylight",
      label: "Daylight hours",
      value: daylightHours,
      score: winter ? 66 : 84,
      tone: winter ? "orange" : "green",
      note: "Used for early transfer and scenic window planning.",
    },
    {
      id: "visibility",
      label: "Route visibility",
      value: `${visibility}%`,
      score: visibility,
      tone: visibility >= 72 ? "green" : visibility >= 50 ? "orange" : "red",
      note: "Visibility accounts for season and route risk.",
    },
    {
      id: "comfort",
      label: "Comfort level",
      value: `${comfortLevel}%`,
      score: comfortLevel,
      tone: comfortLevel >= 75 ? "green" : comfortLevel >= 52 ? "orange" : "red",
      note: familyCaution
        ? "Family/senior caution reduces comfort tolerance."
        : "Comfort profile fits current traveller mix.",
    },
  ];
}
