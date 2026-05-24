"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronDown } from "lucide-react";
import { format } from "date-fns";

type Props = {
  value: string;
  onChange: (date: string) => void;
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

export default function TrainDatePicker({
  value,
  onChange,
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

  const selectedDate = value ? new Date(value) : new Date();

  useEffect(() => {
    setMounted(true);
  }, []);

  function updatePosition() {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();

    const isMobile = window.innerWidth < 768;
    const popupWidth = isMobile ? Math.min(window.innerWidth - 24, 360) : 760;
    const gap = 10;

    let left = isMobile
      ? window.scrollX + 12
      : rect.left + window.scrollX;

    let top = rect.bottom + window.scrollY + gap;

    const maxLeft =
      window.scrollX + window.innerWidth - popupWidth - 12;

    if (left > maxLeft) {
      left = Math.max(window.scrollX + 12, maxLeft);
    }

    setPopupStyle({ top, left });
  }

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handleScrollOrResize = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        updatePosition();
      });
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
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

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const month1 = new Date(today.getFullYear(), today.getMonth(), 1);

  const month2 = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  return (
    <>
      <div className="w-full md:min-w-[240px]">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-[76px] md:h-[86px] w-full items-center gap-3 rounded-2xl border border-black bg-white/60 px-4 py-3 text-left transition-all duration-300 hover:bg-white/75"
        >
          <div className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-orange-600">
            <CalendarDays size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[10px] md:text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Travel Date
            </p>

            <p className="text-[15px] md:text-[18px] font-extrabold text-slate-950">
              {format(selectedDate, "dd MMM yyyy")}
            </p>

            <span className="text-[10px] md:text-[11px] text-slate-600">
              {format(selectedDate, "EEEE")}
            </span>
          </div>

          <ChevronDown className="h-4 w-4 text-slate-600" />
        </button>
      </div>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={popupRef}
            className="absolute z-[9999] rounded-2xl border border-black bg-white p-3 md:p-5 shadow-2xl"
            style={{
              top: popupStyle.top,
              left: popupStyle.left,
              width:
                typeof window !== "undefined" && window.innerWidth < 768
                  ? "calc(100vw - 24px)"
                  : "760px",
              maxWidth: "760px",
            }}
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              {[month1, month2].map((monthDate) => {
                const year = monthDate.getFullYear();
                const month = monthDate.getMonth();

                const days = buildMonthDays(year, month);

                return (
                  <div key={`${year}-${month}`}>
                    <div className="mb-3 md:mb-4 text-center text-base md:text-[18px] font-bold text-slate-900">
                      {format(monthDate, "MMMM yyyy")}
                    </div>

                    <div className="mb-2 md:mb-3 grid grid-cols-7 text-center text-[11px] md:text-xs font-semibold text-slate-500">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                        (day) => (
                          <div key={day}>{day}</div>
                        )
                      )}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                      {days.map((day, idx) =>
                        day ? (
                          <button
                            key={day.toISOString()}
                            type="button"
                            disabled={day < today}
                            onClick={() => {
                              const iso = format(day, "yyyy-MM-dd");

                              onChange(iso);
                              setOpen(false);
                            }}
                            className={`flex h-9 md:h-10 items-center justify-center rounded-xl text-xs md:text-sm font-semibold transition-all ${
                              format(day, "yyyy-MM-dd") === value
                                ? "bg-orange-500 text-white"
                                : day < today
                                ? "cursor-not-allowed text-slate-300"
                                : "text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                            }`}
                          >
                            {day.getDate()}
                          </button>
                        ) : (
                          <div key={idx} className="h-9 md:h-10" />
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