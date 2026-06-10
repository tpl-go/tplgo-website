import type { TiyaTripIntent } from "../plannerTypes";
import { resolveMockPlannerService } from "./plannerServiceTypes";

export type PlannerAgentId =
  | "route-intelligence"
  | "travel-optimization"
  | "seasonal-intelligence"
  | "cost-optimization"
  | "experience-recommendation"
  | "creator-discovery"
  | "local-market";

export type PlannerAgentRequest = {
  agentId: PlannerAgentId;
  intent: TiyaTripIntent;
  prompt?: string;
  context?: Record<string, unknown>;
};

export type PlannerAgentResult = {
  agentId: PlannerAgentId;
  title: string;
  summary: string;
  confidence: number;
  actions: string[];
};

export const plannerAgentCatalog: Record<PlannerAgentId, string> = {
  "route-intelligence": "Route Intelligence Agent",
  "travel-optimization": "Travel Optimization Agent",
  "seasonal-intelligence": "Seasonal Intelligence Agent",
  "cost-optimization": "Cost Optimization Agent",
  "experience-recommendation": "Experience Recommendation Agent",
  "creator-discovery": "Creator Discovery Agent",
  "local-market": "Local Market Agent",
};

export async function runMockPlannerAgent(request: PlannerAgentRequest) {
  const destination = request.intent.toCity || "destination";
  const agentTitle = plannerAgentCatalog[request.agentId];

  return resolveMockPlannerService<PlannerAgentResult>({
    agentId: request.agentId,
    title: agentTitle,
    summary: `${agentTitle} prepared a frontend-only recommendation set for ${destination}.`,
    confidence: request.intent.smartPreferences.preferScenicRoute ? 88 : 82,
    actions: [
      "Keep current workspace state intact",
      "Prepare future AI payload",
      "Return mock-safe recommendation",
    ],
  });
}
