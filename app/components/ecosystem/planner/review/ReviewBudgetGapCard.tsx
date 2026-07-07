"use client";

import { AlertTriangle, CheckCircle2, PiggyBank } from "lucide-react";

type ReviewBudgetGapCardProps = {
  gapLabel: string;
  gapTone: "good" | "neutral" | "warning";
  savings: Array<{ label: string; value: string }>;
};

export default function ReviewBudgetGapCard({
  gapLabel,
  gapTone,
  savings,
}: ReviewBudgetGapCardProps) {
  const isWarning = gapTone === "warning";

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <article
        className={`rounded-[1.75rem] border p-5 ${
          isWarning
            ? "border-red-200 bg-red-50 text-red-800"
            : gapTone === "good"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-blue-200 bg-blue-50 text-blue-800"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
          {isWarning ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          Budget Gap
        </div>
        <p className="mt-4 text-2xl font-black">{gapLabel}</p>
      </article>

      <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
        <div className="flex items-center gap-2">
          <PiggyBank size={18} className="text-orange-700" />
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Potential Savings
          </p>
        </div>
        <div className="mt-4 grid gap-2">
          {savings.length ? (
            savings.map((saving) => (
              <div
                key={saving.label}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <span className="text-sm font-black text-slate-700">{saving.label}</span>
                <span className="text-sm font-black text-slate-950">{saving.value}</span>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm font-black text-slate-500">
              No savings data available yet.
            </p>
          )}
        </div>
      </article>
    </div>
  );
}
