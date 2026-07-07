"use client";

import {
  BadgeIndianRupee,
  CalendarDays,
  Clock3,
  MapPin,
  PackageCheck,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import { getReviewStatusVisual } from "./reviewStatusStyles";

type ReviewBasketItemCardProps = {
  item: WorkspaceBookingBasketItem;
};

function formatCurrency(value?: number) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) return "Not available";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export function basketItemValue(item: WorkspaceBookingBasketItem) {
  return Number(item.estimatedTotal || item.estimatedPrice || item.price || 0);
}

function bookingModeLabel(item: WorkspaceBookingBasketItem) {
  const text = `${item.meta || ""} ${item.detailSummary || ""} ${item.serviceLabel || ""}`.toLowerCase();
  if (text.includes("finalized")) return "Finalized Day Item";
  if (text.includes("recommendation")) return "Smart Recommendation";
  if (text.includes("manual")) return "Manual Add";
  return "Selected Item";
}

function readinessStatus(item: WorkspaceBookingBasketItem) {
  if (!item.serviceType || !item.title) return "Needs Review";
  if (basketItemValue(item) <= 0) return "Pending";
  return "Ready";
}

export default function ReviewBasketItemCard({ item }: ReviewBasketItemCardProps) {
  const status = readinessStatus(item);
  const statusVisual = getReviewStatusVisual(status);
  const detailRows: Array<{ icon: LucideIcon; label: string; value: string }> = [
    {
      icon: CalendarDays,
      label: "Day",
      value: item.dayLabel || (item.day ? `Day ${item.day}` : "Not available"),
    },
    {
      icon: CalendarDays,
      label: "Date",
      value: item.date || item.startDate || "Not available",
    },
    {
      icon: MapPin,
      label: "City / Location",
      value: item.city || item.to || item.from || "Not available",
    },
    { icon: Clock3, label: "Time", value: item.time || "Not available" },
    {
      icon: UsersRound,
      label: "Travellers / Rooms",
      value: `${item.travellers || "NA"} / ${item.rooms || "NA"}`,
    },
    {
      icon: BadgeIndianRupee,
      label: "Estimated Value",
      value: formatCurrency(basketItemValue(item)),
    },
  ];

  return (
    <article className={`rounded-3xl border border-slate-200 p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)] ${statusVisual.cardClass}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
          <PackageCheck size={13} />
          {item.serviceType || "service"}
        </span>
        <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusVisual.badgeClass}`}>
          {status}
        </span>
        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
          {bookingModeLabel(item)}
        </span>
      </div>

      <h4 className="mt-3 break-words text-lg font-black text-slate-950">
        {item.selectedOptionName || item.title || "Selected basket item"}
      </h4>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
        {item.description || item.detailSummary || item.serviceName || "No item detail available."}
      </p>

      <div className="mt-4 grid gap-2 text-xs xl:grid-cols-2">
        {detailRows.map(({ icon: RowIcon, label, value }) => {
          return (
            <div
              key={label}
              className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2"
            >
              <span className="inline-flex items-center gap-1.5 font-bold text-slate-500">
                <RowIcon size={13} />
                {label}
              </span>
              <span className="text-right font-black text-slate-900">{value}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
          {item.serviceLabel || item.serviceName || "Workspace"}
        </span>
        <span className="text-xs font-black text-slate-600">
          Qty {item.quantity || 1}
        </span>
      </div>
    </article>
  );
}
