"use client";

import { useMemo } from "react";
import { Gauge, Sparkles, UsersRound } from "lucide-react";
import { generatePlannerGroupConflicts } from "@/app/lib/ecosystem/planner/plannerConflictEngine";
import { generatePlannerGroupMembers } from "@/app/lib/ecosystem/planner/plannerGroupEngine";
import {
  generatePlannerGroupMoodInsights,
  generatePlannerGroupSuggestions,
} from "@/app/lib/ecosystem/planner/plannerGroupInsightEngine";
import { generatePlannerScenarios } from "@/app/lib/ecosystem/planner/plannerScenarioEngine";
import { generatePlannerTripVariants } from "@/app/lib/ecosystem/planner/plannerVariantEngine";
import type {
  TiyaGeneratedPlan,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaConflictInsights from "./TiyaConflictInsights";
import TiyaGroupMemberCard from "./TiyaGroupMemberCard";
import TiyaGroupVoting from "./TiyaGroupVoting";

type TiyaGroupPlannerProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  isGenerating?: boolean;
};

function InsightMeter({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
          {label}
        </p>
        <span className="text-sm font-black text-white">{score}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-orange-400"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function TiyaGroupPlanner({
  intent,
  plan,
  isGenerating = false,
}: TiyaGroupPlannerProps) {
  const members = useMemo(
    () => generatePlannerGroupMembers(intent, plan),
    [intent, plan]
  );
  const scenarios = useMemo(
    () => generatePlannerScenarios(intent, plan),
    [intent, plan]
  );
  const variants = useMemo(
    () => generatePlannerTripVariants(intent, plan),
    [intent, plan]
  );
  const conflicts = useMemo(
    () =>
      generatePlannerGroupConflicts({
        intent,
        members,
        scenarios,
        variants,
      }),
    [intent, members, scenarios, variants]
  );
  const moodInsights = useMemo(
    () => generatePlannerGroupMoodInsights({ members, conflicts }),
    [conflicts, members]
  );
  const suggestions = useMemo(
    () => generatePlannerGroupSuggestions({ intent, members, conflicts }),
    [conflicts, intent, members]
  );

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(249,115,22,0.18),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <UsersRound
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Collaborative group planner
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Group trip operating layer
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Simulate member preferences, group harmony, conflicts and votes
              for the current Tiya plan.
            </p>
          </div>
          <div className="rounded-2xl border border-orange-300/20 bg-orange-500/10 px-3 py-2 text-xs font-black text-orange-100">
            {members.length} mock members
          </div>
        </div>

        <div className="relative mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <InsightMeter
            label="Compatibility"
            score={moodInsights.groupCompatibilityScore}
          />
          <InsightMeter label="Harmony" score={moodInsights.tripHarmonyScore} />
          <InsightMeter
            label="Comfort"
            score={moodInsights.comfortBalance}
          />
          <InsightMeter
            label="Adventure"
            score={moodInsights.adventureBalance}
          />
          <InsightMeter
            label="Spending"
            score={moodInsights.spendingBalance}
          />
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-2">
          {members.map((member) => (
            <TiyaGroupMemberCard key={member.id} member={member} />
          ))}
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
          <TiyaConflictInsights conflicts={conflicts} />
          <TiyaGroupVoting />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <Sparkles size={15} />
            AI group suggestions
          </div>
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {suggestions.map((suggestion) => (
              <article
                key={suggestion.id}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-3"
              >
                <div className="flex items-start gap-2">
                  <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-orange-100" />
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {suggestion.title}
                    </h4>
                    <p className="mt-1 text-xs font-semibold leading-5 text-white/70">
                      {suggestion.detail}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
