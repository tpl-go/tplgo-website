import { generateCheckoutDraft } from "./plannerCheckoutBridge";
import { generatePlannerRules } from "./plannerRulesEngine";
import { generatePlannerSeasonReadiness } from "./plannerSeasonEngine";
import { generatePlannerWeatherSimulation } from "./plannerWeatherSimulationEngine";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaSmartAlert,
  TiyaTripIntent,
} from "./plannerTypes";

export const TIYA_TRIP_REVIEW_KEY = "tpl_tiya_trip_review";
export const TIYA_CONFIRMED_PLAN_KEY = "tpl_tiya_confirmed_plan";

export type TiyaReviewChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
  detail: string;
};

export type TiyaReviewScores = {
  tripQualityScore: number;
  bookingReadinessScore: number;
  safetyConfidence: number;
  budgetFit: number;
  comfortMatch: number;
  experienceMatch: number;
};

export type TiyaTripReviewSnapshot = {
  reviewId: string;
  createdAt: string;
  tripIntent: TiyaTripIntent;
  route: string;
  selectedRoute: string;
  selectedScenario?: string;
  selectedVariant?: string;
  itinerarySummary: string;
  travelIntelligence: string;
  seasonalWeatherNotes: string[];
  rulesWarnings: string[];
  selectedBundle: string;
  quoteEstimate: number;
  bookingReadiness: string;
  creatorPicks: string[];
  localMarketPicks: string[];
  expertReviewStatus: string;
  scores: TiyaReviewScores;
};

function canUseStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can fail in private mode, quota limits, or locked-down browsers.
  }
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function clampScore(value: number) {
  return Math.max(35, Math.min(98, Math.round(value)));
}

export function generateReviewScores({
  intent,
  plan,
  days,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  days: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
}): TiyaReviewScores {
  const safeDays = Array.isArray(days) ? days : [];
  const bookingModules = Array.isArray(plan.bookingModules)
    ? plan.bookingModules
    : [];
  const highlightedModules = bookingModules.filter(
    (module) => module.isHighlighted
  ).length;
  const creatorPicks = Array.isArray(plan.creatorPicks) ? plan.creatorPicks : [];
  const marketPicks = Array.isArray(plan.localMarketPicks)
    ? plan.localMarketPicks
    : [];
  const safetyConfidence = clampScore(
    74 +
      (intent.smartPreferences.avoidNightTravel ? 8 : 0) +
      (intent.smartPreferences.includeInsurance ? 6 : 0) -
      (selectedRoute?.riskLevel === "High" ? 14 : 0)
  );
  const budgetFit = clampScore(selectedRoute?.budgetFit ?? 76);
  const comfortMatch = clampScore(
    (selectedRoute?.comfortScore ?? 74) +
      (intent.smartPreferences.includeStays ? 5 : -4) +
      (intent.seniors > 0 ? -5 : 0)
  );
  const experienceMatch = clampScore(
    66 +
      Math.min(intent.interests.length, 6) * 4 +
      Math.min(creatorPicks.length, 2) * 4 +
      Math.min(marketPicks.length, 2) * 3
  );
  const bookingReadinessScore = clampScore(
    52 + highlightedModules * 6 + Math.min(safeDays.length, 6) * 3
  );
  const tripQualityScore = clampScore(
    (safetyConfidence +
      budgetFit +
      comfortMatch +
      experienceMatch +
      bookingReadinessScore +
      (selectedRoute?.scenicScore ?? 76)) /
      6
  );

  return {
    tripQualityScore,
    bookingReadinessScore,
    safetyConfidence,
    budgetFit,
    comfortMatch,
    experienceMatch,
  };
}

