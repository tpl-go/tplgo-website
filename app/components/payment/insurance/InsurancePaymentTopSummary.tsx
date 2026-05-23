"use client";

import { ShieldCheck } from "lucide-react";
import { formatCoverageAmount } from "@/app/lib/insurance/insurancePricing";

type Props = {
  payload: any;
};

export default function InsurancePaymentTopSummary({ payload }: Props) {
  const plan = payload?.plan || {};
  const search = payload?.search || {};
  const travellers = payload?.travellers || [];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d9e2ec] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#e5e7eb] bg-gradient-to-r from-orange-50 to-white px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
              <ShieldCheck size={24} />
            </div>

            <div>
              <p className="text-[12px] font-black uppercase text-orange-600">
                Insurance Payment
              </p>
              <h1 className="mt-1 text-[20px] font-black text-[#111827]">
                {plan?.provider} — {plan?.planName}
              </h1>
              <p className="mt-1 text-[13px] font-semibold text-[#64748b]">
                {search?.destination || "Selected destination"} •{" "}
                {search?.insuranceType || plan?.insuranceType || "Travel Insurance"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white px-4 py-3 text-right">
            <p className="text-[11px] font-bold text-[#64748b]">Coverage</p>
            <p className="text-[14px] font-black text-[#111827]">
              {formatCoverageAmount(Number(plan?.coverageAmount || 0))}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 px-5 py-4 md:grid-cols-4">
        <div className="rounded-xl bg-[#f8fafc] p-3">
          <p className="text-[11px] font-bold text-[#64748b]">Travellers</p>
          <p className="mt-1 text-[14px] font-black text-[#111827]">
            {travellers.length || 1} Member{travellers.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-xl bg-[#f8fafc] p-3">
          <p className="text-[11px] font-bold text-[#64748b]">Travel Dates</p>
          <p className="mt-1 text-[14px] font-black text-[#111827]">
            {search?.travelDates || "Selected dates"}
          </p>
        </div>

        <div className="rounded-xl bg-[#f8fafc] p-3">
          <p className="text-[11px] font-bold text-[#64748b]">Claim Ratio</p>
          <p className="mt-1 text-[14px] font-black text-[#111827]">
            {plan?.claimSettlementRatio || 0}%
          </p>
        </div>

        <div className="rounded-xl bg-[#f8fafc] p-3">
          <p className="text-[11px] font-bold text-[#64748b]">Policy Type</p>
          <p className="mt-1 text-[14px] font-black text-[#111827]">
            {plan?.insuranceType || "Travel Insurance"}
          </p>
        </div>
      </div>
    </div>
  );
}