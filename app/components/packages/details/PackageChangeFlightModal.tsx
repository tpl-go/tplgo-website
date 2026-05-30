"use client";

import { useEffect, useMemo, useState } from "react";
import type { PackageFlightOption } from "@/app/lib/packages/packageSelectionTypes";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  originCity: string;
  destinationCity: string;
  travelDate: string;
  options: PackageFlightOption[];
  segmentCount?: number;
  selectedFlights?: PackageFlightOption[];
  onSelectFlight: (flight: PackageFlightOption, index: number) => void;
};

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function addDays(value?: string, days = 0) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function formatFareDiff(value: number) {
  if (value === 0) return "Included";
  if (value > 0) return `+₹${value.toLocaleString("en-IN")}`;
  return `-₹${Math.abs(value).toLocaleString("en-IN")}`;
}

export default function PackageChangeFlightModal({
  isOpen,
  onClose,
  originCity,
  destinationCity,
  travelDate,
  options,
  segmentCount = 1,
  selectedFlights = [],
  onSelectFlight,
}: Props) {
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);

  const flightPlans = useMemo(
    () => Array.from({ length: Math.max(segmentCount, 1) }, (_, index) => index),
    [segmentCount]
  );

  const defaultIncludedFlight = useMemo(
    () => options.find((flight) => flight.included) || null,
    [options]
  );

  useEffect(() => {
    if (!isOpen) return;
    if (!defaultIncludedFlight) return;

    flightPlans.forEach((index) => {
      const alreadySelected = selectedFlights?.[index];
      if (!alreadySelected) {
        onSelectFlight(defaultIncludedFlight, index);
      }
    });
  }, [
    isOpen,
    defaultIncludedFlight,
    flightPlans,
    onSelectFlight,
    selectedFlights,
  ]);

  if (!isOpen) return null;

  const currentSelectedFlight =
    selectedFlights?.[activeSegmentIndex] || defaultIncludedFlight || null;

  const currentSelectedId = currentSelectedFlight?.id || null;
  const activeDate = addDays(travelDate, activeSegmentIndex);
  const activeSelectedFlight = currentSelectedFlight;

  const isAnyFlightSelected = selectedFlights?.some(Boolean) || !!defaultIncludedFlight;

  const handleClose = () => {
    if (!isAnyFlightSelected) {
      const confirmClose = window.confirm(
        "No flight selected.\nDefault included flight will be applied.\n\nDo you want to continue?"
      );
      if (!confirmClose) return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[240] overflow-hidden bg-black/45 backdrop-blur-[2px] lg:overflow-y-auto">
      <div className="flex h-[100dvh] items-stretch justify-center p-0 lg:h-auto lg:min-h-full lg:items-start lg:px-4 lg:py-4">
        <div className="flex h-full w-full flex-col overflow-hidden rounded-none border border-[#dbe4f0] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.22)] lg:my-2 lg:h-auto lg:max-w-[920px] lg:rounded-[28px]">
          {/* HEADER */}
          <div className="shrink-0 border-b border-[#e5edf6] bg-white px-4 py-4 lg:px-6 lg:py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[20px] leading-none font-black text-[#111827] lg:text-[24px]">
                  Change Flight
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#d8e4f4] bg-[#f8fbff] px-3 py-1.5 text-[12px] font-bold text-[#1f2937]">
                    {segmentCount} Flight{segmentCount > 1 ? "s" : ""}
                  </span>

                  {activeDate ? (
                    <span className="rounded-full border border-[#d8e4f4] bg-[#f8fbff] px-3 py-1.5 text-[12px] font-bold text-[#1f2937]">
                      {formatDate(activeDate)}
                    </span>
                  ) : null}

                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[12px] font-bold text-blue-800">
                    {originCity} → {destinationCity}
                  </span>
                </div>

                <div className="mt-3 text-sm font-medium text-[#4b5563]">
                  Flights are linked with your trip date and route. If you customize a flight,
                  the selection here updates automatically.
                </div>
              </div>

              <button
                onClick={handleClose}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d5dce5] bg-white text-[20px] font-bold text-[#374151] hover:bg-slate-50 transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* SWITCHER */}
          <div className="shrink-0 border-b border-[#e5edf6] bg-[#f8fbff] px-4 py-3 lg:px-6">
            <div className="flex gap-3 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
              {flightPlans.map((flightIndex) => {
                const selectedFlight =
                  selectedFlights?.[flightIndex] || defaultIncludedFlight || null;
                const isActive = activeSegmentIndex === flightIndex;
                const hasSelection = !!selectedFlight;
                const flightDate = addDays(travelDate, flightIndex);

                return (
                  <button
                    key={flightIndex}
                    type="button"
                    onClick={() => setActiveSegmentIndex(flightIndex)}
                    className={`min-w-[150px] rounded-xl border px-3 py-2 text-left transition lg:min-w-[165px] ${
                      isActive
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : hasSelection
                        ? "border-green-400 bg-green-50"
                        : "border-[#d6e4f5] bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="text-[11px] font-bold text-[#111827]">
                      Flight {flightIndex + 1}
                    </div>

                    <div className="mt-0.5 text-[10px] font-semibold text-[#374151] line-clamp-1">
                      {originCity} → {destinationCity}
                    </div>

                    <div className="mt-0.5 text-[10px] font-medium text-[#6b7280] line-clamp-1">
                      {selectedFlight
                        ? `${selectedFlight.airline}${selectedFlight.departureTime ? ` • ${selectedFlight.departureTime}` : ""}`
                        : "Choose flight"}
                    </div>

                    {flightDate ? (
                      <div className="mt-0.5 text-[10px] font-medium text-[#6b7280]">
                        {formatDate(flightDate)}
                      </div>
                    ) : null}

                    {hasSelection ? (
                      <div className="mt-1 text-[10px] font-bold text-green-700">
                        ✓ Selected
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BODY */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#f8fafc] px-3 py-3 pb-6 lg:max-h-[46vh] lg:px-6 lg:py-4">
            <div className="rounded-2xl border border-[#dbe7f3] bg-white overflow-hidden">
              <div className="border-b border-[#e7eef7] bg-[#f8fbff] px-4 py-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-[15px] font-extrabold text-[#111827]">
                      Flight {activeSegmentIndex + 1} • {originCity} → {destinationCity}
                    </div>

                    <div className="mt-1 text-[12px] font-medium text-[#4b5563]">
                      {formatDate(activeDate)}
                    </div>
                  </div>

                  {activeSelectedFlight ? (
                    <div className="text-[12px] font-semibold text-blue-700">
                      Selected: {activeSelectedFlight.airline}
                      {activeSelectedFlight.departureTime
                        ? ` • ${activeSelectedFlight.departureTime}`
                        : ""}
                    </div>
                  ) : (
                    <div className="text-[12px] font-semibold text-[#4b5563]">
                      Choose preferred flight
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3">
                <div className="grid gap-3">
                  {options.map((flight) => {
                    const isSelected = currentSelectedId === flight.id;

                    return (
                      <button
                        key={`${activeSegmentIndex}-${flight.id}`}
                        onClick={() => onSelectFlight(flight, activeSegmentIndex)}
                        className={`w-full text-left rounded-xl border bg-white p-3 transition ${
                          isSelected
                            ? "border-blue-500 ring-2 ring-blue-100 shadow-sm"
                            : "border-slate-200 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex justify-between gap-4 flex-col lg:flex-row">
                          <div className="flex-1">
                            <div className="flex gap-2 flex-wrap">
                              <span className="px-3 py-1 text-[10px] rounded-full bg-slate-900 text-white font-bold">
                                {flight.airline || "Flight"}
                              </span>

                              {flight.included ? (
                                <span className="px-3 py-1 text-[10px] rounded-full bg-green-50 border border-green-200 text-green-700 font-bold">
                                  Included
                                </span>
                              ) : (
                                <span className="px-3 py-1 text-[10px] rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-bold">
                                  Upgrade
                                </span>
                              )}
                            </div>

                            <div className="mt-2 text-[14px] font-semibold text-[#111827]">
                              {flight.from || originCity} → {flight.to || destinationCity}
                            </div>

                            <div className="mt-1 text-[12px] font-medium text-[#4b5563]">
                              {formatDate(activeDate)}
                              {flight.duration ? ` • ${flight.duration}` : ""}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-4 text-[12px] font-medium text-[#4b5563]">
                              <span>
                                Departure:{" "}
                                <span className="font-semibold text-[#111827]">
                                  {flight.departureTime || "--"}
                                </span>
                              </span>
                              <span>
                                Arrival:{" "}
                                <span className="font-semibold text-[#111827]">
                                  {flight.arrivalTime || "--"}
                                </span>
                              </span>
                            </div>

                            <div className="mt-2 text-[11px] font-medium text-[#6b7280]">
                              Linked to: {originCity} → {destinationCity} • {formatDate(activeDate)}
                            </div>
                          </div>

                          <div className="flex flex-col items-start lg:items-end gap-2">
                            <div
                              className={`px-3 py-1.5 text-[12px] font-black rounded-full ${
                                flight.fareDiff === 0
                                  ? "bg-green-50 border border-green-200 text-green-700"
                                  : flight.fareDiff > 0
                                  ? "bg-orange-50 border border-orange-200 text-orange-700"
                                  : "bg-blue-50 border border-blue-200 text-blue-700"
                              }`}
                            >
                              {formatFareDiff(flight.fareDiff)}
                            </div>

                            <div
                              className={`px-4 py-2 rounded-xl text-[12px] font-bold ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "border border-slate-300 bg-white text-[#111827]"
                              }`}
                            >
                              {isSelected ? "Selected" : "Select Flight"}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex shrink-0 flex-col gap-3 border-t border-[#e5edf6] bg-white px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="text-xs font-medium text-[#4b5563]">
              Flight pricing will be revalidated on booking.
            </div>

            <button
              onClick={handleClose}
              className="w-full px-5 py-2.5 rounded-xl border text-sm font-bold text-[#111827] hover:bg-slate-50 transition lg:w-auto"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
