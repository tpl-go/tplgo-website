"use client";

import type {
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "./plannerTypes";
import {
  buildPlannerSearchData,
  buildSelectedRouteData,
  type TiyaPlannerSearchData,
  type TiyaSelectedRouteData,
} from "./plannerDataModel";

export type TiyaSelectedSmartPlannerTrip = {
  search: TiyaPlannerSearchData;
  selectedRoute: TiyaSelectedRouteData;
  generatedAt: string;
};

export type TiyaRouteWorkspacePayload = {
  routeId: string;
  selectedRoute: TiyaRouteOption;
  routeOptions?: TiyaRouteOption[];
  tripIntent?: TiyaTripIntent;
  generatedPlan?: TiyaGeneratedPlan;
  selectedSmartPlannerTrip?: TiyaSelectedSmartPlannerTrip;
  generatedAt: string;
  source: "route-intelligence";
};

export const TIYA_SELECTED_ROUTE_PREVIEW_KEY = "tpl_tiya_selected_route_preview";
export const TIYA_WORKSPACE_DRAFT_KEY = "tpl_tiya_workspace_draft";
export const TIYA_ROUTE_WORKSPACE_KEY = TIYA_SELECTED_ROUTE_PREVIEW_KEY;

export function saveRouteWorkspacePayload(
  selectedRoute: TiyaRouteOption,
  routeOptions: TiyaRouteOption[] = [selectedRoute],
  tripIntent?: TiyaTripIntent,
  generatedPlan?: TiyaGeneratedPlan
) {
  if (typeof window === "undefined") return;
  const generatedAt = new Date().toISOString();

  const payload: TiyaRouteWorkspacePayload = {
    routeId: selectedRoute.id,
    selectedRoute,
    routeOptions,
    tripIntent,
    generatedPlan,
    selectedSmartPlannerTrip: tripIntent
      ? {
          search: buildPlannerSearchData(tripIntent),
          selectedRoute: buildSelectedRouteData(selectedRoute, tripIntent),
          generatedAt,
        }
      : undefined,
    generatedAt,
    source: "route-intelligence",
  };

  try {
    const serializedPayload = JSON.stringify(payload);
    window.sessionStorage.setItem(
      TIYA_SELECTED_ROUTE_PREVIEW_KEY,
      serializedPayload
    );
    window.sessionStorage.setItem(TIYA_WORKSPACE_DRAFT_KEY, serializedPayload);
  } catch {
    return;
  }
}

export function readRouteWorkspacePayload() {
  if (typeof window === "undefined") return null;

  try {
    const rawPayload =
      window.sessionStorage.getItem(TIYA_SELECTED_ROUTE_PREVIEW_KEY) ??
      window.sessionStorage.getItem(TIYA_WORKSPACE_DRAFT_KEY);
    if (!rawPayload) return null;

    const parsedPayload = JSON.parse(rawPayload) as Partial<TiyaRouteWorkspacePayload>;
    if (!parsedPayload.selectedRoute || !parsedPayload.routeId) return null;

    return parsedPayload as TiyaRouteWorkspacePayload;
  } catch {
    return null;
  }
}
