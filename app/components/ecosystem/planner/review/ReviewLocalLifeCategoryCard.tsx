"use client";

import type { LucideIcon } from "lucide-react";
import { MapPinned, Route, Save, ShoppingBag } from "lucide-react";

import type {
  LocalLifeCategory,
  LocalLifeReviewItem,
  LocalLifeStatus,
} from "./ReviewLocalLifeItemCard";

type ReviewLocalLifeCategoryCardProps = {
  category: {
    icon: LucideIcon;
    key: LocalLifeCategory;
  };
  items: LocalLifeReviewItem[];
};

function statusCount(items: LocalLifeReviewItem[], status: LocalLifeStatus) {
  return items.filter((item) => item.status === status).length;
}

export default function ReviewLocalLifeCategoryCard({
  category,
  items,
}: ReviewLocalLifeCategoryCardProps) {
  const Icon = category.icon;
  const cities = new Set(items.map((item) => item.city).filter(Boolean)).size;
  const basketCount = statusCount(items, "Added to Booking");
  const savedCount = statusCount(items, "Saved");
  const scoreValues = items
    .map((item) => item.experienceScore || item.cultureScore || item.routeFitScore)
    .filter((value): value is number => Number.isFinite(Number(value)));
  const score = scoreValues.length
    ? Math.round(scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length)
    : 0;
  const metrics: Array<{
    icon: LucideIcon;
    label: string;
    value: number | string;
  }> = [
    { icon: ShoppingBag, label: "Basket", value: basketCount },
    { icon: Save, label: "Saved", value: savedCount },
    { icon: MapPinned, label: "Cities", value: cities },
    { icon: Route, label: "Value Score", value: score || "NA" },
  ];

  return (
    <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-[0_18px_54px_rgba(120,53,15,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
            Category Review
          </p>
          <h3 className="mt-2 text-lg font-black text-slate-950">
            {category.key}
          </h3>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-800">
          <Icon size={20} />
        </span>
      </div>

      <p className="mt-4 text-4xl font-black text-slate-950">{items.length}</p>
      <p className="mt-1 text-xs font-bold text-stone-600">Local Life items</p>

      <div className="mt-4 grid gap-2 text-xs">
        {metrics.map(({ icon: MetricIcon, label, value }) => {
          return (
            <div
              key={label}
              className="flex items-center justify-between rounded-2xl border border-stone-100 bg-stone-50 px-3 py-2"
            >
              <span className="inline-flex items-center gap-1.5 font-bold text-stone-600">
                <MetricIcon size={13} />
                {label}
              </span>
              <span className="font-black text-slate-900">{value}</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
