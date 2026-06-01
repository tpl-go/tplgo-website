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
    <div className="min-w-0 overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-lime-50 shadow-sm md:rounded-3xl">
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-5">
          <div className="min-w-0 flex-1">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-green-100 px-3 py-2 text-xs font-black text-green-700 md:px-4 md:text-sm">
              <CheckCircle2 size={18} />
              <span className="min-w-0 break-words">
                Visa Application Submitted
              </span>
            </div>

            <h1 className="mt-4 break-words text-2xl font-black leading-8 text-gray-950 md:text-3xl md:leading-9">
              {visaTitle}
            </h1>

            <p className="mt-2 break-words text-sm font-bold leading-5 text-gray-700">
              {country} visa application has been received by TPL Visa Desk.
            </p>
          </div>

          <div className="w-full rounded-2xl border border-white bg-white/80 px-4 py-3 text-left shadow-sm md:w-auto md:px-5 md:py-4 md:text-right">
            <p className="text-xs font-bold text-gray-500">Application ID</p>
            <p className="mt-1 break-words text-lg font-black leading-6 text-gray-950 md:text-xl">
              {applicationId}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:mt-6 md:grid-cols-3 md:gap-4">
          <div className="rounded-2xl border border-white bg-white/80 p-4">
            <FileCheck2 size={20} className="mb-2 text-orange-600" />
            <p className="text-xs font-bold text-gray-500">Application Status</p>
            <p className="mt-1 break-words text-base font-black text-gray-950">
              {applicationStatus}
            </p>
          </div>

          <div className="rounded-2xl border border-white bg-white/80 p-4">
            <CheckCircle2 size={20} className="mb-2 text-green-600" />
            <p className="text-xs font-bold text-gray-500">Payment Status</p>
            <p className="mt-1 break-words text-base font-black text-gray-950">
              {paymentStatus}
            </p>
          </div>

          <div className="rounded-2xl border border-white bg-white/80 p-4">
            <Clock3 size={20} className="mb-2 text-orange-600" />
            <p className="text-xs font-bold text-gray-500">Submitted On</p>
            <p className="mt-1 break-words text-base font-black text-gray-950">
              {bookedOn ? new Date(bookedOn).toLocaleString("en-IN") : "Today"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
