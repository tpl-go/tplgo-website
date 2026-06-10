import type { TiyaPlannerSnapshot } from "./plannerTypes";

export function buildPlannerShareText(snapshot: TiyaPlannerSnapshot) {
  const itinerary = Array.isArray(snapshot.itinerary) ? snapshot.itinerary : [];
  const creatorPicks = Array.isArray(snapshot.plan.creatorPicks)
    ? snapshot.plan.creatorPicks
    : [];
  const localMarketPicks = Array.isArray(snapshot.plan.localMarketPicks)
    ? snapshot.plan.localMarketPicks
    : [];
  const highlights = itinerary
    .slice(0, 4)
    .map((day) => `Day ${day.day}: ${day.headline}`)
    .join("\n");
  const creators = creatorPicks
    .filter((creator) => snapshot.selectedCreatorPickIds.includes(creator.id))
    .map((creator) => creator.creatorName)
    .slice(0, 3)
    .join(", ");
  const market = localMarketPicks
    .filter((product) => snapshot.selectedMarketPickIds.includes(product.id))
    .map((product) => product.productName)
    .slice(0, 3)
    .join(", ");

  return [
    `${snapshot.tripName}`,
    `${snapshot.plan.routeTitle} · ${snapshot.plan.nights} Nights · ${snapshot.plan.travellerCount} Travellers`,
    `Transport: ${snapshot.intent.transportMode}`,
    "",
    "Itinerary highlights:",
    highlights || "Flexible itinerary ready inside Tiya Smart Planner.",
    creators ? `\nCreator picks: ${creators}` : "",
    market ? `Local market picks: ${market}` : "",
    "\nPlanned with Tiya Smart Planner by TPL.",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sharePlannerTrip(snapshot: TiyaPlannerSnapshot) {
  const text = buildPlannerShareText(snapshot);

  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      await navigator.share({
        title: snapshot.tripName,
        text,
      });

      return "shared" as const;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return "cancelled" as const;
      }
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return "copied" as const;
  }

  return "unavailable" as const;
}
