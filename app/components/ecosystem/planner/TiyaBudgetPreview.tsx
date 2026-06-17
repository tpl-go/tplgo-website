"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  IndianRupee,
  PiggyBank,
  Sparkles,
  WalletCards,
} from "lucide-react";
import type { TiyaBudgetLine } from "@/app/lib/ecosystem/planner/plannerTypes";

type BudgetOptimizationAction = {
  costImpact: number;
  detail: string;
  title: string;
  type: "budget-route" | "balanced-route" | "luxury-route" | "auto-optimize";
};

type TiyaBudgetPreviewProps = {
  lines: TiyaBudgetLine[];
  total: number;
  budgetRange?: string;
  onBudgetAction?: (action: BudgetOptimizationAction) => void;
};

const barStyles: Record<TiyaBudgetLine["tone"], string> = {
  blue: "bg-blue-600",
  orange: "bg-orange-500",
  green: "bg-emerald-500",
  slate: "bg-slate-500",
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return `₹${currencyFormatter.format(value)}`;
}

function amountFor(lines: TiyaBudgetLine[], keyword: string) {
  return (
    lines.find((line) => line.label.toLowerCase().includes(keyword.toLowerCase()))
      ?.amount || 0
  );
}

function budgetHealthScore(lines: TiyaBudgetLine[], total: number) {
  const transport = amountFor(lines, "transport");
  const stays = amountFor(lines, "stay");
  const activities = amountFor(lines, "activit");
  const local = amountFor(lines, "local");
  const transportPressure = transport > total * 0.32 ? 12 : 0;
  const stayPressure = stays > total * 0.45 ? 10 : 0;
  const activityPressure = activities > total * 0.26 ? 8 : 0;
  const localPressure = local > total * 0.18 ? 6 : 0;

  return Math.max(
    42,
    Math.min(94, Math.round(88 - transportPressure - stayPressure - activityPressure - localPressure))
  );
}

function scenarioRows(total: number) {
  return [
    {
      label: "Budget Route",
      total: Math.round((total * 0.78) / 500) * 500,
      detail: "Lean stays, value transfers, essential activities",
      action: "Switch to budget route",
      type: "budget-route" as const,
    },
    {
      label: "Balanced Route",
      total,
      detail: "Current comfort, route and activity balance",
      action: "Keep balanced route",
      type: "balanced-route" as const,
    },
    {
      label: "Luxury Route",
      total: Math.round((total * 1.34) / 500) * 500,
      detail: "Premium stays, private transfers, curated experiences",
      action: "Preview luxury route",
      type: "luxury-route" as const,
    },
  ];
}

