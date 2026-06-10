import type {
  PlannerAIWorkspacePayload,
  PlannerFullSyncPayload,
} from "@/types/ecosystem/planner/api";
import type { TiyaGeneratedPlan, TiyaTripIntent } from "../plannerTypes";
import {
  runMockPlannerAgent,
  type PlannerAgentId,
} from "./plannerAgentRegistry";
import { resolveMockPlannerService } from "./plannerServiceTypes";

export async function preparePlannerAIWorkspace(
  intent: TiyaTripIntent,
  generatedPlan: TiyaGeneratedPlan
) {
  const payload: PlannerAIWorkspacePayload = {
    intent,
    generatedPlan,
    itinerary: Array.isArray(generatedPlan.days) ? generatedPlan.days : [],
    routeOptions: Array.isArray(generatedPlan.routeOptions)
      ? generatedPlan.routeOptions
      : [],
    insights: Array.isArray(generatedPlan.insights) ? generatedPlan.insights : [],
    alerts: [],
    creators: Array.isArray(generatedPlan.creatorPicks)
      ? generatedPlan.creatorPicks
      : [],
    marketplaceItems: Array.isArray(generatedPlan.localMarketPicks)
      ? generatedPlan.localMarketPicks
      : [],
  };

  return resolveMockPlannerService(payload);
}

export async function preparePlannerFullSync(payload: PlannerFullSyncPayload) {
  return resolveMockPlannerService(payload);
}

export async function runPlannerAIAgent(
  agentId: PlannerAgentId,
  intent: TiyaTripIntent,
  prompt?: string
) {
  return runMockPlannerAgent({
    agentId,
    intent,
    prompt,
  });
}
