"use client";

import type { BookingItem } from "@/app/lib/booking/bookingStorage";

type CancelledJourneySectionProps = {
  bookings: BookingItem[];
};

export default function CancelledJourneySection({
  bookings,
}: CancelledJourneySectionProps) {

  return (
    <div className="bg-white">
      <div className="border-b border-gray-200 px-4 py-4 md:px-6 md:py-5">
        <h1 className="text-[17px] font-semibold text-slate-900 md:text-[18px]">
          Canceled Journey
        </h1>
      </div>

      <div className="space-y-4 px-3 py-4 md:space-y-5 md:px-6 md:py-6">
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 px-4 py-7 text-[13px] text-slate-600 md:px-5 md:py-8">
            No cancelled bookings found.
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-[18px] border border-gray-200 bg-white p-4 shadow-sm md:rounded-2xl md:p-5"
            >
              <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase text-slate-700 md:px-3 md:text-[11px]">
                      {booking.type}
                    </span>
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-700 md:px-3 md:text-[11px]">
                      Cancelled
                    </span>
                  </div>

                  <h3 className="mt-3 break-words text-[16px] font-semibold leading-6 text-slate-900 md:text-[17px]">
                    {booking.title}
                  </h3>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] text-slate-600 sm:grid-cols-2 md:text-[13px]">
                    <p className="min-w-0 break-words">Booking ID: {booking.id}</p>
                    <p>Travel Date: {formatDateOnly(booking.travelDate)}</p>
                    <p>
                      Cancelled At:{" "}
                      {booking.cancelMeta?.cancelledAt
                        ? formatDateTime(booking.cancelMeta.cancelledAt)
                        : "-"}
                    </p>
                    <p>
                      Reason: {booking.cancelMeta?.cancelReason || "Cancelled"}
                    </p>
                  </div>

                  {booking.cancelMeta?.cancellationPolicyText ? (
                    <div className="mt-4 break-words rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-[12px] font-medium leading-5 text-amber-800">
                      {booking.cancelMeta.cancellationPolicyText}
                    </div>
                  ) : null}
                </div>

                <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:w-[280px] lg:shrink-0">
                  <p className="text-[12px] font-medium text-slate-500">
                    Refund Amount
                  </p>
                  <p className="mt-1 text-[21px] font-semibold text-slate-900 md:text-[22px]">
                    {formatPrice(booking.refund?.amount || 0)}
                  </p>

                  <p className="mt-3 text-[12px] font-medium text-slate-500">
                    Refund Status
                  </p>
                  <p className="mt-1 text-[14px] font-semibold capitalize text-[#0b5fff]">
                    {booking.refund?.status || "Not Available"}
                  </p>

                  <div className="mt-4 grid gap-2 text-[12px] text-slate-600">
                    <div className="flex items-center justify-between gap-3">
                      <span>Cancellation Charge</span>
                      <span className="shrink-0 font-semibold text-slate-900">
                        {formatPrice(booking.cancelMeta?.cancellationCharge || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Refundable</span>
                      <span className="shrink-0 font-semibold text-green-700">
                        {formatPrice(booking.cancelMeta?.refundableAmount || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatPrice(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDateOnly(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
