/**
 * plannerAIService.ts
 *
 * Path: src/app/lib/ecosystem/planner/plannerAIService.ts
 *
 * Real AI itinerary generation using Claude API (via Next.js route handler).
 * Drop this file in your lib folder and update BuildItineraryWorkspace.tsx
 * to call generateItineraryWithAI() instead of generateSmartPlannerMock().
 */

import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "./plannerTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AIGenerationResult =
  | { success: true; plan: TiyaGeneratedPlan }
  | { success: false; error: string };

// ─── Main function ─────────────────────────────────────────────────────────────

/**
 * Calls /api/planner/generate (your Next.js route handler) which in turn
 * calls the Anthropic Claude API server-side (so your API key stays safe).
 *
 * Usage in BuildItineraryWorkspace.tsx:
 *
 *   import { generateItineraryWithAI } from "@/app/lib/ecosystem/planner/plannerAIService";
 *
 *   const result = await generateItineraryWithAI({ intent, selectedRoute });
 *   if (result.success) {
 *     setGeneratedPlan(result.plan);
 *     setEditableDays(result.plan.days);
 *   } else {
 *     // fallback to mock or show error
 *   }
 */
export async function generateItineraryWithAI({
  intent,
  selectedRoute,
}: {
  intent: TiyaTripIntent;
  selectedRoute: TiyaRouteOption;
}): Promise<AIGenerationResult> {
  try {
    const response = await fetch("/api/planner/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent, selectedRoute }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `API error ${response.status}: ${errorText}` };
    }

    const data = (await response.json()) as { plan?: TiyaGeneratedPlan; error?: string };

    if (!data.plan) {
      return { success: false, error: data.error ?? "No plan returned from AI" };
    }

    return { success: true, plan: data.plan };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}