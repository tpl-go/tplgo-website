"use client";

import { useState } from "react";
import { generateSmartPlannerMock } from "@/app/lib/ecosystem/planner/plannerMockGenerator";
import {
  SMART_PLANNER_RETURN_SEARCH_KEY,
} from "@/app/lib/ecosystem/planner/plannerRouteWorkspaceHandoff";
import { resetSmartPlannerWorkingSession } from "@/app/lib/ecosystem/planner/plannerPayloadStorage";
import type {
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaDesktopEntryHero from "./sections/TiyaDesktopEntryHero";
import TiyaRouteIntelligence from "./tabs/TiyaRouteIntelligence";
import TiyaRouteThinking from "./sections/TiyaRouteThinking";

const defaultIntent: TiyaTripIntent = {
  fromCity: "Delhi",
  toCity: "Jaipur",
  startDate: "2026-08-12",
  endDate: "2026-08-17",
  tripType: "Round Trip",
  transportMode: "Flight",
  transportPreference: "Flight",
  stayPreference: "Hotel",
  cabRequirement: "Airport / Station Transfer Only",
  returnToOrigin: true,
  stops: [],
  multiCityStops: [],
  budgetTier: "Premium",
  customBudgetAmount: "₹85,000",
  adults: 2,
  children: 0,
  seniors: 0,
  pets: false,
  travelStyle: "Couple",
  pace: "Balanced",
  interests: ["Food", "Culture", "Local Life"],
  smartPreferences: {
    includeStays: true,
    includeLocalMarket: true,
    includeCreatorSpots: false,
    includeInsurance: true,
    avoidNightTravel: true,
    preferScenicRoute: true,
  },
};

const emptyHeroIntent: TiyaTripIntent = {
  ...defaultIntent,
  fromCity: "",
  toCity: "",
  startDate: "",
  endDate: "",
  tripType: "One Way / Destination Trip",
  transportMode: "",
  transportPreference: "",
  stayPreference: "",
  cabRequirement: "",
  returnToOrigin: false,
  stops: [],
  multiCityStops: [],
  budgetTier: "",
  customBudgetAmount: "",
  adults: 0,
  children: 0,
  seniors: 0,
  travelStyle: "",
};

const defaultPlan = generateSmartPlannerMock(defaultIntent);
const SMART_PLANNER_GENERATED_ROUTES_KEY =
  "tpl_smart_planner_generated_routes_v1";

type SmartPlannerGeneratedRouteDraft = {
  generatedAt: string;
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  selectedRouteId?: TiyaRouteOption["id"];
};

function getRecommendedRouteId(plan: TiyaGeneratedPlan) {
  return (
    plan.routeOptions.find((route) => route.isRecommended)?.id ??
    plan.routeOptions[0]?.id
  );
}

function readReturnSearchIntent() {
  if (typeof window === "undefined") return null;

  try {
    const rawPayload = window.sessionStorage.getItem(
      SMART_PLANNER_RETURN_SEARCH_KEY
    );
    if (!rawPayload) return null;

    const parsedPayload = JSON.parse(rawPayload) as Partial<TiyaTripIntent>;
    window.sessionStorage.removeItem(SMART_PLANNER_RETURN_SEARCH_KEY);

    return {
      ...emptyHeroIntent,
      ...parsedPayload,
      fromCity: parsedPayload.fromCity ?? emptyHeroIntent.fromCity,
      toCity: parsedPayload.toCity ?? emptyHeroIntent.toCity,
      startDate: parsedPayload.startDate ?? emptyHeroIntent.startDate,
      endDate: parsedPayload.endDate ?? emptyHeroIntent.endDate,
      tripType: parsedPayload.tripType ?? emptyHeroIntent.tripType,
      adults: parsedPayload.adults ?? emptyHeroIntent.adults,
      children: parsedPayload.children ?? emptyHeroIntent.children,
      seniors: parsedPayload.seniors ?? emptyHeroIntent.seniors,
      transportMode: parsedPayload.transportMode ?? emptyHeroIntent.transportMode,
      transportPreference:
        parsedPayload.transportPreference ??
        parsedPayload.transportMode ??
        emptyHeroIntent.transportPreference,
    };
  } catch {
    window.sessionStorage.removeItem(SMART_PLANNER_RETURN_SEARCH_KEY);
    return null;
  }
}

function readGeneratedRouteDraft(): SmartPlannerGeneratedRouteDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(SMART_PLANNER_GENERATED_ROUTES_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<SmartPlannerGeneratedRouteDraft>) : null;

    if (
      !parsed?.intent?.fromCity ||
      !parsed.intent.toCity ||
      !parsed.plan?.routeOptions?.length
    ) {
      return null;
    }

    return {
      generatedAt: parsed.generatedAt || new Date().toISOString(),
      intent: parsed.intent as TiyaTripIntent,
      plan: parsed.plan as TiyaGeneratedPlan,
      selectedRouteId: parsed.selectedRouteId,
    };
  } catch {
    window.sessionStorage.removeItem(SMART_PLANNER_GENERATED_ROUTES_KEY);
    return null;
  }
}

