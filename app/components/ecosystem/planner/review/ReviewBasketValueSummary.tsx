"use client";

import { BadgeIndianRupee } from "lucide-react";

type ReviewBasketValueSummaryProps = {
  budgetEstimate: number;
  estimatedTaxes: number;
  quoteEstimate: number;
  subtotal: number;
};

function formatCurrency(value?: number) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) return "Not available";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export default function ReviewBasketValueSummary({
  budgetEstimate,
  estimatedTaxes,
  quoteEstimate,
  subtotal,
}: ReviewBasketValueSummaryProps) {
  const estimatedTotal = subtotal + estimatedTaxes;
  const difference = budgetEstimate ? estimatedTotal - budgetEstimate : 0;

  return (
    <article className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-[0_18px_54px_rgba(154,52,18,0.07)]">
      <div className="flex items-center gap-2">
        <BadgeIndianRupee size={18} className="text-orange-700" />
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
          Value Summary
        </p>
      </div>
      <div className="mt-4 grid gap-2">
        {[
          ["Basket Subtotal", formatCurrency(subtotal)],
          ["Estimated Taxes / Fees", formatCurrency(estimatedTaxes)],
          ["Estimated Total", formatCurrency(estimatedTotal)],
          ["Quote Estimate", formatCurrency(quoteEstimate)],
          ["Budget Estimate", formatCurrency(budgetEstimate)],
          [
            "Difference vs Budget",
            budgetEstimate
              ? `${difference > 0 ? "+" : "-"}${formatCurrency(Math.abs(difference))}`
              : "Not available",
          ],
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
    </article>
  );
}
