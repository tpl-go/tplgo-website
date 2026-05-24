"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import { DateRange } from "react-date-range";
import { format, addDays } from "date-fns";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function HomeStayCalender({ dispatch, type, date }: any) {
  const [open, setOpen] = useState(false);
  const calRef = useRef<any>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [range, setRange] = useState<any>([
    {
      startDate: date || today,
      endDate: addDays(date || today, 1),
      key: "selection",
    },
  ]);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (calRef.current && !calRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateChange = (item: any) => {
    let start = item.selection.startDate;
    let end = item.selection.endDate;

    if (start < today) {
      start = today;
    }

    if (type === "CHECKIN") {
      dispatch({
        type: "SET_CHECKIN",
        payload: start,
      });

      const nextDay = new Date(start);
      nextDay.setDate(nextDay.getDate() + 1);

      dispatch({
        type: "SET_CHECKOUT",
        payload: nextDay,
      });

      setRange([
        {
          startDate: start,
          endDate: nextDay,
          key: "selection",
        },
      ]);

      setOpen(false);
    }

    if (type === "CHECKOUT") {
      if (end > today) {
        dispatch({
          type: "SET_CHECKOUT",
          payload: end,
        });

        setRange([
          {
            startDate: start,
            endDate: end,
            key: "selection",
          },
        ]);

        setOpen(false);
      }
    }
  };

  return (
    <div ref={calRef} className="relative w-full shrink-0 md:w-auto">
      <div
        onClick={() => setOpen(true)}
        className="flex h-[76px] md:h-[86px] w-full md:w-[190px] cursor-pointer flex-col justify-center rounded-2xl border border-slate-700 bg-white/60 px-4 py-3"
      >
        <span className="text-[10px] md:text-[11px] font-bold text-slate-600">
          {type === "CHECKIN" ? "CHECK-IN" : "CHECK-OUT"}
        </span>

        <div className="flex w-full items-center justify-between">
          <div>
            <span className="block text-base md:text-lg font-extrabold text-slate-950">
              {format(date || today, "dd MMM yy")}
            </span>

            <span className="text-[10px] md:text-[11px] text-slate-600">
              {format(date || today, "EEEE")}
            </span>
          </div>

          <Calendar size={18} className="text-slate-700" />
        </div>
      </div>

      {open && (
        <div className="absolute left-0 top-[82px] md:top-[90px] z-[9999] w-[calc(100vw-40px)] md:w-auto max-w-[95vw] overflow-hidden rounded-2xl border border-slate-700 bg-white shadow-2xl">
          <DateRange
            ranges={range}
            months={
              typeof window !== "undefined" && window.innerWidth < 768 ? 1 : 2
            }
            direction={
              typeof window !== "undefined" && window.innerWidth < 768
                ? "vertical"
                : "horizontal"
            }
            moveRangeOnFirstSelection={false}
            showDateDisplay={false}
            onChange={handleDateChange}
            minDate={type === "CHECKIN" ? today : addDays(date || today, 1)}
          />
        </div>
      )}
    </div>
  );
}