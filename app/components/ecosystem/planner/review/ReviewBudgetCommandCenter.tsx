"use client";

import {
  BadgeIndianRupee,
  BedDouble,
  Bus,
  FileText,
  Landmark,
  Percent,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stamp,
  Ticket,
} from "lucide-react";

import ReviewBudgetBreakdownCard from "./ReviewBudgetBreakdownCard";
import ReviewBudgetGapCard from "./ReviewBudgetGapCard";
import ReviewBudgetHealthCard from "./ReviewBudgetHealthCard";
import ReviewBudgetStickySummary from "./ReviewBudgetStickySummary";
import type {
  BudgetBreakdownItem,
  BudgetBreakdownStatus,
} from "./ReviewBudgetBreakdownCard";
import type { BudgetHealthStatus } from "./ReviewBudgetHealthCard";
import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";

type ReviewBudgetCommandCenterProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

type UnknownRecord = Record<string, unknown>;
type PayloadWithBudgetExtras = TiyaSmartPlannerReviewPayload & {
  optimizationSavings?: Record<string, unknown>;
  potentialSavings?: Record<string, unknown>;
  quoteEstimate?: TiyaSmartPlannerReviewPayload["quoteEstimate"] & {
    addOns?: number;
    baseEstimate?: number;
    confidence?: number | string;
    finalEstimate?: number;
    serviceEstimate?: number;
    taxesPlaceholder?: number;
  };
};

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function formatCurrency(value?: number) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) return "Not available";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function basketItemValue(item: WorkspaceBookingBasketItem) {
  return Number(item.estimatedTotal || item.estimatedPrice || item.price || 0);
}

function basketValue(items: WorkspaceBookingBasketItem[]) {
  return items.reduce((sum, item) => sum + basketItemValue(item), 0);
}

function normalizeText(value: unknown) {
  return String(value || "").toLowerCase();
}

function categoryFromBasketItem(item: WorkspaceBookingBasketItem) {
  const text = normalizeText(
    [item.serviceType, item.serviceName, item.serviceLabel, item.category, item.title].join(" ")
  );
  if (text.includes("hotel") || text.includes("stay") || text.includes("homestay")) return "Stay";
  if (text.includes("activity") || text.includes("experience")) return "Activities";
  if (text.includes("insurance")) return "Insurance";
  if (text.includes("visa")) return "Visa";
  if (text.includes("local life")) return "Local Life";
  if (text.includes("market") || text.includes("shopping")) return "Local Market";
  if (text.includes("creator")) return "Creator Experiences";
  if (text.includes("cab") || text.includes("transfer") || text.includes("flight") || text.includes("train") || text.includes("bus")) return "Transport";
  return item.category || "Other";
}

function statusForPercentage(value: number): BudgetBreakdownStatus {
  if (value <= 0) return "Missing";
  if (value >= 38) return "High";
  if (value >= 18) return "Balanced";
  return "Good";
}

function breakdownItems(payload: TiyaSmartPlannerReviewPayload): BudgetBreakdownItem[] {
  const budget = payload.budgetEstimate || {};
  const basketByCategory = safeArray(payload.selectedBasketItems).reduce<Record<string, number>>(
    (acc, item) => {
      const category = categoryFromBasketItem(item);
      acc[category] = (acc[category] || 0) + basketItemValue(item);
      return acc;
    },
    {}
  );
  const rows = [
    { amount: budget.transport || basketByCategory.Transport || 0, icon: Bus, label: "Transport" },
    { amount: budget.stay || basketByCategory.Stay || 0, icon: BedDouble, label: "Stay" },
    { amount: budget.activity || basketByCategory.Activities || 0, icon: Ticket, label: "Activities" },
    { amount: budget.insurance || basketByCategory.Insurance || 0, icon: ShieldCheck, label: "Insurance" },
    { amount: basketByCategory.Visa || 0, icon: Stamp, label: "Visa" },
    { amount: budget.localLife || basketByCategory["Local Life"] || 0, icon: Sparkles, label: "Local Life" },
    { amount: budget.localMarket || basketByCategory["Local Market"] || 0, icon: ShoppingBag, label: "Local Market" },
    { amount: basketByCategory["Creator Experiences"] || 0, icon: Landmark, label: "Creator Experiences" },
    { amount: budget.taxesPlaceholder || 0, icon: FileText, label: "Taxes / Fees Placeholder" },
  ];
  const total =
    rows.reduce((sum, row) => sum + row.amount, 0) ||
    budget.totalEstimatedCost ||
    basketValue(safeArray(payload.selectedBasketItems));

  return rows.map((row) => {
    const percentage = total > 0 ? Math.round((row.amount / total) * 100) : 0;
    return {
      ...row,
      percentage,
      status: statusForPercentage(percentage),
    };
  });
}

