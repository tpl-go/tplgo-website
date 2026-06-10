import type {
  PlannerCheckoutBridgePayload,
  PlannerFullSyncPayload,
  PlannerQuotePayload,
} from "@/types/ecosystem/planner/api";
import type { TiyaPlannerSnapshot } from "./plannerTypes";

export type PlannerSessionStatus =
  | "draft"
  | "active"
  | "review"
  | "checkout"
  | "completed";

export type PlannerSessionState = {
  status: PlannerSessionStatus;
  draft?: TiyaPlannerSnapshot;
  activeTrip?: PlannerFullSyncPayload;
  review?: {
    reviewedAt: string;
    score: number;
    notes: string[];
  };
  checkout?: PlannerCheckoutBridgePayload;
  quote?: PlannerQuotePayload;
  completed?: {
    completedAt: string;
    memoryCaptureId?: string;
  };
  updatedAt: string;
};

export function createPlannerSessionState(
  status: PlannerSessionStatus = "draft"
): PlannerSessionState {
  return {
    status,
    updatedAt: new Date().toISOString(),
  };
}

export function transitionPlannerSession(
  current: PlannerSessionState,
  nextStatus: PlannerSessionStatus,
  patch: Partial<PlannerSessionState> = {}
): PlannerSessionState {
  return {
    ...current,
    ...patch,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };
}

export function getPlannerSessionProgress(status: PlannerSessionStatus) {
  const order: PlannerSessionStatus[] = [
    "draft",
    "active",
    "review",
    "checkout",
    "completed",
  ];
  const index = order.indexOf(status);

  return {
    status,
    step: index >= 0 ? index + 1 : 1,
    totalSteps: order.length,
    percent: index >= 0 ? Math.round(((index + 1) / order.length) * 100) : 20,
  };
}
