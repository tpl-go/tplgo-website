import type {
  PlannerBundlePayload,
  PlannerCheckoutBridgePayload,
  PlannerQuotePayload,
} from "@/types/ecosystem/planner/api";
import { resolveMockPlannerService } from "./plannerServiceTypes";

export async function syncPlannerBundle(payload: PlannerBundlePayload) {
  return resolveMockPlannerService({
    ...payload,
    bundles: Array.isArray(payload.bundles) ? payload.bundles : [],
  });
}

export async function syncPlannerQuote(payload: PlannerQuotePayload) {
  return resolveMockPlannerService(payload);
}

export async function preparePlannerCheckout(payload: PlannerCheckoutBridgePayload) {
  return resolveMockPlannerService({
    ...payload,
    bookingModules: Array.isArray(payload.bookingModules)
      ? payload.bookingModules
      : [],
    addOns: Array.isArray(payload.addOns) ? payload.addOns : [],
  });
}
