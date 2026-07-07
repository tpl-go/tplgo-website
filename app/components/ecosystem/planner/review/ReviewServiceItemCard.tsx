"use client";

import type { LucideIcon } from "lucide-react";
import {
  BadgeIndianRupee,
  CalendarDays,
  Clock3,
  MapPin,
  UsersRound,
} from "lucide-react";

export type ReviewServiceItem = {
  bookingStatus: "available" | "selected" | "recommended" | "optional" | string;
  city?: string;
  date?: string;
  dayLabel?: string;
  estimatedValue?: number;
  id: string;
  location?: string;
  notes?: string;
  quantityLabel?: string;
  sourceModule: string;
  time?: string;
  title: string;
  typeLabel?: string;
};

export type ReviewServiceGroup = {
  description: string;
  icon: LucideIcon;
  id:
    | "flights"
    | "hotels"
    | "homestays"
    | "cabs"
    | "train"
    | "bus"
    | "cruise"
    | "activities"
    | "insurance"
    | "visa"
    | "localLife"
    | "creator"
    | "localMarket"
    | "packages";
  items: ReviewServiceItem[];
  name: string;
  readiness: "Ready" | "Optional" | "Missing" | "Not Selected";
  selectedBasketCount: number;
  value: number;
};

type ReviewServiceItemCardProps = {
  item: ReviewServiceItem;
};

function formatCurrency(value?: number) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) return "Not available";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function statusLabel(status: string) {
  if (status === "selected") return "Added to Basket";
  if (status === "recommended") return "Recommended";
  if (status === "optional") return "Optional";
  if (status === "available") return "Itinerary Only";
  return status || "Pending";
}

function statusClass(status: string) {
  if (status === "selected") return "border-orange-200 bg-orange-50 text-orange-700";
  if (status === "recommended") return "border-blue-200 bg-blue-50 text-blue-700";
  if (status === "optional") return "border-slate-200 bg-slate-50 text-slate-500";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function ReviewServiceItemCard({
  item,
}: ReviewServiceItemCardProps) {
  const location =
    item.location ||
    item.city ||
    "Location not available";

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_210px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-black ${statusClass(item.bookingStatus)}`}
            >
              {statusLabel(item.bookingStatus)}
            </span>
            {item.typeLabel ? (
              <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
                {item.typeLabel}
              </span>
            ) : null}
          </div>

          <h4 className="mt-3 break-words text-lg font-black text-slate-950">
            {item.title}
          </h4>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
            <MapPin size={14} className="text-[#4f46e5]" />
            {location}
          </p>
          {item.notes ? (
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              {item.notes}
            </p>
          ) : null}
        </div>

        <aside className="grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <CalendarDays size={13} />
              Day / Date
            </span>
            <span className="text-right text-xs font-black text-slate-900">
              {[item.dayLabel, item.date].filter(Boolean).join(" · ") ||
                "Not available"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Clock3 size={13} />
              Time
            </span>
            <span className="text-right text-xs font-black text-slate-900">
              {item.time || "Not available"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <UsersRound size={13} />
              Qty
            </span>
            <span className="text-right text-xs font-black text-slate-900">
              {item.quantityLabel || "Not available"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <BadgeIndianRupee size={13} />
              Value
            </span>
            <span className="text-right text-xs font-black text-slate-900">
              {formatCurrency(item.estimatedValue)}
            </span>
          </div>
          <div className="rounded-xl bg-white px-3 py-2 text-center text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
            {item.sourceModule}
          </div>
        </aside>
      </div>
    </article>
  );
}