function numberFromRecord(record: UnknownRecord, key: string) {
  const value = record[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function savingsRows(payload: TiyaSmartPlannerReviewPayload) {
  const extended = payload as PayloadWithBudgetExtras;
  const sources = [
    extended.potentialSavings,
    extended.optimizationSavings,
  ].filter((source): source is Record<string, unknown> => Boolean(source));
  const savings: Array<{ label: string; value: string }> = [];
  const labels: Array<[string, string[]]> = [
    ["Transport Savings", ["transport", "transportSavings"]],
    ["Stay Savings", ["stay", "staySavings"]],
    ["Activity Savings", ["activity", "activitySavings"]],
    ["Offer Savings", ["offer", "offerSavings"]],
    ["Optimization Savings", ["optimization", "optimizationSavings", "total"]],
  ];

  labels.forEach(([label, keys]) => {
    const amount = sources.reduce(
      (sum, source) => sum + keys.reduce((keySum, key) => keySum + numberFromRecord(source, key), 0),
      0
    );
    if (amount > 0) savings.push({ label, value: formatCurrency(amount) });
  });

  return savings;
}

function budgetHealthStatus(score: number, gap: number): BudgetHealthStatus {
  if (gap > 0) return "Over Budget";
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  return "Warning";
}

function highestLowestCategory(items: BudgetBreakdownItem[]) {
  const withValue = items.filter((item) => item.amount > 0);
  const sorted = [...withValue].sort((a, b) => b.amount - a.amount);

  return {
    highest: sorted[0]?.label || "Not available",
    lowest: sorted[sorted.length - 1]?.label || "Not available",
  };
}

export default function ReviewBudgetCommandCenter({
  payload,
}: ReviewBudgetCommandCenterProps) {
  const extendedPayload = payload as PayloadWithBudgetExtras;
  const basketItems = safeArray(payload.selectedBasketItems);
  const selectedBasketValue = basketValue(basketItems);
  const estimatedBudget = Number(payload.budgetEstimate?.totalEstimatedCost || 0);
  const quote = extendedPayload.quoteEstimate;
  const quoteValue = Number(
    quote?.finalEstimate ||
      quote?.estimatedTotal ||
      quote?.totalQuoteEstimate ||
      selectedBasketValue ||
      0
  );
  const potentialSavings = savingsRows(payload);
  const savingsTotal = potentialSavings.reduce((sum, saving) => {
    const amount = Number(saving.value.replace(/[^\d.]/g, ""));
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
  const budgetGap = selectedBasketValue - estimatedBudget;
  const budgetGapLabel =
    estimatedBudget <= 0 || selectedBasketValue <= 0
      ? "Budget gap not available"
      : budgetGap > 0
        ? `Over Budget by ${formatCurrency(budgetGap)}`
        : budgetGap < 0
          ? `Under Budget by ${formatCurrency(Math.abs(budgetGap))}`
          : "On Budget";
  const budgetGapTone =
    budgetGap > 0 ? "warning" : budgetGap < 0 ? "good" : "neutral";
  const breakdown = breakdownItems(payload);
  const totalBreakdown = breakdown.reduce((sum, item) => sum + item.amount, 0);
  const healthScore = payload.plannerAudit?.readinessScore
    ? Math.min(100, Math.max(0, payload.plannerAudit.readinessScore))
    : estimatedBudget > 0 && selectedBasketValue > 0
      ? Math.max(45, Math.min(96, Math.round(100 - Math.max(0, budgetGap / estimatedBudget) * 100)))
      : 0;
  const healthStatus = budgetHealthStatus(healthScore, budgetGap);
  const averageItemValue = basketItems.length
    ? Math.round(selectedBasketValue / basketItems.length)
    : 0;
  const categoryExtremes = highestLowestCategory(breakdown);
  const quoteDetails = [
    ["Base Estimate", formatCurrency(quote?.baseEstimate || estimatedBudget)],
    ["Service Estimate", formatCurrency(quote?.serviceEstimate || selectedBasketValue)],
    ["Add-ons", formatCurrency(quote?.addOns)],
    ["Taxes Placeholder", formatCurrency(quote?.taxesPlaceholder || payload.budgetEstimate?.taxesPlaceholder)],
    ["Final Estimate", formatCurrency(quoteValue)],
    ["Confidence", quote?.confidence ? String(quote.confidence) : "Not available"],
    ["Quote Source", selectedBasketValue ? "Workspace Basket" : estimatedBudget ? "Planner Estimate" : "Smart Planner Review Payload"],
  ];

  return (
    <section className="rounded-[2rem] border border-orange-200 bg-[linear-gradient(180deg,#fff7ed,#ffffff)] p-6 shadow-[0_18px_54px_rgba(154,52,18,0.08)]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-700">
            Finance Review Layer
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            BUDGET COMMAND CENTER
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-stone-700">
            Review estimated budget, selected basket value, quote estimate and
            budget health before booking.
          </p>
        </div>
        <div className="hidden rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-orange-700 xl:block">
          Read-only budget visualization
        </div>
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-6">
        {[
          ["Estimated Budget", formatCurrency(estimatedBudget)],
          ["Current Selected Basket", formatCurrency(selectedBasketValue)],
          ["Quote Estimate", formatCurrency(quoteValue)],
          ["Potential Savings", savingsTotal > 0 ? formatCurrency(savingsTotal) : "Not available"],
          ["Budget Gap", budgetGapLabel],
          ["Budget Health", healthScore ? `${healthScore}%` : "Not available"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-3xl border border-orange-100 bg-white p-4 shadow-[0_12px_34px_rgba(154,52,18,0.05)]"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-stone-500">
              {label}
            </p>
            <p className="mt-3 break-words text-2xl font-black text-slate-950">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          <ReviewBudgetBreakdownCard
            items={breakdown}
            total={totalBreakdown || estimatedBudget || selectedBasketValue}
          />

          <ReviewBudgetGapCard
            gapLabel={budgetGapLabel}
            gapTone={budgetGapTone}
            savings={potentialSavings}
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
              <div className="flex items-center gap-2">
                <BadgeIndianRupee size={18} className="text-orange-700" />
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Quote Estimate Review
                </p>
              </div>
              <div className="mt-4 grid gap-2">
                {quoteDetails.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <span className="text-xs font-bold text-slate-500">{label}</span>
                    <span className="text-sm font-black text-slate-950">{value}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
              <div className="flex items-center gap-2">
                <Percent size={18} className="text-[#4f46e5]" />
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Basket Value Review
                </p>
              </div>
              <div className="mt-4 grid gap-2">
                {[
                  ["Total Basket Items", basketItems.length || "No booking basket value available yet"],
                  ["Total Basket Value", formatCurrency(selectedBasketValue)],
                  ["Average Item Value", formatCurrency(averageItemValue)],
                  ["Highest Cost Category", categoryExtremes.highest],
                  ["Lowest Cost Category", categoryExtremes.lowest],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <span className="text-xs font-bold text-slate-500">{label}</span>
                    <span className="text-sm font-black text-slate-950">{value}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>

        <aside className="grid gap-4 self-start">
          <ReviewBudgetHealthCard
            budgetRange={estimatedBudget ? formatCurrency(estimatedBudget) : "Budget details not available yet"}
            differenceLabel={budgetGapLabel}
            healthScore={healthScore}
            savingsApplied={savingsTotal > 0 ? formatCurrency(savingsTotal) : "No savings data available yet"}
            selectedBasketValue={selectedBasketValue ? formatCurrency(selectedBasketValue) : "No booking basket value available yet"}
            status={healthStatus}
          />
          <ReviewBudgetStickySummary
            basketValue={formatCurrency(selectedBasketValue)}
            budgetHealth={healthScore ? `${healthScore}% · ${healthStatus}` : "Not available"}
            estimatedBudget={formatCurrency(estimatedBudget)}
            quoteEstimate={formatCurrency(quoteValue)}
          />
        </aside>
      </div>
    </section>
  );
}
