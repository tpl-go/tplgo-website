import { IndianRupee, WalletCards } from "lucide-react";
import type { TiyaBudgetIntelligence as TiyaBudgetIntelligenceData } from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaBudgetIntelligenceProps = {
  budget: TiyaBudgetIntelligenceData;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const riskStyles: Record<TiyaBudgetIntelligenceData["risk"], string> = {
  safe: "bg-emerald-50 text-emerald-700 border-emerald-100",
  balanced: "bg-blue-50 text-blue-700 border-blue-100",
  "high spend": "bg-orange-50 text-orange-700 border-orange-100",
};

export default function TiyaBudgetIntelligence({
  budget,
}: TiyaBudgetIntelligenceProps) {
  const splits = [
    ["Transport", budget.transportSplit],
    ["Stay", budget.staySplit],
    ["Activity", budget.activitySplit],
    ["Food/local", budget.foodLocalSplit],
    ["Buffer", budget.flexibilityBuffer],
  ];

  return (
    <section className="rounded-3xl border border-white/80 bg-white/78 p-4 shadow-[0_18px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
            <WalletCards size={15} />
            Budget intelligence
          </div>
          <div className="mt-3 flex items-center gap-1 text-3xl font-black text-slate-950">
            <IndianRupee size={23} />
            {currencyFormatter.format(budget.estimatedSpend)}
          </div>
        </div>
        <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-black capitalize ${riskStyles[budget.risk]}`}>
          {budget.risk}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {splits.map(([label, amount]) => (
          <div key={label} className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">
              {label}
            </p>
            <p className="mt-1 text-sm font-black text-slate-950">
              ₹{currencyFormatter.format(Number(amount))}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">
            Economy comparison
          </p>
          <p className="mt-1 text-sm font-black text-slate-950">
            ₹{currencyFormatter.format(budget.economyComparison)}
          </p>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-700">
            Premium comparison
          </p>
          <p className="mt-1 text-sm font-black text-slate-950">
            ₹{currencyFormatter.format(budget.premiumComparison)}
          </p>
        </div>
      </div>
    </section>
  );
}
