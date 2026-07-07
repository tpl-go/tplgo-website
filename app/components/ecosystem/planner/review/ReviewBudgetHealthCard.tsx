"use client";

import { Gauge, PiggyBank } from "lucide-react";

export type BudgetHealthStatus = "Excellent" | "Good" | "Warning" | "Over Budget";

type ReviewBudgetHealthCardProps = {
  budgetRange: string;
  differenceLabel: string;
  healthScore: number;
  savingsApplied: string;
  selectedBasketValue: string;
  status: BudgetHealthStatus;
};

function statusClass(status: BudgetHealthStatus) {
  if (status === "Excellent") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "Good") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "Warning") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

export default function ReviewBudgetHealthCard({
  budgetRange,
  differenceLabel,
  healthScore,
  savingsApplied,
  selectedBasketValue,
  status,
}: ReviewBudgetHealthCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-[0_18px_54px_rgba(154,52,18,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
            Budget Health
          </p>
          <p className="mt-3 text-5xl font-black text-slate-950">{healthScore}%</p>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-700">
          <Gauge size={22} />
        </span>
      </div>

      <span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-black ${statusClass(status)}`}>
        {status}
      </span>

      <div className="mt-5 grid gap-2">
        {[
          ["Budget Range", budgetRange],
          ["Selected Basket Value", selectedBasketValue],
          ["Difference", differenceLabel],
          ["Savings Applied", savingsApplied],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/70 px-3 py-2"
          >
            <span className="text-xs font-bold text-stone-600">{label}</span>
            <span className="text-sm font-black text-slate-950">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-orange-100 bg-white p-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-orange-700">
          <PiggyBank size={15} />
          Budget readiness note
        </div>
        <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
          Budget values are displayed from the Smart Planner review payload and
          basket estimates only.
        </p>
      </div>
    </article>
  );
}
