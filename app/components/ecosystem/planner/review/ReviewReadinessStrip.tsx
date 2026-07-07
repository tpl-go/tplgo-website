"use client";

import {
  Activity,
  BedDouble,
  CheckCircle2,
  Route,
  ShieldAlert,
  UsersRound,
} from "lucide-react";

import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";

type ReviewReadinessStripProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

function ReadinessPill({
  label,
  ready,
}: {
  label: string;
  ready: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${
        ready
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-orange-200 bg-orange-50 text-orange-800"
      }`}
    >
      <span className="text-sm font-black">{label}</span>
      <span className="inline-flex items-center gap-1.5 text-xs font-black">
        {ready ? <CheckCircle2 size={15} /> : <ShieldAlert size={15} />}
        {ready ? "Ready" : "Review"}
      </span>
    </div>
  );
}

export default function ReviewReadinessStrip({
  payload,
}: ReviewReadinessStripProps) {
  const basketItems = Array.isArray(payload.selectedBasketItems)
    ? payload.selectedBasketItems
    : [];
  const routeReady = Boolean(payload.route?.name || payload.trip?.origin);
  const travellerReady = Boolean((payload.travellers?.total || 0) > 0);
  const stayReady = Boolean(
    (payload.selectedHotels?.length || 0) +
      (payload.selectedHomestays?.length || 0) ||
      basketItems.some((item) => item.serviceType === "hotel")
  );
  const transportReady = Boolean(
    payload.route?.transportMode ||
      payload.preferences?.transportMode ||
      basketItems.some((item) => item.serviceType === "flight" || item.serviceType === "cab")
  );
  const activityReady = Boolean(
    (payload.selectedActivities?.length || 0) ||
      basketItems.some((item) => item.serviceType === "activity")
  );
  const quoteReady = Boolean(
    payload.quoteEstimate?.estimatedTotal ||
      payload.quoteEstimate?.totalQuoteEstimate ||
      payload.budgetEstimate?.totalEstimatedCost
  );

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
      <div className="flex items-center justify-between gap-5">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4f46e5]">
            Readiness Strip
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-normal text-slate-950">
            Booking inputs carried from Workspace
          </h2>
        </div>
        <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-600 lg:inline-flex">
          <Route size={17} className="text-[#4f46e5]" />
          No recalculation on Review
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <ReadinessPill label="Route" ready={routeReady} />
        <ReadinessPill label="Travellers" ready={travellerReady} />
        <ReadinessPill label="Transport" ready={transportReady} />
        <ReadinessPill label="Stay" ready={stayReady} />
        <ReadinessPill label="Activities" ready={activityReady} />
        <ReadinessPill label="Quote" ready={quoteReady} />
      </div>

      <div className="mt-5 grid gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600 lg:grid-cols-3">
        <div className="flex gap-3">
          <UsersRound size={18} className="mt-0.5 shrink-0 text-[#4f46e5]" />
          <span>
            Traveller count, rooms and trip type are read directly from the
            stored review payload.
          </span>
        </div>
        <div className="flex gap-3">
          <BedDouble size={18} className="mt-0.5 shrink-0 text-[#4f46e5]" />
          <span>
            Stays and transport reflect selected Workspace services or basket
            items.
          </span>
        </div>
        <div className="flex gap-3">
          <Activity size={18} className="mt-0.5 shrink-0 text-[#4f46e5]" />
          <span>
            Activities, Local Life and creator picks remain payload-driven for
            later sections.
          </span>
        </div>
      </div>
    </section>
  );
}
