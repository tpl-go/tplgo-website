import { calculatePlannerDayDensity } from "./plannerDensityEngine";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "./plannerTypes";

export type TiyaRuleStatus = "pass" | "warning" | "critical";

export type TiyaPlannerRule = {
  id: string;
  title: string;
  status: TiyaRuleStatus;
  reason: string;
  suggestedFix: string;
  affectedArea: string;
  actionLabel: "Fix Plan" | "Add Buffer" | "Change Route" | "Upgrade Stay";
};

function parseBudgetAmount(value: string) {
  const numeric = Number(value.replace(/[^0-9]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}

function getLateMovementDays(days: TiyaDayPlan[]) {
  return days.filter((day) =>
    (Array.isArray(day.items) ? day.items : []).some((item) => {
      const hour = Number(item.time.split(":")[0]);
      return Number.isFinite(hour) && hour >= 20;
    })
  );
}

function isPermitDestination(intent: TiyaTripIntent) {
  const text = `${intent.toCity} ${intent.interests.join(" ")} ${intent.travelStyle}`.toLowerCase();

  return (
    text.includes("ladakh") ||
    text.includes("sikkim") ||
    text.includes("spiti") ||
    text.includes("border") ||
    text.includes("trek")
  );
}

function hasWeatherRisk(intent: TiyaTripIntent, selectedRoute?: TiyaRouteOption) {
  const text = `${intent.toCity} ${intent.interests.join(" ")} ${intent.travelStyle}`.toLowerCase();

  return (
    text.includes("ladakh") ||
    text.includes("himachal") ||
    text.includes("kerala") ||
    text.includes("goa") ||
    text.includes("uttarakhand") ||
    selectedRoute?.riskLevel === "High"
  );
}

function getEstimatedTravelHours(
  intent: TiyaTripIntent,
  selectedRoute?: TiyaRouteOption
) {
  if (selectedRoute?.duration) {
    const hours = Number(selectedRoute.duration.match(/\d+/)?.[0]);
    if (Number.isFinite(hours) && hours > 0) return hours;
  }

  if (intent.transportMode === "Flight") return 4;
  if (intent.transportMode === "Train") return 7;
  if (intent.transportMode === "Bus") return 8;
  if (intent.transportMode === "Bike") return 9;
  if (intent.transportMode === "Self-drive Car" || intent.transportMode === "EV") {
    return 8;
  }

  return 6;
}

function buildRule(args: TiyaPlannerRule): TiyaPlannerRule {
  return args;
}

export function generatePlannerRules({
  intent,
  plan,
  days,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  days: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
}): TiyaPlannerRule[] {
  const safeDays = Array.isArray(days) ? days : [];
  const lateMovementDays = getLateMovementDays(safeDays);
  const maxTravelHours = intent.seniors > 0 || intent.children > 0 ? 6 : 8;
  const estimatedTravelHours = getEstimatedTravelHours(intent, selectedRoute);
  const customBudget = parseBudgetAmount(intent.customBudgetAmount);
  const densityResults = safeDays.map((day) =>
    calculatePlannerDayDensity({ day, intent, selectedRoute })
  );
  const overpackedDays = densityResults.filter((density) => density.score >= 78);
  const seniorMode = intent.seniors > 0;
  const familyMode = intent.travelStyle === "Family" || intent.children > 0;
  const petMode = intent.pets;
  const budgetOverrun =
    typeof customBudget === "number" && plan.totalBudget > customBudget;
  const noStayNeeded = intent.stayPreference === "No Stay Needed";
  const lowComfortStay =
    ["Hostel", "Camp", "No Stay Needed"].includes(intent.stayPreference) &&
    (intent.seniors > 0 || intent.children > 0 || intent.budgetTier === "Luxury");

  return [
    buildRule({
      id: "avoid-night-travel",
      title: "Avoid night travel",
      status:
        intent.smartPreferences.avoidNightTravel && lateMovementDays.length
          ? "critical"
          : lateMovementDays.length
            ? "warning"
            : "pass",
      reason: lateMovementDays.length
        ? `Late movement appears on ${lateMovementDays.length} day block.`
        : "No late-night movement detected in the current itinerary.",
      suggestedFix: "Move transfer-heavy blocks before daylight cutoff.",
      affectedArea: lateMovementDays[0]
        ? `Day ${lateMovementDays[0].day}`
        : "Route timing",
      actionLabel: "Add Buffer",
    }),
    buildRule({
      id: "max-travel-hours",
      title: "Max travel hours per day",
      status:
        estimatedTravelHours > maxTravelHours + 2
          ? "critical"
          : estimatedTravelHours > maxTravelHours
            ? "warning"
            : "pass",
      reason: `Estimated longest travel stretch is ${estimatedTravelHours}h against a ${maxTravelHours}h comfort target.`,
      suggestedFix: "Split the longest transfer or add a scenic halt.",
      affectedArea: selectedRoute?.name || "Primary route",
      actionLabel: "Change Route",
    }),
    buildRule({
      id: "senior-comfort",
      title: "Senior comfort mode",
      status: seniorMode
        ? overpackedDays.length || estimatedTravelHours > 6
          ? "critical"
          : "warning"
        : "pass",
      reason: seniorMode
        ? "Senior travellers need softer transfer and activity pacing."
        : "No senior-specific comfort constraint is active.",
      suggestedFix: "Add rest windows and keep transfer blocks shorter.",
      affectedArea: seniorMode ? "Group comfort" : "Traveller mix",
      actionLabel: "Add Buffer",
    }),
    buildRule({
      id: "family-safety",
      title: "Family safety mode",
      status: familyMode
        ? intent.smartPreferences.avoidNightTravel && selectedRoute?.riskLevel !== "High"
          ? "pass"
          : "warning"
        : "pass",
      reason: familyMode
        ? "Family planning should prefer daylight movement and lower-risk routes."
        : "Family safety mode is not required by the current traveller mix.",
      suggestedFix: "Keep safer daylight route windows and avoid high-risk segments.",
      affectedArea: selectedRoute?.name || "Route safety",
      actionLabel: "Change Route",
    }),
    buildRule({
      id: "pet-friendly",
      title: "Pet-friendly planning",
      status: petMode
        ? noStayNeeded || intent.transportMode === "Flight"
          ? "warning"
          : "pass"
        : "pass",
      reason: petMode
        ? "Pets need compatible stays and transport checks."
        : "Pet-friendly constraints are inactive.",
      suggestedFix: "Choose pet-friendly stays and verify transport rules.",
      affectedArea: "Stay and transport",
      actionLabel: "Upgrade Stay",
    }),
    buildRule({
      id: "budget-cap",
      title: "Budget cap warning",
      status: budgetOverrun
        ? plan.totalBudget > (customBudget ?? 0) * 1.18
          ? "critical"
          : "warning"
        : "pass",
      reason: customBudget
        ? `Estimated plan is ₹${plan.totalBudget.toLocaleString("en-IN")} against cap ₹${customBudget.toLocaleString("en-IN")}.`
        : "No custom budget cap is set.",
      suggestedFix: "Switch to budget route, reduce premium stays or trim optional activities.",
      affectedArea: "Budget preview",
      actionLabel: "Fix Plan",
    }),
    buildRule({
      id: "permit-required",
      title: "Permit-required hint",
      status: isPermitDestination(intent) ? "warning" : "pass",
      reason: isPermitDestination(intent)
        ? "Destination or activity profile may require permits or local access checks."
        : "No permit-sensitive destination signal detected.",
      suggestedFix: "Add permit reminder and keep a documentation buffer.",
      affectedArea: intent.toCity || "Destination",
      actionLabel: "Fix Plan",
    }),
    buildRule({
      id: "weather-fallback",
      title: "Weather-risk fallback",
      status: hasWeatherRisk(intent, selectedRoute)
        ? selectedRoute?.riskLevel === "High"
          ? "critical"
          : "warning"
        : "pass",
      reason: hasWeatherRisk(intent, selectedRoute)
        ? "Route or destination has simulated weather sensitivity."
        : "Weather simulation is within normal fallback range.",
      suggestedFix: "Keep indoor backup activities and daylight transfer buffers.",
      affectedArea: selectedRoute?.name || intent.toCity || "Weather flow",
      actionLabel: "Add Buffer",
    }),
    buildRule({
      id: "ev-range",
      title: "EV range / charging stop hint",
      status: intent.transportMode === "EV" ? "warning" : "pass",
      reason:
        intent.transportMode === "EV"
          ? "EV routing needs charging stop visibility and range buffers."
          : "EV charging constraint is inactive.",
      suggestedFix: "Insert verified charging stops between long route segments.",
      affectedArea: "Transport route",
      actionLabel: "Change Route",
    }),
    buildRule({
      id: "fuel-stop",
      title: "Fuel stop hint",
      status:
        ["Self-drive Car", "Bike"].includes(intent.transportMode) ||
        selectedRoute?.id === "adventure"
          ? "warning"
          : "pass",
      reason:
        ["Self-drive Car", "Bike"].includes(intent.transportMode) ||
        selectedRoute?.id === "adventure"
          ? "Road-led route should include fuel and service stops."
          : "Fuel-stop planning is not required for the current transport mode.",
      suggestedFix: "Add route fuel stops before remote or scenic stretches.",
      affectedArea: selectedRoute?.name || "Road route",
      actionLabel: "Change Route",
    }),
    buildRule({
      id: "stay-comfort",
      title: "Stay comfort minimum",
      status: lowComfortStay ? "critical" : noStayNeeded ? "warning" : "pass",
      reason: lowComfortStay
        ? "Current stay preference may be below comfort requirements."
        : noStayNeeded
          ? "No stay mode needs refresh or recovery fallback checks."
          : "Stay comfort meets current traveller requirements.",
      suggestedFix: "Upgrade stay level on transfer-heavy or family/senior days.",
      affectedArea: intent.stayPreference,
      actionLabel: "Upgrade Stay",
    }),
    buildRule({
      id: "overpacked-itinerary",
      title: "Overpacked itinerary warning",
      status:
        overpackedDays.length > 1
          ? "critical"
          : overpackedDays.length
            ? "warning"
            : "pass",
      reason: overpackedDays.length
        ? `${overpackedDays.length} day has packed density or stacked activity pressure.`
        : "Activity density is within the current pace tolerance.",
      suggestedFix: "Move flexible activity blocks or add a slow day.",
      affectedArea: overpackedDays.length ? "Adaptive day cards" : "Itinerary",
      actionLabel: "Fix Plan",
    }),
  ];
}
