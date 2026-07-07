"use client";

import {
  CalendarDays,
  Clock3,
  MapPinned,
  Route,
  Sparkles,
  UsersRound,
} from "lucide-react";

import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";

type ReviewHeroProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

function dateLabel(value?: string) {
  if (!value) return "Date pending";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function dateTimeLabel(value?: string) {
  if (!value) return "Not available";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function HeroInfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/88 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-base font-black leading-6 text-slate-950">
        {value || "Pending"}
      </p>
    </div>
  );
}

export default function ReviewHero({ payload }: ReviewHeroProps) {
  const trip = payload.trip || {};
  const route = payload.route || {};
  const travellersTotal = payload.travellers?.total || 0;
  const duration =
    trip.totalDays ||
    (Array.isArray(payload.itinerary) ? payload.itinerary.length : 0);
  const routeLabel = [trip.origin, trip.destination].filter(Boolean).join(" -> ");
  const selectedRouteType =
    route.routeType || route.selectedRouteVariant?.routeStyle || "Route type pending";
  const tripName =
    trip.title || route.name || `${trip.origin || "Origin"} to ${trip.destination || "Destination"}`;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.10)]">
      <div className="relative bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.20),transparent_30%),linear-gradient(135deg,#ffffff,#f7f9ff)] p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#2563eb] via-[#7c3aed] to-[#06b6d4]" />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4f46e5]/15 bg-[#eef2ff] px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#4f46e5]">
              <Sparkles size={15} />
              Smart Planner Review
            </div>

            <h1 className="mt-5 text-5xl font-black tracking-normal text-slate-950">
              Review Your Smart Trip
            </h1>
            <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-slate-600">
              Confirm your route, selected services, budget and booking
              readiness before proceeding.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {["Workspace", "Review", "Booking", "Payment", "Confirmation"].map(
                (step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <span
                      className={`inline-flex min-h-10 items-center rounded-full px-4 text-xs font-black ${
                        step === "Review"
                          ? "bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white shadow-[0_14px_30px_rgba(79,70,229,0.22)]"
                          : "border border-slate-200 bg-white text-slate-500"
                      }`}
                    >
                      {step}
                    </span>
                    {index < 4 ? (
                      <span className="h-px w-8 bg-slate-200" />
                    ) : null}
                  </div>
                )
              )}
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-white/80 bg-slate-950 p-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.20)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200">
                  Active Review
                </p>
                <h2 className="mt-2 text-2xl font-black leading-8">
                  {tripName}
                </h2>
              </div>
              <Route className="text-orange-300" size={28} />
            </div>

            <div className="mt-5 grid gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3">
                <MapPinned className="text-cyan-200" size={18} />
                <span className="text-sm font-bold text-white/82">
                  {routeLabel || route.name || "Route pending"}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3">
                <CalendarDays className="text-orange-200" size={18} />
                <span className="text-sm font-bold text-white/82">
                  {dateLabel(trip.startDate)} - {dateLabel(trip.endDate)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <Clock3 size={17} className="text-cyan-200" />
                  <p className="mt-2 text-lg font-black">{duration || 0}</p>
                  <p className="text-[11px] font-bold text-white/45">Days</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <UsersRound size={17} className="text-orange-200" />
                  <p className="mt-2 text-lg font-black">{travellersTotal}</p>
                  <p className="text-[11px] font-bold text-white/45">
                    Travellers
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="grid gap-4 border-t border-slate-100 bg-white p-6 md:grid-cols-2 xl:grid-cols-4">
        <HeroInfoCard label="Trip Name" value={tripName} />
        <HeroInfoCard label="Route / Destinations" value={routeLabel || route.name || ""} />
        <HeroInfoCard
          label="Date Range"
          value={`${dateLabel(trip.startDate)} - ${dateLabel(trip.endDate)}`}
        />
        <HeroInfoCard label="Duration" value={`${duration || 0} days`} />
        <HeroInfoCard label="Travellers" value={`${travellersTotal || 0}`} />
        <HeroInfoCard label="Trip Type" value={trip.tripType || "Custom Trip"} />
        <HeroInfoCard label="Selected Route Type" value={selectedRouteType} />
        <HeroInfoCard
          label="Created / Last Updated"
          value={`${dateTimeLabel(payload.createdAt)} / ${dateTimeLabel(payload.updatedAt)}`}
        />
      </div>
    </section>
  );
}
