import { IndianRupee, WalletCards } from "lucide-react";
import type { TiyaBudgetLine } from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaBudgetPreviewProps = {
  lines: TiyaBudgetLine[];
  total: number;
  budgetRange?: string;
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

export default function TiyaBudgetPreview({
  lines,
  total,
  budgetRange = "Live estimate",
}: TiyaBudgetPreviewProps) {
  const safeLines = Array.isArray(lines) ? lines : [];
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;

  return (
    <section className="rounded-3xl border border-white/80 bg-white/78 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
            <WalletCards size={15} />
            Budget preview
          </div>
          <div className="mt-3 flex items-center gap-1 text-3xl font-black text-slate-950">
            <IndianRupee size={24} />
            {currencyFormatter.format(safeTotal)}
          </div>
        </div>
        <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700">
          {budgetRange}
        </span>
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
                <span className="font-black text-slate-700">{line.label}</span>
                <span className="font-black text-slate-950">
                  ₹{currencyFormatter.format(line.amount)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${barStyles[line.tone]}`}
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-3 text-sm font-semibold leading-6 text-slate-600">
        Price bands are structured for later API pricing and can map directly to
        stays, transfers, activities and meal buffers.
      </div>
    </section>
  );
}
