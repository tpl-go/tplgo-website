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

export type SmartPlannerWorkspaceDiscoverySelection = {
  id: string;
  category: string;
  title: string;
  image?: string;
  description?: string;
  distance?: string;
  bestTime?: string;
  duration?: string;
  difficulty?: string;
};

export type SmartPlannerWorkspaceDraft = {
  source: "smart-planner";
  createdAt: string;
  tripType?: string;
  origin?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  travellers: {
    adults: number;
    children: number;
    seniors: number;
    total: number;
  };
  selectedRouteId?: TiyaRouteOption["id"];
  selectedRoute: TiyaRouteOption;
  routeOptions?: TiyaRouteOption[];
  routeSummary: Record<string, unknown>;
  itineraryDays: TiyaGeneratedPlan["days"];
  transportMode?: string;
  mobilityMode?: string;
  costSummary: Record<string, unknown>;
  travelIntelligence?: unknown;
  mobilityIntelligence?: unknown;
  localLifeSelections: SmartPlannerWorkspaceDiscoverySelection[];
  creatorSelections: SmartPlannerWorkspaceDiscoverySelection[];
  notes?: string;
  tripIntent?: TiyaTripIntent;
  generatedPlan?: TiyaGeneratedPlan;
};

export type SmartPlannerWorkspaceDraftInput = {
  routeSummary?: Record<string, unknown>;
  costSummary?: Record<string, unknown>;
  travelIntelligence?: unknown;
  mobilityIntelligence?: unknown;
  localLifeSelections?: SmartPlannerWorkspaceDiscoverySelection[];
  creatorSelections?: SmartPlannerWorkspaceDiscoverySelection[];
  notes?: string;
};

export const TIYA_SELECTED_ROUTE_PREVIEW_KEY = "tpl_tiya_selected_route_preview";
export const TIYA_WORKSPACE_DRAFT_KEY = "tpl_tiya_workspace_draft";
export const TIYA_ROUTE_WORKSPACE_KEY = TIYA_SELECTED_ROUTE_PREVIEW_KEY;
export const SMART_PLANNER_WORKSPACE_DRAFT_KEY =
  "tpl_smart_planner_workspace_draft_v1";
export const SMART_PLANNER_RETURN_SEARCH_KEY =
  "tpl_smart_planner_return_search_v1";

function totalTravellers(tripIntent?: TiyaTripIntent) {
  const adults = tripIntent?.adults ?? 0;
  const children = tripIntent?.children ?? 0;
  const seniors = tripIntent?.seniors ?? 0;

  return {
    adults,
    children,
    seniors,
    total: Math.max(1, adults + children + seniors),
  };
}

export function buildSmartPlannerWorkspaceDraft({
  selectedRoute,
  routeOptions,
  tripIntent,
  generatedPlan,
  routeSummary,
  costSummary,
  travelIntelligence,
  mobilityIntelligence,
  localLifeSelections = [],
  creatorSelections = [],
  notes,
}: {
  selectedRoute: TiyaRouteOption;
  routeOptions?: TiyaRouteOption[];
  tripIntent?: TiyaTripIntent;
  generatedPlan?: TiyaGeneratedPlan;
} & SmartPlannerWorkspaceDraftInput): SmartPlannerWorkspaceDraft {
  const createdAt = new Date().toISOString();

  return {
    source: "smart-planner",
    createdAt,
    tripType: tripIntent?.tripType,
    origin: tripIntent?.fromCity,
    destination: tripIntent?.toCity,
    startDate: tripIntent?.startDate,
    endDate: tripIntent?.endDate,
    travellers: totalTravellers(tripIntent),
    selectedRouteId: selectedRoute.id,
    selectedRoute,
    routeOptions,
    routeSummary:
      routeSummary ??
      {
        id: selectedRoute.id,
        name: selectedRoute.name,
        distance: selectedRoute.distance,
        duration: selectedRoute.duration,
        difficulty: selectedRoute.difficulty,
        riskLevel: selectedRoute.riskLevel,
        bestFor: selectedRoute.bestFor,
        routeStyle: selectedRoute.routeStyle,
        note: selectedRoute.note,
      },
    itineraryDays: generatedPlan?.days ?? [],
    transportMode: tripIntent?.transportMode,
    mobilityMode: tripIntent?.transportPreference ?? tripIntent?.transportMode,
    costSummary:
      costSummary ??
      {
        totalBudget: generatedPlan?.totalBudget,
        budgetLines: generatedPlan?.budgetLines ?? [],
        suggestions: generatedPlan?.suggestions ?? [],
      },
    travelIntelligence,
    mobilityIntelligence,
    localLifeSelections,
    creatorSelections,
    notes,
    tripIntent,
    generatedPlan,
  };
}

export function saveRouteWorkspacePayload(
  selectedRoute: TiyaRouteOption,
  routeOptions: TiyaRouteOption[] = [selectedRoute],
  tripIntent?: TiyaTripIntent,
  generatedPlan?: TiyaGeneratedPlan,
  smartPlannerDraftInput?: SmartPlannerWorkspaceDraftInput
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
    const smartPlannerDraft = buildSmartPlannerWorkspaceDraft({
      selectedRoute,
      routeOptions,
      tripIntent,
      generatedPlan,
      ...smartPlannerDraftInput,
    });

    window.sessionStorage.setItem(
      TIYA_SELECTED_ROUTE_PREVIEW_KEY,
      serializedPayload
    );
    window.sessionStorage.setItem(TIYA_WORKSPACE_DRAFT_KEY, serializedPayload);
    window.sessionStorage.setItem(
      SMART_PLANNER_WORKSPACE_DRAFT_KEY,
      JSON.stringify(smartPlannerDraft)
    );
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
