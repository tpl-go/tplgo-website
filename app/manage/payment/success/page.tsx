"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

/**
 * ✅ Service-wise correct detail route resolver
 */
function getDetailRoute(type: string, bookingId: string) {
  switch (type) {
    case "flight":
      return `/account/bookings/flight/${bookingId}`;
    case "hotel":
      return `/account/bookings/hotel/${bookingId}`;
    case "homestay":
      return `/account/bookings/homestay/${bookingId}`;
    case "bus":
      return `/account/bookings/bus/${bookingId}`;
    case "train":
      return `/account/bookings/train/${bookingId}`;
    case "cab":
      return `/account/bookings/cab/${bookingId}`;
    case "cruise":
      return `/account/bookings/cruise/${bookingId}`;
    case "package":
      return `/account/bookings/package/${bookingId}`;
    default:
      return `/account/bookings`;
  }
}

function ManagePaymentSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = searchParams.get("bookingId") || "";
  const type = searchParams.get("type") || "flight";
  const section = searchParams.get("section") || "";
  const paid = Number(searchParams.get("paid") || 0);

  const sectionLabel = useMemo(() => {
    if (section === "seats") return "Seat Update";
    if (section === "meals") return "Meal Update";
    if (section === "baggage") return "Baggage Update";
    if (section === "room-addons") return "Room Update";
    return "Booking Update";
  }, [section]);

  const handleViewBooking = () => {
    const route = getDetailRoute(type, bookingId);
    router.push(route);
  };

  return (
    <main className="min-h-screen bg-[#f8f9fb] px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:p-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ecfdf5] text-[34px]">
            ✓
          </div>

          <div className="mt-5 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#16a34a]">
              Payment Successful
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[#111827] md:text-3xl">
              {sectionLabel} completed successfully
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#6b7280]">
              Your manage booking payment has been processed and the booking has been updated successfully.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <InfoCard label="Booking ID" value={bookingId || "-"} />
            <InfoCard label="Service" value={type || "-"} />
            <InfoCard label="Paid Amount" value={formatCurrency(paid)} />
          </div>

          <div className="mt-8 rounded-[24px] bg-[#f8f9fb] p-5">
            <h2 className="text-base font-bold text-[#111827]">What happened now</h2>
            <div className="mt-4 space-y-3 text-sm text-[#4b5563]">
              <p>• Booking changes have been applied successfully.</p>
              <p>• Updated data will now reflect in My Bookings and Booking Detail.</p>
              <p>• Ticket, share and detail screens will use the refreshed booking payload.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleViewBooking}
              className="rounded-full bg-[#111827] px-6 py-3 text-sm font-semibold text-white"
            >
              View Updated Booking
            </button>

            <button
              type="button"
              onClick={() => router.push("/account/bookings")}
              className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-[#111827]"
            >
              Back to My Bookings
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-black/5 bg-[#f8f9fb] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-[#111827]">{value}</p>
    </div>
  );
}

export default function ManagePaymentSuccessPage() {
  return (
    <Suspense fallback={<div />}>
      <ManagePaymentSuccessPageContent />
    </Suspense>
  );
}