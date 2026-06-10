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
} from "@/app/lib/ecosystem/planner/plannerStorage";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaPlannerSnapshot,
  TiyaRouteOption,
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
      }),
    [editableDays, generatedPlan, selectedRouteId, submittedIntent, tripNotes]
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
        selectedRoute,
      }),
    [selectedRoute, submittedIntent]
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
    setSelectedRouteId(routeId);
    setRouteWorkspaceOpen(true);
    setHasUnsavedChanges(true);
  }

  function handleScenarioSelect(scenario: TiyaRouteScenario) {
    setSelectedScenarioId(scenario.id);

    if (scenario.appliesRouteId) {
      setSelectedRouteId(scenario.appliesRouteId);
      setRouteWorkspaceOpen(true);
    }

    setHasUnsavedChanges(true);
  }

  function handleVariantSelect(variant: TiyaTripVariant) {
    setSelectedVariantId(variant.id);
    setHasUnsavedChanges(true);
  }

  function handleVariantApply(variant: TiyaTripVariant) {
    const nextIntent = buildIntentForTripVariant(submittedIntent, variant.id);
    const nextPlan = generateSmartPlannerMock(nextIntent);

    setSelectedVariantId(variant.id);
    setSubmittedIntent(nextIntent);
    setGeneratedPlan(nextPlan);
    setEditableDays(nextPlan.days);
    setSelectedRouteId(getRecommendedRouteId(nextPlan));
    setRouteWorkspaceOpen(true);
    setSelectedScenarioId(undefined);
    setHasUnsavedChanges(true);
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
              The itinerary, weather, creator, local market, quote and booking
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
              isGenerating={isGenerating}
            />
          </PlannerModule>

          <PlannerModule id="timeline" eyebrow="Timeline and journey map" title="Visual journey flow" defaultOpen>
            <TiyaJourneyTimeline
              days={journeyTimeline}
              map={journeyMap}
              status={journeyStatus}
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
            />
          </PlannerModule>

          <PlannerModule id="optimization" eyebrow="Cost optimization" title="Savings and comfort balancing">
            <TiyaCostOptimization
              days={editableDays}
              intent={submittedIntent}
              plan={generatedPlan}
              selectedRoute={selectedRoute}
              isGenerating={isGenerating}
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
            />
            <TiyaSuggestionCards suggestions={generatedPlan.suggestions} />
          </PlannerModule>

          <PlannerModule id="ecosystem" eyebrow="Creator and marketplace" title="Creator picks and local market" defaultOpen>
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
            />
          </PlannerModule>

          <PlannerModule id="seasonal" eyebrow="Seasonal weather" title="Season, weather and route timing">
            <TiyaSeasonalWeather
              intent={submittedIntent}
              selectedRoute={selectedRoute}
              selectedScenarioId={selectedScenarioId}
              selectedVariantId={selectedVariantId}
              isGenerating={isGenerating}
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
              selectedRoute={selectedRoute}
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
              isGenerating={isGenerating}
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
