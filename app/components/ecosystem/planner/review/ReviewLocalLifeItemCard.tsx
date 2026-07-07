"use client";

import {
  BadgeIndianRupee,
  Clock3,
  MapPin,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getReviewStatusVisual } from "./reviewStatusStyles";

export type LocalLifeStatus =
  | "Added to Booking"
  | "Saved"
  | "Itinerary Only"
  | "Recommended"
  | "Pending";

export type LocalLifeCategory =
  | "Food Experiences"
  | "Culture"
  | "Hidden Gems"
  | "Local Walks"
  | "Village / Community Experiences"
  | "Local Lifestyle"
  | "Heritage Corners"
  | "Local Cafes / Street Food";

export type LocalLifeReviewItem = {
  category: LocalLifeCategory;
  city: string;
  creatorValue?: number;
  cultureScore?: number;
  dayNumber?: number | string;
  duration?: string;
  estimatedSpend?: number | string;
  experienceScore?: number;
  id: string;
  location?: string;
  routeFitScore?: number;
  source: string;
  status: LocalLifeStatus;
  time?: string;
  title: string;
};

type ReviewLocalLifeItemCardProps = {
  item: LocalLifeReviewItem;
};

function formatValue(value?: number | string) {
  if (typeof value === "string" && value.trim()) return value;
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) return "Not available";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function scoreChip(label: string, value?: number) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-stone-700">
      <Sparkles size={12} />
      {label} {value}
    </span>
  );
}

export default function ReviewLocalLifeItemCard({
  item,
}: ReviewLocalLifeItemCardProps) {
  const statusVisual = getReviewStatusVisual(item.status);

  return (
    <article className={`rounded-3xl border border-stone-200 p-4 shadow-[0_12px_34px_rgba(120,53,15,0.06)] ${statusVisual.cardClass}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
          <Clock3 size={13} />
          {item.time || "Time pending"}
        </span>
        <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-black text-stone-700">
          {item.category}
        </span>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-black ${statusVisual.badgeClass}`}
        >
          {item.status}
        </span>
      </div>

      <h4 className="mt-3 break-words text-lg font-black text-slate-950">
        {item.title}
      </h4>

      <div className="mt-3 grid gap-2 text-xs">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-stone-600">
            <MapPin size={13} />
            City / Location
          </span>
          <span className="text-right font-black text-slate-900">
            {[item.city, item.location].filter(Boolean).join(" · ") ||
              "Unassigned Local Life"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-stone-600">
            <Route size={13} />
            Day / Duration
          </span>
          <span className="text-right font-black text-slate-900">
            {item.dayNumber ? `Day ${item.dayNumber}` : "Day pending"} ·{" "}
            {item.duration || "Duration pending"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-stone-600">
            <BadgeIndianRupee size={13} />
            Estimated Spend
          </span>
          <span className="text-right font-black text-slate-900">
            {formatValue(item.estimatedSpend)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {scoreChip("Route Fit", item.routeFitScore)}
        {scoreChip("Culture", item.cultureScore)}
        {scoreChip("Local", item.experienceScore)}
        {scoreChip("Creator", item.creatorValue)}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-black text-stone-600">
          <Sparkles size={13} />
          {item.source}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-50 px-3 py-1 text-[11px] font-black text-stone-700">
          <ShieldCheck size={12} />
          {item.status === "Added to Booking"
            ? "Booking basket"
            : item.status === "Saved"
              ? "My Trips saved"
              : "Review layer"}
        </span>
      </div>
    </article>
  );
}
