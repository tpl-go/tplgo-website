"use client";

import { useMemo, useState } from "react";
import {
  MultiCityFareOption,
  MultiCityFlight,
} from "../../data/multicityFlights";
import MultiCityFareOptions from "./MultiCityFareOptions";
import MultiCityModal from "./MultiCityModal";
import MultiCityCardDetailsPanel from "./MultiCityCardDetailsPanel";
import MultiCityCardComparePanel from "./MultiCityCardComparePanel";

type Props = {
  flight: MultiCityFlight;
  selectedFareId?: string;
  isSelected: boolean;
  onSelect: (flight: MultiCityFlight, fare: MultiCityFareOption) => void;
};

type DetailTab = "flight" | "fare" | "rules" | "baggage";

const COMPARE_VISIBLE_COUNT = 3;

export default function MultiCityFlightCard({
  flight,
  selectedFareId,
  isSelected,
  onSelect,
}: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [compareStartIndex, setCompareStartIndex] = useState(0);
  const [detailsTab, setDetailsTab] = useState<DetailTab>("flight");

  const selectedFare =
    flight.fareOptions.find((fare) => fare.id === selectedFareId) || null;

  const displayFare = selectedFare || flight.fareOptions[0];

  const handleFareChange = (fareId: string) => {
    const fare = flight.fareOptions.find((item) => item.id === fareId);
    if (!fare) return;
    onSelect(flight, fare);
  };

  const handleSelectButton = () => {
    onSelect(flight, displayFare);
  };

  const cardClasses = useMemo(() => {
    return isSelected
      ? "border-[#f59e0b] bg-[#fff7f3] ring-1 ring-[#fed7aa]"
      : "border-[#e5e7eb] bg-white hover:border-[#f59e0b]";
  }, [isSelected]);

  return (
    <>
      <div
        className={`overflow-visible rounded-xl border shadow-sm transition ${cardClasses}`}
      >
        <div className="bg-[#fff7ed] px-4 py-2 text-[13px] text-gray-700">
          {flight.badge || "Recommended Multi City Fare"}
        </div>

        <div className="px-4 py-3">
          <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-[155px_minmax(360px,1fr)_360px]">
            {/* Left */}
            <div className="min-w-0 self-start">
              <div className="text-[17px] font-bold leading-tight text-[#111827]">
                {flight.airline}
              </div>

              <div className="mt-1 text-[12px] text-[#6b7280]">
                {flight.flightNumber}
              </div>

              {flight.seatLeft ? (
                <div className="mt-6 inline-flex rounded-full bg-[#fdecee] px-2.5 py-1 text-[12px] font-medium text-[#c2415d]">
                  Seats left: {flight.seatLeft}
                </div>
              ) : null}

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setDetailsTab("flight");
                    setShowDetails(true);
                  }}
                  className="text-[14px] font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
                >
                  View Details +
                </button>
              </div>
            </div>

            {/* Middle */}
            <div className="grid grid-cols-[90px_minmax(150px,1fr)_90px] items-start gap-4 self-start">
              <div className="min-w-0">
                <div className="text-right text-[28px] font-bold leading-none text-[#111827]">
                  {flight.departureTime}
                </div>
                <div className="mt-1 text-center text-[14px] text-[#4b5563]">
                  {flight.fromCity}
                </div>
              </div>

              <div className="min-w-0 pt-1 text-center">
                <div className="text-[13px] font-medium text-[#4b5563]">
                  {flight.duration}
                </div>

                <div className="mt-1 flex items-center justify-center gap-2">
                  <div className="h-[2px] flex-1 bg-[#d1d5db]" />
                  <div className="shrink-0 text-[12px] font-medium text-[#6b7280]">
                    {flight.stopsText}
                  </div>
                  <div className="h-[2px] flex-1 bg-[#d1d5db]" />
                </div>

                <div className="mt-6 inline-flex rounded-full bg-[#e8f2ff] px-2.5 py-1 text-[11px] font-medium text-[#2563eb]">
                  {flight.baggage}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCompareStartIndex(0);
                    setShowCompare(true);
                  }}
                  className="mt-8 block w-full text-center text-[15px] font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
                >
                  Compare Fares
                </button>
              </div>

              <div className="min-w-0">
                <div className="text-start text-[28px] font-bold leading-none text-[#111827]">
                  {flight.arrivalTime}
                </div>
                <div className="mt-1 text-center text-[14px] text-[#4b5563]">
                  {flight.toCity}
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="grid grid-cols-[1fr_125px] items-start gap-3 self-start">
              <div className="min-w-0">
                <MultiCityFareOptions
                  fareOptions={flight.fareOptions}
                  selectedFareId={selectedFareId}
                  onChange={handleFareChange}
                />
              </div>

              <div className="flex flex-col gap-2 self-start">
                <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3 text-left shadow-[0_4px_14px_rgba(0,0,0,0.05)]">
                  <div className="text-[11px] text-[#6b7280]">
                    {selectedFare ? "Selected Fare" : "Fare Preview"}
                  </div>
                  <div className="mt-1 text-[18px] font-bold leading-tight text-[#111827]">
                    ₹{displayFare.price.toLocaleString("en-IN")}
                  </div>
                  <div className="mt-1 text-[11px] leading-4 text-[#6b7280]">
                    {displayFare.subtitle}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSelectButton}
                  className={`rounded-xl px-4 py-2 text-[13px] font-semibold transition ${
                    isSelected
                      ? "bg-[#f59e0b] text-white shadow-[0_6px_16px_rgba(239,115,22,0.18)]"
                      : "border border-[#efb39d] bg-white text-[#9a3412] shadow-[0_6px_16px_rgba(239,115,22,0.12)] hover:bg-[#fff7ed]"
                  }`}
                >
                  {isSelected ? "SELECTED ✓" : "SELECT"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MultiCityModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Flight Details"
        maxWidthClass="max-w-5xl"
      >
        <MultiCityCardDetailsPanel
          flight={flight}
          selectedFare={displayFare}
          activeTab={detailsTab}
          setActiveTab={setDetailsTab}
        />
      </MultiCityModal>

      <MultiCityModal
        isOpen={showCompare}
        onClose={() => setShowCompare(false)}
        title="Compare Fares"
        maxWidthClass="max-w-7xl"
      >
        <MultiCityCardComparePanel
  fareOptions={flight.fareOptions}
  selectedFareId={selectedFareId || ""}
  onChange={handleFareChange}
  onSelectFare={(fareId) => {
    handleFareChange(fareId);
    setShowCompare(false);
  }}
  compareStartIndex={compareStartIndex}
  setCompareStartIndex={setCompareStartIndex}
  compareVisibleCount={COMPARE_VISIBLE_COUNT}
  flight={flight}
/>
      </MultiCityModal>
    </>
  );
}