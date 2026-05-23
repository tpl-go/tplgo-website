"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDisplayDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateToISO(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isSameDate(a: Date, b: Date) {
  return formatDateToISO(a) === formatDateToISO(b);
}

function isBeforeToday(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  return d < today;
}

function buildMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const cells: (Date | null)[] = [];

  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) {
    cells.push(new Date(year, month, d));
  }

  return cells;
}

export default function CabResultDateField({
  value,
  onChange,
  placeholder = "Select date",
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);

  const selectedDate = useMemo(() => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [value]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [currentMonth, setCurrentMonth] = useState(
    selectedDate
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      : new Date(today.getFullYear(), today.getMonth(), 1)
  );

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      );
    }
  }, [selectedDate]);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        popupRef.current &&
        !popupRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const monthLabel = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const days = buildMonthDays(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );

  function goPrevMonth() {
    const prev = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );

    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    if (prev < currentMonthStart) return;

    setCurrentMonth(prev);
  }

  function goNextMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  }

  return (
    <div ref={wrapperRef} className="relative overflow-visible">
      <input
        readOnly
        value={formatDisplayDate(value)}
        onClick={() => setOpen((prev) => !prev)}
        placeholder={placeholder}
        className="w-full cursor-pointer bg-transparent text-[16px] font-semibold text-white outline-none placeholder:text-slate-400"
      />

      {open && (
        <div
          ref={popupRef}
          className="absolute left-0 top-[calc(100%+8px)] z-[140] w-[320px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={
                currentMonth.getFullYear() === today.getFullYear() &&
                currentMonth.getMonth() === today.getMonth()
              }
            >
              <ChevronLeft size={16} />
            </button>

            <div className="text-[15px] font-bold text-slate-900">
              {monthLabel}
            </div>

            <button
              type="button"
              onClick={goNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {DAY_NAMES.map((day) => (
              <div
                key={day}
                className="flex h-8 items-center justify-center text-[12px] font-bold text-slate-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-9 w-9" />;
              }

              const disabled = isBeforeToday(day);
              const active = selectedDate ? isSameDate(day, selectedDate) : false;

              return (
                <button
                  key={formatDateToISO(day)}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(formatDateToISO(day));
                    setOpen(false);
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-[13px] font-semibold transition ${
                    active
                      ? "bg-sky-500 text-white"
                      : disabled
                      ? "cursor-not-allowed text-slate-300"
                      : "text-slate-700 hover:bg-sky-50"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}