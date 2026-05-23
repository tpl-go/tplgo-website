"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import {
  BOOKING_UPDATED_EVENT,
  getAllBookings,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";

export default function RefundStatusSection() {
  const [refundBookings, setRefundBookings] = useState<BookingItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadRefunds = () => {
      const all = getAllBookings();
      const userMobile = user?.mobile?.trim();

      if (!userMobile) {
        setRefundBookings([]);
        return;
      }

      setRefundBookings(
        all.filter((item) => item.refund && item.mobile?.trim() === userMobile)
      );
    };

    loadRefunds();
    window.addEventListener(BOOKING_UPDATED_EVENT, loadRefunds);

    return () => {
      window.removeEventListener(BOOKING_UPDATED_EVENT, loadRefunds);
    };
  }, [user]);

  return (
    <div className="bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-[18px] font-semibold text-slate-900">
          Refund Status
        </h1>
      </div>

      <div className="space-y-5 px-6 py-6">
        {refundBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 px-5 py-8 text-[13px] text-slate-600">
            No refund records found.
          </div>
        ) : (
          refundBookings.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <h3 className="text-[17px] font-semibold text-slate-900">
                    {item.title}
                  </h3>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-[13px] text-slate-600 sm:grid-cols-2">
                    <p>Booking ID: {item.id}</p>
                    <p className="uppercase">Service: {item.type}</p>
                    <p>Travel Date: {formatDateOnly(item.travelDate)}</p>
                    <p>
                      Initiated:{" "}
                      {item.refund?.initiatedAt
                        ? formatDateTime(item.refund.initiatedAt)
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:w-[280px]">
                  <p className="text-[12px] font-medium text-slate-500">
                    Refund Amount
                  </p>
                  <p className="mt-1 text-[22px] font-semibold text-slate-900">
                    {formatPrice(item.refund?.amount || 0)}
                  </p>

                  <p className="mt-3 text-[12px] font-medium text-slate-500">
                    Current Status
                  </p>
                  <p className="mt-1 text-[14px] font-semibold capitalize text-[#0b5fff]">
                    {item.refund?.status || "Not Available"}
                  </p>

                  {item.refund?.completedAt ? (
                    <p className="mt-3 text-[12px] text-slate-500">
                      Completed on {formatDateTime(item.refund.completedAt)}
                    </p>
                  ) : null}
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