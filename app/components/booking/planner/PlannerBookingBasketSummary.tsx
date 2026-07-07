"use client";

import {
  Bus,
  Car,
  FileCheck2,
  Hotel,
  Plane,
  ShieldCheck,
  Ship,
  ShoppingBag,
  Sparkles,
  Ticket,
  Train,
  UtensilsCrossed,
} from "lucide-react";

import {
  basketItemTitle,
  basketItemValue,
  formatPlannerCurrency,
  summaryTitleForItem,
  type PlannerBookingCategory,
  type PlannerBookingGroup,
} from "./PlannerBookingPageShell";

function iconFor(category: PlannerBookingCategory) {
  if (category === "Flight") return <Plane className="h-5 w-5 text-blue-600" />;
  if (category === "Train") return <Train className="h-5 w-5 text-blue-600" />;
  if (category === "Bus") return <Bus className="h-5 w-5 text-blue-600" />;
  if (category === "Cab / Transfer") return <Car className="h-5 w-5 text-cyan-600" />;
  if (category === "Cruise") return <Ship className="h-5 w-5 text-sky-600" />;
  if (category === "Hotel" || category === "Homestay") return <Hotel className="h-5 w-5 text-indigo-600" />;
  if (category === "Meal") return <UtensilsCrossed className="h-5 w-5 text-amber-600" />;
  if (category === "Insurance") return <ShieldCheck className="h-5 w-5 text-emerald-600" />;
  if (category === "Visa") return <FileCheck2 className="h-5 w-5 text-purple-600" />;
  if (category === "Local Market") return <ShoppingBag className="h-5 w-5 text-orange-600" />;
  if (category === "Local Life" || category === "Creator") return <Sparkles className="h-5 w-5 text-purple-600" />;
  return <Ticket className="h-5 w-5 text-emerald-600" />;
}

export default function PlannerBookingBasketSummary({
  groups,
}: {
  groups: PlannerBookingGroup[];
}) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-xl font-black text-slate-950">Selected Basket Summary</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Only these selected basket items move forward. Train stays in Train and never under Flight.
        </p>
      </div>

      {groups.length ? (
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {groups.map((group) => (
            <article
              key={group.category}
              className="min-w-0 rounded-2xl border border-slate-200 bg-[#fcfdff] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                    {iconFor(group.category)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-950">
                      {summaryTitleForItem(group.items[0], group.category)}
                    </h3>
                    <p className="text-xs font-bold text-slate-500">
                      {group.items.length} selected
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right text-sm font-black text-slate-950">
                  {formatPlannerCurrency(group.value)}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {group.items.map((item, index) => (
                  <div
                    key={`${group.category}-${String(item.id || basketItemTitle(item))}-${index}`}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                  >
                    <div className="text-sm font-bold text-slate-900">
                      {basketItemTitle(item)}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                      {item.dayLabel ? <span>{item.dayLabel}</span> : null}
                      {item.city ? <span>{item.city}</span> : null}
                      {basketItemValue(item) > 0 ? (
                        <span>{formatPlannerCurrency(basketItemValue(item))}</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-800">
          No selected basket items found.
        </div>
      )}
    </section>
  );
}
