"use client";

import {
  BadgeIndianRupee,
  Clock3,
  MapPin,
  Route,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { getReviewStatusVisual } from "./reviewStatusStyles";

export type LocalMarketStatus =
  | "Added to Booking"
  | "Saved"
  | "Itinerary Only"
  | "Recommended"
  | "Pending";

export type LocalMarketCategory =
  | "Handicrafts"
  | "Spices"
  | "Tea / Coffee"
  | "Souvenirs"
  | "Regional Products"
  | "Travel Essentials"
  | "Shopping Stops"
  | "Local Food Products";

export type LocalMarketReviewItem = {
  category: LocalMarketCategory;
  city: string;
  commerceValue?: number;
  creatorValue?: number;
  dayNumber?: number | string;
  estimatedSpend?: number | string;
  id: string;
  location?: string;
  routeFitScore?: number;
  sellerVerification?: string;
  source: string;
  status: LocalMarketStatus;
  time?: string;
  title: string;
};

type ReviewLocalMarketItemCardProps = {
  item: LocalMarketReviewItem;
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

export default function ReviewLocalMarketItemCard({
  item,
}: ReviewLocalMarketItemCardProps) {
  const statusVisual = getReviewStatusVisual(item.status);

  return (
    <article className={`rounded-3xl border border-orange-100 p-4 shadow-[0_12px_34px_rgba(154,52,18,0.06)] ${statusVisual.cardClass}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
          <Clock3 size={13} />
          {item.time || "Best time pending"}
        </span>
        <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-black text-stone-700">
          {item.category}
        </span>
        <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusVisual.badgeClass}`}>
          {item.status}
        </span>
      </div>

      <h4 className="mt-3 break-words text-lg font-black text-slate-950">
        {item.title}
      </h4>

      <div className="mt-3 grid gap-2 text-xs">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-orange-50/70 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-stone-600">
            <MapPin size={13} />
            City / Market
          </span>
          <span className="text-right font-black text-slate-900">
            {[item.city, item.location].filter(Boolean).join(" · ") ||
              "Unassigned Market Items"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-orange-50/70 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-stone-600">
            <Route size={13} />
            Day
          </span>
          <span className="text-right font-black text-slate-900">
            {item.dayNumber ? `Day ${item.dayNumber}` : "Day pending"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-orange-50/70 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-stone-600">
            <BadgeIndianRupee size={13} />
            Estimated Spend
          </span>
          <span className="text-right font-black text-slate-900">
            {formatValue(item.estimatedSpend)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-orange-50/70 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-stone-600">
            <ShieldCheck size={13} />
            Seller / Market
          </span>
          <span className="text-right font-black text-slate-900">
            {item.sellerVerification || "Verification pending"}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {scoreChip("Route Fit", item.routeFitScore)}
        {scoreChip("Commerce", item.commerceValue)}
        {scoreChip("Creator", item.creatorValue)}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-orange-100 pt-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-black text-stone-600">
          <ShoppingBag size={13} />
          {item.source}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-black text-orange-700">
          {item.status === "Added to Booking"
            ? "Basket"
            : item.status === "Saved"
              ? "Saved"
              : "Commerce review"}
        </span>
      </div>
    </article>
  );
}
