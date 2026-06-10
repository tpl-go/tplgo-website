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

import { useState, type Dispatch, type SetStateAction } from "react";

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
  const [flowState, setFlowState] = useState<BuildFlowState>("intro");
  const [smartBuildPreferences, setSmartBuildPreferences] =
    useState<SmartBuildPreferences>(defaultSmartBuildPreferences);
  const [generatedPlan, setGeneratedPlan] = useState<TiyaGeneratedPlan | null>(null);
  const [editableDays, setEditableDays] = useState<TiyaDayPlan[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  const generationSteps = [
    "Tiya route analyze kar rahi hai...",
    "Trip details prepare ho rahi hain...",
    "Din-wise itinerary ban rahi hai...",
    "Stay aur transport match ho raha hai...",
    "Budget calculate ho raha hai...",
    "Local market aur creator spots add ho rahe hain...",
    "Booking readiness check ho raha hai...",
    "Aapka journey workspace ready ho raha hai...",
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
    if (generatedPlan) {
      onGeneratedPlanChange?.({ ...generatedPlan, days }, days);
    }
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_28px_85px_rgba(15,23,42,0.09)]">
      {flowState === "intro" ? (
        <BuildIntroSection onStart={() => setFlowState("inputs")} />
      ) : (
        <div className="relative bg-[#061839] p-5 text-center text-white lg:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(249,115,22,0.18),transparent_26%)]" />
          <div className="relative mx-auto max-w-[900px]">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              Itinerary banao
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Is route ko ek poori AI journey mein badlo
            </h2>
            <p className="mx-auto mt-2 max-w-3xl text-sm font-semibold leading-6 text-white/72">
              Tiya ab real AI se aapki trip ka din-wise plan, budget aur booking sab kuch tayaar karti hai.
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

      {flowState === "generated" && generatedPlan ? (
        <BuildGeneratedSection
          selectedRoute={selectedRoute}
          preferences={preferences}
          generatedPlan={generatedPlan}
          editableDays={editableDays}
          sourceIntent={sourceIntent}
          onDaysChange={handleDaysChange}
          bookingBasket={bookingBasket}
          setBookingBasket={setBookingBasket}
        />
      ) : null}
    </section>
  );
}
