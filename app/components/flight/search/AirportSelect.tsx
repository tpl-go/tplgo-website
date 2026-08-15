"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeftRight, ChevronDown } from "lucide-react";
import { AIRPORTS } from "../utils";

type Props = {
  state: any;
  dispatch: any;
  segmentIndex?: number;
  variant?: "home" | "results";
};

export default function AirportSelect({
  state,
  dispatch,
  segmentIndex = 0,
  variant = "home",
}: Props) {
  const isResults = variant === "results";

  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);
  const [fromPosition, setFromPosition] = useState<"top" | "bottom">("bottom");
  const [toPosition, setToPosition] = useState<"top" | "bottom">("bottom");

  const fromRef = useRef<any>(null);
  const toRef = useRef<any>(null);

  useEffect(() => {
    function handleClick(e: any) {
      if (fromRef.current && !fromRef.current.contains(e.target)) {
        setOpenFrom(false);
      }
      if (toRef.current && !toRef.current.contains(e.target)) {
        setOpenTo(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!openFrom || !fromRef.current) return;

    const rect = fromRef.current.getBoundingClientRect();
    const dropdownHeight = 260;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setFromPosition("top");
    } else {
      setFromPosition("bottom");
    }
  }, [openFrom]);

  useEffect(() => {
    if (!openTo || !toRef.current) return;

    const rect = toRef.current.getBoundingClientRect();
    const dropdownHeight = 260;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setToPosition("top");
    } else {
      setToPosition("bottom");
    }
  }, [openTo]);

  const defaultFrom = AIRPORTS.find((a) => a.code === "DEL");
  const defaultTo = AIRPORTS.find((a) => a.code === "BOM");

  const from =
    state.segments[segmentIndex]?.from ||
    (segmentIndex === 0 ? defaultFrom : null);

  const to =
    state.segments[segmentIndex]?.to ||
    (segmentIndex === 0 ? defaultTo : null);

  const handleFromSelect = (a: any) => {
    if (to?.code === a.code) {
      alert("Source and Destination cannot be same");
      return;
    }

    dispatch({
      type: "SET_SEGMENT_FIELD",
      index: segmentIndex,
      field: "from",
      value: a,
    });

    setOpenFrom(false);
  };

  const handleToSelect = (a: any) => {
    if (from?.code === a.code) {
      alert("Source and Destination cannot be same");
      return;
    }

    dispatch({
      type: "SET_SEGMENT_FIELD",
      index: segmentIndex,
      field: "to",
      value: a,
    });

    if (state.tripType === "multicity" && state.segments[segmentIndex + 1]) {
      dispatch({
        type: "SET_SEGMENT_FIELD",
        index: segmentIndex + 1,
        field: "from",
        value: a,
      });
    }

    setOpenTo(false);
  };

  return (
    <div
      className={`relative flex items-center ${
        isResults
          ? "w-full shrink-0 gap-2 overflow-visible xl:w-[430px]"
: "w-full shrink-0 gap-3 overflow-visible md:w-[430px]"
      }`}
    >
      {/* FROM */}
      <div ref={fromRef} className="relative min-w-0 flex-1 overflow-visible">
        <div
          onClick={() => setOpenFrom(!openFrom)}
          className={`flex cursor-pointer flex-col justify-center ${
            isResults
              ? "h-[64px] rounded-md border border-[#1f2937] bg-white px-4"
              : "h-[86px] rounded-2xl border border-slate-700 bg-white/60 px-4 py-3"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span
                className={`block ${
                  isResults
                    ? "text-[11px] font-semibold uppercase text-[#374151]"
                    : "text-[11px] font-bold text-slate-600"
                }`}
              >
                From
              </span>

              <p
                className={`truncate ${
                  isResults
                    ? state.segments[segmentIndex]?.from
                      ? "text-[18px] font-bold text-[#111827]"
                      : "text-[18px] font-semibold text-black"
                    : "text-[16px] font-extrabold text-slate-950"
                }`}
              >
                {from?.city ? `${from.city} (${from.code})` : "Select"}
              </p>

              <span
                className={`block truncate ${
                  isResults
                    ? "text-[11px] text-black"
                    : "text-[11px] text-slate-600"
                }`}
              >
                {from?.name}
              </span>
            </div>

            <ChevronDown
              size={17}
              className={isResults ? "text-[#1f2937]" : "text-slate-700"}
            />
          </div>
        </div>

        {openFrom && (
          <div
            className={`absolute left-0 z-[160] max-h-60 w-full overflow-y-auto bg-white shadow-xl ${
              isResults
                ? "rounded-xl border border-black"
                : "rounded-2xl border border-slate-700"
            } ${
              fromPosition === "top"
                ? "bottom-[68px]"
                : isResults
                ? "top-[68px]"
                : "top-[90px]"
            }`}
          >
            {AIRPORTS.map((a) => (
              <div
                key={a.code}
                onClick={() => handleFromSelect(a)}
                className="cursor-pointer px-4 py-2 text-black hover:bg-gray-100"
              >
                {a.city} ({a.code})
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SWAP */}
      <button
        onClick={() => {
          dispatch({
            type: "SET_SEGMENT_FIELD",
            index: segmentIndex,
            field: "from",
            value: to,
          });
          dispatch({
            type: "SET_SEGMENT_FIELD",
            index: segmentIndex,
            field: "to",
            value: from,
          });
        }}
        className={`z-10 flex items-center justify-center text-[#1f2937] ${
          isResults
            ? "h-[40px] w-[40px] shrink-0 rounded-full border border-black bg-white shadow-sm hover:bg-gray-50"
            : "h-8 w-8 shrink-0 rounded-full border border-slate-300 bg-white shadow-md hover:bg-orange-500 hover:text-white"
        }`}
        type="button"
      >
        <ArrowLeftRight size={17} />
      </button>

      {/* TO */}
      <div ref={toRef} className="relative min-w-0 flex-1 overflow-visible">
        <div
          onClick={() => setOpenTo(!openTo)}
          className={`flex cursor-pointer flex-col justify-center ${
            isResults
              ? "h-[64px] rounded-md border border-black bg-white px-4"
              : "h-[86px] rounded-2xl border border-slate-700 bg-white/60 px-4 py-3"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span
                className={`block ${
                  isResults
                    ? "text-[11px] font-semibold uppercase text-black"
                    : "text-[11px] font-bold text-slate-600"
                }`}
              >
                To
              </span>

              <p
                className={`truncate ${
                  isResults
                    ? state.segments[segmentIndex]?.to
                      ? "text-[18px] font-bold text-black"
                      : "text-[18px] font-semibold text-black"
                    : "text-[16px] font-extrabold text-slate-950"
                }`}
              >
                {to?.city ? `${to.city} (${to.code})` : "Select"}
              </p>

              <span
                className={`block truncate ${
                  isResults
                    ? "text-[11px] text-black"
                    : "text-[11px] text-slate-600"
                }`}
              >
                {to?.name}
              </span>
            </div>

            <ChevronDown
              size={17}
              className={isResults ? "text-black" : "text-slate-700"}
            />
          </div>
        </div>

        {openTo && (
          <div
            className={`absolute left-0 z-[160] max-h-60 w-full overflow-y-auto bg-white shadow-xl ${
              isResults
                ? "rounded-xl border border-black"
                : "rounded-2xl border border-slate-700"
            } ${
              toPosition === "top"
                ? "bottom-[68px]"
                : isResults
                ? "top-[68px]"
                : "top-[90px]"
            }`}
          >
            {AIRPORTS.map((a) => (
              <div
                key={a.code}
                onClick={() => handleToSelect(a)}
                className="cursor-pointer px-4 py-2 text-black hover:bg-gray-100"
              >
                {a.city} ({a.code})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
