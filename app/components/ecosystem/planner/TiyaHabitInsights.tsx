"use client";

import { LineChart, MessageSquareText } from "lucide-react";
import type { TiyaHabitMetric } from "@/app/lib/ecosystem/planner/plannerTravelPersonalityEngine";

type TiyaHabitInsightsProps = {
  metrics: TiyaHabitMetric[];
  insights: string[];
  continuity: string[];
};

export default function TiyaHabitInsights({
  metrics,
  insights,
  continuity,
}: TiyaHabitInsightsProps) {
  const safeMetrics = Array.isArray(metrics) ? metrics : [];
  const safeInsights = Array.isArray(insights) ? insights : [];
  const safeContinuity = Array.isArray(continuity) ? continuity : [];

  return (
    <div className="grid gap-3">
      <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
          <LineChart size={15} />
          AI habit dashboard
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {safeMetrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-white/10 bg-white/10 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-xs font-black text-white">
                    {metric.value}
                  </p>
                </div>
                <span className="rounded-full bg-cyan-300/10 px-2.5 py-1 text-[11px] font-black text-cyan-100">
                  {metric.score}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <MessageSquareText size={15} />
            Repeat traveller insights
          </div>
          <div className="mt-3 grid gap-2">
            {safeInsights.map((insight) => (
              <p
                key={insight}
                className="rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-semibold leading-5 text-white/70"
              >
                {insight}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 sm:p-4">
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
            Smart trip continuity
          </div>
          <div className="mt-3 grid gap-2">
            {safeContinuity.map((item) => (
              <p
                key={item}
                className="rounded-2xl border border-orange-300/15 bg-white/10 p-3 text-xs font-semibold leading-5 text-orange-50/90"
              >
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
