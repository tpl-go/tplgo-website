"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  FlightFareOption,
  RoundTripFlight,
} from "../../data/roundtripFlights";

type Props = {
  flight: RoundTripFlight;
  isSelected?: boolean;
  selectedFareId?: string | null;
  onSelect: (flight: RoundTripFlight) => void;
  onFareSelect: (
    flight: RoundTripFlight | null,
    fare: FlightFareOption | null
  ) => void;
};

export default function RoundTripFlightCard({
  flight,
  isSelected,
  selectedFareId,
  onSelect,
  onFareSelect,
}: Props) {
  const [showAllFares, setShowAllFares] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareStartIndex, setCompareStartIndex] = useState(0);

  const modalContentRef = useRef<HTMLDivElement | null>(null);

  const fares = flight.fareOptions || [];
  const visibleFares = showAllFares ? fares : fares.slice(0, 3);

  const compareVisibleCount = 3;
  const compareVisibleFares = useMemo(
    () =>
      fares.slice(compareStartIndex, compareStartIndex + compareVisibleCount),
    [fares, compareStartIndex]
  );

  const canGoCompareLeft = compareStartIndex > 0;
  const canGoCompareRight =
    compareStartIndex + compareVisibleCount < fares.length;

  const currentSelectedFare =
    fares.find((fare) => fare.id === selectedFareId) || fares[0] || null;

  useEffect(() => {
    if (!showCompareModal) return;

    function handleOutsideClick(event: MouseEvent) {
      if (
        modalContentRef.current &&
        event.target instanceof Node &&
        !modalContentRef.current.contains(event.target)
      ) {
        setShowCompareModal(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowCompareModal(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showCompareModal]);

  const openCompareModal = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setCompareStartIndex(0);
    setShowCompareModal(true);
  };

  const closeCompareModal = () => {
    setShowCompareModal(false);
  };

  const getMealsText = (fare: FlightFareOption) => {
    const label = (fare.label || "").toLowerCase();

    if (label.includes("flexi")) return "Complimentary";
    if (label.includes("corporate")) return "Complimentary";
    return "Chargeable";
  };

  const getSeatChargeText = (fare: FlightFareOption) => {
    const label = (fare.label || "").toLowerCase();

    if (label.includes("corporate")) return "Complimentary";
    return "Chargeable";
  };

  const getCancellationText = () => "NA";
  const getDateChangeText = () => "NA";

  const handleSelectFare = (fare: FlightFareOption) => {
    onSelect(flight);
    onFareSelect(flight, fare);
    setShowCompareModal(false);
  };

  return (
    <>
      <div
        className={`md:hidden overflow-hidden rounded-2xl border bg-white shadow-sm ${
          isSelected
            ? "border-[#f97316] ring-1 ring-[#fed7aa]"
            : "border-[#d9e2ef]"
        }`}
      >
        <div className="p-3">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eef2f7] text-[11px] font-black text-[#334155]">
                {flight.logoText}
              </div>

              <div className="min-w-0">
                <div className="truncate text-[13px] font-black leading-tight text-[#111827]">
                  {flight.airline}
                </div>
                <div className="text-[11px] font-semibold leading-tight text-[#64748b]">
                  {flight.flightNumber}
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#64748b]">
                from
              </div>
              <div className="text-[16px] font-black leading-tight text-[#111827]">
                ₹ {currentSelectedFare?.price || flight.price}
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
                  {flight.stopType}
                </span>
                <div className="h-px flex-1 bg-[#cbd5e1]" />
              </div>
              <div className="truncate text-[10px] font-semibold text-[#0f766e]">
                {flight.onTimeRate}
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
              Cabin {flight.cabinBag || "7 Kg"}
            </span>
            <span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[10px] font-bold text-[#047857]">
              Check-in {flight.checkInBag || "15 Kg"}
            </span>
            {flight.seatsLeft ? (
              <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-[10px] font-bold text-[#c2410c]">
                {flight.seatsLeft} seats left
              </span>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#eef2f7] bg-[#fbfdff] px-3 py-2.5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-[12px] font-black text-[#111827]">
                {currentSelectedFare?.label || fares[0]?.label || "Regular Fare"}
              </div>
              <div className="text-[10px] font-semibold text-[#64748b]">
                Primary fare preview
              </div>
            </div>

            <button
              type="button"
              onClick={openCompareModal}
              className="shrink-0 text-[11px] font-black text-[#2563eb]"
            >
              Compare
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!currentSelectedFare}
              onClick={() => currentSelectedFare && handleSelectFare(currentSelectedFare)}
              className={`h-10 flex-1 rounded-xl text-[12px] font-black ${
                currentSelectedFare
                  ? "bg-[#f97316] text-white"
                  : "cursor-not-allowed bg-[#e5e7eb] text-[#94a3b8]"
              }`}
            >
              {isSelected ? "Selected" : "Select Fare"}
            </button>

            {fares.length > 1 ? (
              <button
                type="button"
                onClick={() => setShowAllFares((prev) => !prev)}
                className="h-10 rounded-xl border border-[#d9e2ef] bg-white px-3 text-[11px] font-black text-[#334155]"
              >
                {showAllFares ? "Less" : `+${fares.length - 1}`}
              </button>
            ) : null}
          </div>

          {showAllFares && fares.length > 1 ? (
            <div className="mt-2 space-y-1.5">
              {fares.slice(1).map((fare) => {
                const checked = isSelected && selectedFareId === fare.id;

                return (
                  <button
                    key={fare.id}
                    type="button"
                    onClick={() => handleSelectFare(fare)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left ${
                      checked
                        ? "border-[#f97316] bg-[#fff7ed]"
                        : "border-[#e5e7eb] bg-white"
                    }`}
                  >
                    <span className="min-w-0 truncate text-[11px] font-bold text-[#334155]">
                      {fare.label}
                    </span>
                    <span className="shrink-0 text-[12px] font-black text-[#111827]">
                      ₹ {fare.price}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <div className="hidden md:block">
      <div className="cursor-pointer rounded-xl border border-[#d7dee7] bg-white p-3 transition-all hover:border-blue-400 hover:shadow-md">
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_220px]">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#eef2f7] text-[12px] font-bold text-[#374151]">
                {flight.logoText}
              </div>

              <div className="min-w-0">
                <div className="truncate text-[15px] font-bold leading-tight text-[#111827] xl:text-[16px]">
                  {flight.airline}
                </div>
                <div className="text-[12px] font-semibold leading-tight text-[#4b5563]">
                  {flight.flightNumber}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-[72px_minmax(92px,1fr)_72px] items-center gap-2 xl:mt-5 xl:grid-cols-[85px_105px_85px]">
              <div>
                <div className="text-[21px] font-semibold leading-none text-[#111827] xl:text-[24px]">
                  {flight.departureTime}
                </div>
                <div className="mt-1 truncate text-[12px] leading-tight text-[#1f2937] xl:text-[14px]">
                  {flight.fromCity}
                </div>
              </div>

              <div className="text-center">
                <div className="text-[12px] font-medium leading-tight text-[#374151] xl:text-[14px]">
                  {flight.duration}
                </div>

                <div className="my-1 flex w-full items-center justify-center gap-1">
                  <div className="h-[1.5px] w-full bg-[#cbd5e1]" />
                  <span className="whitespace-nowrap text-[10px] font-medium text-[#4b5563] xl:text-[11px]">
                    {flight.stopType}
                  </span>
                  <div className="h-[1.5px] w-full bg-[#cbd5e1]" />
                </div>

                <div className="text-[10px] font-medium leading-tight text-[#0f766e] xl:text-[11px]">
                  {flight.onTimeRate}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[21px] font-bold leading-none text-[#111827] xl:text-[22px]">
                  {flight.arrivalTime}
                </div>
                <div className="mt-1 truncate text-[12px] leading-tight text-[#1f2937] xl:text-[14px]">
                  {flight.toCity}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={openCompareModal}
              className="mt-3 block text-[12px] font-medium text-[#2563eb]"
            >
              Compare Fares
            </button>
          </div>

          <div className="space-y-2 border-t border-[#eef2f7] pt-3 xl:border-t-0 xl:pl-6 xl:pt-0">
            {visibleFares.map((fare) => {
              const isChecked =
                isSelected && selectedFareId
                  ? selectedFareId === fare.id
                  : false;

              return (
                <label
                  key={fare.id}
                  className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 transition xl:border-0 xl:bg-transparent xl:px-0 xl:py-0 ${
                    isChecked
                      ? "border-[#f3b5a0] bg-[#fff5f2] xl:border-0 xl:bg-transparent"
                      : "border-[#e5e7eb] bg-white hover:border-[#f59e0b] xl:border-0 xl:bg-transparent xl:hover:border-transparent"
                  }`}
                >
                  <input
                    type="radio"
                    name={flight.id}
                    checked={isChecked}
                    onClick={() => {
                      if (isChecked) {
                        onFareSelect(null, null);
                        return;
                      }

                      onSelect(flight);
                      onFareSelect(flight, fare);
                    }}
                    readOnly
                    className="mt-1 h-[16px] w-[16px] shrink-0 accent-orange-500 xl:accent-auto"
                  />

                  <div className="min-w-0">
                    <div className="text-[16px] font-semibold leading-tight text-[#111827] xl:text-[17px]">
                      ₹ {fare.price}
                    </div>
                    <div className="text-[12px] font-medium leading-tight text-[#374151] xl:text-[13px]">
                      {fare.label}
                    </div>
                  </div>
                </label>
              );
            })}

            {fares.length > 3 && !showAllFares && (
              <button
                type="button"
                onClick={() => setShowAllFares(true)}
                className="text-[12px] font-medium text-[#2563eb]"
              >
                +{fares.length - 3} more fares
              </button>
            )}

            {showAllFares && fares.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllFares(false)}
                className="text-[12px] font-medium text-[#2563eb]"
              >
                Show less
              </button>
            )}
          </div>
        </div>
      </div>
      </div>

      {showCompareModal && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/55 px-0 py-0 backdrop-blur-[2px] xl:items-center xl:px-4 xl:py-6">
          <div
            ref={modalContentRef}
            className="flex h-[92vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-t-[28px] border border-white/70 bg-slate-50 shadow-[0_-18px_60px_rgba(15,23,42,0.28)] xl:h-[86vh] xl:rounded-3xl xl:shadow-[0_24px_80px_rgba(15,23,42,0.24)]"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-3 xl:px-5 xl:py-4">
              <div>
                <div className="text-[15px] font-black text-slate-950 xl:text-[17px]">
                  Compare fares
                </div>
                <div className="text-[11px] font-semibold text-slate-500">
                  {flight.fromCity} → {flight.toCity} · services per passenger
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    canGoCompareLeft &&
                    setCompareStartIndex((prev) => Math.max(prev - 1, 0))
                  }
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-[16px] transition ${
                    canGoCompareLeft
                      ? "border-slate-300 bg-white text-slate-900 hover:border-orange-300 hover:bg-orange-50"
                      : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                  }`}
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={() =>
                    canGoCompareRight &&
                    setCompareStartIndex((prev) => prev + 1)
                  }
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-[16px] transition ${
                    canGoCompareRight
                      ? "border-slate-300 bg-white text-slate-900 hover:border-orange-300 hover:bg-orange-50"
                      : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                  }`}
                >
                  ›
                </button>

                <button
                  type="button"
                  onClick={closeCompareModal}
                  className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[24px] leading-none text-slate-700 transition hover:bg-orange-50 hover:text-orange-600 xl:ml-2"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-2 xl:p-4">
              <div className="flex min-w-max gap-3 pb-6 xl:gap-4">
                <div className="sticky left-0 z-10 w-[132px] shrink-0 xl:static xl:w-[210px]">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex h-[64px] items-center bg-slate-100 px-3 text-[12px] font-black text-slate-900 xl:h-[72px] xl:px-4 xl:text-[14px]">
                      Services (Per Pax)
                    </div>

                    <div className="flex h-[92px] items-center border-t border-slate-100 bg-slate-50 px-3 text-[12px] font-black text-slate-900 xl:h-[108px] xl:px-4 xl:text-[14px]">
                      Fares
                    </div>

                    <div className="h-[100px] border-t border-slate-100 bg-slate-50 px-3 py-3 xl:h-[110px] xl:px-4 xl:py-4">
                      <div className="text-[12px] font-black text-slate-900 xl:text-[14px]">
                        Baggage Info
                      </div>
                      <div className="mt-2 text-[11px] font-semibold text-slate-500 xl:text-[13px]">
                        Adult (Age 12+)
                      </div>
                    </div>

                    <div className="flex h-[76px] items-center border-t border-slate-100 bg-slate-50 px-3 text-[12px] font-black text-slate-900 xl:h-[86px] xl:px-4 xl:text-[14px]">
                      Cancellation Fee
                    </div>

                    <div className="flex h-[76px] items-center border-t border-slate-100 bg-slate-50 px-3 text-[12px] font-black text-slate-900 xl:h-[86px] xl:px-4 xl:text-[14px]">
                      Date Change Fee
                    </div>

                    <div className="flex h-[76px] items-center border-t border-slate-100 bg-slate-50 px-3 text-[12px] font-black text-slate-900 xl:h-[86px] xl:px-4 xl:text-[14px]">
                      Seat Charge
                    </div>

                    <div className="flex h-[100px] items-center border-t border-slate-100 bg-slate-50 px-3 text-[12px] font-black text-slate-900 xl:h-[110px] xl:px-4 xl:text-[14px]">
                      Meals
                    </div>
                  </div>
                </div>

                {compareVisibleFares.map((fare) => {
                  const isCurrentSelected = selectedFareId
                    ? selectedFareId === fare.id
                    : currentSelectedFare?.id === fare.id;

                  return (
                    <div
                      key={fare.id}
                      className={`w-[200px] shrink-0 overflow-hidden rounded-2xl border bg-white transition xl:w-[250px] ${
                        isCurrentSelected
                          ? "border-orange-400 shadow-[0_14px_36px_rgba(249,115,22,0.16)] ring-1 ring-orange-100"
                          : "border-slate-200 shadow-sm"
                      }`}
                    >
                      <div
                        className={`flex h-[64px] items-center gap-2 border-b border-slate-100 px-3 xl:h-[72px] xl:px-4 ${
                          isCurrentSelected ? "bg-orange-50" : "bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`compare-fare-${flight.id}`}
                          checked={isCurrentSelected}
                          onChange={() => handleSelectFare(fare)}
                          className="h-4 w-4 accent-orange-500"
                        />
                        <span
                          className={`text-[13px] font-semibold xl:text-[14px] ${
                            isCurrentSelected
                              ? "text-slate-950"
                              : "text-orange-700"
                          }`}
                        >
                          {fare.label}
                        </span>
                      </div>

                      <div className="flex h-[92px] flex-col items-center justify-center border-b border-slate-100 px-3 xl:h-[108px] xl:px-4">
                        <div className="text-[20px] font-black text-slate-950 xl:text-[24px]">
                          ₹ {fare.price}
                        </div>
                      </div>

                      <div className="grid h-[100px] grid-cols-2 border-b border-slate-100 text-center xl:h-[110px]">
                        <div className="border-r border-slate-100 px-2 py-3 xl:px-3 xl:py-4">
                          <div className="text-[12px] font-bold text-slate-900 xl:text-[14px]">
                            Check In Bag
                          </div>
                          <div className="mt-2 text-[11px] font-semibold text-slate-500 xl:text-[13px]">
                            {flight.checkInBag || "15 Kg"}
                          </div>
                        </div>
                        <div className="px-2 py-3 xl:px-3 xl:py-4">
                          <div className="text-[12px] font-bold text-slate-900 xl:text-[14px]">
                            Cabin Bag
                          </div>
                          <div className="mt-2 text-[11px] font-semibold text-slate-500 xl:text-[13px]">
                            {flight.cabinBag || "7 Kg"}
                          </div>
                        </div>
                      </div>

                      <div className="flex h-[76px] items-center justify-center border-b border-slate-100 px-3 text-[12px] font-semibold text-slate-400 xl:h-[86px] xl:px-4 xl:text-[14px]">
                        {getCancellationText()}
                      </div>

                      <div className="flex h-[76px] items-center justify-center border-b border-slate-100 px-3 text-[12px] font-semibold text-slate-400 xl:h-[86px] xl:px-4 xl:text-[14px]">
                        {getDateChangeText()}
                      </div>

                      <div className="flex h-[76px] items-center justify-center border-b border-slate-100 px-3 text-[12px] font-semibold text-slate-700 xl:h-[86px] xl:px-4 xl:text-[14px]">
                        {getSeatChargeText(fare)}
                      </div>

                      <div className="flex h-[100px] flex-col items-center justify-center px-3 text-center xl:h-[110px] xl:px-4">
                        <div className="mb-3 rounded-full bg-slate-100 px-3 py-1 text-[12px] font-bold text-slate-700 xl:mb-4 xl:text-[14px]">
                          {getMealsText(fare)}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectFare(fare)}
                          className="rounded-full bg-orange-500 px-5 py-2 text-[12px] font-black text-white shadow-sm transition hover:bg-orange-600 xl:px-6 xl:text-[13px]"
                        >
                          SELECT
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-[12px] leading-6 text-slate-500 xl:mt-4 xl:px-4 xl:text-[13px]">
                <div>
                  The airline fee is indicative, which will depend upon the time
                  of cancellation / re-issue as per the airline fare rules.
                </div>
                <div>Mentioned fees are Per Pax Per Sector</div>
                <div>
                  Apart from airline charges, GST + RAF + applicable charges if
                  any, will be charged.
                </div>
                <div>For more clarity, Please check Detailed Rules</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
