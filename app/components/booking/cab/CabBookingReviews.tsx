"use client";

import type { CabBookingPageData } from "@/app/lib/cab/cabBookingTypes";

export default function CabBookingReviews({ data }: { data: CabBookingPageData }) {
  const review = data.reviews[0];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-[15px] font-bold text-slate-900">
          {review.author}
        </div>
        <div className="rounded-md bg-sky-600 px-2 py-[2px] text-[12px] font-bold text-white">
          {review.rating}
        </div>
      </div>

      <div className="text-[12px] text-slate-500">{review.date}</div>

      <div className="mt-2 text-[14px] text-slate-700">{review.text}</div>

      <div className="mt-3 flex flex-wrap gap-2">
        {review.tags?.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold text-sky-700"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}