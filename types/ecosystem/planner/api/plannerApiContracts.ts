import type {
  TiyaBookingModule,
  TiyaCreatorPick,
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaInsight,
  TiyaLocalMarketPick,
  TiyaPlannerSnapshot,
  TiyaRouteOption,
  TiyaSmartAlert,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";

export type PlannerApiVersion = "2026-frontend-bridge-v1";

export type PlannerRequestContext = {
  requestId: string;
  plannerTripId?: string;
  sessionId?: string;
  source: "smart-planner";
  apiVersion: PlannerApiVersion;
  createdAt: string;
};

export type PlannerApiEnvelope<TPayload> = {
  context: PlannerRequestContext;
  payload: TPayload;
};

export type PlannerApiResponse<TData> = {
  ok: boolean;
  data: TData;
  warnings: string[];
  fallbackUsed: boolean;
  receivedAt: string;
};

export type PlannerTripIntentPayload = {
  intent: TiyaTripIntent;
  travellerSummary: {
    adults: number;
    children: number;
    seniors: number;
    pets: boolean;
  };
};

export type PlannerItineraryPayload = {
  tripId?: string;
  intent: TiyaTripIntent;
  days: TiyaDayPlan[];
  notes?: Record<string, string>;
};

export type PlannerScenarioPayload = {
  selectedScenarioId?: string;
  scenarios: Array<{
    id: string;
    name: string;
    scoreSummary: Record<string, number | string>;
    isRecommended: boolean;
  }>;
};

export type PlannerVariantPayload = {
  selectedVariantId?: string;
  variants: Array<{
    id: string;
    name: string;
    duration: string;
    estimatedCost: string;
    isSelected: boolean;
  }>;
};

export type PlannerRulesPayload = {
  rules: Array<{
    id: string;
    status: "pass" | "warning" | "critical";
    reason: string;
    suggestedFix: string;
    affectedScope: string;
  }>;
};

export type PlannerWeatherInsightsPayload = {
  seasonScore: number;
  weatherReadiness: number;
  routeAdvice: string[];
  simulatedCards: Array<{
    label: string;
    value: string;
    risk: "low" | "medium" | "high";
  }>;
};

export type PlannerOptimizationPayload = {
  savingsEstimate: number;
  comfortImpact: number;
  suggestions: Array<{
    id: string;
    title: string;
    detail: string;
    impact: string;
  }>;
};

export type PlannerBundlePayload = {
  selectedBundleId?: string;
  bundles: Array<{
    id: string;
    name: string;
    estimatedSavings: number;
    includedItems: string[];
    valueScore: number;
  }>;
};

export type PlannerQuotePayload = {
  quoteId?: string;
  title: string;
  route: string;
  travellerCount: number;
  fareBreakup: Record<string, number>;
  totalEstimate: number;
  validityNote: string;
};

export type PlannerCheckoutBridgePayload = {
  plannerTripId?: string;
  route: string;
  dates: {
    startDate: string;
    endDate: string;
  };
  travellers: PlannerTripIntentPayload["travellerSummary"];
  selectedBundleId?: string;
  bookingModules: TiyaBookingModule[];
  addOns: string[];
};

export type PlannerCrmEscalationPayload = {
  leadId: string;
  plannerTripId?: string;
  tripIntent: TiyaTripIntent;
  customerContact: {
    name: string;
    mobile: string;
    email: string;
    preferredContactTime: string;
    communicationMode: "Call" | "WhatsApp" | "Email";
  };
  priorityScore: number;
  leadSource: "Tiya Smart Planner";
  createdAt: string;
};

export type PlannerCreatorRecommendationPayload = {
  destination: string;
  recommendations: TiyaCreatorPick[];
};

export type PlannerMarketplaceRecommendationPayload = {
  destination: string;
  recommendations: TiyaLocalMarketPick[];
};

export type PlannerAIWorkspacePayload = {
  intent: TiyaTripIntent;
  generatedPlan: TiyaGeneratedPlan;
  itinerary: TiyaDayPlan[];
  routeOptions: TiyaRouteOption[];
  insights: TiyaInsight[];
  alerts: TiyaSmartAlert[];
  creators: TiyaCreatorPick[];
  marketplaceItems: TiyaLocalMarketPick[];
};

export type PlannerFullSyncPayload = {
  snapshot: TiyaPlannerSnapshot;
  workspace: PlannerAIWorkspacePayload;
  scenario?: PlannerScenarioPayload;
  variant?: PlannerVariantPayload;
  rules?: PlannerRulesPayload;
  weather?: PlannerWeatherInsightsPayload;
  optimization?: PlannerOptimizationPayload;
  bundle?: PlannerBundlePayload;
  quote?: PlannerQuotePayload;
  checkout?: PlannerCheckoutBridgePayload;
  crm?: PlannerCrmEscalationPayload;
};
