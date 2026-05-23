"use client";

import { MultiCityLeg } from "../../data/multicityFlights";

type Props = {
  totalLegs: number;
  activeLegIndex: number;
  selectedLegIndexes: number[];
  onTabChange: (index: number) => void;
  legs: MultiCityLeg[];
};

export default function MultiCityFlightTabs({
  totalLegs,
  activeLegIndex,
  selectedLegIndexes,
  onTabChange,
  legs,
}: Props) {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-2 shadow-sm">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: totalLegs }).map((_, index) => {
          const isActive = activeLegIndex === index;
          const isDone = selectedLegIndexes.includes(index);
          const leg = legs[index];

          return (
            <button
              key={index}
              type="button"
              onClick={() => onTabChange(index)}
              className={`min-w-[170px] rounded-xl border px-3 py-2 text-left transition ${
                isActive
                  ? "border-orange-500 bg-orange-50"
                  : isDone
                  ? "border-green-200 bg-green-50"
                  : "border-[#e5e7eb] bg-[#f8fafc] hover:bg-orange-50"
              }`}
            >
              <div
                className={`text-[11px] font-semibold ${
                  isActive
                    ? "text-orange-600"
                    : isDone
                    ? "text-green-700"
                    : "text-[#6b7280]"
                }`}
              >
                Flight {index + 1} {isDone ? "✓" : ""}
              </div>

              <div className="mt-0.5 truncate text-[13px] font-semibold text-[#111827]">
                {leg ? `${leg.fromCity} → ${leg.toCity}` : `Flight ${index + 1}`}
              </div>

              <div className="mt-0.5 text-[11px] text-[#6b7280]">
                {leg?.departureDate || ""}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}