"use client";

import { AlertTriangle, Sparkles } from "lucide-react";
import type { TiyaGroupConflict } from "@/app/lib/ecosystem/planner/plannerConflictEngine";

type TiyaConflictInsightsProps = {
  conflicts: TiyaGroupConflict[];
};

const severityStyles: Record<TiyaGroupConflict["severity"], string> = {
  Low: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  Medium: "border-orange-300/20 bg-orange-400/10 text-orange-100",
  High: "border-rose-300/20 bg-rose-400/10 text-rose-100",
};

export default function TiyaConflictInsights({
  conflicts,
}: TiyaConflictInsightsProps) {
  const safeConflicts = Array.isArray(conflicts) ? conflicts : [];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
        <AlertTriangle size={15} />
        Preference conflict engine
      </div>
      <div className="mt-3 grid gap-3">
        {safeConflicts.map((conflict) => (
          <article
            key={conflict.id}
            className="rounded-2xl border border-white/10 bg-white/[0.06] p-3"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="text-sm font-black text-white">
                  {conflict.title}
                </h4>
                <p className="mt-1 text-xs font-semibold leading-5 text-white/70">
                  {conflict.detail}
                </p>
              </div>
              <span
                className={`w-fit rounded-full border px-2.5 py-1 text-[11px] font-black ${severityStyles[conflict.severity]}`}
              >
                {conflict.severity}
              </span>
            </div>
            <div className="mt-3 rounded-2xl border border-orange-300/15 bg-orange-500/10 p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-orange-100" />
                <p className="text-xs font-semibold leading-5 text-orange-50/90">
                  {conflict.compromiseSuggestion}
                </p>
              </div>
              <p className="mt-2 text-[11px] font-black uppercase tracking-[0.12em] text-white/50">
                Best fit: {conflict.bestFitScenario}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
