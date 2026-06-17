import {
  SMART_PLANNER_WORKSPACE_DRAFT_KEY,
  TIYA_SELECTED_ROUTE_PREVIEW_KEY,
  TIYA_WORKSPACE_DRAFT_KEY,
  type SmartPlannerWorkspaceDraft,
} from "@/app/lib/ecosystem/planner/plannerRouteWorkspaceHandoff";
import {
  buildPlannerSearchData,
  buildSelectedRouteData,
} from "@/app/lib/ecosystem/planner/plannerDataModel";

import type { WorkspacePayload } from "./workspaceTypes";

export function parseWorkspacePayload(rawPayload: string | null) {
  if (!rawPayload) return null;

  try {
    const parsedPayload = JSON.parse(rawPayload) as Partial<WorkspacePayload>;
    if (!parsedPayload.routeId || !parsedPayload.selectedRoute) return null;
    return parsedPayload as WorkspacePayload;
  } catch {
    return null;
  }
}

function parseSmartPlannerWorkspaceDraft(rawPayload: string | null) {
  if (!rawPayload) return null;

  try {
    const parsedDraft = JSON.parse(rawPayload) as Partial<SmartPlannerWorkspaceDraft>;
    if (
      parsedDraft.source !== "smart-planner" ||
      !parsedDraft.selectedRoute ||
      !parsedDraft.selectedRouteId
    ) {
      return null;
    }

    const payload: WorkspacePayload = {
      routeId: parsedDraft.selectedRouteId,
      selectedRoute: parsedDraft.selectedRoute,
      routeOptions: parsedDraft.routeOptions,
      tripIntent: parsedDraft.tripIntent,
      generatedPlan: parsedDraft.generatedPlan,
      selectedSmartPlannerTrip:
        parsedDraft.tripIntent && parsedDraft.selectedRoute
          ? {
              search: buildPlannerSearchData(parsedDraft.tripIntent),
              selectedRoute: buildSelectedRouteData(
                parsedDraft.selectedRoute,
                parsedDraft.tripIntent
              ),
              generatedAt: parsedDraft.createdAt ?? new Date().toISOString(),
            }
          : undefined,
      generatedAt: parsedDraft.createdAt ?? new Date().toISOString(),
      source: "route-intelligence",
      smartPlannerWorkspaceDraft: parsedDraft as SmartPlannerWorkspaceDraft,
    };

    if (process.env.NODE_ENV === "development") {
      console.info("Smart Planner workspace draft loaded");
    }

    return payload;
  } catch {
    return null;
  }
}

export function readWorkspacePayloadFromStorage() {
  if (typeof window === "undefined") return null;

  return (
    parseSmartPlannerWorkspaceDraft(
      window.sessionStorage.getItem(SMART_PLANNER_WORKSPACE_DRAFT_KEY)
    ) ??
    parseWorkspacePayload(
      window.sessionStorage.getItem(TIYA_WORKSPACE_DRAFT_KEY)
    ) ??
    parseWorkspacePayload(
      window.sessionStorage.getItem(TIYA_SELECTED_ROUTE_PREVIEW_KEY)
    )
  );
}

export function saveWorkspacePayload(payload: WorkspacePayload) {
  if (typeof window === "undefined") return;

  try {
    const serializedPayload = JSON.stringify(payload);
    window.sessionStorage.setItem(TIYA_WORKSPACE_DRAFT_KEY, serializedPayload);
    window.sessionStorage.setItem(TIYA_SELECTED_ROUTE_PREVIEW_KEY, serializedPayload);
    if (payload.smartPlannerWorkspaceDraft) {
      window.sessionStorage.setItem(
        SMART_PLANNER_WORKSPACE_DRAFT_KEY,
        JSON.stringify(payload.smartPlannerWorkspaceDraft)
      );
    }
    window.dispatchEvent(new Event("tpl_tiya_workspace_payload_updated"));
    window.dispatchEvent(new Event("tpl_tiya_saved_trips_updated"));
  } catch {
    return;
  }
}
