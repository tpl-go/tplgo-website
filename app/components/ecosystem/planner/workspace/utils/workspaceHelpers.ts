import type { TiyaBudgetLine, TiyaInsight, TiyaRouteOption } from "@/app/lib/ecosystem/planner/plannerTypes";

import type { WorkspacePreferences } from "./workspaceTypes";

export function budgetEstimate(routeOption: TiyaRouteOption) {
  const distanceValue = Number(routeOption.distance.match(/\d+/)?.[0] ?? 360);

  const multiplier =
    routeOption.id === "budget"
      ? 62
      : routeOption.id === "scenic"
        ? 92
        : routeOption.id === "adventure"
          ? 105
          : 82;

  const estimate = Math.max(
    9000,
    Math.round((distanceValue * multiplier) / 1000) * 1000
  );

  return `₹${estimate.toLocaleString("en-IN")} estimate`;
}

export function transportHint(routeOption: TiyaRouteOption) {
  if (routeOption.routeStyle.toLowerCase().includes("rail")) return "Train + Cab";
  if (routeOption.routeStyle.toLowerCase().includes("airport")) {
    return "Flight + Transfer";
  }
  if (routeOption.id === "adventure") return "Bike / Self-drive";
  if (routeOption.id === "scenic") return "Self-drive / Cab";
  return "Mixed Mode";
}

export function routeAccent(routeId: string) {
  if (routeId === "fastest") return "from-orange-500 to-amber-400";
  if (routeId === "scenic") return "from-cyan-400 to-teal-300";
  if (routeId === "budget") return "from-emerald-400 to-lime-300";
  if (routeId === "adventure") return "from-violet-400 to-rose-400";
  return "from-orange-500 to-amber-400";
}

export function buildRouteBullets(routeOption: TiyaRouteOption) {
  const bullets = [
    routeOption.bestFor,
    routeOption.routeStyle,
    `${routeOption.riskLevel} risk route watch`,
    `${routeOption.difficulty} difficulty`,
  ];

  if (routeOption.id === "fastest") {
    bullets.push("Shortest reliable transfer chain", "Daylight movement prioritised");
  } else if (routeOption.id === "scenic") {
    bullets.push("Viewpoint-friendly travel rhythm", "Photo halts and slow route windows");
  } else if (routeOption.id === "budget") {
    bullets.push("Cost controlled movement", "Value stay and transfer planning");
  } else if (routeOption.id === "adventure") {
    bullets.push("Terrain-aware buffers", "Safety-first route sequencing");
  } else {
    bullets.push("Smart route balancing", "AI optimized travel movement");
  }

  return bullets.slice(0, 6);
}

export function buildWorkspaceBudgetLines(
  selectedRoute: TiyaRouteOption,
  preferences: WorkspacePreferences
): TiyaBudgetLine[] {
  const distanceValue = Number(selectedRoute.distance.match(/\d+/)?.[0] ?? 360);

  const comfortFactor =
    preferences.comfortLevel === "Luxury"
      ? 1.55
      : preferences.comfortLevel === "Premium"
        ? 1.22
        : preferences.comfortLevel === "Economy"
          ? 0.78
          : 1;

  const transport = Math.max(6000, Math.round(distanceValue * 42 * comfortFactor));
  const stay = Math.round(transport * 0.68);
  const activities = Math.round(transport * 0.32);
  const buffer = Math.round(transport * 0.18);

  return [
    { label: "Transport", amount: transport, tone: "blue" },
    { label: "Stay", amount: stay, tone: "orange" },
    { label: "Activities", amount: activities, tone: "green" },
    { label: "Buffer", amount: buffer, tone: "slate" },
  ];
}

export function buildWorkspaceInsights(
  selectedRoute: TiyaRouteOption,
  preferences: WorkspacePreferences
): TiyaInsight[] {
  return [
    {
      label: "Route fit",
      value: selectedRoute.bestFor,
      score: selectedRoute.comfortScore,
      tone: "blue",
    },
    {
      label: "Travel pace",
      value: preferences.pace,
      score:
        preferences.pace === "Packed"
          ? 78
          : preferences.pace === "Relaxed"
            ? 92
            : 86,
      tone: "orange",
    },
    {
      label: "Comfort match",
      value: preferences.comfortLevel,
      score: selectedRoute.comfortScore,
      tone: "green",
    },
  ];
}
