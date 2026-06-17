import { useMemo, useState } from "react";
import {
  Bookmark,
  BrainCircuit,
  Check,
  Eye,
  Sparkles,
  X,
} from "lucide-react";
import type {
  TiyaAIRecommendation,
  TiyaAIRecommendationCategory,
} from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaAIRecommendationRailProps = {
  recommendations: TiyaAIRecommendation[];
  appliedRecommendationIds?: string[];
  dismissedRecommendationIds?: string[];
  savedRecommendationIds?: string[];
  onApply?: (recommendation: TiyaAIRecommendation) => void;
  onDismiss?: (recommendationId: string) => void;
  onSave?: (recommendationId: string) => void;
};

const categories: Array<"All" | TiyaAIRecommendationCategory> = [
  "All",
  "Route",
  "Stay",
  "Transport",
  "Activities",
  "Budget",
  "Weather",
  "Risk",
  "Local Market",
  "Creator",
];

function recommendationCategoryLabel(category: "All" | TiyaAIRecommendationCategory) {
  return category === "Local Market" ? "Local Life" : category;
}

function formatCurrency(value: number) {
  const prefix = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${prefix}₹${Math.abs(value).toLocaleString("en-IN")}`;
}

function metricLabel(value: number, positiveLabel: string, negativeLabel = positiveLabel) {
  if (value === 0) return `${positiveLabel} 0`;
  return value > 0
    ? `${positiveLabel} +${value}`
    : `${negativeLabel} ${value}`;
}

export default function TiyaAIRecommendationRail({
  appliedRecommendationIds = [],
  dismissedRecommendationIds = [],
  recommendations,
  savedRecommendationIds = [],
  onApply,
  onDismiss,
  onSave,
}: TiyaAIRecommendationRailProps) {
  const safeRecommendations = useMemo(
    () => (Array.isArray(recommendations) ? recommendations : []),
    [recommendations]
  );
  const [activeCategory, setActiveCategory] = useState<
    "All" | TiyaAIRecommendationCategory
  >("All");
  const [showDismissed, setShowDismissed] = useState(false);
  const [previewId, setPreviewId] = useState<string | undefined>();
  const activeRecommendations = safeRecommendations.filter(
    (recommendation) =>
      showDismissed || !dismissedRecommendationIds.includes(recommendation.id)
  );
  const filteredRecommendations = activeRecommendations.filter(
    (recommendation) =>
      activeCategory === "All" || recommendation.category === activeCategory
  );
  const dismissedCount = safeRecommendations.filter((recommendation) =>
    dismissedRecommendationIds.includes(recommendation.id)
  ).length;
  const summary = useMemo(() => {
    const highPriority = safeRecommendations.filter(
      (recommendation) => recommendation.priority === "High"
    ).length;
    const saving = safeRecommendations
      .filter((recommendation) => recommendation.costImpact < 0)
      .reduce((total, recommendation) => total + Math.abs(recommendation.costImpact), 0);
    const comfortGain = safeRecommendations.reduce(
      (total, recommendation) => total + Math.max(0, recommendation.comfortImpact),
      0
    );
    const riskReduction = safeRecommendations.reduce(
      (total, recommendation) => total + Math.min(0, recommendation.riskImpact),
      0
    );
    const itineraryImpact = safeRecommendations.filter(
      (recommendation) => recommendation.itineraryImpact
    ).length;

    return { comfortGain, highPriority, itineraryImpact, riskReduction, saving };
  }, [safeRecommendations]);
  const fixFirst = safeRecommendations
    .filter((recommendation) => recommendation.priority === "High")
    .slice(0, 4);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 text-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
            <BrainCircuit size={15} />
            AI recommendation engine
          </div>
          <h2 className="mt-2 text-xl font-black text-white">
            Smart travel recommendations
          </h2>
          <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-white/62">
            AI found {safeRecommendations.length} recommendations across route,
            stays, transport, activities, budget, weather, risk and ecosystem signals.
          </p>
        </div>
        {dismissedCount ? (
          <button
            type="button"
            onClick={() => setShowDismissed((current) => !current)}
            className="min-h-10 rounded-full border border-white/10 bg-white/10 px-4 text-xs font-black text-white transition hover:bg-white/15"
          >
            {showDismissed ? "Hide dismissed" : `Dismissed ${dismissedCount}`}
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          ["Total recommendations", `${safeRecommendations.length}`],
          ["High priority", `${summary.highPriority}`],
          ["Potential saving", `₹${summary.saving.toLocaleString("en-IN")}`],
          ["Comfort gain", `+${summary.comfortGain}`],
          ["Risk reduction", `${summary.riskReduction}%`],
          ["Itinerary impact", `${summary.itineraryImpact} modules`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
              {label}
            </p>
            <p className="mt-1 text-lg font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-3xl border border-orange-300/20 bg-orange-400/10 p-4">
        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
          Fix First / Best Next Actions
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {fixFirst.map((recommendation, index) => (
            <button
              key={recommendation.id}
              type="button"
              onClick={() => setPreviewId(recommendation.id)}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 text-left transition hover:border-orange-200/30 hover:bg-white/15"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-400 text-xs font-black text-[#061839]">
                {index + 1}
              </span>
              <span className="text-sm font-black text-white">
                {recommendation.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`min-h-10 shrink-0 rounded-full border px-4 text-xs font-black transition ${
              activeCategory === category
                ? "border-cyan-200/40 bg-cyan-300/15 text-cyan-50"
                : "border-white/10 bg-white/10 text-white/65 hover:bg-white/15"
            }`}
          >
            {recommendationCategoryLabel(category)}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {filteredRecommendations.map((recommendation) => {
          const isApplied = appliedRecommendationIds.includes(recommendation.id);
          const isSaved = savedRecommendationIds.includes(recommendation.id);
          const isDismissed = dismissedRecommendationIds.includes(recommendation.id);
          const previewOpen = previewId === recommendation.id;

          return (
          <article
            key={recommendation.id}
            className={`rounded-3xl border p-4 ${
              isApplied
                ? "border-emerald-300/25 bg-emerald-400/10"
                : isSaved
                  ? "border-emerald-300/35 bg-emerald-400/12 shadow-[0_18px_52px_rgba(16,185,129,0.14)] ring-1 ring-emerald-300/16"
                  : isDismissed
                    ? "border-white/10 bg-white/[0.04] opacity-70"
                    : "border-white/10 bg-white/10"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100">
                    {recommendationCategoryLabel(recommendation.category)}
                  </span>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
                    recommendation.priority === "High"
                      ? "border-orange-300/25 bg-orange-400/10 text-orange-100"
                      : recommendation.priority === "Medium"
                        ? "border-yellow-300/20 bg-yellow-400/10 text-yellow-100"
                        : "border-white/10 bg-white/10 text-white/55"
                  }`}>
                    {recommendation.priority}
                  </span>
                  {isApplied ? (
                    <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-100">
                      Applied
                    </span>
                  ) : null}
                  {isSaved ? (
                    <span className="rounded-full border border-emerald-300/35 bg-emerald-400/16 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-100">
                      Bookmarked
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-3 text-lg font-black text-white">
                  {recommendation.title}
                </h3>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white">
                <Sparkles size={18} />
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/40">
                  Confidence
                </p>
                <p className="mt-1 text-sm font-black text-white">
                  {recommendation.confidenceScore}%
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/40">
                  Affected
                </p>
                <p className="mt-1 text-sm font-black text-white">
                  {recommendation.affectedDay}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/40">
                  Cost impact
                </p>
                <p className="mt-1 text-sm font-black text-white">
                  {formatCurrency(recommendation.costImpact)}
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm font-semibold leading-6 text-white/72">
              <span className="font-black text-white">Reason: </span>
              {recommendation.reason}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/62">
              <span className="font-black text-white">Impact: </span>
              {recommendation.impactSummary}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-cyan-100">
                {metricLabel(recommendation.experienceImpact, "Experience")}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-cyan-100">
                {metricLabel(recommendation.comfortImpact, "Comfort")}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-cyan-100">
                Risk {recommendation.riskImpact > 0 ? `+${recommendation.riskImpact}` : recommendation.riskImpact}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-cyan-100">
                Budget {recommendation.budgetImpact > 0 ? `+${recommendation.budgetImpact}` : recommendation.budgetImpact}
              </span>
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-[#061839]/55 p-3">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-cyan-100">
                Why AI Suggests This
              </p>
              <div className="mt-2 grid gap-1 text-xs font-semibold leading-5 text-white/62">
                <p>Traveller style: {recommendation.whyAiSuggestsThis.travellerStyle}</p>
                <p>Itinerary gap: {recommendation.whyAiSuggestsThis.itineraryGap}</p>
                <p>Budget fit: {recommendation.whyAiSuggestsThis.budgetFit}</p>
                <p>Route fit: {recommendation.whyAiSuggestsThis.routeFit}</p>
                {recommendation.whyAiSuggestsThis.weatherRiskFit ? (
                  <p>Weather/risk fit: {recommendation.whyAiSuggestsThis.weatherRiskFit}</p>
                ) : null}
              </div>
            </div>

            {isSaved ? (
              <div className="mt-3 rounded-2xl border border-emerald-300/22 bg-emerald-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100">
                Bookmarked inside My Trips
              </div>
            ) : null}

            {previewOpen ? (
              <div className="mt-3 rounded-2xl border border-orange-300/20 bg-orange-400/10 p-3">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-orange-100">
                  What Will Change
                </p>
                <div className="mt-2 grid gap-1 text-xs font-semibold leading-5 text-white/68">
                  <p>Day: {recommendation.whatWillChange.dayChange}</p>
                  {recommendation.whatWillChange.added?.length ? (
                    <p>Added: {recommendation.whatWillChange.added.join(", ")}</p>
                  ) : null}
                  {recommendation.whatWillChange.removed?.length ? (
                    <p>Removed: {recommendation.whatWillChange.removed.join(", ")}</p>
                  ) : null}
                  {recommendation.whatWillChange.updated?.length ? (
                    <p>Updated: {recommendation.whatWillChange.updated.join(", ")}</p>
                  ) : null}
                  <p>Cost impact: {recommendation.whatWillChange.costImpact}</p>
                  <p>Fatigue impact: {recommendation.whatWillChange.fatigueImpact}</p>
                  <p>Booking basket: {recommendation.whatWillChange.bookingBasketImpact}</p>
                </div>
              </div>
            ) : null}

            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={() =>
                  setPreviewId((current) =>
                    current === recommendation.id ? undefined : recommendation.id
                  )
                }
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/15"
              >
                <Eye size={14} />
                Preview
              </button>
              <button
                type="button"
                disabled={isApplied}
                onClick={() => onApply?.(recommendation)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-orange-500 px-3 text-xs font-black text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check size={14} />
                Apply
              </button>
              <button
                type="button"
                disabled={isDismissed}
                onClick={() => onDismiss?.(recommendation.id)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={14} />
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => onSave?.(recommendation.id)}
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-3 text-xs font-black transition ${
                  isSaved
                    ? "border-red-300/24 bg-red-400/12 text-red-50 hover:bg-red-400/18"
                    : "border-cyan-200/20 bg-cyan-300/10 text-cyan-50 hover:bg-cyan-300/15"
                }`}
              >
                <Bookmark size={14} />
                {isSaved ? "Remove Saved" : "Save"}
              </button>
            </div>
          </article>
          );
        })}
      </div>

      {!filteredRecommendations.length ? (
        <div className="mt-4 rounded-3xl border border-white/10 bg-white/10 p-5 text-sm font-semibold text-white/62">
          No recommendations in this category.
        </div>
      ) : null}
    </section>
  );
}
