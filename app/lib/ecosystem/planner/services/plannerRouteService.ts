import type { PlannerScenarioPayload } from "@/types/ecosystem/planner/api";
import type { TiyaRouteOption, TiyaTripIntent } from "../plannerTypes";
import { resolveMockPlannerService } from "./plannerServiceTypes";

export type PlannerRouteServicePayload = {
  intent: TiyaTripIntent;
  selectedRouteId?: string;
  routeOptions: TiyaRouteOption[];
};

export async function fetchPlannerRoutes(payload: PlannerRouteServicePayload) {
  return resolveMockPlannerService({
    ...payload,
    routeOptions: Array.isArray(payload.routeOptions) ? payload.routeOptions : [],
  });
}

export async function syncPlannerScenario(payload: PlannerScenarioPayload) {
  return resolveMockPlannerService({
    ...payload,
    scenarios: Array.isArray(payload.scenarios) ? payload.scenarios : [],
  });
}
