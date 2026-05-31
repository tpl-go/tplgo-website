"use client";

import type { CabBookingPageData } from "@/app/lib/cab/cabBookingTypes";

export default function CabBookingPolicies({ data }: { data: CabBookingPageData }) {
  return (
    <div className="space-y-4">
      {data.policies.map((item, i) => (
        <div key={i}>
          <div className="break-words text-[14px] font-semibold text-slate-900">
            {item.title}
          </div>
          <div className="break-words text-[13px] text-slate-500">
            {item.subtitle}
          </div>
        </div>
      ))}
    </div>
  );
}
