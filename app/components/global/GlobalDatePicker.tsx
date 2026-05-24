"use client";

import { useState, useRef, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { ChevronDown } from "lucide-react";
import { formatDate } from "@/app/lib/dateUtils";

type Props = {
  value: Date;
  setValue: (date: Date) => void;
  label: string;
  hideInput?: boolean;
};

export default function GlobalDatePicker({
  value,
  setValue,
  label,
  hideInput = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<any>(null);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    function handleClick(e: any) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const calendarBlock = (
    <div className="w-full rounded-2xl border border-slate-700 bg-white p-3 shadow-2xl md:w-auto">
      <Calendar
        onChange={(date: any) => {
          setValue(date);
          setOpen(false);
        }}
        value={value}
        minDate={new Date()}
        showDoubleView={!isMobile}
      />
    </div>
  );

  if (hideInput) {
    return <div ref={ref}>{calendarBlock}</div>;
  }

  return (
    <div ref={ref} className="relative w-full shrink-0 md:w-auto">
      <div
        onClick={() => setOpen(true)}
        className="relative flex min-h-[86px] w-full cursor-pointer flex-col justify-center rounded-2xl border border-slate-700 bg-white/70 px-4 py-3 shadow-sm md:h-[86px] md:w-[200px] md:bg-white/60 md:shadow-none"
      >
        <span className="text-[10px] font-bold uppercase leading-none tracking-wide text-slate-600 md:text-[11px] md:normal-case md:tracking-normal">
          {label}
        </span>

        <p className="mt-1 truncate pr-6 text-[22px] font-extrabold leading-tight text-slate-950 md:text-lg">
          {formatDate(value)}
        </p>

        <span className="mt-0.5 text-[11px] leading-none text-slate-600">
          {value.toLocaleDateString("en-GB", { weekday: "long" })}
        </span>

        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
      </div>

      {open && (
        <div className="absolute left-0 top-[92px] z-[9999] w-full md:top-[90px] md:w-auto">
          {calendarBlock}
        </div>
      )}
    </div>
  );
}