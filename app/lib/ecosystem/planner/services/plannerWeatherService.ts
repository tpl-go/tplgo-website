import type { PlannerWeatherInsightsPayload } from "@/types/ecosystem/planner/api";
import type { TiyaTripIntent } from "../plannerTypes";
import { resolveMockPlannerService } from "./plannerServiceTypes";

export async function simulatePlannerWeather(
  intent: TiyaTripIntent,
  payload?: Partial<PlannerWeatherInsightsPayload>
) {
  const data: PlannerWeatherInsightsPayload = {
    seasonScore: payload?.seasonScore ?? 78,
    weatherReadiness: payload?.weatherReadiness ?? 74,
    routeAdvice: Array.isArray(payload?.routeAdvice)
      ? payload.routeAdvice
      : [`Keep ${intent.toCity || "destination"} route weather-aware.`],
    simulatedCards: Array.isArray(payload?.simulatedCards)
      ? payload.simulatedCards
      : [],
  };

  return resolveMockPlannerService(data);
}
