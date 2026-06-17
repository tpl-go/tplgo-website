"use client";

import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import type { WorkspacePayload } from "@/app/components/ecosystem/planner/workspace/utils/workspaceTypes";
import type { MyTripSavedItem } from "@/app/lib/ecosystem/planner/myTripsStorage";
import type {
  TiyaBookingModule,
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaLocalMarketPick,
  TiyaRouteOption,
  TiyaTimelineItem,
  TiyaTripIntent,
  TiyaTripNotes,
} from "@/app/lib/ecosystem/planner/plannerTypes";

export const TIYA_CHECKOUT_PAYLOAD_KEY = "tpl_tiya_checkout_v1";
export const TIYA_REVIEW_DRAFT_KEY = "tpl_tiya_review_draft_v1";
export const TIYA_WORKSPACE_REVIEW_PAYLOAD_KEY =
  "tpl_tiya_workspace_review_payload_v1";

export type TiyaSmartPlannerReviewPayload = {
  source: "smart-planner";
  createdAt: string;
  updatedAt: string;
  trip: {
    destination?: string;
    endDate?: string;
    origin?: string;
    pace?: string;
    startDate?: string;
    title?: string;
    totalDays?: number;
    travelStyle?: string;
    tripType?: string;
  };
  route?: {
    activeRouteId?: string;
    distance?: string;
    duration?: string;
    name?: string;
    routeType?: string;
    segments?: TiyaTimelineItem[];
    transportMode?: string;
    selectedRouteVariant?: TiyaRouteOption;
  };
  itinerary: TiyaDayPlan[];
  travellers: {
    adults?: number;
    children?: number;
    pets?: boolean;
    profilesComplete?: boolean;
    rooms?: number;
    seniors?: number;
    total?: number;
    travellerType?: string;
  };
  preferences: {
    cabRequired?: boolean;
    stayPreference?: string;
    transportMode?: string;
    budgetTier?: string;
    travelStyle?: string;
  };
  selectedServices: Array<
    Pick<TiyaBookingModule, "id" | "readiness" | "serviceName"> & {
      reason?: string;
    }
  >;
  selectedHotels: TiyaTimelineItem[];
  selectedHomestays: TiyaTimelineItem[];
  selectedCabs: TiyaTimelineItem[];
  selectedTransfers: TiyaTimelineItem[];
  selectedActivities: TiyaTimelineItem[];
  selectedInsurance: unknown[];
  selectedLocalLifeItems: unknown[];
  selectedLocalMarketItems: unknown[];
  selectedCreatorSpots: unknown[];
  savedItems: MyTripSavedItem[];
  selectedBasketItems: WorkspaceBookingBasketItem[];
  notes?: TiyaTripNotes | string;
  budgetEstimate: {
    activity?: number;
    insurance?: number;
    localLife?: number;
    localMarket?: number;
    localTravel?: number;
    stay?: number;
    taxesPlaceholder?: number;
    totalEstimatedCost?: number;
    transport?: number;
  };
  changeHistory?: Record<string, Array<{ appliedAt?: string; summary?: string; title: string }>>;
  quoteEstimate: {
    estimatedTotal?: number;
    totalQuoteEstimate?: number;
  };
  plannerAudit: {
    bookingConfidenceScore?: number;
    finalVerdict?: string;
    healthScore?: number;
    readinessScore?: number;
  };
  readinessStatus?: {
    selectedItemsCount: number;
    bookingReady: boolean;
    auditStatus: string;
  };
};

type BuildReviewPayloadArgs = {
  workspace?: WorkspacePayload | null;
  intent?: TiyaTripIntent;
  plan?: TiyaGeneratedPlan;
  selectedRoute?: TiyaRouteOption;
  bookingBasket?: WorkspaceBookingBasketItem[];
  savedItems?: MyTripSavedItem[];
  notes?: TiyaTripNotes | string;
  plannerAudit?: Partial<TiyaSmartPlannerReviewPayload["plannerAudit"]>;
};

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function budgetLineAmount(plan: TiyaGeneratedPlan | undefined, label: string) {
  return (
    safeArray(plan?.budgetLines).find((line) =>
      line.label.toLowerCase().includes(label.toLowerCase())
    )?.amount || 0
  );
}

