import type {
  TiyaDayPlan,
  TiyaRouteOption,
  TiyaSmartAlert,
  TiyaTripIntent,
} from "./plannerTypes";

export function generatePlannerSmartAlerts(args: {
  intent: TiyaTripIntent;
  days: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
  totalBudget: number;
}): TiyaSmartAlert[] {
  const alerts: TiyaSmartAlert[] = [];

  if (args.intent.interests.includes("Nature") || args.intent.interests.includes("Trekking")) {
    alerts.push({
      id: "weather",
      title: "Weather advisory",
      detail: "Outdoor-heavy days should keep a half-day buffer for rain, wind or visibility changes.",
      severity: "info",
    });
  }

  if (args.selectedRoute?.riskLevel === "High") {
    alerts.push({
      id: "route-risk",
      title: "Long driving stretch",
      detail: "Selected route has high intensity. Add rest stops or split the segment.",
      severity: "warning",
    });
  }

  if (!args.intent.smartPreferences.avoidNightTravel) {
    alerts.push({
      id: "night-travel",
      title: "Night travel risk",
      detail: "Tiya recommends enabling daylight-first routing for safer transfer windows.",
      severity: "warning",
    });
  }

  if (args.intent.travelStyle === "Spiritual" || args.intent.interests.includes("Temples")) {
    alerts.push({
      id: "permit",
      title: "Permit and timing reminder",
      detail: "Temple, hill and protected routes may need timing checks or entry passes.",
      severity: "info",
    });
  }

  if (args.totalBudget > 180000) {
    alerts.push({
      id: "budget",
      title: "Budget overflow watch",
      detail: "Premium choices are pushing spend upward. Keep a flexibility buffer before booking.",
      severity: "warning",
    });
  }

  if (args.days.length >= 5 && args.intent.pace === "Packed") {
    alerts.push({
      id: "crowd",
      title: "High crowd period planning",
      detail: "Packed plans need early starts for popular experiences and market lanes.",
      severity: "info",
    });
  }

  if (!args.intent.smartPreferences.includeStays) {
    alerts.push({
      id: "stay",
      title: "Low stay availability signal",
      detail: "Stay planning is disabled. Recheck accommodation before converting to booking.",
      severity: "critical",
    });
  }

  return alerts.slice(0, 5);
}
