import type {
  TiyaExpeditionDestination,
  TiyaExpeditionMode,
} from "./plannerExpeditionEngine";
import type { TiyaTripIntent } from "./plannerTypes";

export type TiyaDestinationCluster = {
  id: string;
  title: string;
  destinations: TiyaExpeditionDestination[];
  clusterType: "Gateway" | "Regional" | "Recovery" | "Finale";
  transferPlan: string;
  backtrackingReduction: number;
};

export type TiyaExpeditionTimelineItem = {
  id: string;
  dayRange: string;
  destination: string;
  transition: string;
  stayCluster: string;
  recoveryPoint: boolean;
  activityDensity: "Light" | "Balanced" | "Packed";
};

export function generateDestinationClusters({
  destinations,
  intent,
  mode,
}: {
  destinations: TiyaExpeditionDestination[];
  intent: TiyaTripIntent;
  mode: TiyaExpeditionMode;
}): TiyaDestinationCluster[] {
  const safeDestinations = Array.isArray(destinations) ? destinations : [];
  const clusters: TiyaDestinationCluster[] = [];

  for (let index = 0; index < safeDestinations.length; index += 2) {
    const group = safeDestinations.slice(index, index + 2);
    const first = group[0];
    if (!first) continue;

    clusters.push({
      id: `cluster-${index}`,
      title:
        first.role === "Origin"
          ? "Gateway cluster"
          : group.some((destination) => destination.role === "Finale")
            ? "Finale cluster"
            : group.some((destination) => destination.intensity === "High")
              ? "Recovery cluster"
              : "Regional cluster",
      destinations: group,
      clusterType:
        first.role === "Origin"
          ? "Gateway"
          : group.some((destination) => destination.role === "Finale")
            ? "Finale"
            : group.some((destination) => destination.intensity === "High")
              ? "Recovery"
              : "Regional",
      transferPlan:
        mode === "Fast Circuit"
          ? "Shortest logical transfer with reduced halt time"
          : intent.smartPreferences.preferScenicRoute
            ? "Scenic movement with view and food halts"
            : "Efficient transfer with local route grouping",
      backtrackingReduction: Math.min(94, 58 + group.length * 12 + index * 4),
    });
  }

  return clusters;
}

export function generateExpeditionTimeline({
  destinations,
  intent,
}: {
  destinations: TiyaExpeditionDestination[];
  intent: TiyaTripIntent;
}): TiyaExpeditionTimelineItem[] {
  const safeDestinations = Array.isArray(destinations) ? destinations : [];
  let currentDay = 1;

  return safeDestinations.map((destination, index) => {
    const nights = Math.max(1, destination.stayNights || 1);
    const startDay = currentDay;
    const endDay = currentDay + nights - 1;
    currentDay += nights;

    return {
      id: `timeline-${destination.id}`,
      dayRange: `Day ${startDay}${endDay > startDay ? `-${endDay}` : ""}`,
      destination: destination.name,
      transition:
        index === 0
          ? `${intent.transportMode} expedition start`
          : `${safeDestinations[index - 1]?.name} to ${destination.name}`,
      stayCluster:
        destination.stayNights > 1
          ? `${destination.stayNights} night stay cluster`
          : "Short halt cluster",
      recoveryPoint:
        destination.intensity === "High" || destination.role === "Halt",
      activityDensity:
        intent.pace === "Packed"
          ? "Packed"
          : destination.intensity === "High"
            ? "Balanced"
            : "Light",
    };
  });
}
