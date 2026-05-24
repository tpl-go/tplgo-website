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
  const [isMobile, setIsMobile] = useState(false);
  const [popupStyle, setPopupStyle] = useState({
    top: 0,
    left: 0,
    width: 360,
  });

  const selectedDate = useMemo(() => {
    return state.travelDate ? new Date(state.travelDate) : new Date();
  }, [state.travelDate]);

  useEffect(() => {
    setMounted(true);

    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function updatePosition() {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 10;

    if (window.innerWidth < 768) {
      const mobileLeft = window.scrollX + 12;
      const mobileWidth = window.innerWidth - 24;
      const mobileTop = rect.bottom + window.scrollY + gap;

      setPopupStyle({
        top: mobileTop,
        left: mobileLeft,
        width: mobileWidth,
      });

      return;
    }

    const popupWidth = 360;

    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + gap;

    const maxLeft = window.scrollX + window.innerWidth - popupWidth - 16;
    if (left > maxLeft) {
      left = Math.max(window.scrollX + 16, maxLeft);
    }

    setPopupStyle({ top, left, width: popupWidth });
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
      <div className="w-full min-w-0 md:min-w-[220px]">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex min-h-[86px] w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 text-left shadow-sm transition-all duration-300 hover:border-orange-300 hover:shadow-md md:h-[78px] md:min-h-0"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <CalendarDays size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[10px] font-bold uppercase leading-none tracking-wide text-slate-700 md:text-xs md:font-semibold">
              Departure
            </p>

            <p className="truncate text-[20px] font-extrabold leading-tight text-black md:text-[15px] md:font-semibold">
              {formatDate(selectedDate)}
            </p>

            <span className="mt-0.5 block text-[11px] leading-none text-black/70 md:text-xs md:leading-normal">
              {selectedDate.toLocaleDateString("en-GB", { weekday: "long" })}
            </span>
          </div>

          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
        </button>
      </div>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={popupRef}
            className="absolute z-[9999] max-w-[calc(100vw-24px)] rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-black/5"
            style={{
              top: popupStyle.top,
              left: popupStyle.left,
              width: popupStyle.width,
            }}
          >
            <Calendar
              onChange={(date: any) => handleSetDate(date)}
              value={selectedDate}
              minDate={new Date()}
              showDoubleView={!isMobile}
            />
          </div>,
          document.body
        )}
    </>
  );
}