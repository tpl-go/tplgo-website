import type {
  TiyaBookingModule,
  TiyaDayPlan,
  TiyaJourneyStatus,
  TiyaRouteOption,
  TiyaTravelStat,
  TiyaTripHealth,
  TiyaTripIntent,
} from "./plannerTypes";

function clamp(score: number) {
  return Math.max(35, Math.min(98, Math.round(score)));
}

export function generatePlannerTripHealth(args: {
  intent: TiyaTripIntent;
  days: TiyaDayPlan[];
  journeyStatus: TiyaJourneyStatus;
  selectedRoute?: TiyaRouteOption;
  bookingModules: TiyaBookingModule[];
}): TiyaTripHealth {
  const routeQuality = clamp(args.selectedRoute?.scenicScore ?? args.journeyStatus.routeReadiness);
  const budgetFit = clamp(args.selectedRoute?.budgetFit ?? 72);
  const travelIntensity = clamp(100 - Math.abs(args.journeyStatus.travelIntensity - 68));
  const weatherConfidence = clamp(args.journeyStatus.weatherReadiness);
  const safety = clamp(
    72 +
      (args.intent.smartPreferences.avoidNightTravel ? 10 : 0) -
      (args.selectedRoute?.riskLevel === "High" ? 12 : 0)
  );
  const comfort = clamp(args.selectedRoute?.comfortScore ?? args.journeyStatus.comfortLevel);
  const logisticsReadiness = clamp(
    55 +
      args.bookingModules.filter((module) => module.isHighlighted).length * 6 +
      Math.min(args.days.length, 5) * 3
  );
  const metrics = [
    { label: "Route quality", score: routeQuality },
    { label: "Budget fit", score: budgetFit },
    { label: "Travel intensity", score: travelIntensity },
    { label: "Weather confidence", score: weatherConfidence },
    { label: "Safety", score: safety },
    { label: "Comfort", score: comfort },
    { label: "Logistics readiness", score: logisticsReadiness },
  ];
  const overallScore = clamp(
    metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length
  );

  return {
    overallScore,
    recommendationNote:
      overallScore >= 84
        ? "Tiya sees this as a strong booking-ready plan with healthy route and logistics signals."
        : overallScore >= 70
          ? "Tiya recommends one or two refinements before booking, mainly around pacing and logistics."
          : "Tiya recommends improving route safety, stay coverage and budget clarity before booking.",
    metrics,
  };
}

export function generatePlannerTravelStats(args: {
  routeOptions: TiyaRouteOption[];
  selectedRoute?: TiyaRouteOption;
  journeyStatus: TiyaJourneyStatus;
}): TiyaTravelStat[] {
  const selectedRoute = args.selectedRoute ?? args.routeOptions[0];
  const distance = selectedRoute?.distance ?? "Smart estimate";
  const duration = selectedRoute?.duration ?? "Smart estimate";
  const adventureScore =
    args.routeOptions.find((route) => route.id === "adventure")?.scenicScore ??
    args.journeyStatus.travelIntensity;

  return [
    { label: "Total distance", value: distance },
    { label: "Travel hours", value: duration },
    { label: "Scenic score", value: `${selectedRoute?.scenicScore ?? 78}`, score: selectedRoute?.scenicScore },
    { label: "Comfort score", value: `${selectedRoute?.comfortScore ?? 76}`, score: selectedRoute?.comfortScore },
    { label: "Adventure score", value: `${adventureScore}`, score: adventureScore },
    { label: "AI confidence", value: `${args.journeyStatus.routeReadiness}%`, score: args.journeyStatus.routeReadiness },
  ];
}
