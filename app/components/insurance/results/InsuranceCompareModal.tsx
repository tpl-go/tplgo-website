"use client";

import { InsurancePlan } from "@/app/lib/insurance/insuranceDummyData";
import {
  formatCoverageAmount,
  formatInsuranceMoney,
  getInsurancePlanTotal,
} from "@/app/lib/insurance/insurancePricing";

type Props = {
  plans: InsurancePlan[];
  onClose: () => void;
  onBuyNow?: (plan: InsurancePlan) => void;
};

function yesNo(value: boolean) {
  return value ? "✅ Yes" : "❌ No";
}

export default function InsuranceCompareModal({
  plans,
  onClose,
  onBuyNow,
}: Props) {
  if (plans.length < 2) return null;

  const rows = [
    {
      label: "Coverage Amount",
      value: (plan: InsurancePlan) => formatCoverageAmount(plan.coverageAmount),
    },
    {
      label: "Premium",
      value: (plan: InsurancePlan) => formatInsuranceMoney(plan.premium),
    },
    {
      label: "Total incl. GST",
      value: (plan: InsurancePlan) =>
        formatInsuranceMoney(getInsurancePlanTotal(plan)),
    },
    {
      label: "Claim Settlement Ratio",
      value: (plan: InsurancePlan) => `${plan.claimSettlementRatio}%`,
    },
    {
      label: "Medical Cover",
      value: (plan: InsurancePlan) => yesNo(plan.medicalCovered),
    },
    {
      label: "Adventure Sports",
      value: (plan: InsurancePlan) => yesNo(plan.adventureSportsCovered),
    },
    {
      label: "Cashless Hospitals",
      value: (plan: InsurancePlan) => yesNo(plan.cashlessHospitals),
    },
    {
      label: "Covid Cover",
      value: (plan: InsurancePlan) => yesNo(plan.covidCover),
    },
    {
      label: "Visa Compliant",
      value: (plan: InsurancePlan) => yesNo(plan.visaCompliant),
    },
    {
      label: "Schengen Compliant",
      value: (plan: InsurancePlan) => yesNo(plan.schengenCompliant),
    },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/45 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto max-h-[92vh] max-w-6xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase text-orange-600">
                Compare Plans
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-gray-950">
                Side-by-side Insurance Comparison
              </h2>
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

        <div className="p-5">
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="bg-orange-50">
                  <th className="w-56 border-b border-gray-100 p-4 text-sm font-extrabold text-gray-900">
                    Feature
                  </th>

                  {plans.map((plan) => (
                    <th
                      key={plan.id}
                      className="border-b border-gray-100 p-4 text-sm"
                    >
                      <p className="text-base font-extrabold text-gray-950">
                        {plan.provider}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-gray-500">
                        {plan.planName}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-gray-100">
                    <td className="p-4 text-sm font-bold text-gray-700">
                      {row.label}
                    </td>

                    {plans.map((plan) => (
                      <td
                        key={`${plan.id}-${row.label}`}
                        className="p-4 text-sm font-extrabold text-gray-900"
                      >
                        {row.value(plan)}
                      </td>
                    ))}
                  </tr>
                ))}

                <tr>
                  <td className="p-4 text-sm font-bold text-gray-700">
                    Action
                  </td>

                  {plans.map((plan) => (
                    <td key={`${plan.id}-action`} className="p-4">
                      <button
                        type="button"
                        onClick={() => onBuyNow?.(plan)}
                        className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-orange-600"
                      >
                        Buy Now
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs font-semibold text-gray-500">
            Final terms, exclusions and premium may change after insurer API
            validation.
          </p>
        </div>
      </div>
    </div>
  );
}