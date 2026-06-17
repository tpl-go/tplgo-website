"use client";

/**
 * BuildItineraryWorkspace.tsx  (UPDATED — Real AI version)
 *
 * Path: src/app/components/ecosystem/planner/workspace/build/BuildItineraryWorkspace.tsx
 *
 * Changes from original:
 * 1. generateSmartPlannerMock() → generateItineraryWithAI() (real Claude API)
 * 2. Async generateSmartItinerary() with proper error state
 * 3. Fallback to mock on API failure (so app never breaks)
 * 4. totalBudget passed from real plan (not hardcoded 42000)
 */

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { generateSmartPlannerMock } from "@/app/lib/ecosystem/planner/plannerMockGenerator";
import { generateItineraryWithAI } from "@/app/lib/ecosystem/planner/plannerAIService";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";

import {
  defaultSmartBuildPreferences,
  type BuildFlowState,
  type SmartBuildPreferences,
  type WorkspacePreferences,
} from "../utils/workspaceTypes";
import type { WorkspaceBookingBasketItem } from "../utils/bookingBasket";
import { buildWorkspaceTripIntent } from "../utils/workspaceIntentAdapter";

import BuildGeneratedSection from "./BuildGeneratedSection";
import BuildGeneratingSection from "./BuildGeneratingSection";
import BuildInputsSection from "./BuildInputsSection";
import BuildIntroSection from "./BuildIntroSection";

