"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeIndianRupee,
  GitCompareArrows,
  ListChecks,
  PiggyBank,
  Route,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import {
  generatePlannerOptimizationPlan,
  type TiyaOptimizationSuggestion,
} from "@/app/lib/ecosystem/planner/plannerOptimizationEngine";
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
  onSuggestionAction?: (suggestion: {
    actionLabel: string;
    category: string;
    detail: string;
    estimatedSavings: number;
    title: string;
  }) => void;
};

type OptimizationUi = {
  affectedDays: string;
  bookingImpact: string;
  category: string;
  currentSetup: string;
  optimizedSetup: string;
  scenicImpact: string;
  timeImpact: string;
  whatChanges: string[];
  why: string[];
};

type CostLogEntry = {
  affectedDays: string;
  appliedAt: string;
  comfortImpact: number;
  newSetup: string;
  previousSetup: string;
  saving: number;
  title: string;
};

const zoneStyles = {
  Overspend: "border-rose-300/20 bg-rose-400/10 text-rose-100",
  Flexible: "border-orange-300/20 bg-orange-400/10 text-orange-100",
  Efficient: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
} as const;

const actionLabels: Record<TiyaOptimizationSuggestion["actionLabel"], string> = {
  Compare: "Preview Saving",
  Optimize: "Apply Optimization",
  Upgrade: "Apply Stay Upgrade",
  Cluster: "Apply Route Cluster",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(value);
}

function formatSignedCurrency(value: number) {
  if (value === 0) return formatCurrency(0);
  return `${value > 0 ? "+" : "-"}${formatCurrency(Math.abs(value))}`;
}

function buildAffectedDays(days: TiyaDayPlan[], count = 2) {
  const safeDays = Array.isArray(days) ? days : [];
  return safeDays
    .slice(0, Math.max(1, Math.min(count, safeDays.length || 1)))
    .map((day) => `Day ${day.day}`)
    .join(", ");
}

function buildOptimizationUi(
  suggestion: TiyaOptimizationSuggestion,
  intent: TiyaTripIntent,
  days: TiyaDayPlan[],
  selectedRoute?: TiyaRouteOption
): OptimizationUi {
  const routeName = selectedRoute?.name || selectedRoute?.routeStyle || "Current route";

  if (suggestion.id === "transport-combo") {
    return {
      affectedDays: buildAffectedDays(days, 2),
      bookingImpact: "Transport selection may change; booking basket review required.",
      category: "Transport Savings",
      currentSetup: intent.transportMode || "Current transport mix",
      optimizedSetup:
        intent.transportMode === "Flight" ? "Rail + local cab combination" : "Primary mode + cab only for last mile",
      scenicImpact: "No scenic route loss",
      timeImpact: intent.transportMode === "Flight" ? "+2h travel time" : "-45m local transfer friction",
      whatChanges: [
        "Transport changed on high-cost segment",
        "Local cab retained for comfort-critical transfers",
        "Route intent preserved",
      ],
      why: [
        "Lower transfer repetition",
        "Same arrival coverage",
        "Comfort impact under threshold",
        "Booking basket can be reviewed before checkout",
      ],
    };
  }

  if (suggestion.id === "buffer-stay") {
    return {
      affectedDays: buildAffectedDays(days, 3),
      bookingImpact: "Stay selection may be added or upgraded.",
      category: "Comfort-Friendly Savings",
      currentSetup: "Same-day transfer and activity pressure",
      optimizedSetup: "Recovery stay with lighter next-day movement",
      scenicImpact: "Scenic impact unchanged",
      timeImpact: "+1 recovery block",
      whatChanges: [
        "Extra buffer added",
        "Stay changed for recovery comfort",
        "Activity pressure reduced",
      ],
      why: [
        "Protects trip health",
        "Improves comfort score",
        "Avoids unsafe overpacking",
        "Does not remove mandatory attractions",
      ],
    };
  }

  if (suggestion.id === "market-cluster") {
    return {
      affectedDays: buildAffectedDays(days, 2),
      bookingImpact: "Activity timing may change; selected activities remain reviewable.",
      category: "Activity Savings",
      currentSetup: "Separate food, market and local shopping movements",
      optimizedSetup: "Clustered market and food window",
      scenicImpact: "Scenic impact neutral",
      timeImpact: "-1h local movement",
      whatChanges: [
        "Activity moved into same route cluster",
        "Local travel loop reduced",
        "Extra buffer preserved",
      ],
      why: [
        "Same route cluster",
        "Lower transfer repetition",
        "Better evening flow",
        "Comfort impact under threshold",
      ],
    };
  }

  if (suggestion.id === "transfer-reduction") {
    return {
      affectedDays: buildAffectedDays(days, 3),
      bookingImpact: "Local travel selection may reduce; checkout readiness stays protected.",
      category: "Local Travel Savings",
      currentSetup: `${routeName} with extra local transfer loops`,
      optimizedSetup: "Route-clustered stays and closer activity cores",
      scenicImpact: "Scenic route intent preserved",
      timeImpact: "-60m to -90m transfer time",
      whatChanges: [
        "Route clustered",
        "Unnecessary local transfer reduced",
        "Stay/activity proximity improved",
      ],
      why: [
        "Lower backtracking",
        "Improves route efficiency",
        "Does not reduce safety score",
        "Booking selections remain auditable",
      ],
    };
  }

  return {
    affectedDays: buildAffectedDays(days, 2),
    bookingImpact: "Stay selection may change; price summary review required.",
    category: "Stay Savings",
    currentSetup: intent.stayPreference || "Current stay mix",
    optimizedSetup:
      intent.budgetTier === "Luxury" ? "Premium stay for one night, destination-core stay retained" : "Homestay mix with one recovery hotel night",
    scenicImpact: "No route scenic impact",
    timeImpact: "No trip duration change",
    whatChanges: [
      "Stay changed on one night",
      "Comfort-critical stay retained",
      "Price summary updated after confirmation",
    ],
    why: [
      "Stay cost pattern has optimization room",
      "Core comfort is preserved",
      "Selected route intent remains unchanged",
      "Trip health stays acceptable",
    ],
  };
}

