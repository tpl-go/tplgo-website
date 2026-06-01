"use client";

import { Clock, FileText, ShieldCheck } from "lucide-react";

type VisaSummaryOption = {
  title?: string;
  country?: string;
  visaType?: string;
  processingTime?: string;
  validity?: string;
  stayDuration?: string;
};

type VisaSummarySearchData = {
  travellers?: number;
};

type Props = {
  option: VisaSummaryOption | null;
  searchData?: VisaSummarySearchData | null;
};

export default function VisaApplicationSummaryCard({ option, searchData }: Props) {
  if (!option) return null;

  return (
    <div className="min-w-0 rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
      <div className="mb-4">
        <p className="text-sm font-bold text-orange-600">Visa Application</p>
        <h1 className="mt-1 break-words text-[21px] font-extrabold leading-7 text-gray-950 md:text-2xl">
          {option.title}
        </h1>
        <p className="mt-2 break-words text-sm font-semibold leading-5 text-gray-700">
          {option.country} • {option.visaType} Visa •{" "}
          {searchData?.travellers || 1} Applicant
          {(searchData?.travellers || 1) > 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="min-w-0 rounded-2xl bg-gray-50 p-4">
          <Clock size={18} className="mb-2 text-orange-600" />
          <p className="text-xs font-bold text-gray-600">Processing Time</p>
          <p className="mt-1 break-words font-extrabold leading-5 text-gray-950">
            {option.processingTime}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl bg-gray-50 p-4">
          <ShieldCheck size={18} className="mb-2 text-orange-600" />
          <p className="text-xs font-bold text-gray-600">Validity</p>
          <p className="mt-1 break-words font-extrabold leading-5 text-gray-950">{option.validity}</p>
        </div>

        <div className="min-w-0 rounded-2xl bg-gray-50 p-4">
          <FileText size={18} className="mb-2 text-orange-600" />
          <p className="text-xs font-bold text-gray-600">Stay Duration</p>
          <p className="mt-1 break-words font-extrabold leading-5 text-gray-950">
            {option.stayDuration}
          </p>
        </div>
      </div>
    </div>
  );
}