function itemsByType(days: TiyaDayPlan[], type: TiyaTimelineItem["type"]) {
  return safeArray(days)
    .flatMap((day) => safeArray(day.items))
    .filter((item) => item.type === type);
}

function selectedServiceModules(plan?: TiyaGeneratedPlan) {
  return safeArray(plan?.bookingModules)
    .filter((module) => module.isHighlighted || module.readiness === "Ready")
    .map((module) => ({
      id: module.id,
      readiness: module.readiness,
      serviceName: module.serviceName,
      reason: module.reason,
    }));
}

function highlightedLocalLife(plan?: TiyaGeneratedPlan) {
  return safeArray(plan?.localMarketPicks).filter(
    (item: TiyaLocalMarketPick) => item.isHighlighted
  );
}

function highlightedCreators(plan?: TiyaGeneratedPlan) {
  return safeArray(plan?.creatorPicks).filter((item) => item.isHighlighted);
}

export function buildSmartPlannerReviewPayload({
  bookingBasket = [],
  intent,
  notes,
  plan,
  plannerAudit,
  savedItems = [],
  selectedRoute,
  workspace,
}: BuildReviewPayloadArgs): TiyaSmartPlannerReviewPayload | null {
  const sourceIntent = intent || workspace?.tripIntent;
  const sourcePlan = plan || workspace?.generatedPlan;
  const sourceRoute = selectedRoute || workspace?.selectedRoute;

  if (!sourceIntent || !sourcePlan) return null;

  const days = safeArray(sourcePlan.days);
  const travellersTotal = Math.max(
    1,
    Number(sourceIntent.adults || 0) +
      Number(sourceIntent.children || 0) +
      Number(sourceIntent.seniors || 0)
  );
  const transportItems = itemsByType(days, "transport");
  const stayItems = itemsByType(days, "stay");
  const activityItems = itemsByType(days, "activity");
  const cabRequired =
    sourceIntent.transportMode?.toLowerCase().includes("cab") ||
    sourceIntent.transportMode?.toLowerCase().includes("mixed") ||
    safeArray(bookingBasket).some((item) =>
      `${item.category} ${item.serviceType} ${item.serviceName}`.toLowerCase().includes("cab")
    );
  const estimatedTotal =
    safeArray(bookingBasket).reduce(
      (sum, item) =>
        sum + (item.estimatedTotal || item.estimatedPrice || item.price || 0),
      0
    ) || sourcePlan.totalBudget;
  const now = new Date().toISOString();
  const healthScore = plannerAudit?.healthScore ?? 76;
  const readinessScore =
    plannerAudit?.readinessScore ??
    Math.min(98, 48 + selectedServiceModules(sourcePlan).length * 8 + safeArray(bookingBasket).length * 4);

  return {
    source: "smart-planner",
    createdAt: now,
    updatedAt: now,
    trip: {
      destination: sourceIntent.toCity,
      endDate: sourceIntent.endDate,
      origin: sourceIntent.fromCity,
      pace: sourceIntent.pace,
      startDate: sourceIntent.startDate,
      title:
        sourcePlan.title ||
        `${sourceIntent.fromCity || "Origin"} to ${sourceIntent.toCity || "Destination"}`,
      totalDays: days.length || Number(sourcePlan.nights || 0) + 1,
      travelStyle: sourceIntent.travelStyle,
      tripType: sourceIntent.tripType,
    },
    route: {
      activeRouteId: sourceRoute?.id,
      distance: sourceRoute?.distance,
      duration: sourceRoute?.duration,
      name: sourceRoute?.name || sourcePlan.routeTitle,
      routeType: sourceRoute?.routeStyle,
      segments: transportItems,
      transportMode: sourceIntent.transportMode,
      selectedRouteVariant: sourceRoute,
    },
    itinerary: days,
    travellers: {
      adults: sourceIntent.adults,
      children: sourceIntent.children,
      pets: sourceIntent.pets,
      profilesComplete: false,
      rooms: Math.max(1, Math.ceil(travellersTotal / 2)),
      seniors: sourceIntent.seniors,
      total: travellersTotal,
      travellerType: sourceIntent.travelStyle,
    },
    preferences: {
      budgetTier: sourceIntent.budgetTier,
      cabRequired,
      stayPreference: sourceIntent.stayPreference,
      transportMode: sourceIntent.transportMode,
      travelStyle: sourceIntent.travelStyle,
    },
    selectedServices: selectedServiceModules(sourcePlan),
    selectedHotels: stayItems.filter((item) =>
      `${item.title} ${item.serviceType || ""}`.toLowerCase().includes("hotel")
    ),
    selectedHomestays: stayItems.filter((item) =>
      `${item.title} ${item.serviceType || ""}`.toLowerCase().includes("homestay")
    ),
    selectedCabs: transportItems,
    selectedTransfers: transportItems,
    selectedActivities: activityItems,
    selectedInsurance: sourceIntent.smartPreferences?.includeInsurance
      ? [{ title: "Insurance preference", source: "Smart Planner" }]
      : [],
    selectedLocalLifeItems: highlightedLocalLife(sourcePlan),
    selectedLocalMarketItems: highlightedLocalLife(sourcePlan),
    selectedCreatorSpots: highlightedCreators(sourcePlan),
    savedItems: safeArray(savedItems),
    selectedBasketItems: safeArray(bookingBasket),
    notes,
    budgetEstimate: {
      activity: budgetLineAmount(sourcePlan, "activit"),
      insurance: sourceIntent.smartPreferences?.includeInsurance
        ? Math.round(sourcePlan.totalBudget * 0.025)
        : 0,
      localLife: budgetLineAmount(sourcePlan, "local"),
      localMarket: budgetLineAmount(sourcePlan, "local"),
      localTravel: budgetLineAmount(sourcePlan, "local"),
      stay: budgetLineAmount(sourcePlan, "stay"),
      taxesPlaceholder: Math.round(estimatedTotal * 0.05),
      totalEstimatedCost: estimatedTotal,
      transport: budgetLineAmount(sourcePlan, "transport"),
    },
    changeHistory: {},
    quoteEstimate: {
      estimatedTotal,
      totalQuoteEstimate: estimatedTotal,
    },
    plannerAudit: {
      bookingConfidenceScore:
        plannerAudit?.bookingConfidenceScore ?? Math.min(96, readinessScore + 6),
      finalVerdict:
        plannerAudit?.finalVerdict ||
        (readinessScore >= 82 ? "Ready To Book" : readinessScore >= 58 ? "Needs Review" : "Not Recommended"),
      healthScore,
      readinessScore,
    },
    readinessStatus: {
      auditStatus:
        readinessScore >= 82 ? "Ready To Book" : readinessScore >= 58 ? "Needs Review" : "Not Recommended",
      bookingReady: readinessScore >= 82,
      selectedItemsCount: safeArray(bookingBasket).length,
    },
  };
}

export function persistSmartPlannerReviewPayload(
  payload: TiyaSmartPlannerReviewPayload
) {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(TIYA_CHECKOUT_PAYLOAD_KEY, JSON.stringify(payload));
  window.sessionStorage.setItem(
    TIYA_WORKSPACE_REVIEW_PAYLOAD_KEY,
    JSON.stringify(payload)
  );
  window.sessionStorage.setItem(
    TIYA_REVIEW_DRAFT_KEY,
    JSON.stringify({ checkoutPayload: payload, updatedAt: payload.updatedAt })
  );
  window.dispatchEvent(new Event("tpl_tiya_review_payload_updated"));
  window.dispatchEvent(new Event("tpl_tiya_workspace_payload_updated"));
}
