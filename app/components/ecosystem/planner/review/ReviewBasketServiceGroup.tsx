"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";

import ReviewBasketItemCard, { basketItemValue } from "./ReviewBasketItemCard";
import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import { getReviewStatusVisual } from "./reviewStatusStyles";

type ReviewBasketServiceGroupProps = {
  icon: LucideIcon;
  items: WorkspaceBookingBasketItem[];
  serviceName: string;
};

function formatCurrency(value?: number) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) return "Not available";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export default function ReviewBasketServiceGroup({
  icon: Icon,
  items,
  serviceName,
}: ReviewBasketServiceGroupProps) {
  const [open, setOpen] = useState(true);
  const value = items.reduce((sum, item) => sum + basketItemValue(item), 0);
  const daysCovered = new Set(items.map((item) => item.day).filter(Boolean)).size;
  const missingValue = items.some((item) => basketItemValue(item) <= 0);
  const readiness = !items.length ? "Missing" : missingValue ? "Pending" : "Ready";
  const readinessVisual = getReviewStatusVisual(readiness);

  return (
    <article className={`rounded-[1.75rem] border border-slate-200 shadow-[0_18px_54px_rgba(15,23,42,0.07)] ${readinessVisual.cardClass}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-current/10 bg-white/70 ${readinessVisual.iconClass}`}>
            <Icon size={22} />
          </span>
          <div className="min-w-0">
            <h3 className="text-xl font-black text-slate-950">{serviceName}</h3>
            <p className="mt-1 text-xs font-bold text-slate-500">
              {items.length} items · {formatCurrency(value)} · {daysCovered} days covered
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-black ${readinessVisual.badgeClass}`}
          >
            {readiness}
          </span>
          <ChevronDown
            size={18}
            className={`text-slate-500 transition ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open ? (
        <div className="grid gap-4 border-t border-slate-100 p-5 xl:grid-cols-2">
          {items.map((item) => (
            <ReviewBasketItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}
    </article>
  );
}
