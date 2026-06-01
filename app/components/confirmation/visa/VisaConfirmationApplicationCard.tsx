"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { CalendarDays, Clock, Globe2, ShieldCheck } from "lucide-react";

type Props = {
  data: any;
};

export default function VisaConfirmationApplicationCard({ data }: Props) {
  return (
    <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
      <h2 className="break-words text-lg font-black text-gray-950 md:text-xl">
        Application Details
      </h2>

      <div className="mt-4 grid gap-3 md:mt-5 md:grid-cols-2 md:gap-4">
        <div className="min-w-0 rounded-2xl bg-gray-50 p-4">
          <Globe2 size={18} className="mb-2 text-orange-600" />
          <p className="text-xs font-bold text-gray-500">Destination</p>
          <p className="mt-1 break-words font-black text-gray-950">
            {data?.country || "Not available"}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl bg-gray-50 p-4">
          <ShieldCheck size={18} className="mb-2 text-orange-600" />
          <p className="text-xs font-bold text-gray-500">Visa Type</p>
          <p className="mt-1 break-words font-black text-gray-950">
            {data?.visaType || "Not available"}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl bg-gray-50 p-4">
          <Clock size={18} className="mb-2 text-orange-600" />
          <p className="text-xs font-bold text-gray-500">Processing Time</p>
          <p className="mt-1 break-words font-black text-gray-950">
            {data?.processingTime || "As per embassy"}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl bg-gray-50 p-4">
          <CalendarDays size={18} className="mb-2 text-orange-600" />
          <p className="text-xs font-bold text-gray-500">Travel Date</p>
          <p className="mt-1 break-words font-black text-gray-950">
            {data?.travelDate || "Not available"}
          </p>
        </div>
      </div>
    </div>
  );
}
