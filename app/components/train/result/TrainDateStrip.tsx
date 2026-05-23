"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  startOfDay,
} from "date-fns";

type TrainDateStripProps = {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
};

const VISIBLE_DAYS = 8;
const MAX_DAYS = 120;

export default function TrainDateStrip({
  selectedDate,
  onDateSelect,
}: TrainDateStripProps) {
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

  const canGoLeft = differenceInCalendarDays(windowStartDate, today) > 0;
  const canGoRight =
    differenceInCalendarDays(windowStartDate, today) < MAX_DAYS - VISIBLE_DAYS;

  function handlePrev() {
    if (!canGoLeft) return;
    setWindowStartDate((prev) => addDays(prev, -1));
  }

  function handleNext() {
    if (!canGoRight) return;
    setWindowStartDate((prev) => addDays(prev, 1));
  }

  function handleSelectDate(date: Date) {
    const normalized = startOfDay(date);
    setActiveDate(normalized);
    onDateSelect?.(normalized);
  }

  return (
    <div className="grid grid-cols-[38px_repeat(8,minmax(0,1fr))_38px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={handlePrev}
        disabled={!canGoLeft}
        className={`flex items-center justify-center border-r border-slate-200 text-lg ${
          canGoLeft
            ? "text-sky-600 hover:bg-sky-50"
            : "cursor-not-allowed text-slate-300"
        }`}
      >
        ‹
      </button>

      {visibleDates.map((date, index) => {
        const selected = isSameDay(date, activeDate);
        const isLast = index === visibleDates.length - 1;

        return (
          <button
            key={date.toISOString()}
            type="button"
            onClick={() => handleSelectDate(date)}
            className={`px-2 py-2 text-center transition ${
              !isLast ? "border-r border-slate-200" : ""
            } ${
              selected
                ? "bg-sky-50 ring-1 ring-inset ring-sky-300"
                : "bg-white hover:bg-slate-50"
            }`}
          >
            <div
              className={`text-[12px] font-semibold ${
                selected ? "text-sky-700" : "text-slate-700"
              }`}
            >
              {format(date, "EEE, dd MMM")}
            </div>
          </button>
        );
      })}

      <button
        type="button"
        onClick={handleNext}
        disabled={!canGoRight}
        className={`flex items-center justify-center border-l border-slate-200 text-lg ${
          canGoRight
            ? "text-sky-600 hover:bg-sky-50"
            : "cursor-not-allowed text-slate-300"
        }`}
      >
        ›
      </button>
    </div>
  );
}