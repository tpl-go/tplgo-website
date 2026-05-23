"use client";

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
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
          <ShieldCheck size={22} />
        </div>

        <div>
          <h2 className="text-lg font-black text-gray-950">
            Policy Summary
          </h2>
          <p className="text-sm font-semibold text-gray-500">
            Coverage, destination and nominee details.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs font-bold text-gray-500">Insurance Provider</p>
          <p className="mt-1 text-sm font-black text-gray-950">
            {data?.provider || plan?.provider || "Insurance Provider"}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs font-bold text-gray-500">Plan Name</p>
          <p className="mt-1 text-sm font-black text-gray-950">
            {data?.planName || plan?.planName || "Selected Plan"}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs font-bold text-gray-500">Insurance Type</p>
          <p className="mt-1 text-sm font-black text-gray-950">
            {data?.insuranceType || search?.insuranceType || plan?.insuranceType}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-orange-600" />
            <p className="text-xs font-bold text-gray-500">Destination</p>
          </div>
          <p className="mt-1 text-sm font-black text-gray-950">
            {data?.destination || search?.destination || "Selected destination"}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="text-orange-600" />
            <p className="text-xs font-bold text-gray-500">Travel Dates</p>
          </div>
          <p className="mt-1 text-sm font-black text-gray-950">
            {data?.travelDates || search?.travelDates || "Selected dates"}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs font-bold text-gray-500">Coverage Amount</p>
          <p className="mt-1 text-sm font-black text-gray-950">
            {formatCoverageAmount(
              Number(data?.coverageAmount || plan?.coverageAmount || 0)
            )}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
          <p className="text-xs font-bold text-green-700">Medical Cover</p>
          <p className="mt-1 text-sm font-black text-green-900">
            {yesNo(Boolean(plan?.medicalCovered))}
          </p>
        </div>

        <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
          <p className="text-xs font-bold text-green-700">Covid Cover</p>
          <p className="mt-1 text-sm font-black text-green-900">
            {yesNo(Boolean(plan?.covidCover))}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-bold text-blue-700">Cashless Hospitals</p>
          <p className="mt-1 text-sm font-black text-blue-900">
            {yesNo(Boolean(plan?.cashlessHospitals))}
          </p>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4">
          <p className="text-xs font-bold text-purple-700">Visa Compliant</p>
          <p className="mt-1 text-sm font-black text-purple-900">
            {yesNo(Boolean(plan?.visaCompliant))}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 p-4">
        <p className="text-sm font-black text-gray-950">
          Nominee / Emergency Contact
        </p>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div>
            <p className="text-xs font-bold text-gray-500">Name</p>
            <p className="text-sm font-extrabold text-gray-950">
              {nominee?.fullName || "Not added"}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500">Relationship</p>
            <p className="text-sm font-extrabold text-gray-950">
              {nominee?.relationship || "Not added"}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500">Mobile</p>
            <p className="text-sm font-extrabold text-gray-950">
              {nominee?.mobile || "Not added"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}