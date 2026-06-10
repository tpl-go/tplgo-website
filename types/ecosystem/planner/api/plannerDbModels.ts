import type {
  TiyaBookingModule,
  TiyaCreatorPick,
  TiyaDayPlan,
  TiyaLocalMarketPick,
  TiyaTimelineItem,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";

export type PlannerRecordStatus =
  | "draft"
  | "active"
  | "review"
  | "checkout"
  | "completed"
  | "archived";

export type PlannerTripRecord = {
  id: string;
  userId?: string;
  tripName: string;
  status: PlannerRecordStatus;
  intent: TiyaTripIntent;
  selectedRouteId?: string;
  selectedScenarioId?: string;
  selectedVariantId?: string;
  selectedBundleId?: string;
  selectedQuoteId?: string;
  createdAt: string;
  updatedAt: string;
};

export type PlannerItineraryDayRecord = TiyaDayPlan & {
  plannerTripId: string;
  sortOrder: number;
};

export type PlannerItineraryItemRecord = TiyaTimelineItem & {
  plannerTripId: string;
  dayId: string;
  sortOrder: number;
  bookingModuleId?: TiyaBookingModule["id"];
};

export type PlannerExperienceRecord = {
  id: string;
  plannerTripId: string;
  dayId?: string;
  title: string;
  category: string;
  suggestedTime: string;
  intensity: string;
  costBand: string;
  fitScore: number;
};

export type PlannerBundleRecord = {
  id: string;
  plannerTripId: string;
  name: string;
  includedItems: string[];
  estimatedSavings: number;
  totalEstimate: number;
  selected: boolean;
};

export type PlannerQuoteRecord = {
  id: string;
  plannerTripId: string;
  title: string;
  fareBreakup: Record<string, number>;
  totalEstimate: number;
  validityNote: string;
  createdAt: string;
};

export type PlannerTravellerProfileRecord = {
  id: string;
  plannerTripId: string;
  name?: string;
  travellerType: "adult" | "child" | "senior" | "pet";
  comfortPreference?: string;
  budgetPreference?: string;
  activityIntensity?: string;
};

export type PlannerCreatorRecommendationRecord = TiyaCreatorPick & {
  plannerTripId: string;
  selected: boolean;
};

export type PlannerMarketplaceItemRecord = TiyaLocalMarketPick & {
  plannerTripId: string;
  selected: boolean;
};

export type PlannerNormalizedTripGraph = {
  trip: PlannerTripRecord;
  itineraryDays: PlannerItineraryDayRecord[];
  itineraryItems: PlannerItineraryItemRecord[];
  experiences: PlannerExperienceRecord[];
  bundles: PlannerBundleRecord[];
  quotes: PlannerQuoteRecord[];
  travellerProfiles: PlannerTravellerProfileRecord[];
  creatorRecommendations: PlannerCreatorRecommendationRecord[];
  marketplaceItems: PlannerMarketplaceItemRecord[];
};
