"use client";

import { useMemo } from "react";
import { CalendarRange, Luggage, UsersRound } from "lucide-react";
import {
  generatePlannerBestMonthIntelligence,
  generatePlannerSeasonReadiness,
  generatePlannerSeasonalRouteAdvice,
} from "@/app/lib/ecosystem/planner/plannerSeasonEngine";
import { generatePlannerSeasonalPackingHints } from "@/app/lib/ecosystem/planner/plannerSeasonalPackingEngine";
import { generatePlannerWeatherSimulation } from "@/app/lib/ecosystem/planner/plannerWeatherSimulationEngine";
import type {
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaSeasonalRouteAdvice from "./TiyaSeasonalRouteAdvice";
import TiyaSeasonScoreCard from "./TiyaSeasonScoreCard";
import TiyaWeatherSimulationCards from "./TiyaWeatherSimulationCards";

type TiyaSeasonalWeatherProps = {
  intent: TiyaTripIntent;
  selectedRoute?: TiyaRouteOption;
  selectedScenarioId?: string;
  selectedVariantId?: string;
  isGenerating?: boolean;
};

export default function TiyaSeasonalWeather({
  intent,
  selectedRoute,
  selectedScenarioId,
  selectedVariantId,
  isGenerating = false,
}: TiyaSeasonalWeatherProps) {
  const readiness = useMemo(
    () => generatePlannerSeasonReadiness({ intent, selectedRoute }),
    [intent, selectedRoute]
  );
  const monthIntelligence = useMemo(
    () => generatePlannerBestMonthIntelligence(readiness),
    [readiness]
  );
  const weatherCards = useMemo(
    () => generatePlannerWeatherSimulation({ intent, readiness, selectedRoute }),
    [intent, readiness, selectedRoute]
  );
  const routeAdvice = useMemo(
    () => generatePlannerSeasonalRouteAdvice({ intent, readiness, selectedRoute }),
    [intent, readiness, selectedRoute]
  );
  const packingHints = useMemo(
    () => generatePlannerSeasonalPackingHints({ intent, readiness }),
    [intent, readiness]
  );
  const familySafeMonths = Array.isArray(monthIntelligence.familySafeMonths)
    ? monthIntelligence.familySafeMonths
    : [];
  const adventureSafeMonths = Array.isArray(monthIntelligence.adventureSafeMonths)
    ? monthIntelligence.adventureSafeMonths
    : [];
  const safePackingHints = Array.isArray(packingHints) ? packingHints : [];

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.2),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(249,115,22,0.18),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <CalendarRange
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Seasonal and weather simulation
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Season-aware trip intelligence
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Simulates season, weather, best months, route risk and compact
              packing hints without live weather APIs.
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
      </div>

      <div className="grid gap-3 p-3 sm:p-5">
        <TiyaSeasonScoreCard
          readiness={readiness}
          monthIntelligence={monthIntelligence}
        />
        <TiyaWeatherSimulationCards cards={weatherCards} />
        <TiyaSeasonalRouteAdvice advice={routeAdvice} />

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <UsersRound size={15} />
              Family and adventure months
            </div>
            <div className="mt-3 grid gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                  Family-safe months
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {familySafeMonths.map((month) => (
                    <span
                      key={`family-${month}`}
                      className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-black text-emerald-100"
                    >
                      {month}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                  Adventure-safe months
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {adventureSafeMonths.map((month) => (
                    <span
                      key={`adventure-${month}`}
                      className="rounded-full bg-orange-400/15 px-2.5 py-1 text-[11px] font-black text-orange-100"
                    >
                      {month}
                    </span>
                  ))}
                </div>
              </div>
              <p className="rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-semibold leading-5 text-white/70">
                {monthIntelligence.festivalCrowdImpact}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Luggage size={15} />
              Seasonal packing hints
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {safePackingHints.map((hint) => (
                <span
                  key={hint}
                  className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white"
                >
                  {hint}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
