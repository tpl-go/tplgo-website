"use client";

import { useState, useRef, useEffect } from "react";
import { DateRange } from "react-date-range";
import { format, addDays } from "date-fns";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

type Props = {
  state: any;
  dispatch: any;
  variant?: "home" | "results";
  segmentIndex?: number;
  multiCityMode?: boolean;
};

export default function Calendar({
  state,
  dispatch,
  variant = "home",
  segmentIndex = 0,
  multiCityMode = false,
}: Props) {
  const isResults = variant === "results";

  const [openDep, setOpenDep] = useState(false);
  const [openRet, setOpenRet] = useState(false);

  const depRef = useRef<any>(null);
  const retRef = useRef<any>(null);

  useEffect(() => {
    function handleClick(e: any) {
      if (depRef.current && !depRef.current.contains(e.target)) {
        setOpenDep(false);
      }
      if (retRef.current && !retRef.current.contains(e.target)) {
        setOpenRet(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const departure = state.segments[segmentIndex]?.departure || today;
  const returnDate = state.returnDate || addDays(departure, 1);

  const [range, setRange] = useState([
    {
      startDate: departure,
      endDate: returnDate,
      key: "selection",
    },
  ]);

  const handleDateChange = (item: any) => {
    const start = item.selection.startDate;
    const end = item.selection.endDate;

    if (openDep) {
      dispatch({
        type: "SET_SEGMENT_FIELD",
        index: segmentIndex,
        field: "departure",
        value: start,
      });

      if (!multiCityMode && state.tripType === "roundtrip" && end <= start) {
        const next = new Date(start);
        next.setDate(next.getDate() + 1);

        dispatch({
          type: "SET_RETURN",
          payload: next,
        });
      }

      setOpenDep(false);
    }

    if (openRet && !multiCityMode) {
      dispatch({
        type: "SET_RETURN",
        payload: end,
      });

      setOpenRet(false);
    }

    setRange([
      {
        startDate: start,
        endDate: end,
        key: "selection",
      },
    ]);
  };

  const departureMinDate =
    multiCityMode &&
    segmentIndex > 0 &&
    state.segments[segmentIndex - 1]?.departure
      ? new Date(state.segments[segmentIndex - 1].departure)
      : today;

  return (
    <div
      className={`grid w-full grid-cols-1 ${
        !multiCityMode ? isResults ? "gap-2 xl:flex xl:w-auto xl:items-center" : "gap-3 md:flex md:w-auto md:items-center" : ""
      } ${isResults ? "xl:gap-2 xl:shrink-0" : "md:gap-3 md:shrink-0"}`}
    >
      {/* DEPARTURE */}
      <div ref={depRef} className={`relative w-full ${isResults ? "xl:w-auto" : "md:w-auto"}`}>
        <div
          onClick={() => setOpenDep(true)}
          className={`flex cursor-pointer flex-col justify-center ${
            isResults
              ? "h-[64px] w-full xl:w-[140px] rounded-md border border-[#1f2937] bg-white px-3"
              : "h-[76px] md:h-[86px] w-full md:w-[180px] rounded-2xl border border-slate-700 bg-white/60 px-4 py-3"
          }`}
        >
          <span
            className={`${
              isResults
                ? "text-[11px] font-semibold uppercase text-[#374151]"
                : "text-[10px] md:text-[11px] font-bold text-slate-600"
            }`}
          >
            Departure
          </span>

          <p
            className={`${
              isResults
                ? "text-[18px] font-bold text-black"
                : "text-base md:text-lg font-extrabold text-slate-950"
            }`}
          >
            {format(departure, "dd MMM yy")}
          </p>

          <span
            className={`${
              isResults
                ? "text-[11px] text-black"
                : "text-[10px] md:text-[11px] text-slate-600"
            }`}
          >
            {format(departure, "EEEE")}
          </span>
        </div>

        {openDep && (
          <div
            className={`absolute left-0 z-[40] bg-white shadow-xl ${
              isResults
                ? "top-[68px] rounded-xl border border-black"
                : "top-[82px] md:top-[90px] rounded-2xl border border-slate-700"
            } w-[calc(100vw-40px)] md:w-auto max-w-[95vw] overflow-visible`}
          >
            <DateRange
              ranges={range}
              months={typeof window !== "undefined" && window.innerWidth < 768 ? 1 : 2}
              direction={
                typeof window !== "undefined" && window.innerWidth < 768
                  ? "vertical"
                  : "horizontal"
              }
              moveRangeOnFirstSelection={false}
              showDateDisplay={false}
              onChange={handleDateChange}
              minDate={departureMinDate}
            />
          </div>
        )}
      </div>

      {/* RETURN - hide in multicity */}
      {!multiCityMode && (
        <div ref={retRef} className={`relative w-full ${isResults ? "xl:w-auto" : "md:w-auto"}`}>
          <div
            onClick={() => {
              if (state.tripType === "roundtrip") {
                setOpenRet(true);
              }
            }}
            className={`flex flex-col justify-center ${
              isResults
                ? "h-[64px] w-full xl:w-[150px] rounded-md border border-black px-4"
                : "h-[76px] md:h-[86px] w-full md:w-[180px] rounded-2xl border border-slate-700 px-4 py-3"
            } ${
              state.tripType === "oneway"
                ? isResults
                  ? "bg-[#f3f4f6] cursor-not-allowed opacity-70"
                  : "bg-white/35 cursor-not-allowed opacity-60"
                : isResults
                ? "bg-white cursor-pointer"
                : "bg-white/60 cursor-pointer"
            }`}
          >
            <span
              className={`${
                isResults
                  ? "text-[11px] font-semibold uppercase text-black"
                  : "text-[10px] md:text-[11px] font-bold text-slate-600"
              }`}
            >
              Return
            </span>

            <p
              className={`${
                isResults
                  ? "text-[18px] font-bold text-black"
                  : "text-base md:text-lg font-extrabold text-slate-950"
              }`}
            >
              {format(returnDate, "dd MMM yy")}
            </p>

            <span
              className={`${
                isResults
                  ? "text-[11px] text-black"
                  : "text-[10px] md:text-[11px] text-slate-600"
              }`}
            >
              {format(returnDate, "EEEE")}
            </span>
          </div>

          {openRet && state.tripType === "roundtrip" && (
            <div
              className={`absolute left-0 z-[40] bg-white shadow-xl ${
                isResults
                  ? "top-[68px] rounded-xl border border-black"
                  : "top-[82px] md:top-[90px] rounded-2xl border border-slate-700"
              } w-[calc(100vw-40px)] md:w-auto max-w-[95vw] overflow-visible`}
            >
              <DateRange
                ranges={range}
                months={typeof window !== "undefined" && window.innerWidth < 768 ? 1 : 2}
                direction={
                  typeof window !== "undefined" && window.innerWidth < 768
                    ? "vertical"
                    : "horizontal"
                }
                moveRangeOnFirstSelection={false}
                showDateDisplay={false}
                onChange={handleDateChange}
                minDate={departure}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}