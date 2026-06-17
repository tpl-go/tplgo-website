"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BadgeIndianRupee,
  BedDouble,
  Bus,
  CheckCircle2,
  Plus,
  Route,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
  UsersRound,
  Vote,
} from "lucide-react";
import type {
  TiyaGeneratedPlan,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";

export type TiyaGroupTravellerType = "Adult" | "Child" | "Senior";
export type TiyaGroupPreference =
  | "Comfort"
  | "Adventure"
  | "Food"
  | "Culture"
  | "Shopping"
  | "Spiritual"
  | "Luxury"
  | "Budget";

export type TiyaGroupTraveller = {
  id: string;
  name: string;
  type: TiyaGroupTravellerType;
  preferences: TiyaGroupPreference[];
};

export type TiyaGroupDecision = {
  id: string;
  title: string;
  summary: string;
  harmonyScore: number;
  travellers: TiyaGroupTraveller[];
  winningVotes: Record<string, string>;
  conflicts: string[];
  recommendations: string[];
  impact: {
    comfort: number;
    budget: number;
    risk: number;
    experience: number;
    localLife: number;
    creator: number;
  };
};

type TiyaGroupPlannerProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  isGenerating?: boolean;
  savedDecisionIds?: string[];
  appliedDecisionIds?: string[];
  onGroupDecisionAction?: (
    action: "save" | "remove" | "apply",
    decision: TiyaGroupDecision
  ) => void;
};

const preferenceOptions: TiyaGroupPreference[] = [
  "Comfort",
  "Adventure",
  "Food",
  "Culture",
  "Shopping",
  "Spiritual",
  "Luxury",
  "Budget",
];

const voteCategories = [
  {
    id: "route",
    label: "Route",
    icon: Route,
    options: ["Fastest", "Scenic", "Comfort", "Budget"],
  },
  {
    id: "stay",
    label: "Stay Type",
    icon: BedDouble,
    options: ["Hotel", "Homestay", "Premium Stay", "Budget Stay"],
  },
  {
    id: "transport",
    label: "Transport",
    icon: Bus,
    options: ["Cab", "Self-drive", "Train + Cab", "Flight + Cab"],
  },
  {
    id: "activities",
    label: "Activities",
    icon: Activity,
    options: ["Culture", "Food", "Adventure", "Local Life"],
  },
];

function seedTravellers(intent: TiyaTripIntent): TiyaGroupTraveller[] {
  const travellers: TiyaGroupTraveller[] = [];
  const adultCount = Math.max(1, intent.adults || 1);
  const childCount = Math.max(0, intent.children || 0);
  const seniorCount = Math.max(0, intent.seniors || 0);

  for (let index = 0; index < adultCount; index += 1) {
    travellers.push({
      id: `adult-${index + 1}`,
      name: index === 0 ? "Trip Lead" : `Adult ${index + 1}`,
      type: "Adult",
      preferences: [
        intent.travelStyle === "Adventure" ? "Adventure" : "Comfort",
        intent.budgetTier === "Economy" ? "Budget" : "Culture",
        ...(intent.interests.includes("Food") ? ["Food" as const] : []),
      ],
    });
  }
  for (let index = 0; index < childCount; index += 1) {
    travellers.push({
      id: `child-${index + 1}`,
      name: `Child ${index + 1}`,
      type: "Child",
      preferences: ["Comfort", "Food"],
    });
  }
  for (let index = 0; index < seniorCount; index += 1) {
    travellers.push({
      id: `senior-${index + 1}`,
      name: `Senior ${index + 1}`,
      type: "Senior",
      preferences: ["Comfort", "Spiritual"],
    });
  }

  return travellers.slice(0, 8);
}

function preferenceScore(travellers: TiyaGroupTraveller[], preference: TiyaGroupPreference) {
  if (!travellers.length) return 0;
  return Math.round(
    (travellers.filter((traveller) => traveller.preferences.includes(preference)).length /
      travellers.length) *
      100
  );
}

