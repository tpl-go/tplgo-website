"use client";

import { Route, Sparkles } from "lucide-react";
import type { TiyaSeasonalRouteAdvice as TiyaSeasonalRouteAdviceData } from "@/app/lib/ecosystem/planner/plannerSeasonEngine";

type TiyaSeasonalRouteAdviceProps = {
  advice: TiyaSeasonalRouteAdviceData[];
};

const severityStyles: Record<TiyaSeasonalRouteAdviceData["severity"], string> = {
  Low: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  Medium: "border-orange-300/20 bg-orange-400/10 text-orange-100",
  High: "border-rose-300/20 bg-rose-400/10 text-rose-100",
};

export default function TiyaSeasonalRouteAdvice({
  advice,
}: TiyaSeasonalRouteAdviceProps) {
  const safeAdvice = Array.isArray(advice) ? advice : [];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
        <Route size={15} />
        Seasonal route adjustment
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {safeAdvice.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-white/10 bg-white/[0.06] p-3"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="text-sm font-black text-white">{item.title}</h4>
                <p className="mt-1 text-xs font-semibold leading-5 text-white/70">
                  {item.detail}
                </p>
              </div>
              <span
                className={`w-fit rounded-full border px-2.5 py-1 text-[11px] font-black ${severityStyles[item.severity]}`}
              >
                {item.severity}
              </span>
            </div>
            <button
              type="button"
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-white/15"
            >
              <Sparkles size={14} />
              {item.action}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
