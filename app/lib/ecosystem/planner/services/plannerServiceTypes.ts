import type {
  PlannerApiResponse,
  PlannerRequestContext,
} from "@/types/ecosystem/planner/api";

export type PlannerServiceStatus =
  | "idle"
  | "loading"
  | "success"
  | "fallback"
  | "error";

export type PlannerServiceOptions = {
  context?: Partial<PlannerRequestContext>;
  signal?: AbortSignal;
  useMock?: boolean;
};

export type PlannerServiceResult<TData> = PlannerApiResponse<TData> & {
  status: PlannerServiceStatus;
};

export function createPlannerRequestContext(
  context: Partial<PlannerRequestContext> = {}
): PlannerRequestContext {
  return {
    requestId:
      context.requestId ??
      `tiya-request-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    plannerTripId: context.plannerTripId,
    sessionId: context.sessionId,
    source: "smart-planner",
    apiVersion: "2026-frontend-bridge-v1",
    createdAt: context.createdAt ?? new Date().toISOString(),
  };
}

export function createMockPlannerServiceResult<TData>(
  data: TData,
  warnings: string[] = []
): PlannerServiceResult<TData> {
  return {
    ok: true,
    data,
    warnings,
    fallbackUsed: warnings.length > 0,
    receivedAt: new Date().toISOString(),
    status: warnings.length > 0 ? "fallback" : "success",
  };
}

export function createEmptyPlannerServiceResult<TData>(
  data: TData,
  reason = "Mock fallback response used."
): PlannerServiceResult<TData> {
  return createMockPlannerServiceResult(data, [reason]);
}

export async function resolveMockPlannerService<TData>(
  data: TData,
  warnings: string[] = []
): Promise<PlannerServiceResult<TData>> {
  return Promise.resolve(createMockPlannerServiceResult(data, warnings));
}
