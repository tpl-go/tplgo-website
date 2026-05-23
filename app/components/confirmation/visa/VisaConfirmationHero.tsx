"use client";

import { CheckCircle2, Clock3, FileCheck2 } from "lucide-react";

type Props = {
  applicationId: string;
  visaTitle: string;
  country: string;
  applicationStatus: string;
  paymentStatus: string;
  bookedOn: string;
};

export default function VisaConfirmationHero({
  applicationId,
  visaTitle,
  country,
  applicationStatus,
  paymentStatus,
  bookedOn,
}: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-lime-50 shadow-sm">
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-black text-green-700">
              <CheckCircle2 size={18} />
              Visa Application Submitted
            </div>

            <h1 className="mt-4 text-3xl font-black text-gray-950">
              {visaTitle}
            </h1>

            <p className="mt-2 text-sm font-bold text-gray-700">
              {country} visa application has been received by TPL Visa Desk.
            </p>
          </div>

          <div className="rounded-2xl border border-white bg-white/80 px-5 py-4 text-right shadow-sm">
            <p className="text-xs font-bold text-gray-500">Application ID</p>
            <p className="mt-1 text-xl font-black text-gray-950">
              {applicationId}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white bg-white/80 p-4">
            <FileCheck2 size={20} className="mb-2 text-orange-600" />
            <p className="text-xs font-bold text-gray-500">Application Status</p>
            <p className="mt-1 text-base font-black text-gray-950">
              {applicationStatus}
            </p>
          </div>

          <div className="rounded-2xl border border-white bg-white/80 p-4">
            <CheckCircle2 size={20} className="mb-2 text-green-600" />
            <p className="text-xs font-bold text-gray-500">Payment Status</p>
            <p className="mt-1 text-base font-black text-gray-950">
              {paymentStatus}
            </p>
          </div>

          <div className="rounded-2xl border border-white bg-white/80 p-4">
            <Clock3 size={20} className="mb-2 text-orange-600" />
            <p className="text-xs font-bold text-gray-500">Submitted On</p>
            <p className="mt-1 text-base font-black text-gray-950">
              {bookedOn ? new Date(bookedOn).toLocaleString("en-IN") : "Today"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}