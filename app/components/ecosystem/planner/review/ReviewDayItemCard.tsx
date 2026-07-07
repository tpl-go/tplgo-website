"use client";

import {
  BadgeIndianRupee,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type { TiyaTimelineDetailValue, TiyaTimelineItem } from "@/app/lib/ecosystem/planner/plannerTypes";
import { getReviewStatusVisual } from "./reviewStatusStyles";

export type ReviewDayItemGroup =
  | "Transport / Transfers"
  | "Stay / Hotel / Homestay"
  | "Activities / Experiences"
  | "Meals / Food"
  | "Local Life"
  | "Creator Experience"
  | "Local Market / Shopping"
  | "Insurance / Visa / Documents";

type ReviewDayItemCardProps = {
  addedToBasket: boolean;
  item: TiyaTimelineItem;
  sourceModule: string;
};

type ReviewTimelineItem = TiyaTimelineItem & {
  duration?: string;
  estimatedCost?: number;
  estimatedValue?: number;
  sourceModule?: string;
};

function detailToString(value: TiyaTimelineDetailValue | undefined) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return "";
}

function formatCurrency(value?: number) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) return "Not available";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function itemValue(item: TiyaTimelineItem) {
  const reviewItem = item as ReviewTimelineItem;
  return (
    Number(reviewItem.estimatedCost || 0) ||
    Number(reviewItem.estimatedValue || 0) ||
    Number(item.price || 0) ||
    Number(item.unitPrice || 0) ||
    undefined
  );
}

function durationLabel(item: TiyaTimelineItem) {
  const reviewItem = item as ReviewTimelineItem;
  return (
    reviewItem.duration ||
    detailToString(item.details?.duration) ||
    detailToString(item.details?.timeRequired) ||
    "Duration not available"
  );
}

function bookingStatusLabel(item: TiyaTimelineItem, addedToBasket: boolean) {
  if (addedToBasket) return "Added to Basket";
  if (item.bookingStatus === "selected") return "Suggested";
  if (item.bookingStatus === "optional") return "Optional";
  if (item.bookingStatus === "recommended") return "Suggested";
  return "Itinerary Only";
}

export default function ReviewDayItemCard({
  addedToBasket,
  item,
  sourceModule,
}: ReviewDayItemCardProps) {
  const status = bookingStatusLabel(item, addedToBasket);
  const statusVisual = getReviewStatusVisual(status);

  return (
    <article className={`rounded-3xl border border-slate-200 p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)] ${statusVisual.cardClass}`}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
              <Clock3 size={13} />
              {item.time || "Time pending"}
            </span>
            <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
              {item.category || item.type || "Item"}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-black ${statusVisual.badgeClass}`}
            >
              {status}
            </span>
          </div>

          <h5 className="mt-3 break-words text-lg font-black text-slate-950">
            {item.title || "Untitled itinerary item"}
          </h5>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {item.description || item.detailSummary || "No description available."}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
              <MapPin size={13} />
              {item.location || item.from || item.to || "Location pending"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
              <Sparkles size={13} />
              {sourceModule}
            </span>
          </div>
        </div>

        <aside className="grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Clock3 size={13} />
              Duration
            </span>
            <span className="text-xs font-black text-slate-900">
              {durationLabel(item)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <BadgeIndianRupee size={13} />
              Value
            </span>
            <span className="text-xs font-black text-slate-900">
              {formatCurrency(itemValue(item))}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <ShieldCheck size={13} />
              Booking
            </span>
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${statusVisual.badgeClass}`}
            >
              {addedToBasket ? "Added" : "Review only"}
            </span>
          </div>
        </aside>
      </div>
    </article>
  );
}
