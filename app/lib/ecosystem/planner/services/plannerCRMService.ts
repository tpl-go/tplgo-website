import type { PlannerCrmEscalationPayload } from "@/types/ecosystem/planner/api";
import { resolveMockPlannerService } from "./plannerServiceTypes";

export async function preparePlannerCrmLead(payload: PlannerCrmEscalationPayload) {
  return resolveMockPlannerService(payload);
}

export async function savePlannerCrmLeadDraft(payload: PlannerCrmEscalationPayload) {
  return resolveMockPlannerService(payload, [
    "CRM lead is stored as a frontend mock until backend integration is enabled.",
  ]);
}
