"use client";

import { useEffect, useMemo, useState } from "react";
import type { PackageHotelOption } from "@/app/lib/packages/packageSelectionTypes";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  city: string;
  nights: number;
  checkInDate: string;
  options: PackageHotelOption[];
  stayCount?: number;
  selectedHotels?: PackageHotelOption[];
  onSelectHotel: (hotel: PackageHotelOption, index: number) => void;
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

export default function PackageChangeHotelModal({
  isOpen,
  onClose,
  city,
  nights,
  checkInDate,
  options,
  stayCount = 1,
  selectedHotels = [],
  onSelectHotel,
}: Props) {
  const [activeStayIndex, setActiveStayIndex] = useState(0);

  const stayPlans = useMemo(
    () => Array.from({ length: Math.max(stayCount, 1) }, (_, index) => index),
    [stayCount]
  );

  const defaultIncludedHotel = useMemo(
    () => options.find((hotel) => hotel.included) || null,
    [options]
  );

  useEffect(() => {
    if (!isOpen) return;
    if (!defaultIncludedHotel) return;

    stayPlans.forEach((index) => {
      const alreadySelected = selectedHotels?.[index];
      if (!alreadySelected) {
        onSelectHotel(defaultIncludedHotel, index);
      }
    });
  }, [
    isOpen,
    defaultIncludedHotel,
    stayPlans,
    onSelectHotel,
    selectedHotels,
  ]);

  if (!isOpen) return null;

  const currentSelectedHotel =
    selectedHotels?.[activeStayIndex] || defaultIncludedHotel || null;

  const currentSelectedId = currentSelectedHotel?.id || null;
  const activeDate = addDays(checkInDate, activeStayIndex);
  const activeSelectedHotel = currentSelectedHotel;

  const isAnyHotelSelected = selectedHotels?.some(Boolean) || !!defaultIncludedHotel;

  const handleClose = () => {
    if (!isAnyHotelSelected) {
      const confirmClose = window.confirm(
        "No hotel selected.\nDefault included hotel will be applied.\n\nDo you want to continue?"
      );
      if (!confirmClose) return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[240] bg-black/45 backdrop-blur-[2px] overflow-y-auto">
      <div className="min-h-full px-4 py-4 flex items-start justify-center">
        <div className="w-full max-w-[920px] rounded-[28px] border border-[#dbe4f0] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.22)] overflow-hidden my-2">
          {/* HEADER */}
          <div className="border-b border-[#e5edf6] px-6 py-5 bg-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[24px] leading-none font-black text-[#111827]">
                  Change Hotel
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#d8e4f4] bg-[#f8fbff] px-3 py-1.5 text-[12px] font-bold text-[#1f2937]">
                    {stayCount} Hotel{stayCount > 1 ? "s" : ""}
                  </span>

                  {activeDate ? (
                    <span className="rounded-full border border-[#d8e4f4] bg-[#f8fbff] px-3 py-1.5 text-[12px] font-bold text-[#1f2937]">
                      {formatDate(activeDate)}
                    </span>
                  ) : null}

                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[12px] font-bold text-blue-800">
                    {city}
                  </span>
                </div>

                <div className="mt-3 text-sm font-medium text-[#4b5563]">
                  Hotels are linked with your stay date and destination. If you customize a hotel,
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
          <div className="border-b border-[#e5edf6] bg-[#f8fbff] px-6 py-3">
            <div className="flex flex-wrap gap-3">
              {stayPlans.map((stayIndex) => {
                const selectedHotel =
                  selectedHotels?.[stayIndex] || defaultIncludedHotel || null;
                const isActive = activeStayIndex === stayIndex;
                const hasSelection = !!selectedHotel;
                const stayDate = addDays(checkInDate, stayIndex);

                return (
                  <button
                    key={stayIndex}
                    type="button"
                    onClick={() => setActiveStayIndex(stayIndex)}
                    className={`min-w-[165px] rounded-xl border px-3 py-2 text-left transition ${
                      isActive
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : hasSelection
                        ? "border-green-400 bg-green-50"
                        : "border-[#d6e4f5] bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="text-[11px] font-bold text-[#111827]">
                      Hotel {stayIndex + 1}
                    </div>

                    <div className="mt-0.5 text-[10px] font-semibold text-[#374151] line-clamp-1">
                      {city}
                    </div>

                    <div className="mt-0.5 text-[10px] font-medium text-[#6b7280] line-clamp-1">
                      {selectedHotel ? selectedHotel.hotelName : "Choose hotel"}
                    </div>

                    {stayDate ? (
                      <div className="mt-0.5 text-[10px] font-medium text-[#6b7280]">
                        {formatDate(stayDate)}
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
          <div className="max-h-[46vh] overflow-y-auto bg-[#f8fafc] px-6 py-4">
            <div className="rounded-2xl border border-[#dbe7f3] bg-white overflow-hidden">
              <div className="border-b border-[#e7eef7] bg-[#f8fbff] px-4 py-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-[15px] font-extrabold text-[#111827]">
                      Hotel {activeStayIndex + 1} • {city}
                    </div>

                    <div className="mt-1 text-[12px] font-medium text-[#4b5563]">
                      {formatDate(activeDate)}
                    </div>
                  </div>

                  {activeSelectedHotel ? (
                    <div className="text-[12px] font-semibold text-blue-700">
                      Selected: {activeSelectedHotel.hotelName}
                      {activeSelectedHotel.roomType
                        ? ` • ${activeSelectedHotel.roomType}`
                        : ""}
                    </div>
                  ) : (
                    <div className="text-[12px] font-semibold text-[#4b5563]">
                      Choose preferred hotel
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3">
                <div className="grid gap-3">
                  {options.map((hotel) => {
                    const isSelected = currentSelectedId === hotel.id;

                    return (
                      <button
                        key={`${activeStayIndex}-${hotel.id}`}
                        onClick={() => onSelectHotel(hotel, activeStayIndex)}
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
                                {hotel.hotelName}
                              </span>

                              <span className="px-3 py-1 text-[10px] rounded-full bg-yellow-50 border border-yellow-200 text-yellow-800 font-bold">
                                ⭐ {hotel.starRating}
                              </span>

                              {hotel.included ? (
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
                              {hotel.roomType} • {hotel.mealPlan}
                            </div>

                            <div className="mt-1 text-[12px] font-medium text-[#4b5563]">
                              {formatDate(activeDate)} • {hotel.nights || nights} Night
                              {(hotel.nights || nights) > 1 ? "s" : ""}
                            </div>

                            <div className="mt-2 text-[11px] font-medium text-[#6b7280]">
                              Linked to: {city} • {formatDate(activeDate)}
                            </div>
                          </div>

                          <div className="flex flex-col items-start lg:items-end gap-2">
                            <div
                              className={`px-3 py-1.5 text-[12px] font-black rounded-full ${
                                hotel.fareDiff === 0
                                  ? "bg-green-50 border border-green-200 text-green-700"
                                  : hotel.fareDiff > 0
                                  ? "bg-orange-50 border border-orange-200 text-orange-700"
                                  : "bg-blue-50 border border-blue-200 text-blue-700"
                              }`}
                            >
                              {formatFareDiff(hotel.fareDiff)}
                            </div>

                            <div
                              className={`px-4 py-2 rounded-xl text-[12px] font-bold ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "border border-slate-300 bg-white text-[#111827]"
                              }`}
                            >
                              {isSelected ? "Selected" : "Select Hotel"}
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
          <div className="border-t border-[#e5edf6] px-6 py-4 flex justify-between items-center bg-white">
            <div className="text-xs font-medium text-[#4b5563]">
              Hotel pricing will be revalidated on booking.
            </div>

            <button
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl border text-sm font-bold text-[#111827] hover:bg-slate-50 transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}