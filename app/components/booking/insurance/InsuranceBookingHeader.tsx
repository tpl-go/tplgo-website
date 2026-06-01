"use client";

import { InsurancePlan } from "@/app/lib/insurance/insuranceDummyData";
import {
  formatCoverageAmount,
  formatInsuranceMoney,
  getInsurancePlanTotal,
} from "@/app/lib/insurance/insurancePricing";

type Props = {
  plan: InsurancePlan;
  searchData?: {
    search?: Record<string, string | number | string[] | undefined>;
    destination?: string;
    insuranceType?: string;
    travelDates?: string;
  };
};

export default function InsuranceBookingHeader({ plan, searchData }: Props) {
  const search = searchData?.search || searchData || {};

  return (
    <div className="min-w-0 rounded-[22px] border border-orange-100 bg-white p-4 shadow-sm md:rounded-3xl md:p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3 md:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-base font-extrabold text-orange-700 md:h-16 md:w-16 md:text-xl">
            {plan.logoText}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-wide text-orange-600">
              Insurance Booking
            </p>

            <h1 className="mt-1 break-words text-[20px] font-extrabold leading-7 text-gray-950 md:text-2xl">
              {plan.provider} — {plan.planName}
            </h1>

            <p className="mt-1 break-words text-sm font-semibold leading-5 text-gray-500">
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

        <div className="min-w-0 rounded-2xl border border-orange-100 bg-orange-50 p-4 lg:w-72">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-semibold text-gray-500">
                Coverage
              </p>
              <p className="break-words text-sm font-extrabold text-gray-950">
                {formatCoverageAmount(plan.coverageAmount)}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-gray-500">
                Claim Ratio
              </p>
              <p className="break-words text-sm font-extrabold text-gray-950">
                {plan.claimSettlementRatio}%
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-gray-500">
                Travel Dates
              </p>
              <p className="break-words text-sm font-extrabold text-gray-950">
                {search.travelDates || "Selected dates"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-gray-500">
                Premium
              </p>
              <p className="break-words text-sm font-extrabold text-gray-950">
                {formatInsuranceMoney(getInsurancePlanTotal(plan))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
