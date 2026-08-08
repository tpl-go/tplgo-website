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
  baggageSummary?: string;
  cabinBaggage?: string;
  checkedBaggage?: string;
  availabilityLabel?: string;
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
  baggageSummary = "Not provided by supplier",
  cabinBaggage = "Cabin not provided",
  checkedBaggage = "Checked not provided",
  availabilityLabel = "Subject to recheck",
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
    <>
      <div className="md:hidden">
        <div className="rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.07)]">
          <div className="flex items-start justify-between gap-3 border-b border-[#eef2f7] px-3.5 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef6ff] text-[12px] font-black text-[#0b66c3]">
                {airline.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[14px] font-black leading-tight text-[#111827]">{airline}</div>
                <div className="mt-0.5 text-[11px] font-semibold text-[#64748b]">{code}</div>
              </div>
            </div>
            <div className="shrink-0 rounded-full bg-[#fff1f2] px-2.5 py-1 text-[10px] font-extrabold text-[#be123c]">{availabilityLabel}</div>
          </div>

          <div className="px-3.5 py-3">
            <div className="grid grid-cols-[72px_minmax(0,1fr)_72px] items-start gap-2">
              <div className="min-w-0">
                <div className="text-[22px] font-black leading-none text-[#111827]">{depart}</div>
                <div className="mt-1 truncate text-[12px] font-semibold text-[#475569]">{departCity}</div>
              </div>
              <div className="min-w-0 px-1 pt-1 text-center">
                <div className="text-[11px] font-extrabold text-[#475569]">{duration}</div>
                <div className="mt-1 flex items-center justify-center gap-1.5">
                  <div className="h-[2px] flex-1 rounded-full bg-[#cbd5e1]" />
                  <button type="button" className="group relative shrink-0 rounded-full bg-[#f8fafc] px-2 py-0.5 text-[10px] font-bold text-[#64748b]" onClick={() => stopDetails.length && setShowTooltip((prev) => !prev)}>
                    {stop}
                    {renderFlightStopTooltip()}
                  </button>
                  <div className="h-[2px] flex-1 rounded-full bg-[#cbd5e1]" />
                </div>
              </div>
              <div className="min-w-0 text-right">
                <div className="text-[22px] font-black leading-none text-[#111827]">{arrive}</div>
                <div className="mt-1 truncate text-[12px] font-semibold text-[#475569]">{arriveCity}</div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-[#eff6ff] px-2.5 py-1 text-[10px] font-extrabold text-[#2563eb]">{cabinBaggage}</span>
              <span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[10px] font-extrabold text-[#047857]">{checkedBaggage}</span>
              <button type="button" onClick={onToggleCompare} className="rounded-full bg-[#f8fafc] px-2.5 py-1 text-[10px] font-extrabold text-[#2563eb]">Compare fares</button>
            </div>
          </div>

          <div className="border-t border-[#eef2f7] bg-[#fbfdff] px-3.5 py-3">
            {!showAllFares ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase text-[#64748b]">{selectedFare.title}</div>
                  {selectedOfferDiscount > 0 && selectedFareFinalPrice ? (
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-[12px] font-semibold text-[#94a3b8] line-through">{selectedFareOriginalPrice || selectedFare.price}</span>
                      <span className="text-[22px] font-black leading-none text-[#111827]">{selectedFareFinalPrice}</span>
                    </div>
                  ) : (
                    <div className="mt-1 text-[22px] font-black leading-none text-[#111827]">{selectedFare.price}</div>
                  )}
                  <div className="mt-1 truncate text-[11px] font-semibold text-[#64748b]">{selectedFare.baggage}</div>
                </div>
                <button type="button" onClick={() => setShowAllFares(true)} className="shrink-0 rounded-full border border-[#dbeafe] bg-white px-3 py-2 text-[12px] font-black text-[#2563eb]">Change</button>
              </div>
            ) : (
              <div className="space-y-2">
                {compactVisibleFares.map((fare) => {
                  const isSelected = selectedFareId === fare.id;
                  return (
                    <label key={fare.id} className={`flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2 ${isSelected ? "border-[#fb923c] bg-[#fff7ed]" : "border-[#e5e7eb] bg-white"}`}>
                      <input type="radio" name={`mobile-fare-${code}`} checked={isSelected} onChange={() => setSelectedFareId(fare.id)} className="mt-1 h-3.5 w-3.5 shrink-0 accent-orange-500" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[12px] font-black leading-4 text-[#111827]">{fare.title}</div>
                            <div className="mt-0.5 truncate text-[11px] font-semibold leading-4 text-[#64748b]">{fare.baggage}</div>
                          </div>
                          <div className="shrink-0 text-[13px] font-black text-[#111827]">{fare.price}</div>
                        </div>
                      </div>
                    </label>
                  );
                })}
                <button type="button" onClick={() => setShowAllFares(false)} className="text-[12px] font-black text-[#2563eb]">Done</button>
              </div>
            )}

            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <button type="button" onClick={onToggleDetails} className="h-11 rounded-xl border border-[#dbeafe] bg-white px-3 text-[12px] font-black text-[#2563eb]">View Details</button>
              <button type="button" onClick={() => onBookNow({ airline, code, depart, departCity, duration, stop, arrive, arriveCity, stopDetails, selectedFare })} className="h-11 rounded-xl bg-[#f97316] px-5 text-[12px] font-black text-white shadow-[0_8px_18px_rgba(249,115,22,0.22)]">BOOK NOW</button>
            </div>
          </div>
        </div>
      </div>

    <div className="hidden grid-cols-1 items-start gap-3 md:grid xl:grid-cols-[155px_minmax(360px,1fr)_360px]">
      <div className="flex min-w-0 items-start justify-between gap-3 self-start xl:block">
        <div className="min-w-0">
          <div className="text-[15px] font-bold leading-tight text-[#111827] sm:text-[17px]">
            {airline}
          </div>

          <div className="mt-1 text-[11px] text-[#6b7280] sm:text-[12px]">
            {code}
          </div>
        </div>

        <div className="shrink-0 xl:mt-6">
          <div className="inline-flex rounded-full bg-[#fdecee] px-2.5 py-1 text-[11px] font-medium text-[#c2415d] sm:text-[12px]">
            {availabilityLabel}
          </div>
        </div>

        <div className="hidden xl:mt-8 xl:block">
          <button
            type="button"
            onClick={onToggleDetails}
            className="text-[14px] font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
          >
            View Details +
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[74px_minmax(110px,1fr)_74px] items-start gap-2 self-start sm:grid-cols-[90px_minmax(150px,1fr)_90px] sm:gap-4">
        <div className="min-w-0">
          <div className="text-right text-[22px] font-bold leading-none text-[#111827] sm:text-[28px]">
            {depart}
          </div>
          <div className="mt-1 truncate text-center text-[12px] text-[#4b5563] sm:text-[14px]">
            {departCity}
          </div>
        </div>

        <div className="min-w-0 pt-1 text-center">
          <div className="text-[12px] font-medium text-[#4b5563] sm:text-[13px]">
            {duration}
          </div>

          <div className="mt-1 flex items-center justify-center gap-2">
            <div className="h-[2px] flex-1 bg-[#d1d5db]" />

            <button
              type="button"
              ref={stopRef as any}
              className="group relative shrink-0 text-[11px] font-medium text-[#6b7280] sm:text-[12px]"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => stopDetails.length && setShowTooltip((prev) => !prev)}
            >
              {stop}
              {renderFlightStopTooltip()}
            </button>

            <div className="h-[2px] flex-1 bg-[#d1d5db]" />
          </div>

          <div className="mt-3 inline-flex rounded-full bg-[#e8f2ff] px-2 py-1 text-[10px] font-medium text-[#2563eb] sm:mt-6 sm:px-2.5 sm:text-[11px]">
            {baggageSummary}
          </div>

          <button
            type="button"
            onClick={onToggleCompare}
            className="mt-3 block w-full text-center text-[13px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] sm:mt-8 sm:text-[15px]"
          >
            Compare Fares
          </button>
        </div>

        <div className="min-w-0">
          <div className="text-start text-[22px] font-bold leading-none text-[#111827] sm:text-[28px]">
            {arrive}
          </div>
          <div className="mt-1 truncate text-center text-[12px] text-[#4b5563] sm:text-[14px]">
            {arriveCity}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-3 self-start sm:grid-cols-[1fr_125px]">
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

          <button
            type="button"
            onClick={onToggleDetails}
            className="rounded-xl border border-[#dbeafe] bg-[#f8fbff] px-4 py-2 text-[13px] font-semibold text-[#2563eb] transition hover:bg-[#eff6ff] xl:hidden"
          >
            View Details +
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
