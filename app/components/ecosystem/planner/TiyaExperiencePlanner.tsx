"use client";

import { useMemo, useState } from "react";
import { Clapperboard, Sparkles } from "lucide-react";
import { generatePlannerActivityBalance } from "@/app/lib/ecosystem/planner/plannerActivityBalanceEngine";
import {
  generatePlannerExperiences,
  type TiyaExperienceCategory,
} from "@/app/lib/ecosystem/planner/plannerExperienceEngine";
import type {
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaActivityBalance from "./TiyaActivityBalance";
import TiyaExperienceCard from "./TiyaExperienceCard";

type TiyaExperiencePlannerProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  days: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
  selectedScenarioId?: string;
  selectedVariantId?: string;
  isGenerating?: boolean;
};

const categories: Array<"All" | TiyaExperienceCategory> = [
  "All",
  "Food trails",
  "Culture walks",
  "Nature spots",
  "Adventure activities",
  "Spiritual stops",
  "Shopping/local market",
  "Nightlife",
  "Creator photo/video spots",
  "Family-friendly activities",
  "Luxury experiences",
];

export default function TiyaExperiencePlanner({
  intent,
  plan,
  days,
  selectedRoute,
  selectedScenarioId,
  selectedVariantId,
  isGenerating = false,
}: TiyaExperiencePlannerProps) {
  const [activeCategory, setActiveCategory] =
    useState<(typeof categories)[number]>("All");
  const [addedExperienceIds, setAddedExperienceIds] = useState<string[]>([]);
  const experiences = useMemo(
    () =>
      generatePlannerExperiences({
        intent,
        plan,
        days,
        selectedRoute,
        selectedScenarioId,
        selectedVariantId,
      }),
    [days, intent, plan, selectedRoute, selectedScenarioId, selectedVariantId]
  );
  const safeExperiences = useMemo(
    () => (Array.isArray(experiences) ? experiences : []),
    [experiences]
  );
  const filteredExperiences =
    activeCategory === "All"
      ? safeExperiences
      : safeExperiences.filter(
          (experience) => experience.category === activeCategory
        );
  const balanceInsights = useMemo(
    () => generatePlannerActivityBalance({ intent, days, experiences: safeExperiences }),
    [days, safeExperiences, intent]
  );
  const highlightedCount = safeExperiences.filter(
    (experience) => experience.isHighlighted
  ).length;

  function addExperience(experienceId: string) {
    setAddedExperienceIds((current) =>
      current.includes(experienceId) ? current : [...current, experienceId]
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.2),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(249,115,22,0.18),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <Clapperboard
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Smart experience planner
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              AI activity marketplace
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Connect itinerary days, destination interests, creator spots,
              local market, food, culture, nature and booking-ready experiences.
            </p>
          </div>
          <div className="rounded-2xl border border-orange-300/20 bg-orange-500/10 px-3 py-2 text-xs font-black text-orange-100">
            {highlightedCount} high-fit experiences
          </div>
        </div>

        <div className="relative mt-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => {
            const selected = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-black transition ${
                  selected
                    ? "bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] text-white"
                    : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5">
        <TiyaActivityBalance insights={balanceInsights} />

        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {filteredExperiences.map((experience) => (
            <TiyaExperienceCard
              key={experience.id}
              experience={experience}
              isAdded={addedExperienceIds.includes(experience.id)}
              onAdd={addExperience}
            />
          ))}
        </div>

        {addedExperienceIds.length ? (
          <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-100">
              <Sparkles size={15} />
              Local add-to-day state
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
              {addedExperienceIds.length} experience
              {addedExperienceIds.length === 1 ? "" : "s"} marked for itinerary
              placement in this browser session.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
