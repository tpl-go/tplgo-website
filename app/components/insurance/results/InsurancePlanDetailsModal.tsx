"use client";

import { InsurancePlan } from "@/app/lib/insurance/insuranceDummyData";
import {
  formatCoverageAmount,
  formatInsuranceMoney,
  getInsurancePlanTotal,
  getInsurancePlanTax,
} from "@/app/lib/insurance/insurancePricing";

type Props = {
  plan: InsurancePlan | null;
  onClose: () => void;
  onBuyNow?: (plan: InsurancePlan) => void;
};

export default function InsurancePlanDetailsModal({
  plan,
  onClose,
  onBuyNow,
}: Props) {
  if (!plan) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/45 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto max-h-[92vh] max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase text-orange-600">
                Plan Details
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-gray-950">
                {plan.provider} — {plan.planName}
              </h2>
              <p className="mt-1 text-sm font-semibold text-gray-500">
                Coverage {formatCoverageAmount(plan.coverageAmount)} • Claim
                Ratio {plan.claimSettlementRatio}%
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <h3 className="text-base font-extrabold text-gray-900">
                Key Benefits
              </h3>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-xl border border-green-100 bg-white p-3 text-sm font-bold text-gray-800"
                  >
                    ✅ {feature}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-4">
              <h3 className="text-base font-extrabold text-gray-900">
                Coverage Snapshot
              </h3>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl bg-orange-50 p-3">
                  <p className="text-xs font-semibold text-gray-500">
                    Medical Cover
                  </p>
                  <p className="text-sm font-extrabold text-gray-900">
                    {plan.medicalCovered ? "Covered" : "Not Covered"}
                  </p>
                </div>

                <div className="rounded-xl bg-orange-50 p-3">
                  <p className="text-xs font-semibold text-gray-500">
                    Cashless Hospitals
                  </p>
                  <p className="text-sm font-extrabold text-gray-900">
                    {plan.cashlessHospitals ? "Available" : "Not Available"}
                  </p>
                </div>

                <div className="rounded-xl bg-orange-50 p-3">
                  <p className="text-xs font-semibold text-gray-500">
                    Covid Cover
                  </p>
                  <p className="text-sm font-extrabold text-gray-900">
                    {plan.covidCover ? "Included" : "Not Included"}
                  </p>
                </div>

                <div className="rounded-xl bg-orange-50 p-3">
                  <p className="text-xs font-semibold text-gray-500">
                    Adventure Sports
                  </p>
                  <p className="text-sm font-extrabold text-gray-900">
                    {plan.adventureSportsCovered ? "Covered" : "Not Covered"}
                  </p>
                </div>

                <div className="rounded-xl bg-orange-50 p-3">
                  <p className="text-xs font-semibold text-gray-500">
                    Visa Compliant
                  </p>
                  <p className="text-sm font-extrabold text-gray-900">
                    {plan.visaCompliant ? "Yes" : "No"}
                  </p>
                </div>

                <div className="rounded-xl bg-orange-50 p-3">
                  <p className="text-xs font-semibold text-gray-500">
                    Schengen Compliant
                  </p>
                  <p className="text-sm font-extrabold text-gray-900">
                    {plan.schengenCompliant ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-4">
              <h3 className="text-base font-extrabold text-gray-900">
                Important Exclusions
              </h3>

              <div className="mt-3 space-y-2">
                {plan.exclusions.map((item) => (
                  <p
                    key={item}
                    className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700"
                  >
                    ⚠ {item}
                  </p>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-orange-100 bg-orange-50 p-4">
            <p className="text-xs font-semibold text-gray-500">
              Premium starts
            </p>
            <p className="mt-1 text-3xl font-extrabold text-gray-950">
              {formatInsuranceMoney(plan.premium)}
            </p>

            <div className="mt-4 space-y-2 rounded-xl bg-white p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Base Premium</span>
                <span className="font-bold text-gray-900">
                  {formatInsuranceMoney(plan.premium)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">GST</span>
                <span className="font-bold text-gray-900">
                  {formatInsuranceMoney(getInsurancePlanTax(plan))}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-2">
                <div className="flex justify-between">
                  <span className="font-extrabold text-gray-900">Total</span>
                  <span className="font-extrabold text-gray-950">
                    {formatInsuranceMoney(getInsurancePlanTotal(plan))}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onBuyNow?.(plan)}
              className="mt-4 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-extrabold text-white hover:bg-orange-600"
            >
              Buy Now
            </button>

            <p className="mt-3 text-xs font-semibold text-gray-500">
              Emergency Helpline: {plan.helpline}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}