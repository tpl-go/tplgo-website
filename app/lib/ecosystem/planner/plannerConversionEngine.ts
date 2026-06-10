import type { TiyaBookingBridgeItem } from "./plannerBookingBridge";
import type { TiyaGeneratedPlan, TiyaRouteOption, TiyaTripIntent } from "./plannerTypes";

export type TiyaConversionWidget = {
  id: string;
  title: string;
  detail: string;
  service: string;
  cta: string;
  href: string;
  strength: "High" | "Medium" | "Optional";
};

export type TiyaUpsellItem = {
  id: string;
  title: string;
  detail: string;
  impact: string;
};

export function generateConversionWidgets({
  intent,
  plan,
  selectedRoute,
  bookingItems,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  selectedRoute?: TiyaRouteOption;
  bookingItems: TiyaBookingBridgeItem[];
}): TiyaConversionWidget[] {
  const safeItems = Array.isArray(bookingItems) ? bookingItems : [];
  const flightItem = safeItems.find((item) => item.service === "Flights");
  const hotelItem = safeItems.find((item) => item.service === "Hotels");
  const homestayItem = safeItems.find((item) => item.service === "Homestays");
  const packageItem = safeItems.find((item) => item.service === "Packages");
  const insuranceItem = safeItems.find((item) => item.service === "Insurance");
  const stayItem = intent.stayPreference === "Homestay" ? homestayItem : hotelItem;
  const creatorCount = Array.isArray(plan.creatorPicks) ? plan.creatorPicks.length : 0;

  return [
    flightItem && {
      id: "best-flight",
      title: "Best flight available for this route",
      detail: `${intent.fromCity} to ${intent.toCity} can open directly in TPL flight search context.`,
      service: "Flights",
      cta: "View Flights",
      href: flightItem.href,
      strength: intent.transportMode === "Flight" ? "High" : "Medium",
    },
    stayItem && {
      id: "stay-cluster",
      title:
        intent.budgetTier === "Economy"
          ? "Budget stay match"
          : creatorCount > 0
            ? "Premium creator stay"
            : "Recommended stay cluster",
      detail: `${intent.stayPreference} options can align with ${intent.budgetTier.toLowerCase()} planning in ${intent.toCity}.`,
      service: intent.stayPreference,
      cta: stayItem.cta,
      href: stayItem.href,
      strength: "High",
    },
    packageItem && {
      id: "package-fit",
      title: "Itinerary can become a TPL package",
      detail: "Bundle route, stay, transfers and experiences from the planner output.",
      service: "Packages",
      cta: "View Packages",
      href: packageItem.href,
      strength: intent.tripType === "Multi-city" ? "High" : "Medium",
    },
    insuranceItem && {
      id: "insurance-fit",
      title:
        selectedRoute?.riskLevel === "High"
          ? "Insurance strongly recommended"
          : "Trip protection available",
      detail: "Simulate duration and traveller count into the insurance search flow.",
      service: "Insurance",
      cta: "Add Insurance",
      href: insuranceItem.href,
      strength: selectedRoute?.riskLevel === "High" ? "High" : "Optional",
    },
  ].filter(Boolean) as TiyaConversionWidget[];
}

export function generateSmartUpsells({
  intent,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  selectedRoute?: TiyaRouteOption;
}): TiyaUpsellItem[] {
  const upsells: TiyaUpsellItem[] = [
    {
      id: "trip-protection",
      title: "Trip protection",
      detail: "Add insurance and emergency assistance before checkout.",
      impact: "Safety readiness",
    },
    {
      id: "local-market-addon",
      title: "Local market add-on",
      detail: "Attach destination-led products to the itinerary.",
      impact: "TPL ecosystem value",
    },
  ];

  if (intent.budgetTier === "Premium" || intent.budgetTier === "Luxury") {
    upsells.push({
      id: "scenic-room",
      title: "Scenic room upgrade",
      detail: "Upgrade one stay to a better view or comfort cluster.",
      impact: "Comfort score",
    });
  }

  if (intent.transportMode === "Train") {
    upsells.push({
      id: "premium-train",
      title: "Premium train class",
      detail: "Improve comfort on longer rail segments.",
      impact: "Travel fatigue",
    });
  }

  if (intent.smartPreferences.includeCreatorSpots) {
    upsells.push({
      id: "creator-experience",
      title: "Creator-curated experience",
      detail: "Add a creator-led food, photo or culture stop.",
      impact: "Creator value",
    });
  }

  if (selectedRoute?.routeStyle?.toLowerCase().includes("scenic")) {
    upsells.push({
      id: "scenic-route",
      title: "Scenic route enhancement",
      detail: "Add a view stop, local food stop and safer timing window.",
      impact: "Scenic score",
    });
  }

  return upsells;
}
