"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import {
  getAllBookings,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";

// ✅ SAME AS UPCOMING
import { printBookingDocument } from "@/app/lib/booking/print/bookingPrintDispatcher";

export default function CompletedJourneySection() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const all = getAllBookings();
    const userMobile = user?.mobile?.trim();

    if (!userMobile) {
      setBookings([]);
      return;
    }

    setBookings(
      all.filter(
        (item) =>
          item.status === "completed" &&
          item.mobile?.trim() === userMobile
      )
    );
  }, [user]);

  return (
    <div className="bg-white">
      <div className="border-b border-gray-200 px-4 py-4 md:px-6 md:py-5">
        <h1 className="text-[17px] font-semibold text-slate-900 md:text-[18px]">
          Completed Journey
        </h1>
      </div>

      <div className="space-y-4 px-3 py-4 md:space-y-5 md:px-6 md:py-6">
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 px-4 py-7 text-[13px] text-slate-600 md:px-5 md:py-8">
            No completed bookings found.
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
                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700 md:px-3 md:text-[11px]">
                      Completed
                    </span>
                  </div>

                  <h3 className="mt-3 break-words text-[16px] font-semibold leading-6 text-slate-900 md:text-[17px]">
                    {booking.title}
                  </h3>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] text-slate-600 sm:grid-cols-2 md:text-[13px]">
                    <p className="min-w-0 break-words">Booking ID: {booking.id}</p>
                    <p>
                      Travel Date: {formatDateOnly(booking.travelDate)}
                    </p>
                    <p className="min-w-0 break-words">Travellers: {booking.travellers}</p>
                    <p>Amount: {formatPrice(booking.amount)}</p>
                  </div>
                </div>

                <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:w-[250px] lg:shrink-0">
                  <p className="text-[12px] font-medium text-slate-500">
                    Voucher Status
                  </p>
                  <p className="mt-1 text-[16px] font-semibold text-slate-900">
                    Voucher Available
                  </p>

                  <button
                    type="button"
                    onClick={() => printBookingDocument(booking)} // ✅ FIX
                    className="mt-4 min-h-10 w-full rounded-xl bg-[#0b5fff] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#094ee0] sm:w-auto"
                  >
                    Download Voucher
                  </button>
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
