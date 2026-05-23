"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type CruiseSailing = {
  mode: "date" | "month";
  exactDate: string | null;
  month: string | null;
};

type Props = {
  value: CruiseSailing;
  onChange: (value: CruiseSailing) => void;
  error?: string;
};

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getMonthFromISO(dateStr: string) {
  const [year, month] = dateStr.split("-");
  return `${year}-${month}`;
}

export default function CruiseSailingField({
  value,
  onChange,
  error,
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedDate = useMemo(() => {
    return value.exactDate ? new Date(value.exactDate) : new Date();
  }, [value.exactDate]);

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

    onChange({
      mode: "date",
      exactDate: localISO,
      month: getMonthFromISO(localISO),
    });

    setOpen(false);
  }

  return (
    <>
      <div className="relative w-full">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex min-h-[132px] w-full flex-col items-start justify-center rounded-2xl px-4 py-4 text-left transition hover:bg-white/75"
        >
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Sailing
          </span>

          <span className="mt-2 line-clamp-2 text-[15px] font-extrabold leading-[21px] text-slate-950">
            {value.exactDate
              ? formatDisplayDate(selectedDate)
              : "Select sailing date"}
          </span>

          <span className="mt-2 line-clamp-2 text-[12px] leading-[16px] text-slate-600">
            {value.exactDate
              ? selectedDate.toLocaleDateString("en-GB", { weekday: "long" })
              : "Search month will be auto-picked"}
          </span>
        </button>

        {error ? <p className="mt-1 px-2 text-xs text-red-500">{error}</p> : null}
      </div>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={popupRef}
            className="absolute z-[30] rounded-2xl border border-black bg-white p-3 shadow-2xl"
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