export default function TiyaBudgetPreview({
  lines,
  total,
  budgetRange = "Live estimate",
  onBudgetAction,
}: TiyaBudgetPreviewProps) {
  const [localActionMessage, setLocalActionMessage] = useState("");
  const safeLines = Array.isArray(lines) ? lines : [];
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
  const healthScore = budgetHealthScore(safeLines, safeTotal || 1);
  const healthLabel =
    healthScore >= 78 ? "Healthy" : healthScore >= 58 ? "Watch" : "Pressure";
  const topDrivers = [...safeLines]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
  const savings = [
    {
      title: "Shift one premium stay to smart comfort",
      detail: "Keeps location fit while lowering stay pressure.",
      value: Math.round((amountFor(safeLines, "stay") * 0.12) / 100) * 100,
    },
    {
      title: "Use shared/local transfer on low-risk segments",
      detail: "Reduces transport cost without changing core route.",
      value: Math.round((amountFor(safeLines, "transport") * 0.1) / 100) * 100,
    },
    {
      title: "Trim duplicate paid activity windows",
      detail: "Keeps highlights and removes lower-priority paid blocks.",
      value: Math.round((amountFor(safeLines, "activit") * 0.14) / 100) * 100,
    },
  ].filter((item) => item.value > 0);
  const dailySpend = Array.from({ length: 5 }, (_, index) => {
    const weight = index === 0 ? 1.15 : index === 2 ? 1.25 : index === 4 ? 0.78 : 0.95;
    return {
      day: `Day ${String(index + 1).padStart(2, "0")}`,
      amount: Math.round(((safeTotal / 5) * weight) / 100) * 100,
    };
  });
  const alerts = [
    amountFor(safeLines, "transport") > safeTotal * 0.32
      ? "Transport is a top cost driver"
      : "",
    amountFor(safeLines, "stay") > safeTotal * 0.45
      ? "Stay spend is above comfort threshold"
      : "",
    safeTotal > 180000 ? "High-value trip: review cancellation and insurance" : "",
    savings.length ? `${formatCurrency(savings.reduce((sum, item) => sum + item.value, 0))} potential savings identified` : "",
  ].filter(Boolean);
  const scenarioOptions = scenarioRows(safeTotal);
  const estimatedSavings = savings.reduce((sum, item) => sum + item.value, 0);
  const strongestDriver = topDrivers[0];
  const totalSavingsText = formatCurrency(estimatedSavings);

  function runBudgetAction(action: BudgetOptimizationAction) {
    onBudgetAction?.(action);
    setLocalActionMessage(
      `${action.title} preview is ready. Review the impact before applying changes to the itinerary.`
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(249,115,22,0.18),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <WalletCards size={15} />
              Budget intelligence engine
            </div>
            <div className="mt-3 flex items-center gap-1 text-3xl font-black text-white">
              <IndianRupee size={24} />
              {currencyFormatter.format(safeTotal)}
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/68">
              Understand cost drivers, savings, scenarios and budget changes before checkout.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[320px]">
            <div className="rounded-2xl border border-orange-300/20 bg-orange-400/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-100">
                Budget range
              </p>
              <p className="mt-1 text-xs font-black text-white">{budgetRange}</p>
            </div>
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100">
                Budget health
              </p>
              <p className="mt-1 text-xs font-black text-white">
                {healthScore}% · {healthLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5">
        {localActionMessage ? (
          <div className="rounded-3xl border border-orange-300/25 bg-orange-400/10 p-3 text-sm font-bold leading-6 text-orange-50 shadow-[0_14px_34px_rgba(249,115,22,0.12)]">
            {localActionMessage}
          </div>
        ) : null}

        <div className="grid gap-3 xl:grid-cols-3">
          <div className="rounded-3xl border border-cyan-300/18 bg-cyan-300/10 p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <BarChart3 size={15} />
              Budget Health Score
            </div>
            <p className="mt-3 text-4xl font-black text-white">{healthScore}%</p>
            <p className="mt-1 text-sm font-black text-cyan-100">{healthLabel}</p>
          </div>
          <div className="rounded-3xl border border-orange-300/18 bg-orange-400/10 p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
              <BadgeIndianRupee size={15} />
              Top Cost Driver
            </div>
            <p className="mt-3 text-lg font-black text-white">
              {strongestDriver?.label || "Trip value"}
            </p>
            <p className="mt-1 text-2xl font-black text-white">
              {formatCurrency(strongestDriver?.amount || safeTotal)}
            </p>
          </div>
          <div className="rounded-3xl border border-emerald-300/18 bg-emerald-400/10 p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-100">
              <PiggyBank size={15} />
              Potential Savings
            </div>
            <p className="mt-3 text-2xl font-black text-white">{totalSavingsText}</p>
            <p className="mt-1 text-xs font-bold leading-5 text-emerald-50/75">
              Available through route, stay and activity optimization.
            </p>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/10 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <BarChart3 size={15} />
              Budget health score
            </div>
            <p className="mt-3 text-4xl font-black text-white">{healthScore}%</p>
            <p className="mt-1 text-sm font-black text-cyan-100">{healthLabel}</p>
            <div className="mt-4 grid gap-2">
              {[
                "Route cost balance",
                "Stay spend pressure",
                "Activity density",
                "Local transfer buffer",
              ].map((basis) => (
                <div key={basis} className="flex gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-cyan-50/85">
                  <span className="text-emerald-100">✓</span>
                  <span>{basis}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
              <BadgeIndianRupee size={15} />
              Top cost drivers
            </div>
            <div className="mt-3 grid gap-2">
              {topDrivers.map((line, index) => {
                const percent = safeTotal ? Math.round((line.amount / safeTotal) * 100) : 0;

                return (
                  <div key={line.label} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black text-white">
                          {index + 1}. {line.label}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-white/50">
                          {percent}% of trip value
                        </p>
                      </div>
                      <p className="text-sm font-black text-white">
                        {formatCurrency(line.amount)}
                      </p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${barStyles[line.tone]}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <WalletCards size={15} />
            Detailed cost breakdown
          </div>
          <div className="mt-4 space-y-3">
            {safeLines.map((line) => {
              const width =
                safeTotal > 0
                  ? `${Math.round((line.amount / safeTotal) * 100)}%`
                  : "0%";

              return (
                <div key={line.label}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-black text-white">{line.label}</span>
                    <span className="font-black text-white">
                      {formatCurrency(line.amount)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${barStyles[line.tone]}`} style={{ width }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-3">
          {scenarioOptions.map((scenario) => {
            const costImpact = scenario.total - safeTotal;

            return (
              <article key={scenario.label} className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-100">
                  What-if budget scenario
                </p>
                <h3 className="mt-2 text-lg font-black text-white">{scenario.label}</h3>
                <p className="mt-1 text-2xl font-black text-white">{formatCurrency(scenario.total)}</p>
                <p className="mt-2 text-xs font-semibold leading-5 text-white/62">
                  {scenario.detail}
                </p>
                <p className={`mt-3 rounded-2xl border px-3 py-2 text-xs font-black ${
                  costImpact <= 0
                    ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                    : "border-amber-300/20 bg-amber-400/10 text-amber-100"
                }`}>
                  Cost impact: {costImpact === 0 ? "No change" : `${costImpact > 0 ? "+" : "-"}${formatCurrency(Math.abs(costImpact))}`}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    runBudgetAction({
                      costImpact,
                      detail: scenario.detail,
                      title: scenario.action,
                      type: scenario.type,
                    })
                  }
                  className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-orange-300/30 bg-orange-500/10 px-4 py-2 text-xs font-black text-orange-100 transition hover:bg-orange-500/15"
                >
                  {scenario.action}
                  <ArrowRight size={14} />
                </button>
              </article>
            );
          })}
        </div>

        <div className="grid gap-3 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-100">
              <PiggyBank size={15} />
              Potential savings opportunities
            </div>
            <div className="mt-3 grid gap-2">
              {savings.map((item) => (
                <div key={item.title} className="grid gap-2 rounded-2xl border border-white/10 bg-white/10 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div>
                    <p className="text-xs font-black text-white">{item.title}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-emerald-50/70">
                      {item.detail}
                    </p>
                  </div>
                  <p className="text-sm font-black text-emerald-100">
                    Save {formatCurrency(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
              <Sparkles size={15} />
              Auto optimization engine
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-orange-50/82">
              Estimated savings {formatCurrency(estimatedSavings)} · route comfort retained · checkout readiness protected.
            </p>
            <div className="mt-3 grid gap-2 text-xs font-black text-white/78">
              <span>Route impact: value route review</span>
              <span>Stay impact: smart comfort substitution</span>
              <span>Activity impact: duplicate paid windows reduced</span>
            </div>
            <button
              type="button"
              onClick={() =>
                runBudgetAction({
                  costImpact: -estimatedSavings,
                  detail: "Auto optimize stays, transfers and optional activities while preserving booking readiness.",
                  title: "Apply Budget Optimization",
                  type: "auto-optimize",
                })
              }
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 py-2 text-sm font-black text-white shadow-[0_12px_28px_rgba(255,123,0,0.28)] transition hover:-translate-y-0.5"
            >
              Apply Budget Optimization
            </button>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <BarChart3 size={15} />
              Daily spend timeline
            </div>
            <div className="mt-3 grid gap-2">
              {dailySpend.map((day) => {
                const width = safeTotal ? Math.min(100, Math.round((day.amount / (safeTotal / 3)) * 100)) : 0;

                return (
                  <div key={day.day} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-black text-white">{day.day}</span>
                      <span className="text-xs font-black text-white">{formatCurrency(day.amount)}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-orange-400" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-amber-300/20 bg-amber-400/10 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-amber-100">
              <AlertTriangle size={15} />
              Budget alerts
            </div>
            <div className="mt-3 grid gap-2">
              {(alerts.length ? alerts : ["Budget is balanced against current itinerary."]).map((alert) => (
                <div key={alert} className="flex gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-amber-50/88">
                  <span>⚠</span>
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <Sparkles size={15} />
            Budget change log
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/58">
            Budget optimizations applied from this module appear in Transparent Itinerary Updates with cost impact, affected area and timestamp.
          </p>
        </div>
      </div>
    </section>
  );
}
