import type { Dispatch, SetStateAction } from "react";
import { ChevronDown } from "lucide-react";
import { formatCurrency, type CostEstimateLine, type RoutePricing } from "../data/routePreviewData";

type CostSectionProps = {
  routePricing: RoutePricing;
  costDistribution: CostEstimateLine[];
  openCostDay: number | null;
  setOpenCostDay: Dispatch<SetStateAction<number | null>>;
};

export default function CostSection({
  routePricing,
  costDistribution,
  openCostDay,
  setOpenCostDay,
}: CostSectionProps) {
  return (
<div className="grid min-w-0 gap-3 sm:gap-4">
<div className="rounded-[1.15rem] border border-sky-200 bg-white/86 p-3 shadow-[0_16px_38px_rgba(15,23,42,0.08)] sm:rounded-[1.4rem] sm:p-4">
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
        Trip Cost Snapshot
      </p>
      <h5 className="mt-1 text-xl font-black text-slate-950">
        Estimated Trip Cost
      </h5>
    </div>
    <div className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left shadow-[0_12px_28px_rgba(16,185,129,0.14)] sm:w-auto sm:text-right">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">
        Total Cost
      </p>
      <p className="mt-1 text-2xl font-black text-emerald-700 sm:text-3xl">
        {formatCurrency(routePricing.totalCost)}
      </p>
    </div>
  </div>

  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
    {[
      ["Travellers", `${routePricing.travellerCount}`],
      ["Trip Days", `${routePricing.tripDays}`],
      ["Budget Type", routePricing.budgetType],
      ["Per Person", formatCurrency(routePricing.perPersonCost)],
      ["Per Day", formatCurrency(routePricing.perDayCost)],
    ].map(([label, value]) => (
      <div
        key={`snapshot-${label}`}
        className="rounded-2xl border border-sky-100 bg-sky-50/70 px-3 py-3"
      >
        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-black text-slate-950">
          {value}
        </p>
      </div>
    ))}
  </div>
</div>

<div className="rounded-[1.15rem] border border-sky-200 bg-white/82 p-3 shadow-[0_14px_34px_rgba(15,23,42,0.07)] sm:rounded-[1.4rem] sm:p-4">
  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
    Cost Distribution
  </p>
  <div className="mt-3 grid gap-3 sm:grid-cols-2">
    {costDistribution.map((line) => (
      <div
        key={line.id}
        className="rounded-2xl border border-sky-100 bg-white/86 p-3 shadow-[0_10px_24px_rgba(15,23,42,0.055)]"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black text-slate-950">
            {line.label}
          </p>
          <p className="text-sm font-black text-slate-950">
            {formatCurrency(line.amount)}
          </p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-orange-300 to-orange-500"
            style={{ width: `${line.percentage}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] font-bold text-slate-500">
          {line.percentage}% of total cost
        </p>
      </div>
    ))}
  </div>
</div>

<div className="rounded-[1.15rem] border border-sky-200 bg-white/82 p-3 shadow-[0_14px_34px_rgba(15,23,42,0.07)] sm:rounded-[1.4rem] sm:p-4">
  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
    Day Wise Cost Breakdown
  </p>
  <div className="mt-3 grid gap-2">
    {routePricing.dayWiseCosts.map((dayEstimate) => {
      const open = openCostDay === dayEstimate.day;

      return (
        <div
          key={`cost-day-${dayEstimate.day}`}
          className="overflow-hidden rounded-2xl border border-sky-100 bg-white/88 shadow-sm"
        >
          <button
            type="button"
            onClick={() =>
              setOpenCostDay(open ? null : dayEstimate.day)
            }
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-sky-50"
            aria-expanded={open}
          >
            <div>
              <p className="text-sm font-black text-slate-950">
                Day {dayEstimate.day}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">
                Estimated total {formatCurrency(dayEstimate.total)}
              </p>
            </div>
            <ChevronDown
              size={17}
              className={`text-slate-500 transition-transform ${
                open ? "rotate-180 text-orange-600" : ""
              }`}
            />
          </button>

          <div
            className={`grid transition-all duration-300 ${
              open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="grid grid-cols-2 gap-2 border-t border-sky-100 bg-sky-50/60 p-3 sm:grid-cols-5">
                {[
                  ["Transport", dayEstimate.transport],
                  ["Stay", dayEstimate.stay],
                  ["Food", dayEstimate.food],
                  ["Activity", dayEstimate.activity],
                  ["Buffer", dayEstimate.buffer],
                ].map(([label, amount]) => (
                  <div
                    key={`cost-day-${dayEstimate.day}-${label}`}
                    className="rounded-xl border border-white bg-white/86 px-3 py-2"
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-950">
                      {formatCurrency(Number(amount))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
</div>

<div className="rounded-[1.15rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-3 shadow-[0_16px_38px_rgba(16,185,129,0.12)] sm:rounded-[1.4rem] sm:p-4">
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
        Smart Savings
      </p>
      <h5 className="mt-1 text-xl font-black text-slate-950">
        Potential Savings
      </h5>
    </div>
    <div className="w-full text-left sm:w-auto sm:text-right">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">
        Total Savings
      </p>
      <p className="mt-1 text-2xl font-black text-emerald-700">
        {formatCurrency(routePricing.savings.totalSavings)}
      </p>
    </div>
  </div>

  <div className="mt-3 grid gap-2 sm:grid-cols-3">
    {routePricing.savings.insights.map((saving) => (
      <div
        key={saving.label}
        className="rounded-2xl border border-emerald-100 bg-white/82 px-3 py-3"
      >
        <p className="text-sm font-black text-slate-950">
          {saving.label}
        </p>
        <p className="mt-1 text-lg font-black text-emerald-700">
          {formatCurrency(saving.amount)}
        </p>
        <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
          {saving.detail}
        </p>
      </div>
    ))}
  </div>
</div>
            </div>
  );
}