function detectConflicts(travellers: TiyaGroupTraveller[]) {
  const conflicts: string[] = [];
  const adventure = preferenceScore(travellers, "Adventure");
  const comfort = preferenceScore(travellers, "Comfort");
  const budget = preferenceScore(travellers, "Budget");
  const luxury = preferenceScore(travellers, "Luxury");
  const seniors = travellers.filter((traveller) => traveller.type === "Senior").length;
  const children = travellers.filter((traveller) => traveller.type === "Child").length;

  if (adventure >= 35 && comfort >= 45) {
    conflicts.push("Adventure pace conflicts with comfort-first travellers.");
  }
  if (budget >= 35 && luxury >= 25) {
    conflicts.push("Budget and luxury expectations need a blended stay plan.");
  }
  if (seniors > 0 && adventure >= 35) {
    conflicts.push("Senior comfort requires softer transfer and recovery windows.");
  }
  if (children > 0 && travellers.some((traveller) => traveller.preferences.includes("Spiritual"))) {
    conflicts.push("Child-friendly pacing should be balanced with spiritual/culture stops.");
  }

  return conflicts.length ? conflicts : ["No major group conflict detected."];
}

function defaultVotes(travellers: TiyaGroupTraveller[]) {
  const votes: Record<string, Record<string, string>> = {};

  travellers.forEach((traveller) => {
    votes[traveller.id] = {
      route: traveller.preferences.includes("Budget")
        ? "Budget"
        : traveller.preferences.includes("Adventure")
          ? "Scenic"
          : "Comfort",
      stay: traveller.preferences.includes("Luxury")
        ? "Premium Stay"
        : traveller.preferences.includes("Budget")
          ? "Budget Stay"
          : "Hotel",
      transport: traveller.type === "Senior" ? "Cab" : "Flight + Cab",
      activities: traveller.preferences.includes("Food")
        ? "Food"
        : traveller.preferences.includes("Adventure")
          ? "Adventure"
          : traveller.preferences.includes("Shopping")
            ? "Local Life"
            : "Culture",
    };
  });

  return votes;
}

