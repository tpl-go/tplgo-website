"use client";

import type { BookingItem } from "@/app/lib/booking/bookingStorage";

type RefundStatusSectionProps = {
  bookings: BookingItem[];
};

export default function RefundStatusSection({
  bookings: refundBookings,
}: RefundStatusSectionProps) {

  return (
    <div className="bg-white">
      <div className="border-b border-gray-200 px-4 py-4 md:px-6 md:py-5">
        <h1 className="text-[17px] font-semibold text-slate-900 md:text-[18px]">
          Refund Status
        </h1>
      </div>

      <div className="space-y-4 px-3 py-4 md:space-y-5 md:px-6 md:py-6">
        {refundBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 px-4 py-7 text-[13px] text-slate-600 md:px-5 md:py-8">
            No refund records found.
          </div>
        ) : (
          refundBookings.map((item) => (
            <div
              key={item.id}
              className="rounded-[18px] border border-gray-200 bg-white p-4 shadow-sm md:rounded-2xl md:p-5"
            >
              <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <h3 className="break-words text-[16px] font-semibold leading-6 text-slate-900 md:text-[17px]">
                    {item.title}
                  </h3>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] text-slate-600 sm:grid-cols-2 md:text-[13px]">
                    <p className="min-w-0 break-words">Booking ID: {item.id}</p>
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

                <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:w-[280px] lg:shrink-0">
                  <p className="text-[12px] font-medium text-slate-500">
                    Refund Amount
                  </p>
                  <p className="mt-1 text-[21px] font-semibold text-slate-900 md:text-[22px]">
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
