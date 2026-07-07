"use client";

import { MapPinned } from "lucide-react";

import ReviewLocalLifeItemCard from "./ReviewLocalLifeItemCard";
import type { LocalLifeReviewItem } from "./ReviewLocalLifeItemCard";

type ReviewLocalLifeCityGroupProps = {
  city: string;
  items: LocalLifeReviewItem[];
};

export default function ReviewLocalLifeCityGroup({
  city,
  items,
}: ReviewLocalLifeCityGroupProps) {
  return (
    <article className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
            Local Life City Group
          </p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{city}</h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-black text-amber-800">
          <MapPinned size={16} />
          {items.length} Local Life {items.length === 1 ? "Experience" : "Experiences"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <ReviewLocalLifeItemCard key={item.id} item={item} />
        ))}
      </div>
    </article>
  );
}
