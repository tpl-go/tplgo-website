"use client";

import type { CabConfirmationBookingRecord } from "@/app/lib/cab/cabConfirmationTypes";
import {
  formatCabJourneyDate,
  formatCabRouteLabel,
} from "@/app/lib/cab/cabConfirmationHelpers";

export default function CabConfirmationTopCard({
  record,
}: {
  record: CabConfirmationBookingRecord;
}) {
  return (
    <section className="rounded-[22px] border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-4 shadow-sm md:p-6">
      <div className="flex flex-col items-stretch gap-5 md:flex-row md:flex-wrap md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="text-[14px] font-extrabold uppercase tracking-wide text-emerald-700">
            Booking Confirmed
          </div>

          <h1 className="mt-2 break-words text-[24px] font-black leading-tight text-slate-900 md:text-[30px]">
            {record.cab.brand ? `${record.cab.brand} ` : ""}
            {record.cab.name}
          </h1>

          <div className="mt-3 flex flex-wrap gap-2 text-[13px] font-semibold text-slate-600">
            <span>{formatCabRouteLabel(record)}</span>
            <span className="hidden sm:inline">•</span>
            <span>{formatCabJourneyDate(record)}</span>
            <span className="hidden sm:inline">•</span>
            <span>{record.searchMeta.pickupTime || "Time not selected"}</span>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-emerald-200 bg-white px-4 py-4 md:min-w-[220px] md:px-5">
          <div className="text-[12px] font-bold uppercase tracking-wide text-slate-500">
            Booking ID
          </div>
          <div className="mt-1 break-words text-[21px] font-black text-slate-900 md:text-[24px]">
            {record.bookingId}
          </div>

          <div className="mt-4 text-[12px] font-bold uppercase tracking-wide text-slate-500">
            Transaction ID
          </div>
          <div className="mt-1 break-words text-[14px] font-bold text-slate-800">
            {record.payment.transactionId}
          </div>
        </div>
      </div>
    </section>
  );
}
