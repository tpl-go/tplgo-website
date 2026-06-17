import type { TiyaBookingModule, TiyaTripIntent } from "./plannerTypes";

function isFlightIntent(intent: TiyaTripIntent) {
  return intent.transportMode === "Flight" || intent.transportMode === "Mixed Mode";
}

function isCabIntent(intent: TiyaTripIntent) {
  return ["Cab", "Self-drive Car", "EV", "Mixed Mode"].includes(intent.transportMode);
}

function matchesStay(intent: TiyaTripIntent, stay: "Hotel" | "Homestay") {
  return intent.smartPreferences.includeStays && intent.stayPreference === stay;
}

function readiness(highlighted: boolean, optional = false): TiyaBookingModule["readiness"] {
  if (highlighted) return "Ready";
  if (optional) return "Optional";
  return "Recommended";
}

export function generatePlannerBookingModules(
  intent: TiyaTripIntent
): TiyaBookingModule[] {
  const destination = intent.toCity.trim() || "your destination";
  const localMarket =
    intent.smartPreferences.includeLocalMarket ||
    intent.interests.includes("Local Market") ||
    intent.interests.includes("Shopping");
  const creatorSpots =
    intent.smartPreferences.includeCreatorSpots ||
    intent.interests.includes("Creator Spots");
  const activityHeavy = intent.interests.some((interest) =>
    ["Food", "Culture", "Nature", "Trekking", "Temples", "Nightlife"].includes(
      interest
    )
  );
  const packageFit =
    intent.tripType === "Multi-city" ||
    intent.travelStyle === "Family" ||
    intent.travelStyle === "Luxury" ||
    intent.pace === "Packed";

  return [
    {
      id: "flights",
      serviceName: "Flights",
      reason: isFlightIntent(intent)
        ? `${intent.transportMode} selected for ${destination}.`
        : `Compare flight options if you want a faster ${destination} start.`,
      readiness: readiness(isFlightIntent(intent)),
      cta: "Search Flights",
      href: "/flights",
      isHighlighted: isFlightIntent(intent),
    },
    {
      id: "hotels",
      serviceName: "Hotels",
      reason: matchesStay(intent, "Hotel")
        ? `Hotel preference matched for ${intent.budgetTier.toLowerCase()} stay planning.`
        : `Hotel inventory can support the selected ${intent.travelStyle.toLowerCase()} style.`,
      readiness: readiness(matchesStay(intent, "Hotel"), !intent.smartPreferences.includeStays),
      cta: "Find Stays",
      href: "/hotels/results",
      isHighlighted: matchesStay(intent, "Hotel"),
    },
    {
      id: "homestays",
      serviceName: "Homestays",
      reason: matchesStay(intent, "Homestay")
        ? "Homestay preference matched with local host-led stay options."
        : "Useful for culture-first and local neighbourhood stays.",
      readiness: readiness(matchesStay(intent, "Homestay"), !intent.smartPreferences.includeStays),
      cta: "Find Stays",
      href: "/homestays/results",
      isHighlighted: matchesStay(intent, "Homestay"),
    },
    {
      id: "cabs",
      serviceName: "Cabs",
      reason: isCabIntent(intent)
        ? `${intent.transportMode} route needs cab/local transfer coordination.`
        : "Add airport, station or local sightseeing transfers.",
      readiness: readiness(isCabIntent(intent)),
      cta: "Add Cab",
      href: "/cab/result",
      isHighlighted: isCabIntent(intent),
    },
    {
      id: "packages",
      serviceName: "Packages",
      reason: packageFit
        ? `${intent.travelStyle} ${intent.tripType.toLowerCase()} can be bundled into a TPL package.`
        : "Bundle stay, transfers and experiences when ready.",
      readiness: readiness(packageFit),
      cta: "View Packages",
      href: "/holidays",
      isHighlighted: packageFit,
    },
    {
      id: "experiences",
      serviceName: "Activities/Experiences",
      reason: activityHeavy
        ? `Matched to ${intent.interests.slice(0, 3).join(", ")} interests.`
        : "Add destination experiences after route selection.",
      readiness: readiness(activityHeavy),
      cta: "Explore Experiences",
      href: "/explore",
      isHighlighted: activityHeavy,
    },
    {
      id: "insurance",
      serviceName: "Insurance",
      reason: intent.smartPreferences.includeInsurance
        ? "Insurance included in smart preferences."
        : "Add protection for weather, route and medical contingencies.",
      readiness: readiness(intent.smartPreferences.includeInsurance, true),
      cta: "Add Insurance",
      href: "/insurance/results",
      isHighlighted: intent.smartPreferences.includeInsurance,
    },
    {
      id: "local-market",
      serviceName: "Local Life",
      reason: localMarket || creatorSpots
        ? "Local market and creator-led discovery are enabled in this brief."
        : "Explore destination-led products and local finds.",
      readiness: readiness(localMarket || creatorSpots, true),
      cta: "Explore Local Life",
      href: "/local-life",
      isHighlighted: localMarket || creatorSpots,
    },
  ];
}
