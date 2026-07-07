"use client";

import { MapPinned } from "lucide-react";

import ReviewActivityCard from "./ReviewActivityCard";
import type { ActivityReviewItem } from "./ReviewActivityCard";

type ReviewActivityCityGroupProps = {
  activities: ActivityReviewItem[];
  city: string;
};

export default function ReviewActivityCityGroup({
  activities,
  city,
}: ReviewActivityCityGroupProps) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            City Activity Group
          </p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{city}</h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
          <MapPinned size={16} />
          {activities.length} {activities.length === 1 ? "Activity" : "Activities"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {activities.map((activity) => (
          <ReviewActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </article>
  );
}
