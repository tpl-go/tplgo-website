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
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-[18px] font-semibold text-slate-900">
          Completed Journey
        </h1>
      </div>

      <div className="space-y-5 px-6 py-6">
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 px-5 py-8 text-[13px] text-slate-600">
            No completed bookings found.
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
                    <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700">
                      Completed
                    </span>
                  </div>

                  <h3 className="mt-3 text-[17px] font-semibold text-slate-900">
                    {booking.title}
                  </h3>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-[13px] text-slate-600 sm:grid-cols-2">
                    <p>Booking ID: {booking.id}</p>
                    <p>
                      Travel Date: {formatDateOnly(booking.travelDate)}
                    </p>
                    <p>Travellers: {booking.travellers}</p>
                    <p>Amount: {formatPrice(booking.amount)}</p>
                  </div>
                </div>

                <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:w-[250px]">
                  <p className="text-[12px] font-medium text-slate-500">
                    Voucher Status
                  </p>
                  <p className="mt-1 text-[16px] font-semibold text-slate-900">
                    Voucher Available
                  </p>

                  <button
                    type="button"
                    onClick={() => printBookingDocument(booking)} // ✅ FIX
                    className="mt-4 rounded-xl bg-[#0b5fff] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#094ee0]"
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