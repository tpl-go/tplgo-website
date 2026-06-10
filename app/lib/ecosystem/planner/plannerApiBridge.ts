import type {
  PlannerApiEnvelope,
  PlannerFullSyncPayload,
  PlannerNormalizedTripGraph,
  PlannerRecordStatus,
  PlannerRequestContext,
} from "@/types/ecosystem/planner/api";
import type {
  TiyaGeneratedPlan,
  TiyaPlannerSnapshot,
  TiyaTripIntent,
} from "./plannerTypes";
import { createPlannerRequestContext } from "./services/plannerServiceTypes";

function createPlannerId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createPlannerApiEnvelope<TPayload>(
  payload: TPayload,
  context?: Partial<PlannerRequestContext>
): PlannerApiEnvelope<TPayload> {
  return {
    context: createPlannerRequestContext(context),
    payload,
  };
}

export function buildPlannerFullSyncPayload(
  snapshot: TiyaPlannerSnapshot,
  generatedPlan: TiyaGeneratedPlan
): PlannerFullSyncPayload {
  const safeDays = Array.isArray(snapshot.itinerary) ? snapshot.itinerary : [];

  return {
    snapshot,
    workspace: {
      intent: snapshot.intent,
      generatedPlan,
      itinerary: safeDays,
      routeOptions: Array.isArray(generatedPlan.routeOptions)
        ? generatedPlan.routeOptions
        : [],
      insights: Array.isArray(generatedPlan.insights) ? generatedPlan.insights : [],
      alerts: [],
      creators: Array.isArray(generatedPlan.creatorPicks)
        ? generatedPlan.creatorPicks
        : [],
      marketplaceItems: Array.isArray(generatedPlan.localMarketPicks)
        ? generatedPlan.localMarketPicks
        : [],
    },
  };
}

export function normalizePlannerTripForDb(
  snapshot: TiyaPlannerSnapshot,
  status: PlannerRecordStatus = "draft"
): PlannerNormalizedTripGraph {
  const plannerTripId = snapshot.tripId ?? createPlannerId("planner-trip");
  const now = new Date().toISOString();
  const safeDays = Array.isArray(snapshot.itinerary) ? snapshot.itinerary : [];
  const safePlan = snapshot.plan;

  return {
    trip: {
      id: plannerTripId,
      tripName: snapshot.tripName,
      status,
      intent: snapshot.intent,
      selectedRouteId: snapshot.selectedRouteId,
      createdAt: snapshot.savedAt ?? now,
      updatedAt: now,
    },
    itineraryDays: safeDays.map((day, index) => ({
      ...day,
      plannerTripId,
      sortOrder: index,
    })),
    itineraryItems: safeDays.flatMap((day) =>
      (Array.isArray(day.items) ? day.items : []).map((item, index) => ({
        ...item,
        plannerTripId,
        dayId: day.id,
        sortOrder: index,
      }))
    ),
    experiences: [],
    bundles: [],
    quotes: [],
    travellerProfiles: buildTravellerProfiles(plannerTripId, snapshot.intent),
    creatorRecommendations: (Array.isArray(safePlan.creatorPicks)
      ? safePlan.creatorPicks
      : []
    ).map((creator) => ({
      ...creator,
      plannerTripId,
      selected: snapshot.selectedCreatorPickIds.includes(creator.id),
    })),
    marketplaceItems: (Array.isArray(safePlan.localMarketPicks)
      ? safePlan.localMarketPicks
      : []
    ).map((item) => ({
      ...item,
      plannerTripId,
      selected: snapshot.selectedMarketPickIds.includes(item.id),
    })),
  };
}

function buildTravellerProfiles(plannerTripId: string, intent: TiyaTripIntent) {
  const profiles = [];

  for (let index = 0; index < Math.max(0, intent.adults); index += 1) {
    profiles.push({
      id: `${plannerTripId}-adult-${index + 1}`,
      plannerTripId,
      travellerType: "adult" as const,
      comfortPreference: intent.stayPreference,
      budgetPreference: intent.budgetTier,
      activityIntensity: intent.pace,
    });
  }

  for (let index = 0; index < Math.max(0, intent.children); index += 1) {
    profiles.push({
      id: `${plannerTripId}-child-${index + 1}`,
      plannerTripId,
      travellerType: "child" as const,
      comfortPreference: "family-safe",
      budgetPreference: intent.budgetTier,
      activityIntensity: "low-fatigue",
    });
  }

  for (let index = 0; index < Math.max(0, intent.seniors); index += 1) {
    profiles.push({
      id: `${plannerTripId}-senior-${index + 1}`,
      plannerTripId,
      travellerType: "senior" as const,
      comfortPreference: "senior-comfort",
      budgetPreference: intent.budgetTier,
      activityIntensity: "low-fatigue",
    });
  }

  if (intent.pets) {
    profiles.push({
      id: `${plannerTripId}-pet-1`,
      plannerTripId,
      travellerType: "pet" as const,
      comfortPreference: "pet-friendly",
      budgetPreference: intent.budgetTier,
      activityIntensity: "low-fatigue",
    });
  }

  return profiles;
}
