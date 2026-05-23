"use client";

import { InsurancePlan } from "@/app/lib/insurance/insuranceDummyData";
import {
  formatCoverageAmount,
  formatInsuranceMoney,
  getInsurancePlanTotal,
} from "@/app/lib/insurance/insurancePricing";

type Props = {
  plan: InsurancePlan;
  searchData?: any;
};

export default function InsuranceBookingHeader({ plan, searchData }: Props) {
  const search = searchData?.search || searchData || {};

  return (
    <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-xl font-extrabold text-orange-700">
            {plan.logoText}
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-orange-600">
              Insurance Booking
            </p>

            <h1 className="mt-1 text-2xl font-extrabold text-gray-950">
              {plan.provider} — {plan.planName}
            </h1>

            <p className="mt-1 text-sm font-semibold text-gray-500">
              {search.destination || "International"} •{" "}
              {search.insuranceType || plan.insuranceType}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {plan.visaCompliant && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  Visa Compliant
                </span>
              )}

              {plan.cashlessHospitals && (
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                  Cashless
                </span>
              )}

              {plan.schengenCompliant && (
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                  Schengen
                </span>
              )}

              {plan.medicalCovered && (
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                  Medical Cover
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 lg:w-72">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-semibold text-gray-500">
                Coverage
              </p>
              <p className="text-sm font-extrabold text-gray-950">
                {formatCoverageAmount(plan.coverageAmount)}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-gray-500">
                Claim Ratio
              </p>
              <p className="text-sm font-extrabold text-gray-950">
                {plan.claimSettlementRatio}%
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-gray-500">
                Travel Dates
              </p>
              <p className="text-sm font-extrabold text-gray-950">
                {search.travelDates || "Selected dates"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-gray-500">
                Premium
              </p>
              <p className="text-sm font-extrabold text-gray-950">
                {formatInsuranceMoney(getInsurancePlanTotal(plan))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}