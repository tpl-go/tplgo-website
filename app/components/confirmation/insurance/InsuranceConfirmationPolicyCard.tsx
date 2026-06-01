"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import { formatCoverageAmount } from "@/app/lib/insurance/insurancePricing";

type Props = {
  data: any;
};

function yesNo(value: boolean) {
  return value ? "Yes" : "No";
}

export default function InsuranceConfirmationPolicyCard({ data }: Props) {
  const plan = data?.plan || {};
  const search = data?.search || data || {};
  const nominee = data?.nominee || {};

  return (
    <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-5">
      <div className="mb-4 flex min-w-0 items-center gap-3 md:mb-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
          <ShieldCheck size={22} />
        </div>

        <div className="min-w-0">
          <h2 className="break-words text-lg font-black text-gray-950">
            Policy Summary
          </h2>
          <p className="break-words text-sm font-semibold leading-5 text-gray-500">
            Coverage, destination and nominee details.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="min-w-0 rounded-2xl bg-gray-50 p-4">
          <p className="text-xs font-bold text-gray-500">Insurance Provider</p>
          <p className="mt-1 break-words text-sm font-black leading-5 text-gray-950">
            {data?.provider || plan?.provider || "Insurance Provider"}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl bg-gray-50 p-4">
          <p className="text-xs font-bold text-gray-500">Plan Name</p>
          <p className="mt-1 break-words text-sm font-black leading-5 text-gray-950">
            {data?.planName || plan?.planName || "Selected Plan"}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl bg-gray-50 p-4">
          <p className="text-xs font-bold text-gray-500">Insurance Type</p>
          <p className="mt-1 break-words text-sm font-black leading-5 text-gray-950">
            {data?.insuranceType || search?.insuranceType || plan?.insuranceType}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-orange-600" />
            <p className="text-xs font-bold text-gray-500">Destination</p>
          </div>
          <p className="mt-1 break-words text-sm font-black leading-5 text-gray-950">
            {data?.destination || search?.destination || "Selected destination"}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="text-orange-600" />
            <p className="text-xs font-bold text-gray-500">Travel Dates</p>
          </div>
          <p className="mt-1 break-words text-sm font-black leading-5 text-gray-950">
            {data?.travelDates || search?.travelDates || "Selected dates"}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl bg-gray-50 p-4">
          <p className="text-xs font-bold text-gray-500">Coverage Amount</p>
          <p className="mt-1 break-words text-sm font-black leading-5 text-gray-950">
            {formatCoverageAmount(
              Number(data?.coverageAmount || plan?.coverageAmount || 0)
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:mt-5 md:grid-cols-4 md:gap-4">
        <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
          <p className="text-xs font-bold text-green-700">Medical Cover</p>
          <p className="mt-1 break-words text-sm font-black text-green-900">
            {yesNo(Boolean(plan?.medicalCovered))}
          </p>
        </div>

        <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
          <p className="text-xs font-bold text-green-700">Covid Cover</p>
          <p className="mt-1 break-words text-sm font-black text-green-900">
            {yesNo(Boolean(plan?.covidCover))}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-bold text-blue-700">Cashless Hospitals</p>
          <p className="mt-1 break-words text-sm font-black text-blue-900">
            {yesNo(Boolean(plan?.cashlessHospitals))}
          </p>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4">
          <p className="text-xs font-bold text-purple-700">Visa Compliant</p>
          <p className="mt-1 break-words text-sm font-black text-purple-900">
            {yesNo(Boolean(plan?.visaCompliant))}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 p-4 md:mt-5">
        <p className="text-sm font-black text-gray-950">
          Nominee / Emergency Contact
        </p>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="min-w-0 rounded-xl bg-white/60 p-3 md:bg-transparent md:p-0">
            <p className="text-xs font-bold text-gray-500">Name</p>
            <p className="break-words text-sm font-extrabold text-gray-950">
              {nominee?.fullName || "Not added"}
            </p>
          </div>

          <div className="min-w-0 rounded-xl bg-white/60 p-3 md:bg-transparent md:p-0">
            <p className="text-xs font-bold text-gray-500">Relationship</p>
            <p className="break-words text-sm font-extrabold text-gray-950">
              {nominee?.relationship || "Not added"}
            </p>
          </div>

          <div className="min-w-0 rounded-xl bg-white/60 p-3 md:bg-transparent md:p-0">
            <p className="text-xs font-bold text-gray-500">Mobile</p>
            <p className="break-words text-sm font-extrabold text-gray-950">
              {nominee?.mobile || "Not added"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
