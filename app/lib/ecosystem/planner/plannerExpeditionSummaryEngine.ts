import type {
  TiyaExpeditionDestination,
  TiyaExpeditionMode,
} from "./plannerExpeditionEngine";
import type { TiyaDestinationCluster } from "./plannerClusterEngine";
import type { TiyaTripIntent } from "./plannerTypes";

export type TiyaExpeditionSummary = {
  totalRouteDistance: string;
  estimatedExpeditionDays: number;
  routeComplexity: number;
  comfortScore: number;
  expeditionIntensity: number;
  recommendedTravellerType: string;
  fatigueRisk: "Low" | "Medium" | "High";
  warnings: string[];
};

function clampScore(value: number) {
  return Math.max(28, Math.min(98, Math.round(value)));
}

export function generateExpeditionSummary({
  destinations,
  clusters,
  intent,
  mode,
}: {
  destinations: TiyaExpeditionDestination[];
  clusters: TiyaDestinationCluster[];
  intent: TiyaTripIntent;
  mode: TiyaExpeditionMode;
}): TiyaExpeditionSummary {
  const safeDestinations = Array.isArray(destinations) ? destinations : [];
  const safeClusters = Array.isArray(clusters) ? clusters : [];
  const highIntensityStops = safeDestinations.filter(
    (destination) => destination.intensity === "High"
  ).length;
  const estimatedExpeditionDays =
    safeDestinations.reduce(
      (sum, destination) => sum + Math.max(1, destination.stayNights || 1),
      0
    ) + Math.max(0, safeDestinations.length - 2);
  const routeComplexity = clampScore(42 + safeDestinations.length * 8 + highIntensityStops * 7);
  const expeditionIntensity = clampScore(
    38 +
      highIntensityStops * 12 +
      (intent.pace === "Packed" ? 18 : intent.pace === "Relaxed" ? -6 : 6)
  );
  const comfortScore = clampScore(
    92 -
      safeDestinations.length * 4 -
      highIntensityStops * 6 +
      (intent.budgetTier === "Luxury" ? 14 : 0) -
      (intent.seniors > 0 ? 8 : 0)
  );
  const fatigueRisk: TiyaExpeditionSummary["fatigueRisk"] =
    expeditionIntensity >= 78 || routeComplexity >= 82
      ? "High"
      : expeditionIntensity >= 58
        ? "Medium"
        : "Low";
  const averageBacktrackingReduction = safeClusters.length
    ? Math.round(
        safeClusters.reduce((sum, cluster) => sum + cluster.backtrackingReduction, 0) /
          safeClusters.length
      )
    : 58;

  return {
    totalRouteDistance: `${Math.max(220, safeDestinations.length * 280 + highIntensityStops * 140)} km est.`,
    estimatedExpeditionDays,
    routeComplexity,
    comfortScore,
    expeditionIntensity,
    recommendedTravellerType:
      mode === "Luxury Expedition"
        ? "Premium comfort travellers"
        : mode === "Adventure Expedition"
          ? "High-energy explorers"
          : mode === "Spiritual Circuit"
            ? "Pilgrimage and family groups"
            : "Flexible multi-city travellers",
    fatigueRisk,
    warnings: [
      safeDestinations.length > 4 ? "Over-transfer warning: split the route into clusters." : "",
      fatigueRisk === "High" ? "Add recovery stay after the hardest transfer." : "",
      intent.smartPreferences.avoidNightTravel ? "Keep transitions daylight-led." : "Consider avoiding overnight movement.",
      `Cluster logic reduces backtracking by ${averageBacktrackingReduction}%.`,
    ].filter(Boolean),
  };
}
