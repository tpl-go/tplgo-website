"use client";

import { Activity, BadgeIndianRupee, Route, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ReviewChangeCategory, ReviewChangeItem } from "./ReviewChangeItemCard";

type ReviewChangeSummaryCardProps = {
  changes: ReviewChangeItem[];
};

function countCategory(changes: ReviewChangeItem[], category: ReviewChangeCategory) {
  return changes.filter((change) => change.category === category).length;
}

export default function ReviewChangeSummaryCard({
  changes,
}: ReviewChangeSummaryCardProps) {
  const routeChanges = countCategory(changes, "Route");
  const stayChanges = countCategory(changes, "Stay");
  const transportChanges = countCategory(changes, "Transport");
  const activityChanges = countCategory(changes, "Activity");
  const budgetChanges = countCategory(changes, "Budget");
  const riskWeather = countCategory(changes, "Risk") + countCategory(changes, "Weather");
  const localCreator = countCategory(changes, "Local Life") + countCategory(changes, "Creator");
  const metrics: Array<{ icon: LucideIcon; label: string; value: number }> = [
    { icon: Sparkles, label: "Total Changes", value: changes.length },
    { icon: Route, label: "Route Changes", value: routeChanges },
    { icon: Activity, label: "Hotel / Stay Changes", value: stayChanges },
    { icon: Route, label: "Transport Changes", value: transportChanges },
    { icon: Activity, label: "Activity Changes", value: activityChanges },
    { icon: BadgeIndianRupee, label: "Budget Changes", value: budgetChanges },
    { icon: Sparkles, label: "Risk / Weather Fixes", value: riskWeather },
    { icon: Sparkles, label: "Local Life / Creator Changes", value: localCreator },
  ];

  return (
    <div className="grid gap-3 xl:grid-cols-8">
      {metrics.map(({ icon: MetricIcon, label, value }) => {
        return (
          <article
            key={label}
            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)]"
          >
            <MetricIcon size={18} className="text-[#4f46e5]" />
            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
          </article>
        );
      })}
    </div>
  );
}
