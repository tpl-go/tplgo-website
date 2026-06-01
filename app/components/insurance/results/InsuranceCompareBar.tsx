"use client";

import { InsurancePlan } from "@/app/lib/insurance/insuranceDummyData";

type Props = {
  selectedPlans: InsurancePlan[];
  onRemove: (planId: string) => void;
  onClear: () => void;
  onCompare: () => void;
};

export default function InsuranceCompareBar({
  selectedPlans,
  onRemove,
  onClear,
  onCompare,
}: Props) {
  if (selectedPlans.length === 0) return null;

  return (
    <div className="fixed bottom-3 left-1/2 z-[9998] w-[min(1180px,calc(100%-16px))] -translate-x-1/2 overflow-hidden rounded-[22px] border border-orange-400 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-[2px] shadow-[0_20px_60px_rgba(0,0,0,0.45)] md:bottom-4 md:w-[min(1180px,calc(100%-24px))] md:rounded-[28px]">
      <div className="flex max-h-[40vh] flex-col gap-3 overflow-y-auto rounded-[20px] bg-gradient-to-r from-slate-900 via-[#111827] to-slate-900 px-3 py-3 text-white md:rounded-[26px] md:px-5 md:py-4 lg:max-h-none lg:flex-row lg:items-center lg:justify-between lg:overflow-visible">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-300/40 bg-orange-500/15 text-2xl">
            ⚖
          </div>

          <div className="min-w-0">
            <p className="break-words text-base font-extrabold text-white">
              Compare Insurance Plans
            </p>
            <p className="text-xs font-semibold text-white/70">
              Select 2 to 3 plans for side-by-side comparison
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
          {selectedPlans.map((plan) => (
            <div
              key={plan.id}
              className="flex min-w-[170px] items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white px-3 py-2 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-extrabold text-gray-950">
                  {plan.provider}
                </p>
                <p className="truncate text-[11px] font-semibold text-gray-500">
                  {plan.planName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onRemove(plan.id)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm font-extrabold text-orange-700 hover:bg-orange-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2 lg:flex">
          <button
            type="button"
            onClick={onClear}
            className="min-h-11 rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Clear
          </button>

          <button
            type="button"
            disabled={selectedPlans.length < 2}
            onClick={onCompare}
            className={`min-h-11 rounded-2xl px-6 py-2.5 text-sm font-extrabold text-white shadow-lg transition ${
              selectedPlans.length < 2
                ? "cursor-not-allowed bg-gray-500/60"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            Compare ({selectedPlans.length})
          </button>
        </div>
      </div>
    </div>
  );
}
