import type {
  TiyaDayPlan,
  TiyaJourneyMap,
  TiyaJourneyMapSegment,
  TiyaJourneyMarkerType,
  TiyaTripIntent,
} from "./plannerTypes";

function segmentStyleForTransport(
  transportMode: string
): TiyaJourneyMapSegment["segmentStyle"] {
  if (transportMode === "Flight") return "flight";
  if (transportMode === "Train") return "train";
  if (transportMode === "Bike") return "bike";
  if (transportMode === "Mixed Mode") return "mixed";
  return "road";
}

function markerForDay(day: TiyaDayPlan, index: number): TiyaJourneyMarkerType {
  if (index === 0) return "origin";
  if (day.items.some((item) => item.type === "stay")) return "stay";
  if (day.items.some((item) => item.type === "meal")) return "food";
  return "destination";
}

export function generatePlannerJourneyMap(args: {
  days: TiyaDayPlan[];
  intent: TiyaTripIntent;
}): TiyaJourneyMap {
  const days = Array.isArray(args.days) ? args.days : [];
  const nodes = days.map((day, index) => {
    const progress = days.length <= 1 ? 0 : index / (days.length - 1);

    return {
      id: `node-${day.id}`,
      label: index === 0 ? args.intent.fromCity || day.city : day.city,
      subLabel: `Day ${day.day}`,
      markerType: markerForDay(day, index),
      x: 8 + progress * 84,
      y: 42 + Math.sin(index * 1.15) * 18,
    };
  });
  const segments = nodes.slice(1).map((node, index) => ({
    id: `segment-${index}`,
    fromNodeId: nodes[index].id,
    toNodeId: node.id,
    transportMode: args.intent.transportMode,
    segmentStyle: segmentStyleForTransport(args.intent.transportMode),
  }));

  return {
    title: `${args.intent.fromCity || "Origin"} → ${args.intent.toCity || "Destination"}`,
    transportMode: args.intent.transportMode,
    nodes,
    segments,
  };
}