function saveGeneratedRouteDraft(draft: SmartPlannerGeneratedRouteDraft) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      SMART_PLANNER_GENERATED_ROUTES_KEY,
      JSON.stringify(draft)
    );
    window.dispatchEvent(new Event("tpl_tiya_workspace_payload_updated"));
  } catch {
    // Route generation still works even if session persistence is unavailable.
  }
}

export default function SmartPlannerEntry() {
  const [initialState] = useState(() => {
    const returnIntent = readReturnSearchIntent();
    if (!returnIntent) {
      resetSmartPlannerWorkingSession();
    }
    const generatedDraft = returnIntent ? null : readGeneratedRouteDraft();
    const initialIntent = returnIntent ?? generatedDraft?.intent ?? emptyHeroIntent;
    const initialPlan = generatedDraft?.plan ?? defaultPlan;
    const initialRouteId =
      generatedDraft?.selectedRouteId ?? getRecommendedRouteId(initialPlan);

    return {
      generatedDraft,
      initialIntent,
      initialPlan,
      initialRouteId,
      restoredGeneratedRoutes: Boolean(generatedDraft && !returnIntent),
    };
  });
  const [heroInitialIntent] = useState<TiyaTripIntent>(
    () => initialState.initialIntent
  );
  const [submittedIntent, setSubmittedIntent] =
    useState<TiyaTripIntent>(heroInitialIntent);
  const [generatedPlan, setGeneratedPlan] =
    useState<TiyaGeneratedPlan>(initialState.initialPlan);
  const [selectedRouteId, setSelectedRouteId] = useState<
    TiyaRouteOption["id"] | undefined
  >(initialState.initialRouteId);
  const [selectionConfirmed, setSelectionConfirmed] = useState(
    initialState.restoredGeneratedRoutes
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedRoutes, setHasGeneratedRoutes] = useState(
    initialState.restoredGeneratedRoutes
  );

  function handleGenerate(intent: TiyaTripIntent) {
    resetSmartPlannerWorkingSession();
    setIsGenerating(true);

    window.setTimeout(() => {
      const nextPlan = generateSmartPlannerMock(intent);
      const nextSelectedRouteId = getRecommendedRouteId(nextPlan);

      setSubmittedIntent(intent);
      setGeneratedPlan(nextPlan);
      setSelectedRouteId(nextSelectedRouteId);
      setSelectionConfirmed(false);
      setIsGenerating(false);
      setHasGeneratedRoutes(true);
      saveGeneratedRouteDraft({
        generatedAt: new Date().toISOString(),
        intent,
        plan: nextPlan,
        selectedRouteId: nextSelectedRouteId,
      });
    }, 650);
  }

  function handleHeroIntentChange() {
    setHasGeneratedRoutes(false);
    setSelectionConfirmed(false);
  }

  function handleRouteChange(routeId: TiyaRouteOption["id"]) {
    setSelectedRouteId(routeId);
    setSelectionConfirmed(true);
    saveGeneratedRouteDraft({
      generatedAt: new Date().toISOString(),
      intent: submittedIntent,
      plan: generatedPlan,
      selectedRouteId: routeId,
    });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_8%_10%,rgba(14,165,233,0.13),transparent_28%),radial-gradient(circle_at_92%_8%,rgba(249,115,22,0.13),transparent_30%),linear-gradient(180deg,#f7fbff_0%,#eef6ff_48%,#fff7ed_100%)] text-slate-950">
      <TiyaDesktopEntryHero
        initialIntent={heroInitialIntent}
        onSubmit={handleGenerate}
        onIntentChange={handleHeroIntentChange}
        isGenerating={isGenerating}
      />

      {isGenerating ? <TiyaRouteThinking /> : null}

      {hasGeneratedRoutes ? (
        <section
          id="route-intelligence"
          className="mx-auto max-w-7xl scroll-mt-4 px-3 py-4 sm:px-4 sm:py-5 lg:scroll-mt-6 lg:px-8 lg:py-6"
        >
          <TiyaRouteIntelligence
            key={generatedPlan.subtitle}
            routeOptions={generatedPlan.routeOptions}
            isGenerating={isGenerating}
            selectedRouteId={selectionConfirmed ? selectedRouteId : undefined}
            selectionConfirmed={selectionConfirmed}
            tripIntent={submittedIntent}
            generatedPlan={generatedPlan}
            onSelectedRouteChange={handleRouteChange}
          />

        </section>
      ) : null}
    </main>
  );
}
