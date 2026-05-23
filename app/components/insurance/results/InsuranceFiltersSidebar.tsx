"use client";

import {
  defaultInsuranceFilters,
  getCoverageOptions,
  getInsuranceProviders,
  toggleFilterValue,
  type InsuranceFilterState,
} from "@/app/lib/insurance/insuranceFilters";
import { InsurancePlan } from "@/app/lib/insurance/insuranceDummyData";
import { formatCoverageAmount } from "@/app/lib/insurance/insurancePricing";

type Props = {
  plans: InsurancePlan[];
  filters: InsuranceFilterState;
  onChange: (filters: InsuranceFilterState) => void;
};

export default function InsuranceFiltersSidebar({
  plans,
  filters,
  onChange,
}: Props) {
  const providers = getInsuranceProviders(plans);
  const coverageOptions = getCoverageOptions(plans);

  const update = (next: Partial<InsuranceFilterState>) => {
    onChange({ ...filters, ...next });
  };

  const activeChips: { label: string; onRemove: () => void }[] = [
    ...filters.providers.map((provider) => ({
      label: provider,
      onRemove: () =>
        update({
          providers: filters.providers.filter((item) => item !== provider),
        }),
    })),

    ...filters.coverageAmounts.map((coverage) => ({
      label: formatCoverageAmount(Number(coverage)),
      onRemove: () =>
        update({
          coverageAmounts: filters.coverageAmounts.filter(
            (item) => item !== coverage
          ),
        }),
    })),

    ...(filters.medicalCovered
      ? [
          {
            label: "Medical Covered",
            onRemove: () => update({ medicalCovered: false }),
          },
        ]
      : []),

    ...(filters.adventureSportsCovered
      ? [
          {
            label: "Adventure Sports",
            onRemove: () => update({ adventureSportsCovered: false }),
          },
        ]
      : []),

    ...(filters.cashlessHospitals
      ? [
          {
            label: "Cashless Hospitals",
            onRemove: () => update({ cashlessHospitals: false }),
          },
        ]
      : []),

    ...(filters.covidCover
      ? [
          {
            label: "Covid Cover",
            onRemove: () => update({ covidCover: false }),
          },
        ]
      : []),

    ...(filters.visaCompliant
      ? [
          {
            label: "Visa Compliant",
            onRemove: () => update({ visaCompliant: false }),
          },
        ]
      : []),

    ...(filters.minClaimRatio > 0
      ? [
          {
            label: `${filters.minClaimRatio}%+ Claim Ratio`,
            onRemove: () => update({ minClaimRatio: 0 }),
          },
        ]
      : []),

    ...(filters.premiumRange[1] < 10000
      ? [
          {
            label: `Under ₹${filters.premiumRange[1].toLocaleString("en-IN")}`,
            onRemove: () => update({ premiumRange: [0, 10000] }),
          },
        ]
      : []),
  ];

  return (
    <aside className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-gray-900">Filters</h2>
          <p className="text-xs text-gray-500">Refine insurance plans</p>
        </div>

        <button
          type="button"
          onClick={() => onChange(defaultInsuranceFilters)}
          className="text-xs font-bold text-blue-600 hover:text-blue-700"
        >
          Clear All
        </button>
      </div>

      {activeChips.length > 0 && (
        <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-extrabold uppercase tracking-wide text-blue-700">
              Applied Filters
            </p>

            <button
              type="button"
              onClick={() => onChange(defaultInsuranceFilters)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.onRemove}
                className="group flex items-center gap-1 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-600 hover:text-white"
              >
                <span>{chip.label}</span>
                <span className="text-sm leading-none group-hover:text-white">
                  ×
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <section>
          <h3 className="mb-3 text-sm font-bold text-gray-900">
            Insurance Company
          </h3>

          <div className="space-y-2">
            {providers.map((provider) => (
              <label
                key={provider}
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={filters.providers.includes(provider)}
                  onChange={() =>
                    update({
                      providers: toggleFilterValue(
                        filters.providers,
                        provider
                      ),
                    })
                  }
                  className="h-4 w-4 accent-blue-600"
                />
                {provider}
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold text-gray-900">
            Coverage Amount
          </h3>

          <div className="space-y-2">
            {coverageOptions.map((coverage) => (
              <label
                key={coverage}
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={filters.coverageAmounts.includes(coverage)}
                  onChange={() =>
                    update({
                      coverageAmounts: toggleFilterValue(
                        filters.coverageAmounts,
                        coverage
                      ),
                    })
                  }
                  className="h-4 w-4 accent-blue-600"
                />
                {formatCoverageAmount(Number(coverage))}
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold text-gray-900">Benefits</h3>

          <div className="space-y-2">
            {[
              ["medicalCovered", "Medical Covered"],
              ["adventureSportsCovered", "Adventure Sports"],
              ["cashlessHospitals", "Cashless Hospitals"],
              ["covidCover", "Covid Cover"],
              ["visaCompliant", "Visa Compliant"],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={Boolean(filters[key as keyof InsuranceFilterState])}
                  onChange={() =>
                    update({
                      [key]: !filters[key as keyof InsuranceFilterState],
                    } as Partial<InsuranceFilterState>)
                  }
                  className="h-4 w-4 accent-blue-600"
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold text-gray-900">
            Claim Settlement Ratio
          </h3>

          <select
            value={filters.minClaimRatio}
            onChange={(event) =>
              update({ minClaimRatio: Number(event.target.value) })
            }
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-blue-400"
          >
            <option value={0}>Any</option>
            <option value={90}>90% and above</option>
            <option value={94}>94% and above</option>
            <option value={96}>96% and above</option>
          </select>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold text-gray-900">
            Premium Range
          </h3>

          <select
            value={filters.premiumRange[1]}
            onChange={(event) =>
              update({ premiumRange: [0, Number(event.target.value)] })
            }
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-blue-400"
          >
            <option value={10000}>Any Premium</option>
            <option value={500}>Under ₹500</option>
            <option value={1000}>Under ₹1,000</option>
            <option value={2000}>Under ₹2,000</option>
            <option value={3000}>Under ₹3,000</option>
          </select>
        </section>
      </div>
    </aside>
  );
}