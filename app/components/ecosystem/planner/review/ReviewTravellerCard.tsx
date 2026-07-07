"use client";

import { BadgeCheck, Globe2, IdCard, UserRound } from "lucide-react";

export type TravellerType = "Adult" | "Child" | "Infant" | "Senior";

export type ReviewTraveller = {
  age?: number;
  frequentTravellerTag?: string;
  gender?: string;
  id: string;
  name?: string;
  nationality?: string;
  passportStatus?: string;
  travellerType: TravellerType;
  visaRequirement?: string;
};

type ReviewTravellerCardProps = {
  traveller: ReviewTraveller;
};

function statusClass(value?: string) {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("available") || normalized.includes("ready") || normalized.includes("valid")) {
    return "bg-emerald-50 text-emerald-700";
  }
  if (normalized.includes("required") || normalized.includes("pending")) {
    return "bg-amber-50 text-amber-700";
  }
  if (normalized.includes("missing")) return "bg-red-50 text-red-700";
  return "bg-slate-50 text-slate-600";
}

export default function ReviewTravellerCard({
  traveller,
}: ReviewTravellerCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
              <UserRound size={13} />
              {traveller.travellerType}
            </span>
            {traveller.frequentTravellerTag ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
                <BadgeCheck size={13} />
                {traveller.frequentTravellerTag}
              </span>
            ) : null}
          </div>
          <h4 className="mt-3 break-words text-lg font-black text-slate-950">
            {traveller.name || "Traveller name pending"}
          </h4>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {[traveller.age ? `${traveller.age} yrs` : "", traveller.gender, traveller.nationality]
              .filter(Boolean)
              .join(" · ") || "Age, gender and nationality pending"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-slate-500">
            <IdCard size={13} />
            Passport
          </span>
          <span className={`rounded-full px-2.5 py-1 font-black ${statusClass(traveller.passportStatus)}`}>
            {traveller.passportStatus || "Not available"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-slate-500">
            <Globe2 size={13} />
            Visa
          </span>
          <span className={`rounded-full px-2.5 py-1 font-black ${statusClass(traveller.visaRequirement)}`}>
            {traveller.visaRequirement || "Not available"}
          </span>
        </div>
      </div>
    </article>
  );
}
