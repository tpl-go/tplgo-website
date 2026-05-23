"use client";

import React from "react";
import {
  MultiCityFareOption,
  MultiCityFlight,
} from "../../data/multicityFlights";

type Props = {
  fareOptions: MultiCityFareOption[];
  selectedFareId: string;
  onChange: (fareId: string) => void;
  onSelectFare: (fareId: string) => void;
  compareStartIndex: number;
  setCompareStartIndex: React.Dispatch<React.SetStateAction<number>>;
  compareVisibleCount: number;
  flight: MultiCityFlight;
};

export default function MultiCityCardComparePanel({
  fareOptions,
  selectedFareId,
  onChange,
  onSelectFare,
  compareStartIndex,
  setCompareStartIndex,
  compareVisibleCount,
  flight,
}: Props) {
  const compareVisibleFares = fareOptions.slice(
    compareStartIndex,
    compareStartIndex + compareVisibleCount
  );

  const canGoLeft = compareStartIndex > 0;
  const canGoRight = compareStartIndex + compareVisibleCount < fareOptions.length;

  return (
    <div className="overflow-hidden rounded-b-2xl">
      <div className="flex items-center justify-between border-b border-[#dbe4ef] bg-white px-4 py-3">
        <div className="text-[14px] font-semibold text-[#111827]">
          Services (Per Pax)
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              canGoLeft &&
              setCompareStartIndex((prev) => Math.max(prev - 1, 0))
            }
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-[16px] ${
              canGoLeft
                ? "border-[#cbd5e1] bg-white text-[#111827]"
                : "cursor-not-allowed border-[#e5e7eb] bg-[#f8fafc] text-[#cbd5e1]"
            }`}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() =>
              canGoRight && setCompareStartIndex((prev) => prev + 1)
            }
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-[16px] ${
              canGoRight
                ? "border-[#cbd5e1] bg-white text-[#111827]"
                : "cursor-not-allowed border-[#e5e7eb] bg-[#f8fafc] text-[#cbd5e1]"
            }`}
          >
            ›
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Left label column */}
        <div className="w-[220px] shrink-0 border-r border-[#dbe4ef] bg-[#f8fbff] p-4">
          <div className="space-y-0 overflow-hidden rounded-2xl border border-[#dbe4ef] bg-white">
            <div className="flex h-[72px] items-center rounded-t-2xl bg-[#eef4fb] px-4 text-[14px] font-semibold text-[#111827]">
              Services (Per Pax)
            </div>

            <div className="flex h-[108px] items-center border-t border-[#eceff3] bg-[#eef4fb] px-4 text-[14px] font-semibold text-[#111827]">
              Fares
            </div>

            <div className="border-t border-[#eceff3] bg-[#eef4fb] px-4 py-4">
              <div className="text-[14px] font-semibold text-[#111827]">
                Baggage Info
              </div>
              <div className="mt-2 text-[13px] text-[#374151]">
                Adult (Age 12+)
              </div>
            </div>

            <div className="flex h-[86px] items-center border-t border-[#eceff3] bg-[#eef4fb] px-4 text-[14px] font-semibold text-[#111827]">
              Stops
            </div>

            <div className="flex h-[86px] items-center border-t border-[#eceff3] bg-[#eef4fb] px-4 text-[14px] font-semibold text-[#111827]">
              Duration
            </div>

            <div className="flex h-[86px] items-center border-t border-[#eceff3] bg-[#eef4fb] px-4 text-[14px] font-semibold text-[#111827]">
              Sector
            </div>

            <div className="flex h-[110px] items-center rounded-b-2xl border-t border-[#eceff3] bg-[#eef4fb] px-4 text-[14px] font-semibold text-[#111827]">
              CTA
            </div>
          </div>
        </div>

        {/* Fare compare cards */}
        <div className="flex flex-1 gap-4 overflow-x-auto p-4">
          {compareVisibleFares.map((fare) => {
            const isSelected = selectedFareId === fare.id;

            return (
              <div
                key={fare.id}
                className={`flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border ${
                  isSelected ? "border-[#d1a67a] shadow-sm" : "border-[#e5e7eb]"
                } bg-white`}
              >
                <div
                  className={`flex h-[72px] items-center gap-2 border-b px-4 ${
                    isSelected ? "bg-[#d8c2a6]" : "bg-[#f9fafb]"
                  }`}
                >
                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => onChange(fare.id)}
                    className="h-4 w-4"
                  />
                  <span
                    className={`text-[14px] font-semibold ${
                      isSelected ? "text-[#111827]" : "text-[#b91c1c]"
                    }`}
                  >
                    {fare.label}
                  </span>
                </div>

                <div className="flex h-[78px] items-center justify-center border-b px-4 text-[24px] font-semibold text-[#111827]">
                  ₹{fare.price.toLocaleString("en-IN")}
                </div>

                <div className="grid h-[110px] grid-cols-2 border-b text-center">
                  <div className="border-r px-3 py-4">
                    <div className="text-[14px] font-medium text-[#111827]">
                      Check In Bag
                    </div>
                    <div className="mt-2 text-[13px] text-[#111827]">
                      {flight.baggage}
                    </div>
                  </div>
                  <div className="px-3 py-4">
                    <div className="text-[14px] font-medium text-[#111827]">
                      Cabin / Fare Type
                    </div>
                    <div className="mt-2 text-[13px] text-[#111827]">
                      {fare.subtitle}
                    </div>
                  </div>
                </div>

                <div className="flex h-[86px] items-center justify-center border-b px-4 text-[14px] text-[#111827]">
                  {flight.stopsText}
                </div>

                <div className="flex h-[86px] items-center justify-center border-b px-4 text-[14px] text-[#111827]">
                  {flight.duration}
                </div>

                <div className="flex h-[86px] items-center justify-center border-b px-4 text-[14px] text-[#111827]">
                  {flight.fromCode} → {flight.toCode}
                </div>

                <div className="flex h-[110px] flex-col items-center justify-center px-4 text-center">
                  <div className="mb-4 text-[14px] text-[#111827]">
                    {fare.subtitle}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectFare(fare.id)}
                    className="rounded bg-orange-500 px-6 py-2 text-[13px] font-semibold text-white hover:bg-orange-600"
                  >
                    SELECT
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white px-4 pb-5 pt-1 text-[13px] leading-7 text-[#7c5a5a]">
        <div>
          The airline fare shown is indicative and may vary depending on the
          selected fare option for this leg.
        </div>
        <div>Mentioned fares are Per Pax Per Sector.</div>
        <div>
          Final selection will be added to your Multi City sticky summary for
          the active leg.
        </div>
        <div>Review carefully before moving to the next flight leg.</div>
      </div>
    </div>
  );
}