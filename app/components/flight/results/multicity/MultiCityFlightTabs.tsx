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
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-1.5 shadow-sm md:p-2">
      <div className="flex gap-1.5 overflow-x-auto overflow-y-hidden pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-2 [&::-webkit-scrollbar]:hidden">
        {Array.from({ length: totalLegs }).map((_, index) => {
          const isActive = activeLegIndex === index;
          const isDone = selectedLegIndexes.includes(index);
          const leg = legs[index];

          return (
            <button
              key={index}
              type="button"
              onClick={() => onTabChange(index)}
              className={`min-w-[132px] rounded-xl border px-2.5 py-2 text-left transition md:min-w-[170px] md:px-3 ${
                isActive
                  ? "border-orange-500 bg-orange-50"
                  : isDone
                  ? "border-green-200 bg-green-50"
                  : "border-[#e5e7eb] bg-[#f8fafc] hover:bg-orange-50"
              }`}
            >
              <div
                className={`text-[10px] font-black md:text-[11px] md:font-semibold ${
                  isActive
                    ? "text-orange-600"
                    : isDone
                    ? "text-green-700"
                    : "text-[#6b7280]"
                }`}
              >
                Flight {index + 1} {isDone ? "✓" : ""}
              </div>

              <div className="mt-0.5 truncate text-[12px] font-black text-[#111827] md:text-[13px] md:font-semibold">
                {leg ? `${leg.fromCity} → ${leg.toCity}` : `Flight ${index + 1}`}
              </div>

              <div className="mt-0.5 truncate text-[10px] text-[#6b7280] md:text-[11px]">
                {leg?.departureDate || ""}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
