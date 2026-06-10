"use client";

import { useMemo } from "react";
import { BadgeIndianRupee, Sparkles, WalletCards } from "lucide-react";
import { generatePlannerOptimizationPlan } from "@/app/lib/ecosystem/planner/plannerOptimizationEngine";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaOptimizationCompare from "./TiyaOptimizationCompare";
import TiyaSavingsMeter from "./TiyaSavingsMeter";

type TiyaCostOptimizationProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  days: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
  isGenerating?: boolean;
};

const zoneStyles = {
  Overspend: "border-rose-300/20 bg-rose-400/10 text-rose-100",
  Flexible: "border-orange-300/20 bg-orange-400/10 text-orange-100",
  Efficient: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
} as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(value);
}

export default function TiyaCostOptimization({
  intent,
  plan,
  days,
  selectedRoute,
  isGenerating = false,
}: TiyaCostOptimizationProps) {
  const optimization = useMemo(
    () =>
      generatePlannerOptimizationPlan({
        intent,
        days,
        budgetLines: plan.budgetLines,
        totalBudget: plan.totalBudget,
        selectedRoute,
      }),
    [days, intent, plan.budgetLines, plan.totalBudget, selectedRoute]
  );
  const safeSuggestions = Array.isArray(optimization.suggestions)
    ? optimization.suggestions
    : [];
  const safeBudgetZones = Array.isArray(optimization.budgetZones)
    ? optimization.budgetZones
    : [];
  const safeRecommendations = Array.isArray(optimization.recommendations)
    ? optimization.recommendations
    : [];

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(34,197,94,0.18),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(249,115,22,0.18),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-100">
              <BadgeIndianRupee
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Smart cost optimization
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Optimize savings without flattening the trip
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Simulates transport, stay, route and activity savings while
              tracking comfort, scenic and intensity trade-offs.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-100">
            Comfort {optimization.comfort.comfortScore}% · Route{" "}
            {optimization.comfort.routeEfficiencyScore}%
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5">
        <TiyaSavingsMeter savings={optimization.savings} />
        <TiyaOptimizationCompare options={optimization.compareOptions} />

        <div className="grid gap-3 lg:grid-cols-2">
          {safeSuggestions.map((suggestion) => (
            <article
              key={suggestion.id}
              className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 transition hover:bg-white/10 sm:p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-base font-black text-white">
                    {suggestion.title}
                  </h3>
                  <p className="mt-2 text-xs font-semibold leading-5 text-white/70">
                    {suggestion.detail}
                  </p>
                </div>
                <span className="w-fit rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-black text-emerald-100">
                  {suggestion.category}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    Savings
                  </p>
                  <p
                    className={`mt-1 text-sm font-black ${
                      suggestion.estimatedSavings >= 0
                        ? "text-emerald-100"
                        : "text-orange-100"
                    }`}
                  >
                    {formatCurrency(suggestion.estimatedSavings)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    Comfort
                  </p>
                  <p className="mt-1 text-sm font-black text-white">
                    {suggestion.comfortDelta > 0 ? "+" : ""}
                    {suggestion.comfortDelta}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-white/15"
              >
                {suggestion.actionLabel}
              </button>
            </article>
          ))}
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <WalletCards size={15} />
              Budget balancing
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {safeBudgetZones.map((zone) => (
                <div
                  key={zone.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-black text-white">
                      {zone.label}
                    </h4>
                    <span
                      className={`rounded-full border px-2 py-1 text-[10px] font-black ${zoneStyles[zone.status]}`}
                    >
                      {zone.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-black text-white">
                    {formatCurrency(zone.amount)}
                  </p>
                  <p className="mt-2 text-xs font-semibold leading-5 text-white/70">
                    {zone.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Sparkles size={15} />
              AI recommendations
            </div>
            <div className="mt-3 grid gap-2">
              {safeRecommendations.map((recommendation) => (
                <div
                  key={recommendation}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-xs font-semibold leading-5 text-white/70"
                >
                  {recommendation}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
