"use client";

import { CalendarDays, CheckCircle2 } from "lucide-react";

import {
  basketItemTitle,
  basketItemValue,
  classifyPlannerBasketItem,
  formatPlannerCurrency,
  type PlannerBookingBasketItem,
  type PlannerBookingPayload,
} from "./PlannerBookingPageShell";

function dayNumberFromItem(item: PlannerBookingBasketItem) {
  const explicit = Number(item.day || item.dayNumber || 0);
  if (explicit > 0) return explicit;

  const match = String(item.dayLabel || "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function dayItems(day: Record<string, unknown>) {
  const collections = [
    day.items,
    day.activities,
    day.meals,
    day.localLife,
    day.creatorSpots,
    day.marketItems,
  ];

  return collections.flatMap((value) => (Array.isArray(value) ? value : []));
}

function itemTitle(item: unknown) {
  if (typeof item === "string") return item;
  if (typeof item !== "object" || item === null) return "Planner item";
  const record = item as Record<string, unknown>;
  return String(
    record.title ||
      record.serviceName ||
      record.selectedOptionName ||
      record.name ||
      "Planner item"
  );
}

function normalizeItineraryDays(payload: PlannerBookingPayload) {
  if (Array.isArray(payload.itinerary)) {
    return payload.itinerary as Array<Record<string, unknown>>;
  }

  const itinerary =
    typeof payload.itinerary === "object" && payload.itinerary !== null
      ? (payload.itinerary as Record<string, unknown>)
      : {};
  const plan =
    typeof itinerary.plan === "object" && itinerary.plan !== null
      ? (itinerary.plan as Record<string, unknown>)
      : {};
  const candidates = [
    itinerary.days,
    itinerary.dayPlans,
    itinerary.itineraryDays,
    itinerary.generatedDays,
    plan.days,
  ];
  const days = candidates.find(Array.isArray);

  return Array.isArray(days) ? (days as Array<Record<string, unknown>>) : [];
}

export default function PlannerBookingDaywiseItinerary({
  basketItems,
  payload,
}: {
  basketItems: PlannerBookingBasketItem[];
  payload: PlannerBookingPayload;
}) {
  const itinerary = normalizeItineraryDays(payload);
  const itineraryDayNumbers = new Set(
    itinerary.map((day, index) => Number(day.day || day.dayNumber || index + 1))
  );
  const unassignedBasketItems = itinerary.length
    ? basketItems.filter((item) => !itineraryDayNumbers.has(dayNumberFromItem(item)))
    : [];

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-xl font-black text-slate-950">Day-wise Booking Itinerary</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Rendered from the Smart Planner review itinerary and selected basket.
        </p>
      </div>

      {itinerary.length ? (
        <div className="mt-5 space-y-4">
          {itinerary.map((day, index) => {
            const dayNumber = Number(day.day || day.dayNumber || index + 1);
            const selectedForDay = basketItems.filter(
              (item) => dayNumberFromItem(item) === dayNumber
            );
            const plannedItems = dayItems(day);

            return (
              <article
                key={`planner-booking-day-${dayNumber}-${index}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-[#fcfdff]"
              >
                <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-700 px-3 py-1 text-xs font-black text-white">
                          Day {dayNumber}
                        </span>
                        {day.date ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                            <CalendarDays className="h-4 w-4" />
                            {String(day.date)}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-2 text-lg font-black text-slate-950">
                        {String(day.title || day.headline || day.city || `Day ${dayNumber}`)}
                      </h3>
                    </div>
                    <div className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                      {selectedForDay.length} basket item{selectedForDay.length === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 p-5 xl:grid-cols-2">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                    <div className="text-sm font-black text-slate-950">
                      Selected Basket Items
                    </div>
                    <div className="mt-3 space-y-2">
                      {selectedForDay.length ? (
                        selectedForDay.map((item, itemIndex) => (
                          <div
                            key={`day-${dayNumber}-basket-${String(item.id || basketItemTitle(item))}-${itemIndex}`}
                            className="rounded-xl border border-blue-100 bg-white px-3 py-3"
                          >
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                              <div className="min-w-0">
                                <div className="text-sm font-black text-slate-900">
                                  {basketItemTitle(item)}
                                </div>
                                <div className="mt-1 text-xs font-semibold text-slate-500">
                                  {classifyPlannerBasketItem(item)}
                                  {basketItemValue(item) > 0
                                    ? ` • ${formatPlannerCurrency(basketItemValue(item))}`
                                    : ""}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-blue-100 bg-white px-3 py-3 text-sm font-semibold text-slate-500">
                          No basket item mapped to this day.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-4">
                    <div className="text-sm font-black text-slate-950">
                      Itinerary-only Reference
                    </div>
                    <div className="mt-3 space-y-2">
                      {plannedItems.length ? (
                        plannedItems.slice(0, 8).map((item, itemIndex) => (
                          <div
                            key={`day-${dayNumber}-planned-${itemIndex}`}
                            className="rounded-xl border border-orange-100 bg-white px-3 py-3 text-sm font-semibold text-slate-700"
                          >
                            {itemTitle(item)}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-orange-100 bg-white px-3 py-3 text-sm font-semibold text-slate-500">
                          No itinerary-only items available for this day.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
          {unassignedBasketItems.length ? (
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-[#fcfdff]">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-black text-white">
                      Unassigned
                    </span>
                    <h3 className="mt-2 text-lg font-black text-slate-950">
                      Selected basket items without day mapping
                    </h3>
                  </div>
                  <div className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    {unassignedBasketItems.length} basket item
                    {unassignedBasketItems.length === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                  <div className="text-sm font-black text-slate-950">
                    Selected Basket Items
                  </div>
                  <div className="mt-3 space-y-2">
                    {unassignedBasketItems.map((item, itemIndex) => (
                      <div
                        key={`unassigned-basket-${String(item.id || basketItemTitle(item))}-${itemIndex}`}
                        className="rounded-xl border border-blue-100 bg-white px-3 py-3"
                      >
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <div className="min-w-0">
                            <div className="text-sm font-black text-slate-900">
                              {basketItemTitle(item)}
                            </div>
                            <div className="mt-1 text-xs font-semibold text-slate-500">
                              {classifyPlannerBasketItem(item)}
                              {basketItemValue(item) > 0
                                ? ` • ${formatPlannerCurrency(basketItemValue(item))}`
                                : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ) : null}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-800">
          Smart Planner itinerary details are not available. Selected basket summary is shown from Review payload.
        </div>
      )}
    </section>
  );
}
