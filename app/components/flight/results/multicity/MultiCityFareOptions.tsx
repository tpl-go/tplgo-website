"use client";

import { useMemo, useState } from "react";
import { MultiCityFareOption } from "../../data/multicityFlights";

type Props = {
  fareOptions: MultiCityFareOption[];
  selectedFareId?: string;
  onChange: (fareId: string) => void;
};

export default function MultiCityFareOptions({
  fareOptions,
  selectedFareId,
  onChange,
}: Props) {
  const [showAll, setShowAll] = useState(false);

  const compactVisibleFares = useMemo(() => {
    if (showAll) return fareOptions;

    const cheapestFare = fareOptions[0];
    const selectedFare = fareOptions.find((fare) => fare.id === selectedFareId);

    if (!cheapestFare) return [];
    if (fareOptions.length === 1) return [cheapestFare];

    if (!selectedFare) {
      return fareOptions.slice(0, 2);
    }

    if (selectedFare.id === cheapestFare.id) {
      return [cheapestFare, fareOptions[1]];
    }

    return [cheapestFare, selectedFare];
  }, [fareOptions, selectedFareId, showAll]);

  return (
    <div className="min-w-0">
      {compactVisibleFares.map((fare, index) => {
        const isSelected = selectedFareId === fare.id;

        return (
          <label
            key={fare.id}
            onClick={() => onChange(fare.id)}
            className={`flex cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2 transition ${
              isSelected
                ? "border border-[#f3b5a0] bg-[#fff5f2]"
                : "border border-[#e5e7eb] bg-white hover:border-[#f59e0b]"
            } ${index !== compactVisibleFares.length - 1 ? "mb-2" : ""}`}
          >
            <input
              type="radio"
              checked={isSelected}
              readOnly
              className="mt-1 h-3.5 w-3.5 shrink-0 accent-orange-500"
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold leading-4 text-[#111827]">
                    {fare.label}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-4 text-[#6b7280]">
                    {fare.subtitle}
                  </div>
                </div>

                <div className="shrink-0 whitespace-nowrap text-[13px] font-bold text-[#111827]">
                  ₹{fare.price.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </label>
        );
      })}

      {fareOptions.length > 2 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-1 text-[12px] font-semibold text-[#2563eb]"
          type="button"
        >
          {showAll ? "Show Less" : `+${fareOptions.length - 2} more fares`}
        </button>
      )}
    </div>
  );
}