import type { TiyaSeasonReadiness } from "./plannerSeasonEngine";
import type { TiyaTripIntent } from "./plannerTypes";

export function generatePlannerSeasonalPackingHints({
  intent,
  readiness,
}: {
  intent: TiyaTripIntent;
  readiness: TiyaSeasonReadiness;
}) {
  const hints = new Set<string>();

  if (readiness.destinationType === "Mountain") {
    hints.add("warm layers");
    hints.add("trekking shoes");
    hints.add("altitude prep");
  }

  if (readiness.seasonType === "Monsoon") {
    hints.add("rain gear");
    hints.add("quick-dry clothing");
    hints.add("waterproof bags");
  }

  if (readiness.destinationType === "Desert" || readiness.seasonType === "Summer") {
    hints.add("sunscreen");
    hints.add("hydration salts");
    hints.add("light cotton layers");
  }

  if (intent.travelStyle === "Adventure" || intent.interests.includes("Trekking")) {
    hints.add("trekking shoes");
    hints.add("basic medicines");
  }

  if (intent.children > 0 || intent.seniors > 0) {
    hints.add("family medicines");
    hints.add("comfort snacks");
    hints.add("backup warm layer");
  }

  if (!hints.size) {
    hints.add("sunscreen");
    hints.add("basic medicines");
    hints.add("comfortable walking shoes");
  }

  return Array.from(hints).slice(0, 8);
}
