"use client";

import { useEffect, useRef, useState } from "react";
import { Fare, StopDetail } from "./OneWayCardTypes";

type Props = {
  airline: string;
  code: string;
  depart: string;
  departCity: string;
  duration: string;
  stop: string;
  arrive: string;
  arriveCity: string;
  stopDetails?: StopDetail[];
  fares: Fare[];
  visibleFares: Fare[];
  selectedFareId: string;
  selectedFare: Fare;
  selectedFareOriginalPrice?: string;
  selectedFareFinalPrice?: string;
  selectedOfferDiscount?: number;
  showAllFares: boolean;
  setSelectedFareId: (id: string) => void;
  setShowAllFares: (value: boolean) => void;
  onToggleDetails: () => void;
  onToggleCompare: () => void;
  onBookNow: (payload: {
    airline: string;
    code: string;
    depart: string;
    departCity: string;
    duration: string;
    stop: string;
    arrive: string;
    arriveCity: string;
    stopDetails: StopDetail[];
    selectedFare: Fare;
  }) => void;
};

export default function OneWayCardMainRow({
  airline,
  code,
  depart,
  departCity,
  duration,
  stop,
  arrive,
  arriveCity,
  stopDetails = [],
  fares,
  selectedFareId,
  selectedFare,
  selectedFareOriginalPrice,
  selectedFareFinalPrice,
  selectedOfferDiscount = 0,
  showAllFares,
  setSelectedFareId,
  setShowAllFares,
  onToggleDetails,
  onToggleCompare,
  onBookNow,
}: Props) {
  const compactVisibleFares = (() => {
    if (showAllFares) return fares;

    const cheapestFare = fares[0];
    const selectedFareItem =
      fares.find((fare) => fare.id === selectedFareId) || fares[0];

    if (!cheapestFare) return [];

    if (fares.length === 1) return [cheapestFare];

    if (selectedFareItem.id === cheapestFare.id) {
      return [cheapestFare, fares[1]];
    }

    return [cheapestFare, selectedFareItem];
  })();

  const stopRef = useRef<HTMLDivElement | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<"top" | "bottom">(
    "bottom"
  );

  useEffect(() => {
    if (!showTooltip || !stopRef.current) return;

    const rect = stopRef.current.getBoundingClientRect();
    const tooltipHeight = 140;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < tooltipHeight && spaceAbove > tooltipHeight) {
      setTooltipPosition("top");
    } else {
      setTooltipPosition("bottom");
    }
  }, [showTooltip]);

  const renderFlightStopTooltip = () => {
    if (!stopDetails.length || !showTooltip) return null;

    return (
      <div
        className={`absolute left-1/2 z-30 w-[220px] -translate-x-1/2 rounded-lg border border-[#dbe4ef] bg-white p-3 text-left shadow-lg ${
          tooltipPosition === "top" ? "bottom-full mb-2" : "top-full mt-2"
        }`}
      >
        {stopDetails.map((item, index) => (
          <div
            key={`${item.airport}-${index}`}
            className={index !== 0 ? "mt-3" : ""}
          >
            <div className="text-[12px] font-semibold text-[#111827]">
              {item.type}
            </div>
            <div className="mt-1 text-[12px] text-[#374151]">
              {item.airport} | {item.layover} Layover
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-[155px_minmax(360px,1fr)_360px]">
      <div className="min-w-0 self-start">
        <div className="text-[17px] font-bold leading-tight text-[#111827]">
          {airline}
        </div>

        <div className="mt-1 text-[12px] text-[#6b7280]">{code}</div>

        <div className="mt-6 inline-flex rounded-full bg-[#fdecee] px-2.5 py-1 text-[12px] font-medium text-[#c2415d]">
          Seats left: 9
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={onToggleDetails}
            className="text-[14px] font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
          >
            View Details +
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[90px_minmax(150px,1fr)_90px] items-start gap-4 self-start">
        <div className="min-w-0">
          <div className="text-right text-[28px] font-bold leading-none text-[#111827]">
            {depart}
          </div>
          <div className="mt-1 text-center text-[14px] text-[#4b5563]">
            {departCity}
          </div>
        </div>

        <div className="min-w-0 pt-1 text-center">
          <div className="text-[13px] font-medium text-[#4b5563]">
            {duration}
          </div>

          <div className="mt-1 flex items-center justify-center gap-2">
            <div className="h-[2px] flex-1 bg-[#d1d5db]" />

            <div
              ref={stopRef}
              className="group relative shrink-0 text-[12px] font-medium text-[#6b7280]"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              {stop}
              {renderFlightStopTooltip()}
            </div>

            <div className="h-[2px] flex-1 bg-[#d1d5db]" />
          </div>

          <div className="mt-6 inline-flex rounded-full bg-[#e8f2ff] px-2.5 py-1 text-[11px] font-medium text-[#2563eb]">
            7kg Cabin • 15kg Check-in
          </div>

          <button
            type="button"
            onClick={onToggleCompare}
            className="mt-8 block w-full text-center text-[15px] font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
          >
            Compare Fares
          </button>
        </div>

        <div className="min-w-0">
          <div className="text-start text-[28px] font-bold leading-none text-[#111827]">
            {arrive}
          </div>
          <div className="mt-1 text-center text-[14px] text-[#4b5563]">
            {arriveCity}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_125px] items-start gap-3 self-start">
        <div className="min-w-0">
          {compactVisibleFares.map((fare, index) => {
            const isSelected = selectedFareId === fare.id;

            return (
              <label
                key={fare.id}
                className={`flex cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2 transition ${
                  isSelected
                    ? "border border-[#f3b5a0] bg-[#fff5f2]"
                    : "border border-[#e5e7eb] bg-white hover:border-[#f59e0b]"
                } ${index !== compactVisibleFares.length - 1 ? "mb-2" : ""}`}
              >
                <input
                  type="radio"
                  name={`fare-${code}`}
                  checked={isSelected}
                  onChange={() => setSelectedFareId(fare.id)}
                  className="mt-1 h-3.5 w-3.5 shrink-0 accent-orange-500"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold leading-4 text-[#111827]">
                        {fare.title}
                      </div>
                      <div className="mt-0.5 text-[11px] leading-4 text-[#6b7280]">
                        {fare.baggage}
                      </div>
                    </div>

                    <div className="shrink-0 whitespace-nowrap text-[13px] font-bold text-[#111827]">
                      {fare.price}
                    </div>
                  </div>
                </div>
              </label>
            );
          })}

          {fares.length > 2 && (
            <button
              onClick={() => setShowAllFares(!showAllFares)}
              className="mt-1 text-[12px] font-semibold text-[#2563eb]"
              type="button"
            >
              {showAllFares ? "Show Less" : `+${fares.length - 2} more fares`}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2 self-start">
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3 text-left shadow-[0_4px_14px_rgba(0,0,0,0.05)]">
            <div className="text-[11px] text-[#6b7280]">Selected Fare</div>

            {selectedOfferDiscount > 0 && selectedFareFinalPrice ? (
              <div className="mt-1">
                <div className="text-[12px] font-semibold leading-tight text-[#9ca3af] line-through">
                  {selectedFareOriginalPrice || selectedFare.price}
                </div>

                <div className="text-[20px] font-black leading-tight text-[#111827]">
                  {selectedFareFinalPrice}
                </div>
              </div>
            ) : (
              <div className="mt-1 text-[18px] font-bold leading-tight text-[#111827]">
                {selectedFare.price}
              </div>
            )}

            <div className="mt-1 text-[11px] leading-4 text-[#6b7280]">
              {selectedFare.baggage}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onBookNow({
                airline,
                code,
                depart,
                departCity,
                duration,
                stop,
                arrive,
                arriveCity,
                stopDetails,
                selectedFare,
              })
            }
            className="rounded-xl border border-[#efb39d] bg-white px-4 py-2 text-[13px] font-semibold text-[#9a3412] shadow-[0_6px_16px_rgba(239,115,22,0.12)] transition hover:bg-[#fff7ed]"
          >
            BOOK NOW
          </button>
        </div>
      </div>
    </div>
  );
}