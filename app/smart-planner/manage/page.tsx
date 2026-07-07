"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SmartPlannerManageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const bookingId = params?.get("bookingId") || "";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] text-slate-950">
      <div className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="text-2xl font-black">TPL</div>
          <button
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-800"
            onClick={() => router.push("/account/bookings")}
            type="button"
          >
            Back to My Bookings
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
          <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-700">
            Smart Planner Manage Booking
          </div>
          <h1 className="mt-4 text-3xl font-black text-slate-950">
            Manage options are being prepared
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
            Your Smart Planner booking is saved and accessible from My Bookings.
            Detailed modify, add-service and itinerary management actions will
            be available here without affecting your confirmed booking.
          </p>

          <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-700">
            <div className="flex items-center justify-between gap-4">
              <span>Booking ID</span>
              <span className="break-all text-right text-slate-950">
                {bookingId || "Not available"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Status</span>
              <span className="text-amber-700">Manage tools pending</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(249,115,22,0.25)]"
              onClick={() => router.push(`/account/bookings/planner/${encodeURIComponent(bookingId)}`)}
              type="button"
            >
              View Booking Detail
            </button>
            <button
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-900"
              onClick={() => router.push("/account/bookings")}
              type="button"
            >
              My Bookings
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function SmartPlannerManageFallback() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] text-slate-950">
      <div className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="text-2xl font-black">TPL</div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
          <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-700">
            Smart Planner Manage Booking
          </div>
          <h1 className="mt-4 text-3xl font-black text-slate-950">
            Manage options are being prepared
          </h1>
        </div>
      </div>
    </main>
  );
}

export default function SmartPlannerManagePage() {
  return (
    <Suspense fallback={<SmartPlannerManageFallback />}>
      <SmartPlannerManageContent />
    </Suspense>
  );
}
