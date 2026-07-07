"use client";

import { CalendarDays, MapPin, Route, Users } from "lucide-react";

type Props = {
  basketCount: number;
  duration?: string;
  route?: string[] | string;
  title: string;
  totalTravellers?: number;
  travelDate?: string;
};

function formatDate(value?: string) {
  if (!value) return "On Request";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    weekday: "short",
    year: "numeric",
  });
}

function routeLabel(route?: string[] | string) {
  if (Array.isArray(route)) return route.filter(Boolean).join(" → ");
  return route || "Route not available";
}

export default function PlannerConfirmationTripSummary({
  basketCount,
  duration,
  route,
  title,
  totalTravellers = 1,
  travelDate,
}: Props) {
  return (
    <section className="rounded-[24px] border border-[#d9e2ec] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-[21px] font-black text-slate-950">Smart Planner Trip Summary</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Confirmed planner trip, route, duration and selected booking basket.
          </p>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
          {basketCount} basket item{basketCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-4 text-lg font-black text-slate-950">{title}</div>
      <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
        <MapPin className="h-4 w-4 text-orange-500" />
        {routeLabel(route)}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
        <Info icon={<CalendarDays className="h-4 w-4" />} label="Travel Date" value={formatDate(travelDate)} />
        <Info icon={<Route className="h-4 w-4" />} label="Duration" value={duration || "Duration not available"} />
        <Info icon={<Users className="h-4 w-4" />} label="Travellers" value={`${totalTravellers} Traveller${totalTravellers > 1 ? "s" : ""}`} />
        <Info label="Source" value="Smart Planner" />
      </div>
    </section>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-black text-slate-950">{value}</div>
    </div>
  );
}
