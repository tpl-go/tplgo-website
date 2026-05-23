"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronDown } from "lucide-react";
import { format } from "date-fns";

type Props = {
  label: string;
  value: Date | null;
  helperText?: string;
  onChange: (date: Date) => void;
  compact?: boolean;
};

function buildMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];

  for (let i = 0; i < first.getDay(); i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  return days;
}

export default function CabDateField({
  label,
  value,
  helperText,
  onChange,
  compact = false,
}: Props) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [popupStyle, setPopupStyle] = useState({
    top: 0,
    left: 0,
  });

  const selectedDate = value || new Date();

  useEffect(() => {
    setMounted(true);
  }, []);

  function updatePosition() {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const popupWidth = 760;
    const gap = 10;

    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + gap;

    const maxLeft = window.scrollX + window.innerWidth - popupWidth - 16;

    if (left > maxLeft) {
      left = Math.max(window.scrollX + 16, maxLeft);
    }

    setPopupStyle({ top, left });
  }

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handleScrollOrResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        updatePosition();
      });
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popupRef.current &&
        !popupRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const month1 = new Date(today.getFullYear(), today.getMonth(), 1);
  const month2 = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const boxHeight = compact ? "h-[75px]" : "h-[86px]";
  const iconBox = compact ? "h-9 w-9" : "h-10 w-10";

  return (
    <>
      <div className="w-full min-w-0 flex-1">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`flex ${boxHeight} w-full items-center gap-2 rounded-2xl border border-black bg-white/60 px-3 py-2 text-left transition-all duration-300 hover:bg-white/75`}
        >
          <div
            className={`flex ${iconBox} shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-orange-600`}
          >
            <CalendarDays size={16} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
              {label}
            </p>

            <p className="whitespace-nowrap text-[15px] font-extrabold text-slate-950">
              {format(selectedDate, "dd MMM yy")}
            </p>

            <span className="block truncate text-[10px] text-slate-600">
              {helperText || format(selectedDate, "EEEE")}
            </span>
          </div>

          <ChevronDown className="h-4 w-4 shrink-0 text-black" />
        </button>
      </div>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={popupRef}
            className="absolute z-[30] rounded-2xl border border-black bg-white p-5 shadow-2xl"
            style={{
              top: popupStyle.top,
              left: popupStyle.left,
              width: "760px",
            }}
          >
            <div className="grid grid-cols-2 gap-8">
              {[month1, month2].map((monthDate) => {
                const year = monthDate.getFullYear();
                const month = monthDate.getMonth();
                const days = buildMonthDays(year, month);

                return (
                  <div key={`${year}-${month}`}>
                    <div className="mb-4 text-center text-[18px] font-bold text-slate-900">
                      {format(monthDate, "MMMM yyyy")}
                    </div>

                    <div className="mb-3 grid grid-cols-7 text-center text-xs font-semibold text-slate-500">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <div key={day}>{day}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {days.map((day, idx) =>
                        day ? (
                          <button
                            key={day.toISOString()}
                            type="button"
                            onClick={() => {
                              onChange(day);
                              setOpen(false);
                            }}
                            className={`flex h-10 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                              format(day, "yyyy-MM-dd") ===
                              format(selectedDate, "yyyy-MM-dd")
                                ? "bg-orange-500 text-white"
                                : day < today
                                ? "cursor-not-allowed text-slate-300"
                                : "text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                            }`}
                            disabled={day < today}
                          >
                            {day.getDate()}
                          </button>
                        ) : (
                          <div key={idx} className="h-10" />
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}