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
    <div className="grid grid-cols-[40px_repeat(8,minmax(0,1fr))_40px] overflow-hidden rounded-xl border border-[#d9e2ef] bg-white">
      <button
        type="button"
        onClick={handlePrev}
        disabled={!canGoLeft}
        className={`flex items-center justify-center border-r border-[#eef2f7] text-xl ${
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
            className={`px-3 py-3 text-center transition ${
              !isLast ? "border-r border-[#eef2f7]" : ""
            } ${
              selected
                ? "bg-[#ecfdf5] ring-1 ring-inset ring-[#86efac]"
                : "bg-white hover:bg-[#f8fafc]"
            }`}
          >
            <div
              className={`text-[12px] font-medium ${
                selected ? "text-[#111827]" : "text-[#374151]"
              }`}
            >
              {format(item.date, "EEE, MMM d")}
            </div>

            <div className="mt-1 text-[28px] font-bold leading-none text-[#16a34a]">
              ₹
            </div>

            <div className="mt-1 text-[18px] font-bold leading-none text-[#16a34a]">
              {item.price.toLocaleString("en-IN")}
            </div>
          </button>
        );
      })}

      <button
        type="button"
        onClick={handleNext}
        disabled={!canGoRight}
        className={`flex items-center justify-center border-l border-[#eef2f7] text-xl ${
          canGoRight
            ? "text-[#0b66c3] hover:bg-[#f8fbff]"
            : "cursor-not-allowed text-[#cbd5e1]"
        }`}
      >
        ›
      </button>
    </div>
  );
}