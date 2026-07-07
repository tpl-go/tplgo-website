"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Layers3 } from "lucide-react";

import ReviewDayAccordion, {
  type ReviewDayBookingLookup,
} from "./ReviewDayAccordion";
import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import type { TiyaDayPlan } from "@/app/lib/ecosystem/planner/plannerTypes";

type ReviewDayWiseItineraryProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeDayNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0
    ? Math.round(numberValue)
    : 0;
}

function getBasketItemsForDay(
  basketItems: WorkspaceBookingBasketItem[],
  day: TiyaDayPlan
) {
  const dayNumber = normalizeDayNumber(day.day);

  return basketItems.filter((item) => {
    const itemDay = normalizeDayNumber(item.day);
    return item.dayId === day.id || (dayNumber > 0 && itemDay === dayNumber);
  });
}

function basketKey(item: WorkspaceBookingBasketItem) {
  return [
    item.dayId || `day-${item.day}`,
    item.sourceItemId || item.id || item.title,
    item.serviceType,
    item.time || item.date || item.dayLabel,
  ]
    .filter(Boolean)
    .join("|")
    .toLowerCase();
}

function buildBookingLookup(
  basketItems: WorkspaceBookingBasketItem[]
): ReviewDayBookingLookup {
  const exactIds = new Set<string>();
  const looseKeys = new Set<string>();

  basketItems.forEach((item) => {
    exactIds.add(item.id);
    if (item.sourceItemId) exactIds.add(item.sourceItemId);
    looseKeys.add(basketKey(item));
  });

  return { exactIds, looseKeys };
}

export default function ReviewDayWiseItinerary({
  payload,
}: ReviewDayWiseItineraryProps) {
  const itinerary = safeArray(payload.itinerary);
  const basketItems = safeArray(payload.selectedBasketItems);
  const dayStatuses =
    typeof (payload as TiyaSmartPlannerReviewPayload & { dayStatuses?: unknown }).dayStatuses ===
      "object" &&
    (payload as TiyaSmartPlannerReviewPayload & { dayStatuses?: unknown }).dayStatuses !== null
      ? ((payload as TiyaSmartPlannerReviewPayload & { dayStatuses?: Record<string, string> })
          .dayStatuses || {})
      : {};
  const bookingLookup = buildBookingLookup(basketItems);
  const totalDayItems = itinerary.reduce(
    (sum, day) => sum + safeArray(day.items).length,
    0
  );

  if (!itinerary.length) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
        <CalendarDays className="mx-auto text-slate-400" size={34} />
        <h2 className="mt-4 text-3xl font-black text-slate-950">
          No day-wise itinerary found.
        </h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
          Return to Workspace and build your day-wise itinerary before reviewing
          the final plan.
        </p>
        <Link
          href="/smart-planner/workspace"
          className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] px-7 text-sm font-black text-white shadow-[0_18px_42px_rgba(79,70,229,0.28)]"
        >
          <ArrowLeft size={17} />
          Back to Workspace
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/70 p-6 shadow-[0_18px_54px_rgba(15,23,42,0.06)]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4f46e5]">
            Master Itinerary
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            Complete Day-wise Master Itinerary
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            Review each day exactly as prepared in your Smart Planner
            workspace.
          </p>
        </div>
        <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500 xl:inline-flex">
          <Layers3 size={15} className="mr-2 text-[#4f46e5]" />
          {itinerary.length} days · {totalDayItems} itinerary items
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {itinerary.map((day, index) => (
          <ReviewDayAccordion
            key={day.id || `day-${day.day}-${index}`}
            basketItems={getBasketItemsForDay(basketItems, day)}
            bookingLookup={bookingLookup}
            day={day}
            dayStatuses={dayStatuses}
            defaultOpen={index === 0}
          />
        ))}
      </div>
    </section>
  );
}
