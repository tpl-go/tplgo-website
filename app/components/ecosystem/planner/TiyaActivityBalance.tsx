"use client";

import { Activity, Sparkles } from "lucide-react";
import type { TiyaActivityBalanceInsight } from "@/app/lib/ecosystem/planner/plannerActivityBalanceEngine";

type TiyaActivityBalanceProps = {
  insights: TiyaActivityBalanceInsight[];
};

const toneStyles: Record<TiyaActivityBalanceInsight["tone"], string> = {
  green: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  orange: "border-orange-300/20 bg-orange-400/10 text-orange-100",
  blue: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
};

export default function TiyaActivityBalance({
  insights,
}: TiyaActivityBalanceProps) {
  const safeInsights = Array.isArray(insights) ? insights : [];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
        <Activity size={15} />
        Smart activity balance
      </div>
      <div className="mt-3 grid gap-2 lg:grid-cols-2">
        {safeInsights.map((insight) => (
          <article
            key={insight.id}
            className={`rounded-2xl border p-3 ${toneStyles[insight.tone]}`}
          >
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <h4 className="text-sm font-black">{insight.title}</h4>
                <p className="mt-1 text-xs font-semibold leading-5 opacity-80">
                  {insight.detail}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
