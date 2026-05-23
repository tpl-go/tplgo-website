"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CalendarDays, ChevronDown } from "lucide-react";
import { formatDate } from "@/app/lib/dateUtils";

type Props = {
  state: any;
  dispatch: any;
};

export default function BusDatePicker({ state, dispatch }: Props) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [popupStyle, setPopupStyle] = useState({
    top: 0,
    left: 0,
  });

  const selectedDate = useMemo(() => {
    return state.travelDate ? new Date(state.travelDate) : new Date();
  }, [state.travelDate]);

  useEffect(() => {
    setMounted(true);
  }, []);

  function updatePosition() {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const popupWidth = 360;
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

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;

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

  function handleSetDate(date: Date) {
    const localISO = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];

    dispatch({
      type: "SET_TRAVEL_DATE",
      payload: localISO,
    });

    setOpen(false);
  }

  return (
    <>
      <div className="w-full min-w-[220px]">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-[78px] w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 text-left shadow-sm transition-all duration-300 hover:border-orange-300 hover:shadow-md"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <CalendarDays size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
              Departure
            </p>
            <p className="text-[15px] font-semibold text-black">
              {formatDate(selectedDate)}
            </p>
            <span className="text-xs text-black/70">
              {selectedDate.toLocaleDateString("en-GB", { weekday: "long" })}
            </span>
          </div>

          <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>
      </div>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={popupRef}
            className="absolute z-[40] rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-black/5"
            style={{
              top: popupStyle.top,
              left: popupStyle.left,
              width: "360px",
            }}
          >
            <Calendar
              onChange={(date: any) => handleSetDate(date)}
              value={selectedDate}
              minDate={new Date()}
              showDoubleView={false}
            />
          </div>,
          document.body
        )}
    </>
  );
}