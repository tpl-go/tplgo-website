"use client";

import { Clock, FileText, ShieldCheck } from "lucide-react";

type Props = {
  option: any;
  searchData: any;
};

export default function VisaApplicationSummaryCard({ option, searchData }: Props) {
  if (!option) return null;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-bold text-orange-600">Visa Application</p>
        <h1 className="mt-1 text-2xl font-extrabold text-gray-950">
          {option.title}
        </h1>
        <p className="mt-2 text-sm font-semibold text-gray-700">
          {option.country} • {option.visaType} Visa •{" "}
          {searchData?.travellers || 1} Applicant
          {(searchData?.travellers || 1) > 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-gray-50 p-4">
          <Clock size={18} className="mb-2 text-orange-600" />
          <p className="text-xs font-bold text-gray-600">Processing Time</p>
          <p className="mt-1 font-extrabold text-gray-950">
            {option.processingTime}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <ShieldCheck size={18} className="mb-2 text-orange-600" />
          <p className="text-xs font-bold text-gray-600">Validity</p>
          <p className="mt-1 font-extrabold text-gray-950">{option.validity}</p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <FileText size={18} className="mb-2 text-orange-600" />
          <p className="text-xs font-bold text-gray-600">Stay Duration</p>
          <p className="mt-1 font-extrabold text-gray-950">
            {option.stayDuration}
          </p>
        </div>
      </div>
    </div>
  );
}