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
  offerBaseFareOffset?: number;
  activeOffer?: ActiveOfferSnapshot | null;
};

type DetailTab = "flight" | "fare" | "rules" | "baggage";

const COMPARE_VISIBLE_COUNT = 3;

type ActiveOfferSnapshot = {
  code: string;
  title: string;
  discountType: "flat" | "percent";
  discountValue: number;
  maxDiscount: number;
  minBookingValue: number;
};

function formatRupee(value: number) {
  return `₹${Math.max(0, Math.round(value)).toLocaleString("en-IN")}`;
}

export default function MultiCityFlightCard({
  flight,
  selectedFareId,
  isSelected,
  onSelect,
  offerBaseFareOffset = 0,
  activeOffer,
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
        className={`overflow-hidden rounded-2xl border bg-white shadow-sm md:hidden ${
          isSelected
            ? "border-[#f97316] ring-1 ring-[#fed7aa]"
            : "border-[#d9e2ef]"
        }`}
      >
        <div className="border-b border-[#eef2f7] bg-[#fff7ed] px-3 py-2 text-[11px] font-bold text-[#9a3412]">
          {flight.badge || "Recommended Multi City Fare"}
        </div>

        <div className="p-3">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-[13px] font-black leading-tight text-[#111827]">
                {flight.airline}
              </div>
              <div className="mt-0.5 text-[11px] font-semibold text-[#64748b]">
                {flight.flightNumber}
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#64748b]">
                from
              </div>
              <div className="text-[16px] font-black leading-tight text-[#111827]">
                {formatRupee(displayFare.price)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[74px_minmax(0,1fr)_74px] items-center gap-2">
            <div className="min-w-0">
              <div className="text-[21px] font-black leading-none text-[#111827]">
                {flight.departureTime}
              </div>
              <div className="mt-1 truncate text-[11px] font-bold text-[#475569]">
                {flight.fromCity}
              </div>
            </div>

            <div className="min-w-0 text-center">
              <div className="text-[11px] font-bold text-[#334155]">
                {flight.duration}
              </div>
              <div className="my-1 flex items-center gap-1">
                <div className="h-px flex-1 bg-[#cbd5e1]" />
                <span className="shrink-0 rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[9px] font-black text-[#475569]">
                  {flight.stopsText}
                </span>
                <div className="h-px flex-1 bg-[#cbd5e1]" />
              </div>
              <div className="truncate text-[10px] font-semibold text-[#0f766e]">
                {flight.baggage}
              </div>
            </div>

            <div className="min-w-0 text-right">
              <div className="text-[21px] font-black leading-none text-[#111827]">
                {flight.arrivalTime}
              </div>
              <div className="mt-1 truncate text-[11px] font-bold text-[#475569]">
                {flight.toCity}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[#eef7ff] px-2.5 py-1 text-[10px] font-bold text-[#0b66c3]">
              {displayFare.label}
            </span>
            {flight.seatLeft ? (
              <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-[10px] font-bold text-[#c2410c]">
                {flight.seatLeft} seats left
              </span>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#eef2f7] bg-[#fbfdff] px-3 py-2.5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-[12px] font-black text-[#111827]">
                {selectedFare ? "Selected Fare" : "Fare Preview"}
              </div>
              <div className="truncate text-[10px] font-semibold text-[#64748b]">
                {displayFare.subtitle}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCompareStartIndex(0);
                setShowCompare(true);
              }}
              className="shrink-0 text-[11px] font-black text-[#2563eb]"
            >
              Compare
            </button>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <div className="col-span-2 rounded-xl bg-white px-3 py-2 shadow-[0_4px_14px_rgba(15,23,42,0.05)]">
              <div className="text-[11px] font-bold uppercase text-[#64748b]">
                Segment fare
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <div className="min-w-0 truncate text-[11px] font-semibold text-[#64748b]">
                  {displayFare.subtitle}
                </div>
                <div className="shrink-0 text-[20px] font-black leading-none text-[#111827]">
                  {formatRupee(displayFare.price)}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSelectButton}
              className={`h-10 rounded-xl text-[12px] font-black ${
                isSelected ? "bg-[#f97316] text-white" : "bg-[#fff7ed] text-[#9a3412]"
              }`}
            >
              {isSelected ? "Selected" : "Select Fare"}
            </button>

            <button
              type="button"
              onClick={() => {
                setDetailsTab("flight");
                setShowDetails(true);
              }}
              className="h-10 rounded-xl border border-[#d9e2ef] bg-white px-3 text-[11px] font-black text-[#334155]"
            >
              Details
            </button>
          </div>
        </div>
      </div>

      <div
        className={`hidden overflow-visible rounded-xl border shadow-sm transition md:block ${cardClasses}`}
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
                    {formatRupee(displayFare.price)}
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
          key={`${flight.id}-${displayFare.id}`}
          flight={flight}
          selectedFare={displayFare}
          activeOffer={activeOffer}
          offerBaseAmount={offerBaseFareOffset + displayFare.price}
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
