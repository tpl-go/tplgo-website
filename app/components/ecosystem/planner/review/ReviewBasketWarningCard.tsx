"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

type ReviewBasketWarningCardProps = {
  warnings: string[];
};

export default function ReviewBasketWarningCard({
  warnings,
}: ReviewBasketWarningCardProps) {
  return (
    <article
      className={`rounded-[1.75rem] border p-5 ${
        warnings.length
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
        {warnings.length ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
        Basket Warnings
      </div>
      <div className="mt-3 grid gap-2">
        {warnings.length ? (
          warnings.map((warning) => (
            <p
              key={warning}
              className="rounded-2xl border border-amber-100 bg-white px-3 py-2 text-sm font-black"
            >
              {warning}
            </p>
          ))
        ) : (
          <p className="rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-sm font-semibold">
            No basket warnings detected.
          </p>
        )}
      </div>
    </article>
  );
}