export function generateReviewChecklist({
  intent,
  plan,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  selectedRoute?: TiyaRouteOption;
}): TiyaReviewChecklistItem[] {
  const hasCreatorOrMarket =
    intent.smartPreferences.includeCreatorSpots ||
    intent.smartPreferences.includeLocalMarket ||
    (Array.isArray(plan.creatorPicks) && plan.creatorPicks.length > 0) ||
    (Array.isArray(plan.localMarketPicks) && plan.localMarketPicks.length > 0);

  return [
    {
      id: "route",
      label: "Route checked",
      checked: Boolean(selectedRoute),
      detail: selectedRoute?.name || plan.routeTitle,
    },
    {
      id: "itinerary",
      label: "Itinerary checked",
      checked: Array.isArray(plan.days) && plan.days.length > 0,
      detail: `${plan.days.length} day blocks generated.`,
    },
    {
      id: "budget",
      label: "Budget checked",
      checked: plan.totalBudget > 0,
      detail: `Budget preview ₹${plan.totalBudget.toLocaleString("en-IN")}.`,
    },
    {
      id: "safety",
      label: "Safety checked",
      checked:
        intent.smartPreferences.avoidNightTravel ||
        intent.smartPreferences.includeInsurance ||
        selectedRoute?.riskLevel !== "High",
      detail: selectedRoute?.riskLevel
        ? `${selectedRoute.riskLevel} route risk.`
        : "Safety signals available.",
    },
    {
      id: "stay",
      label: "Stay preference checked",
      checked: Boolean(intent.stayPreference),
      detail: intent.stayPreference,
    },
    {
      id: "transport",
      label: "Transport checked",
      checked: Boolean(intent.transportMode),
      detail: intent.transportMode,
    },
    {
      id: "creator-market",
      label: "Local/creator add-ons checked",
      checked: hasCreatorOrMarket,
      detail: hasCreatorOrMarket
        ? "Creator or local market layer is active."
        : "No creator/local market add-on selected.",
    },
    {
      id: "quote",
      label: "Quote generated",
      checked: true,
      detail: "Quote preview is available for review.",
    },
    {
      id: "expert",
      label: "Expert review optional",
      checked: true,
      detail: "Expert escalation remains optional and frontend-only.",
    },
  ];
}

export function generateTripReviewSnapshot({
  intent,
  plan,
  days,
  selectedRoute,
  selectedScenarioId,
  selectedVariantId,
  smartAlerts,
}: {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  days: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
  selectedScenarioId?: string;
  selectedVariantId?: string;
  smartAlerts?: TiyaSmartAlert[];
}): TiyaTripReviewSnapshot {
  const safeDays = Array.isArray(days) ? days : [];
  const checkoutDraft = generateCheckoutDraft({ intent, plan });
  const rules = generatePlannerRules({ intent, plan, days: safeDays, selectedRoute });
  const readiness = generatePlannerSeasonReadiness({ intent, selectedRoute });
  const weatherCards = generatePlannerWeatherSimulation({
    intent,
    readiness,
    selectedRoute,
  });
  const warningRules = rules.filter((rule) => rule.status !== "pass");
  const alerts = Array.isArray(smartAlerts) ? smartAlerts : [];
  const creatorPicks = Array.isArray(plan.creatorPicks) ? plan.creatorPicks : [];
  const marketPicks = Array.isArray(plan.localMarketPicks)
    ? plan.localMarketPicks
    : [];
  const expertLead = readJson<{ leadId?: string } | null>(
    "tpl_tiya_last_expert_request",
    null
  );
  const scores = generateReviewScores({
    intent,
    plan,
    days: safeDays,
    selectedRoute,
  });

  return {
    reviewId: `tiya_review_${Date.now()}`,
    createdAt: new Date().toISOString(),
    tripIntent: intent,
    route: plan.routeTitle,
    selectedRoute: selectedRoute?.name || plan.routeTitle,
    selectedScenario: selectedScenarioId,
    selectedVariant: selectedVariantId,
    itinerarySummary: `${safeDays.length} days across ${[
      ...new Set(safeDays.map((day) => day.city)),
    ].join(", ")}`,
    travelIntelligence: `${selectedRoute?.difficulty || "Balanced"} difficulty · ${
      selectedRoute?.comfortScore ?? scores.comfortMatch
    } comfort · ${selectedRoute?.scenicScore ?? 78} scenic.`,
    seasonalWeatherNotes: weatherCards
      .slice(0, 4)
      .map((card) => `${card.label}: ${card.value}`),
    rulesWarnings: [
      ...warningRules.slice(0, 4).map((rule) => `${rule.title}: ${rule.reason}`),
      ...alerts.slice(0, 2).map((alert) => `${alert.title}: ${alert.detail}`),
    ],
    selectedBundle: checkoutDraft.selectedBundle.name,
    quoteEstimate: checkoutDraft.quotePreview.totalQuoteEstimate,
    bookingReadiness: `${scores.bookingReadinessScore}% booking readiness`,
    creatorPicks: creatorPicks.slice(0, 3).map((creator) => creator.specialty),
    localMarketPicks: marketPicks.slice(0, 3).map((product) => product.productName),
    expertReviewStatus: expertLead?.leadId
      ? `Lead draft available: ${expertLead.leadId}`
      : "Expert review optional",
    scores,
  };
}

export function saveTripReview(snapshot: TiyaTripReviewSnapshot) {
  writeJson(TIYA_TRIP_REVIEW_KEY, snapshot);
}

export function confirmTripReview(snapshot: TiyaTripReviewSnapshot) {
  writeJson(TIYA_TRIP_REVIEW_KEY, snapshot);
  writeJson(TIYA_CONFIRMED_PLAN_KEY, {
    ...snapshot,
    confirmedAt: new Date().toISOString(),
  });
}
