import type { PlannerMarketplaceRecommendationPayload } from "@/types/ecosystem/planner/api";
import type { TiyaLocalMarketPick } from "../plannerTypes";
import { resolveMockPlannerService } from "./plannerServiceTypes";

export async function fetchPlannerMarketplaceRecommendations(
  destination: string,
  recommendations: TiyaLocalMarketPick[] = []
) {
  const payload: PlannerMarketplaceRecommendationPayload = {
    destination,
    recommendations: Array.isArray(recommendations) ? recommendations : [],
  };

  return resolveMockPlannerService(payload);
}
