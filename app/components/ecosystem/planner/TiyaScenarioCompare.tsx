"use client";

import { BarChart3 } from "lucide-react";
import type { TiyaRouteScenario } from "@/app/lib/ecosystem/planner/plannerScenarioEngine";

type TiyaScenarioCompareProps = {
  scenarios: TiyaRouteScenario[];
  selectedScenarioId?: string;
};

function CompareMeter({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
        <span>{label}</span>
        <span className="text-white/80">{score}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-orange-400"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function TiyaScenarioCompare({
  scenarios,
  selectedScenarioId,
}: TiyaScenarioCompareProps) {
  const safeScenarios = Array.isArray(scenarios) ? scenarios : [];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
        <BarChart3 size={15} />
        Scenario comparison
      </div>
      <div className="mt-3 grid gap-2 lg:grid-cols-3">
        {safeScenarios.map((scenario) => {
          const selected = selectedScenarioId === scenario.id;

          return (
            <div
              key={`compare-${scenario.id}`}
              className={`rounded-2xl border p-3 transition ${
                selected
                  ? "border-orange-300/50 bg-orange-500/10"
                  : "border-white/10 bg-white/[0.06]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-black text-white">
                    {scenario.name}
                  </h4>
                  <p className="mt-1 text-[11px] font-bold text-white/50">
                    {scenario.estimatedDuration} · ₹
                    {scenario.estimatedCost.toLocaleString("en-IN")}
                  </p>
                </div>
                {scenario.isRecommended ? (
                  <span className="rounded-full bg-cyan-300/15 px-2 py-1 text-[10px] font-black text-cyan-100">
                    AI pick
                  </span>
                ) : null}
              </div>

              <div className="mt-3 grid gap-2">
                <CompareMeter label="Comfort" score={scenario.comfortScore} />
                <CompareMeter label="Scenic" score={scenario.scenicScore} />
                <CompareMeter
                  label="Difficulty"
                  score={scenario.difficultyScore}
                />
                <CompareMeter label="Safety" score={scenario.safetyScore} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