export default function TiyaCostOptimization({
  intent,
  plan,
  days,
  selectedRoute,
  isGenerating = false,
  onSuggestionAction,
}: TiyaCostOptimizationProps) {
  const [localChangeLog, setLocalChangeLog] = useState<CostLogEntry[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
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
  const totalPositiveSavings = safeSuggestions
    .filter((suggestion) => suggestion.estimatedSavings > 0)
    .reduce((sum, suggestion) => sum + suggestion.estimatedSavings, 0);
  const bestPlanSavings = Math.round(totalPositiveSavings * 0.58);
  const categoryTotals = [
    {
      label: "Transport Savings",
      value: safeSuggestions
        .filter((suggestion) => suggestion.category === "Transport")
        .reduce((sum, suggestion) => sum + Math.max(0, suggestion.estimatedSavings), 0),
    },
    {
      label: "Stay Savings",
      value: safeSuggestions
        .filter((suggestion) => suggestion.category === "Stay")
        .reduce((sum, suggestion) => sum + Math.max(0, suggestion.estimatedSavings), 0),
    },
    {
      label: "Activity Savings",
      value: safeSuggestions
        .filter((suggestion) => suggestion.category === "Activity")
        .reduce((sum, suggestion) => sum + Math.max(0, suggestion.estimatedSavings), 0),
    },
    {
      label: "Local Travel Savings",
      value: safeSuggestions
        .filter((suggestion) => suggestion.category === "Route")
        .reduce((sum, suggestion) => sum + Math.max(0, suggestion.estimatedSavings), 0),
    },
    {
      label: "Comfort-Friendly Savings",
      value: safeSuggestions
        .filter((suggestion) => suggestion.comfortDelta >= 0)
        .reduce((sum, suggestion) => sum + Math.max(0, suggestion.estimatedSavings), 0),
    },
  ];

  function runSuggestionAction(suggestion: TiyaOptimizationSuggestion) {
    const ui = buildOptimizationUi(suggestion, intent, days, selectedRoute);
    const displayAction = actionLabels[suggestion.actionLabel];

    setStatusMessage(
      `${displayAction} preview opened. Confirm in Itinerary Impact Preview before any itinerary or booking selection changes.`
    );
    setLocalChangeLog((current) =>
      [
        {
          affectedDays: ui.affectedDays,
          appliedAt: new Date().toISOString(),
          comfortImpact: suggestion.comfortDelta,
          newSetup: ui.optimizedSetup,
          previousSetup: ui.currentSetup,
          saving: suggestion.estimatedSavings,
          title: displayAction,
        },
        ...current,
      ].slice(0, 4)
    );
    onSuggestionAction?.({
      actionLabel: displayAction,
      category: suggestion.category,
      detail: `IF APPLIED: Before: ${ui.currentSetup}. After: ${ui.optimizedSetup}. Saving: ${formatSignedCurrency(suggestion.estimatedSavings)}. Comfort impact: ${suggestion.comfortDelta > 0 ? "+" : ""}${suggestion.comfortDelta}. Affected days: ${ui.affectedDays}. Booking basket impact: ${ui.bookingImpact}`,
      estimatedSavings: suggestion.estimatedSavings,
      title: suggestion.title,
    });
  }

  function runBestPlan() {
    const syntheticSuggestion: TiyaOptimizationSuggestion = {
      actionLabel: "Optimize",
      category: "Budget",
      comfortDelta: Math.max(0, Math.round(optimization.comfort.comfortScore / 20) - 2),
      detail: "Use one homestay mix, cluster market visit and reduce one transfer while protecting route intent.",
      estimatedSavings: bestPlanSavings,
      id: "best-saving-plan",
      title: `Apply best saving plan and save ${formatCurrency(bestPlanSavings)}.`,
    };

    runSuggestionAction(syntheticSuggestion);
  }

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
              Savings Decision Engine
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Compare exact savings, comfort trade-offs, itinerary impact and
              booking-basket consequences before applying any optimization.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-100">
            Comfort {optimization.comfort.comfortScore}% · Route{" "}
            {optimization.comfort.routeEfficiencyScore}%
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5">
        {statusMessage ? (
          <div className="rounded-3xl border border-orange-300/25 bg-orange-400/10 p-3 text-sm font-bold leading-6 text-orange-50 shadow-[0_14px_34px_rgba(249,115,22,0.12)]">
            {statusMessage}
          </div>
        ) : null}

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-100">
              <Sparkles size={15} />
              Best Optimization Path
            </div>
            <h3 className="mt-3 text-lg font-black text-white">Recommended saving plan</h3>
            <div className="mt-3 grid gap-2 text-xs font-black text-emerald-50/86">
              <span>Use one homestay mix</span>
              <span>Cluster market visit</span>
              <span>Reduce one transfer</span>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                  Total saving
                </p>
                <p className="mt-1 text-lg font-black text-emerald-100">
                  {formatCurrency(bestPlanSavings)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                  Comfort impact
                </p>
                <p className="mt-1 text-sm font-black text-white">Small</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                  Guardrail
                </p>
                <p className="mt-1 text-sm font-black text-white">Safe</p>
              </div>
            </div>
            <button
              type="button"
              onClick={runBestPlan}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 py-2 text-sm font-black text-white shadow-[0_12px_28px_rgba(255,123,0,0.28)] transition hover:-translate-y-0.5"
            >
              Apply Best Saving Plan
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/10 p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <ShieldCheck size={15} />
              Optimization guardrails
            </div>
            <div className="mt-3 grid gap-2">
              {[
                "Do not reduce safety score",
                "Do not reduce trip health below acceptable level",
                "Do not remove mandatory attractions",
                "Do not break selected route intent",
              ].map((guardrail) => (
                <div key={guardrail} className="flex gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-cyan-50/88">
                  <span className="text-emerald-100">✓</span>
                  <span>{guardrail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <TiyaSavingsMeter savings={optimization.savings} />

        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <PiggyBank size={15} />
            Savings categories
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            {categoryTotals.map((category) => (
              <div key={category.label} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                  {category.label}
                </p>
                <p className="mt-2 text-sm font-black text-white">
                  {formatCurrency(category.value)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <TiyaOptimizationCompare options={optimization.compareOptions} />

        <div className="grid gap-3 lg:grid-cols-2">
          {safeSuggestions.map((suggestion) => {
            const ui = buildOptimizationUi(suggestion, intent, days, selectedRoute);
            const actionLabel = actionLabels[suggestion.actionLabel];

            return (
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
                    {ui.category}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                      Current setup
                    </p>
                    <p className="mt-1 text-xs font-black leading-5 text-white">
                      {ui.currentSetup}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-100/70">
                      Optimized setup
                    </p>
                    <p className="mt-1 text-xs font-black leading-5 text-emerald-100">
                      {ui.optimizedSetup}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                      Savings
                    </p>
                    <p className={`mt-1 text-sm font-black ${suggestion.estimatedSavings >= 0 ? "text-emerald-100" : "text-orange-100"}`}>
                      {formatSignedCurrency(suggestion.estimatedSavings)}
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
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                      Time impact
                    </p>
                    <p className="mt-1 text-xs font-black leading-5 text-white">
                      {ui.timeImpact}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                      Scenic
                    </p>
                    <p className="mt-1 text-xs font-black leading-5 text-white">
                      {ui.scenicImpact}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-cyan-300/14 bg-cyan-300/10 p-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
                    <ListChecks size={14} />
                    What will change
                  </div>
                  <div className="mt-2 grid gap-1.5">
                    {ui.whatChanges.map((change) => (
                      <p key={change} className="text-xs font-bold leading-5 text-cyan-50/78">
                        ✓ {change}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-orange-100">
                    <GitCompareArrows size={14} />
                    If applied
                  </div>
                  <div className="mt-2 grid gap-1.5 text-xs font-bold leading-5 text-white/72">
                    <p>Before: {ui.currentSetup}</p>
                    <p>After: {ui.optimizedSetup}</p>
                    <p>Saving: {formatSignedCurrency(suggestion.estimatedSavings)}</p>
                    <p>Affected: {ui.affectedDays}</p>
                    <p>Booking basket: {ui.bookingImpact}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-emerald-300/14 bg-emerald-400/10 p-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100">
                    <Sparkles size={14} />
                    Why AI recommends this
                  </div>
                  <div className="mt-2 grid gap-1.5">
                    {ui.why.map((reason) => (
                      <p key={reason} className="text-xs font-bold leading-5 text-emerald-50/76">
                        • {reason}
                      </p>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => runSuggestionAction(suggestion)}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-white/15"
                >
                  {actionLabel}
                  <ArrowRight size={14} />
                </button>
              </article>
            );
          })}
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
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-black ${zoneStyles[zone.status]}`}>
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

        <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
                <Route size={15} />
                Transparent Cost Optimization Change Log
              </div>
              <p className="mt-1 text-xs font-semibold leading-5 text-white/58">
                Confirmed optimizations are also recorded in Recent Trip Changes after applying the impact preview.
              </p>
            </div>
            <span className="w-fit rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-300">
              {localChangeLog.length} previewed
            </span>
          </div>
          {localChangeLog.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm font-semibold leading-6 text-white/58">
              No cost optimization applied yet. Preview or apply a saving plan to review before/after impact.
            </div>
          ) : (
            <div className="mt-3 grid gap-2">
              {localChangeLog.map((entry) => (
                <div key={`${entry.title}-${entry.appliedAt}`} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-white">
                        Optimization previewed: {entry.title}
                      </p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/40">
                        {new Date(entry.appliedAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="w-fit rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-black text-emerald-100">
                      Saving {formatSignedCurrency(entry.saving)}
                    </span>
                  </div>
                  <div className="mt-2 grid gap-1 text-xs font-semibold leading-5 text-white/68">
                    <p>Previous setup: {entry.previousSetup}</p>
                    <p>New setup: {entry.newSetup}</p>
                    <p>Comfort impact: {entry.comfortImpact > 0 ? "+" : ""}{entry.comfortImpact}</p>
                    <p>Affected days: {entry.affectedDays}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-amber-300/20 bg-amber-400/10 p-3 text-xs font-bold leading-5 text-amber-50">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <p>
              No optimization is applied silently. Every action opens an Itinerary Impact Preview first, then updates the same master itinerary, timeline, map, booking basket, price summary and checkout readiness only after confirmation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
