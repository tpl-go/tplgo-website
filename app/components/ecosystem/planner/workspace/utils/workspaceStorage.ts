import {
  TIYA_SELECTED_ROUTE_PREVIEW_KEY,
  TIYA_WORKSPACE_DRAFT_KEY,
} from "@/app/lib/ecosystem/planner/plannerRouteWorkspaceHandoff";

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

export function readWorkspacePayloadFromStorage() {
  if (typeof window === "undefined") return null;

  return (
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
  } catch {
    return;
  }
}