export default function BuildItineraryWorkspace({
  selectedRoute,
  preferences,
  fromCity,
  toCity,
  sourceIntent,
  sourcePlan,
  updatePreference,
  toggleInterest,
  bookingBasket,
  setBookingBasket,
  onGenerated,
  onGeneratedPlanChange,
}: {
  selectedRoute: TiyaRouteOption;
  preferences: WorkspacePreferences;
  fromCity: string;
  toCity: string;
  sourceIntent?: TiyaTripIntent;
  sourcePlan?: TiyaGeneratedPlan;
  updatePreference: <K extends keyof WorkspacePreferences>(
    key: K,
    value: WorkspacePreferences[K]
  ) => void;
  toggleInterest: (interest: string) => void;
  bookingBasket: WorkspaceBookingBasketItem[];
  setBookingBasket: Dispatch<SetStateAction<WorkspaceBookingBasketItem[]>>;
  onGenerated: (plan: TiyaGeneratedPlan, days: TiyaDayPlan[]) => void;
  onGeneratedPlanChange?: (plan: TiyaGeneratedPlan, days: TiyaDayPlan[]) => void;
}) {
  const [flowState, setFlowState] = useState<BuildFlowState>(
    sourcePlan ? "generated" : "intro"
  );
  const [smartBuildPreferences, setSmartBuildPreferences] =
    useState<SmartBuildPreferences>(defaultSmartBuildPreferences);
  const [generatedPlan, setGeneratedPlan] = useState<TiyaGeneratedPlan | null>(
    sourcePlan ?? null
  );
  const [editableDays, setEditableDays] = useState<TiyaDayPlan[]>(
    sourcePlan?.days ?? []
  );
  const [aiError, setAiError] = useState<string | null>(null);
  const onGeneratedRef = useRef(onGenerated);
  const sourcePlanSignatureRef = useRef("");

  useEffect(() => {
    onGeneratedRef.current = onGenerated;
  });

  useEffect(() => {
    if (!sourcePlan) return;
    const sourcePlanSignature = [
      sourcePlan.title,
      sourcePlan.routeTitle,
      sourcePlan.days?.length || 0,
      sourcePlan.days?.map((day) => `${day.id}:${day.items?.length || 0}`).join("|"),
    ].join("::");

    if (sourcePlanSignatureRef.current === sourcePlanSignature) return;
    sourcePlanSignatureRef.current = sourcePlanSignature;
    onGeneratedRef.current(sourcePlan, sourcePlan.days);
  }, [sourcePlan]);

  const activeGeneratedPlan = sourcePlan ?? generatedPlan;
  const activeEditableDays = sourcePlan?.days ?? editableDays;

  const generationSteps = [
    "Tiya route analyze kar rahi hai...",
    "Trip details prepare ho rahi hain...",
    "Din-wise itinerary ban rahi hai...",
    "Stay aur transport match ho raha hai...",
    "Budget calculate ho raha hai...",
    "Local market aur creator spots add ho rahe hain...",
    "Booking readiness check ho raha hai...",
    "Aapka editable journey plan ready ho raha hai...",
  ];

  function updateSmartBuild<K extends keyof SmartBuildPreferences>(
    key: K,
    value: SmartBuildPreferences[K]
  ) {
    setSmartBuildPreferences((current) => ({ ...current, [key]: value }));
  }

  // ─── MAIN CHANGE: async AI call instead of mock ─────────────────────────────
  async function generateSmartItinerary() {
    setFlowState("generating");
    setAiError(null);

    const nextIntent = buildWorkspaceTripIntent({
      fromCity,
      toCity,
      selectedRoute,
      preferences,
      smartBuildPreferences,
      sourceIntent,
    });

    try {
      // 1. Try real AI generation
      const result = await generateItineraryWithAI({
        intent: nextIntent,
        selectedRoute,
      });

      if (result.success) {
        // ✅ AI succeeded — use real plan
        const nextPlan = result.plan;
        setGeneratedPlan(nextPlan);
        setEditableDays(nextPlan.days);
        setBookingBasket([]);
        setFlowState("generated");
        onGenerated(nextPlan, nextPlan.days);
      } else {
        // ⚠️ AI failed — fallback to mock so app doesn't break
        console.warn("[BuildItineraryWorkspace] AI generation failed, using mock fallback:", result.error);
        setAiError(result.error);

        const fallbackPlan = generateSmartPlannerMock(nextIntent);
        setGeneratedPlan(fallbackPlan);
        setEditableDays(fallbackPlan.days);
        setBookingBasket([]);
        setFlowState("generated");
        onGenerated(fallbackPlan, fallbackPlan.days);
      }
    } catch (err) {
      // ⚠️ Network error or unexpected — fallback to mock
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("[BuildItineraryWorkspace] Unexpected error:", errorMessage);
      setAiError(errorMessage);

      const fallbackPlan = generateSmartPlannerMock(nextIntent);
      setGeneratedPlan(fallbackPlan);
      setEditableDays(fallbackPlan.days);
      setBookingBasket([]);
      setFlowState("generated");
      onGenerated(fallbackPlan, fallbackPlan.days);
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

  function handleDaysChange(days: TiyaDayPlan[]) {
    setEditableDays(days);
    if (activeGeneratedPlan) {
      const nextPlan = { ...activeGeneratedPlan, days };
      setGeneratedPlan(nextPlan);
      onGeneratedPlanChange?.(nextPlan, days);
    }
  }

  return (
    <section className="w-full max-w-full min-w-0 overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_28px_85px_rgba(15,23,42,0.09)]">
      {flowState === "intro" ? (
        <BuildIntroSection onStart={generateSmartItinerary} />
      ) : (
        <div className="relative min-w-0 bg-[#061839] p-4 text-center text-white sm:p-5 lg:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(249,115,22,0.18),transparent_26%)]" />
          <div className="relative mx-auto max-w-[900px] min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              BUILD YOUR SMART JOURNEY
            </p>
            <h2 className="mt-2 break-words text-2xl font-black tracking-tight sm:text-3xl">
              Turn this route into a complete AI-powered travel plan
            </h2>
            <p className="mx-auto mt-2 max-w-3xl text-sm font-semibold leading-6 text-white/72">
              Tiya converts your selected route, dates, travel style and
              preferences into a day-wise itinerary, budget plan and
              booking-ready journey.
            </p>
          </div>
        </div>
      )}

      {/* Show AI error banner if fallback was used */}
      {aiError && flowState === "generated" ? (
        <div className="mx-4 mt-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          <span className="font-black">Note:</span> AI temporarily unavailable — mock itinerary shown.
          <span className="ml-2 text-xs text-orange-600">({aiError})</span>
        </div>
      ) : null}

      {flowState === "inputs" ? (
        <BuildInputsSection
          preferences={preferences}
          smartBuildPreferences={smartBuildPreferences}
          updatePreference={updatePreference}
          updateSmartBuild={updateSmartBuild}
          toggleInterest={toggleInterest}
          generateSmartItinerary={generateSmartItinerary}
        />
      ) : null}

      {flowState === "generating" ? (
        <BuildGeneratingSection generationSteps={generationSteps} />
      ) : null}

      {flowState === "generated" && activeGeneratedPlan ? (
        <BuildGeneratedSection
          selectedRoute={selectedRoute}
          preferences={preferences}
          generatedPlan={activeGeneratedPlan}
          editableDays={activeEditableDays}
          sourceIntent={sourceIntent}
          onDaysChange={handleDaysChange}
          bookingBasket={bookingBasket}
          setBookingBasket={setBookingBasket}
        />
      ) : null}
    </section>
  );
}
