import type {
  TiyaGeneratedPlan,
  TiyaPlannerSnapshot,
  TiyaTripIntent,
  TiyaTripNotes,
} from "./plannerTypes";

export function buildPlannerTripName(intent: TiyaTripIntent, plan: TiyaGeneratedPlan) {
  return `${intent.toCity || "Destination"} ${intent.travelStyle} Plan · ${plan.nights}N`;
}

export function buildPlannerSnapshot(args: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  itinerary: TiyaPlannerSnapshot["itinerary"];
  notes: TiyaTripNotes;
  selectedRouteId?: TiyaPlannerSnapshot["selectedRouteId"];
}): TiyaPlannerSnapshot {
  const creatorPicks = Array.isArray(args.plan.creatorPicks)
    ? args.plan.creatorPicks
    : [];
  const localMarketPicks = Array.isArray(args.plan.localMarketPicks)
    ? args.plan.localMarketPicks
    : [];
  const bookingModules = Array.isArray(args.plan.bookingModules)
    ? args.plan.bookingModules
    : [];

  return {
    tripName: buildPlannerTripName(args.intent, args.plan),
    intent: args.intent,
    plan: args.plan,
    itinerary: args.itinerary,
    notes: args.notes,
    selectedRouteId: args.selectedRouteId,
    selectedCreatorPickIds: creatorPicks
      .filter((creator) => creator.isHighlighted)
      .map((creator) => creator.id),
    selectedMarketPickIds: localMarketPicks
      .filter((product) => product.isHighlighted)
      .map((product) => product.id),
    selectedBookingModuleIds: bookingModules
      .filter((module) => module.isHighlighted)
      .map((module) => module.id),
  };
}
