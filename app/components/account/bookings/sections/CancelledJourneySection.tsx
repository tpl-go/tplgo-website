"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import {
  BOOKING_UPDATED_EVENT,
  getAllBookings,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";

export default function CancelledJourneySection() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadBookings = () => {
      const all = getAllBookings();
      const userMobile = user?.mobile?.trim();

      if (!userMobile) {
        setBookings([]);
        return;
      }

      setBookings(
        all.filter(
          (item) =>
            item.status === "cancelled" && item.mobile?.trim() === userMobile
        )
      );
    };

    loadBookings();
    window.addEventListener(BOOKING_UPDATED_EVENT, loadBookings);

    return () => {
      window.removeEventListener(BOOKING_UPDATED_EVENT, loadBookings);
    };
  }, [user]);

  return (
    <div className="bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-[18px] font-semibold text-slate-900">
          Canceled Journey
        </h1>
      </div>

      <div className="space-y-5 px-6 py-6">
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 px-5 py-8 text-[13px] text-slate-600">
            No cancelled bookings found.
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase text-slate-700">
                      {booking.type}
                    </span>
                    <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-700">
                      Cancelled
                    </span>
                  </div>

                  <h3 className="mt-3 text-[17px] font-semibold text-slate-900">
                    {booking.title}
                  </h3>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-[13px] text-slate-600 sm:grid-cols-2">
                    <p>Booking ID: {booking.id}</p>
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
                    <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-[12px] font-medium leading-5 text-amber-800">
                      {booking.cancelMeta.cancellationPolicyText}
                    </div>
                  ) : null}
                </div>

                <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:w-[280px]">
                  <p className="text-[12px] font-medium text-slate-500">
                    Refund Amount
                  </p>
                  <p className="mt-1 text-[22px] font-semibold text-slate-900">
                    {formatPrice(booking.refund?.amount || 0)}
                  </p>

                  <p className="mt-3 text-[12px] font-medium text-slate-500">
                    Refund Status
                  </p>
                  <p className="mt-1 text-[14px] font-semibold capitalize text-[#0b5fff]">
                    {booking.refund?.status || "Not Available"}
                  </p>

                  <div className="mt-4 grid gap-2 text-[12px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Cancellation Charge</span>
                      <span className="font-semibold text-slate-900">
                        {formatPrice(booking.cancelMeta?.cancellationCharge || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Refundable</span>
                      <span className="font-semibold text-green-700">
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