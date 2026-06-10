"use client";

import { useMemo } from "react";
import { Brain, CloudSun, Layers3 } from "lucide-react";
import { generatePlannerDynamicItinerary } from "@/app/lib/ecosystem/planner/plannerDynamicItineraryEngine";
import { generatePlannerGroupMembers } from "@/app/lib/ecosystem/planner/plannerGroupEngine";
import { generatePlannerRecoverySuggestions } from "@/app/lib/ecosystem/planner/plannerRecoveryEngine";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaAdaptiveDayCard from "./TiyaAdaptiveDayCard";
import TiyaFatigueInsights from "./TiyaFatigueInsights";
import TiyaRecoverySuggestions from "./TiyaRecoverySuggestions";

type TiyaDynamicItineraryEngineProps = {
  days: TiyaDayPlan[];
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  selectedRoute?: TiyaRouteOption;
  selectedScenarioId?: string;
  selectedVariantId?: string;
  isGenerating?: boolean;
};

function WeatherMeter({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
          {label}
        </p>
        <span className="text-sm font-black text-white">{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-orange-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function TiyaDynamicItineraryEngine({
  days,
  intent,
  plan,
  selectedRoute,
  selectedScenarioId,
  selectedVariantId,
  isGenerating = false,
}: TiyaDynamicItineraryEngineProps) {
  const groupMembers = useMemo(
    () => generatePlannerGroupMembers(intent, plan),
    [intent, plan]
  );
  const dynamicPlan = useMemo(
    () =>
      generatePlannerDynamicItinerary({
        days,
        intent,
        selectedRoute,
        groupMembers,
      }),
    [days, groupMembers, intent, selectedRoute]
  );
  const recoverySuggestions = useMemo(
    () =>
      generatePlannerRecoverySuggestions({
        intent,
        adaptiveDays: dynamicPlan.adaptiveDays,
        plan: dynamicPlan,
      }),
    [dynamicPlan, intent]
  );

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(249,115,22,0.18),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <Brain
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Dynamic itinerary engine
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Adaptive day distribution
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Simulates travel days, stay days, activity density, fatigue,
              weather flow and recovery logic from the live planner state.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedScenarioId ? (
              <span className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100">
                Scenario: {selectedScenarioId}
              </span>
            ) : null}
            {selectedVariantId ? (
              <span className="rounded-2xl border border-orange-300/20 bg-orange-500/10 px-3 py-2 text-xs font-black text-orange-100">
                Variant: {selectedVariantId}
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
              Travel days
            </p>
            <p className="mt-1 text-lg font-black text-white">
              {dynamicPlan.travelDays}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
              Stay days
            </p>
            <p className="mt-1 text-lg font-black text-white">
              {dynamicPlan.stayDays}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
              Activity days
            </p>
            <p className="mt-1 text-lg font-black text-white">
              {dynamicPlan.activityDays}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
              Recovery days
            </p>
            <p className="mt-1 text-lg font-black text-white">
              {dynamicPlan.recoveryDays}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5">
        <TiyaFatigueInsights summary={dynamicPlan.fatigueSummary} />

        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <CloudSun size={15} />
            Weather-aware flow simulation
          </div>
          <p className="mt-2 text-xs font-semibold leading-5 text-white/70">
            {dynamicPlan.weather.note}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <WeatherMeter label="Rain" value={dynamicPlan.weather.rainyRisk} />
            <WeatherMeter label="Snow" value={dynamicPlan.weather.snowRisk} />
            <WeatherMeter
              label="Crowd"
              value={dynamicPlan.weather.crowdedPeriod}
            />
            <WeatherMeter
              label="Daylight"
              value={dynamicPlan.weather.daylightOptimization}
            />
            <WeatherMeter
              label="Scenic"
              value={dynamicPlan.weather.scenicWindow}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <Layers3 size={15} />
            Adaptive day cards
          </div>
          <div className="mt-3 grid gap-3">
            {dynamicPlan.adaptiveDays.map((adaptiveDay) => (
              <TiyaAdaptiveDayCard
                key={adaptiveDay.day.id}
                adaptiveDay={adaptiveDay}
              />
            ))}
          </div>
        </div>

        <TiyaRecoverySuggestions suggestions={recoverySuggestions} />
      </div>
    </section>
  );
}
