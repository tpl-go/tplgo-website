"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, Clock3, DatabaseZap, Fingerprint, Sparkles } from "lucide-react";
import {
  buildPlannerMemoryProfile,
  loadPlannerMemoryProfile,
  TIYA_MEMORY_OBJECT_KEY,
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
  const memorySources = Array.isArray(profile?.memorySources)
    ? profile.memorySources
    : [];
  const smartRecommendations = Array.isArray(
    (profile as Partial<TiyaTravelMemoryProfile> & {
      smartRecommendations?: unknown;
    })?.smartRecommendations
  )
    ? ((profile as Partial<TiyaTravelMemoryProfile> & {
        smartRecommendations?: unknown[];
      }).smartRecommendations ?? [])
    : [];
  const memoryTimeline = Array.isArray(profile?.memoryTimeline)
    ? profile.memoryTimeline
    : [];
  const savedSignals = Array.isArray(
    (profile as Partial<TiyaTravelMemoryProfile> & { savedSignals?: unknown })?.savedSignals
  )
    ? ((profile as Partial<TiyaTravelMemoryProfile> & {
        savedSignals?: unknown[];
      }).savedSignals ?? [])
    : [];
  const savedSpotCounters =
    profile?.savedSpotCounters && typeof profile.savedSpotCounters === "object"
      ? profile.savedSpotCounters
      : {};
  const memoryImpact =
    profile?.memoryImpact && typeof profile.memoryImpact === "object"
      ? profile.memoryImpact
      : {};

  void smartRecommendations;
  void savedSignals;

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
              Tiya Travel Intelligence Memory Engine
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Builds a reusable Travel DNA profile from My Trips, saved
              itineraries, workspace bookmarks, Creator saves and Local Life saves.
            </p>
          </div>
          <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-100/70">
              Reusable Tiya Memory object
            </p>
            <p className="mt-1 text-xs font-black text-orange-100">
              {TIYA_MEMORY_OBJECT_KEY}
            </p>
            <p className="mt-1 text-[10px] font-bold text-orange-100/60">
              Legacy: {TIYA_MEMORY_PROFILE_KEY}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5">
        <div className="grid gap-3 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="grid gap-3">
            <TiyaTravelPersonality personality={personality} />
            <div className="rounded-3xl border border-cyan-300/14 bg-cyan-300/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                <Fingerprint size={15} />
                Travel DNA Profile
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  ["Stay Type", profile.preferredStayStyle],
                  ["Budget Style", profile.preferredBudgetTier],
                  ["Transport Style", profile.preferredTransport],
                  ["Activity Style", profile.preferredActivityStyle],
                  ["Destination Style", profile.preferredDestinationStyle],
                  ["Seasonal Preference", profile.seasonalPreference],
                ].map(([label, value], index) => (
                  <div key={`travel-dna-${label}-${index}`} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                      {label}
                    </p>
                    <p className="mt-1 text-xs font-black text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
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
                  ["Creator influence", `${profile.creatorInfluenceScore}%`],
                  ["Local Life influence", `${profile.localLifeInfluenceScore}%`],
                  ["Trips learned", `${profile.tripCount}`],
                ].map(([label, value], index) => (
                  <div
                    key={`preference-memory-${label}-${index}`}
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
                {[...favouriteDestinations, ...activityPattern].slice(0, 8).map((item, index) => (
                  <span
                    key={`memory-pattern-${item}-${index}`}
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

        <div className="grid gap-3 xl:grid-cols-[1fr_0.95fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <DatabaseZap size={15} />
              Memory Sources
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {memorySources.length ? (
                memorySources.map((source, index) => (
                  <div key={`${source.id || source.label || "memory-source"}-${index}`} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                      {source.label}
                    </p>
                    <p className="mt-1 text-lg font-black text-white">{source.count}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-white/62">
                      {source.detail}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-semibold text-white/62">
                  No memory sources yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-orange-300/18 bg-orange-400/10 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
              <Bookmark size={15} />
              Saved Spot Counters
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Object.entries(savedSpotCounters).map(([label, value], index) => (
                <div key={`saved-counter-${label}-${index}`} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-orange-100/62">
                    {label}
                  </p>
                  <p className="mt-1 text-lg font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Sparkles size={15} />
              Memory Impact Layer
            </div>
            <div className="mt-3 grid gap-2">
              {Object.entries(memoryImpact).map(([label, value], index) => (
                <div key={`memory-impact-${label}-${index}`} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    {label.replace(/([A-Z])/g, " $1")}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-white/72">
                    {String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Clock3 size={15} />
              Memory Timeline
            </div>
            <div className="mt-3 grid max-h-[320px] gap-2 overflow-y-auto pr-1">
              {memoryTimeline.length ? (
                memoryTimeline.map((item, index) => (
                  <div key={`${item.id || item.title || "memory-event"}-${index}`} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-black text-white">{item.title}</p>
                      <span className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-black text-cyan-100">
                        {item.type}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold leading-5 text-white/62">
                      {item.detail}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
                      {new Date(item.at).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-semibold text-white/62">
                  No memory events yet. Save trips, bookmarks, Creator spots or Local Life items to build memory.
                </p>
              )}
            </div>
          </div>
        </div>

        <TiyaRecommendationRail recommendations={recommendations} />
      </div>
    </section>
  );
}
