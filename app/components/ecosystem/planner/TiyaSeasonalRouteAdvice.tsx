"use client";

import { Route, Sparkles } from "lucide-react";
import type { TiyaSeasonalRouteAdvice as TiyaSeasonalRouteAdviceData } from "@/app/lib/ecosystem/planner/plannerSeasonEngine";

type TiyaSeasonalRouteAdviceProps = {
  advice: TiyaSeasonalRouteAdviceData[];
  onAdviceAction?: (advice: TiyaSeasonalRouteAdviceData) => void;
};

const severityStyles: Record<TiyaSeasonalRouteAdviceData["severity"], string> = {
  Low: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  Medium: "border-orange-300/20 bg-orange-400/10 text-orange-100",
  High: "border-rose-300/20 bg-rose-400/10 text-rose-100",
};

export default function TiyaSeasonalRouteAdvice({
  advice,
  onAdviceAction,
}: TiyaSeasonalRouteAdviceProps) {
  const safeAdvice = Array.isArray(advice) ? advice : [];
  const confidenceForSeverity = (severity: TiyaSeasonalRouteAdviceData["severity"]) =>
    severity === "High" ? "86%" : severity === "Medium" ? "78%" : "68%";
  const impactForAdvice = (item: TiyaSeasonalRouteAdviceData) => {
    if (item.action === "Add buffer") return "Adds weather protection to the day plan";
    if (item.action === "Shift timing") return "Moves transfer windows into safer daylight";
    if (item.action === "Avoid road") return "Reduces exposure to weather-sensitive roads";
    if (item.action === "Change mode") return "Reduces road-led seasonal exposure";
    return "Improves route safety and decision readiness";
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
        <Route size={15} />
        AI recommended weather actions
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
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                  Reason
                </p>
                <p className="mt-1 line-clamp-2 text-xs font-bold text-white/75">
                  {item.detail}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                  Impact
                </p>
                <p className="mt-1 line-clamp-2 text-xs font-bold text-white/75">
                  {impactForAdvice(item)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                  Confidence
                </p>
                <p className="mt-1 text-xs font-black text-cyan-100">
                  {confidenceForSeverity(item.severity)}
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-cyan-300/16 bg-cyan-300/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
                Why this recommendation
              </p>
              <div className="mt-2 grid gap-1.5 text-xs font-semibold leading-5 text-cyan-50/80">
                {[
                  "Seasonal route profile",
                  "Visibility forecast model",
                  "Historical climate pattern",
                  "Current trip structure",
                ].map((reason) => (
                  <div key={`${item.id}-${reason}`} className="flex gap-2">
                    <span className="text-emerald-100">✓</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onAdviceAction?.(item)}
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-orange-300/30 bg-orange-500/10 px-4 py-2 text-xs font-black text-orange-100 transition hover:bg-orange-500/15"
            >
              <Sparkles size={14} />
              Apply To Itinerary
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
