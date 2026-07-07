"use client";

import { CalendarDays, Clock3, MapPin, Route, Users } from "lucide-react";

import type { PlannerBookingPayload } from "./PlannerBookingPageShell";

function dateLabel(value?: string) {
  if (!value) return "Not available";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function travellerLabel(payload: PlannerBookingPayload) {
  const travellers = payload.travellers || {};
  const total =
    Number(travellers.total || 0) ||
    Number(travellers.adults || 0) +
      Number(travellers.children || 0) +
      Number(travellers.seniors || 0);

  return total > 0 ? `${total} traveller${total > 1 ? "s" : ""}` : "Not available";
}

function routeLabel(payload: PlannerBookingPayload) {
  const selectedRouteVariant =
    typeof payload.route?.selectedRouteVariant === "object" &&
    payload.route?.selectedRouteVariant !== null
      ? (payload.route.selectedRouteVariant as Record<string, unknown>)
      : {};
  const stops = Array.isArray(selectedRouteVariant.stops)
    ? selectedRouteVariant.stops.map(String).filter(Boolean)
    : [];

  if (stops.length) return stops.join(" → ");
  return [payload.trip?.origin, payload.trip?.destination].filter(Boolean).join(" → ") || "Route not available";
}

export default function PlannerBookingTripSummary({
  payload,
}: {
  payload: PlannerBookingPayload;
}) {
  const totalDays =
    Number(payload.trip?.totalDays || 0) ||
    (Array.isArray(payload.itinerary) ? payload.itinerary.length : 0);

  const cards = [
    {
      icon: <MapPin className="h-5 w-5 text-orange-500" />,
      label: "Route",
      value: routeLabel(payload),
    },
    {
      icon: <CalendarDays className="h-5 w-5 text-blue-600" />,
      label: "Travel Date",
      value: dateLabel(payload.trip?.startDate),
    },
    {
      icon: <Clock3 className="h-5 w-5 text-purple-600" />,
      label: "Duration",
      value: totalDays > 0 ? `${totalDays} day${totalDays > 1 ? "s" : ""}` : "Not available",
    },
    {
      icon: <Users className="h-5 w-5 text-emerald-600" />,
      label: "Travellers",
      value: travellerLabel(payload),
    },
    {
      icon: <Route className="h-5 w-5 text-sky-600" />,
      label: "Trip Type",
      value: payload.trip?.tripType || payload.preferences?.travelStyle || "Smart Planner Trip",
    },
  ];

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-950">Trip Summary</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Data is read directly from the Smart Planner review payload.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
              {card.icon}
              {card.label}
            </div>
            <div className="mt-2 break-words text-sm font-black text-slate-950">
              {card.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
