import type {
  TiyaBookingModule,
  TiyaCreatorPick,
  TiyaDayPlan,
  TiyaJourneyMarkerType,
  TiyaJourneyStatus,
  TiyaJourneyTimelineDay,
  TiyaLocalMarketPick,
  TiyaTripIntent,
} from "./plannerTypes";

function markerTypesForDay(day: TiyaDayPlan): TiyaJourneyMarkerType[] {
  const markers = new Set<TiyaJourneyMarkerType>();

  if (day.day === 1) markers.add("origin");

  day.items.forEach((item) => {
    if (item.type === "meal") markers.add("food");
    else markers.add(item.type);
  });

  if (day.day > 1) markers.add("destination");

  return Array.from(markers);
}

function statusForDay(day: TiyaDayPlan, intent: TiyaTripIntent) {
  if (day.items.length < 2) return "Needs review" as const;
  if (intent.pace === "Packed" && day.items.length < 3) return "In planning" as const;
  return "Ready" as const;
}

export function generatePlannerJourneyTimeline(args: {
  days: TiyaDayPlan[];
  intent: TiyaTripIntent;
  creatorPicks: TiyaCreatorPick[];
  localMarketPicks: TiyaLocalMarketPick[];
  bookingModules: TiyaBookingModule[];
}): TiyaJourneyTimelineDay[] {
  const days = Array.isArray(args.days) ? args.days : [];
  const creatorPicks = Array.isArray(args.creatorPicks) ? args.creatorPicks : [];
  const localMarketPicks = Array.isArray(args.localMarketPicks)
    ? args.localMarketPicks
    : [];
  const bookingModules = Array.isArray(args.bookingModules)
    ? args.bookingModules
    : [];

  return days.map((day, index) => {
    const creatorSlice = creatorPicks.slice(index % 2, index % 2 + 2);
    const marketSlice = localMarketPicks.slice(0, index === 0 ? 1 : 2);
    const bookingSlice = bookingModules
      .filter((module) => module.isHighlighted)
      .slice(0, 3);

    return {
      id: `journey-day-${day.id}`,
      day: day.day,
      city: day.city,
      routeSegment:
        index === 0
          ? `${args.intent.fromCity || "Origin"} → ${day.city}`
          : `${days[index - 1]?.city || args.intent.fromCity} → ${day.city}`,
      transportUsed: args.intent.transportMode,
      stayType: args.intent.stayPreference,
      quickHighlight: day.headline,
      status: statusForDay(day, args.intent),
      markerTypes: [
        ...markerTypesForDay(day),
        ...(creatorSlice.length ? ["creator" as const] : []),
        ...(marketSlice.length ? ["market" as const] : []),
      ],
      notes: day.notes,
      itineraryItems: day.items,
      creatorRecommendations: creatorSlice,
      localMarketPicks: marketSlice,
      bookingSuggestions: bookingSlice,
    };
  });
}

export function generatePlannerJourneyStatus(args: {
  intent: TiyaTripIntent;
  days: TiyaDayPlan[];
  bookingModules: TiyaBookingModule[];
}): TiyaJourneyStatus {
  const readyBookings = args.bookingModules.filter((module) => module.isHighlighted).length;
  const packed = args.intent.pace === "Packed";
  const roadMode = ["Self-drive Car", "Bike", "EV", "Cab"].includes(
    args.intent.transportMode
  );

  return {
    activePlanningStage: readyBookings > 4 ? "Booking-ready" : "Route shaping",
    comfortLevel: Math.min(98, 68 + (args.intent.budgetTier === "Luxury" ? 18 : 0) + (packed ? -8 : 8)),
    travelIntensity: Math.min(98, 52 + (packed ? 24 : 0) + (roadMode ? 10 : 0)),
    routeReadiness: Math.min(98, 74 + (args.days.length > 2 ? 10 : 0)),
    weatherReadiness: Math.min(98, 72 + (args.intent.smartPreferences.avoidNightTravel ? 8 : 0)),
    bookingReadiness: Math.min(98, 50 + readyBookings * 8),
  };
}
