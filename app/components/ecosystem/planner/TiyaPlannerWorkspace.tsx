"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Bot, ChevronDown, Sparkles } from "lucide-react";
import { generatePlannerSmartAlerts } from "@/app/lib/ecosystem/planner/plannerAlertEngine";
import { generatePlannerBudgetIntelligence } from "@/app/lib/ecosystem/planner/plannerBudgetInsightEngine";
import { buildPlannerSnapshot } from "@/app/lib/ecosystem/planner/plannerDraftEngine";
import {
  generatePlannerTravelStats,
  generatePlannerTripHealth,
} from "@/app/lib/ecosystem/planner/plannerHealthEngine";
import { generatePlannerJourneyMap } from "@/app/lib/ecosystem/planner/plannerJourneyMapEngine";
import { generateSmartPlannerMock } from "@/app/lib/ecosystem/planner/plannerMockGenerator";
import { generatePlannerRecommendations } from "@/app/lib/ecosystem/planner/plannerRecommendationEngine";
import {
  generatePlannerJourneyStatus,
  generatePlannerJourneyTimeline,
} from "@/app/lib/ecosystem/planner/plannerTimelineEngine";
import {
  deletePlannerTrip,
  duplicatePlannerTrip,
  loadLastPlannerTrip,
  loadPlannerDraft,
  loadSavedPlannerTrips,
  renamePlannerTrip,
  savePlannerDraft,
  savePlannerTrip,
} from "@/app/lib/ecosystem/planner/plannerStorage";
import type {
  TiyaAIRecommendation,
  TiyaAIRecommendationChangeLog,
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaLocalMarketPick,
  TiyaPlannerSnapshot,
  TiyaRouteOption,
  TiyaTimelineItem,
  TiyaTripIntent,
  TiyaTripNotes as TiyaTripNotesState,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import type {
  TiyaRouteScenario,
  TiyaScenarioId,
} from "@/app/lib/ecosystem/planner/plannerScenarioEngine";
import {
  buildIntentForTripVariant,
  type TiyaTripVariant,
  type TiyaTripVariantId,
} from "@/app/lib/ecosystem/planner/plannerVariantEngine";
import TiyaAIInsights from "./TiyaAIInsights";
import TiyaBookingReadyLayer from "./TiyaBookingReadyLayer";
import TiyaBookingIntegration from "./TiyaBookingIntegration";
import TiyaBudgetPreview from "./TiyaBudgetPreview";
import TiyaCheckoutBridge from "./TiyaCheckoutBridge";
import TiyaCostOptimization from "./TiyaCostOptimization";
import TiyaCreatorPicks from "./TiyaCreatorPicks";
import TiyaDesktopEntryHero from "./smart-planner/sections/TiyaDesktopEntryHero";
import TiyaDynamicItinerary from "./TiyaDynamicItinerary";
import TiyaDynamicItineraryEngine from "./TiyaDynamicItineraryEngine";
import TiyaExperiencePlanner from "./TiyaExperiencePlanner";
import TiyaExpeditionBuilder from "./TiyaExpeditionBuilder";
import TiyaExpertReview from "./TiyaExpertReview";
import TiyaExportItinerary from "./TiyaExportItinerary";
import TiyaGroupPlanner from "./TiyaGroupPlanner";
import TiyaLocalMarketPicks from "./TiyaLocalMarketPicks";
import TiyaJourneyTimeline from "./TiyaJourneyTimeline";
import TiyaMemoryDashboard from "./TiyaMemoryDashboard";
import TiyaOperatingDashboard from "./TiyaOperatingDashboard";
import TiyaPackingEngine from "./TiyaPackingEngine";
import TiyaPackageBuilder from "./TiyaPackageBuilder";
import TiyaPlannerActions from "./TiyaPlannerActions";
import TiyaPostTripEcosystem from "./TiyaPostTripEcosystem";
import TiyaQuoteGenerator from "./TiyaQuoteGenerator";
import TiyaRouteIntelligence from "./smart-planner/tabs/TiyaRouteIntelligence";
import TiyaRouteThinking from "./smart-planner/sections/TiyaRouteThinking";
import TiyaRouteSummary from "./TiyaRouteSummary";
import TiyaRulesEnginePanel from "./TiyaRulesEnginePanel";
import TiyaScenarioEngine from "./TiyaScenarioEngine";
import TiyaSeasonalWeather from "./TiyaSeasonalWeather";
import TiyaSavedTripLibrary from "./TiyaSavedTripLibrary";
import TiyaSmartBundleEngine from "./TiyaSmartBundleEngine";
import TiyaSuggestionCards from "./TiyaSuggestionCards";
import TiyaTripNotes from "./TiyaTripNotes";
import TiyaTripIntentForm from "./TiyaTripIntentForm";
import TiyaTripReview from "./TiyaTripReview";
import TiyaTripVariantBuilder from "./TiyaTripVariantBuilder";
import TiyaTravelCompanion from "./TiyaTravelCompanion";

const defaultIntent: TiyaTripIntent = {
  fromCity: "Delhi",
  toCity: "Jaipur",
  startDate: "2026-08-12",
  endDate: "2026-08-17",
  tripType: "Round trip",
  transportMode: "Flight",
  stayPreference: "Hotel",
  budgetTier: "Premium",
  customBudgetAmount: "₹85,000",
  adults: 2,
  children: 0,
  seniors: 0,
  pets: false,
  travelStyle: "Couple",
  pace: "Balanced",
  interests: ["Food", "Culture", "Local Market"],
  smartPreferences: {
    includeStays: true,
    includeLocalMarket: true,
    includeCreatorSpots: false,
    includeInsurance: true,
    avoidNightTravel: true,
    preferScenicRoute: true,
  },
};

const defaultPlan = generateSmartPlannerMock(defaultIntent);

const defaultNotes: TiyaTripNotesState = {
  personal: "",
  packing: "",
  localTips: "",
  creatorNotes: "",
};

function getRecommendedRouteId(plan: TiyaGeneratedPlan) {
  return (
    plan.routeOptions.find((route) => route.isRecommended)?.id ??
    plan.routeOptions[0]?.id
  );
}

function buildRecommendationItem(
  recommendation: TiyaAIRecommendation,
  day: TiyaDayPlan,
  type: TiyaTimelineItem["type"] = "activity"
): TiyaTimelineItem {
  return {
    id: `ai-${recommendation.id}-${Date.now()}`,
    time: recommendation.category === "Stay" ? "20:00" : "17:00",
    title: recommendation.title,
    location: day.city,
    type,
    category:
      recommendation.category === "Transport"
        ? "Transport"
        : recommendation.category === "Stay"
          ? "Stay"
          : recommendation.category === "Local Market"
            ? "Other"
            : "Activities",
    description: recommendation.reason,
    price: Math.max(0, recommendation.costImpact),
    currency: "INR",
    bookingStatus: "recommended",
    detailSummary: recommendation.impactSummary,
  };
}

function updateFirstMatchingDay(
  days: TiyaDayPlan[],
  recommendation: TiyaAIRecommendation,
  type: TiyaTimelineItem["type"] = "activity"
) {
  if (!days.length) return days;
  const dayIndex = Math.min(1, days.length - 1);

  return days.map((day, index) => {
    if (index !== dayIndex) return day;
    if (day.items?.some((item) => item.id.includes(`ai-${recommendation.id}`))) {
      return day;
    }

    return {
      ...day,
      notes: `${day.notes || ""} AI applied: ${recommendation.title}.`.trim(),
      items: [...(day.items || []), buildRecommendationItem(recommendation, day, type)],
    };
  });
}

function updateBudgetForRecommendation(
  plan: TiyaGeneratedPlan,
  recommendation: TiyaAIRecommendation
): TiyaGeneratedPlan {
  const costImpact = recommendation.costImpact;
  if (!costImpact) return plan;
  const targetLabel =
    recommendation.category === "Budget"
      ? "Optimization"
      : recommendation.category === "Stay"
        ? "Stay"
        : recommendation.category === "Transport"
          ? "Transport"
          : recommendation.category === "Local Market"
            ? "Local"
            : "Activities";
  const budgetLines = Array.isArray(plan.budgetLines) ? plan.budgetLines : [];
  const matchIndex = budgetLines.findIndex((line) =>
    line.label.toLowerCase().includes(targetLabel.toLowerCase())
  );
  const nextLines =
    matchIndex >= 0
      ? budgetLines.map((line, index) =>
          index === matchIndex
            ? { ...line, amount: Math.max(0, line.amount + costImpact) }
            : line
        )
      : [
          ...budgetLines,
          {
            label: `AI ${recommendation.category}`,
            amount: Math.max(0, costImpact),
            tone: "orange" as const,
          },
        ];

  return {
    ...plan,
    budgetLines: nextLines,
    totalBudget: Math.max(0, plan.totalBudget + costImpact),
  };
}

function updatePlanForRecommendation(
  plan: TiyaGeneratedPlan,
  recommendation: TiyaAIRecommendation
): TiyaGeneratedPlan {
  const withBudget = updateBudgetForRecommendation(plan, recommendation);
  const bookingModules = (withBudget.bookingModules || []).map((module) => {
    const shouldHighlight =
      (recommendation.category === "Stay" && ["hotels", "homestays"].includes(module.id)) ||
      (recommendation.category === "Transport" && module.id === "cabs") ||
      (recommendation.category === "Activities" && module.id === "experiences") ||
      (recommendation.category === "Risk" && module.id === "insurance") ||
      (recommendation.category === "Local Market" && module.id === "local-market");

    return shouldHighlight
      ? { ...module, readiness: "Ready" as const, isHighlighted: true }
      : module;
  });
  const localMarketPicks =
    recommendation.category === "Local Market"
      ? (withBudget.localMarketPicks || []).map((pick, index) =>
          index === 0 ? { ...pick, isHighlighted: true } : pick
        )
      : withBudget.localMarketPicks;
  const creatorPicks =
    recommendation.category === "Creator"
      ? (withBudget.creatorPicks || []).map((pick, index) =>
          index === 0 ? { ...pick, isHighlighted: true } : pick
        )
      : withBudget.creatorPicks;

  return {
    ...withBudget,
    bookingModules,
    creatorPicks,
    localMarketPicks,
  };
}

function buildRecommendationChangeLog(
  recommendation: TiyaAIRecommendation
): TiyaAIRecommendationChangeLog {
  return {
    id: `ai_log_${recommendation.id}_${Date.now()}`,
    recommendationId: recommendation.id,
    title: "AI Recommendation Applied",
    summary: recommendation.whatWillChange.added?.length
      ? `Added ${recommendation.whatWillChange.added.join(", ")} to ${recommendation.affectedDay}`
      : recommendation.itineraryImpact,
    reason: recommendation.reason,
    impact: recommendation.impactSummary,
    appliedAt: new Date().toISOString(),
    category: recommendation.category,
    costDelta: recommendation.costImpact,
    actionType: "apply_recommendation",
    affectedDays: [recommendation.affectedDay],
    comfortImpact: recommendation.comfortImpact,
    newState: recommendation.whatWillChange.updated?.join(", ") || recommendation.itineraryImpact,
    previousState: "Current planner state",
    riskImpact: recommendation.riskImpact,
    sourceModule: "Smart Travel Recommendations",
  };
}

type PlannerModuleAction = {
  actionType: string;
  affectedDay?: number;
  affectedDays?: string[];
  category?: TiyaAIRecommendation["category"];
  comfortImpact?: number;
  costImpact?: number;
  detail: string;
  fatigueImpact?: number;
  newState?: string;
  previousState?: string;
  riskImpact?: number;
  sourceModule: string;
  title: string;
};

function buildModuleChangeLog(
  action: PlannerModuleAction
): TiyaAIRecommendationChangeLog {
  const affectedDays =
    action.affectedDays ||
    (action.affectedDay ? [`Day ${action.affectedDay}`] : ["Planner"]);
  const costImpact = action.costImpact || 0;
  const comfortImpact = action.comfortImpact || 0;
  const riskImpact = action.riskImpact || 0;

  return {
    id: `planner_log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    recommendationId: `module-${action.sourceModule.toLowerCase().replace(/\s+/g, "-")}`,
    title: action.title,
    summary: action.detail,
    reason: `${action.sourceModule} action applied from the live planner state.`,
    impact: [
      `Cost ${costImpact >= 0 ? "+" : "-"}₹${Math.abs(costImpact).toLocaleString("en-IN")}`,
      `Comfort ${comfortImpact >= 0 ? "+" : ""}${comfortImpact}`,
      `Risk ${riskImpact >= 0 ? "+" : ""}${riskImpact}`,
    ].join(" · "),
    appliedAt: new Date().toISOString(),
    category: action.category || "Route",
    costDelta: costImpact,
    actionType: action.actionType,
    affectedDays,
    comfortImpact,
    newState: action.newState || action.detail,
    previousState: action.previousState || "Current planner state",
    riskImpact,
    sourceModule: action.sourceModule,
  };
}

function localLifePriceEstimate(product: TiyaLocalMarketPick) {
  const values = product.priceRange
    .match(/\d[\d,]*/g)
    ?.map((value) => Number(value.replace(/,/g, "")))
    .filter((value) => Number.isFinite(value));

  return values?.[0] || 0;
}

function buildLocalLifeTimelineItem(
  product: TiyaLocalMarketPick,
  day: TiyaDayPlan
): TiyaTimelineItem {
  return {
    id: `local-life-${product.id}-${Date.now()}`,
    time: "17:30",
    title: product.productName,
    location: product.localRegion || day.city,
    type: "activity",
    category: "Other",
    description: `${product.description} Route fit ${product.routeRelevance}%.`,
    price: localLifePriceEstimate(product),
    currency: "INR",
    bookingStatus: "recommended",
    detailSummary: "Local Life item added from the discovery engine.",
  };
}

type PlannerModuleProps = {
  id: string;
  title: string;
  eyebrow: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

const plannerModuleNav = [
  ["workspace", "Workspace"],
  ["itinerary", "Itinerary"],
  ["timeline", "Timeline"],
  ["intelligence", "Travel AI"],
  ["ecosystem", "Ecosystem"],
  ["booking", "Booking"],
  ["review", "Review"],
  ["library", "Library"],
] as const;

function PlannerModule({
  id,
  title,
  eyebrow,
  defaultOpen = false,
  children,
}: PlannerModuleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section
      id={id}
      className="scroll-mt-24 overflow-hidden rounded-[1.75rem] border border-white/75 bg-white/42 shadow-[0_20px_70px_rgba(15,23,42,0.07)] backdrop-blur-2xl transition duration-300 hover:border-white hover:shadow-[0_24px_82px_rgba(15,23,42,0.09)]"
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 border-b border-white/60 bg-white/18 px-3 py-3 text-left transition hover:bg-white/35 sm:px-4"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-950 text-orange-300 shadow-[0_10px_26px_rgba(15,23,42,0.14)] sm:flex">
            <Sparkles size={16} />
          </span>
          <span className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">
            Tiya · {eyebrow}
          </p>
          <h2 className="mt-1 truncate text-base font-black text-slate-950 sm:text-lg">
            {title}
          </h2>
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-500 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen ? (
        <div id={`${id}-content`} className="grid gap-4 p-0">
          {children}
        </div>
      ) : null}
    </section>
  );
}

export default function TiyaPlannerWorkspace() {
  const [submittedIntent, setSubmittedIntent] =
    useState<TiyaTripIntent>(defaultIntent);
  const [generatedPlan, setGeneratedPlan] =
    useState<TiyaGeneratedPlan>(defaultPlan);
  const [editableDays, setEditableDays] =
    useState<TiyaDayPlan[]>(defaultPlan.days);
  const [tripNotes, setTripNotes] = useState<TiyaTripNotesState>(defaultNotes);
  const [selectedRouteId, setSelectedRouteId] = useState<
    TiyaRouteOption["id"] | undefined
  >(getRecommendedRouteId(defaultPlan));
  const [selectedScenarioId, setSelectedScenarioId] = useState<
    TiyaScenarioId | undefined
  >();
  const [selectedVariantId, setSelectedVariantId] = useState<
    TiyaTripVariantId | undefined
  >();
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>();
  const [savedTrips, setSavedTrips] = useState<TiyaPlannerSnapshot[]>([]);
  const [lastTrip, setLastTrip] = useState<TiyaPlannerSnapshot | null>(null);
  const [appliedRecommendationIds, setAppliedRecommendationIds] = useState<string[]>([]);
  const [savedRecommendationIds, setSavedRecommendationIds] = useState<string[]>([]);
  const [dismissedRecommendationIds, setDismissedRecommendationIds] = useState<string[]>([]);
  const [recommendationChangeLog, setRecommendationChangeLog] = useState<
    TiyaAIRecommendationChangeLog[]
  >([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [routeWorkspaceOpen, setRouteWorkspaceOpen] = useState(false);

  const plannerSnapshot = useMemo(
    () =>
      buildPlannerSnapshot({
        intent: submittedIntent,
        plan: generatedPlan,
        itinerary: editableDays,
        notes: tripNotes,
        selectedRouteId,
        appliedRecommendationIds,
        savedRecommendationIds,
        dismissedRecommendationIds,
        recommendationChangeLog,
      }),
    [
      appliedRecommendationIds,
      dismissedRecommendationIds,
      editableDays,
      generatedPlan,
      recommendationChangeLog,
      savedRecommendationIds,
      selectedRouteId,
      submittedIntent,
      tripNotes,
    ]
  );

  const journeyTimeline = useMemo(
    () =>
      generatePlannerJourneyTimeline({
        days: editableDays,
        intent: submittedIntent,
        creatorPicks: Array.isArray(generatedPlan.creatorPicks)
          ? generatedPlan.creatorPicks
          : [],
        localMarketPicks: Array.isArray(generatedPlan.localMarketPicks)
          ? generatedPlan.localMarketPicks
          : [],
        bookingModules: Array.isArray(generatedPlan.bookingModules)
          ? generatedPlan.bookingModules
          : [],
      }),
    [editableDays, generatedPlan, submittedIntent]
  );

  const journeyMap = useMemo(
    () =>
      generatePlannerJourneyMap({
        days: editableDays,
        intent: submittedIntent,
      }),
    [editableDays, submittedIntent]
  );

  const journeyStatus = useMemo(
    () =>
      generatePlannerJourneyStatus({
        intent: submittedIntent,
        days: editableDays,
        bookingModules: Array.isArray(generatedPlan.bookingModules)
          ? generatedPlan.bookingModules
          : [],
      }),
    [editableDays, generatedPlan.bookingModules, submittedIntent]
  );

  const selectedRoute = useMemo(
    () =>
      generatedPlan.routeOptions.find((route) => route.id === selectedRouteId) ??
      generatedPlan.routeOptions.find((route) => route.isRecommended) ??
      generatedPlan.routeOptions[0],
    [generatedPlan.routeOptions, selectedRouteId]
  );

  const tripHealth = useMemo(
    () =>
      generatePlannerTripHealth({
        intent: submittedIntent,
        days: editableDays,
        journeyStatus,
        selectedRoute,
        bookingModules: Array.isArray(generatedPlan.bookingModules)
          ? generatedPlan.bookingModules
          : [],
      }),
    [editableDays, generatedPlan.bookingModules, journeyStatus, selectedRoute, submittedIntent]
  );

  const budgetIntelligence = useMemo(
    () =>
      generatePlannerBudgetIntelligence({
        intent: submittedIntent,
        budgetLines: generatedPlan.budgetLines,
        totalBudget: generatedPlan.totalBudget,
      }),
    [generatedPlan.budgetLines, generatedPlan.totalBudget, submittedIntent]
  );

  const smartAlerts = useMemo(
    () =>
      generatePlannerSmartAlerts({
        intent: submittedIntent,
        days: editableDays,
        selectedRoute,
        totalBudget: generatedPlan.totalBudget,
      }),
    [editableDays, generatedPlan.totalBudget, selectedRoute, submittedIntent]
  );

  const recommendations = useMemo(
    () =>
      generatePlannerRecommendations({
        intent: submittedIntent,
        plan: generatedPlan,
        days: editableDays,
        selectedRoute,
        budget: budgetIntelligence,
        alerts: smartAlerts,
        journeyStatus,
      }),
    [
      budgetIntelligence,
      editableDays,
      generatedPlan,
      journeyStatus,
      selectedRoute,
      smartAlerts,
      submittedIntent,
    ]
  );

  const travelStats = useMemo(
    () =>
      generatePlannerTravelStats({
        routeOptions: generatedPlan.routeOptions,
        selectedRoute,
        journeyStatus,
      }),
    [generatedPlan.routeOptions, journeyStatus, selectedRoute]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSavedTrips(loadSavedPlannerTrips());

      const draft = loadPlannerDraft();
      setLastTrip(loadLastPlannerTrip() || draft);

      if (!draft) return;

      const restoredPlan = draft.plan || defaultPlan;

      setSubmittedIntent(draft.intent || defaultIntent);
      setGeneratedPlan(restoredPlan);
      setEditableDays(
        Array.isArray(draft.itinerary) ? draft.itinerary : restoredPlan.days
      );
      setTripNotes(draft.notes || defaultNotes);
      setSelectedRouteId(draft.selectedRouteId);
      setAppliedRecommendationIds(draft.appliedRecommendationIds || []);
      setSavedRecommendationIds(draft.savedRecommendationIds || []);
      setDismissedRecommendationIds(draft.dismissedRecommendationIds || []);
      setRecommendationChangeLog(draft.recommendationChangeLog || []);
      setRouteWorkspaceOpen(Boolean(draft.selectedRouteId));
      setLastSavedAt(draft.savedAt);
      setHasUnsavedChanges(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      savePlannerDraft(plannerSnapshot);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [plannerSnapshot]);

  function handleGenerate(intent: TiyaTripIntent) {
    setIsGenerating(true);

    window.setTimeout(() => {
      const nextPlan = generateSmartPlannerMock(intent);

      setSubmittedIntent(intent);
      setGeneratedPlan(nextPlan);
      setEditableDays(nextPlan.days);
      setSelectedRouteId(getRecommendedRouteId(nextPlan));
      setRouteWorkspaceOpen(false);
      setSelectedScenarioId(undefined);
      setSelectedVariantId(undefined);
      setAppliedRecommendationIds([]);
      setSavedRecommendationIds([]);
      setDismissedRecommendationIds([]);
      setRecommendationChangeLog([]);
      setHasUnsavedChanges(true);
      setIsGenerating(false);
    }, 650);
  }

  function handleDaysChange(days: TiyaDayPlan[]) {
    setEditableDays(days);
    setHasUnsavedChanges(true);
  }

  function handleNotesChange(notes: TiyaTripNotesState) {
    setTripNotes(notes);
    setHasUnsavedChanges(true);
  }

  function handleRouteChange(routeId: TiyaRouteOption["id"]) {
    const previousRoute = selectedRoute?.name || selectedRouteId || "No active route";
    const nextRoute = generatedPlan.routeOptions.find((route) => route.id === routeId);

    setSelectedRouteId(routeId);
    setRouteWorkspaceOpen(true);
    setRecommendationChangeLog((current) => [
      buildModuleChangeLog({
        actionType: "apply_route_variant",
        affectedDays: ["Full route"],
        category: "Route",
        comfortImpact: nextRoute ? nextRoute.comfortScore - (selectedRoute?.comfortScore || nextRoute.comfortScore) : 0,
        costImpact: 0,
        detail: `Active route changed to ${nextRoute?.name || routeId}.`,
        newState: nextRoute?.name || routeId,
        previousState: previousRoute,
        riskImpact: nextRoute?.riskLevel === "Low" ? -8 : nextRoute?.riskLevel === "High" ? 8 : 0,
        sourceModule: "Route Variants & Alternatives",
        title: "Route Variant Applied",
      }),
      ...current,
    ]);
    setHasUnsavedChanges(true);
  }

  function handleScenarioSelect(scenario: TiyaRouteScenario) {
    setSelectedScenarioId(scenario.id);

    if (scenario.appliesRouteId) {
      setSelectedRouteId(scenario.appliesRouteId);
      setRouteWorkspaceOpen(true);
    }

    setHasUnsavedChanges(true);
    setRecommendationChangeLog((current) => [
      buildModuleChangeLog({
        actionType: "apply_route_scenario",
        affectedDays: ["Scenario route"],
        category: "Route",
        comfortImpact: 4,
        costImpact: 0,
        detail: `Scenario ${scenario.name} selected for route review.`,
        newState: scenario.name,
        previousState: selectedScenarioId || "Base scenario",
        riskImpact: -4,
        sourceModule: "Route Variants & Alternatives",
        title: "Route Scenario Applied",
      }),
      ...current,
    ]);
  }

  function handleVariantSelect(variant: TiyaTripVariant) {
    setSelectedVariantId(variant.id);
    setHasUnsavedChanges(true);
    setRecommendationChangeLog((current) => [
      buildModuleChangeLog({
        actionType: "preview_trip_variant",
        affectedDays: ["Trip variant"],
        category: "Route",
        comfortImpact: 2,
        costImpact: 0,
        detail: `${variant.name} variant selected for preview.`,
        newState: variant.name,
        previousState: selectedVariantId || "Base variant",
        riskImpact: 0,
        sourceModule: "Route Variants & Alternatives",
        title: "Trip Variant Previewed",
      }),
      ...current,
    ]);
  }

  function handleVariantApply(variant: TiyaTripVariant) {
    const nextIntent = buildIntentForTripVariant(submittedIntent, variant.id);
    const nextPlan = generateSmartPlannerMock(nextIntent);

    setSelectedVariantId(variant.id);
    setSubmittedIntent(nextIntent);
    setGeneratedPlan(nextPlan);
    setEditableDays(nextPlan.days);
    setSelectedRouteId(getRecommendedRouteId(nextPlan));
    setAppliedRecommendationIds([]);
    setSavedRecommendationIds([]);
    setDismissedRecommendationIds([]);
    setRecommendationChangeLog([]);
    setRouteWorkspaceOpen(true);
    setSelectedScenarioId(undefined);
    setHasUnsavedChanges(true);
    setRecommendationChangeLog((current) => [
      buildModuleChangeLog({
        actionType: "apply_trip_variant",
        affectedDays: ["Full itinerary"],
        category: "Route",
        comfortImpact: variant.id === "luxury" || variant.id === "premium" ? 12 : variant.id === "budget" ? -3 : 5,
        costImpact: 0,
        detail: `${variant.name} variant applied and regenerated the master plan.`,
        newState: variant.name,
        previousState: submittedIntent.pace,
        riskImpact: variant.id === "adventure" ? 8 : -4,
        sourceModule: "Route Variants & Alternatives",
        title: "Trip Variant Applied",
      }),
      ...current,
    ]);
  }

  function restorePlannerSnapshot(snapshot: TiyaPlannerSnapshot) {
    const restoredPlan = snapshot.plan || defaultPlan;

    setSubmittedIntent(snapshot.intent || defaultIntent);
    setGeneratedPlan(restoredPlan);
    setEditableDays(
      Array.isArray(snapshot.itinerary) ? snapshot.itinerary : restoredPlan.days
    );
    setTripNotes(snapshot.notes || defaultNotes);
    setSelectedRouteId(snapshot.selectedRouteId || getRecommendedRouteId(restoredPlan));
    setAppliedRecommendationIds(snapshot.appliedRecommendationIds || []);
    setSavedRecommendationIds(snapshot.savedRecommendationIds || []);
    setDismissedRecommendationIds(snapshot.dismissedRecommendationIds || []);
    setRecommendationChangeLog(snapshot.recommendationChangeLog || []);
    setRouteWorkspaceOpen(true);
    setLastSavedAt(snapshot.savedAt);
    setLastTrip(snapshot);
    setHasUnsavedChanges(false);
    savePlannerDraft(snapshot);
  }

  function handleRenameTrip(tripId: string, tripName: string) {
    const nextTrips = renamePlannerTrip(tripId, tripName);
    setSavedTrips(nextTrips);
    setLastTrip(loadLastPlannerTrip() || loadPlannerDraft());
  }

  function handleDuplicateTrip(tripId: string) {
    const nextTrips = duplicatePlannerTrip(tripId);
    setSavedTrips(nextTrips);
    setLastTrip(loadLastPlannerTrip() || loadPlannerDraft());
  }

  function handleDeleteTrip(tripId: string) {
    const nextTrips = deletePlannerTrip(tripId);
    setSavedTrips(nextTrips);
    setLastTrip(loadLastPlannerTrip() || loadPlannerDraft());
  }

  function handleApplyRecommendation(recommendation: TiyaAIRecommendation) {
    if (appliedRecommendationIds.includes(recommendation.id)) return;

    if (recommendation.id === "better-route") {
      const scenicRoute = generatedPlan.routeOptions.find((route) => route.id === "scenic");
      if (scenicRoute) {
        setSelectedRouteId(scenicRoute.id);
        setRouteWorkspaceOpen(true);
      }
    }

    if (recommendation.id === "insurance") {
      setSubmittedIntent((current) => ({
        ...current,
        smartPreferences: {
          ...current.smartPreferences,
          includeInsurance: true,
        },
      }));
    }

    if (recommendation.id === "night-travel-risk") {
      setSubmittedIntent((current) => ({
        ...current,
        smartPreferences: {
          ...current.smartPreferences,
          avoidNightTravel: true,
        },
      }));
    }

    const itemType: TiyaTimelineItem["type"] =
      recommendation.category === "Stay"
        ? "stay"
        : recommendation.category === "Transport"
          ? "transport"
          : "activity";

    setEditableDays((currentDays) => {
      if (recommendation.category === "Budget" || recommendation.category === "Risk") {
        return currentDays.map((day, index) =>
          index === 0
            ? {
                ...day,
                notes: `${day.notes || ""} AI applied: ${recommendation.title}. ${recommendation.impactSummary}`.trim(),
              }
            : day
        );
      }

      return updateFirstMatchingDay(currentDays, recommendation, itemType);
    });
    setGeneratedPlan((currentPlan) =>
      updatePlanForRecommendation(currentPlan, recommendation)
    );
    setAppliedRecommendationIds((current) => [...current, recommendation.id]);
    setSavedRecommendationIds((current) =>
      current.filter((id) => id !== recommendation.id)
    );
    setRecommendationChangeLog((current) => [
      buildRecommendationChangeLog(recommendation),
      ...current,
    ]);
    setHasUnsavedChanges(true);
  }

  function handleDismissRecommendation(recommendationId: string) {
    setDismissedRecommendationIds((current) =>
      current.includes(recommendationId) ? current : [...current, recommendationId]
    );
    setSavedRecommendationIds((current) =>
      current.filter((id) => id !== recommendationId)
    );
    setHasUnsavedChanges(true);
  }

  function handleSaveRecommendation(recommendationId: string) {
    setSavedRecommendationIds((current) =>
      current.includes(recommendationId)
        ? current.filter((id) => id !== recommendationId)
        : [...current, recommendationId]
    );
    setHasUnsavedChanges(true);
  }

  function handlePlannerModuleAction(action: PlannerModuleAction) {
    const changeLogEntry = buildModuleChangeLog(action);
    const costImpact = action.costImpact || 0;

    if (costImpact !== 0) {
      setGeneratedPlan((currentPlan) =>
        updateBudgetForRecommendation(currentPlan, {
          id: changeLogEntry.id,
          title: action.title,
          category: action.category || "Budget",
          priority: "Medium",
          confidenceScore: 86,
          detail: action.detail,
          reason: action.detail,
          impact: changeLogEntry.impact,
          impactSummary: changeLogEntry.impact,
          affectedDay: action.affectedDays?.[0] || (action.affectedDay ? `Day ${action.affectedDay}` : "Planner"),
          affectedModule: action.sourceModule,
          costImpact,
          comfortImpact: action.comfortImpact || 0,
          riskImpact: action.riskImpact || 0,
          budgetImpact: -costImpact,
          experienceImpact: 0,
          itineraryImpact: action.detail,
          whyAiSuggestsThis: {
            travellerStyle: submittedIntent.travelStyle,
            itineraryGap: action.previousState || "Current planner state",
            budgetFit: costImpact < 0 ? "Improves budget fit." : "Cost is reflected in the live estimate.",
            routeFit: selectedRoute?.name || "Current route",
          },
          whatWillChange: {
            dayChange: action.affectedDays?.[0] || (action.affectedDay ? `Day ${action.affectedDay}` : "Planner"),
            updated: [action.newState || action.detail],
            costImpact: `${costImpact >= 0 ? "+" : "-"}₹${Math.abs(costImpact).toLocaleString("en-IN")}`,
            fatigueImpact: `${action.fatigueImpact || 0}`,
            bookingBasketImpact: "Review payload and checkout readiness refreshed.",
          },
        })
      );
    }

    setEditableDays((currentDays) =>
      currentDays.map((day, index) => {
        const matchesDay =
          action.affectedDay === day.day ||
          (!action.affectedDay && index === 0);

        if (!matchesDay) return day;

        return {
          ...day,
          notes: `${day.notes || ""} ${action.sourceModule}: ${action.title}. ${action.detail}`.trim(),
        };
      })
    );

    setGeneratedPlan((currentPlan) => ({
      ...currentPlan,
      bookingModules: (currentPlan.bookingModules || []).map((module) => {
        const shouldHighlight =
          (action.category === "Transport" && ["flights", "cabs"].includes(module.id)) ||
          (action.category === "Stay" && ["hotels", "homestays"].includes(module.id)) ||
          (action.category === "Activities" && module.id === "experiences") ||
          (action.category === "Risk" && module.id === "insurance") ||
          (action.category === "Local Market" && module.id === "local-market") ||
          action.sourceModule.toLowerCase().includes(module.id);

        return shouldHighlight
          ? { ...module, readiness: "Ready" as const, isHighlighted: true }
          : module;
      }),
    }));
    setRecommendationChangeLog((current) => [changeLogEntry, ...current]);
    setHasUnsavedChanges(true);
  }

  function handleLocalLifeAction(action: string, product: TiyaLocalMarketPick) {
    const isSave = action.toLowerCase().includes("save");
    const targetDay = Math.min(2, Math.max(1, editableDays[1]?.day || editableDays[0]?.day || 1));
    const priceEstimate = localLifePriceEstimate(product);

    setGeneratedPlan((currentPlan) => ({
      ...currentPlan,
      localMarketPicks: (currentPlan.localMarketPicks || []).map((pick) =>
        pick.id === product.id ? { ...pick, isHighlighted: true } : pick
      ),
    }));

    if (!isSave) {
      setEditableDays((currentDays) =>
        currentDays.map((day, index) => {
          const matchesTarget = day.day === targetDay || (!currentDays.some((item) => item.day === targetDay) && index === 0);
          if (!matchesTarget) return day;
          if ((day.items || []).some((item) => item.id.includes(`local-life-${product.id}`))) return day;

          return {
            ...day,
            notes: `${day.notes || ""} Local Life Added: ${product.productName}. Route fit ${product.routeRelevance}%.`.trim(),
            items: [...(day.items || []), buildLocalLifeTimelineItem(product, day)],
          };
        })
      );
    }

    handlePlannerModuleAction({
      actionType: isSave ? "save_local_life" : "add_local_life",
      affectedDay: targetDay,
      category: "Local Market",
      comfortImpact: isSave ? 0 : 6,
      costImpact: isSave ? 0 : priceEstimate,
      detail: isSave
        ? `${product.productName} saved for Local Life review.`
        : `${product.productName} added to Day ${targetDay} evening. Route and traveller interest matched.`,
      fatigueImpact: isSave ? 0 : 2,
      newState: isSave
        ? `Saved Local Life item: ${product.productName}`
        : `Day ${targetDay} evening Local Life stop: ${product.productName}`,
      previousState: "No Local Life stop selected for this slot",
      riskImpact: 0,
      sourceModule: "Local Life",
      title: isSave ? "Local Life Saved" : "Local Life Added",
    });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_8%_10%,rgba(14,165,233,0.13),transparent_28%),radial-gradient(circle_at_92%_8%,rgba(249,115,22,0.13),transparent_30%),linear-gradient(180deg,#f7fbff_0%,#eef6ff_48%,#fff7ed_100%)] text-slate-950">
      <TiyaDesktopEntryHero
        initialIntent={defaultIntent}
        onSubmit={handleGenerate}
        isGenerating={isGenerating}
      />

      {isGenerating ? <TiyaRouteThinking /> : null}

      <section className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <TiyaRouteIntelligence
          key={generatedPlan.subtitle}
          routeOptions={generatedPlan.routeOptions}
          isGenerating={isGenerating}
          selectedRouteId={routeWorkspaceOpen ? selectedRouteId : undefined}
          selectionConfirmed={routeWorkspaceOpen}
          onSelectedRouteChange={handleRouteChange}
        />

        {!routeWorkspaceOpen ? (
          <div className="mt-4 rounded-[1.75rem] border border-blue-100 bg-white/78 p-5 text-center shadow-[0_18px_60px_rgba(15,23,42,0.07)] backdrop-blur-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
              Next action
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Select a route to open the Tiya planning studio
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
              The itinerary, weather, creator, Local Life, quote and booking
              systems stay hidden until the journey path is chosen.
            </p>
          </div>
        ) : null}
      </section>

      {routeWorkspaceOpen ? (
      <section
        className={`mx-auto grid max-w-7xl gap-4 px-4 py-5 transition-opacity duration-300 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-7 ${
          isGenerating ? "opacity-80" : "opacity-100"
        }`}
      >
        <div className="grid min-w-0 gap-4">
          <nav className="sticky top-0 z-20 -mx-1 overflow-x-auto rounded-3xl border border-white/85 bg-white/86 px-2 py-2 shadow-[0_18px_50px_rgba(15,23,42,0.09)] backdrop-blur-2xl lg:top-3">
            <div className="flex min-w-max gap-2">
              {plannerModuleNav.map(([href, label]) => (
                <a
                  key={href}
                  href={`#${href}`}
                  className="rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-blue-800 transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                >
                  {label}
                </a>
              ))}
            </div>
          </nav>

          <PlannerModule
            id="workspace"
            eyebrow="Selected route workspace"
            title="Tiya planning studio"
            defaultOpen
          >
            <div className="rounded-3xl border border-white/85 bg-white/78 p-3 shadow-[0_24px_84px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
                  <Bot size={15} className={isGenerating ? "animate-pulse" : undefined} />
                  Editable itinerary
                </div>
                <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
                  Day-wise trip canvas
                </h2>
              </div>
              <div className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-800">
                {isGenerating ? "Tiya updating route" : `${submittedIntent.pace} route`}
              </div>
            </div>
            <TiyaDynamicItinerary
              days={editableDays}
              onDaysChange={handleDaysChange}
            />
            </div>
          </PlannerModule>

          <PlannerModule id="intelligence" eyebrow="Travel intelligence" title="Operating dashboard and alerts" defaultOpen>
            <TiyaOperatingDashboard
              health={tripHealth}
              budget={budgetIntelligence}
              alerts={smartAlerts}
              recommendations={recommendations}
              stats={travelStats}
              recommendationChangeLog={recommendationChangeLog}
              appliedRecommendationIds={appliedRecommendationIds}
              dismissedRecommendationIds={dismissedRecommendationIds}
              savedRecommendationIds={savedRecommendationIds}
              isGenerating={isGenerating}
              onApplyRecommendation={handleApplyRecommendation}
              onDismissRecommendation={handleDismissRecommendation}
              onSaveRecommendation={handleSaveRecommendation}
            />
          </PlannerModule>

          <PlannerModule id="timeline" eyebrow="Timeline and journey map" title="Visual journey flow" defaultOpen>
            <TiyaJourneyTimeline
              days={journeyTimeline}
              map={journeyMap}
              status={journeyStatus}
              changeHistory={recommendationChangeLog}
              isGenerating={isGenerating}
            />
          </PlannerModule>

          <PlannerModule id="trip-brief" eyebrow="Advanced trip brief" title="Full intent controls">
            <TiyaTripIntentForm
              key={`${submittedIntent.fromCity}-${submittedIntent.toCity}-${submittedIntent.startDate}`}
              initialIntent={submittedIntent}
              onSubmit={handleGenerate}
              isGenerating={isGenerating}
            />
          </PlannerModule>

          <PlannerModule id="scenarios" eyebrow="Scenario engine" title="Multi-route scenarios">
            <TiyaScenarioEngine
              intent={submittedIntent}
              plan={generatedPlan}
              selectedScenarioId={selectedScenarioId}
              isGenerating={isGenerating}
              onScenarioSelect={handleScenarioSelect}
            />
          </PlannerModule>

          <PlannerModule id="variants" eyebrow="Variant builder" title="Trip variants">
            <TiyaTripVariantBuilder
              intent={submittedIntent}
              plan={generatedPlan}
              selectedVariantId={selectedVariantId}
              isGenerating={isGenerating}
              onVariantSelect={handleVariantSelect}
              onVariantApply={handleVariantApply}
            />
          </PlannerModule>

          <PlannerModule id="itinerary" eyebrow="Dynamic itinerary" title="Adaptive itinerary engine" defaultOpen>
            <TiyaDynamicItineraryEngine
              days={editableDays}
              intent={submittedIntent}
              plan={generatedPlan}
              selectedRoute={selectedRoute}
              selectedScenarioId={selectedScenarioId}
              selectedVariantId={selectedVariantId}
              isGenerating={isGenerating}
            />
          </PlannerModule>

          <PlannerModule id="rules" eyebrow="Rules engine" title="Constraints and safety checks" defaultOpen>
            <TiyaRulesEnginePanel
              days={editableDays}
              intent={submittedIntent}
              plan={generatedPlan}
              selectedRoute={selectedRoute}
              isGenerating={isGenerating}
              onRuleAction={(rule) =>
                handlePlannerModuleAction({
                  actionType: "apply_risk_fix",
                  affectedDays: [rule.affectedArea],
                  category: "Risk",
                  comfortImpact: rule.status === "critical" ? 18 : 10,
                  costImpact: rule.status === "critical" ? 2000 : 800,
                  detail: `${rule.suggestedFix}. Previous risk: ${rule.reason}`,
                  newState: rule.suggestedFix,
                  previousState: rule.reason,
                  riskImpact: rule.status === "critical" ? -24 : -12,
                  sourceModule: "Route Risk Analysis",
                  title: `Risk Fix Applied: ${rule.title}`,
                })
              }
            />
          </PlannerModule>

          <PlannerModule id="optimization" eyebrow="Cost optimization" title="Savings and comfort balancing">
            <TiyaCostOptimization
              days={editableDays}
              intent={submittedIntent}
              plan={generatedPlan}
              selectedRoute={selectedRoute}
              isGenerating={isGenerating}
              onSuggestionAction={(suggestion) =>
                handlePlannerModuleAction({
                  actionType: "apply_cost_optimization",
                  affectedDays: ["Budget overview"],
                  category: "Budget",
                  comfortImpact: suggestion.estimatedSavings > 0 ? -2 : 4,
                  costImpact: -Math.abs(suggestion.estimatedSavings),
                  detail: suggestion.detail,
                  newState: suggestion.title,
                  previousState: "Current cost plan",
                  riskImpact: 0,
                  sourceModule: "Cost Optimization",
                  title: suggestion.actionLabel,
                })
              }
            />
          </PlannerModule>

          <PlannerModule id="experiences" eyebrow="Experience planner" title="Activities and ecosystem suggestions">
            <TiyaExperiencePlanner
              days={editableDays}
              intent={submittedIntent}
              plan={generatedPlan}
              selectedRoute={selectedRoute}
              selectedScenarioId={selectedScenarioId}
              selectedVariantId={selectedVariantId}
              isGenerating={isGenerating}
              onExperienceAction={(action) =>
                handlePlannerModuleAction({
                  actionType: "apply_activity",
                  affectedDay: action.day,
                  category: "Activities",
                  comfortImpact: -Math.max(0, Math.round(action.fatigueImpact / 2)),
                  costImpact: action.costImpact,
                  detail: action.detail,
                  fatigueImpact: action.fatigueImpact,
                  newState: action.title,
                  previousState: `Day ${action.day} activity set`,
                  riskImpact: 0,
                  sourceModule: "Experiences & Activities",
                  title: action.title,
                })
              }
            />
            <TiyaSuggestionCards
              suggestions={generatedPlan.suggestions}
              onSuggestionAction={(suggestion) =>
                handlePlannerModuleAction({
                  actionType: "apply_suggestion",
                  affectedDays: ["Suggested module"],
                  category:
                    suggestion.category === "Stay"
                      ? "Stay"
                      : suggestion.category === "Transport"
                        ? "Transport"
                        : "Activities",
                  comfortImpact: suggestion.category === "Stay" ? 8 : 3,
                  costImpact: Number(suggestion.price.replace(/[^0-9-]/g, "")) || 0,
                  detail: suggestion.detail,
                  newState: suggestion.title,
                  previousState: "Suggestion not selected",
                  riskImpact: 0,
                  sourceModule: "Smart Suggestions",
                  title: `Suggestion Applied: ${suggestion.title}`,
                })
              }
            />
          </PlannerModule>

          <PlannerModule id="ecosystem" eyebrow="Creator and Local Life" title="Creator picks and Local Life" defaultOpen>
            <TiyaCreatorPicks
              creators={
                Array.isArray(generatedPlan.creatorPicks)
                  ? generatedPlan.creatorPicks
                  : []
              }
              isGenerating={isGenerating}
            />
            <TiyaLocalMarketPicks
              products={
                Array.isArray(generatedPlan.localMarketPicks)
                  ? generatedPlan.localMarketPicks
                  : []
              }
              isGenerating={isGenerating}
              onProductAction={handleLocalLifeAction}
            />
          </PlannerModule>

          <PlannerModule id="seasonal" eyebrow="Seasonal weather" title="Season, weather and route timing">
            <TiyaSeasonalWeather
              intent={submittedIntent}
              days={editableDays}
              selectedRoute={selectedRoute}
              selectedScenarioId={selectedScenarioId}
              selectedVariantId={selectedVariantId}
              isGenerating={isGenerating}
              onAdviceAction={(advice) =>
                handlePlannerModuleAction({
                  actionType: "apply_weather_action",
                  affectedDays: ["Weather-sensitive days"],
                  category: "Weather",
                  comfortImpact: 6,
                  costImpact: 0,
                  detail: advice.detail,
                  newState: advice.action,
                  previousState: "Current weather timing",
                  riskImpact: advice.severity === "High" ? -16 : -8,
                  sourceModule: "Weather Intelligence",
                  title: `Weather Action Applied: ${advice.title}`,
                })
              }
            />
          </PlannerModule>

          <PlannerModule id="expedition" eyebrow="Expedition engine" title="Multi-destination route builder">
            <TiyaExpeditionBuilder
              intent={submittedIntent}
              selectedScenarioId={selectedScenarioId}
              selectedVariantId={selectedVariantId}
              isGenerating={isGenerating}
            />
          </PlannerModule>

          <PlannerModule id="packing" eyebrow="Packing engine" title="Preparation and readiness">
            <TiyaPackingEngine
              intent={submittedIntent}
              selectedRoute={selectedRoute}
              isGenerating={isGenerating}
            />
          </PlannerModule>

          <PlannerModule id="companion" eyebrow="AI companion" title="Travel companion and group planning">
            <TiyaTravelCompanion
              intent={submittedIntent}
              plan={generatedPlan}
              selectedRoute={selectedRoute}
              isGenerating={isGenerating}
            />
            <TiyaGroupPlanner
              intent={submittedIntent}
              plan={generatedPlan}
              isGenerating={isGenerating}
            />
          </PlannerModule>

          <PlannerModule id="memory" eyebrow="Memory and recommendations" title="Traveller habits and smart recommendations">
            <TiyaMemoryDashboard
              intent={submittedIntent}
              isGenerating={isGenerating}
            />
          </PlannerModule>

          <PlannerModule id="booking" eyebrow="Booking integration" title="TPL booking and ecosystem bridge" defaultOpen>
            <TiyaBookingIntegration
              intent={submittedIntent}
              plan={generatedPlan}
              days={editableDays}
              selectedRoute={selectedRoute}
              isGenerating={isGenerating}
            />
            <TiyaBookingReadyLayer
              modules={
                Array.isArray(generatedPlan.bookingModules)
                  ? generatedPlan.bookingModules
                  : []
              }
              intent={submittedIntent}
              plan={generatedPlan}
              days={editableDays}
              selectedRoute={selectedRoute}
              changeHistory={recommendationChangeLog}
              isGenerating={isGenerating}
            />
          </PlannerModule>

          <PlannerModule id="package" eyebrow="Package builder" title="Package, quote and bundle controls" defaultOpen>
            <TiyaPackageBuilder
              intent={submittedIntent}
              plan={generatedPlan}
              isGenerating={isGenerating}
            />
            <TiyaQuoteGenerator
              intent={submittedIntent}
              plan={generatedPlan}
              isGenerating={isGenerating}
            />
            <TiyaSmartBundleEngine
              intent={submittedIntent}
              plan={generatedPlan}
              isGenerating={isGenerating}
            />
          </PlannerModule>

          <PlannerModule id="checkout" eyebrow="Checkout bridge" title="Checkout draft and expert escalation" defaultOpen>
            <TiyaCheckoutBridge
              intent={submittedIntent}
              plan={generatedPlan}
              days={editableDays}
              selectedRoute={selectedRoute}
              changeHistory={recommendationChangeLog}
              isGenerating={isGenerating}
            />
            <TiyaExpertReview
              intent={submittedIntent}
              plan={generatedPlan}
              selectedRoute={selectedRoute}
              isGenerating={isGenerating}
            />
          </PlannerModule>

          <PlannerModule id="review" eyebrow="Final review" title="Trip review and confirmation" defaultOpen>
            <TiyaTripReview
              intent={submittedIntent}
              plan={generatedPlan}
              days={editableDays}
              selectedRoute={selectedRoute}
              selectedScenarioId={selectedScenarioId}
              selectedVariantId={selectedVariantId}
              smartAlerts={smartAlerts}
              recommendationChangeLog={recommendationChangeLog}
              isGenerating={isGenerating}
              onAction={() => {
                window.location.href = "/smart-planner/review";
              }}
            />
          </PlannerModule>

          <PlannerModule id="post-trip" eyebrow="Post-trip ecosystem" title="Memory, creator and market loop">
            <TiyaPostTripEcosystem
              intent={submittedIntent}
              plan={generatedPlan}
              days={editableDays}
              selectedRoute={selectedRoute}
              isGenerating={isGenerating}
            />
          </PlannerModule>

          <PlannerModule id="library" eyebrow="Draft library and notes" title="Saved trips, notes and export actions" defaultOpen>
            <TiyaSavedTripLibrary
              savedTrips={savedTrips}
              lastTrip={lastTrip}
              currentSnapshot={plannerSnapshot}
              onSaveCurrent={() => {
                const savedSnapshot = savePlannerTrip(plannerSnapshot);
                setLastSavedAt(savedSnapshot.savedAt);
                setSavedTrips(loadSavedPlannerTrips());
                setLastTrip(loadLastPlannerTrip() || savedSnapshot);
                setHasUnsavedChanges(false);
              }}
              onRestore={restorePlannerSnapshot}
              onRename={handleRenameTrip}
              onDuplicate={handleDuplicateTrip}
              onDelete={handleDeleteTrip}
            />
            <TiyaTripNotes notes={tripNotes} onChange={handleNotesChange} />
          </PlannerModule>
        </div>

        <aside className="grid h-fit gap-4 lg:sticky lg:top-4">
          <TiyaRouteSummary
            routeStops={generatedPlan.routeStops}
            title={generatedPlan.routeTitle}
            pace={submittedIntent.pace}
            transportMode={`${submittedIntent.transportMode} · ${submittedIntent.stayPreference}`}
          />
          <TiyaBudgetPreview
            lines={generatedPlan.budgetLines}
            total={generatedPlan.totalBudget}
            budgetRange={
              submittedIntent.customBudgetAmount || submittedIntent.budgetTier
            }
            onBudgetAction={(action) =>
              handlePlannerModuleAction({
                actionType: "apply_budget_scenario",
                affectedDays: ["Budget overview"],
                category: "Budget",
                comfortImpact: action.type === "luxury-route" ? 12 : action.type === "budget-route" ? -4 : 2,
                costImpact: action.costImpact,
                detail: action.detail,
                newState: action.title,
                previousState: "Current budget scenario",
                riskImpact: action.type === "budget-route" ? 2 : -2,
                sourceModule: "Budget Overview",
                title: action.title,
              })
            }
          />
          <TiyaAIInsights
            insights={generatedPlan.insights}
            isGenerating={isGenerating}
          />

          <TiyaPlannerActions
            snapshot={plannerSnapshot}
            hasUnsavedChanges={hasUnsavedChanges}
            lastSavedAt={lastSavedAt}
            onSaved={(savedSnapshot) => {
              setLastSavedAt(savedSnapshot.savedAt);
              setSavedTrips(loadSavedPlannerTrips());
              setLastTrip(loadLastPlannerTrip() || savedSnapshot);
              setHasUnsavedChanges(false);
            }}
          />
          <TiyaExportItinerary
            snapshot={plannerSnapshot}
            selectedRoute={selectedRoute}
            smartAlerts={smartAlerts}
          />
        </aside>
      </section>
      ) : null}
    </main>
  );
}
