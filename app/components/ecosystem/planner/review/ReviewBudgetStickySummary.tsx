"use client";

type ReviewBudgetStickySummaryProps = {
  basketValue: string;
  budgetHealth: string;
  estimatedBudget: string;
  quoteEstimate: string;
};

export default function ReviewBudgetStickySummary({
  basketValue,
  budgetHealth,
  estimatedBudget,
  quoteEstimate,
}: ReviewBudgetStickySummaryProps) {
  return (
    <article className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-[0_18px_54px_rgba(154,52,18,0.07)]">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
        Budget Summary
      </p>
      <div className="mt-4 grid gap-2">
        {[
          ["Estimated Budget", estimatedBudget],
          ["Basket Value", basketValue],
          ["Quote Estimate", quoteEstimate],
          ["Budget Health", budgetHealth],
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
      <p className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-500">
        Proceed readiness depends on the protected review and booking handoff
        outside this read-only budget section.
      </p>
    </article>
  );
}
