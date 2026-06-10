import type {
  TiyaPlannerSnapshot,
  TiyaRouteOption,
  TiyaSmartAlert,
} from "./plannerTypes";

export type TiyaItineraryExport = {
  title: string;
  routeLine: string;
  metaLine: string;
  dayLines: string[];
  routeIntelligence: string[];
  bookingModules: string[];
  creatorPicks: string[];
  localMarketPicks: string[];
  budgetSummary: string[];
  smartAlerts: string[];
  shareText: string;
};

function formatCurrency(value?: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(value ?? 0);
}

function compactList(values: string[]) {
  return values.filter(Boolean);
}

export function buildPlannerExport(
  snapshot: TiyaPlannerSnapshot,
  selectedRoute?: TiyaRouteOption,
  smartAlerts: TiyaSmartAlert[] = []
): TiyaItineraryExport {
  const intent = snapshot.intent;
  const plan = snapshot.plan;
  const itinerary = Array.isArray(snapshot.itinerary) ? snapshot.itinerary : [];
  const routeOptions = Array.isArray(plan.routeOptions) ? plan.routeOptions : [];
  const bookingModules = Array.isArray(plan.bookingModules)
    ? plan.bookingModules
    : [];
  const creatorPicks = Array.isArray(plan.creatorPicks) ? plan.creatorPicks : [];
  const localMarketPicks = Array.isArray(plan.localMarketPicks)
    ? plan.localMarketPicks
    : [];
  const budgetLines = Array.isArray(plan.budgetLines) ? plan.budgetLines : [];
  const activeRoute =
    selectedRoute ||
    routeOptions.find((route) => route.id === snapshot.selectedRouteId) ||
    routeOptions.find((route) => route.isRecommended) ||
    routeOptions[0];

  const dayLines = itinerary.map((day) => {
    const stops = Array.isArray(day.items)
      ? day.items.map((item) => `${item.time} ${item.title}`).join("; ")
      : "";

    return `Day ${day.day}: ${day.city} - ${day.headline}${
      stops ? ` (${stops})` : ""
    }`;
  });

  const routeIntelligence = activeRoute
    ? [
        `${activeRoute.name}: ${activeRoute.distance}, ${activeRoute.duration}`,
        `Difficulty ${activeRoute.difficulty} · Scenic ${activeRoute.scenicScore}% · Comfort ${activeRoute.comfortScore}%`,
        `Budget fit ${activeRoute.budgetFit}% · Risk ${activeRoute.riskLevel}`,
        activeRoute.note,
      ]
    : ["Route intelligence will use the selected planner route."];

  const highlightedModules = bookingModules.filter(
    (module) => module.isHighlighted
  );
  const selectedCreators = creatorPicks.filter(
    (creator) =>
      creator.isHighlighted ||
      snapshot.selectedCreatorPickIds.includes(creator.id)
  );
  const selectedMarket = localMarketPicks.filter(
    (product) =>
      product.isHighlighted || snapshot.selectedMarketPickIds.includes(product.id)
  );

  const budgetSummary = [
    ...budgetLines.map(
      (line) => `${line.label}: ${formatCurrency(line.amount)}`
    ),
    `Estimated total: ${formatCurrency(plan.totalBudget)}`,
  ];

  const exportData: Omit<TiyaItineraryExport, "shareText"> = {
    title: snapshot.tripName || plan.title || "Tiya Smart Planner Trip",
    routeLine: plan.routeTitle || `${intent.fromCity} → ${intent.toCity}`,
    metaLine: compactList([
      `${intent.startDate} → ${intent.endDate}`,
      `${plan.nights} Nights`,
      `${plan.travellerCount} Travellers`,
      intent.transportMode,
      intent.stayPreference,
      intent.budgetTier,
    ]).join(" · "),
    dayLines,
    routeIntelligence,
    bookingModules: highlightedModules.length
      ? highlightedModules.map(
          (module) => `${module.serviceName}: ${module.readiness} - ${module.reason}`
        )
      : bookingModules
          .slice(0, 4)
          .map(
            (module) =>
              `${module.serviceName}: ${module.readiness} - ${module.reason}`
          ),
    creatorPicks: selectedCreators.length
      ? selectedCreators
          .slice(0, 4)
          .map(
            (creator) =>
              `${creator.creatorName} (${creator.handle}) - ${creator.specialty}, ${creator.routeFit}% route fit`
          )
      : creatorPicks
          .slice(0, 3)
          .map(
            (creator) =>
              `${creator.creatorName} (${creator.handle}) - ${creator.specialty}`
          ),
    localMarketPicks: selectedMarket.length
      ? selectedMarket
          .slice(0, 4)
          .map(
            (product) =>
              `${product.productName}: ${product.localRegion}, ${product.priceRange}`
          )
      : localMarketPicks
          .slice(0, 3)
          .map(
            (product) =>
              `${product.productName}: ${product.localRegion}, ${product.priceRange}`
          ),
    budgetSummary,
    smartAlerts: smartAlerts.length
      ? smartAlerts.map((alert) => `${alert.title}: ${alert.detail}`)
      : ["Planner checks are aligned with the current trip setup."],
  };

  return {
    ...exportData,
    shareText: [
      exportData.title,
      exportData.routeLine,
      exportData.metaLine,
      "",
      "Day-wise plan:",
      ...exportData.dayLines,
      "",
      "Route intelligence:",
      ...exportData.routeIntelligence,
      "",
      "Booking-ready modules:",
      ...exportData.bookingModules,
      "",
      "Creator picks:",
      ...exportData.creatorPicks,
      "",
      "Local market suggestions:",
      ...exportData.localMarketPicks,
      "",
      "Budget summary:",
      ...exportData.budgetSummary,
      "",
      "Smart alerts:",
      ...exportData.smartAlerts,
      "",
      "Planned with Tiya Smart Planner by TPL.",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}
