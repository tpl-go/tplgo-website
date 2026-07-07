"use client";

import { Store } from "lucide-react";

import ReviewLocalMarketItemCard from "./ReviewLocalMarketItemCard";
import type { LocalMarketReviewItem } from "./ReviewLocalMarketItemCard";

type ReviewLocalMarketCityGroupProps = {
  city: string;
  items: LocalMarketReviewItem[];
};

export default function ReviewLocalMarketCityGroup({
  city,
  items,
}: ReviewLocalMarketCityGroupProps) {
  return (
    <article className="rounded-[1.75rem] border border-orange-100 bg-orange-50/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
            City Market Group
          </p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{city}</h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-black text-orange-700">
          <Store size={16} />
          {items.length} Market {items.length === 1 ? "Pick" : "Picks"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <ReviewLocalMarketItemCard key={item.id} item={item} />
        ))}
      </div>
    </article>
  );
}
