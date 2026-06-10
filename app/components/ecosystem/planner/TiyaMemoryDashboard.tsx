"use client";

import { useEffect, useMemo, useState } from "react";
import { DatabaseZap, Sparkles } from "lucide-react";
import {
  buildPlannerMemoryProfile,
  loadPlannerMemoryProfile,
  TIYA_MEMORY_PROFILE_KEY,
  type TiyaTravelMemoryProfile,
} from "@/app/lib/ecosystem/planner/plannerMemoryEngine";
import {
  generateMemoryRecommendations,
  generateTripContinuitySuggestions,
} from "@/app/lib/ecosystem/planner/plannerRecommendationMemory";
import {
  generateHabitMetrics,
  generateRepeatTravellerInsights,
  generateTravelPersonality,
} from "@/app/lib/ecosystem/planner/plannerTravelPersonalityEngine";
import type { TiyaTripIntent } from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaHabitInsights from "./TiyaHabitInsights";
import TiyaRecommendationRail from "./TiyaRecommendationRail";
import TiyaTravelPersonality from "./TiyaTravelPersonality";

type TiyaMemoryDashboardProps = {
  intent: TiyaTripIntent;
  isGenerating?: boolean;
};

export default function TiyaMemoryDashboard({
  intent,
  isGenerating = false,
}: TiyaMemoryDashboardProps) {
  const [profile, setProfile] = useState<TiyaTravelMemoryProfile>(() =>
    loadPlannerMemoryProfile(intent)
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProfile(buildPlannerMemoryProfile(intent));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [intent]);

  const personality = useMemo(
    () => generateTravelPersonality(profile),
    [profile]
  );
  const metrics = useMemo(() => generateHabitMetrics(profile), [profile]);
  const insights = useMemo(
    () => generateRepeatTravellerInsights(profile),
    [profile]
  );
  const recommendations = useMemo(
    () => generateMemoryRecommendations({ intent, profile }),
    [intent, profile]
  );
  const continuity = useMemo(
    () => generateTripContinuitySuggestions({ intent, profile }),
    [intent, profile]
  );
  const favouriteDestinations = Array.isArray(profile.favouriteDestinations)
    ? profile.favouriteDestinations
    : [];
  const activityPattern = Array.isArray(profile.activityPreferencePattern)
    ? profile.activityPreferencePattern
    : [];

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_90%_14%,rgba(249,115,22,0.2),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <DatabaseZap
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Smart memory and recommendation engine
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Tiya travel memory simulation
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Simulates preference learning from local planner intent and saved
              drafts. No backend, database, analytics service or real AI memory.
            </p>
          </div>
          <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-100/70">
              Local memory key
            </p>
            <p className="mt-1 text-xs font-black text-orange-100">
              {TIYA_MEMORY_PROFILE_KEY}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5">
        <div className="grid gap-3 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="grid gap-3">
            <TiyaTravelPersonality personality={personality} />
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                <Sparkles size={15} />
                Preference memory
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  ["Transport", profile.preferredTransport],
                  ["Stay", profile.preferredStayStyle],
                  ["Budget", profile.preferredBudgetTier],
                  ["Season", profile.seasonalPreference],
                  ["Creator/market interest", `${profile.creatorLocalMarketInterest}%`],
                  ["Trips learned", `${profile.tripCount}`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/10 p-3"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                      {label}
                    </p>
                    <p className="mt-1 text-xs font-black text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[...favouriteDestinations, ...activityPattern].slice(0, 8).map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <TiyaHabitInsights
            metrics={metrics}
            insights={insights}
            continuity={continuity}
          />
        </div>

        <TiyaRecommendationRail recommendations={recommendations} />
      </div>
    </section>
  );
}
