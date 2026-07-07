"use client";

import { Accessibility, Baby, HeartPulse, Salad, UserRoundCheck } from "lucide-react";
import { getReviewStatusVisual } from "./reviewStatusStyles";

export type TravellerRequirement = {
  label: string;
  status: "Provided" | "Pending" | "Not Required";
};

type ReviewTravellerRequirementsProps = {
  requirements: TravellerRequirement[];
};

function statusClass(status: TravellerRequirement["status"]) {
  return getReviewStatusVisual(status).badgeClass;
}

const icons = [Accessibility, UserRoundCheck, Baby, HeartPulse, Salad];

export default function ReviewTravellerRequirements({
  requirements,
}: ReviewTravellerRequirementsProps) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
        Special Requirements
      </p>
      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {requirements.map((requirement, index) => {
          const Icon = icons[index % icons.length];
          const statusVisual = getReviewStatusVisual(requirement.status);
          return (
            <div
              key={requirement.label}
              className={`flex items-center justify-between gap-3 rounded-2xl border border-slate-100 px-3 py-3 ${statusVisual.cardClass}`}
            >
              <span className="inline-flex items-center gap-2 text-sm font-black text-slate-700">
                <Icon size={16} className={statusVisual.iconClass} />
                {requirement.label}
              </span>
              <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusClass(requirement.status)}`}>
                {requirement.status}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
