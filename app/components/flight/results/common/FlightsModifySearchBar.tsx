"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import TripTypeTabs from "../../search/TripTypeTabs";
import AirportSelect from "../../search/AirportSelect";
import Calendar from "../../search/Calendar";
import TravelSelector from "../../search/TravelSelector";
import SearchButton from "../../search/SearchButton";
import FareTypeSelector from "../../search/FareTypeSelector";
import { FlightState } from "../../hooks";

type FlightsModifySearchBarProps = {
  state: FlightState;
  dispatch: any;
  selectedDate?: Date;
  onExpandedChange?: (expanded: boolean) => void;
};

export default function FlightsModifySearchBar({
  state,
  dispatch,
  selectedDate,
  onExpandedChange,
}: FlightsModifySearchBarProps) {
  const [isMultiCityExpanded, setIsMultiCityExpanded] = useState(false);

  const isMultiCity = state.tripType === "multicity";

  useEffect(() => {
    if (!selectedDate) return;

    dispatch({
      type: "SET_SEGMENT_FIELD",
      index: 0,
      field: "departure",
      value: selectedDate,
    });
  }, [selectedDate, dispatch]);

  useEffect(() => {
    if (state.tripType === "multicity") {
      onExpandedChange?.(isMultiCityExpanded);
    } else {
      onExpandedChange?.(false);
    }
  }, [state.tripType, isMultiCityExpanded, onExpandedChange]);

  const multiCitySummary = useMemo(() => {
    if (!state.segments?.length) return "Select route";

    const filledSegments = state.segments.filter(
      (seg: any) => seg.from?.city && seg.to?.city
    );

    if (!filledSegments.length) return "Select route";

    const firstFrom = filledSegments[0]?.from?.city || "";
const lastTo = filledSegments[filledSegments.length - 1]?.to?.city || "";

    const viaCities = filledSegments
      .map((seg: any) => seg.to.city)
      .slice(0, -1);

    if (!viaCities.length) {
      return `${firstFrom} to ${lastTo}`;
    }

    return `${firstFrom} to ${lastTo} via ${viaCities.join(", ")}`;
  }, [state.segments]);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0b1220] px-4 py-4 shadow-[0_18px_45px_rgba(2,6,23,0.28)]">
      {!isMultiCity ? (
        <>
          <div className="flex w-full items-center gap-[6px]">
            <div className="shrink-0">
              <TripTypeTabs
                tripType={state.tripType}
                dispatch={dispatch}
                variant="results"
              />
            </div>

            <AirportSelect
              state={state}
              dispatch={dispatch}
              variant="results"
            />

            <Calendar
              state={state}
              dispatch={dispatch}
              variant="results"
            />

            <TravelSelector
              state={state}
              dispatch={dispatch}
              variant="results"
            />

            <div className="ml-auto w-[140px] shrink-0">
              <SearchButton state={state} variant="results" />
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <FareTypeSelector fareType={state.fareType} dispatch={dispatch} />
          </div>
        </>
      ) : (
        <>
          <div className="flex w-full items-center gap-[8px]">
            <div className="shrink-0">
              <TripTypeTabs
                tripType={state.tripType}
                dispatch={dispatch}
                variant="results"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsMultiCityExpanded((prev) => !prev)}
              className="flex h-[60px] flex-1 items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-4 text-left transition hover:bg-white/[0.1]"
            >
              <div className="min-w-0">
                <div className="text-[11px] font-black uppercase tracking-[0.14em] text-cyan-300">
                  Route
                </div>
                <div className="mt-1 truncate text-[16px] font-extrabold text-white">
                  {multiCitySummary}
                </div>
              </div>

              <Pencil className="ml-3 h-4 w-4 shrink-0 text-cyan-300" />
            </button>

            <TravelSelector
              state={state}
              dispatch={dispatch}
              variant="results"
            />

            <div className="w-[140px] shrink-0">
              <SearchButton
                state={state}
                variant="results"
                onSearchComplete={() => {
                  setIsMultiCityExpanded(false);
                }}
              />
            </div>
          </div>

          {isMultiCityExpanded && (
            <div className="mt-4 max-h-[60vh] space-y-3 overflow-visible rounded-xl border border-white/10 bg-white/[0.04] p-3">
              {state.segments.map((seg: any, index: number) => (
                <div key={index} className="flex items-center gap-[8px]">
                  <AirportSelect
                    state={state}
                    dispatch={dispatch}
                    segmentIndex={index}
                    variant="results"
                  />

                  <Calendar
                    state={state}
                    dispatch={dispatch}
                    segmentIndex={index}
                    variant="results"
                    multiCityMode
                  />

                  {state.segments.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({ type: "REMOVE_SEGMENT", index })
                      }
                      className="h-[40px] rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm font-bold text-white transition hover:bg-white/[0.1]"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              {state.segments.length < 5 && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "ADD_SEGMENT" })}
                  className="text-sm font-extrabold text-cyan-300"
                >
                  + Add City
                </button>
              )}
            </div>
          )}

          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <FareTypeSelector fareType={state.fareType} dispatch={dispatch} />
          </div>
        </>
      )}
    </div>
  );
}