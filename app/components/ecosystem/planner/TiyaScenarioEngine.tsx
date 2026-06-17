"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  GitMerge,
  Layers3,
  Route,
  Sparkles,
} from "lucide-react";
import {
  generatePlannerScenarios,
  type TiyaRouteScenario,
  type TiyaScenarioId,
} from "@/app/lib/ecosystem/planner/plannerScenarioEngine";
import type {
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaScenarioCompare from "./TiyaScenarioCompare";

type TiyaScenarioEngineProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  selectedScenarioId?: TiyaScenarioId;
  isGenerating?: boolean;
  onScenarioSelect?: (scenario: TiyaRouteScenario) => void;
  onScenarioMerge?: (scenario: TiyaRouteScenario) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(value);
}

function ScoreChip({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-orange-400"
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-xs font-black text-white">{score}</span>
      </div>
    </div>
  );
}

function routeLabel(routeId?: TiyaRouteOption["id"]) {
  if (!routeId) return "Scenario profile";
  return `${routeId.charAt(0).toUpperCase()}${routeId.slice(1)} route`;
}

export default function TiyaScenarioEngine({
  intent,
  plan,
  selectedScenarioId,
  isGenerating = false,
  onScenarioSelect,
  onScenarioMerge,
}: TiyaScenarioEngineProps) {
  const scenarios = useMemo(
    () => generatePlannerScenarios(intent, plan),
    [intent, plan]
  );
  const recommendedScenario = scenarios.find((scenario) => scenario.isRecommended);
  const [internalSelectedScenarioId, setInternalSelectedScenarioId] =
    useState<TiyaScenarioId>(recommendedScenario?.id ?? "scenic");
  const [showCompare, setShowCompare] = useState(false);
  const [duplicatedScenarioIds, setDuplicatedScenarioIds] = useState<
    TiyaScenarioId[]
  >([]);
  const activeScenarioId = selectedScenarioId ?? internalSelectedScenarioId;

  function selectScenario(scenario: TiyaRouteScenario) {
    setInternalSelectedScenarioId(scenario.id);
    onScenarioSelect?.(scenario);
  }

  function duplicateScenario(scenarioId: TiyaScenarioId) {
    setDuplicatedScenarioIds((current) =>
      current.includes(scenarioId) ? current : [...current, scenarioId]
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(59,130,246,0.2),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(249,115,22,0.18),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <Layers3
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Multi-route scenario engine
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Compare planning outcomes
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Evaluate fastest, scenic, budget, luxury, family-safe and
              adventure planning profiles for the same trip intent.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedScenario ? (
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100">
                AI recommends {recommendedScenario.name}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setShowCompare((current) => !current)}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-white/15"
            >
              Compare scenarios
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5 lg:grid-cols-2">
        {scenarios.map((scenario) => {
          const selected = activeScenarioId === scenario.id;
          const duplicated = duplicatedScenarioIds.includes(scenario.id);

          return (
            <article
              key={scenario.id}
              className={`rounded-3xl border p-3 transition-all duration-300 sm:p-4 ${
                selected
                  ? "border-orange-300/50 bg-orange-500/10 shadow-[0_16px_44px_rgba(249,115,22,0.18)]"
                  : "border-white/10 bg-white/[0.08] hover:bg-white/10"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        selected ? "bg-orange-500" : "bg-white/10"
                      }`}
                    >
                      <Route size={19} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-black text-white">
                        {scenario.name}
                      </h3>
                      <p className="mt-0.5 text-xs font-bold text-white/60">
                        {routeLabel(scenario.appliesRouteId)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {scenario.isRecommended ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-300/15 px-2.5 py-1 text-[11px] font-black text-cyan-100">
                      <Sparkles size={12} />
                      AI recommendation
                    </span>
                  ) : null}
                  {duplicated ? (
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-black text-white/75">
                      Duplicate ready
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    Duration
                  </p>
                  <p className="mt-1 text-sm font-black text-white">
                    {scenario.estimatedDuration}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    Cost
                  </p>
                  <p className="mt-1 text-sm font-black text-white">
                    {formatCurrency(scenario.estimatedCost)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    Best for
                  </p>
                  <p className="mt-1 truncate text-sm font-black text-white">
                    {scenario.bestFor}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <ScoreChip label="Comfort" score={scenario.comfortScore} />
                <ScoreChip label="Scenic" score={scenario.scenicScore} />
                <ScoreChip
                  label="Difficulty"
                  score={scenario.difficultyScore}
                />
                <ScoreChip label="Safety" score={scenario.safetyScore} />
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-xs font-semibold leading-5 text-white/70">
                  {scenario.routeSummary}
                </p>
                <p className="mt-2 text-xs font-bold leading-5 text-orange-100/90">
                  Trade-off: {scenario.tradeOffNote}
                </p>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => selectScenario(scenario)}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-black transition ${
                    selected
                      ? "bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] text-white shadow-[0_12px_28px_rgba(255,123,0,0.28)]"
                      : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
                  {selected ? <CheckCircle2 size={15} /> : <Route size={15} />}
                  {selected ? "Selected" : "Select scenario"}
                </button>
                <button
                  type="button"
                  onClick={() => duplicateScenario(scenario.id)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-white/15"
                >
                  <Copy size={15} />
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => onScenarioMerge?.(scenario)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-white/15"
                >
                  <GitMerge size={15} />
                  Merge highlights
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {showCompare ? (
        <div className="border-t border-white/10 p-3 sm:p-5">
          <TiyaScenarioCompare
            scenarios={scenarios}
            selectedScenarioId={activeScenarioId}
          />
        </div>
      ) : null}
    </section>
  );
}
