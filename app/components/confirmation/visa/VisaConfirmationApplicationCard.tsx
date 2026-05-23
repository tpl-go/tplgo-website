"use client";

import { CalendarDays, Clock, Globe2, ShieldCheck } from "lucide-react";

type Props = {
  data: any;
};

export default function VisaConfirmationApplicationCard({ data }: Props) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-gray-950">
        Application Details
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-gray-50 p-4">
          <Globe2 size={18} className="mb-2 text-orange-600" />
          <p className="text-xs font-bold text-gray-500">Destination</p>
          <p className="mt-1 font-black text-gray-950">
            {data?.country || "Not available"}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <ShieldCheck size={18} className="mb-2 text-orange-600" />
          <p className="text-xs font-bold text-gray-500">Visa Type</p>
          <p className="mt-1 font-black text-gray-950">
            {data?.visaType || "Not available"}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <Clock size={18} className="mb-2 text-orange-600" />
          <p className="text-xs font-bold text-gray-500">Processing Time</p>
          <p className="mt-1 font-black text-gray-950">
            {data?.processingTime || "As per embassy"}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <CalendarDays size={18} className="mb-2 text-orange-600" />
          <p className="text-xs font-bold text-gray-500">Travel Date</p>
          <p className="mt-1 font-black text-gray-950">
            {data?.travelDate || "Not available"}
          </p>
        </div>
      </div>
    </div>
  );
}