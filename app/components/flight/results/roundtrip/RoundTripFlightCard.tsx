"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function RoundTripFlightCard({
  flight,
  isSelected,
  selectedFareId,
  onSelect,
  onFareSelect,
}) {
  const [showAllFares, setShowAllFares] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareStartIndex, setCompareStartIndex] = useState(0);

  const modalContentRef = useRef(null);

  const fares = flight.fareOptions || [];
  const visibleFares = showAllFares ? fares : fares.slice(0, 3);

  const compareVisibleCount = 3;
  const compareVisibleFares = useMemo(
    () => fares.slice(compareStartIndex, compareStartIndex + compareVisibleCount),
    [fares, compareStartIndex]
  );

  const canGoCompareLeft = compareStartIndex > 0;
  const canGoCompareRight =
    compareStartIndex + compareVisibleCount < fares.length;

  const currentSelectedFare =
    fares.find((fare) => fare.id === selectedFareId) || fares[0] || null;

  useEffect(() => {
    if (!showCompareModal) return;

    function handleOutsideClick(event) {
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(event.target)
      ) {
        setShowCompareModal(false);
      }
    }

    function handleEscape(event) {
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

  const openCompareModal = (event) => {
    event.stopPropagation();
    setCompareStartIndex(0);
    setShowCompareModal(true);
  };

  const closeCompareModal = () => {
    setShowCompareModal(false);
  };

  const getMealsText = (fare) => {
    const label = (fare.label || "").toLowerCase();

    if (label.includes("flexi")) return "Complimentary";
    if (label.includes("corporate")) return "Complimentary";
    return "Chargeable";
  };

  const getSeatChargeText = (fare) => {
    const label = (fare.label || "").toLowerCase();

    if (label.includes("corporate")) return "Complimentary";
    return "Chargeable";
  };

  const getCancellationText = () => "NA";
  const getDateChangeText = () => "NA";

  const handleSelectFare = (fare) => {
    onSelect(flight);
    onFareSelect(flight, fare);
    setShowCompareModal(false);
  };

  return (
    <>
      <div className="rounded-xl border border-[#d7dee7] bg-white p-3 transition-all hover:border-blue-400 hover:shadow-md cursor-pointer">
        <div className="grid grid-cols-[1fr_220px] items-start gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#eef2f7] text-[12px] font-bold text-[#374151]">
                {flight.logoText}
              </div>

              <div>
                <div className="text-[16px] font-bold leading-tight text-[#111827]">
                  {flight.airline}
                </div>
                <div className="text-[12px] leading-tight text-[#4b5563] font-semibold">
                  {flight.flightNumber}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-[85px_105px_85px] items-center gap-2">
              <div>
                <div className="text-[24px] font-semibold leading-none text-[#111827]">
                  {flight.departureTime}
                </div>
                <div className="mt-1 text-[14px] leading-tight text-[#1f2937]">
                  {flight.fromCity}
                </div>
              </div>

              <div className="text-center">
                <div className="text-[14px] font-medium leading-tight text-[#374151]">
                  {flight.duration}
                </div>

                <div className="my-1 flex w-full items-center justify-center gap-1">
                  <div className="h-[1.5px] w-full bg-[#cbd5e1]" />
                  <span className="whitespace-nowrap text-[11px] font-medium text-[#4b5563]">
                    {flight.stopType}
                  </span>
                  <div className="h-[1.5px] w-full bg-[#cbd5e1]" />
                </div>

                <div className="text-[11px] font-medium leading-tight text-[#0f766e]">
                  {flight.onTimeRate}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[22px] font-bold leading-none text-[#111827]">
                  {flight.arrivalTime}
                </div>
                <div className="mt-1 text-[14px] leading-tight text-[#1f2937]">
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

          <div className="space-y-2 pl-6">
            {visibleFares.map((fare) => {
              const isChecked =
                isSelected && selectedFareId ? selectedFareId === fare.id : false;

              return (
                <label
                  key={fare.id}
                  className="flex cursor-pointer items-start gap-2"
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
                    className="mt-1 h-[16px] w-[16px] shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="text-[17px] font-semibold leading-tight text-[#111827]">
                      ₹ {fare.price}
                    </div>
                    <div className="text-[13px] font-medium leading-tight text-[#374151]">
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

      {showCompareModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 px-4 py-6">
          <div
            ref={modalContentRef}
            className="flex h-[86vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-xl border border-[#dbe4ef] bg-[#f8fbff] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#dbe4ef] px-4 py-3">
              <div className="text-[14px] font-semibold text-[#111827]">
                Services (Per Pax)
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    canGoCompareLeft &&
                    setCompareStartIndex((prev) => Math.max(prev - 1, 0))
                  }
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-[16px] ${
                    canGoCompareLeft
                      ? "border-[#cbd5e1] bg-white text-[#111827]"
                      : "cursor-not-allowed border-[#e5e7eb] bg-[#f8fafc] text-[#cbd5e1]"
                  }`}
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={() =>
                    canGoCompareRight && setCompareStartIndex((prev) => prev + 1)
                  }
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-[16px] ${
                    canGoCompareRight
                      ? "border-[#cbd5e1] bg-white text-[#111827]"
                      : "cursor-not-allowed border-[#e5e7eb] bg-[#f8fafc] text-[#cbd5e1]"
                  }`}
                >
                  ›
                </button>

                <button
                  type="button"
                  onClick={closeCompareModal}
                  className="ml-2 text-[28px] leading-none text-[#111827]"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-4">
              <div className="flex min-w-max gap-4 pb-6">
                <div className="w-[220px] shrink-0">
                  <div className="overflow-hidden rounded-2xl border border-[#dbe4ef] bg-white">
                    <div className="flex h-[72px] items-center bg-[#eef4fb] px-4 text-[14px] font-semibold text-[#111827]">
                      Services (Per Pax)
                    </div>

                    <div className="flex h-[108px] items-center border-t border-[#eceff3] bg-[#eef4fb] px-4 text-[14px] font-semibold text-[#111827]">
                      Fares
                    </div>

                    <div className="h-[110px] border-t border-[#eceff3] bg-[#eef4fb] px-4 py-4">
                      <div className="text-[14px] font-semibold text-[#111827]">
                        Baggage Info
                      </div>
                      <div className="mt-2 text-[13px] text-[#374151]">
                        Adult (Age 12+)
                      </div>
                    </div>

                    <div className="flex h-[86px] items-center border-t border-[#eceff3] bg-[#eef4fb] px-4 text-[14px] font-semibold text-[#111827]">
                      Cancellation Fee
                    </div>

                    <div className="flex h-[86px] items-center border-t border-[#eceff3] bg-[#eef4fb] px-4 text-[14px] font-semibold text-[#111827]">
                      Date Change Fee
                    </div>

                    <div className="flex h-[86px] items-center border-t border-[#eceff3] bg-[#eef4fb] px-4 text-[14px] font-semibold text-[#111827]">
                      Seat Charge
                    </div>

                    <div className="flex h-[110px] items-center border-t border-[#eceff3] bg-[#eef4fb] px-4 text-[14px] font-semibold text-[#111827]">
                      Meals
                    </div>
                  </div>
                </div>

                {compareVisibleFares.map((fare) => {
                  const isCurrentSelected =
                    selectedFareId
                      ? selectedFareId === fare.id
                      : currentSelectedFare?.id === fare.id;

                  return (
                    <div
                      key={fare.id}
                      className={`w-[260px] shrink-0 overflow-hidden rounded-2xl border ${
                        isCurrentSelected
                          ? "border-[#d1a67a] shadow-sm"
                          : "border-[#e5e7eb]"
                      } bg-white`}
                    >
                      <div
                        className={`flex h-[72px] items-center gap-2 border-b px-4 ${
                          isCurrentSelected ? "bg-[#d8c2a6]" : "bg-[#f9fafb]"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`compare-fare-${flight.id}`}
                          checked={isCurrentSelected}
                          onChange={() => handleSelectFare(fare)}
                          className="h-4 w-4"
                        />
                        <span
                          className={`text-[14px] font-semibold ${
                            isCurrentSelected
                              ? "text-[#111827]"
                              : "text-[#b91c1c]"
                          }`}
                        >
                          {fare.label}
                        </span>
                      </div>

                      <div className="flex h-[108px] flex-col items-center justify-center border-b px-4">
                        <div className="text-[24px] font-semibold text-[#111827]">
                          ₹ {fare.price}
                        </div>
                      </div>

                      <div className="grid h-[110px] grid-cols-2 border-b text-center">
                        <div className="border-r px-3 py-4">
                          <div className="text-[14px] font-medium text-[#111827]">
                            Check In Bag
                          </div>
                          <div className="mt-2 text-[13px] text-[#111827]">
                            {flight.checkInBag || "15 Kg"}
                          </div>
                        </div>
                        <div className="px-3 py-4">
                          <div className="text-[14px] font-medium text-[#111827]">
                            Cabin Bag
                          </div>
                          <div className="mt-2 text-[13px] text-[#111827]">
                            {flight.cabinBag || "7 Kg"}
                          </div>
                        </div>
                      </div>

                      <div className="flex h-[86px] items-center justify-center border-b px-4 text-[14px] text-[#9ca3af]">
                        {getCancellationText()}
                      </div>

                      <div className="flex h-[86px] items-center justify-center border-b px-4 text-[14px] text-[#9ca3af]">
                        {getDateChangeText()}
                      </div>

                      <div className="flex h-[86px] items-center justify-center border-b px-4 text-[14px] text-[#111827]">
                        {getSeatChargeText(fare)}
                      </div>

                      <div className="flex h-[110px] flex-col items-center justify-center px-4 text-center">
                        <div className="mb-4 text-[14px] text-[#111827]">
                          {getMealsText(fare)}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectFare(fare)}
                          className="rounded bg-orange-500 px-6 py-2 text-[13px] font-semibold text-white hover:bg-orange-600"
                        >
                          SELECT
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-[13px] leading-7 text-[#7c5a5a]">
                <div>
                  The airline fee is indicative, which will depend upon the time of
                  cancellation / re-issue as per the airline fare rules.
                </div>
                <div>Mentioned fees are Per Pax Per Sector</div>
                <div>
                  Apart from airline charges, GST + RAF + applicable charges if any,
                  will be charged.
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