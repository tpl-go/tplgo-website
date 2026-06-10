import type {
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";

export type SmartPlannerPreviewTab =
  | "Overview"
  | "Itinerary"
  | "Cost"
  | "Travel Intelligence"
  | "Mobility Intelligence"
  | "Local Life"
  | "TPL Creators";

export const smartPlannerPreviewTabs: SmartPlannerPreviewTab[] = [
  "Overview",
  "Itinerary",
  "Cost",
  "Travel Intelligence",
  "Mobility Intelligence",
  "Local Life",
  "TPL Creators",
];

export type SmartPlannerRouteDetailProps = {
  routeOptions: TiyaRouteOption[];
  isGenerating?: boolean;
  selectedRouteId?: TiyaRouteOption["id"];
  selectionConfirmed?: boolean;
  tripIntent?: TiyaTripIntent;
  generatedPlan?: TiyaGeneratedPlan;
  onSelectedRouteChange?: (routeId: TiyaRouteOption["id"]) => void;
};
