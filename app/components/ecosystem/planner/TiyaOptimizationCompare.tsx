"use client";

import { GitCompareArrows } from "lucide-react";
import type { TiyaOptimizationCompareOption } from "@/app/lib/ecosystem/planner/plannerOptimizationEngine";

type TiyaOptimizationCompareProps = {
  options: TiyaOptimizationCompareOption[];
};

export default function TiyaOptimizationCompare({
  options,
}: TiyaOptimizationCompareProps) {
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
        <GitCompareArrows size={15} />
        Smart transport comparison
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {safeOptions.map((option) => (
          <article
            key={option.id}
            className="rounded-2xl border border-white/10 bg-white/[0.06] p-3"
          >
            <h4 className="text-sm font-black text-white">{option.title}</h4>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                  Current
                </p>
                <p className="mt-1 truncate text-xs font-black text-white">
                  {option.currentLabel}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-2">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-100/70">
                  Optimized
                </p>
                <p className="mt-1 truncate text-xs font-black text-emerald-100">
                  {option.optimizedLabel}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-black text-emerald-100">
                Save {option.savingsPercent}%
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-black text-white/75">
                Comfort {option.comfortImpact > 0 ? "+" : ""}
                {option.comfortImpact}
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-white/70">
              {option.tradeOff}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