function winningVotes(votes: Record<string, Record<string, string>>) {
  const winners: Record<string, string> = {};

  voteCategories.forEach((category) => {
    const tally = new Map<string, number>();
    Object.values(votes).forEach((travellerVotes) => {
      const value = travellerVotes[category.id];
      if (!value) return;
      tally.set(value, (tally.get(value) || 0) + 1);
    });
    winners[category.id] =
      [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ||
      category.options[0];
  });

  return winners;
}

function buildRecommendations({
  conflicts,
  travellers,
  winners,
}: {
  conflicts: string[];
  travellers: TiyaGroupTraveller[];
  winners: Record<string, string>;
}) {
  const comfort = preferenceScore(travellers, "Comfort");
  const localLife = preferenceScore(travellers, "Shopping");
  const creator = preferenceScore(travellers, "Culture") + preferenceScore(travellers, "Food");

  return [
    comfort >= 45 ? "Add recovery windows after long transfers." : "Keep activity density balanced.",
    winners.route === "Scenic" ? "Use scenic route only with daylight movement." : `Route vote favours ${winners.route}.`,
    winners.stay.includes("Budget") ? "Blend one value stay with a comfort stay." : `Stay vote favours ${winners.stay}.`,
    localLife >= 20 ? "Add one Local Life stop near food or shopping flow." : "Keep Local Life optional.",
    creator >= 60 ? "Add creator-friendly food/culture window." : "Creator stop can remain optional.",
    conflicts[0] === "No major group conflict detected."
      ? "Tiya can generate a balanced itinerary with current preferences."
      : "Resolve top conflict before final itinerary generation.",
  ];
}

function buildDecision(
  travellers: TiyaGroupTraveller[],
  votes: Record<string, Record<string, string>>
): TiyaGroupDecision {
  const conflicts = detectConflicts(travellers);
  const winners = winningVotes(votes);
  const comfort = preferenceScore(travellers, "Comfort");
  const adventure = preferenceScore(travellers, "Adventure");
  const budget = preferenceScore(travellers, "Budget");
  const localLife = preferenceScore(travellers, "Shopping");
  const creator = Math.round(
    (preferenceScore(travellers, "Culture") + preferenceScore(travellers, "Food")) / 2
  );
  const harmonyScore = Math.max(
    42,
    Math.min(96, 88 - Math.max(0, conflicts.length - 1) * 12 + Math.round(comfort / 10))
  );
  const recommendations = buildRecommendations({ conflicts, travellers, winners });

  return {
    id: `group-decision-${travellers.length}-${Object.values(winners).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    title: "Balanced Group Itinerary Decision",
    summary: `${travellers.length} travellers aligned around ${winners.route} route, ${winners.stay} stay and ${winners.activities} activities.`,
    harmonyScore,
    travellers,
    winningVotes: winners,
    conflicts,
    recommendations,
    impact: {
      comfort: Math.round(comfort / 8),
      budget: budget >= 35 ? -1800 : winners.stay.includes("Premium") ? 2200 : 600,
      risk: conflicts.some((conflict) => conflict.includes("Senior")) ? -10 : -4,
      experience: Math.round((adventure + creator) / 10),
      localLife: Math.round(localLife / 5),
      creator: Math.round(creator / 5),
    },
  };
}

function InsightMeter({ label, score }: { label: string; score: number }) {
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
  isGenerating = false,
  savedDecisionIds = [],
  appliedDecisionIds = [],
  onGroupDecisionAction,
}: TiyaGroupPlannerProps) {
  const [travellers, setTravellers] = useState<TiyaGroupTraveller[]>(() =>
    seedTravellers(intent)
  );
  const [votes, setVotes] = useState<Record<string, Record<string, string>>>(() =>
    defaultVotes(seedTravellers(intent))
  );
  const decision = useMemo(() => buildDecision(travellers, votes), [travellers, votes]);
  const saved = savedDecisionIds.includes(decision.id);
  const applied = appliedDecisionIds.includes(decision.id);

  function addTraveller() {
    const nextTraveller: TiyaGroupTraveller = {
      id: `traveller-${Date.now()}`,
      name: `Traveller ${travellers.length + 1}`,
      type: "Adult",
      preferences: ["Comfort"],
    };
    setTravellers((current) => [...current, nextTraveller]);
    setVotes((current) => ({
      ...current,
      [nextTraveller.id]: defaultVotes([nextTraveller])[nextTraveller.id],
    }));
  }

  function updateTraveller(nextTraveller: TiyaGroupTraveller) {
    setTravellers((current) =>
      current.map((traveller) =>
        traveller.id === nextTraveller.id ? nextTraveller : traveller
      )
    );
  }

  function removeTraveller(travellerId: string) {
    setTravellers((current) => current.filter((traveller) => traveller.id !== travellerId));
    setVotes((current) => {
      const next = { ...current };
      delete next[travellerId];
      return next;
    });
  }

  function updateVote(travellerId: string, categoryId: string, value: string) {
    setVotes((current) => ({
      ...current,
      [travellerId]: {
        ...(current[travellerId] || {}),
        [categoryId]: value,
      },
    }));
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.24)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(249,115,22,0.18),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <UsersRound size={15} className={isGenerating ? "animate-pulse" : undefined} />
              Multi-Traveller Decision Engine
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Group Planning
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Manage real travellers, detect preference conflicts, collect votes
              and let Tiya generate a balanced itinerary decision for the whole group.
            </p>
          </div>
          <div className="rounded-2xl border border-orange-300/20 bg-orange-500/10 px-3 py-2 text-xs font-black text-orange-100">
            {travellers.length} traveller{travellers.length === 1 ? "" : "s"} · Harmony {decision.harmonyScore}%
          </div>
        </div>

        <div className="relative mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <InsightMeter label="Group Harmony" score={decision.harmonyScore} />
          <InsightMeter label="Comfort" score={preferenceScore(travellers, "Comfort")} />
          <InsightMeter label="Adventure" score={preferenceScore(travellers, "Adventure")} />
          <InsightMeter label="Food/Culture" score={Math.round((preferenceScore(travellers, "Food") + preferenceScore(travellers, "Culture")) / 2)} />
          <InsightMeter label="Budget/Luxury" score={Math.round((preferenceScore(travellers, "Budget") + preferenceScore(travellers, "Luxury")) / 2)} />
        </div>
      </div>

      <div className="grid gap-4 p-3 sm:p-5">
        <section className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Traveller Management
              </p>
              <h3 className="mt-1 text-lg font-black text-white">Add Traveller</h3>
            </div>
            <button
              type="button"
              onClick={addTraveller}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-orange-500 px-4 text-xs font-black text-white transition hover:bg-orange-400"
            >
              <Plus size={15} />
              Add Traveller
            </button>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {travellers.map((traveller) => (
              <article key={traveller.id} className="rounded-3xl border border-white/10 bg-white/10 p-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                  <div className="min-w-0">
                    <input
                      value={traveller.name}
                      onChange={(event) =>
                        updateTraveller({ ...traveller, name: event.target.value })
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-black text-white outline-none focus:border-orange-300/45"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(["Adult", "Child", "Senior"] as TiyaGroupTravellerType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => updateTraveller({ ...traveller, type })}
                          className={`rounded-full border px-3 py-1.5 text-[11px] font-black ${
                            traveller.type === type
                              ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-50"
                              : "border-white/10 bg-white/10 text-white/62"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTraveller(traveller.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-300/20 bg-red-400/10 text-red-100"
                    aria-label={`Remove ${traveller.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {preferenceOptions.map((preference) => {
                    const active = traveller.preferences.includes(preference);
                    return (
                      <button
                        key={preference}
                        type="button"
                        onClick={() =>
                          updateTraveller({
                            ...traveller,
                            preferences: active
                              ? traveller.preferences.filter((item) => item !== preference)
                              : [...traveller.preferences, preference],
                          })
                        }
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${
                          active
                            ? "border-orange-300/40 bg-orange-400/15 text-orange-50"
                            : "border-white/10 bg-white/10 text-white/55"
                        }`}
                      >
                        {preference}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Vote size={15} />
              Voting System
            </div>
            <div className="mt-3 grid gap-3">
              {voteCategories.map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <div key={category.id} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                    <div className="flex items-center gap-2 text-sm font-black text-white">
                      <CategoryIcon size={15} />
                      {category.label}
                      <span className="ml-auto rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-100">
                        Winner: {decision.winningVotes[category.id]}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {travellers.map((traveller) => (
                        <div key={`${category.id}-${traveller.id}`} className="grid gap-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/42">
                            {traveller.name}
                          </p>
                          <select
                            value={votes[traveller.id]?.[category.id] || category.options[0]}
                            onChange={(event) =>
                              updateVote(traveller.id, category.id, event.target.value)
                            }
                            className="min-h-10 rounded-2xl border border-white/10 bg-[#071329] px-3 text-xs font-black text-white outline-none"
                          >
                            {category.options.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-orange-300/18 bg-orange-400/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
                <ShieldAlert size={15} />
                Conflict Detection Engine
              </div>
              <div className="mt-3 grid gap-2">
                {decision.conflicts.map((conflict) => (
                  <p key={conflict} className="rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-semibold leading-5 text-orange-50/82">
                    {conflict}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-300/14 bg-cyan-300/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                <Sparkles size={15} />
                AI Resolution Suggestions
              </div>
              <div className="mt-3 grid gap-2">
                {decision.recommendations.map((recommendation) => (
                  <p key={recommendation} className="rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-semibold leading-5 text-cyan-50/78">
                    {recommendation}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                Group Preference Summary
              </p>
              <h3 className="mt-1 break-words text-lg font-black text-white">
                {decision.summary}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black text-white/70">
                <span className="rounded-full bg-white/10 px-3 py-1.5">Comfort {decision.impact.comfort > 0 ? "+" : ""}{decision.impact.comfort}</span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">Budget {decision.impact.budget > 0 ? "+" : ""}₹{Math.abs(decision.impact.budget).toLocaleString("en-IN")}</span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">Risk {decision.impact.risk}</span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">Experience +{decision.impact.experience}</span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">Local Life +{decision.impact.localLife}</span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">Creator +{decision.impact.creator}</span>
              </div>
            </div>
            <div className="grid shrink-0 gap-2 sm:grid-cols-3 lg:min-w-[360px]">
              <button
                type="button"
                onClick={() => onGroupDecisionAction?.(saved ? "remove" : "save", decision)}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-xs font-black ${
                  saved
                    ? "border-red-300/24 bg-red-400/12 text-red-50"
                    : "border-cyan-300/18 bg-cyan-300/10 text-cyan-50"
                }`}
              >
                <Save size={14} />
                {saved ? "Remove Saved" : "Save To My Trip"}
              </button>
              <button
                type="button"
                disabled={applied}
                onClick={() => onGroupDecisionAction?.("apply", decision)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-orange-500 px-4 text-xs font-black text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-emerald-500/30 disabled:text-emerald-50"
              >
                <CheckCircle2 size={14} />
                {applied ? "Synced" : "Sync Itinerary"}
              </button>
              <button
                type="button"
                disabled={applied}
                onClick={() => onGroupDecisionAction?.("apply", decision)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 text-xs font-black text-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <BadgeIndianRupee size={14} />
                Apply Balance
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
