"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  startOfDay,
} from "date-fns";
import { generateDummyFlights } from "../../data/flightDummyData";

type FlightsDateFareStripProps = {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  fromCity: string;
  toCity: string;
};

type FareItem = {
  date: Date;
  price: number;
};

const VISIBLE_DAYS = 8;
const MAX_DAYS = 365;

function getRouteSeed(fromCity: string, toCity: string) {
  const combined = `${fromCity}-${toCity}`;
  return combined
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getDynamicFareForDate(
  date: Date,
  fromCity: string,
  toCity: string
): number {
  const today = startOfDay(new Date());
  const routeSeed = getRouteSeed(fromCity, toCity);
  const dayIndex = differenceInCalendarDays(startOfDay(date), today);

  const flights = generateDummyFlights(fromCity, toCity);
  const cheapestBaseFare = Math.min(
    ...flights.map((flight) => flight.basePrice)
  );

  const variations = [0, 180, 420, 0, 260, 0, 510, 120, 0, 350, 0, 90];
  const seasonalOffset =
    variations[Math.abs(dayIndex + routeSeed) % variations.length];
  const routeOffset = routeSeed % 700;

  return cheapestBaseFare + seasonalOffset + routeOffset;
}

export default function FlightsDateFareStrip({
  selectedDate,
  onDateSelect,
  fromCity,
  toCity,
}: FlightsDateFareStripProps) {
  const today = useMemo(() => startOfDay(new Date()), []);

  const initialSelectedDate = selectedDate ? startOfDay(selectedDate) : today;

  const [activeDate, setActiveDate] = useState<Date>(initialSelectedDate);

  const [windowStartDate, setWindowStartDate] = useState<Date>(() => {
    const safeSelected = selectedDate ? startOfDay(selectedDate) : today;
    const diffFromToday = differenceInCalendarDays(safeSelected, today);

    if (diffFromToday <= 0) return today;
    if (diffFromToday >= MAX_DAYS - VISIBLE_DAYS) {
      return addDays(today, MAX_DAYS - VISIBLE_DAYS);
    }

    return safeSelected;
  });

  useEffect(() => {
    if (!selectedDate) return;

    const normalized = startOfDay(selectedDate);
    setActiveDate(normalized);

    const diffFromToday = differenceInCalendarDays(normalized, today);

    if (diffFromToday <= 0) {
      setWindowStartDate(today);
      return;
    }

    if (diffFromToday >= MAX_DAYS - VISIBLE_DAYS) {
      setWindowStartDate(addDays(today, MAX_DAYS - VISIBLE_DAYS));
      return;
    }

    setWindowStartDate(normalized);
  }, [selectedDate, today]);

  const visibleDates = useMemo(() => {
    return Array.from({ length: VISIBLE_DAYS }, (_, index) =>
      addDays(windowStartDate, index)
    );
  }, [windowStartDate]);

  const fareData: FareItem[] = useMemo(() => {
    return visibleDates.map((date) => ({
      date,
      price: getDynamicFareForDate(date, fromCity, toCity),
    }));
  }, [visibleDates, fromCity, toCity]);

  const canGoLeft = differenceInCalendarDays(windowStartDate, today) > 0;
  const canGoRight =
    differenceInCalendarDays(windowStartDate, today) < MAX_DAYS - VISIBLE_DAYS;

  const handlePrev = () => {
    if (!canGoLeft) return;
    setWindowStartDate((prev) => addDays(prev, -1));
  };

  const handleNext = () => {
    if (!canGoRight) return;
    setWindowStartDate((prev) => addDays(prev, 1));
  };

  const handleSelectDate = (date: Date) => {
    const normalized = startOfDay(date);
    setActiveDate(normalized);
    onDateSelect?.(normalized);
  };

  return (
    <>
      <div className="sm:hidden">
        <div className="overflow-hidden rounded-2xl border border-[#d9e2ef] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#eef2f7] px-3 py-2">
            <div>
              <div className="text-[12px] font-black text-[#111827]">
                Date fares
              </div>
              <div className="text-[10px] font-semibold text-[#64748b]">
                Swipe to compare nearby days
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                disabled={!canGoLeft}
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-[18px] font-bold ${
                  canGoLeft
                    ? "border-[#dbeafe] bg-[#eff6ff] text-[#2563eb]"
                    : "cursor-not-allowed border-[#e5e7eb] bg-[#f8fafc] text-[#cbd5e1]"
                }`}
              >
                ‹
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!canGoRight}
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-[18px] font-bold ${
                  canGoRight
                    ? "border-[#dbeafe] bg-[#eff6ff] text-[#2563eb]"
                    : "cursor-not-allowed border-[#e5e7eb] bg-[#f8fafc] text-[#cbd5e1]"
                }`}
              >
                ›
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto overflow-y-hidden px-2.5 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {fareData.map((item) => {
              const selected = isSameDay(item.date, activeDate);

              return (
                <button
                  key={item.date.toISOString()}
                  type="button"
                  onClick={() => handleSelectDate(item.date)}
                  className={`min-w-[78px] rounded-xl border px-2 py-2 text-left transition ${
                    selected
                      ? "border-[#22c55e] bg-[#ecfdf5] shadow-sm"
                      : "border-[#e5e7eb] bg-white"
                  }`}
                >
                  <div
                    className={`text-[10px] font-black uppercase ${
                      selected ? "text-[#047857]" : "text-[#64748b]"
                    }`}
                  >
                    {format(item.date, "EEE")}
                  </div>
                  <div className="mt-0.5 text-[12px] font-black text-[#111827]">
                    {format(item.date, "MMM d")}
                  </div>
                  <div className="mt-1 text-[12px] font-black text-[#16a34a]">
                    ₹{item.price.toLocaleString("en-IN")}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="hidden w-full overflow-hidden rounded-xl border border-[#d9e2ef] bg-white sm:block">
        <div className="grid grid-cols-[34px_repeat(8,96px)_34px] overflow-x-auto overflow-y-hidden sm:grid-cols-[40px_repeat(8,minmax(0,1fr))_40px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={handlePrev}
            disabled={!canGoLeft}
            className={`sticky left-0 z-10 flex items-center justify-center border-r border-[#eef2f7] bg-white text-xl ${
              canGoLeft
                ? "text-[#0b66c3] hover:bg-[#f8fbff]"
                : "cursor-not-allowed text-[#cbd5e1]"
            }`}
          >
            ‹
          </button>

          {fareData.map((item, index) => {
            const selected = isSameDay(item.date, activeDate);
            const isLast = index === fareData.length - 1;

            return (
              <button
                key={item.date.toISOString()}
                type="button"
                onClick={() => handleSelectDate(item.date)}
                className={`px-2 py-2 text-center transition sm:px-3 sm:py-3 ${
                  !isLast ? "border-r border-[#eef2f7]" : ""
                } ${
                  selected
                    ? "bg-[#ecfdf5] ring-1 ring-inset ring-[#86efac]"
                    : "bg-white hover:bg-[#f8fafc]"
                }`}
              >
                <div
                  className={`text-[11px] font-medium sm:text-[12px] ${
                    selected ? "text-[#111827]" : "text-[#374151]"
                  }`}
                >
                  {format(item.date, "EEE, MMM d")}
                </div>

                <div className="mt-1 text-[20px] font-bold leading-none text-[#16a34a] sm:text-[28px]">
                  ₹
                </div>

                <div className="mt-1 text-[14px] font-bold leading-none text-[#16a34a] sm:text-[18px]">
                  {item.price.toLocaleString("en-IN")}
                </div>
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoRight}
            className={`sticky right-0 z-10 flex items-center justify-center border-l border-[#eef2f7] bg-white text-xl ${
              canGoRight
                ? "text-[#0b66c3] hover:bg-[#f8fbff]"
                : "cursor-not-allowed text-[#cbd5e1]"
            }`}
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
}
