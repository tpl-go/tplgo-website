"use client";

import type { CabBookingPageData } from "@/app/lib/cab/cabBookingTypes";

export default function CabBookingInclusions({ data }: { data: CabBookingPageData }) {
  return (
    <div className="space-y-4">
      {data.inclusions.map((item, i) => (
        <div key={i} className="flex gap-3">
          <div className="mt-1 text-sky-500">✔</div>
          <div>
            <div className="text-[14px] font-semibold text-slate-900">
              {item.title}
            </div>
            <div className="text-[13px] text-slate-500">
              {item.subtitle}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}