"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, Clapperboard, PackageCheck, Sparkles, WalletCards } from "lucide-react";
import { generatePlannerActivityBalance } from "@/app/lib/ecosystem/planner/plannerActivityBalanceEngine";
import {
  generatePlannerExperiences,
  type TiyaExperience,
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
  onExperienceAction?: (action: {
    costImpact: number;
    detail: string;
    fatigueImpact: number;
    title: string;
    day: number;
  }) => void;
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
  onExperienceAction,
}: TiyaExperiencePlannerProps) {
  const [activeCategory, setActiveCategory] =
    useState<(typeof categories)[number]>("All");
  const [addedExperienceIds, setAddedExperienceIds] = useState<string[]>([]);
  const [previewExperienceId, setPreviewExperienceId] = useState<string>("");
  const [activityChangeLog, setActivityChangeLog] = useState<
    Array<{ id: string; title: string; day: number; cost: number; fatigue: number; at: string }>
  >([]);
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
  const selectedExperiences = safeExperiences.filter((experience) =>
    addedExperienceIds.includes(experience.id)
  );
  const estimatedActivityCost = selectedExperiences.reduce(
    (sum, experience) => sum + estimateExperienceCost(experience),
    0
  );
  const totalSuggestedCost = safeExperiences.reduce(
    (sum, experience) => sum + estimateExperienceCost(experience),
    0
  );
  const averageFatigue = selectedExperiences.length
    ? Math.round(
        selectedExperiences.reduce((sum, experience) => sum + experience.fatigueImpact, 0) /
          selectedExperiences.length
      )
    : Math.round(
        safeExperiences.reduce((sum, experience) => sum + experience.fatigueImpact, 0) /
          Math.max(1, safeExperiences.length)
      );
  const previewExperience = safeExperiences.find(
    (experience) => experience.id === previewExperienceId
  );

  function estimateExperienceCost(experience: TiyaExperience) {
    const travellers = Math.max(1, intent.adults + intent.children + intent.seniors);
    const base =
      experience.costBand === "Luxury"
        ? 5200
        : experience.costBand === "Premium"
          ? 3600
          : experience.costBand === "Medium"
            ? 1800
            : 900;

    return Math.round((base * travellers) / 100) * 100;
  }

  function conflictForExperience(experience: TiyaExperience): {
    status: "Safe" | "Warning" | "Conflict";
    text: string;
  } {
    const day = days.find((item) => item.day === experience.suggestedDay);
    const sameTime = day?.items?.some((item) => item.time === experience.bestTime);
    const overpacked = (day?.items?.length || 0) >= 5;
    const lateNight =
      /^\d{2}:\d{2}$/.test(experience.bestTime) &&
      Number(experience.bestTime.split(":")[0]) >= 21;
    const highFatigue = experience.fatigueImpact >= 72;
    const weatherRisk =
      selectedRoute?.riskLevel === "High" && experience.category === "Adventure activities";

    if (sameTime) return { status: "Conflict", text: "Overlapping time slot exists on this day." };
    if (overpacked || lateNight || highFatigue || weatherRisk) {
      return {
        status: "Warning",
        text: [
          overpacked ? "Day is already activity-heavy." : "",
          lateNight ? "Late-night timing needs review." : "",
          highFatigue ? "High fatigue activity." : "",
          weatherRisk ? "Route/weather risk may affect this activity." : "",
        ].filter(Boolean).join(" "),
      };
    }

    return { status: "Safe", text: "No conflict detected for the suggested day and slot." };
  }

  function saveActivityPayload(nextSelected: TiyaExperience[]) {
    if (typeof window === "undefined") return;

    const payload = {
      source: "smart-planner",
      destination: intent.toCity,
      dates: {
        startDate: intent.startDate,
        endDate: intent.endDate,
      },
      travellers: {
        adults: intent.adults,
        children: intent.children,
        seniors: intent.seniors,
        total: intent.adults + intent.children + intent.seniors,
      },
      selectedActivities: nextSelected.map((experience) => ({
        ...experience,
        estimatedCost: estimateExperienceCost(experience),
      })),
      activityInterests: intent.interests,
      itineraryContext: days,
      budgetContext: {
        activityEstimate: nextSelected.reduce(
          (sum, experience) => sum + estimateExperienceCost(experience),
          0
        ),
        totalEstimate: plan.totalBudget,
      },
    };

    window.sessionStorage.setItem("tpl_smart_planner_activity_search_v1", JSON.stringify(payload));
    window.sessionStorage.setItem(
      "tpl_tiya_checkout_v1",
      JSON.stringify({
        source: "smart-planner",
        trip: {
          origin: intent.fromCity,
          destination: intent.toCity,
          startDate: intent.startDate,
          endDate: intent.endDate,
          title: plan.title,
          totalDays: days.length,
        },
        itinerary: days,
        selectedActivities: payload.selectedActivities,
        budgetEstimate: payload.budgetContext,
        quoteEstimate: {
          estimatedTotal: plan.totalBudget + payload.budgetContext.activityEstimate,
        },
      })
    );
  }

  function addExperience(experienceId: string) {
    const experience = safeExperiences.find((item) => item.id === experienceId);
    if (!experience) return;

    setAddedExperienceIds((current) =>
      current.includes(experienceId) ? current : [...current, experienceId]
    );
    const nextSelected = safeExperiences.filter((item) =>
      item.id === experienceId || addedExperienceIds.includes(item.id)
    );
    saveActivityPayload(nextSelected);
    setActivityChangeLog((current) =>
      [
        {
          id: experience.id,
          title: `${experience.title} added to Day ${experience.suggestedDay}`,
          day: experience.suggestedDay,
          cost: estimateExperienceCost(experience),
          fatigue: Math.round(experience.fatigueImpact / 10),
          at: new Date().toISOString(),
        },
        ...current,
      ].slice(0, 5)
    );
    onExperienceAction?.({
      costImpact: estimateExperienceCost(experience),
      day: experience.suggestedDay,
      detail: `${experience.title} added to Day ${experience.suggestedDay} ${experience.bestTime}. Fatigue +${Math.round(experience.fatigueImpact / 10)}. Booking readiness and review payload updated.`,
      fatigueImpact: Math.round(experience.fatigueImpact / 10),
      title: "Activity Added",
    });
    setPreviewExperienceId("");
  }

  function removeExperience(experienceId: string) {
    const experience = safeExperiences.find((item) => item.id === experienceId);
    setAddedExperienceIds((current) => current.filter((item) => item !== experienceId));
    const nextSelected = safeExperiences.filter(
      (item) => item.id !== experienceId && addedExperienceIds.includes(item.id)
    );
    saveActivityPayload(nextSelected);
    if (experience) {
      setActivityChangeLog((current) =>
        [
          {
            id: `${experience.id}-removed`,
            title: `${experience.title} removed from Day ${experience.suggestedDay}`,
            day: experience.suggestedDay,
            cost: -estimateExperienceCost(experience),
            fatigue: -Math.round(experience.fatigueImpact / 10),
            at: new Date().toISOString(),
          },
          ...current,
        ].slice(0, 5)
      );
    }
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
              Local Life, food, culture, nature and booking-ready experiences.
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
        <div className="rounded-3xl border border-cyan-300/16 bg-cyan-300/10 p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <Sparkles size={15} />
            Activity Strategy Summary
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Destination", `${intent.toCity} Activity Plan`],
              ["Suggestions", `${safeExperiences.length}`],
              ["High-fit experiences", `${highlightedCount}`],
              ["Selected activities", `${selectedExperiences.length}`],
              ["Activity estimate", `₹${(estimatedActivityCost || totalSuggestedCost).toLocaleString("en-IN")}`],
              ["Fatigue", averageFatigue >= 70 ? "High" : averageFatigue >= 45 ? "Medium" : "Low"],
              ["Booking readiness", selectedExperiences.length ? "Ready" : "Recommended"],
              ["Route", selectedRoute?.name || "Planner route"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">{label}</p>
                <p className="mt-1 text-sm font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-orange-300/18 bg-orange-400/10 p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
            <WalletCards size={15} />
            Activity Basket Summary
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">Selected Activities</p>
              <p className="mt-1 text-lg font-black text-white">{selectedExperiences.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">Estimated Cost</p>
              <p className="mt-1 text-lg font-black text-white">₹{estimatedActivityCost.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">Fatigue</p>
              <p className="mt-1 text-lg font-black text-white">{averageFatigue >= 70 ? "High" : averageFatigue >= 45 ? "Medium" : "Low"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">Booking Ready</p>
              <p className="mt-1 text-lg font-black text-white">{selectedExperiences.length ? "Yes" : "Pending"}</p>
            </div>
          </div>
        </div>

        <TiyaActivityBalance insights={balanceInsights} />

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-100">
              <Sparkles size={15} />
              AI Activity Balance
            </div>
            <h3 className="mt-3 text-xl font-black text-white">Evening market + creator timing</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-emerald-50/78">
              Best after sightseeing and before fatigue begins. Sunset timing improves creator and scenic fit.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  const market = safeExperiences.find((experience) => experience.category === "Shopping/local market");
                  if (market) setPreviewExperienceId(market.id);
                }}
                className="min-h-10 rounded-full border border-emerald-300/24 bg-emerald-400/10 px-4 text-xs font-black text-emerald-100"
              >
                Apply Suggestion
              </button>
              <button
                type="button"
                onClick={() => {
                  const creator = safeExperiences.find((experience) => experience.category === "Creator photo/video spots");
                  if (creator) setPreviewExperienceId(creator.id);
                }}
                className="min-h-10 rounded-full border border-cyan-300/24 bg-cyan-300/10 px-4 text-xs font-black text-cyan-100"
              >
                Apply Timing
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
              <AlertTriangle size={15} />
              Add to Day Preview
            </div>
            {previewExperience ? (
              <div className="mt-3 grid gap-2 text-xs font-bold leading-5 text-white/72">
                <p>IF ADDED</p>
                <p>Day: Day {previewExperience.suggestedDay}</p>
                <p>Time: {previewExperience.bestTime} – {previewExperience.duration}</p>
                <p>Cost +₹{estimateExperienceCost(previewExperience).toLocaleString("en-IN")}</p>
                <p>Fatigue +{Math.round(previewExperience.fatigueImpact / 10)}</p>
                <p>Experience score +{Math.round(previewExperience.fitScore / 7)}</p>
                <p>Conflicts: {conflictForExperience(previewExperience).text}</p>
                <button
                  type="button"
                  onClick={() => addExperience(previewExperience.id)}
                  className="mt-2 min-h-10 rounded-full border border-orange-300/28 bg-orange-400/15 px-4 text-xs font-black text-orange-100 transition hover:bg-orange-400/20"
                >
                  Confirm Add to Day
                </button>
              </div>
            ) : (
              <p className="mt-3 text-sm font-semibold leading-6 text-white/62">
                Select Add to Day on an activity to preview day, time, cost, fatigue, conflicts and booking impact.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {filteredExperiences.map((experience) => {
            const conflict = conflictForExperience(experience);
            return (
              <TiyaExperienceCard
                key={experience.id}
                costEstimate={estimateExperienceCost(experience)}
                conflictStatus={conflict.status}
                conflictText={conflict.text}
                experience={experience}
                isAdded={addedExperienceIds.includes(experience.id)}
                onAdd={setPreviewExperienceId}
                onRemove={removeExperience}
              />
            );
          })}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <CalendarDays size={15} />
            Day-wise Activity Mapping
          </div>
          <div className="mt-3 grid gap-2">
            {days.map((day) => {
              const selectedForDay = selectedExperiences.filter(
                (experience) => experience.suggestedDay === day.day
              );
              return (
                <div key={day.id} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <p className="text-xs font-black text-white">Day {day.day}: {day.city}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-white/62">
                    {selectedForDay.length
                      ? selectedForDay.map((experience) => experience.title).join(" · ")
                      : "Missing: No evening activity selected"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <PackageCheck size={15} />
            Activity Change Log
          </div>
          {activityChangeLog.length ? (
            <div className="mt-3 grid gap-2">
              {activityChangeLog.map((entry) => (
                <div key={`${entry.id}-${entry.at}`} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <p className="text-sm font-black text-white">{entry.title}</p>
                  <p className="mt-1 text-xs font-semibold text-white/60">
                    Cost: {entry.cost >= 0 ? "+" : "-"}₹{Math.abs(entry.cost).toLocaleString("en-IN")} · Fatigue: {entry.fatigue >= 0 ? "+" : ""}{entry.fatigue}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
                    {new Date(entry.at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-2xl border border-white/10 bg-white/10 p-3 text-sm font-semibold text-white/58">
              No activity added, removed or changed yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
