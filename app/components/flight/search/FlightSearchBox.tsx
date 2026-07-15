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

type TripTypeValue = "oneway" | "roundtrip" | "multicity";

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

  const handleMobileTripTypeChange = (value: TripTypeValue) => {
    dispatch({
      type: "SET_TRIP_TYPE",
      payload: value,
    } as any);
  };

  const handleMobileFareTypeChange = (value: string) => {
    dispatch({
      type: "SET_FARE_TYPE",
      payload: value,
    } as any);
  };

  return (
    <div
      className={
        isResults
          ? "w-full rounded-lg border border-black bg-white px-3 py-2 shadow-none"
          : "mt-4 md:mt-7 w-full rounded-[24px] md:rounded-[26px] border border-white/45 bg-white/20 px-3 md:px-4 py-4 shadow-xl backdrop-blur-md"
      }
    >
      {!isResults && (
        <>
          {/* Desktop Trip Tabs — untouched */}
          <div className="mb-2 hidden md:flex flex-wrap items-center justify-start gap-3">
            <TripTypeTabs
              tripType={state.tripType}
              dispatch={dispatch}
              variant={variant}
            />
          </div>

          {/* Mobile Trip Dropdown */}
          <div className="mb-4 md:hidden">
            <label className="mb-1 block text-[11px] font-extrabold text-white">
              Trip Type
            </label>

            <select
              value={state.tripType}
              onChange={(e) =>
                handleMobileTripTypeChange(e.target.value as TripTypeValue)
              }
              className="h-11 w-full rounded-2xl border border-slate-700 bg-white/90 px-3 text-sm font-extrabold text-slate-900 outline-none"
            >
              <option value="oneway">One Way</option>
              <option value="roundtrip">Round Trip</option>
              <option value="multicity">Multi City</option>
            </select>
          </div>
        </>
      )}

      {/* ================= ONE WAY / ROUND ================= */}
      {state.tripType !== "multicity" && (
        <div
          className={
            isResults
              ? "flex items-stretch gap-4 mt-2 w-full"
              : "flex flex-col md:flex-row md:items-center gap-3"
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

          <div className="w-full md:w-auto">
            <AirportSelect
              state={state}
              dispatch={dispatch}
              variant={variant}
            />
          </div>

          <div className="w-full md:w-auto">
            <Calendar state={state} dispatch={dispatch} variant={variant} />
          </div>

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

                <div className="relative w-full md:w-auto">
                  <div
                    onClick={() => setCalendarOpen(i)}
                    className={
                      isResults
                        ? "h-[75px] w-full md:w-56 border border-black rounded-xl px-4 bg-white/10 flex flex-col justify-center cursor-pointer"
                        : "h-[76px] md:h-[86px] w-full md:w-56 rounded-2xl border border-slate-700 bg-white/60 px-4 py-3 flex flex-col justify-center cursor-pointer"
                    }
                  >
                    <span
                      className={
                        isResults
                          ? "text-xs text-black"
                          : "text-[10px] md:text-[11px] font-bold text-slate-600"
                      }
                    >
                      Departure
                    </span>

                    <p
                      className={
                        isResults
                          ? "text-black font-semibold text-[16px]"
                          : "text-slate-950 font-extrabold text-base md:text-lg"
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
                          : "text-[10px] md:text-[11px] text-slate-600"
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
                      className="absolute top-[84px] left-0 bg-white rounded-2xl shadow-2xl z-60 p-3 md:p-4 grid grid-cols-1 md:flex md:flex-row gap-4 md:gap-8 border border-black w-[calc(100vw-40px)] md:w-auto max-w-[95vw]"
                    >
                      {months.slice(0, 2).map((month, mIndex) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const minDate =
                          i === 0
                            ? today
                            : state.segments[i - 1]?.departure
                            ? new Date(state.segments[i - 1].departure ?? today)
                            : today;

                        return (
                          <div key={mIndex} className="w-full md:w-[220px]">
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
                  : "w-full md:w-auto rounded-full border border-orange-400 bg-white/80 px-5 py-2 text-sm font-bold text-orange-600"
              }
            >
              + Add City
            </button>
          )}
        </div>
      )}

      {/* Desktop Fare Type — untouched */}
      <div className={isResults ? "mt-2" : "mt-2 hidden md:block"}>
        <FareTypeSelector fareType={state.fareType} dispatch={dispatch} />
      </div>

      {/* Mobile Fare Type Dropdown */}
      {!isResults && (
        <div className="mt-3 md:hidden">
          <label className="mb-1 block text-[11px] font-extrabold text-white">
            Fare Type
          </label>

          <select
            value={state.fareType}
            onChange={(e) => handleMobileFareTypeChange(e.target.value)}
            className="h-11 w-full rounded-2xl border border-slate-700 bg-white/90 px-3 text-sm font-extrabold text-slate-900 outline-none"
          >
            <option value="Regular">Regular</option>
            <option value="Student">Student</option>
            <option value="Armed Forces">Armed Forces</option>
            <option value="Senior Citizen">Senior Citizen</option>
          </select>
        </div>
      )}

      {!isResults && (
        <div className="mt-4 md:mt-1 flex justify-center">
          <div className="w-full md:min-w-[150px] md:w-auto">
            <SearchButton state={state} variant={variant} />
          </div>
        </div>
      )}
    </div>
  );
}
