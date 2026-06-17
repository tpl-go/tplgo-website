"use client";

import { useMemo } from "react";
import { AlertTriangle, CalendarRange, Clock3, Luggage, MapPinned, UsersRound } from "lucide-react";
import {
  generatePlannerBestMonthIntelligence,
  generatePlannerSeasonReadiness,
  generatePlannerSeasonalRouteAdvice,
} from "@/app/lib/ecosystem/planner/plannerSeasonEngine";
import { generatePlannerSeasonalPackingHints } from "@/app/lib/ecosystem/planner/plannerSeasonalPackingEngine";
import { generatePlannerWeatherSimulation } from "@/app/lib/ecosystem/planner/plannerWeatherSimulationEngine";
import type {
  TiyaDayPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaSeasonalRouteAdvice from "./TiyaSeasonalRouteAdvice";
import TiyaSeasonScoreCard from "./TiyaSeasonScoreCard";
import TiyaWeatherSimulationCards from "./TiyaWeatherSimulationCards";

type TiyaSeasonalWeatherProps = {
  intent: TiyaTripIntent;
  days?: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
  selectedScenarioId?: string;
  selectedVariantId?: string;
  isGenerating?: boolean;
  onAdviceAction?: (advice: {
    action: string;
    detail: string;
    severity: string;
    title: string;
  }) => void;
};

export default function TiyaSeasonalWeather({
  intent,
  days = [],
  selectedRoute,
  selectedScenarioId,
  selectedVariantId,
  isGenerating = false,
  onAdviceAction,
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
  const weatherConfidence =
    readiness.riskLabel === "Low"
      ? Math.min(92, readiness.seasonScore + 8)
      : readiness.riskLabel === "Medium"
        ? Math.max(62, readiness.seasonScore + 4)
        : Math.max(42, readiness.seasonScore);
  const bestDailyTravelWindow =
    readiness.riskLabel === "High"
      ? "06:00 AM - 10:30 AM"
      : readiness.riskLabel === "Medium"
        ? "06:00 AM - 11:00 AM"
        : "07:00 AM - 12:30 PM";
  const itineraryImpacts = (Array.isArray(days) && days.length ? days : []).slice(0, 3).map((day, index) => ({
    day: `Day ${day.day}`,
    reason:
      index === 0
        ? "Start transfers before peak weather disruption"
        : index === 1
          ? "Protect outdoor or sunrise activity timing"
          : "Keep checkout and road movement flexible",
    impact:
      index === 0
        ? "Add 1 hour road buffer"
        : index === 1
          ? "Shift weather-sensitive activity"
          : "Early departure recommended",
    level:
      readiness.riskLabel === "High" || index === 0
        ? "High"
        : readiness.riskLabel === "Medium"
          ? "Medium"
          : "Low",
  }));
  const watchlist = [
    readiness.seasonType === "Monsoon" ? "Heavy rain possibility" : "",
    readiness.destinationType === "Mountain" ? "Route visibility reduction" : "",
    monthIntelligence.festivalCrowdImpact ? "Festival crowd pressure" : "",
    selectedRoute?.riskLevel === "High" || readiness.riskLabel !== "Low"
      ? "Longer transfer duration"
      : "",
    "Backup activity recommended",
  ].filter(Boolean);
  const mandatoryPacking = Array.from(
    new Set([
      readiness.seasonType === "Monsoon" ? "Rain Jacket" : "Weather Layer",
      readiness.destinationType === "Mountain" ? "Warm Layer" : "Comfortable Shoes",
      "Waterproof Bag",
      ...safePackingHints.slice(0, 2),
    ])
  );
  const recommendedPacking = Array.from(
    new Set(["Power Bank", "Quick Dry Clothing", "Sunglasses", ...safePackingHints.slice(2, 4)])
  );
  const optionalPacking = Array.from(
    new Set([
      readiness.destinationType === "Mountain" ? "Trekking Poles" : "Light Day Pack",
      "Portable Medical Kit",
      ...safePackingHints.slice(4, 5),
    ])
  );

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
        <TiyaSeasonalRouteAdvice advice={routeAdvice} onAdviceAction={onAdviceAction} />

        <div className="grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <MapPinned size={15} />
              Itinerary impact
            </div>
            <div className="mt-3 grid gap-2">
              {(itineraryImpacts.length
                ? itineraryImpacts
                : [
                    {
                      day: "Trip days",
                      reason: "Weather-sensitive route planning",
                      impact: "Keep timing flexible",
                      level: readiness.riskLabel,
                    },
                  ]
              ).map((impact) => (
                <div
                  key={`${impact.day}-${impact.impact}`}
                  className="grid gap-2 rounded-2xl border border-white/10 bg-white/10 p-3 sm:grid-cols-[90px_minmax(0,1fr)_auto] sm:items-center"
                >
                  <p className="text-sm font-black text-white">{impact.day}</p>
                  <div>
                    <p className="text-xs font-black text-white">{impact.impact}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-white/60">
                      {impact.reason}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-black ${
                      impact.level === "High"
                        ? "border-rose-300/20 bg-rose-400/10 text-rose-100"
                        : impact.level === "Medium"
                          ? "border-orange-300/20 bg-orange-400/10 text-orange-100"
                          : "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                    }`}
                  >
                    {impact.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
              <Clock3 size={15} />
              Best daily travel window
            </div>
            <p className="mt-3 text-2xl font-black text-white">
              {bestDailyTravelWindow}
            </p>
            <div className="mt-3 grid gap-2 text-xs font-semibold leading-5 text-orange-50/85">
              {[
                "Best visibility",
                "Lowest weather disruption",
                "Better route safety",
              ].map((reason) => (
                <div key={reason} className="flex gap-2 rounded-2xl border border-orange-300/15 bg-white/10 px-3 py-2">
                  <span className="text-emerald-100">✓</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white">
              Confidence {weatherConfidence}%
            </p>
          </div>
        </div>

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
              Smart packing checklist
            </div>
            <div className="mt-3 grid gap-3">
              {[
                ["Mandatory", mandatoryPacking, "text-rose-100"],
                ["Recommended", recommendedPacking, "text-cyan-100"],
                ["Optional", optionalPacking, "text-emerald-100"],
              ].map(([label, items, tone]) => (
                <div key={label as string} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <p className={`text-[10px] font-black uppercase tracking-[0.14em] ${tone as string}`}>
                    {label as string}
                  </p>
                  <div className="mt-2 grid gap-1.5">
                    {(items as string[]).map((item) => (
                      <div key={`${label}-${item}`} className="flex gap-2 text-xs font-black text-white/78">
                        <span className="text-emerald-100">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-300/20 bg-amber-400/10 p-3 sm:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-amber-100">
            <AlertTriangle size={15} />
            Seasonal watchlist
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {watchlist.map((item, index) => {
              const severity = index === 0 && readiness.riskLabel === "High" ? "High" : index < 3 ? "Medium" : "Low";

              return (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-black text-white">{item}</p>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-black ${
                        severity === "High"
                          ? "border-rose-300/20 bg-rose-400/10 text-rose-100"
                          : severity === "Medium"
                            ? "border-orange-300/20 bg-orange-400/10 text-orange-100"
                            : "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                      }`}
                    >
                      {severity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-semibold leading-5 text-amber-50/80">
            Weather Action Applied entries are recorded in Transparent Itinerary Updates when a recommendation is confirmed.
          </p>
        </div>
      </div>
    </section>
  );
}
