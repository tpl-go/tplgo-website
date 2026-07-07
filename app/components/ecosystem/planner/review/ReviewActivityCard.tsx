"use client";

import {
  BadgeIndianRupee,
  Clock3,
  Gauge,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getReviewStatusVisual } from "./reviewStatusStyles";

export type ActivityReviewStatus =
  | "Added to Booking"
  | "Itinerary Only"
  | "Recommended"
  | "Pending";

export type ActivityReviewCategory =
  | "Culture"
  | "Food"
  | "Adventure"
  | "Nature"
  | "Spiritual"
  | "Shopping"
  | "Wellness"
  | "Sightseeing";

export type ActivityReviewItem = {
  category: ActivityReviewCategory;
  city: string;
  crowdScore?: number;
  date?: string;
  dayNumber?: number;
  duration?: string;
  estimatedCost?: number;
  fatigueScore?: number;
  fitScore?: number;
  id: string;
  location?: string;
  source: string;
  status: ActivityReviewStatus;
  time?: string;
  title: string;
};

type ReviewActivityCardProps = {
  activity: ActivityReviewItem;
};

function formatCurrency(value?: number) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) {
    return "Not available";
  }
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function metricLabel(label: string, value?: number) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-600">
      <Gauge size={12} />
      {label} {value}
    </span>
  );
}

export default function ReviewActivityCard({
  activity,
}: ReviewActivityCardProps) {
  const statusVisual = getReviewStatusVisual(activity.status);

  return (
    <article className={`rounded-3xl border border-slate-200 p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)] ${statusVisual.cardClass}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
          <Clock3 size={13} />
          {activity.time || "Time pending"}
        </span>
        <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
          {activity.category}
        </span>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-black ${statusVisual.badgeClass}`}
        >
          {activity.status}
        </span>
      </div>

      <h4 className="mt-3 break-words text-lg font-black text-slate-950">
        {activity.title}
      </h4>

      <div className="mt-3 grid gap-2 text-xs">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-slate-500">
            <MapPin size={13} />
            City / Location
          </span>
          <span className="text-right font-black text-slate-900">
            {[activity.city, activity.location].filter(Boolean).join(" · ") ||
              "Unassigned"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-slate-500">
            <Clock3 size={13} />
            Day / Duration
          </span>
          <span className="text-right font-black text-slate-900">
            {activity.dayNumber ? `Day ${activity.dayNumber}` : "Day pending"} ·{" "}
            {activity.duration || "Duration pending"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-slate-500">
            <BadgeIndianRupee size={13} />
            Estimated Cost
          </span>
          <span className="text-right font-black text-slate-900">
            {formatCurrency(activity.estimatedCost)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {metricLabel("Fit", activity.fitScore)}
        {metricLabel("Fatigue", activity.fatigueScore)}
        {metricLabel("Crowd", activity.crowdScore)}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500">
          <Sparkles size={13} />
          {activity.source}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-black text-slate-600">
          <ShieldCheck size={12} />
          {activity.status === "Added to Booking"
            ? "Booking basket"
            : "Review layer"}
        </span>
      </div>
    </article>
  );
}
