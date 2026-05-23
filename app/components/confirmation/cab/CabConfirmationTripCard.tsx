"use client";

import type { CabConfirmationBookingRecord } from "@/app/lib/cab/cabConfirmationTypes";
import {
  formatCabJourneyDate,
  formatCabRouteLabel,
} from "@/app/lib/cab/cabConfirmationHelpers";

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-[15px] font-bold text-slate-900">{value}</div>
    </div>
  );
}

export default function CabConfirmationTripCard({
  record,
}: {
  record: CabConfirmationBookingRecord;
}) {
  const cabName = `${record.cab.brand ? `${record.cab.brand} ` : ""}${record.cab.name}`;

  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 text-[20px] font-extrabold text-slate-900">
        Trip Details
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoItem label="Route" value={formatCabRouteLabel(record)} />
        <InfoItem label="Journey Date" value={formatCabJourneyDate(record)} />
        <InfoItem
          label="Pick-up Time"
          value={record.searchMeta.pickupTime || "Not selected"}
        />
        <InfoItem label="Vehicle" value={cabName} />
      </div>
    </section>
  );
}