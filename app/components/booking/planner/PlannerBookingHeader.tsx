"use client";

import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import type { PlannerBookingPayload } from "./PlannerBookingPageShell";

export default function PlannerBookingHeader({
  payload,
}: {
  payload: PlannerBookingPayload;
}) {
  const router = useRouter();
  const title = payload.trip?.title || "Your Smart Planner Trip";

  return (
    <header className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_48%,#fff7ed_100%)] px-6 py-6">
        <button
          type="button"
          onClick={() => router.push("/smart-planner/review")}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Review
        </button>

        <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">
              Smart Planner Booking
            </div>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
              {title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
              Review selected basket items, itinerary, travellers and trip value before payment handoff.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
            <div className="flex items-center gap-2 text-sm font-black">
              <ShieldCheck className="h-5 w-5" />
              Existing TPL booking flow preserved
            </div>
            <div className="mt-1 text-xs font-semibold">
              Payment mapping will use the saved planner booking draft.
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
