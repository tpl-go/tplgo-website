"use client";

type SortKey = "recommended" | "premiumLow" | "coverageHigh" | "claimHigh";

type Props = {
  total: number;
  sortKey: SortKey;
  onSortChange: (value: SortKey) => void;
};

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Recommended", value: "recommended" },
  { label: "Premium Low to High", value: "premiumLow" },
  { label: "Coverage High to Low", value: "coverageHigh" },
  { label: "Claim Ratio High", value: "claimHigh" },
];

export default function InsuranceResultsSortBar({
  total,
  sortKey,
  onSortChange,
}: Props) {
  return (
    <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">
            Insurance Plans
          </h1>
          <p className="text-sm text-gray-500">
            {total} suitable plans found for your trip
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => {
            const active = sortKey === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSortChange(option.value)}
                className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                  active
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:text-orange-600"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}