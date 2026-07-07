"use client";

import type { LucideIcon } from "lucide-react";
import { BadgeIndianRupee, CalendarDays, MapPin, UsersRound } from "lucide-react";
import { getReviewStatusVisual } from "./reviewStatusStyles";

export type StayCategoryKey =
  | "hotels"
  | "homestays"
  | "resorts"
  | "villas"
  | "retreats"
  | "camps";

export type StayCoverageStatus =
  | "Selected"
  | "Recommended"
  | "Pending"
  | "Missing";

export type StayReviewItem = {
  adults?: number;
  category: StayCategoryKey;
  checkIn?: string;
  checkOut?: string;
  children?: number;
  city?: string;
  estimatedCost?: number;
  id: string;
  location?: string;
  mealPlan?: string;
  nights?: number;
  propertyName: string;
  propertyType: string;
  rooms?: number;
  source: string;
  status: StayCoverageStatus;
  travellerCount?: number;
};

type ReviewStayCoverageCardProps = {
  definition: {
    icon: LucideIcon;
    key: StayCategoryKey;
    title: string;
  };
  stays: StayReviewItem[];
  status: StayCoverageStatus;
};

function formatCurrency(value?: number) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) return "Not available";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function dateLabel(value?: string) {
  if (!value) return "Not available";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function stayStatusClass(status: StayCoverageStatus) {
  return getReviewStatusVisual(status).badgeClass;
}

export default function ReviewStayCoverageCard({
  definition,
  stays,
  status,
}: ReviewStayCoverageCardProps) {
  const Icon = definition.icon;
  const statusVisual = getReviewStatusVisual(status);

  return (
    <article className={`rounded-[1.75rem] border border-slate-200 p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)] ${statusVisual.cardClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            {definition.title} Coverage
          </p>
          <h3 className="mt-2 text-xl font-black text-slate-950">{definition.title}</h3>
        </div>
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-current/10 bg-white/70 ${statusVisual.iconClass}`}>
          <Icon size={20} />
        </span>
      </div>

      <span className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-black ${stayStatusClass(status)}`}>
        {status}
      </span>

      <div className="mt-4 grid gap-3">
        {stays.length ? (
          stays.map((stay) => (
            <div key={stay.id} className={`rounded-2xl border border-slate-100 p-3 ${getReviewStatusVisual(stay.status).cardClass}`}>
              <p className="text-sm font-black text-slate-950">{stay.propertyName}</p>
              <p className="mt-1 text-xs font-bold text-slate-500">{stay.propertyType}</p>
              <div className="mt-3 grid gap-2 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-500"><MapPin size={13} /> City</span>
                  <span className="font-black text-slate-900">{stay.city || stay.location || "Not available"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-500"><CalendarDays size={13} /> Check-In</span>
                  <span className="font-black text-slate-900">{dateLabel(stay.checkIn)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-500"><CalendarDays size={13} /> Check-Out</span>
                  <span className="font-black text-slate-900">{dateLabel(stay.checkOut)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-500"><UsersRound size={13} /> Rooms / Travellers</span>
                  <span className="font-black text-slate-900">{stay.rooms || "NA"} / {stay.travellerCount || "NA"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-500"><BadgeIndianRupee size={13} /> Cost</span>
                  <span className="font-black text-slate-900">{formatCurrency(stay.estimatedCost)}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${stayStatusClass(stay.status)}`}>{stay.status}</span>
                <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{stay.source}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm font-black text-slate-500">
            No stay selections available.
          </p>
        )}
      </div>
    </article>
  );
}
