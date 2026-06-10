import type { PlannerOptimizationPayload } from "@/types/ecosystem/planner/api";
import { resolveMockPlannerService } from "./plannerServiceTypes";

export async function syncPlannerOptimization(payload: PlannerOptimizationPayload) {
  return resolveMockPlannerService({
    ...payload,
    suggestions: Array.isArray(payload.suggestions) ? payload.suggestions : [],
  });
}
