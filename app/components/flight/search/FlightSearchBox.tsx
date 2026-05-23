"use client";

import { useState, useRef, useEffect } from "react";
import { useFlightSearch } from "../hooks";
import { AIRPORTS, generateMonths } from "../utils";
import TripTypeTabs from "./TripTypeTabs";
import FareTypeSelector from "./FareTypeSelector";
import SearchButton from "./SearchButton";
import AirportSelect from "./AirportSelect";
import Calendar from "./Calendar";
import TravelSelector from "./TravelSelector";

type FlightSearchBoxProps = {
  variant?: "home" | "results";
};

export default function FlightSearchBox({
  variant = "home",
}: FlightSearchBoxProps) {
  const isResults = variant === "results";
  const { state, dispatch } = useFlightSearch();
  const [calendarOpen, setCalendarOpen] = useState<number | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const months = generateMonths();

  useEffect(() => {
    function handleClick(e: any) {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setCalendarOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div
      className={
        isResults
          ? "w-full rounded-lg border border-black bg-white px-3 py-2 shadow-none"
          : "mt-7 w-full rounded-[26px] border border-white/45 bg-white/20 px-4 py-4 shadow-xl backdrop-blur-md"
      }
    >
      {!isResults && (
        <div className="mb-2 flex flex-wrap items-center justify-start gap-3">
          <TripTypeTabs
            tripType={state.tripType}
            dispatch={dispatch}
            variant={variant}
          />
        </div>
      )}

      {/* ================= ONE WAY / ROUND ================= */}
      {state.tripType !== "multicity" && (
        <div
          className={
            isResults
              ? "flex items-stretch gap-4 mt-2 w-full"
              : // Mobile: stack karo, Desktop: ek line
                "flex flex-col md:flex-row md:items-center gap-3"
          }
        >
          {isResults && (
            <div className="flex items-stretch gap-4 shrink-0">
              <TripTypeTabs
                tripType={state.tripType}
                dispatch={dispatch}
                variant={variant}
              />
            </div>
          )}

          {/* AirportSelect — full width mobile pe */}
          <div className="w-full md:w-auto">
            <AirportSelect
              state={state}
              dispatch={dispatch}
              variant={variant}
            />
          </div>

          {/* Calendar — full width mobile pe */}
          <div className="w-full md:w-auto">
            <Calendar state={state} dispatch={dispatch} variant={variant} />
          </div>

          {/* TravelSelector — full width mobile pe */}
          <div className="w-full md:w-auto">
            <TravelSelector
              state={state}
              dispatch={dispatch}
              variant={variant}
            />
          </div>

          {isResults && (
            <div className="w-full md:w-[140px] shrink-0 md:ml-auto">
              <SearchButton state={state} variant={variant} />
            </div>
          )}
        </div>
      )}

      {/* ================= MULTI CITY ================= */}
      {state.tripType === "multicity" && (
        <div className={isResults ? "space-y-4" : "space-y-3"}>
          {state.segments.map((seg, i) => {
            return (
              <div
                key={i}
                className="flex flex-col md:flex-row gap-3 md:items-center"
              >
                <div className="w-full md:w-auto">
                  <AirportSelect
                    state={state}
                    dispatch={dispatch}
                    segmentIndex={i}
                    variant={variant}
                  />
                </div>

                {/* DATE */}
                <div className="relative w-full md:w-auto">
                  <div
                    onClick={() => setCalendarOpen(i)}
                    className={
                      isResults
                        ? "h-[75px] w-full md:w-56 border border-black rounded-xl px-4 bg-white/10 flex flex-col justify-center cursor-pointer"
                        : "h-[86px] w-full md:w-56 rounded-2xl border border-slate-700 bg-white/60 px-4 py-3 flex flex-col justify-center cursor-pointer"
                    }
                  >
                    <span
                      className={
                        isResults
                          ? "text-xs text-black"
                          : "text-[11px] font-bold text-slate-600"
                      }
                    >
                      Departure
                    </span>

                    <p
                      className={
                        isResults
                          ? "text-black font-semibold text-[16px]"
                          : "text-slate-950 font-extrabold text-lg"
                      }
                    >
                      {seg.departure
                        ? new Date(seg.departure).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                          })
                        : new Date().toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                          })}
                    </p>

                    <span
                      className={
                        isResults
                          ? "text-[10px] text-black"
                          : "text-[11px] text-slate-600"
                      }
                    >
                      {seg.departure
                        ? new Date(seg.departure).toLocaleDateString("en-GB", {
                            weekday: "long",
                          })
                        : new Date().toLocaleDateString("en-GB", {
                            weekday: "long",
                          })}
                    </span>
                  </div>

                  {calendarOpen === i && (
                    <div
                      ref={calendarRef}
                      className="absolute top-[80px] left-0 bg-white rounded-2xl shadow-2xl z-60 p-4 flex flex-col md:flex-row gap-4 md:gap-8 border border-black max-w-[95vw] overflow-x-auto"
                    >
                      {months.slice(0, 2).map((month, mIndex) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const minDate =
                          i === 0
                            ? today
                            : state.segments[i - 1]?.departure
                            ? new Date(state.segments[i - 1].departure)
                            : today;

                        return (
                          <div key={mIndex} className="w-[220px]">
                            <p className="text-sm font-semibold text-black mb-2">
                              {month.name}
                            </p>

                            <div className="grid grid-cols-7 gap-1">
                              {month.days.map((day, di) => {
                                if (!day) {
                                  return <div key={di} className="w-8 h-8" />;
                                }

                                const d = new Date(month.year, month.month, day);
                                d.setHours(0, 0, 0, 0);
                                const disabled = d < minDate;

                                return (
                                  <button
                                    key={di}
                                    disabled={disabled}
                                    onClick={() => {
                                      dispatch({
                                        type: "SET_SEGMENT_FIELD",
                                        index: i,
                                        field: "departure",
                                        value: d,
                                      });
                                      setCalendarOpen(null);
                                    }}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                                      disabled
                                        ? "text-black-300 cursor-not-allowed"
                                        : "text-black hover:bg-orange-500 hover:text-white"
                                    }`}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {i === 0 && (
                  <div className="w-full md:w-auto">
                    <TravelSelector
                      state={state}
                      dispatch={dispatch}
                      variant={variant}
                    />
                  </div>
                )}

                {state.segments.length > 1 && (
                  <button
                    onClick={() =>
                      dispatch({ type: "REMOVE_SEGMENT", index: i })
                    }
                    className={
                      isResults
                        ? "text-red-500"
                        : "rounded-full border border-red-300 bg-white/80 px-4 py-2 text-sm font-bold text-red-500"
                    }
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}

          {state.segments.length < 5 && (
            <button
              onClick={() => {
                const last = state.segments[state.segments.length - 1];
                if (!last.from || !last.to || !last.departure) {
                  alert("Please complete previous segment first");
                  return;
                }
                dispatch({ type: "ADD_SEGMENT" });
              }}
              className={
                isResults
                  ? "text-orange-500 font-medium"
                  : "rounded-full border border-orange-400 bg-white/80 px-5 py-2 text-sm font-bold text-orange-600"
              }
            >
              + Add City
            </button>
          )}
        </div>
      )}

      <div className={isResults ? "mt-2" : "mt-2"}>
        <FareTypeSelector fareType={state.fareType} dispatch={dispatch} />
      </div>

      {!isResults && (
        <div className="mt-1 flex justify-center">
          <div className="min-w-[150px]">
            <SearchButton state={state} variant={variant} />
          </div>
        </div>
      )}
    </div>
  );
}