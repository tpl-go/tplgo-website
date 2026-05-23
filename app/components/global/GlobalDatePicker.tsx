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
  const ref = useRef<any>(null);

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
    <div className="rounded-2xl border border-slate-700 bg-white p-3 shadow-2xl">
      <Calendar
        onChange={(date: any) => {
          setValue(date);
          setOpen(false);
        }}
        value={value}
        minDate={new Date()}
        showDoubleView={true}
      />
    </div>
  );

  if (hideInput) {
    return <div ref={ref}>{calendarBlock}</div>;
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <div
        onClick={() => setOpen(true)}
        className="relative flex h-[86px] w-[200px] cursor-pointer flex-col justify-center rounded-2xl border border-slate-700 bg-white/60 px-4 py-3"
      >
        <span className="text-[11px] font-bold text-slate-600">{label}</span>

        <p className="truncate text-lg font-extrabold text-slate-950">
          {formatDate(value)}
        </p>

        <span className="text-[11px] text-slate-600">
          {value.toLocaleDateString("en-GB", { weekday: "long" })}
        </span>

        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
      </div>

      {open && (
        <div className="absolute left-0 top-[90px] z-[9999]">
          {calendarBlock}
        </div>
      )}
    </div>
  );
}