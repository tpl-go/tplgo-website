import type {
  TiyaAIRecommendation,
  TiyaBookingModule,
  TiyaBudgetIntelligence,
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaJourneyStatus,
  TiyaRouteOption,
  TiyaSmartAlert,
  TiyaTripIntent,
} from "./plannerTypes";

function hasItemType(days: TiyaDayPlan[], type: string) {
  return days.some((day) => day.items?.some((item) => item.type === type));
}

function dayLabel(days: TiyaDayPlan[], index: number, fallback: string) {
  const day = days[index] ?? days[days.length - 1];
  return day ? `Day ${day.day} ${fallback}` : fallback;
}

function bookingGap(modules: TiyaBookingModule[], id: TiyaBookingModule["id"]) {
  const bookingModule = modules.find((item) => item.id === id);
  return !bookingModule || bookingModule.readiness === "Review" || bookingModule.readiness === "Recommended";
}

export function generatePlannerRecommendations(args: {
  intent: TiyaTripIntent;
  plan?: TiyaGeneratedPlan;
  days?: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
  budget?: TiyaBudgetIntelligence;
  alerts?: TiyaSmartAlert[];
  journeyStatus?: TiyaJourneyStatus;
}): TiyaAIRecommendation[] {
  const days = Array.isArray(args.days) ? args.days : [];
  const alerts = Array.isArray(args.alerts) ? args.alerts : [];
  const plan = args.plan;
  const modules = Array.isArray(plan?.bookingModules)
    ? plan.bookingModules
    : [];
  const hasCriticalRisk = alerts.some((alert) => alert.severity === "critical");
  const hasWeatherWarning = alerts.some((alert) =>
    `${alert.title} ${alert.detail}`.toLowerCase().includes("weather")
  );
  const budgetPressure =
    args.budget?.risk === "high spend" ||
    (args.intent.budgetTier !== "Luxury" && Number(plan?.totalBudget || 0) > 90000);
  const activityGap = !hasItemType(days, "activity");
  const stayGap = args.intent.smartPreferences.includeStays && bookingGap(modules, "hotels");
  const transportGap = bookingGap(modules, "cabs") || (args.journeyStatus?.routeReadiness || 0) < 75;
  const recommendations: TiyaAIRecommendation[] = [];

  if (args.intent.pace === "Packed") {
    recommendations.push({
      id: "rest-day",
      title: "Add one extra rest window",
      category: "Stay",
      priority: "High",
      confidenceScore: 91,
      detail: "Packed pacing benefits from one softer evening or late-start morning.",
      reason: "The current pace has limited recovery time between planned movement and activities.",
      impact: "Lower intensity",
      impactSummary: "Comfort +12, fatigue -16, booking risk lower for next-day departures.",
      affectedDay: dayLabel(days, 2, "morning"),
      affectedModule: "Itinerary, stay, checkout readiness",
      costImpact: 0,
      comfortImpact: 12,
      riskImpact: -8,
      budgetImpact: 0,
      experienceImpact: 4,
      itineraryImpact: "Updates one morning to a late start and recovery stay window.",
      whyAiSuggestsThis: {
        travellerStyle: `${args.intent.travelStyle} travellers with ${args.intent.pace.toLowerCase()} pacing.`,
        itineraryGap: "Recovery time is thin after route movement.",
        budgetFit: "No extra booking cost unless a room upgrade is selected.",
        routeFit: "Keeps the selected route intact while reducing same-day fatigue.",
        weatherRiskFit: hasWeatherWarning ? "Useful when weather windows compress outdoor time." : "No weather conflict detected.",
      },
      whatWillChange: {
        dayChange: dayLabel(days, 2, "morning"),
        added: ["Recovery stay window"],
        updated: ["Day pace and notes"],
        costImpact: "₹0",
        fatigueImpact: "-16 fatigue",
        bookingBasketImpact: "Marks stay timing as easier to confirm.",
      },
    });
  }

  if (!args.intent.smartPreferences.preferScenicRoute) {
    recommendations.push({
      id: "scenic-stop",
      title: "Add a scenic stop",
      category: "Route",
      priority: "Medium",
      confidenceScore: 84,
      detail: "A short viewpoint stop will improve route quality without changing the full plan.",
      reason: "The selected route has room for a low-friction stop without changing city order.",
      impact: "Higher scenic score",
      impactSummary: "Experience +10, comfort +3, cost +₹500.",
      affectedDay: dayLabel(days, 1, "afternoon"),
      affectedModule: "Route, itinerary, activities",
      costImpact: 500,
      comfortImpact: 3,
      riskImpact: 0,
      budgetImpact: -500,
      experienceImpact: 10,
      itineraryImpact: "Adds one scenic halt to the active route day.",
      whyAiSuggestsThis: {
        travellerStyle: `${args.intent.travelStyle} profile has interests in ${args.intent.interests.join(", ") || "local discovery"}.`,
        itineraryGap: "The route has movement but limited pause points.",
        budgetFit: "Small add-on cost fits current budget band.",
        routeFit: "Works with the active route without replacing transport.",
      },
      whatWillChange: {
        dayChange: dayLabel(days, 1, "afternoon"),
        added: ["Scenic route halt"],
        costImpact: "+₹500",
        fatigueImpact: "+2 fatigue",
        bookingBasketImpact: "Adds optional activity handoff.",
      },
    });
  }

  if (args.selectedRoute?.id !== "scenic" && args.intent.interests.includes("Nature")) {
    recommendations.push({
      id: "better-route",
      title: "Compare Scenic Route",
      category: "Route",
      priority: "High",
      confidenceScore: 88,
      detail: "Nature-led interests have stronger fit with the scenic route option.",
      reason: "Traveller interests and route-fit scoring point to the scenic variant.",
      impact: "Better route fit",
      impactSummary: "Route fit +15, experience +12, risk unchanged.",
      affectedDay: "Full route",
      affectedModule: "Route variant, itinerary, checkout readiness",
      costImpact: 0,
      comfortImpact: 6,
      riskImpact: 0,
      budgetImpact: 0,
      experienceImpact: 12,
      itineraryImpact: "Switches active route selection to scenic if available.",
      whyAiSuggestsThis: {
        travellerStyle: "Nature interest is active in traveller preferences.",
        itineraryGap: "Current route is efficient but less aligned with nature-led stops.",
        budgetFit: "No mandatory budget change.",
        routeFit: "Scenic route has stronger interest fit than the selected route.",
      },
      whatWillChange: {
        dayChange: "Route selection",
        updated: ["Active route", "route readiness", "review route payload"],
        costImpact: "₹0",
        fatigueImpact: "Neutral",
        bookingBasketImpact: "Updates transport context before checkout.",
      },
    });
  }

  if (!args.intent.smartPreferences.includeInsurance) {
    recommendations.push({
      id: "insurance",
      title: "Add insurance",
      category: "Risk",
      priority: hasCriticalRisk ? "High" : "Medium",
      confidenceScore: hasCriticalRisk ? 93 : 81,
      detail: "Insurance improves readiness for weather, delays and route changes.",
      reason: "Risk coverage is missing while checkout readiness can still accept insurance.",
      impact: "Higher readiness",
      impactSummary: "Risk -18%, checkout readiness +1, cost +₹1,200.",
      affectedDay: "Full trip",
      affectedModule: "Risk, booking readiness, checkout readiness",
      costImpact: 1200,
      comfortImpact: 5,
      riskImpact: -18,
      budgetImpact: -1200,
      experienceImpact: 0,
      itineraryImpact: "No itinerary timing change.",
      whyAiSuggestsThis: {
        travellerStyle: `${args.intent.travelStyle} travellers benefit from simpler disruption support.`,
        itineraryGap: "Checkout has no risk protection item selected.",
        budgetFit: "Low single add-on compared with trip total.",
        routeFit: "Protects route and service changes.",
        weatherRiskFit: hasCriticalRisk || hasWeatherWarning ? "Weather or risk warnings are active." : "General trip risk reduction.",
      },
      whatWillChange: {
        dayChange: "Full trip",
        added: ["Insurance preference"],
        updated: ["Booking readiness", "checkout readiness"],
        costImpact: "+₹1,200",
        fatigueImpact: "Neutral",
        bookingBasketImpact: "Adds insurance to the checkout basket.",
      },
    });
  }

  if (stayGap || (args.intent.budgetTier !== "Luxury" && args.intent.travelStyle === "Luxury")) {
    recommendations.push({
      id: "upgrade-stay",
      title: stayGap ? "Add recovery stay" : "Upgrade stay band",
      category: "Stay",
      priority: stayGap ? "High" : "Medium",
      confidenceScore: stayGap ? 89 : 82,
      detail: stayGap
        ? "A stay gap can block booking readiness; add a recovery stay option."
        : "Luxury style is currently stronger than the selected budget tier.",
      reason: stayGap
        ? "Stay selection is not ready while the trip still requires accommodation."
        : "Traveller style asks for higher comfort than the selected budget band.",
      impact: "Better comfort",
      impactSummary: "Comfort +14, readiness +1, cost +₹4,500.",
      affectedDay: dayLabel(days, 0, "night"),
      affectedModule: "Stay selection, booking readiness, checkout readiness",
      costImpact: 4500,
      comfortImpact: 14,
      riskImpact: -4,
      budgetImpact: -4500,
      experienceImpact: 3,
      itineraryImpact: "Adds or upgrades a stay item on the first destination night.",
      whyAiSuggestsThis: {
        travellerStyle: `${args.intent.travelStyle} style with ${args.intent.stayPreference} preference.`,
        itineraryGap: "Stay handoff needs a clearer selected option.",
        budgetFit: budgetPressure ? "This increases cost, but fixes a readiness blocker." : "Premium budget can absorb the stay lift.",
        routeFit: "Placed at the first destination to reduce transfer fatigue.",
      },
      whatWillChange: {
        dayChange: dayLabel(days, 0, "night"),
        added: ["Recovery stay option"],
        updated: ["Stay readiness", "checkout basket"],
        costImpact: "+₹4,500",
        fatigueImpact: "-10 fatigue",
        bookingBasketImpact: "Adds hotel/stay service to selected modules.",
      },
    });
  }

  if (args.intent.smartPreferences.includeCreatorSpots) {
    recommendations.push({
      id: "creator-route",
      title: "Explore creator route",
      category: "Creator",
      priority: "Low",
      confidenceScore: 77,
      detail: "Creator spots can be grouped into one low-friction reel-friendly stretch.",
      reason: "Creator preference is enabled and matched creator picks are available.",
      impact: "Better creator fit",
      impactSummary: "Creator opportunity +16, experience +8, cost +₹0.",
      affectedDay: dayLabel(days, 1, "evening"),
      affectedModule: "Creator, itinerary, review payload",
      costImpact: 0,
      comfortImpact: 0,
      riskImpact: 0,
      budgetImpact: 0,
      experienceImpact: 8,
      itineraryImpact: "Adds creator capture context to one evening slot.",
      whyAiSuggestsThis: {
        travellerStyle: "Creator spots are enabled in smart preferences.",
        itineraryGap: "No dedicated creator window is highlighted yet.",
        budgetFit: "No direct cost impact.",
        routeFit: "Creator pick can be grouped into existing route movement.",
      },
      whatWillChange: {
        dayChange: dayLabel(days, 1, "evening"),
        added: ["Creator opportunity stop"],
        updated: ["Creator pick highlight"],
        costImpact: "₹0",
        fatigueImpact: "+1 fatigue",
        bookingBasketImpact: "Adds creator context to review payload.",
      },
    });
  }

  if (args.intent.smartPreferences.includeLocalMarket) {
    recommendations.push({
      id: "market-stop",
      title: "Add Local Life stop",
      category: "Local Market",
      priority: "High",
      confidenceScore: 92,
      detail: "Local Life picks are already matched; add one dedicated stop to the timeline.",
      reason: "Local Life picks are already matched with route and traveller interest.",
      impact: "Higher ecosystem value",
      impactSummary: "Experience +14, Local commerce +18, Cost +₹800.",
      affectedDay: dayLabel(days, 1, "evening"),
      affectedModule: "Itinerary, Local Life, checkout readiness",
      costImpact: 800,
      comfortImpact: 2,
      riskImpact: 0,
      budgetImpact: -800,
      experienceImpact: 14,
      localCommerceImpact: 18,
      itineraryImpact: "Adds a Local Life stop to the evening itinerary.",
      whyAiSuggestsThis: {
        travellerStyle: `${args.intent.travelStyle} travellers selected Local Life or commerce-friendly interests.`,
        itineraryGap: "Local Life picks exist but no dedicated stop is applied.",
        budgetFit: "Small basket estimate fits the current trip budget.",
        routeFit: "Market pick is close to the selected route stop.",
        weatherRiskFit: hasWeatherWarning ? "Evening indoor/covered market is safer during weather variance." : "No weather blocker.",
      },
      whatWillChange: {
        dayChange: dayLabel(days, 1, "evening"),
        added: ["Local Life stop"],
        updated: ["Local Life basket", "review payload"],
        costImpact: "+₹800",
        fatigueImpact: "+3 fatigue",
        bookingBasketImpact: "Adds highlighted Local Life item to checkout.",
      },
    });
  }

  if (budgetPressure) {
    recommendations.push({
      id: "budget-saving-plan",
      title: "Apply budget saving plan",
      category: "Budget",
      priority: "High",
      confidenceScore: 86,
      detail: "Shift one flexible line item to a lower-cost option without changing the route.",
      reason: "Budget pressure is visible in spend signals and optimization opportunities.",
      impact: "Lower estimated spend",
      impactSummary: "Potential saving ₹10,217, comfort -2, budget fit +14.",
      affectedDay: "Budget overview",
      affectedModule: "Budget, cost optimization, quote estimate",
      costImpact: -10217,
      comfortImpact: -2,
      riskImpact: 0,
      budgetImpact: 10217,
      experienceImpact: 0,
      itineraryImpact: "No day order change; updates budget and quote totals.",
      whyAiSuggestsThis: {
        travellerStyle: `${args.intent.budgetTier} budget with ${args.intent.travelStyle} style.`,
        itineraryGap: "Cost optimization has a flexible component to tune.",
        budgetFit: "Directly lowers estimated spend.",
        routeFit: "Keeps route variant unchanged.",
      },
      whatWillChange: {
        dayChange: "Budget overview",
        updated: ["Budget lines", "quote estimate", "review budget payload"],
        costImpact: "-₹10,217",
        fatigueImpact: "Neutral",
        bookingBasketImpact: "Keeps selected services but lowers budget estimate.",
      },
    });
  }

  if (hasWeatherWarning) {
    recommendations.push({
      id: "weather-buffer",
      title: "Move outdoor activity to safer window",
      category: "Weather",
      priority: "Medium",
      confidenceScore: 83,
      detail: "Weather signals suggest keeping one flexible indoor/covered backup.",
      reason: "Weather intelligence has an active warning for the current plan.",
      impact: "Lower weather disruption",
      impactSummary: "Risk -10%, comfort +6, itinerary resilience +12.",
      affectedDay: dayLabel(days, 1, "afternoon"),
      affectedModule: "Weather, itinerary, risk analysis",
      costImpact: 0,
      comfortImpact: 6,
      riskImpact: -10,
      budgetImpact: 0,
      experienceImpact: 5,
      itineraryImpact: "Updates one activity note with an indoor fallback.",
      whyAiSuggestsThis: {
        travellerStyle: "Flexible smart planning is enabled by current planner context.",
        itineraryGap: "Outdoor slot lacks a backup.",
        budgetFit: "No budget increase required.",
        routeFit: "Backup stays in the same city or stop.",
        weatherRiskFit: "Weather warning is active.",
      },
      whatWillChange: {
        dayChange: dayLabel(days, 1, "afternoon"),
        added: ["Indoor fallback note"],
        updated: ["Weather risk note"],
        costImpact: "₹0",
        fatigueImpact: "-2 fatigue",
        bookingBasketImpact: "No basket change.",
      },
    });
  }

  if (transportGap || hasCriticalRisk) {
    recommendations.push({
      id: "night-travel-risk",
      title: "Remove night travel risk",
      category: "Transport",
      priority: "High",
      confidenceScore: 90,
      detail: "Transport readiness or risk signals indicate one safer daytime movement.",
      reason: "Route and risk signals suggest a safer travel timing before checkout.",
      impact: "Lower route risk",
      impactSummary: "Risk reduction -18%, comfort +7, cost +₹0.",
      affectedDay: dayLabel(days, 0, "transfer"),
      affectedModule: "Route, transport, risk analysis, checkout readiness",
      costImpact: 0,
      comfortImpact: 7,
      riskImpact: -18,
      budgetImpact: 0,
      experienceImpact: 2,
      itineraryImpact: "Updates transport timing notes and highlights cab/transport readiness.",
      whyAiSuggestsThis: {
        travellerStyle: `${args.intent.travelStyle} travellers with avoid-night-travel preference ${args.intent.smartPreferences.avoidNightTravel ? "enabled" : "available"}.`,
        itineraryGap: "Transport readiness needs a safer timing marker.",
        budgetFit: "No required fare increase.",
        routeFit: "Keeps selected route but avoids late movement.",
        weatherRiskFit: hasCriticalRisk ? "Critical risk warning is active." : "Improves baseline route safety.",
      },
      whatWillChange: {
        dayChange: dayLabel(days, 0, "transfer"),
        updated: ["Transport timing", "risk notes", "booking readiness"],
        costImpact: "₹0",
        fatigueImpact: "-8 fatigue",
        bookingBasketImpact: "Highlights transport service readiness.",
      },
    });
  }

  if (activityGap) {
    recommendations.push({
      id: "activity-fit",
      title: "Add matched activity",
      category: "Activities",
      priority: "Medium",
      confidenceScore: 80,
      detail: "Traveller interests are present but the itinerary has too few bookable activities.",
      reason: "Activities and experiences are underrepresented against stated interests.",
      impact: "Higher experience score",
      impactSummary: "Experience +11, cost +₹1,500, checkout activities ready.",
      affectedDay: dayLabel(days, 1, "afternoon"),
      affectedModule: "Activities, itinerary, booking readiness",
      costImpact: 1500,
      comfortImpact: 1,
      riskImpact: 0,
      budgetImpact: -1500,
      experienceImpact: 11,
      itineraryImpact: "Adds a bookable interest-led activity.",
      whyAiSuggestsThis: {
        travellerStyle: `Interests include ${args.intent.interests.join(", ") || "local experiences"}.`,
        itineraryGap: "Bookable activity count is low.",
        budgetFit: "Moderate activity cost within trip estimate.",
        routeFit: "Placed inside existing destination day.",
      },
      whatWillChange: {
        dayChange: dayLabel(days, 1, "afternoon"),
        added: ["Matched activity"],
        updated: ["Activities readiness"],
        costImpact: "+₹1,500",
        fatigueImpact: "+4 fatigue",
        bookingBasketImpact: "Adds one activity to selected activities.",
      },
    });
  }

  return recommendations;
}
