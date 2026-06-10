import type { PlannerCreatorRecommendationPayload } from "@/types/ecosystem/planner/api";
import type { TiyaCreatorPick } from "../plannerTypes";
import { resolveMockPlannerService } from "./plannerServiceTypes";

export async function fetchPlannerCreatorRecommendations(
  destination: string,
  recommendations: TiyaCreatorPick[] = []
) {
  const payload: PlannerCreatorRecommendationPayload = {
    destination,
    recommendations: Array.isArray(recommendations) ? recommendations : [],
  };

  return resolveMockPlannerService(payload);
}
