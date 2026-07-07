"use client";

import type { LucideIcon } from "lucide-react";
import { BadgeIndianRupee, MapPinned, Save, ShoppingBag, Sparkles } from "lucide-react";

import type {
  LocalMarketCategory,
  LocalMarketReviewItem,
} from "./ReviewLocalMarketItemCard";

type ReviewLocalMarketCategoryCardProps = {
  category: {
    icon: LucideIcon;
    key: LocalMarketCategory;
  };
  items: LocalMarketReviewItem[];
};

function spendValue(items: LocalMarketReviewItem[]) {
  const total = items.reduce((sum, item) => {
    if (typeof item.estimatedSpend === "number") return sum + item.estimatedSpend;
    return sum;
  }, 0);
  return total > 0 ? `₹${total.toLocaleString("en-IN")}` : "NA";
}

export default function ReviewLocalMarketCategoryCard({
  category,
  items,
}: ReviewLocalMarketCategoryCardProps) {
  const Icon = category.icon;
  const basketCount = items.filter((item) => item.status === "Added to Booking").length;
  const savedCount = items.filter((item) => item.status === "Saved").length;
  const cityCount = new Set(items.map((item) => item.city).filter(Boolean)).size;
  const scoreValues = items
    .map((item) => item.commerceValue || item.routeFitScore)
    .filter((value): value is number => Number.isFinite(Number(value)));
  const score = scoreValues.length
    ? Math.round(scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length)
    : 0;
  const metrics: Array<{ icon: LucideIcon; label: string; value: number | string }> = [
    { icon: ShoppingBag, label: "Basket", value: basketCount },
    { icon: Save, label: "Saved", value: savedCount },
    { icon: BadgeIndianRupee, label: "Spend", value: spendValue(items) },
    { icon: MapPinned, label: "Cities", value: cityCount },
    { icon: Sparkles, label: "Commerce", value: score || "NA" },
  ];

  return (
    <article className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-[0_18px_54px_rgba(154,52,18,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
            Product Category
          </p>
          <h3 className="mt-2 text-lg font-black text-slate-950">
            {category.key}
          </h3>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-700">
          <Icon size={20} />
        </span>
      </div>

      <p className="mt-4 text-4xl font-black text-slate-950">{items.length}</p>
      <p className="mt-1 text-xs font-bold text-stone-600">market items</p>

      <div className="mt-4 grid gap-2 text-xs">
        {metrics.map(({ icon: MetricIcon, label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/70 px-3 py-2"
          >
            <span className="inline-flex items-center gap-1.5 font-bold text-stone-600">
              <MetricIcon size={13} />
              {label}
            </span>
            <span className="font-black text-slate-900">{value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
